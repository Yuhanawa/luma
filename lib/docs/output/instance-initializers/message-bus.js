function mbAjax(messageBus, opts) {
  opts.headers ||= {};
  if (messageBus.baseUrl !== "/") {
    const key = document.querySelector("meta[name=shared_session_key]")?.content;
    opts.headers["X-Shared-Session-Key"] = key;
  }
  if (userPresent()) {
    opts.headers["Discourse-Present"] = "true";
  }
  if (_sendDeferredPageview) {
    opts.headers["Discourse-Deferred-Track-View"] = "true";
    if (_deferredViewTopicId) {
      opts.headers["Discourse-Deferred-Track-View-Topic-Id"] = _deferredViewTopicId;
    }
    _sendDeferredPageview = false;
    _deferredViewTopicId = null;
  }
  const oldComplete = opts.complete;
  opts.complete = function (xhr, stat) {
    handleLogoff(xhr);
    oldComplete?.(xhr, stat);
  };
  return $.ajax(opts);
}