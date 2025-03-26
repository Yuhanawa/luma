model(params) {
  return ajax("/directory-columns.json").then(response => {
    params.order = params.order || response.directory_columns[0]?.name || "likes_received";
    return {
      params,
      columns: response.directory_columns
    };
  }).catch(popupAjaxError);
}