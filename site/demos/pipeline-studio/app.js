const bookmarks = [
  {
    id: "workers-sdk",
    repo: "cloudflare/workers-sdk",
    title: "Wrangler & Workers tooling",
    why: "The Pages preview step is the product.",
  },
  {
    id: "astro",
    repo: "withastro/astro",
    title: "Content-first static sites",
    why: "A gallery host should feel like a magazine, not a dashboard.",
  },
  {
    id: "excalidraw",
    repo: "excalidraw/excalidraw",
    title: "Whiteboard in the browser",
    why: "Interaction first. Screenshot later.",
  },
  {
    id: "zustand",
    repo: "pmndrs/zustand",
    title: "Small client state",
    why: "A daily demo should stay tiny and clickable.",
  },
];

const tones = {
  editorial: "Fraunces headlines, cream paper, masthead rules",
  studio: "Warm dark panels, mono console, amber ticks",
  playful: "Big type, springy controls, one loud accent",
};

const stages = ["bookmark", "project", "agent", "preview", "morning"];

const els = {
  bookmarks: document.querySelector("[data-bookmarks]"),
  dispatch: document.querySelector("[data-dispatch]"),
  hint: document.querySelector("[data-hint]"),
  tone: document.querySelector("[data-tone]"),
  console: document.querySelector("[data-console]"),
  consoleMeta: document.querySelector("[data-console-meta]"),
  card: document.querySelector("[data-card]"),
  link: document.querySelector("[data-link]"),
  copy: document.querySelector("[data-copy]"),
  reset: document.querySelector("[data-reset]"),
  steps: [...document.querySelectorAll("[data-step]")],
};

let selected = null;
let timer = 0;
let running = false;

function renderBookmarks() {
  els.bookmarks.innerHTML = bookmarks
    .map(
      (item) => `
        <button type="button" class="bookmark${selected?.id === item.id ? " is-selected" : ""}" data-id="${item.id}">
          <small>${item.repo}</small>
          <strong>${item.title}</strong>
        </button>
      `,
    )
    .join("");
}

function setStage(name) {
  const index = stages.indexOf(name);
  els.steps.forEach((step, i) => {
    step.classList.toggle("is-current", i === index);
    step.classList.toggle("is-done", i < index);
  });
}

function log(line) {
  els.console.textContent += `${line}\n`;
  els.console.scrollTop = els.console.scrollHeight;
}

function sleep(ms) {
  return new Promise((resolve) => {
    timer = window.setTimeout(resolve, ms);
  });
}

function todayStamp() {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function previewUrl(slug) {
  return `https://daily-${todayStamp()}-${slug}.daily-demos.pages.dev`;
}

function renderCard(project, slug, url) {
  els.card.innerHTML = `
    <div class="status">Ready for breakfast</div>
    <h3>${project.title}</h3>
    <p>${project.why}</p>
    <p class="url">${url}</p>
    <p class="muted">Branch <code>daily/${todayStamp()}-${slug}</code> · folder <code>site/demos/${slug}/</code></p>
  `;
  els.link.value = url;
  els.copy.disabled = false;
}

async function runPipeline() {
  if (!selected || running) return;
  running = true;
  els.dispatch.disabled = true;
  els.console.textContent = "";
  const slug = selected.id;
  const tone = els.tone.value;
  const url = previewUrl(slug);

  const beats = [
    ["bookmark", "Pulled overnight X bookmarks."],
    ["project", `Selected ${selected.repo}.`],
    ["project", `Note: ${selected.why}`],
    ["agent", `Opened branch daily/${todayStamp()}-${slug}.`],
    ["agent", `Wrote site/demos/${slug}/ with tone “${tones[tone]}”.`],
    ["agent", "Updated site/catalog.json (newest first)."],
    ["agent", "npm run build → dist/ index + demo routes."],
    ["preview", "Cloudflare Pages preview deployment started."],
    ["preview", `Minted ${url}`],
    ["morning", "Morning link is the preview URL. Production stays on main."],
  ];

  for (const [stage, line] of beats) {
    setStage(stage);
    els.consoleMeta.textContent = `${stage} · ${selected.repo}`;
    log(`$ ${line}`);
    await sleep(420);
  }

  renderCard(selected, slug, url);
  els.hint.textContent = "Copy the morning link, or reset and run another bookmark.";
  running = false;
}

function reset() {
  window.clearTimeout(timer);
  running = false;
  selected = null;
  els.console.textContent = "idle\nready for a bookmark";
  els.consoleMeta.textContent = "Idle · waiting for a project";
  els.card.innerHTML = `<p class="muted">Nothing printed yet.</p>`;
  els.link.value = "";
  els.copy.disabled = true;
  els.dispatch.disabled = true;
  els.hint.textContent = "Pick a bookmark to arm the agent.";
  setStage("bookmark");
  renderBookmarks();
}

els.bookmarks.addEventListener("click", (event) => {
  const button = event.target.closest("[data-id]");
  if (!button || running) return;
  selected = bookmarks.find((item) => item.id === button.dataset.id) || null;
  renderBookmarks();
  els.dispatch.disabled = !selected;
  els.hint.textContent = selected
    ? `${selected.repo} armed. Dispatch whenever you like.`
    : "Pick a bookmark to arm the agent.";
  setStage("project");
});

els.dispatch.addEventListener("click", () => {
  runPipeline().catch((error) => {
    log(`! ${error.message}`);
    running = false;
    els.dispatch.disabled = !selected;
  });
});

els.copy.addEventListener("click", async () => {
  if (!els.link.value) return;
  try {
    await navigator.clipboard.writeText(els.link.value);
    els.copy.textContent = "Copied";
    window.setTimeout(() => {
      els.copy.textContent = "Copy";
    }, 1200);
  } catch {
    els.link.select();
  }
});

els.reset.addEventListener("click", reset);

reset();
