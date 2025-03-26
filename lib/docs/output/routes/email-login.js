model(params) {
  return ajax(`/session/email-login/${params.token}.json`);
}