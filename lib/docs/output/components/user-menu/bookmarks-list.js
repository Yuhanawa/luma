async fetchItems() {
  const data = await ajax(`/u/${this.currentUser.username}/user-menu-bookmarks`);
  const content = [];
  const notifications = data.notifications.map(n => Notification.create(n));
  await Notification.applyTransformations(notifications);
  notifications.forEach(notification => {
    content.push(new UserMenuNotificationItem({
      notification,
      currentUser: this.currentUser,
      siteSettings: this.siteSettings,
      site: this.site
    }));
  });
  const bookmarks = data.bookmarks.map(b => Bookmark.create(b));
  await Bookmark.applyTransformations(bookmarks);
  content.push(...bookmarks.map(bookmark => {
    return new UserMenuBookmarkItem({
      bookmark,
      siteSettings: this.siteSettings,
      site: this.site
    });
  }));
  return content;
}