_loadBefore(store) {
  const session = this.session;
  return function (topic_ids, storeInSession) {
    // refresh dupes
    this.topics.removeObjects(this.topics.filter(topic => topic_ids.includes(topic.id)));
    const url = `/latest.json?topic_ids=${topic_ids.join(",")}`;
    return ajax({
      url,
      data: this.params
    }).then(result => {
      const topicIds = new Set();
      this.topics.forEach(topic => topicIds.add(topic.id));
      let i = 0;
      TopicList.topicsFrom(store, result).forEach(topic => {
        if (!topicIds.has(topic.id)) {
          topic.set("highlight", true);
          this.topics.insertAt(i, topic);
          i++;
        }
      });
      if (storeInSession) {
        session.set("topicList", this);
      }
    });
  };
}

function (topic_ids, storeInSession) {
  // refresh dupes
  this.topics.removeObjects(this.topics.filter(topic => topic_ids.includes(topic.id)));
  const url = `/latest.json?topic_ids=${topic_ids.join(",")}`;
  return ajax({
    url,
    data: this.params
  }).then(result => {
    const topicIds = new Set();
    this.topics.forEach(topic => topicIds.add(topic.id));
    let i = 0;
    TopicList.topicsFrom(store, result).forEach(topic => {
      if (!topicIds.has(topic.id)) {
        topic.set("highlight", true);
        this.topics.insertAt(i, topic);
        i++;
      }
    });
    if (storeInSession) {
      session.set("topicList", this);
    }
  });
}

async _findCategoriesAndTopics(filter, parentCategory = null) {
  return hash({
    categoriesList: PreloadStore.getAndRemove("categories_list"),
    topicsList: PreloadStore.getAndRemove("topic_list")
  }).then(result => {
    if (result.categoriesList?.category_list && result.topicsList?.topic_list) {
      return {
        ...result.categoriesList,
        ...result.topicsList
      };
    } else {
      // Otherwise, return the ajax result
      const data = {};
      if (parentCategory) {
        data.parent_category_id = parentCategory.id;
      }
      return ajax(`/categories_and_${filter}`, {
        data
      });
    }
  }).then(result => {
    if (result.topic_list?.top_tags) {
      this.site.set("top_tags", result.topic_list.top_tags);
    }
    return CategoryList.create({
      store: this.store,
      categories: CategoryList.categoriesFrom(this.store, result, parentCategory),
      parentCategory,
      topics: TopicList.topicsFrom(this.store, result),
      can_create_category: result.category_list.can_create_category,
      can_create_topic: result.category_list.can_create_topic,
      loadBefore: this._loadBefore(this.store)
    });
  });
}

result => {
  if (result.categoriesList?.category_list && result.topicsList?.topic_list) {
    return {
      ...result.categoriesList,
      ...result.topicsList
    };
  } else {
    // Otherwise, return the ajax result
    const data = {};
    if (parentCategory) {
      data.parent_category_id = parentCategory.id;
    }
    return ajax(`/categories_and_${filter}`, {
      data
    });
  }
}