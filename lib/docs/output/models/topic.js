function loadTopicView(topic, args) {
  const data = deepMerge({}, args);
  const url = `/t/${topic.id}`;
  const jsonUrl = (data.nearPost ? `${url}/${data.nearPost}` : url) + ".json";
  delete data.nearPost;
  delete data.__type;
  delete data.store;
  return PreloadStore.getAndRemove(`topic_${topic.id}`, () => ajax(jsonUrl, {
    data
  })).then(async json => {
    json.categories?.forEach(c => topic.site.updateCategory(c));
    topic.updateFromJson(json);
    await Topic.applyTransformations([topic]);
    return json;
  });
}

static update(topic, props, opts = {}) {
  // We support `category_id` and `categoryId` for compatibility
  if (typeof props.categoryId !== "undefined") {
    props.category_id = props.categoryId;
    delete props.categoryId;
  }

  // Make sure we never change the category for private messages
  if (topic.get("isPrivateMessage")) {
    delete props.category_id;
  }
  const data = {
    ...props
  };
  if (opts.fastEdit) {
    data.keep_existing_draft = true;
  }
  return ajax(topic.get("url"), {
    type: "PUT",
    data: JSON.stringify(data),
    contentType: "application/json"
  }).then(result => {
    // The title can be cleaned up server side
    props.title = result.basic_topic.title;
    props.fancy_title = result.basic_topic.fancy_title;
    if (topic.is_shared_draft) {
      props.destination_category_id = props.category_id;
      delete props.category_id;
    }
    topic.setProperties(props);
  });
}

// Load a topic, but accepts a set of filters
static find(topicId, opts) {
  let url = getURL("/t/") + topicId;
  if (opts.nearPost) {
    url += `/${opts.nearPost}`;
  }
  const data = {};
  if (opts.postsAfter) {
    data.posts_after = opts.postsAfter;
  }
  if (opts.postsBefore) {
    data.posts_before = opts.postsBefore;
  }
  if (opts.trackVisit) {
    data.track_visit = true;
  }

  // Add username filters if we have them
  if (opts.userFilters && opts.userFilters.length > 0) {
    data.username_filters = [];
    opts.userFilters.forEach(function (username) {
      data.username_filters.push(username);
    });
  }

  // Add the summary of filter if we have it
  if (opts.summary === true) {
    data.summary = true;
  }

  // Check the preload store. If not, load it via JSON
  return ajax(`${url}.json`, {
    data
  });
}

static changeOwners(topicId, opts) {
  const promise = ajax(`/t/${topicId}/change-owner`, {
    type: "POST",
    data: opts
  }).then(result => {
    if (result.success) {
      return result;
    }
    promise.reject(new Error("error changing ownership of posts"));
  });
  return promise;
}

static changeTimestamp(topicId, timestamp) {
  const promise = ajax(`/t/${topicId}/change-timestamp`, {
    type: "PUT",
    data: {
      timestamp
    }
  }).then(result => {
    if (result.success) {
      return result;
    }
    promise.reject(new Error("error updating timestamp of topic"));
  });
  return promise;
}

static bulkOperation(topics, operation, options, tracked) {
  const data = {
    topic_ids: topics.mapBy("id"),
    operation,
    tracked
  };
  if (options) {
    if (options.silent) {
      data.silent = true;
    }
  }
  return ajax("/topics/bulk", {
    type: "PUT",
    data
  });
}

static bulkOperationByFilter(filter, operation, options, tracked) {
  const data = {
    filter,
    operation,
    tracked
  };
  if (options) {
    if (options.categoryId) {
      data.category_id = options.categoryId;
    }
    if (options.includeSubcategories) {
      data.include_subcategories = true;
    }
    if (options.tagName) {
      data.tag_name = options.tagName;
    }
    if (options.private_message_inbox) {
      data.private_message_inbox = options.private_message_inbox;
      if (options.group_name) {
        data.group_name = options.group_name;
      }
    }
  }
  return ajax("/topics/bulk", {
    type: "PUT",
    data
  });
}

static resetNew(category, include_subcategories, opts = {}) {
  let {
    tracked,
    tag,
    topicIds
  } = {
    tracked: false,
    tag: null,
    topicIds: null,
    ...opts
  };
  const data = {
    tracked
  };
  if (category) {
    data.category_id = category.id;
    data.include_subcategories = include_subcategories;
  }
  if (tag) {
    data.tag_id = tag.id;
  }
  if (topicIds) {
    data.topic_ids = topicIds;
  }
  if (opts.dismissPosts) {
    data.dismiss_posts = opts.dismissPosts;
  }
  if (opts.dismissTopics) {
    data.dismiss_topics = opts.dismissTopics;
  }
  if (opts.untrack) {
    data.untrack = opts.untrack;
  }
  return ajax("/topics/reset-new", {
    type: "PUT",
    data
  });
}

static pmResetNew(opts = {}) {
  const data = {};
  if (opts.topicIds) {
    data.topic_ids = opts.topicIds;
  }
  if (opts.inbox) {
    data.inbox = opts.inbox;
    if (opts.groupName) {
      data.group_name = opts.groupName;
    }
  }
  return ajax("/topics/pm-reset-new", {
    type: "PUT",
    data
  });
}

static idForSlug(slug) {
  return ajax(`/t/id_for/${slug}`);
}

static setSlowMode(topicId, seconds, enabledUntil) {
  const data = {
    seconds
  };
  data.enabled_until = enabledUntil;
  return ajax(`/t/${topicId}/slow_mode`, {
    type: "PUT",
    data
  });
}

