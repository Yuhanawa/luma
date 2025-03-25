@action
deleteUnused() {
  ajax("/tags/unused", {
    type: "GET"
  }).then(result => {
    const displayN = 20;
    const tags = result["tags"];
    if (tags.length === 0) {
      this.dialog.alert(i18n("tagging.delete_no_unused_tags"));
      return;
    }
    const joinedTags = tags.slice(0, displayN).join(i18n("tagging.tag_list_joiner"));
    const more = Math.max(0, tags.length - displayN);
    const tagsString = more === 0 ? joinedTags : i18n("tagging.delete_unused_confirmation_more_tags", {
      count: more,
      tags: joinedTags
    });
    const message = i18n("tagging.delete_unused_confirmation", {
      count: tags.length,
      tags: tagsString
    });
    this.dialog.deleteConfirm({
      message,
      confirmButtonLabel: "tagging.delete_unused",
      didConfirm: () => {
        return ajax("/tags/unused", {
          type: "DELETE"
        }).then(() => this.send("triggerRefresh")).catch(popupAjaxError);
      }
    });
  }).catch(popupAjaxError);
}

result => {
  const displayN = 20;
  const tags = result["tags"];
  if (tags.length === 0) {
    this.dialog.alert(i18n("tagging.delete_no_unused_tags"));
    return;
  }
  const joinedTags = tags.slice(0, displayN).join(i18n("tagging.tag_list_joiner"));
  const more = Math.max(0, tags.length - displayN);
  const tagsString = more === 0 ? joinedTags : i18n("tagging.delete_unused_confirmation_more_tags", {
    count: more,
    tags: joinedTags
  });
  const message = i18n("tagging.delete_unused_confirmation", {
    count: tags.length,
    tags: tagsString
  });
  this.dialog.deleteConfirm({
    message,
    confirmButtonLabel: "tagging.delete_unused",
    didConfirm: () => {
      return ajax("/tags/unused", {
        type: "DELETE"
      }).then(() => this.send("triggerRefresh")).catch(popupAjaxError);
    }
  });
}

() => {
  return ajax("/tags/unused", {
    type: "DELETE"
  }).then(() => this.send("triggerRefresh")).catch(popupAjaxError);
}