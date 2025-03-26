model(params) {
  return ajax(`/u/confirm-new-email/${params.token}.json`);
}