model() {
  let group = this.modelFor("group");
  return ajax(`/g/${group.name}/permissions`).then(permissions => {
    permissions.forEach(permission => {
      permission.description = buildPermissionDescription(permission.permission_type);
    });
    return {
      permissions
    };
  }).catch(() => {
    this.router.transitionTo("group.members", group);
  });
}