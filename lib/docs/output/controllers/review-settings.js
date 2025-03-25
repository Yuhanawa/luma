@action
save() {
  let priorities = {};
  this.scoreTypes.forEach(st => {
    priorities[st.id] = parseFloat(st.reviewable_priority);
  });
  this.set("saving", true);
  ajax("/review/settings", {
    type: "PUT",
    data: {
      reviewable_priorities: priorities
    }
  }).then(() => {
    this.set("saved", true);
  }).catch(popupAjaxError).finally(() => this.set("saving", false));
}