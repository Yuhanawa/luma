function reportToLogster(name, error) {
  const data = {
    message: `${name} theme/component is throwing errors:\n${error.name}: ${error.message}`,
    stacktrace: error.stack
  };

  // TODO: To be moved out into a logster-provided lib
  $.ajax(getURL("/logs/report_js_error"), {
    data,
    type: "POST"
  });
}