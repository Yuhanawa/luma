@bind
reorder() {
  return ajax(`/sidebar_sections/reorder`, {
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      sidebar_section_id: this.section.id,
      links_order: this.links.map(link => link.id)
    })
  });
}