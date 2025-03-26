create(bookmarkFormData) {
  return ajax("/bookmarks.json", {
    method: "POST",
    data: bookmarkFormData.saveData
  }).then(response => {
    bookmarkFormData.id = response.id;
    return bookmarkFormData;
  }).catch(popupAjaxError);
}

delete(bookmarkId) {
  return ajax(`/bookmarks/${bookmarkId}.json`, {
    method: "DELETE"
  }).catch(popupAjaxError);
}

update(bookmarkFormData) {
  return ajax(`/bookmarks/${bookmarkFormData.id}.json`, {
    method: "PUT",
    data: bookmarkFormData.saveData
  }).catch(popupAjaxError);
}