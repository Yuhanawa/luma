_loadMoreBookmarks(searchQuery) {
  if (!this.model.loadMoreUrl) {
    return Promise.resolve();
  }
  let moreUrl = this.model.loadMoreUrl;
  if (searchQuery) {
    const delimiter = moreUrl.includes("?") ? "&" : "?";
    const q = encodeURIComponent(searchQuery);
    moreUrl += `${delimiter}q=${q}`;
  }
  return ajax({
    url: moreUrl
  });
}