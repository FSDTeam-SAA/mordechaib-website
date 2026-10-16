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
