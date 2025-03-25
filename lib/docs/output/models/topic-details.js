updateNotifications(level) {
  return ajax(`/t/${this.get("topic.id")}/notifications`, {
    type: "POST",
    data: {
      notification_level: level
    }
  }).then(() => {
    this.setProperties({
      notification_level: level,
      notifications_reason_id: null
    });
  });
}

removeAllowedGroup(group) {
  const groups = this.allowed_groups;
  const name = group.name;
  return ajax("/t/" + this.get("topic.id") + "/remove-allowed-group", {
    type: "PUT",
    data: {
      name
    }
  }).then(() => {
    groups.removeObject(groups.findBy("name", name));
  });
}

removeAllowedUser(user) {
  const users = this.allowed_users;
  const username = user.get("username");
  return ajax("/t/" + this.get("topic.id") + "/remove-allowed-user", {
    type: "PUT",
    data: {
      username
    }
  }).then(() => {
    users.removeObject(users.findBy("username", username));
  });
}