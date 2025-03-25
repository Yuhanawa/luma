static async findAll() {
  const result = await ajax("/form-templates.json");
  return result.form_templates;
}

static async findById(id) {
  return await ajax(`/form-templates/${id}.json`);
}