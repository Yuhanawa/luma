@action
async finishLogin() {
  let data = {
    second_factor_method: this.secondFactorMethod,
    timezone: moment.tz.guess()
  };
  if (this.securityKeyCredential) {
    data.second_factor_token = this.securityKeyCredential;
  } else {
    data.second_factor_token = this.secondFactorToken;
  }
  try {
    const result = await ajax({
      url: `/session/email-login/${this.model.token}`,
      type: "POST",
      data
    });
    if (!result.success) {
      this.set("model.error", result.error);
      return;
    }
    let destination = "/";
    const safeMode = new URL(this.router.currentURL, window.location.origin).searchParams.get("safe_mode");
    if (safeMode) {
      const params = new URLSearchParams();
      params.set("safe_mode", safeMode);
      destination += `?${params.toString()}`;
    }
    DiscourseURL.redirectTo(destination);
  } catch (e) {
    popupAjaxError(e);
  }
}