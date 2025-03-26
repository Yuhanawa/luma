function searchForTerm(term, opts) {
  if (!opts) {
    opts = {};
  }

  // Only include the data we have
  const data = {
    term
  };
  if (opts.typeFilter) {
    data.type_filter = opts.typeFilter;
  }
  if (opts.searchForId) {
    data.search_for_id = true;
  }
  if (opts.restrictToArchetype) {
    data.restrict_to_archetype = opts.restrictToArchetype;
  }
  if (opts.searchContext) {
    data.search_context = {
      type: opts.searchContext.type,
      id: opts.searchContext.id,
      name: opts.searchContext.name
    };
  }
  let ajaxPromise = ajax("/search/query", {
    data
  });
  const promise = ajaxPromise.then(res => translateResults(res, opts));
  promise.abort = ajaxPromise.abort;
  return promise;
}

function logSearchLinkClick(params) {
  if (logSearchLinkClickedCallbacks.length && !logSearchLinkClickedCallbacks.some(fn => fn(params))) {
    // Return early if any callbacks return false
    return;
  }
  ajax("/search/click", {
    type: "POST",
    data: {
      search_log_id: params.searchLogId,
      search_result_id: params.searchResultId,
      search_result_type: params.searchResultType
    }
  });
}