goToFirstSuggestedTopic() {
  const el = document.querySelector("#suggested-topics a.raw-topic-link");
  if (el) {
    el.click();
  } else {
    const controller = getOwner(this).lookup("controller:topic");
    // Only the last page contains list of suggested topics.
    const url = `/t/${controller.get("model.id")}/last.json`;
    ajax(url).then(result => {
      if (result.suggested_topics && result.suggested_topics.length > 0) {
        const topic = controller.store.createRecord("topic", result.suggested_topics[0]);
        DiscourseURL.routeTo(topic.get("url"));
      }
    });
  }
}