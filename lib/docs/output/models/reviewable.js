update(updates) {
  // If no changes, do nothing
  if (Object.keys(updates).length === 0) {
    return Promise.resolve();
  }
  let adapter = this.store.adapterFor("reviewable");
  return ajax(`/review/${this.id}?version=${this.version}`, adapter.getPayload("PUT", {
    reviewable: updates
  })).then(updated => {
    updated.payload = Object.assign({}, this.payload || {}, updated.payload || {});
    this.setProperties(updated);
  });
}