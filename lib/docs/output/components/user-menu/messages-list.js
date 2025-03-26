async fetchItems() {
  const data = await ajax(`/u/${this.currentUser.username}/user-menu-private-messages`);
  const content = [];
  const unreadNotifications = await Notification.initializeNotifications(data.unread_notifications);
  unreadNotifications.forEach(notification => {
    content.push(new UserMenuNotificationItem({
      notification,
      currentUser: this.currentUser,
      siteSettings: this.siteSettings,
      site: this.site
    }));
  });
  const topics = data.topics.map(t => this.store.createRecord("topic", t));
  await Topic.applyTransformations(topics);
  if (this.siteSettings.show_user_menu_avatars || this.siteSettings.prioritize_full_name_in_ux) {
    // Populate avatar_template for lastPoster
    const usersById = new Map(data.users.map(u => [u.id, u]));
    topics.forEach(t => {
      const lastPoster = usersById.get(t.lastPoster.user_id);
      t.last_poster_avatar_template = lastPoster?.avatar_template;
      t.last_poster_name = lastPoster?.name;
    });
  }
  const readNotifications = await Notification.initializeNotifications(data.read_notifications);
  mergeSortedLists(readNotifications, topics, (notification, topic) => {
    const notificationCreatedAt = new Date(notification.created_at);
    const topicBumpedAt = new Date(topic.bumped_at);
    return topicBumpedAt > notificationCreatedAt;
  }).forEach(item => {
    if (item instanceof Notification) {
      content.push(new UserMenuNotificationItem({
        notification: item,
        currentUser: this.currentUser,
        siteSettings: this.siteSettings,
        site: this.site
      }));
    } else {
      content.push(new UserMenuMessageItem({
        message: item,
        siteSettings: this.siteSettings,
        site: this.site
      }));
    }
  });
  return content;
}