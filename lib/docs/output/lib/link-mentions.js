async function fetchUnseenMentions({
  names,
  topicId,
  allowedNames
}) {
  const response = await ajax("/composer/mentions", {
    data: {
      names,
      topic_id: topicId,
      allowed_names: allowedNames
    }
  });
  names.forEach(name => checked[name] = true);
  response.users.forEach(username => foundUsers[username] = true);
  Object.entries(response.user_reasons).forEach(([username, reason]) => userReasons[username] = reason);
  Object.entries(response.groups).forEach(([name, details]) => foundGroups[name] = details);
  Object.entries(response.group_reasons).forEach(([name, reason]) => groupReasons[name] = reason);
  maxGroupMention = response.max_users_notified_per_group_mention;
  return response;
}