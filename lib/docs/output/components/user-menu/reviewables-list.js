fetchItems() {
  return ajax("/review/user-menu-list").then(data => {
    this.currentUser.updateReviewableCount(data.reviewable_count);
    return data.reviewables.map(item => {
      return new UserMenuReviewableItem({
        reviewable: UserMenuReviewable.create(item),
        currentUser: this.currentUser,
        siteSettings: this.siteSettings,
        site: this.site
      });
    });
  });
}