/**
  Find all badges for a given username.
   @method findByUsername
  @param {String} username
  @param {Object} options
  @returns {Promise} a promise that resolves to an array of `UserBadge`.
**/
static findByUsername(username, options) {
  if (!username) {
    return Promise.resolve([]);
  }
  let url = "/user-badges/" + username + ".json";
  if (options && options.grouped) {
    url += "?grouped=true";
  }
  return ajax(url).then(function (json) {
    return UserBadge.createFromJson(json);
  });
}

/**
  Find all badge grants for a given badge ID.
   @method findById
  @param {String} badgeId
  @returns {Promise} a promise that resolves to an array of `UserBadge`.
**/

/**
  Find all badge grants for a given badge ID.
   @method findById
  @param {String} badgeId
  @returns {Promise} a promise that resolves to an array of `UserBadge`.
**/
static findByBadgeId(badgeId, options) {
  if (!options) {
    options = {};
  }
  options.badge_id = badgeId;
  return ajax("/user_badges.json", {
    data: options
  }).then(function (json) {
    return UserBadge.createFromJson(json);
  });
}

/**
  Grant the badge having id `badgeId` to the user identified by `username`.
   @method grant
  @param {Integer} badgeId id of the badge to be granted.
  @param {String} username username of the user to be granted the badge.
  @returns {Promise} a promise that resolves to an instance of `UserBadge`.
**/

/**
  Grant the badge having id `badgeId` to the user identified by `username`.
   @method grant
  @param {Integer} badgeId id of the badge to be granted.
  @param {String} username username of the user to be granted the badge.
  @returns {Promise} a promise that resolves to an instance of `UserBadge`.
**/
static grant(badgeId, username, reason) {
  return ajax("/user_badges", {
    type: "POST",
    data: {
      username,
      badge_id: badgeId,
      reason
    }
  }).then(function (json) {
    return UserBadge.createFromJson(json);
  });
}

// avoid the extra bindings for now

revoke() {
  return ajax("/user_badges/" + this.id, {
    type: "DELETE"
  });
}

favorite() {
  this.toggleProperty("is_favorite");
  return ajax(`/user_badges/${this.id}/toggle_favorite`, {
    type: "PUT"
  }).catch(e => {
    // something went wrong, switch the UI back:
    this.toggleProperty("is_favorite");
    popupAjaxError(e);
  });
}