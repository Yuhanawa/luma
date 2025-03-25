fetchConfirmationValue() {
  if (this._challengeDate === undefined && this._hpPromise) {
    // Request already in progress
    return this._hpPromise;
  }
  this._hpPromise = ajax("/session/hp.json").then(json => {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    this._challengeDate = new Date();
    // remove 30 seconds for jitter, make sure this works for at least
    // 30 seconds so we don't have hard loops
    this._challengeExpiry = parseInt(json.expires_in, 10) - 30;
    if (this._challengeExpiry < 30) {
      this._challengeExpiry = 30;
    }
    this.setProperties({
      accountHoneypot: json.value,
      accountChallenge: json.challenge.split("").reverse().join("")
    });
  }).finally(() => this._hpPromise = undefined);
  return this._hpPromise;
}