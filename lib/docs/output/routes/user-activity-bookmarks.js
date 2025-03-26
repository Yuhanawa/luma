_loadBookmarks(params) {
  let url = `/u/${this.modelFor("user").username}/bookmarks.json`;
  if (params) {
    url += "?" + $.param(params);
  }
  return ajax(url);
}