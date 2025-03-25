static async asyncFindBySlugPath(slugPath, opts = {}) {
  const data = {
    slug_path: slugPath
  };
  if (opts.includePermissions) {
    data.include_permissions = true;
  }
  const result = await ajax("/categories/find", {
    data
  });
  const categories = result["categories"].map(category => {
    category = Site.current().updateCategory(category);
    if (opts.includePermissions) {
      category.setupGroupsAndPermissions();
    }
    return category;
  });
  return categories[categories.length - 1];
}

static async asyncFindBySlugPathWithID(slugPathWithID) {
  const result = await ajax("/categories/find", {
    data: {
      slug_path_with_id: slugPathWithID
    }
  });
  const categories = result["categories"].map(category => Site.current().updateCategory(category));
  return categories[categories.length - 1];
}

static fetchVisibleGroups(id) {
  return ajax(`/c/${id}/visible_groups.json`);
}

static reloadById(id) {
  return ajax(`/c/${id}/show.json`);
}

static reloadBySlugPath(slugPath) {
  return ajax(`/c/${slugPath}/find_by_slug.json`);
}

static async asyncHierarchicalSearch(term, opts) {
  opts ||= {};
  const data = {
    term,
    parent_category_id: opts.parentCategoryId,
    limit: opts.limit,
    only: opts.only,
    except: opts.except,
    page: opts.page,
    offset: opts.offset,
    include_uncategorized: opts.includeUncategorized
  };
  const result = CATEGORY_ASYNC_HIERARCHICAL_SEARCH_CACHE[JSON.stringify(data)] ||= await ajax("/categories/hierarchical_search", {
    method: "GET",
    data
  });
  return result["categories"].map(category => Site.current().updateCategory(category));
}

static async asyncSearch(term, opts) {
  opts ||= {};
  const data = {
    term,
    parent_category_id: opts.parentCategoryId,
    include_uncategorized: opts.includeUncategorized,
    select_category_ids: opts.selectCategoryIds,
    reject_category_ids: opts.rejectCategoryIds,
    include_subcategories: opts.includeSubcategories,
    include_ancestors: opts.includeAncestors,
    prioritized_category_id: opts.prioritizedCategoryId,
    limit: opts.limit,
    page: opts.page
  };
  const result = CATEGORY_ASYNC_SEARCH_CACHE[JSON.stringify(data)] ||= await ajax("/categories/search", {
    method: "POST",
    data
  });
  if (opts.includeAncestors) {
    return {
      ancestors: result["ancestors"].map(category => Site.current().updateCategory(category)),
      categories: result["categories"].map(category => Site.current().updateCategory(category)),
      categoriesCount: result["categories_count"]
    };
  } else {
    return result["categories"].map(category => Site.current().updateCategory(category));
  }
}

save() {
  const id = this.id;
  const url = id ? `/categories/${id}` : "/categories";
  return ajax(url, {
    contentType: "application/json",
    data: JSON.stringify({
      name: this.name,
      slug: this.slug,
      color: this.color,
      text_color: this.text_color,
      secure: this.secure,
      permissions: this._permissionsForUpdate(),
      auto_close_hours: this.auto_close_hours,
      auto_close_based_on_last_post: this.get("auto_close_based_on_last_post"),
      default_slow_mode_seconds: this.default_slow_mode_seconds,
      position: this.position,
      email_in: this.email_in,
      email_in_allow_strangers: this.email_in_allow_strangers,
      mailinglist_mirror: this.mailinglist_mirror,
      parent_category_id: this.parent_category_id,
      uploaded_logo_id: this.get("uploaded_logo.id"),
      uploaded_logo_dark_id: this.get("uploaded_logo_dark.id"),
      uploaded_background_id: this.get("uploaded_background.id"),
      uploaded_background_dark_id: this.get("uploaded_background_dark.id"),
      allow_badges: this.allow_badges,
      category_setting_attributes: this.category_setting,
      custom_fields: this.custom_fields,
      topic_template: this.topic_template,
      form_template_ids: this.form_template_ids,
      all_topics_wiki: this.all_topics_wiki,
      allow_unlimited_owner_edits_on_first_post: this.allow_unlimited_owner_edits_on_first_post,
      allowed_tags: this.allowed_tags,
      allowed_tag_groups: this.allowed_tag_groups,
      allow_global_tags: this.allow_global_tags,
      required_tag_groups: this.required_tag_groups,
      sort_order: this.sort_order,
      sort_ascending: this.sort_ascending,
      topic_featured_link_allowed: this.topic_featured_link_allowed,
      show_subcategory_list: this.show_subcategory_list,
      num_featured_topics: this.num_featured_topics,
      default_view: this.default_view,
      subcategory_list_style: this.subcategory_list_style,
      default_top_period: this.default_top_period,
      minimum_required_tags: this.minimum_required_tags,
      navigate_to_first_post_after_read: this.get("navigate_to_first_post_after_read"),
      search_priority: this.search_priority,
      moderating_group_ids: this.moderating_group_ids,
      read_only_banner: this.read_only_banner,
      default_list_filter: this.default_list_filter
    }),
    type: id ? "PUT" : "POST"
  });
}

destroy() {
  return ajax(`/categories/${this.id || this.slug}`, {
    type: "DELETE"
  });
}

setNotification(notification_level) {
  this.currentUser.set("muted_category_ids", this.currentUser.calculateMutedIds(notification_level, this.id, "muted_category_ids"));
  const url = `/category/${this.id}/notifications`;
  return ajax(url, {
    data: {
      notification_level
    },
    type: "POST"
  }).then(data => {
    this.currentUser.set("indirectly_muted_category_ids", data.indirectly_muted_category_ids);
    this.set("notification_level", notification_level);
    this.notifyPropertyChange("notification_level");
  });
}

async ids => {
  const result = await ajax("/categories/find", {
    data: {
      ids
    }
  });
  return new Map(result["categories"].map(category => [category.id, category]));
}