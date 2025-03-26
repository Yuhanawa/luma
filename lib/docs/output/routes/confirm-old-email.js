model(params) {
  return ajax(`/u/confirm-old-email/${params.token}.json`);
}