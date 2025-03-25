static list() {
  return ajax("/associated_groups").then(result => {
    return result.associated_groups.map(ag => AssociatedGroup.create(ag));
  }).catch(popupAjaxError);
}