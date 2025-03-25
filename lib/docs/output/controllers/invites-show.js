@action
submit() {
  let userCustomFields = {};
  if (!isEmpty(this.userFields)) {
    this.userFields.forEach(function (f) {
      userCustomFields[f.field.id] = f.value;
    });
  }
  const data = {
    username: this.accountUsername,
    name: this.accountName,
    password: this.accountPassword,
    user_custom_fields: userCustomFields,
    timezone: moment.tz.guess()
  };
  if (this.isInviteLink) {
    data.email = this.email;
  } else {
    data.email_token = this.t;
  }
  ajax({
    url: `/invites/show/${this.get("model.token")}.json`,
    type: "PUT",
    data
  }).then(result => {
    if (result.success) {
      this.set("successMessage", result.message || i18n("invites.success"));
      if (result.redirect_to) {
        DiscourseURL.redirectTo(result.redirect_to);
      }
    } else {
      if (result.errors && result.errors.email && result.errors.email.length > 0 && result.values) {
        this.rejectedEmails.pushObject(result.values.email);
      }
      if (result.errors?.["user_password.password"]?.length > 0) {
        this.passwordValidationHelper.rejectedPasswords.push(this.accountPassword);
        this.passwordValidationHelper.rejectedPasswordsMessages.set(this.accountPassword, result.errors["user_password.password"][0]);
      }
      if (result.message) {
        this.set("errorMessage", result.message);
      }
    }
  }).catch(error => {
    this.set("errorMessage", extractError(error));
  });
}