async fetchItems() {
  const params = {
    limit,
    recent: true,
    bump_last_seen_reviewable: true
  };
  if (this.currentUser.enforcedSecondFactor) {
    params.silent = true;
  }
  const types = this.filterByTypes;
  if (types?.length > 0) {
    params.filter_by_types = types.join(",");
    params.silent = true;
  }
  const content = [];
  const data = await ajax("/notifications", {
    data: params
  });
  const notifications = await Notification.initializeNotifications(data.notifications);
  const reviewables = data.pending_reviewables?.map(r => UserMenuReviewable.create(r));
  if (reviewables?.length) {
    const firstReadNotificationIndex = notifications.findIndex(n => n.read);
    const unreadNotifications = notifications.splice(0, firstReadNotificationIndex);
    mergeSortedLists(unreadNotifications, reviewables, (notification, reviewable) => {
      const notificationCreatedAt = new Date(notification.created_at);
      const reviewableCreatedAt = new Date(reviewable.created_at);
      return reviewableCreatedAt > notificationCreatedAt;
    }).forEach(item => {
      const props = {
        appEvents: this.appEvents,
        currentUser: this.currentUser,
        siteSettings: this.siteSettings,
        site: this.site
      };
      if (item instanceof Notification) {
        props.notification = item;
        content.push(new UserMenuNotificationItem(props));
      } else {
        props.reviewable = item;
        content.push(new UserMenuReviewableItem(props));
      }
    });
  }
  notifications.forEach(notification => {
    content.push(new UserMenuNotificationItem({
      notification,
      appEvents: this.appEvents,
      currentUser: this.currentUser,
      siteSettings: this.siteSettings,
      site: this.site
    }));
  });
  return content;
}

async performDismiss() {
  const opts = {
    type: "PUT"
  };
  const dismissTypes = this.dismissTypes;
  if (dismissTypes?.length > 0) {
    opts.data = {
      dismiss_types: dismissTypes.join(",")
    };
  }
  await ajax("/notifications/mark-read", opts);
  if (dismissTypes) {
    const unreadNotificationCountsHash = {
      ...this.currentUser.grouped_unread_notifications
    };
    dismissTypes.forEach(type => {
      const typeId = this.site.notification_types[type];
      if (typeId) {
        delete unreadNotificationCountsHash[typeId];
      }
    });
    this.currentUser.set("grouped_unread_notifications", unreadNotificationCountsHash);
  } else {
    this.currentUser.set("all_unread_notifications_count", 0);
    this.currentUser.set("unread_high_priority_notifications", 0);
    this.currentUser.set("grouped_unread_notifications", {});
  }
  this.refreshList();
  postRNWebviewMessage("markRead", "1");
}