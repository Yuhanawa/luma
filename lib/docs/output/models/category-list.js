static list(store, parentCategory = null) {
  return PreloadStore.getAndRemove("categories_list", () => {
    const data = {};
    if (parentCategory) {
      data.parent_category_id = parentCategory?.id;
    }
    return ajax("/categories.json", {
      data
    });
  }).then(result => {
    return CategoryList.create({
      store,
      categories: this.categoriesFrom(store, result, parentCategory),
      parentCategory,
      can_create_category: result.category_list.can_create_category,
      can_create_topic: result.category_list.can_create_topic
    });
  });
}

() => {
  const data = {};
  if (parentCategory) {
    data.parent_category_id = parentCategory?.id;
  }
  return ajax("/categories.json", {
    data
  });
}

@bind
async loadMore() {
  if (this.isLoading || this.fetchedLastPage) {
    return;
  }
  this.set("isLoading", true);
  const data = {
    page: this.page + 1
  };
  if (this.parentCategory) {
    data.parent_category_id = this.parentCategory.id;
  }
  const result = await ajax("/categories.json", {
    data
  });
  this.set("page", data.page);
  if (result.category_list.categories.length === 0) {
    this.set("fetchedLastPage", true);
  }
  this.set("isLoading", false);
  CategoryList.categoriesFrom(this.store, result, this.parentCategory).forEach(c => this.categories.pushObject(c));
}