import createDOMPurify from "dompurify";

export function sanitizeHtml(value: string) {
  if (typeof window === "undefined") {
    return value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[character];
    });
  }

  const DOMPurify = createDOMPurify(window);

  return DOMPurify.sanitize(value, { USE_PROFILES: { html: true } });
}

/**
 * Produces a compact, safe text preview for surfaces such as a conversation
 * list. Full assistant messages should use sanitizeHtml() and render rich
 * content; previews should never expose their source HTML.
 */
export function htmlToPlainText(value: string) {
  if (typeof window === "undefined") {
    return value
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  const template = document.createElement("template");
  template.innerHTML = sanitizeHtml(value);
  return (template.content.textContent || "").replace(/\s+/g, " ").trim();
}
