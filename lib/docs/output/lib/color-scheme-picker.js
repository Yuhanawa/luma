function loadColorSchemeStylesheet(colorSchemeId, theme_id, darkMode = false) {
  const themeId = theme_id ? `/${theme_id}` : "";
  return ajax(`/color-scheme-stylesheet/${colorSchemeId}${themeId}.json`).then(result => {
    if (result && result.new_href) {
      const elementId = darkMode ? "cs-preview-dark" : "cs-preview-light";
      const existingElement = document.querySelector(`link#${elementId}`);
      if (existingElement) {
        existingElement.href = result.new_href;
      } else {
        let link = document.createElement("link");
        link.href = result.new_href;
        link.media = darkMode ? "(prefers-color-scheme: dark)" : "(prefers-color-scheme: light)";
        link.rel = "stylesheet";
        link.id = elementId;
        document.body.appendChild(link);
      }
      if (!darkMode) {
        discourseLater(() => {
          const schemeType = getComputedStyle(document.body).getPropertyValue("--scheme-type");
          Session.currentProp("defaultColorSchemeIsDark", schemeType.trim() === "dark");
        }, 500);
      }
    }
  });
}