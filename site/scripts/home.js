const grid = document.querySelector("[data-demo-grid]");
const count = document.querySelector("[data-demo-count]");

function card(demo) {
  const tags = (demo.tags || [])
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join("");

  return `
    <a class="card" href="./demos/${encodeURIComponent(demo.slug)}/">
      <div class="card-date">${escapeHtml(demo.date || "")}</div>
      <h3>${escapeHtml(demo.title)}</h3>
      <p>${escapeHtml(demo.summary || "")}</p>
      <div class="tags">${tags}</div>
    </a>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

try {
  const response = await fetch("./catalog.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`catalog ${response.status}`);
  const catalog = await response.json();
  const demos = Array.isArray(catalog.demos) ? catalog.demos : [];

  if (count) {
    count.textContent = demos.length === 1 ? "1 demo" : `${demos.length} demos`;
  }

  if (!demos.length) {
    grid.innerHTML = `<div class="empty">The catalog is empty. See AGENTS.md to add the first day.</div>`;
  } else {
    grid.innerHTML = demos.map(card).join("");
  }
} catch (error) {
  grid.innerHTML = `<div class="error">Could not load catalog.json. ${escapeHtml(error.message)}</div>`;
}
