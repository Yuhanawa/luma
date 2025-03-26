static async _load() {
  const data = HashtagTypeBase.loadingIds;
  HashtagTypeBase.loadingIds = {};
  let hasData = false;
  Object.keys(data).forEach(type => {
    hasData ||= data[type].size > 0;
    data[type] = [...data[type]]; // Set to Array
  });
  if (!hasData) {
    return;
  }
  const hashtags = await ajax("/hashtags/by-ids", {
    data
  });
  const typeClasses = getHashtagTypeClasses();
  Object.entries(typeClasses).forEach(([type, typeClass]) => hashtags[type]?.forEach(hashtag => typeClass.onLoad(hashtag)));
}