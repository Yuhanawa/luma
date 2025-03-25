static findAll(opts) {
  let listable = "";
  if (opts && opts.onlyListable) {
    listable = "?only_listable=true";
  }
  return ajax(`/badges.json${listable}`, {
    data: opts
  }).then(badgesJson => Badge.createFromJson(badgesJson));
}

static findById(id) {
  return ajax(`/badges/${id}`).then(badgeJson => Badge.createFromJson(badgeJson));
}

save(data) {
  let url = "/admin/badges",
    type = "POST";
  if (this.id) {
    // We are updating an existing badge.
    url += `/${this.id}`;
    type = "PUT";
  }
  return ajax(url, {
    type,
    data
  }).then(json => {
    this.updateFromJson(json);
    return this;
  });
}

destroy() {
  if (this.newBadge) {
    return Promise.resolve();
  }
  return ajax(`/admin/badges/${this.id}`, {
    type: "DELETE"
  });
}