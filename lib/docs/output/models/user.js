destroySession() {
  return ajax(`/session/${this.username}`, {
    type: "DELETE"
  });
}

revokeApiKey(key) {
  return ajax("/user-api-key/revoke", {
    type: "POST",
    data: {
      id: key.get("id")
    }
  }).then(() => {
    key.set("revoked", true);
  });
}

undoRevokeApiKey(key) {
  return ajax("/user-api-key/undo-revoke", {
    type: "POST",
    data: {
      id: key.get("id")
    }
  }).then(() => {
    key.set("revoked", false);
  });
}

changeUsername(new_username) {
  return ajax(userPath(`${this.username_lower}/preferences/username`), {
    type: "PUT",
    data: {
      new_username
    }
  });
}

addEmail(email) {
  return ajax(userPath(`${this.username_lower}/preferences/email`), {
    type: "POST",
    data: {
      email
    }
  }).then(() => {
    if (!this.unconfirmed_emails) {
      this.set("unconfirmed_emails", []);
    }
    this.unconfirmed_emails.pushObject(email);
  });
}

changeEmail(email) {
  return ajax(userPath(`${this.username_lower}/preferences/email`), {
    type: "PUT",
    data: {
      email
    }
  }).then(() => {
    if (!this.unconfirmed_emails) {
      this.set("unconfirmed_emails", []);
    }
    this.unconfirmed_emails.pushObject(email);
  });
}

save(fields) {
  const data = this.getProperties(userFields.filter(uf => !fields || fields.includes(uf)));
  const filteredUserOptionFields = fields ? userOptionFields.filter(uo => fields.includes(uo)) : userOptionFields;
  filteredUserOptionFields.forEach(s => {
    data[s] = this.get(`user_option.${s}`);
  });
  const updatedState = {};
  ["muted", "regular", "watched", "tracked", "watched_first_post"].forEach(categoryNotificationLevel => {
    if (fields === undefined || fields.includes(`${categoryNotificationLevel}_category_ids`)) {
      const categories = this.get(`${camelize(categoryNotificationLevel)}Categories`);
      if (categories) {
        const ids = categories.map(c => c.get("id"));
        updatedState[`${categoryNotificationLevel}_category_ids`] = ids;
        // HACK: Empty arrays are not sent in the request, we use [-1],
        // an invalid category ID, that will be ignored by the server.
        data[`${categoryNotificationLevel}_category_ids`] = ids.length === 0 ? [-1] : ids;
      }
    }
  });
  ["muted_tags", "tracked_tags", "watched_tags", "watching_first_post_tags"].forEach(prop => {
    if (fields === undefined || fields.includes(prop)) {
      data[prop] = this.get(prop) ? this.get(prop).join(",") : "";
    }
  });
  ["sidebar_category_ids", "sidebar_tag_names"].forEach(prop => {
    if (data[prop]?.length === 0) {
      data[prop] = null;
    }
  });

  // TODO: We can remove this when migrated fully to rest model.
  this.set("isSaving", true);
  return ajax(userPath(`${this.username_lower}.json`), {
    data,
    type: "PUT"
  }).then(result => {
    this.setProperties(updatedState);
    this.setProperties(getProperties(result.user, "bio_excerpt"));
    return result;
  }).finally(() => {
    this.set("isSaving", false);
  });
}

setPrimaryEmail(email) {
  return ajax(userPath(`${this.username}/preferences/primary-email.json`), {
    type: "PUT",
    data: {
      email
    }
  }).then(() => {
    this.secondary_emails.removeObject(email);
    this.secondary_emails.pushObject(this.email);
    this.set("email", email);
  });
}

destroyEmail(email) {
  return ajax(userPath(`${this.username}/preferences/email.json`), {
    type: "DELETE",
    data: {
      email
    }
  }).then(() => {
    if (this.unconfirmed_emails.includes(email)) {
      this.unconfirmed_emails.removeObject(email);
    } else {
      this.secondary_emails.removeObject(email);
    }
  });
}

changePassword() {
  return ajax("/session/forgot_password", {
    dataType: "json",
    data: {
      login: this.email || this.username
    },
    type: "POST"
  });
}

loadSecondFactorCodes() {
  return ajax("/u/second_factors.json", {
    type: "POST"
  });
}

requestSecurityKeyChallenge() {
  return ajax("/u/create_second_factor_security_key.json", {
    type: "POST"
  });
}

registerSecurityKey(credential) {
  return ajax("/u/register_second_factor_security_key.json", {
    data: credential,
    type: "POST"
  });
}

trustedSession() {
  return ajax("/u/trusted-session.json");
}

createPasskey() {
  return ajax("/u/create_passkey.json", {
    type: "POST"
  });
}

registerPasskey(credential) {
  return ajax("/u/register_passkey.json", {
    data: credential,
    type: "POST"
  });
}

deletePasskey(id) {
  return ajax(`/u/delete_passkey/${id}`, {
    type: "DELETE"
  });
}

