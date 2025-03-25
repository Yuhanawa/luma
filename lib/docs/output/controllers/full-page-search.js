@bind
_search() {
  if (this.searching) {
    return;
  }
  this.set("invalidSearch", false);
  const searchTerm = this.searchTerm;
  if (!isValidSearchTerm(searchTerm, this.siteSettings)) {
    this.set("invalidSearch", true);
    return;
  }
  let args = {
    q: searchTerm,
    page: this.page
  };
  if (args.page === 1) {
    this.set("bulkSelectEnabled", false);
    this.bulkSelectHelper.selected.clear();
    this.set("searching", true);
    scrollTop();
  } else {
    this.set("loading", true);
  }
  const sortOrder = this.sortOrder;
  if (sortOrder && this.sortOrders[sortOrder].term) {
    args.q += " " + this.sortOrders[sortOrder].term;
  }
  this.set("q", args.q);
  const skip = this.skip_context;
  if (!skip && this.context || skip === "false") {
    args.search_context = {
      type: this.context,
      id: this.context_id
    };
  }
  const searchKey = getSearchKey(args);
  if (this.customSearchType) {
    const customSearch = this.customSearchType["searchFunc"];
    customSearch(this, args, searchKey);
    return;
  }
  switch (this.search_type) {
    case SEARCH_TYPE_CATS_TAGS:
      const categoryTagSearch = searchCategoryTag(searchTerm, this.siteSettings);
      Promise.resolve(categoryTagSearch).then(async results => {
        const categories = results.filter(c => Boolean(c.model));
        const tags = results.filter(c => !c.model);
        const model = (await translateResults({
          categories,
          tags
        })) || {};
        this.set("model", model);
      }).finally(() => {
        this.setProperties({
          searching: false,
          loading: false
        });
      });
      break;
    case SEARCH_TYPE_USERS:
      userSearch({
        term: searchTerm,
        limit: 20
      }).then(async results => {
        const model = (await translateResults({
          users: results
        })) || {};
        this.set("model", model);
      }).finally(() => {
        this.setProperties({
          searching: false,
          loading: false
        });
      });
      break;
    default:
      if (this.currentUser) {
        updateRecentSearches(this.currentUser, searchTerm);
      }
      ajax("/search", {
        data: args
      }).then(async results => {
        const model = (await translateResults(results)) || {};
        if (results.grouped_search_result) {
          this.set("q", results.grouped_search_result.term);
        }
        if (args.page > 1) {
          if (model) {
            this.model.set("posts", this.model.posts.concat(model.posts));
            this.model.set("topics", this.model.topics.concat(model.topics));
            this.model.set("grouped_search_result", results.grouped_search_result);
          }
        } else {
          setTransient("lastSearch", {
            searchKey,
            model
          }, 5);
          model.grouped_search_result = results.grouped_search_result;
          this.set("model", model);
        }
        this.set("error", null);
      }).catch(e => {
        this.set("error", e.jqXHR.responseJSON?.message);
      }).finally(() => {
        this.setProperties({
          searching: false,
          loading: false
        });
        this.appEvents.trigger("search:search_result_view", {
          page: args.page
        });
      });
      break;
  }
}