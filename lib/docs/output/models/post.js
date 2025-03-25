static updateBookmark(postId, bookmarked) {
  return ajax(`/posts/${postId}/bookmark`, {
    type: "PUT",
    data: {
      bookmarked
    }
  });
}

static destroyBookmark(postId) {
  return ajax(`/posts/${postId}/bookmark`, {
    type: "DELETE"
  });
}

static deleteMany(post_ids, {
  agreeWithFirstReplyFlag = true
} = {}) {
  return ajax("/posts/destroy_many", {
    type: "DELETE",
    data: {
      post_ids,
      agree_with_first_reply_flag: agreeWithFirstReplyFlag
    }
  });
}

static mergePosts(post_ids) {
  return ajax("/posts/merge_posts", {
    type: "PUT",
    data: {
      post_ids
    }
  }).catch(popupAjaxError);
}

static loadRevision(postId, version) {
  return ajax(`/posts/${postId}/revisions/${version}.json`).then(result => {
    result.categories?.forEach(c => Site.current().updateCategory(c));
    return EmberObject.create(result);
  });
}

static hideRevision(postId, version) {
  return ajax(`/posts/${postId}/revisions/${version}/hide`, {
    type: "PUT"
  });
}

static permanentlyDeleteRevisions(postId) {
  return ajax(`/posts/${postId}/revisions/permanently_delete`, {
    type: "DELETE"
  });
}

static showRevision(postId, version) {
  return ajax(`/posts/${postId}/revisions/${version}/show`, {
    type: "PUT"
  });
}

static loadRawEmail(postId) {
  return ajax(`/posts/${postId}/raw-email.json`);
}

updatePostField(field, value) {
  const data = {};
  data[field] = value;
  return ajax(`/posts/${this.id}/${field}`, {
    type: "PUT",
    data
  }).then(response => {
    this.set(field, value);
    return response;
  }).catch(popupAjaxError);
}

// Expands the first post's content, if embedded and shortened.
expand() {
  return ajax(`/posts/${this.id}/expand-embed`).then(post => {
    this.set("cooked", `<section class="expanded-embed">${post.cooked}</section>`);
  });
}

// Recover a deleted post

// Recover a deleted post
recover() {
  const initProperties = this.getProperties("deleted_at", "deleted_by", "user_deleted", "can_delete");
  this.setProperties({
    deleted_at: null,
    deleted_by: null,
    user_deleted: false,
    can_delete: false
  });
  return ajax(`/posts/${this.id}/recover`, {
    type: "PUT"
  }).then(data => {
    this.setProperties({
      cooked: data.cooked,
      raw: data.raw,
      user_deleted: false,
      can_delete: true,
      version: data.version
    });
  }).catch(error => {
    popupAjaxError(error);
    this.setProperties(initProperties);
  });
}

/**
 Changes the state of the post to be deleted. Does not call the server, that should be
 done elsewhere.
 **/

destroy(deletedBy, opts) {
  return this.setDeletedState(deletedBy).then(() => {
    return ajax("/posts/" + this.id, {
      data: {
        context: window.location.pathname,
        ...opts
      },
      type: "DELETE"
    });
  });
}

/**
 * Updates a post from another's attributes. This will normally happen when a post is loading but
 * is already found in an identity map.
 **/

() => {
  return ajax("/posts/" + this.id, {
    data: {
      context: window.location.pathname,
      ...opts
    },
    type: "DELETE"
  });
}

expandHidden() {
  return ajax(`/posts/${this.id}/cooked.json`).then(result => {
    this.setProperties({
      cooked: result.cooked,
      cooked_hidden: false
    });
  });
}

rebake() {
  return ajax(`/posts/${this.id}/rebake`, {
    type: "PUT"
  }).catch(popupAjaxError);
}

unhide() {
  return ajax(`/posts/${this.id}/unhide`, {
    type: "PUT"
  });
}

revertToRevision(version) {
  return ajax(`/posts/${this.id}/revisions/${version}/revert`, {
    type: "PUT"
  });
}