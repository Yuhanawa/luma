model(params) {
  if (PreloadStore.get("invite_info")) {
    return PreloadStore.getAndRemove("invite_info").then(json => deepMerge(params, json));
  } else {
    return ajax(`/invites/${params.token}`).then(json => deepMerge(params, json));
  }
}