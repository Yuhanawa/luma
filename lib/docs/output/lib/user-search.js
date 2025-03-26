function performSearch(term, topicId, categoryId, includeGroups, includeMentionableGroups, includeMessageableGroups, customUserSearchOptions, allowedUsers, groupMembersOf, includeStagedUsers, lastSeenUsers, limit, resultsFn) {
  let cached = cache[term];
  if (cached) {
    resultsFn(cached);
    return;
  }
  const eagerComplete = eagerCompleteSearch(term, topicId || categoryId);
  if (term === "" && !eagerComplete && !lastSeenUsers) {
    // The server returns no results in this case, so no point checking
    // do not return empty list, because autocomplete will get terminated
    resultsFn(CANCELLED_STATUS);
    return;
  }
  let data = {
    term,
    topic_id: topicId,
    category_id: categoryId,
    include_groups: includeGroups,
    include_mentionable_groups: includeMentionableGroups,
    include_messageable_groups: includeMessageableGroups,
    groups: groupMembersOf,
    topic_allowed_users: allowedUsers,
    include_staged_users: includeStagedUsers,
    last_seen_users: lastSeenUsers,
    limit
  };
  if (customUserSearchOptions) {
    Object.keys(customUserSearchOptions).forEach(key => {
      data[camelCaseToSnakeCase(key)] = customUserSearchOptions[key];
    });
  }

  // need to be able to cancel this
  oldSearch = ajax(userPath("search/users"), {
    data
  });
  let returnVal = CANCELLED_STATUS;
  oldSearch.then(function (r) {
    const hasResults = !!(r.users && r.users.length || r.groups && r.groups.length || r.emails && r.emails.length);
    if (eagerComplete && !hasResults) {
      // we are trying to eager load, but received no results
      // do not return empty list, because autocomplete will get terminated
      r = CANCELLED_STATUS;
    }
    cache[term] = r;
    cacheTime = new Date();
    // If there is a newer search term, return null
    if (term === currentTerm) {
      returnVal = r;
    }
  }).finally(function () {
    oldSearch = null;
    resultsFn(returnVal);
  });
}