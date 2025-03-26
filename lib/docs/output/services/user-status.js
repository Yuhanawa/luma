async set(status, pauseNotifications) {
  await ajax({
    url: "/user-status.json",
    type: "PUT",
    data: status
  });
  this.currentUser.set("status", status);
  if (pauseNotifications) {
    this.#enterDoNotDisturb(status.ends_at);
  } else {
    this.#leaveDoNotDisturb();
  }
}

async clear() {
  await ajax({
    url: "/user-status.json",
    type: "DELETE"
  });
  this.currentUser.set("status", null);
  this.#leaveDoNotDisturb();
}