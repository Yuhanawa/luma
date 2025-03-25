@action
async passkeyLogin(mediation = "optional") {
  try {
    const publicKeyCredential = await getPasskeyCredential(e => this.dialog.alert(e), mediation, this.capabilities.isFirefox);
    if (publicKeyCredential) {
      let authResult;
      try {
        authResult = await ajax("/session/passkey/auth.json", {
          type: "POST",
          data: {
            publicKeyCredential
          }
        });
      } catch (e) {
        popupAjaxError(e);
        return;
      }
      if (authResult && !authResult.error) {
        const destinationUrl = cookie("destination_url");
        const ssoDestinationUrl = cookie("sso_destination_url");
        if (ssoDestinationUrl) {
          removeCookie("sso_destination_url");
          window.location.assign(ssoDestinationUrl);
        } else if (destinationUrl) {
          removeCookie("destination_url");
          window.location.assign(destinationUrl);
        } else if (this.referrerTopicUrl) {
          window.location.assign(this.referrerTopicUrl);
        } else {
          window.location.reload();
        }
      } else {
        this.dialog.alert(authResult.error);
      }
    }
  } catch (e) {
    popupAjaxError(e);
  }
}

@action
async triggerLogin() {
  if (this.loginDisabled) {
    return;
  }
  if (isEmpty(this.loginName) || isEmpty(this.loginPassword)) {
    this.flash = i18n("login.blank_username_or_password");
    this.flashType = "error";
    return;
  }
  try {
    this.loggingIn = true;
    const result = await ajax("/session", {
      type: "POST",
      data: {
        login: this.loginName,
        password: this.loginPassword,
        second_factor_token: this.securityKeyCredential || this.secondFactorToken,
        second_factor_method: this.secondFactorMethod,
        timezone: moment.tz.guess()
      }
    });
    if (result && result.error) {
      this.loggingIn = false;
      this.flash = null;
      if ((result.security_key_enabled || result.totp_enabled) && !this.secondFactorRequired) {
        this.otherMethodAllowed = result.multiple_second_factor_methods;
        this.secondFactorRequired = true;
        this.showLoginButtons = false;
        this.backupEnabled = result.backup_enabled;
        this.totpEnabled = result.totp_enabled;
        this.showSecondFactor = result.totp_enabled;
        this.showSecurityKey = result.security_key_enabled;
        this.secondFactorMethod = result.security_key_enabled ? SECOND_FACTOR_METHODS.SECURITY_KEY : SECOND_FACTOR_METHODS.TOTP;
        this.securityKeyChallenge = result.challenge;
        this.securityKeyAllowedCredentialIds = result.allowed_credential_ids;
        return;
      } else if (result.reason === "not_activated") {
        this.showNotActivated({
          username: this.loginName,
          sentTo: escape(result.sent_to_email),
          currentEmail: escape(result.current_email)
        });
      } else if (result.reason === "suspended") {
        this.dialog.alert(result.error);
      } else if (result.reason === "expired") {
        this.flash = htmlSafe(i18n("login.password_expired", {
          reset_url: getURL("/password-reset")
        }));
        this.flashType = "error";
      } else {
        this.flash = result.error;
        this.flashType = "error";
      }
    } else {
      this.loggedIn = true;
      // Trigger the browser's password manager using the hidden static login form:
      const hiddenLoginForm = document.getElementById("hidden-login-form");
      const applyHiddenFormInputValue = (value, key) => {
        if (!hiddenLoginForm) {
          return;
        }
        hiddenLoginForm.querySelector(`input[name=${key}]`).value = value;
      };
      const destinationUrl = cookie("destination_url");
      const ssoDestinationUrl = cookie("sso_destination_url");
      applyHiddenFormInputValue(this.loginName, "username");
      applyHiddenFormInputValue(this.loginPassword, "password");
      if (ssoDestinationUrl) {
        removeCookie("sso_destination_url");
        window.location.assign(ssoDestinationUrl);
        return;
      } else if (destinationUrl) {
        // redirect client to the original URL
        removeCookie("destination_url");
        applyHiddenFormInputValue(destinationUrl, "redirect");
      } else if (this.referrerTopicUrl) {
        applyHiddenFormInputValue(this.referrerTopicUrl, "redirect");
      } else {
        applyHiddenFormInputValue(window.location.href, "redirect");
      }
      if (hiddenLoginForm) {
        if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) && navigator.userAgent.match(/Safari/g)) {
          // In case of Safari on iOS do not submit hidden login form
          window.location.href = hiddenLoginForm.querySelector("input[name=redirect]").value;
        } else {
          hiddenLoginForm.submit();
        }
      }
      return;
    }
  } catch (e) {
    // Failed to login
    if (e.jqXHR && e.jqXHR.status === 429) {
      this.flash = i18n("login.rate_limit");
      this.flashType = "error";
    } else if (e.jqXHR && e.jqXHR.status === 503 && e.jqXHR.responseJSON.error_type === "read_only") {
      this.flash = i18n("read_only_mode.login_disabled");
      this.flashType = "error";
    } else if (!areCookiesEnabled()) {
      this.flash = i18n("login.cookies_error");
      this.flashType = "error";
    } else {
      this.flash = i18n("login.error");
      this.flashType = "error";
    }
    this.loggingIn = false;
  }
}