@bind
async pingServerAndSetConnectivity() {
  try {
    let response = await ajax("/srv/status", {
      dataType: "text"
    });
    if (response === "ok") {
      cancel(this._timer);
      this.setConnectivity(true);
    } else {
      throw "disconnected";
    }
  } catch {
    // Either the request didn't go out at all or the response wasn't "ok". Both are failures.
    // Start the timer to check every second if `navigator.onLine` comes back online in the event that
    // we miss the `online` event firing
    this.startTimerToCheckNavigator();
  }
}