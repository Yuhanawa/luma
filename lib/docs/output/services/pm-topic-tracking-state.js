_loadInitialState() {
  return ajax(`/u/${this.currentUser.username}/private-message-topic-tracking-state`).then(pmTopicTrackingStateData => {
    pmTopicTrackingStateData.forEach(topic => {
      this._modifyState(topic.topic_id, topic, {
        skipIncrement: true
      });
    });
  }).catch(popupAjaxError);
}