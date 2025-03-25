loadMore() {
  if (this.loadingMore) {
    return Promise.resolve();
  }
  let moreUrl = this.more_topics_url;
  if (moreUrl) {
    let [url, params] = moreUrl.split("?");

    // ensure we postfix with .json so username paths work
    // correctly
    if (!url.match(/\.json$/)) {
      url += ".json";
    }
    moreUrl = url;
    if (params) {
      moreUrl += "?" + params;
    }
    this.set("loadingMore", true);
    return ajax({
      url: moreUrl
    }).then(async result => {
      let topicsAdded = 0;
      if (result) {
        // the new topics loaded from the server
        const newTopics = TopicList.topicsFrom(this.store, result);
        await Topic.applyTransformations(newTopics);
        this.forEachNew(newTopics, t => {
          t.set("highlight", topicsAdded++ === 0);
          this.topics.pushObject(t);
        });
        this.setProperties({
          loadingMore: false,
          more_topics_url: result.topic_list.more_topics_url
        });
        this.session.set("topicList", this);
        return {
          moreTopicsUrl: this.more_topics_url,
          newTopics
        };
      }
    });
  } else {
    // Return a promise indicating no more results
    return Promise.resolve();
  }
}

// loads topics with these ids "before" the current topics

// loads topics with these ids "before" the current topics
async loadBefore(topic_ids, storeInSession) {
  this.loadingBefore = topic_ids.length;
  try {
    const url = `/${this.filter}.json?topic_ids=${topic_ids.join(",")}`;
    const result = await ajax({
      url,
      data: this.params
    });

    // refresh dupes
    this.topics.removeObjects(this.topics.filter(topic => topic_ids.includes(topic.id)));
    let i = 0;
    this.forEachNew(TopicList.topicsFrom(this.store, result), t => {
      // highlight the first of the new topics so we can get a visual feedback
      t.set("highlight", true);
      this.topics.insertAt(i, t);
      i++;
    });
    if (storeInSession) {
      this.session.set("topicList", this);
    }
  } finally {
    this.loadingBefore = false;
  }
}