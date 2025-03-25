static bulkOperation(bookmarks, operation) {
  const data = {
    bookmark_ids: bookmarks.mapBy("id"),
    operation
  };
  return ajax("/bookmarks/bulk", {
    type: "PUT",
    data
  });
}

destroy() {
  if (this.newBookmark) {
    return Promise.resolve();
  }
  return ajax(this.url, {
    type: "DELETE"
  });
}

togglePin() {
  if (this.newBookmark) {
    return Promise.resolve();
  }
  return ajax(this.url + "/toggle_pin", {
    type: "PUT"
  });
}