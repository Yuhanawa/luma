@action
async confirm() {
  this.loading = true;
  try {
    await ajax(`/u/confirm-old-email/${this.model.token}.json`, {
      type: "PUT"
    });
  } catch (error) {
    popupAjaxError(error);
    return;
  } finally {
    this.loading = false;
  }
  await new Promise(resolve => this.dialog.dialog({
    message: i18n("user.change_email.authorizing_old.confirm_success"),
    type: "alert",
    didConfirm: resolve
  }));
  this.router.transitionTo(`/u/${this.currentUser.username_lower}/preferences/account`);
}