createSecondFactorTotp() {
  return ajax("/u/create_second_factor_totp.json", {
    type: "POST"
  });
}

enableSecondFactorTotp(authToken, name) {
  return ajax("/u/enable_second_factor_totp.json", {
    data: {
      second_factor_token: authToken,
      name
    },
    type: "POST"
  });
}

disableAllSecondFactors() {
  return ajax("/u/disable_second_factor.json", {
    type: "PUT"
  });
}

updateSecondFactor(id, name, disable, targetMethod) {
  return ajax("/u/second_factor.json", {
    data: {
      second_factor_target: targetMethod,
      name,
      disable,
      id
    },
    type: "PUT"
  });
}

updateSecurityKey(id, name, disable) {
  return ajax("/u/security_key.json", {
    data: {
      name,
      disable,
      id
    },
    type: "PUT"
  });
}

toggleSecondFactor(authToken, authMethod, targetMethod, enable) {
  return ajax("/u/second_factor.json", {
    data: {
      second_factor_token: authToken,
      second_factor_method: authMethod,
      second_factor_target: targetMethod,
      enable
    },
    type: "PUT"
  });
}

generateSecondFactorCodes() {
  return ajax("/u/second_factors_backup.json", {
    type: "PUT"
  });
}

revokeAssociatedAccount(providerName) {
  return ajax(userPath(`${this.username}/preferences/revoke-account`), {
    data: {
      provider_name: providerName
    },
    type: "POST"
  });
}

async loadUserAction(id) {
  const result = await ajax(`/user_actions/${id}.json`);
  if (!result?.user_action) {
    return;
  }
  const ua = result.user_action;
  if ((this.get("stream.filter") || ua.action_type) !== ua.action_type) {
    return;
  }
  if (!this.get("stream.filter") && !this.inAllStream(ua)) {
    return;
  }
  ua.title = emojiUnescape(escapeExpression(ua.title));
  const action = UserAction.collapseStream([UserAction.create(ua)]);
  this.stream.set("itemsLoaded", this.stream.get("itemsLoaded") + 1);
  this.stream.get("content").insertAt(0, action[0]);
}

findDetails(options) {
  const user = this;
  return PreloadStore.getAndRemove(`user_${user.get("username")}`, () => {
    if (options && options.existingRequest) {
      // Existing ajax request has been passed, use it
      return options.existingRequest;
    }
    const useCardRoute = options && options.forCard;
    if (options) {
      delete options.forCard;
    }
    const path = useCardRoute ? `${user.get("username")}/card.json` : `${user.get("username")}.json`;
    return ajax(userPath(path), {
      data: options
    });
  }).then(json => {
    if (!isEmpty(json.user.stats)) {
      json.user.stats = User.groupStats(json.user.stats.map(s => {
        if (s.count) {
          s.count = parseInt(s.count, 10);
        }
        return UserActionStat.create(s);
      }));
    }
    if (!isEmpty(json.user.groups) && !isEmpty(json.user.group_users)) {
      const groups = [];
      for (let i = 0; i < json.user.groups.length; i++) {
        const group = Group.create(json.user.groups[i]);
        group.group_user = json.user.group_users[i];
        groups.push(group);
      }
      json.user.groups = groups;
    }
    if (json.user.invited_by) {
      json.user.invited_by = User.create(json.user.invited_by);
    }
    if (!isEmpty(json.user.featured_user_badge_ids)) {
      const userBadgesMap = {};
      UserBadge.createFromJson(json).forEach(userBadge => {
        userBadgesMap[userBadge.get("id")] = userBadge;
      });
      json.user.featured_user_badges = json.user.featured_user_badge_ids.map(id => userBadgesMap[id]);
    }
    if (json.user.card_badge) {
      json.user.card_badge = Badge.create(json.user.card_badge);
    }
    user.setProperties(json.user);
    return user;
  });
}

() => {
  if (options && options.existingRequest) {
    // Existing ajax request has been passed, use it
    return options.existingRequest;
  }
  const useCardRoute = options && options.forCard;
  if (options) {
    delete options.forCard;
  }
  const path = useCardRoute ? `${user.get("username")}/card.json` : `${user.get("username")}.json`;
  return ajax(userPath(path), {
    data: options
  });
}

findStaffInfo() {
  if (!User.currentProp("staff")) {
    return Promise.resolve(null);
  }
  return ajax(userPath(`${this.username_lower}/staff-info.json`)).then(info => {
    this.setProperties(info);
  });
}

pickAvatar(upload_id, type) {
  return ajax(userPath(`${this.username_lower}/preferences/avatar/pick`), {
    type: "PUT",
    data: {
      upload_id,
      type
    }
  });
}

selectAvatar(avatarUrl) {
  return ajax(userPath(`${this.username_lower}/preferences/avatar/select`), {
    type: "PUT",
    data: {
      url: avatarUrl
    }
  });
}

createInvite(email, group_ids, custom_message) {
  return ajax("/invites", {
    type: "POST",
    data: {
      email,
      group_ids,
      custom_message
    }
  });
}

