async function getPasskeyCredential(errorCallback, mediation = "optional", isFirefox = false) {
  if (!isWebauthnSupported()) {
    return errorCallback(i18n("login.security_key_support_missing_error"));
  }

  // we need to check isConditionalMediationAvailable for Firefox
  // without it, Firefox will throw console errors
  // We cannot do a general check because iOS Safari and Chrome in Selenium quietly support the feature
  // but they do not support the PublicKeyCredential.isConditionalMediationAvailable() method
  if (mediation === "conditional" && isFirefox) {
    const isCMA = (await PublicKeyCredential.isConditionalMediationAvailable?.()) ?? false;
    if (!isCMA) {
      return;
    }
  }
  try {
    const resp = await ajax("/session/passkey/challenge.json");
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: stringToBuffer(resp.challenge),
        // https://www.w3.org/TR/webauthn-2/#user-verification
        // for passkeys (first factor), user verification should be marked as required
        // it ensures browser requests PIN or biometrics before authenticating
        // lib/discourse_webauthn/authentication_service.rb requires this flag too
        userVerification: "required"
      },
      signal: WebauthnAbortHandler.signal(),
      mediation
    });
    return {
      signature: bufferToBase64(credential.response.signature),
      clientData: bufferToBase64(credential.response.clientDataJSON),
      authenticatorData: bufferToBase64(credential.response.authenticatorData),
      credentialId: bufferToBase64(credential.rawId),
      userHandle: bufferToBase64(credential.response.userHandle)
    };
  } catch (error) {
    if (error.name === "AbortError") {
      // no need to show an error when the cancelling a pending ceremony
      // this happens when switching from the conditional method (username input autofill)
      // to the optional method (login button) or vice versa
      return null;
    }
    if (mediation === "conditional") {
      // The conditional method gets triggered in the background
      // it's not helpful to show errors for it in the UI
      // eslint-disable-next-line no-console
      console.error(error);
      return null;
    }
    if (error.name === "NotAllowedError") {
      return errorCallback(i18n("login.security_key_not_allowed_error"));
    } else if (error.name === "SecurityError") {
      return errorCallback(i18n("login.passkey_security_error", {
        message: error.message
      }));
    } else {
      return errorCallback(error.message);
    }
  }
}