saveStatus(property, value, until) {
  if (property === "closed") {
    this.incrementProperty("posts_count");
  }
  return ajax(`${this.url}/status`, {
    type: "PUT",
    data: {
      status: property,
      enabled: !!value,
      until
    }
  });
}

makeBanner() {
  return ajax(`/t/${this.id}/make-banner`, {
    type: "PUT"
  }).then(() => this.set("archetype", "banner"));
}

removeBanner() {
  return ajax(`/t/${this.id}/remove-banner`, {
    type: "PUT"
  }).then(() => this.set("archetype", "regular"));
}

deleteBookmarks() {
  return ajax(`/t/${this.id}/remove_bookmarks`, {
    type: "PUT"
  });
}

createGroupInvite(group) {
  return ajax(`/t/${this.id}/invite-group`, {
    type: "POST",
    data: {
      group
    }
  });
}

createInvite(user, group_ids, custom_message) {
  return ajax(`/t/${this.id}/invite`, {
    type: "POST",
    data: {
      user,
      group_ids,
      custom_message
    }
  });
}

generateInviteLink(email, group_ids, topic_id) {
  return ajax("/invites", {
    type: "POST",
    data: {
      email,
      skip_email: true,
      group_ids,
      topic_id
    }
  });
}

// Delete this topic

// Delete this topic
destroy(deleted_by, opts = {}) {
  return ajax(`/t/${this.id}`, {
    data: {
      context: window.location.pathname,
      ...opts
    },
    type: "DELETE"
  }).then(() => {
    this.setProperties({
      deleted_at: new Date(),
      deleted_by,
      "details.can_delete": false,
      "details.can_recover": true,
      "details.can_permanently_delete": this.siteSettings.can_permanently_delete && deleted_by.admin
    });
    if (opts.force_destroy || !deleted_by.staff && !deleted_by.groups.some(group => this.category?.moderating_group_ids?.includes(group.id)) && !deleted_by.can_delete_all_posts_and_topics) {
      DiscourseURL.redirectTo("/");
    }
  }).catch(popupAjaxError);
}

// Recover this topic if deleted

// Recover this topic if deleted
recover() {
  this.setProperties({
    deleted_at: null,
    deleted_by: null,
    "details.can_delete": true,
    "details.can_recover": false
  });
  return ajax(`/t/${this.id}/recover`, {
    data: {
      context: window.location.pathname
    },
    type: "PUT"
  });
}

// Update our attributes from a JSON result

reload() {
  return ajax(`/t/${this.id}`, {
    type: "GET"
  }).then(topic_json => this.updateFromJson(topic_json));
}

clearPin() {
  // Clear the pin optimistically from the object
  this.setProperties({
    pinned: false,
    unpinned: true
  });
  ajax(`/t/${this.id}/clear-pin`, {
    type: "PUT"
  }).then(null, () => {
    // On error, put the pin back
    this.setProperties({
      pinned: true,
      unpinned: false
    });
  });
}

rePin() {
  // Clear the pin optimistically from the object
  this.setProperties({
    pinned: true,
    unpinned: false
  });
  ajax(`/t/${this.id}/re-pin`, {
    type: "PUT"
  }).then(null, () => {
    // On error, put the pin back
    this.setProperties({
      pinned: true,
      unpinned: false
    });
  });
}

archiveMessage() {
  this.set("archiving", true);
  const promise = ajax(`/t/${this.id}/archive-message`, {
    type: "PUT"
  });
  promise.then(msg => {
    this.set("message_archived", true);
    if (msg && msg.group_name) {
      this.set("inboxGroupName", msg.group_name);
    }
  }).finally(() => this.set("archiving", false));
  return promise;
}

moveToInbox() {
  this.set("archiving", true);
  const promise = ajax(`/t/${this.id}/move-to-inbox`, {
    type: "PUT"
  });
  promise.then(msg => {
    this.set("message_archived", false);
    if (msg && msg.group_name) {
      this.set("inboxGroupName", msg.group_name);
    }
  }).finally(() => this.set("archiving", false));
  return promise;
}

publish() {
  return ajax(`/t/${this.id}/publish`, {
    type: "PUT",
    data: this.getProperties("destination_category_id")
  }).then(() => this.set("destination_category_id", null)).catch(popupAjaxError);
}

updateDestinationCategory(categoryId) {
  this.set("destination_category_id", categoryId);
  return ajax(`/t/${this.id}/shared-draft`, {
    type: "PUT",
    data: {
      category_id: categoryId
    }
  });
}

convertTopic(type, opts) {
  let args = {
    type: "PUT"
  };
  if (opts && opts.categoryId) {
    args.data = {
      category_id: opts.categoryId
    };
  }
  return ajax(`/t/${this.id}/convert-topic/${type}`, args);
}

resetBumpDate() {
  return ajax(`/t/${this.id}/reset-bump-date`, {
    type: "PUT"
  }).catch(popupAjaxError);
}

updateTags(tags) {
  if (!tags || tags.length === 0) {
    tags = [""];
  }
  return ajax(`/t/${this.id}/tags`, {
    type: "PUT",
    data: {
      tags
    }
  });
}

function movePosts(topicId, data) {
  return ajax(`/t/${topicId}/move-posts`, {
    type: "POST",
    data
  }).then(moveResult);
}

function mergeTopic(topicId, data) {
  return ajax(`/t/${topicId}/merge-topic`, {
    type: "POST",
    data
  }).then(moveResult);
}