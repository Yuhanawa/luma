model(params) {
  const cached = getTransient("lastSearch");
  let args = {
    q: params.q
  };
  if (params.context_id && !args.skip_context) {
    args.search_context = {
      type: params.context,
      id: params.context_id
    };
  }
  const searchKey = getSearchKey(args);
  if (cached && cached.data.searchKey === searchKey) {
    // extend expiry
    setTransient("lastSearch", {
      searchKey,
      model: cached.data.model
    }, 5);
    return cached.data.model;
  }
  return PreloadStore.getAndRemove("search", () => {
    if (isValidSearchTerm(params.q, this.siteSettings)) {
      return ajax("/search", {
        data: args
      });
    } else {
      return null;
    }
  }).then(async results => {
    const model = results && (await translateResults(results)) || {};
    setTransient("lastSearch", {
      searchKey,
      model
    }, 5);
    return model;
  });
}

() => {
  if (isValidSearchTerm(params.q, this.siteSettings)) {
    return ajax("/search", {
      data: args
    });
  } else {
    return null;
  }
}