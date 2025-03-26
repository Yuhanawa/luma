findAll(store, type, findArgs) {
  return ajax(this.pathFor(store, type, findArgs)).catch(rethrow);
}

find(store, type, findArgs) {
  return ajax(this.pathFor(store, type, findArgs)).catch(rethrow);
}

update(store, type, id, attrs) {
  const data = {};
  const typeField = underscore(this.apiNameFor(type));
  data[typeField] = attrs;
  return ajax(this.pathFor(store, type, id), this.getPayload("PUT", data)).then(function (json) {
    return new Result(json[typeField], json);
  });
}

createRecord(store, type, attrs) {
  const data = {};
  const typeField = underscore(this.apiNameFor(type));
  data[typeField] = attrs;
  return ajax(this.pathFor(store, type), this.getPayload("POST", data)).then(function (json) {
    return new Result(json[typeField], json);
  });
}

destroyRecord(store, type, record) {
  return ajax(this.pathFor(store, type, record.get(this.primaryKey)), {
    type: "DELETE"
  });
}