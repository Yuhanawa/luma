function exportEntityByType(type, entity, args) {
  return ajax("/export_csv/export_entity.json", {
    type: "POST",
    data: {
      entity,
      args
    }
  });
}