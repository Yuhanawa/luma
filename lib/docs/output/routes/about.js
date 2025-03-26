async model() {
  const result = await ajax("/about.json");
  const users = Object.fromEntries(result.users.map(user => [user.id, user]));
  result.categories?.forEach(category => {
    this.site.updateCategory(category);
  });
  const yearAgo = moment().utc().subtract(1, "year");
  result.about.admins = result.about.admin_ids.map(id => users[id]).filter(r => moment(r.last_seen_at) > yearAgo);
  result.about.moderators = result.about.moderator_ids.map(id => users[id]).filter(r => moment(r.last_seen_at) > yearAgo);
  result.about.category_moderators?.forEach(obj => {
    obj.category = Category.findById(obj.category_id);
    obj.moderators = obj.moderator_ids.map(id => users[id]);
  });
  return result.about;
}