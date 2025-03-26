static async load() {
  return Wizard.parse((await ajax({
    url: "/wizard.json"
  })).wizard);
}

async save() {
  try {
    return await ajax({
      url: `/wizard/steps/${this.id}`,
      type: "PUT",
      data: {
        fields: this.serialize()
      }
    });
  } catch (error) {
    for (let err of error.jqXHR.responseJSON.errors) {
      this.fieldError(err.field, err.description);
    }
  }
}