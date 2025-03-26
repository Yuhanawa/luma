@action
async showAssociateAccount(params) {
  try {
    const model = await ajax(`/associate/${encodeURIComponent(params.token)}.json`);
    this.modal.show(AssociateAccountConfirm, {
      model
    });
  } catch (e) {
    popupAjaxError(e);
  }
}