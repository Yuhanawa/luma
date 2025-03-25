@action
revokeAuthToken(token, event) {
  event?.preventDefault();
  ajax(userPath(`${this.get("model.username_lower")}/preferences/revoke-auth-token`), {
    type: "POST",
    data: token ? {
      token_id: token.id
    } : {}
  }).then(() => {
    if (!token) {
      logout();
    } // All sessions revoked
  }).catch(popupAjaxError);
}