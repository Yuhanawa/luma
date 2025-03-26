@action
deleteTemplate() {
  return this.dialog.yesNoConfirm({
    message: i18n("admin.form_templates.delete_confirm", {
      template_name: this.args.model.name
    }),
    didConfirm: () => {
      ajax(`/admin/customize/form-templates/${this.args.model.id}.json`, {
        type: "DELETE"
      }).then(() => {
        this.args.refreshModel();
      }).catch(popupAjaxError);
    }
  });
}

() => {
  ajax(`/admin/customize/form-templates/${this.args.model.id}.json`, {
    type: "DELETE"
  }).then(() => {
    this.args.refreshModel();
  }).catch(popupAjaxError);
}