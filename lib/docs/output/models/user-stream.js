findItems() {
  if (!this.canLoadMore) {
    // Don't load the same stream twice. We're probably at the end.
    return Promise.resolve();
  }
  const findUrl = this.nextFindUrl;
  if (this.loading) {
    return Promise.resolve();
  }
  this.set("loading", true);
  return ajax(findUrl).then(result => {
    if (result && result.user_actions) {
      const copy = A();
      result.categories?.forEach(category => {
        Site.current().updateCategory(category);
      });
      result.user_actions?.forEach(action => {
        action.titleHtml = replaceEmoji(action.title);
        copy.pushObject(UserAction.create(action));
      });
      this.content.pushObjects(UserAction.collapseStream(copy));
      this.setProperties({
        itemsLoaded: this.itemsLoaded + result.user_actions.length
      });
    }
  }).finally(() => this.setProperties({
    loaded: true,
    loading: false,
    lastLoadedUrl: findUrl
  }));
}