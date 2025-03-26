function fetchUnseenHashtagsInContext(contextualHashtagConfiguration, slugs) {
  return ajax("/hashtags", {
    data: {
      slugs,
      order: contextualHashtagConfiguration
    }
  }).then(response => {
    Object.keys(response).forEach(type => {
      seenHashtags[type] = seenHashtags[type] || {};
      response[type].forEach(item => {
        seenHashtags[type][item.ref] = seenHashtags[type][item.ref] || item;
      });
    });
    slugs.forEach(checkedHashtags.add, checkedHashtags);
  });
}