loadPostByPostNumber(postNumber) {
  const url = `/posts/by_number/${this.get("topic.id")}/${postNumber}`;
  const store = this.store;
  return ajax(url).then(post => {
    return this.storePost(store.createRecord("post", post));
  });
}

loadNearestPostToDate(date) {
  const url = `/posts/by-date/${this.get("topic.id")}/${date}`;
  const store = this.store;
  return ajax(url).then(post => {
    return this.storePost(store.createRecord("post", post));
  });
}

loadPost(postId) {
  const url = "/posts/" + postId;
  const store = this.store;
  const existing = this._identityMap[postId];
  return ajax(url).then(p => {
    if (existing) {
      p.cooked = existing.cooked;
    }
    return this.storePost(store.createRecord("post", p));
  });
}

/* mainly for backwards compatibility with plugins, used in quick messages plugin
 * TODO: remove July 2022
 * */

triggerRecoveredPost(postId) {
  const existing = this._identityMap[postId];
  if (existing) {
    return this.triggerChangedPost(postId, new Date());
  } else {
    // need to insert into stream
    const url = `/posts/${postId}`;
    const store = this.store;
    return ajax(url).then(p => {
      const post = store.createRecord("post", p);
      const stream = this.stream;
      const posts = this.posts;
      this.storePost(post);

      // we need to zip this into the stream
      let index = 0;
      stream.forEach(pid => {
        if (pid < p.id) {
          index += 1;
        }
      });
      stream.insertAt(index, p.id);
      index = 0;
      posts.forEach(_post => {
        if (_post.id < p.id) {
          index += 1;
        }
      });
      if (index < posts.length) {
        this.postsWithPlaceholders.refreshAll(() => {
          posts.insertAt(index, post);
        });
      } else {
        if (post.post_number < posts[posts.length - 1].post_number + 5) {
          this.appendMore();
        }
      }
    });
  }
}

triggerDeletedPost(postId) {
  const existing = this._identityMap[postId];
  if (existing && !existing.deleted_at) {
    const url = "/posts/" + postId;
    const store = this.store;
    return ajax(url).then(p => {
      this.storePost(store.createRecord("post", p));
    }).catch(() => {
      this.removePosts([existing]);
    });
  }
  return Promise.resolve();
}

triggerChangedPost(postId, updatedAt, opts) {
  opts = opts || {};
  const resolved = Promise.resolve();
  if (!postId) {
    return resolved;
  }
  const existing = this._identityMap[postId];
  if (existing && existing.updated_at !== updatedAt) {
    const url = "/posts/" + postId;
    const store = this.store;
    return ajax(url).then(p => {
      if (opts.preserveCooked) {
        p.cooked = existing.get("cooked");
      }
      this.storePost(store.createRecord("post", p));
    });
  }
  return resolved;
}

fetchNextWindow(postNumber, asc, callback) {
  let includeSuggested = !this.get("topic.suggested_topics");
  const url = `/t/${this.get("topic.id")}/posts.json`;
  let data = {
    post_number: postNumber,
    asc,
    include_suggested: includeSuggested
  };
  data = deepMerge(data, this.streamFilters);
  const store = this.store;
  return ajax(url, {
    data
  }).then(result => {
    this._setSuggestedTopics(result);
    const posts = get(result, "post_stream.posts");
    if (posts) {
      posts.forEach(p => {
        p = this.storePost(store.createRecord("post", p));
        if (callback) {
          callback.call(this, p);
        }
      });
    }
  });
}

loadIntoIdentityMap(postIds, opts) {
  if (isEmpty(postIds)) {
    return Promise.resolve([]);
  }
  let includeSuggested = !this.get("topic.suggested_topics");
  const url = "/t/" + this.get("topic.id") + "/posts.json";
  const data = {
    post_ids: postIds,
    include_suggested: includeSuggested
  };
  const store = this.store;
  let headers = {};
  if (opts && opts.background) {
    headers["Discourse-Background"] = "true";
  }
  return ajax(url, {
    data,
    headers
  }).then(result => {
    this._setSuggestedTopics(result);
    if (result.user_badges) {
      this.topic.user_badges ??= {};
      Object.assign(this.topic.user_badges, result.user_badges);
    }
    const posts = get(result, "post_stream.posts");
    if (posts) {
      posts.forEach(p => this.storePost(store.createRecord("post", p)));
    }
  });
}

backfillExcerpts(streamPosition) {
  this._excerpts = this._excerpts || [];
  const stream = this.stream;
  this._excerpts.loadNext = streamPosition;
  if (this._excerpts.loading) {
    return this._excerpts.loading.then(() => {
      if (!this._excerpts[stream[streamPosition]]) {
        if (this._excerpts.loadNext === streamPosition) {
          return this.backfillExcerpts(streamPosition);
        }
      }
    });
  }
  let postIds = stream.slice(Math.max(streamPosition - 20, 0), streamPosition + 20);
  for (let i = postIds.length - 1; i >= 0; i--) {
    if (this._excerpts[postIds[i]]) {
      postIds.splice(i, 1);
    }
  }
  let data = {
    post_ids: postIds
  };
  this._excerpts.loading = ajax("/t/" + this.get("topic.id") + "/excerpts.json", {
    data
  }).then(excerpts => {
    excerpts.forEach(obj => {
      this._excerpts[obj.post_id] = obj;
    });
  }).finally(() => {
    this._excerpts.loading = null;
  });
  return this._excerpts.loading;
}