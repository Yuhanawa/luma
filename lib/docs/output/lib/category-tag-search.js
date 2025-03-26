function searchFunc(q, limit, cats, resultFunc) {
  oldSearch = ajax("/tags/filter/search", {
    data: {
      limit,
      q
    }
  });
  let returnVal = CANCELLED_STATUS;
  oldSearch.then(r => {
    const categoryNames = cats.map(c => c.model.get("name"));
    const tags = r.results.map(tag => {
      tag.text = categoryNames.includes(tag.text) ? `${tag.text}${TAG_HASHTAG_POSTFIX}` : tag.text;
      return tag;
    });
    returnVal = cats.concat(tags);
  }).finally(() => {
    oldSearch = null;
    resultFunc(returnVal);
  });
}