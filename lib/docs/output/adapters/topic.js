find(store, type, findArgs) {
  if (findArgs.similar) {
    return ajax("/topics/similar_to", {
      data: findArgs.similar
    });
  } else {
    return super.find(store, type, findArgs);
  }
}