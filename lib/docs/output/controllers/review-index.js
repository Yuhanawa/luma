@action
ignoreAllUnknownTypes() {
  return this.dialog.deleteConfirm({
    message: i18n("review.unknown.delete_confirm"),
    didConfirm: async () => {
      try {
        await ajax("/admin/unknown_reviewables/destroy", {
          type: "delete"
        });
        this.set("unknownReviewableTypes", []);
        this.toasts.success({
          data: {
            message: i18n("review.unknown.ignore_success")
          }
        });
      } catch (e) {
        popupAjaxError(e);
      }
    }
  });
}

async () => {
  try {
    await ajax("/admin/unknown_reviewables/destroy", {
      type: "delete"
    });
    this.set("unknownReviewableTypes", []);
    this.toasts.success({
      data: {
        message: i18n("review.unknown.ignore_success")
      }
    });
  } catch (e) {
    popupAjaxError(e);
  }
}