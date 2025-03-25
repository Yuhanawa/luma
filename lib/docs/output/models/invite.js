static findInvitedBy(user, filter, search, offset) {
  if (!user) {
    Promise.resolve();
  }
  const data = {};
  if (!isNone(filter)) {
    data.filter = filter;
  }
  if (!isNone(search)) {
    data.search = search;
  }
  data.offset = offset || 0;
  return ajax(userPath(`${user.username_lower}/invited.json`), {
    data
  }).then(result => {
    result.invites = result.invites.map(i => Invite.create(i));
    return EmberObject.create(result);
  });
}

static reinviteAll() {
  return ajax("/invites/reinvite-all", {
    type: "POST"
  });
}

static destroyAllExpired() {
  return ajax("/invites/destroy-all-expired", {
    type: "POST"
  });
}

save(data) {
  const promise = this.id ? ajax(`/invites/${this.id}`, {
    type: "PUT",
    data
  }) : ajax("/invites", {
    type: "POST",
    data
  });
  return promise.then(result => this.setProperties(result));
}

destroy() {
  return ajax("/invites", {
    type: "DELETE",
    data: {
      id: this.id
    }
  }).then(() => this.set("destroyed", true));
}

reinvite() {
  return ajax("/invites/reinvite", {
    type: "POST",
    data: {
      email: this.email
    }
  }).then(() => this.set("reinvited", true)).catch(popupAjaxError);
}