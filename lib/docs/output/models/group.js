static findAll(opts) {
  return ajax("/groups/search.json", {
    data: opts
  }).then(groups => groups.map(g => Group.create(g)));
}

static loadMembers(name, opts) {
  return ajax(`/groups/${name}/members.json`, {
    data: opts
  });
}

static mentionable(name) {
  return ajax(`/groups/${name}/mentionable`);
}

static messageable(name) {
  return ajax(`/groups/${name}/messageable`);
}

static checkName(name) {
  return ajax("/groups/check-name", {
    data: {
      group_name: name
    }
  });
}

async removeOwner(member) {
  await ajax(`/admin/groups/${this.id}/owners.json`, {
    type: "DELETE",
    data: {
      user_id: member.id
    }
  });
  await this.reloadMembers({}, true);
}

async removeMember(member, params) {
  await ajax(`/groups/${this.id}/members.json`, {
    type: "DELETE",
    data: {
      user_id: member.id
    }
  });
  await this.reloadMembers(params, true);
}

async leave() {
  await ajax(`/groups/${this.id}/leave.json`, {
    type: "DELETE"
  });
  this.set("can_see_members", this.members_visibility_level < 2);
  await this.reloadMembers({}, true);
}

async addMembers(usernames, filter, notifyUsers, emails = []) {
  const response = await ajax(`/groups/${this.id}/members.json`, {
    type: "PUT",
    data: {
      usernames,
      emails,
      notify_users: notifyUsers
    }
  });
  if (filter) {
    await this._filterMembers(response.usernames);
  } else {
    await this.reloadMembers();
  }
}

async join() {
  await ajax(`/groups/${this.id}/join.json`, {
    type: "PUT"
  });
  await this.reloadMembers({}, true);
}

async addOwners(usernames, filter, notifyUsers) {
  const response = await ajax(`/groups/${this.id}/owners.json`, {
    type: "PUT",
    data: {
      usernames,
      notify_users: notifyUsers
    }
  });
  if (filter) {
    await this._filterMembers(response.usernames);
  } else {
    await this.reloadMembers({}, true);
  }
}

async create() {
  const response = await ajax("/admin/groups", {
    type: "POST",
    data: {
      group: this.asJSON()
    }
  });
  this.setProperties({
    id: response.basic_group.id,
    usernames: null,
    ownerUsernames: null
  });
  await this.reloadMembers();
}

save(opts = {}) {
  return ajax(`/groups/${this.id}`, {
    type: "PUT",
    data: {
      group: this.asJSON(),
      ...opts
    }
  });
}

destroy() {
  if (!this.id) {
    return;
  }
  return ajax(`/admin/groups/${this.id}`, {
    type: "DELETE"
  });
}

findLogs(offset, filters) {
  return ajax(`/groups/${this.name}/logs.json`, {
    data: {
      offset,
      filters
    }
  }).then(results => {
    return EmberObject.create({
      logs: results["logs"].map(log => GroupHistory.create(log)),
      all_loaded: results["all_loaded"]
    });
  });
}

async findPosts(opts) {
  opts = opts || {};
  const type = opts.type || "posts";
  const data = {};
  if (opts.before) {
    data.before = opts.before;
  }
  if (opts.categoryId) {
    data.category_id = parseInt(opts.categoryId, 10);
  }
  const result = await ajax(`/groups/${this.name}/${type}.json`, {
    data
  });
  result.categories?.forEach(category => {
    Site.current().updateCategory(category);
  });
  return result.posts.map(p => {
    p.user = User.create(p.user);
    p.topic = Topic.create(p.topic);
    p.category = Category.findById(p.category_id);
    return EmberObject.create(p);
  });
}

setNotification(notification_level, userId) {
  this.set("group_user.notification_level", notification_level);
  return ajax(`/groups/${this.name}/notifications`, {
    data: {
      notification_level,
      user_id: userId
    },
    type: "POST"
  });
}

requestMembership(reason) {
  return ajax(`/groups/${this.name}/request_membership.json`, {
    type: "POST",
    data: {
      reason
    }
  });
}