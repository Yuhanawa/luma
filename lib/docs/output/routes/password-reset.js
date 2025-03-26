afterModel(model) {
  // confirm token here so email clients who crawl URLs don't invalidate the link
  if (model) {
    return ajax({
      url: userPath(`confirm-email-token/${model.token}.json`),
      dataType: "json"
    });
  }
}