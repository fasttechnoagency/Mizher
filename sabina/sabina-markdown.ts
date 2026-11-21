// Small, safe markdown renderer for Sabina's messages: escapes everything first, then
// allows bold, bullet lists, line breaks and links (internal paths, https, mailto, tel).
const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function inline(s: string): string {
  let out = esc(s);
  out = out.replace(/\[([^\]]{1,120})\]\(([^)\s]{1,300})\)/g, (_m, label: string, url: string) => {
    const u = url.replace(/&amp;/g, "&");
    if (/^\/(?!\/)[\w\-/?=&.%#]*$/.test(u)) return `<a href="${esc(u)}" data-int="1">${label}</a>`;
    if (/^(https:\/\/|mailto:|tel:)/i.test(u))
      return `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    return label;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/__([^_]+)__/g, "<b>$1</b>");
  return out;
}

export function renderMarkdown(md: string): string {
  const lines = String(md).replace(/\r/g, "").split("\n");
  const html: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length)
      html.push(`<ul class="sab-ul">${list.map((l) => `<li>${l}</li>`).join("")}</ul>`);
    list = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    const item = line.match(/^(?:[-•*]|\d+[.)])\s+(.*)$/);
    if (item) {
      list.push(inline(item[1] ?? ""));
      continue;
    }
    flush();
    if (!line) {
      html.push('<span class="sab-gap"></span>');
      continue;
    }
    const h = line.match(/^#{1,4}\s+(.*)$/);
    html.push(
      h
        ? `<b class="sab-h">${inline(h[1] ?? "")}</b>`
        : `<span class="sab-p">${inline(line)}</span>`,
    );
  }
  flush();
  return html.join("");
}
