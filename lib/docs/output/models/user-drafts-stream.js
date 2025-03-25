findItems(site) {
  if (site) {
    this.set("site", site);
  }
  if (this.loading || !this.hasMore) {
    return Promise.resolve();
  }
  this.set("loading", true);
  const url = `/drafts.json?offset=${this.content.length}&limit=${this.limit}`;
  return ajax(url).then(result => {
    if (!result) {
      return;
    }
    if (!result.drafts) {
      return;
    }
    result.categories?.forEach(category => Site.current().updateCategory(category));
    this.set("hasMore", result.drafts.size >= this.limit);
    const promises = result.drafts.map(draft => {
      draft.data = JSON.parse(draft.data);
      return cook(draft.data.reply).then(cooked => {
        draft.excerpt = excerpt(cooked.toString(), 300);
        draft.post_number = draft.data.postId || null;
        if (draft.draft_key.startsWith(NEW_PRIVATE_MESSAGE_KEY) || draft.draft_key.startsWith(NEW_TOPIC_KEY)) {
          draft.title = draft.data.title;
        }
        if (draft.data.categoryId) {
          draft.category = Category.findById(draft.data.categoryId) || null;
        }
        this.content.push(UserDraft.create(draft));
      });
    });
    return Promise.all(promises);
  }).finally(() => {
    this.set("loading", false);
  });
}