@action
actOnSelection(selection, actionId) {
  if (!selection || selection.length === 0) {
    return;
  }
  switch (actionId) {
    case "removeMembers":
      return ajax(`/groups/${this.model.id}/members.json`, {
        type: "DELETE",
        data: {
          user_ids: selection.mapBy("id").join(",")
        }
      }).then(() => {
        this.model.reloadMembers(this.memberParams, true);
        this.set("isBulk", false);
      });
    case "makeOwners":
      return ajax(`/groups/${this.model.id}/owners.json`, {
        type: "PUT",
        data: {
          usernames: selection.mapBy("username").join(",")
        }
      }).then(() => {
        selection.forEach(s => s.set("owner", true));
        this.set("isBulk", false);
      });
    case "removeOwners":
      return ajax(`/admin/groups/${this.model.id}/owners.json`, {
        type: "DELETE",
        data: {
          group: {
            usernames: selection.map(u => u.username).join(",")
          }
        }
      }).then(() => {
        selection.forEach(s => s.set("owner", false));
        this.set("isBulk", false);
      });
    case "setPrimary":
    case "unsetPrimary":
      const primary = actionId === "setPrimary";
      return ajax(`/admin/groups/${this.model.id}/primary.json`, {
        type: "PUT",
        data: {
          group: {
            usernames: selection.map(u => u.username).join(",")
          },
          primary
        }
      }).then(() => {
        selection.forEach(s => s.set("primary", primary));
        this.set("isBulk", false);
      });
  }
}