static async find(opts = {}) {
  const data = {};
  if (opts.before) {
    data.before = opts.before;
  }
  if (opts.id) {
    data.id = opts.id;
  }
  const {
    latest_posts
  } = await ajax("/posts.json", {
    data
  });
  return latest_posts.map(post => {
    post.category = Category.findById(post.category_id);
    post.topic_html_title = htmlSafe(post.topic_html_title);
    return Post.create(post);
  });
}