generateInviteLink(email, group_ids, topic_id) {
  return ajax("/invites", {
    type: "POST",
    data: {
      email,
      skip_email: true,
      group_ids,
      topic_id
    }
  });
}

delete() {
  if (this.can_delete_account) {
    return ajax(userPath(this.username + ".json"), {
      type: "DELETE",
      data: {
        context: window.location.pathname
      }
    });
  } else {
    return Promise.reject(i18n("user.delete_yourself_not_allowed"));
  }
}

updateNotificationLevel({
  level,
  expiringAt = null,
  actingUser = null
}) {
  actingUser ||= User.current();
  return ajax(`${userPath(this.username)}/notification_level.json`, {
    type: "PUT",
    data: {
      notification_level: level,
      expiring_at: expiringAt,
      acting_user_id: actingUser.id
    }
  }).then(() => {
    if (!actingUser.ignored_users) {
      actingUser.ignored_users = [];
    }
    if (level === "normal" || level === "mute") {
      actingUser.ignored_users.removeObject(this.username);
    } else if (level === "ignore") {
      actingUser.ignored_users.addObject(this.username);
    }
  });
}

dismissBanner(bannerKey) {
  this.set("dismissed_banner_key", bannerKey);
  ajax(userPath(this.username + ".json"), {
    type: "PUT",
    data: {
      dismissed_banner_key: bannerKey
    }
  });
}

checkEmail() {
  return ajax(userPath(`${this.username_lower}/emails.json`), {
    data: {
      context: window.location.pathname
    }
  }).then(result => {
    if (result) {
      this.setProperties({
        email: result.email,
        secondary_emails: result.secondary_emails,
        unconfirmed_emails: result.unconfirmed_emails,
        associated_accounts: result.associated_accounts
      });
    }
  });
}

summary() {
  const store = getOwnerWithFallback(this).lookup("service:store");
  return ajax(userPath(`${this.username_lower}/summary.json`)).then(json => {
    const summary = json.user_summary;
    const topicMap = {};
    const badgeMap = {};
    json.topics.forEach(t => topicMap[t.id] = store.createRecord("topic", t));
    Badge.createFromJson(json).forEach(b => badgeMap[b.id] = b);
    summary.topics = summary.topic_ids.map(id => topicMap[id]);
    summary.replies.forEach(r => {
      r.topic = topicMap[r.topic_id];
      r.url = r.topic.urlForPostNumber(r.post_number);
      r.createdAt = new Date(r.created_at);
    });
    summary.links.forEach(l => {
      l.topic = topicMap[l.topic_id];
      l.post_url = l.topic.urlForPostNumber(l.post_number);
    });
    if (summary.badges) {
      summary.badges = summary.badges.map(ub => {
        const badge = badgeMap[ub.badge_id];
        badge.count = ub.count;
        return badge;
      });
    }
    if (summary.top_categories) {
      summary.top_categories.forEach(c => {
        if (c.parent_category_id) {
          c.parentCategory = Category.findById(c.parent_category_id);
        }
      });
    }
    return summary;
  });
}

setPrimaryGroup(primaryGroupId) {
  return ajax(`/admin/users/${this.id}/primary_group`, {
    type: "PUT",
    data: {
      primary_group_id: primaryGroupId
    }
  });
}

enterDoNotDisturbFor(duration) {
  return ajax({
    url: "/do-not-disturb.json",
    type: "POST",
    data: {
      duration
    }
  }).then(response => {
    return this.updateDoNotDisturbStatus(response.ends_at);
  });
}

leaveDoNotDisturb() {
  return ajax({
    url: "/do-not-disturb.json",
    type: "DELETE"
  }).then(() => {
    this.updateDoNotDisturbStatus(null);
  });
}

checkUsername(username, email, for_user_id) {
  return ajax(userPath("check_username"), {
    data: {
      username,
      email,
      for_user_id
    }
  });
}

checkEmail(email) {
  return ajax(userPath("check_email"), {
    data: {
      email
    }
  });
}

loadRecentSearches() {
  return ajax(`/u/recent-searches`);
}

resetRecentSearches() {
  return ajax(`/u/recent-searches`, {
    type: "DELETE"
  });
}

createAccount(attrs) {
  let data = {
    name: attrs.accountName,
    email: attrs.accountEmail,
    password: attrs.accountPassword,
    username: attrs.accountUsername,
    password_confirmation: attrs.accountPasswordConfirm,
    challenge: attrs.accountChallenge,
    user_fields: attrs.userFields,
    timezone: moment.tz.guess()
  };
  if (attrs.inviteCode) {
    data.invite_code = attrs.inviteCode;
  }
  return ajax(userPath(), {
    data,
    type: "POST"
  });
}

_saveTimezone(user) {
  ajax(userPath(user.username + ".json"), {
    type: "PUT",
    dataType: "json",
    data: {
      timezone: user.user_option.timezone
    }
  });
}