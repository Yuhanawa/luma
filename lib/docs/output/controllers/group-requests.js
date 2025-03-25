handleRequest(data) {
  ajax(`/groups/${this.get("model.id")}/handle_membership_request.json`, {
    data,
    type: "PUT"
  }).catch(popupAjaxError);
}

@action
undoAcceptRequest(user) {
  ajax("/groups/" + this.get("model.id") + "/members.json", {
    type: "DELETE",
    data: {
      user_id: user.get("id")
    }
  }).then(() => {
    user.set("request_undone", true);
  });
}