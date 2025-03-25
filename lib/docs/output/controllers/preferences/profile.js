@action
clearFeaturedTopicFromProfile() {
  this.dialog.yesNoConfirm({
    message: i18n("user.feature_topic_on_profile.clear.warning"),
    didConfirm: () => {
      return ajax(`/u/${this.model.username}/clear-featured-topic`, {
        type: "PUT"
      }).then(() => {
        this.model.set("featured_topic", null);
      }).catch(popupAjaxError);
    }
  });
}

() => {
  return ajax(`/u/${this.model.username}/clear-featured-topic`, {
    type: "PUT"
  }).then(() => {
    this.model.set("featured_topic", null);
  }).catch(popupAjaxError);
}