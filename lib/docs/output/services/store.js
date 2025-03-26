refreshResults(resultSet, type, url) {
  const adapter = this.adapterFor(type);
  return ajax(url).then(result => {
    const typeName = underscore(this.pluralize(adapter.apiNameFor(type)));
    const content = result[typeName].map(obj => this._hydrate(type, obj, result));
    resultSet.set("content", content);
  });
}

appendResults(resultSet, type, url) {
  const adapter = this.adapterFor(type);
  return ajax(url).then(result => {
    const typeName = underscore(this.pluralize(adapter.apiNameFor(type)));
    let pageTarget = result.meta || result;
    let totalRows = pageTarget["total_rows_" + typeName] || resultSet.get("totalRows");
    let loadMoreUrl = pageTarget["load_more_" + typeName];
    let content = result[typeName].map(obj => this._hydrate(type, obj, result));
    resultSet.setProperties({
      totalRows,
      loadMoreUrl
    });
    resultSet.get("content").pushObjects(content);

    // If we've loaded them all, clear the load more URL
    if (resultSet.get("length") >= totalRows) {
      resultSet.set("loadMoreUrl", null);
    }
  });
}