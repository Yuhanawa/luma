async _makeInitialDataRequest() {
  if (this._initialDataAjax) {
    // try again next runloop
    next(this, () => once(this, this._makeInitialDataRequest));
    return;
  }
  if (Object.keys(this._initialDataRequests).length === 0) {
    // Nothing to request
    return;
  }
  this._initialDataAjax = ajax("/presence/get", {
    data: {
      channels: Object.keys(this._initialDataRequests).slice(0, 50)
    }
  });
  let result;
  try {
    result = await this._initialDataAjax;
  } catch (e) {
    discourseLater(this, this._makeInitialDataRequest, PRESENCE_GET_RETRY_MS);
    throw e;
  } finally {
    this._initialDataAjax = null;
  }
  for (const channel in result) {
    if (!result.hasOwnProperty(channel)) {
      continue;
    }
    const state = result[channel];
    if (state) {
      this._initialDataRequests[channel].resolve(state);
    } else {
      const error = new PresenceChannelNotFound(`PresenceChannel '${channel}' not found`);
      this._initialDataRequests[channel].reject(error);
    }
    delete this._initialDataRequests[channel];
  }
}

async _updateServer() {
  if (this.isDestroying || this.isDestroyed) {
    return;
  }
  this._lastUpdate = new Date();
  this._updateRunning = true;
  this._cancelTimer();
  this._dedupQueue();
  const queue = this._queuedEvents;
  this._queuedEvents = [];
  try {
    const presentChannels = [];
    const presentButInactiveChannels = new Set();
    const channelsToLeave = queue.filter(e => e.type === "leave").map(e => e.channel);
    for (const [channelName, proxies] of this._presentProxies) {
      if (Array.from(proxies).some(p => {
        return !p.activeOptions || userPresent(p.activeOptions);
      })) {
        presentChannels.push(channelName);
      } else {
        presentButInactiveChannels.add(channelName);
        if (!this._previousPresentButInactiveChannels.has(channelName)) {
          channelsToLeave.push(channelName);
        }
      }
    }
    this._previousPresentButInactiveChannels = presentButInactiveChannels;
    if (queue.length === 0 && presentChannels.length === 0 && channelsToLeave.length === 0) {
      return;
    }
    const response = await ajax("/presence/update", {
      data: {
        client_id: this.messageBus.clientId,
        present_channels: presentChannels,
        leave_channels: channelsToLeave
      },
      type: "POST"
    });
    queue.forEach(e => {
      if (response[e.channel] === false) {
        e.promiseProxy.reject(new PresenceChannelNotFound(`PresenceChannel '${e.channel}' not found`));
      } else {
        e.promiseProxy.resolve();
      }
    });
    this._presenceDebounceMs = DEFAULT_PRESENCE_DEBOUNCE_MS;
  } catch (e) {
    // Put the failed events back in the queue for next time
    this._queuedEvents.unshift(...queue);
    if (e.jqXHR?.status === 429) {
      // Rate limited
      const waitSeconds = e.jqXHR.responseJSON?.extras?.wait_seconds || 10;
      this._presenceDebounceMs = waitSeconds * 1000;
    } else {
      // Other error, exponential backoff capped at 30 seconds
      this._presenceDebounceMs = Math.min(this._presenceDebounceMs * 2, PRESENCE_INTERVAL_S * 1000);
      throw e;
    }
  } finally {
    this._updateRunning = false;
    this._scheduleNextUpdate();
  }
}

// `throttle` only allows triggering on the first **or** the last event
// in a sequence of calls. We want both. We want the first event, to make
// things very responsive. Then if things are happening too frequently, we
// drop back to the last event via the regular throttle function.