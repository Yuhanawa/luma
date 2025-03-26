model() {
  const username = this.modelFor("user").get("username_lower");
  return ajax(`/tags/personal_messages/${username}`).then(result => {
    return result.tags.map(tag => EmberObject.create(tag));
  }).catch(popupAjaxError);
}