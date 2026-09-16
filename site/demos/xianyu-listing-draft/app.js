const STORAGE_KEY = "daily-demos:xianyu-listing-draft:checks";

const examples = {
  kaoyan: {
    title: "考研英语近十年真题精讲（PDF+音频）",
    price: "19.9",
    category: "学习资料 / 电子书",
    link: "https://pan.baidu.com/s/demo-kaoyan-2026",
    points: "近十年真题 PDF 可检索\n含听力音频与答案解析\n买后网盘秒发，手机也能看",
    aftersale: "链接失效 24 小时内重发。虚拟商品发出后不退款。",
  },
  prompts: {
    title: "Midjourney 商业提示词 120 条（可复制）",
    price: "29",
    category: "设计素材 / 提示词",
    link: "https://pan.baidu.com/s/demo-prompts",
    points: "按电商 / 海报 / 人像分好类\n每条可直接粘贴使用\n附一份负面提示词清单",
    aftersale: "更新一次免费同步到网盘。不提供代出图。",
  },
  excel: {
    title: "店铺日常运营 Excel 模板 18 套",
    price: "12",
    category: "效率工具 / 表格",
    link: "https://pan.baidu.com/s/demo-excel-kit",
    points: "含进销存、对账、选品表\nWPS / Excel 都能打开\n每张表带填写说明",
    aftersale: "打不开先试 WPS。不包代做表。",
  },
};

const steps = [
  {
    id: "share",
    label: "准备网盘分享",
    detail: "设有效期和提取码。这里的链接可以先用占位。",
  },
  {
    id: "title",
    label: "写标题与定价",
    detail: "标题带品类词，价格和资料体量对得上。",
  },
  {
    id: "copy",
    label: "核对卖点与售后",
    detail: "卖点能扫读；售后写清重发和不退。",
  },
  {
    id: "preview",
    label: "闲鱼上架预览",
    detail: "只预览，不点发布。本工具不打开闲鱼。",
  },
  {
    id: "mcp",
    label: "MCP 触发假跑",
    detail: "本地勾选即完成。不会调用闲鱼或百度 MCP。",
  },
  {
    id: "ship",
    label: "决定是否真发",
    detail: "链接能打开、文案无敏感词后再上真实店铺。",
  },
];

const form = document.querySelector("[data-form]");
const errorEl = document.querySelector("[data-error]");
const listingEl = document.querySelector("[data-listing]");
const metaEl = document.querySelector("[data-result-meta]");
const copyBtn = document.querySelector("[data-copy]");
const checksEl = document.querySelector("[data-checks]");
const resetBtn = document.querySelector("[data-reset-checks]");

let listingText = "";
let copyResetTimer = 0;

function loadChecks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveChecks(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "";
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "") || "0";
}

function splitPoints(raw) {
  return String(raw)
    .split(/\r?\n|[；;]+/)
    .map((line) => line.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);
}

function buildListing(data) {
  const points = splitPoints(data.points)
    .map((line) => `• ${line}`)
    .join("\n");
  const aftersale = data.aftersale.trim();
  const price = formatPrice(data.price);

  return [
    `【${data.title.trim()}】`,
    `¥${price} · 虚拟产品 · ${data.category.trim()}`,
    "",
    "卖点",
    points || "• （补充一条能扫读的卖点）",
    "",
    "网盘链接（占位，未请求百度网盘）",
    data.link.trim(),
    "",
    aftersale ? `售后\n${aftersale}` : "售后\n（未填写。建议写清失效重发与是否退款。）",
    "",
    "— 由本地草稿器生成，未上架、未调用 MCP —",
  ].join("\n");
}

function readForm() {
  const data = Object.fromEntries(new FormData(form));
  return {
    title: String(data.title || ""),
    price: String(data.price || ""),
    category: String(data.category || ""),
    link: String(data.link || ""),
    points: String(data.points || ""),
    aftersale: String(data.aftersale || ""),
  };
}

function fillForm(preset, exampleId) {
  for (const [name, value] of Object.entries(preset)) {
    const field = form.elements.namedItem(name);
    if (field) field.value = value;
  }
  document.querySelectorAll("[data-example]").forEach((chip) => {
    chip.classList.toggle("is-on", chip.dataset.example === exampleId);
  });
  errorEl.hidden = true;
}

function renderChecks() {
  const state = loadChecks();
  const done = steps.filter((step) => state[step.id]).length;
  checksEl.innerHTML = steps
    .map(
      (step) => `
        <li class="${state[step.id] ? "is-done" : ""}">
          <input type="checkbox" id="check-${step.id}" data-check="${step.id}" ${state[step.id] ? "checked" : ""} />
          <label for="check-${step.id}">
            <strong>${step.label}</strong>
            <small>${step.detail}</small>
          </label>
        </li>
      `,
    )
    .join("");
  if (listingText) {
    metaEl.textContent = `文案已生成 · 清单 ${done}/${steps.length}`;
  }
}

function showListing(text) {
  listingText = text;
  listingEl.textContent = text;
  listingEl.classList.add("has-copy");
  copyBtn.disabled = false;
  copyBtn.classList.remove("is-copied");
  copyBtn.textContent = "复制文案";
  renderChecks();
}

function validate(data) {
  const price = Number(data.price);
  if (!data.title.trim()) return "先写商品标题。";
  if (data.price.trim() === "" || !Number.isFinite(price) || price < 0) {
    return "价格需要是 ≥ 0 的数字。";
  }
  if (!data.category.trim()) return "补一个品类或标签。";
  if (!data.link.trim()) return "网盘链接可以先填占位。";
  if (!splitPoints(data.points).length) return "至少写一条卖点。";
  return "";
}

document.querySelectorAll("[data-example]").forEach((chip) => {
  chip.addEventListener("click", () => {
    const preset = examples[chip.dataset.example];
    if (preset) fillForm(preset, chip.dataset.example);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = readForm();
  const message = validate(data);
  if (message) {
    errorEl.hidden = false;
    errorEl.textContent = message;
    copyBtn.disabled = true;
    return;
  }
  errorEl.hidden = true;
  showListing(buildListing(data));
  listingEl.focus({ preventScroll: true });
  listingEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

async function copyListing(text) {
  if (navigator.clipboard?.writeText) {
    const write = navigator.clipboard.writeText(text);
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("clipboard-timeout")), 350);
    });
    await Promise.race([write, timeout]);
    return;
  }
  throw new Error("no-clipboard");
}

copyBtn.addEventListener("click", async () => {
  if (!listingText || copyBtn.disabled) return;
  copyBtn.textContent = "已复制";
  copyBtn.classList.add("is-copied");
  try {
    await copyListing(listingText);
  } catch {
    fallbackCopy(listingText);
  }
  window.clearTimeout(copyResetTimer);
  copyResetTimer = window.setTimeout(() => {
    copyBtn.textContent = "复制文案";
    copyBtn.classList.remove("is-copied");
  }, 2400);
});

checksEl.addEventListener("change", (event) => {
  const box = event.target.closest("[data-check]");
  if (!box) return;
  const state = loadChecks();
  state[box.dataset.check] = box.checked;
  saveChecks(state);
  renderChecks();
});

resetBtn.addEventListener("click", () => {
  saveChecks({});
  renderChecks();
});

renderChecks();
