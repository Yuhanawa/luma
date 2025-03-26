function _searchRequest(term, contextualHashtagConfiguration, resultFunc) {
  currentSearch = ajax("/hashtags/search.json", {
    data: {
      term,
      order: contextualHashtagConfiguration
    }
  });
  currentSearch.then(response => {
    response.results?.forEach(result => {
      // Convert :emoji: in the result text to HTML safely.
      result.text = htmlSafe(emojiUnescape(escapeExpression(result.text)));
      const hashtagType = getHashtagTypeClassesNew()[result.type];
      result.icon = hashtagType.generateIconHTML({
        preloaded: true,
        colors: result.colors,
        icon: result.icon,
        id: result.id
      });
    });
    resultFunc(response.results || CANCELLED_STATUS);
  }).finally(() => {
    currentSearch = null;
  });
  return currentSearch;
}