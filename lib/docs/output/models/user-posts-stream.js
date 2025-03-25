findItems() {
  if (this.loading || !this.canLoadMore) {
    return Promise.reject();
  }
  this.set("loading", true);
  return ajax(this.url).then(result => {
    if (result) {
      const posts = result.map(post => UserAction.create(post));
      this.content.pushObjects(posts);
      this.setProperties({
        loaded: true,
        itemsLoaded: this.itemsLoaded + posts.length,
        canLoadMore: posts.length > 0
      });
    }
  }).finally(() => this.set("loading", false));
}