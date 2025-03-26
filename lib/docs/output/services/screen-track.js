async sendNextConsolidatedTiming() {
  if (this._consolidatedTimings.length === 0) {
    return;
  }
  if (this._inProgress) {
    return;
  }
  if (this._blockSendingToServerTill && this._blockSendingToServerTill > Date.now()) {
    return;
  }
  const {
    timings,
    topicTime,
    topicId
  } = this._consolidatedTimings.pop();
  const data = {
    timings,
    topic_time: topicTime,
    topic_id: topicId
  };
  this._inProgress = true;
  try {
    await ajax("/topics/timings", {
      data,
      type: "POST",
      headers: {
        "X-SILENCE-LOGGER": "true",
        "Discourse-Background": "true"
      }
    });
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    this._ajaxFailures = 0;
    if (this._topicController) {
      const postNumbers = Object.keys(timings).map(v => parseInt(v, 10));
      this._topicController.readPosts(topicId, postNumbers);
      const cachedHighestRead = this.highestReadFromCache(topicId);
      if (cachedHighestRead && cachedHighestRead <= postNumbers.lastObject) {
        resetHighestReadCache(topicId);
      }
    }
    this.appEvents.trigger("topic:timings-sent", data);
  } catch (e) {
    if (e.jqXHR && ALLOWED_AJAX_FAILURES.includes(e.jqXHR.status)) {
      const delay = AJAX_FAILURE_DELAYS[this._ajaxFailures];
      this._ajaxFailures += 1;
      if (delay) {
        this._blockSendingToServerTill = Date.now() + delay;
        // we did not send to the server, got to re-queue it
        this.consolidateTimings(timings, topicTime, topicId);
      }
    }
    if (window.console && window.console.warn && e.jqXHR) {
      window.console.warn(`Failed to update topic times for topic ${topicId} due to ${e.jqXHR.status} error`);
    }
  } finally {
    this._inProgress = false;
    this._lastFlush = 0;
  }
}