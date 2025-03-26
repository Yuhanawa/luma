async function loadEmojiSearchAliases() {
  searchAliasesPromise ??= ajax("/emojis/search-aliases.json");
  return await searchAliasesPromise;
}