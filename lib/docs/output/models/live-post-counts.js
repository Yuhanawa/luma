static find() {
  return ajax("/about/live_post_counts.json").then(result => LivePostCounts.create(result));
}