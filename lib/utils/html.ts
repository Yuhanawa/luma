export function getInnerText(html: string): string {
	if (!html) return "";
	return html.replace(/<[^>]*>/g, "").trim();
}
