@action
async submit() {
  try {
    const result = await ajax({
      url: userPath(`password-reset/${this.get("model.token")}.json`),
      type: "PUT",
      data: {
        password: this.accountPassword,
        second_factor_token: this.securityKeyCredential || this.secondFactorToken,
        second_factor_method: this.selectedSecondFactorMethod,
        timezone: moment.tz.guess()
      }
    });
    if (result.success) {
      this.set("successMessage", result.message);
      this.set("redirectTo", result.redirect_to);
      if (result.requires_approval) {
        this.set("requiresApproval", true);
      } else {
        this.set("redirected", true);
        DiscourseURL.redirectTo(result.redirect_to || "/");
      }
    } else {
      if (result.errors.security_keys || result.errors.user_second_factors) {
        this.setProperties({
          secondFactorRequired: this.secondFactorRequired,
          securityKeyRequired: this.securityKeyRequired,
          password: null,
          errorMessage: result.message
        });
      } else if (this.secondFactorRequired || this.securityKeyRequired) {
        this.setProperties({
          secondFactorRequired: false,
          securityKeyRequired: false,
          errorMessage: null
        });
      } else if (result.errors?.["user_password.password"]?.length > 0) {
        this.passwordValidationHelper.rejectedPasswords.push(this.accountPassword);
        this.passwordValidationHelper.rejectedPasswordsMessages.set(this.accountPassword, (result.friendly_messages || []).join("\n"));
      }
      if (result.message) {
        this.set("errorMessage", result.message);
      }
    }
  } catch (e) {
    if (e.jqXHR?.status === 429) {
      this.set("errorMessage", i18n("user.second_factor.rate_limit"));
    } else {
      throw new Error(e);
    }
  }
}