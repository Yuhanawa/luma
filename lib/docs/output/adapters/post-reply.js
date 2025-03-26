find(_store, _type, {
  postId,
  after = 1
}) {
  return ajax(`/posts/${postId}/replies?after=${after || 1}`).then(post_replies => ({
    post_replies
  }));
}