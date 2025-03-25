_loadPostIds(post) {
  if (this.loadingPostIds) {
    return;
  }
  const postStream = this.get("model.postStream");
  const url = `/t/${this.get("model.id")}/post_ids.json`;
  this.set("loadingPostIds", true);
  return ajax(url, {
    data: deepMerge({
      post_number: post.get("post_number")
    }, postStream.get("streamFilters"))
  }).then(result => {
    result.post_ids.pushObject(post.get("id"));
    this._updateSelectedPostIds(result.post_ids);
  }).finally(() => {
    this.set("loadingPostIds", false);
  });
}

@action
deletePending(pending) {
  return ajax(`/review/${pending.id}`, {
    type: "DELETE"
  }).then(() => {
    this.get("model.pending_posts").removeObject(pending);
  }).catch(popupAjaxError);
}

@action
deferTopic() {
  const {
    screenTrack,
    currentUser
  } = this;
  const topic = this.model;
  screenTrack.reset();
  screenTrack.stop();
  const goToPath = topic.get("isPrivateMessage") ? currentUser.pmPath(topic) : "/";
  ajax("/t/" + topic.get("id") + "/timings.json?last=1", {
    type: "DELETE"
  }).then(() => {
    const highestSeenByTopic = this.session.get("highestSeenByTopic");
    highestSeenByTopic[topic.get("id")] = null;
    DiscourseURL.routeTo(goToPath);
  }).catch(popupAjaxError);
}

@action
deletePost(post, opts) {
  if (post.get("post_number") === 1) {
    return this.deleteTopic(opts);
  } else if (!opts?.force_destroy && !post.can_delete || opts?.force_destroy && !post.can_permanently_delete) {
    return false;
  }
  const user = this.currentUser;
  const refresh = () => this.appEvents.trigger("post-stream:refresh");
  const hasReplies = post.get("reply_count") > 0;
  const loadedPosts = this.get("model.postStream.posts");
  if (user.get("staff") && hasReplies) {
    ajax(`/posts/${post.id}/reply-ids.json`).then(replies => {
      if (replies.length === 0) {
        return post.destroy(user, opts).then(refresh).catch(error => {
          popupAjaxError(error);
          post.undoDeleteState();
        });
      }
      const buttons = [];
      const directReplyIds = replies.filter(r => r.level === 1).map(r => r.id);
      buttons.push({
        label: i18n("post.controls.delete_replies.direct_replies", {
          count: directReplyIds.length
        }),
        class: "btn-primary",
        action: () => {
          loadedPosts.forEach(p => (p === post || directReplyIds.includes(p.id)) && p.setDeletedState(user));
          Post.deleteMany([post.id, ...directReplyIds]).then(refresh).catch(popupAjaxError);
        }
      });
      if (replies.some(r => r.level > 1)) {
        buttons.push({
          label: i18n("post.controls.delete_replies.all_replies", {
            count: replies.length
          }),
          action: () => {
            loadedPosts.forEach(p => (p === post || replies.some(r => r.id === p.id)) && p.setDeletedState(user));
            Post.deleteMany([post.id, ...replies.map(r => r.id)]).then(refresh).catch(popupAjaxError);
          }
        });
      }
      buttons.push({
        label: i18n("post.controls.delete_replies.just_the_post"),
        action: () => {
          post.destroy(user, opts).then(refresh).catch(error => {
            popupAjaxError(error);
            post.undoDeleteState();
          });
        }
      });
      buttons.push({
        label: i18n("cancel"),
        class: "btn-flat"
      });
      this.dialog.alert({
        title: i18n("post.controls.delete_replies.confirm"),
        buttons
      });
    });
  } else {
    return post.destroy(user, opts).then(refresh).catch(error => {
      popupAjaxError(error);
      post.undoDeleteState();
    });
  }
}

@action
selectReplies(post) {
  ajax(`/posts/${post.id}/reply-ids.json`).then(replies => {
    const replyIds = replies.map(r => r.id);
    const postIds = [...this.selectedPostIds, post.id, ...replyIds];
    this.set("selectedPostIds", [...new Set(postIds)]);
    this._forceRefreshPostStream();
  });
}