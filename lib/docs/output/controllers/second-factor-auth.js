verifySecondFactor(data) {
  this.set("isLoading", true);
  return ajax("/session/2fa", {
    type: "POST",
    data: {
      ...data,
      second_factor_method: this.shownSecondFactorMethod,
      nonce: this.nonce
    }
  }).then(response => {
    this.displaySuccess(i18n("second_factor_auth.redirect_after_success"));
    return ajax(response.callback_path, {
      type: response.callback_method,
      data: {
        second_factor_nonce: this.nonce,
        ...response.callback_params
      }
    }).then(callbackResponse => {
      const redirectUrl = callbackResponse.redirect_url || response.redirect_url;
      return DiscourseURL.routeTo(redirectUrl);
    }).catch(error => this.displayError(extractError(error))).finally(() => {
      this.set("isLoading", false);
    });
  }).catch(error => {
    this.displayError(extractError(error));
  }).finally(() => {
    this.set("isLoading", false);
  });
}

response => {
  this.displaySuccess(i18n("second_factor_auth.redirect_after_success"));
  return ajax(response.callback_path, {
    type: response.callback_method,
    data: {
      second_factor_nonce: this.nonce,
      ...response.callback_params
    }
  }).then(callbackResponse => {
    const redirectUrl = callbackResponse.redirect_url || response.redirect_url;
    return DiscourseURL.routeTo(redirectUrl);
  }).catch(error => this.displayError(extractError(error))).finally(() => {
    this.set("isLoading", false);
  });
}