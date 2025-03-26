find(_store, _type, {
  postId
}) {
  return ajax(`/posts/${postId}/reply-history`).then(post_reply_histories => ({
    post_reply_histories
  }));
}