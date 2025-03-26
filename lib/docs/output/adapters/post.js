createRecord(store, type, args) {
  const typeField = underscore(type);
  args.nested_post = true;
  return ajax(this.pathFor(store, type), {
    type: "POST",
    data: args
  }).then(function (json) {
    return new Result(json[typeField], json);
  });
}