const SAMPLES = {
  login: {
    label: "填表登录",
    text: `打开登录页
点击邮箱输入框
输入账号和密码
如果出现验证码，看图识别后再填入
点击登录按钮
确认是否已经进入首页`,
  },
  dashboard: {
    label: "扫一遍仪表盘",
    text: `打开运营仪表盘
滚动到收入卡片
切换到「本周」
扫一眼有没有异常指标
点进异常的那张图
读图判断是不是数据缺口`,
  },
  compare: {
    label: "对比两个商品页",
    text: `打开商品 A 的页面
记下价格、规格和评价要点
新开标签打开商品 B
切换回商品 A 对照价格和运费
滚动到详情参数表
总结该买哪一个`,
  },
};

const KIND_LABEL = {
  click: "点击",
  scroll: "滚动",
  switch: "切换",
  jump: "跳转",
  type: "输入",
  vision: "看图",
  reason: "思考",
  unsure: "待定",
};

const OWNER_LABEL = {
  action: "动作 agent",
  think: "思考·输入·看图",
};

const RULES = [
  {
    owner: "think",
    kind: "vision",
    score: 4,
    re: /看图|识图|读图|截图|验证码|图像识别|视觉|辨认|看屏幕|扫一眼|看一眼|OCR|ocr/i,
  },
  {
    owner: "think",
    kind: "type",
    score: 4,
    re: /输入(?!框|栏|区|口)|填写|填入|键入|打字|粘贴|写入/,
  },
  {
    owner: "think",
    kind: "reason",
    score: 3,
    re: /判断|分析|对比|比较|对照|总结|决定|理解|记下|记录|提取|阅读|核对|该买|是不是|是否|为什么|怎么|有没有|确认(?!按钮)/,
  },
  {
    owner: "action",
    kind: "click",
    score: 4,
    re: /点击|点一下|点开|点进|单击|双击|右键|勾选|取消勾选|关掉|开启|拖拽|拖到|悬停/,
  },
  {
    owner: "action",
    kind: "scroll",
    score: 3,
    re: /滚动|下滑|上滑|滚到|滑到|翻到|翻页|拉到底|拉到/,
  },
  {
    owner: "action",
    kind: "switch",
    score: 3,
    re: /切换|切到|换到|选项卡|标签页/,
  },
  {
    owner: "action",
    kind: "jump",
    score: 2,
    re: /打开|进入|前往|访问|跳转|导航|新开|回到|返回|后退|关闭|刷新/,
  },
];

const KIND_PRIORITY = ["vision", "type", "reason", "click", "scroll", "switch", "jump"];
const MAX_STEPS = 30;
const CLAUSE_VERB =
  /^(?:然后|再|接着|并)?(?:打开|点击|点进|点开|输入|填写|填入|滚动|下滑|上滑|切换|切到|进入|前往|访问|跳转|新开|回到|返回|关闭|刷新|看图|确认|记下|记录|总结|对比|比较|对照|阅读|判断|核对|提取|观察|勾选|关掉|开启)/;

const state = {
  source: "",
  steps: [],
  sampleId: "",
};

export function parseTask(raw) {
  const text = String(raw || "")
    .replace(/\u00a0/g, " ")
    .replace(/^\uFEFF/, "")
    .trim();
  if (!text) return [];

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parts = lines.length > 1 ? lines.map(stripMarker).filter(Boolean) : splitParagraph(lines[0]);
  return parts.slice(0, MAX_STEPS).map((sentence) => {
    const guess = classify(sentence);
    return {
      text: sentence,
      owner: guess.owner,
      suggested: guess.owner,
      kind: guess.kind,
      hit: guess.hit,
      also: guess.also,
      overridden: false,
    };
  });
}

export function formatPlan(source, steps) {
  const actionCount = steps.filter((step) => step.owner === "action").length;
  const thinkCount = steps.length - actionCount;
  const lines = [
    "浏览器任务拆分计划",
    "",
    "角色",
    "- 动作 agent：点击、跳转、切换、滚动",
    "- 思考·输入·看图：输入、看图、判断",
    "",
    `共 ${steps.length} 步 · 动作 ${actionCount} · 思考 ${thinkCount}`,
    "",
    "原任务",
    source.trim(),
    "",
    "步骤",
  ];

  steps.forEach((step, index) => {
    const owner = OWNER_LABEL[step.owner];
    const kind = step.overridden ? "" : `·${KIND_LABEL[step.kind] || "待定"}`;
    const edited = step.overridden ? "（已手改）" : "";
    lines.push(`${index + 1}. [${owner}${kind}]${edited} ${step.text}`);
  });

  lines.push("", "交接");
  handoffBlocks(steps).forEach((block, index) => {
    const owner = OWNER_LABEL[block.owner];
    const preview = block.items.map((step) => step.text).join(" → ");
    lines.push(`${index + 1}. ${owner} ×${block.items.length}：${preview}`);
  });

  lines.push("", "本地关键词规则生成，未调用模型，也没有外发。");
  return lines.join("\n");
}

export function handoffBlocks(steps) {
  const blocks = [];
  for (const step of steps) {
    const last = blocks[blocks.length - 1];
    if (!last || last.owner !== step.owner) {
      blocks.push({ owner: step.owner, items: [step] });
    } else {
      last.items.push(step);
    }
  }
  return blocks;
}

function stripMarker(line) {
  return line.replace(/^\s*(?:[-*•·]+|\d+\s*[.、．)）\]】]|[（(]\d+[）)])\s*/, "").trim();
}

function splitParagraph(paragraph) {
  const chunks = paragraph
    .split(/(?<=[。！？；;!?])\s*/u)
    .map((part) => part.replace(/[。！？；;!?]+$/u, "").trim())
    .filter(Boolean);
  const base = chunks.length ? chunks : [paragraph];
  const steps = [];
  for (const chunk of base) {
    const stripped = stripMarker(chunk);
    if (!stripped) continue;
    steps.push(...maybeSplitClauses(stripped));
  }
  return steps;
}

function maybeSplitClauses(sentence) {
  const parts = sentence
    .split(/[，,]/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2 || parts.length > 6) return [sentence];
  if (parts.every((part) => CLAUSE_VERB.test(part))) return parts;
  return [sentence];
}

function classify(text) {
  const hits = RULES.map((rule) => {
    const match = text.match(rule.re);
    return match ? { ...rule, hit: match[0] } : null;
  }).filter(Boolean);

  if (!hits.length) {
    return { owner: "think", kind: "unsure", hit: null, also: null };
  }

  const score = { action: 0, think: 0 };
  for (const hit of hits) score[hit.owner] += hit.score;

  const owner = score.action > score.think ? "action" : "think";
  const ownHits = hits
    .filter((hit) => hit.owner === owner)
    .sort(
      (a, b) =>
        KIND_PRIORITY.indexOf(a.kind) - KIND_PRIORITY.indexOf(b.kind) || b.score - a.score,
    );
  const best = ownHits[0];
  const other = hits.find((hit) => hit.owner !== owner);

  return {
    owner,
    kind: best.kind,
    hit: best.hit,
    also: other ? `${KIND_LABEL[other.kind]}「${other.hit}」` : null,
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function boot() {
  const form = document.querySelector("#task-form");
  const taskEl = document.querySelector("#task");
  const hintEl = document.querySelector("#form-hint");
  const resultEl = document.querySelector("#result");
  const metaEl = document.querySelector("#result-meta");
  const stepsEl = document.querySelector("#steps");
  const blocksEl = document.querySelector("#blocks");
  const planEl = document.querySelector("#plan");
  const staleEl = document.querySelector("#stale");
  const copyBtn = document.querySelector("#btn-copy");
  const toastEl = document.querySelector("#toast");
  let toastTimer = 0;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    generate(taskEl.value, state.sampleId);
  });

  form.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sample]");
    if (!button) return;
    const sample = SAMPLES[button.dataset.sample];
    if (!sample) return;
    taskEl.value = sample.text;
    taskEl.removeAttribute("aria-invalid");
    hintEl.textContent = "";
    generate(sample.text, button.dataset.sample);
  });

  taskEl.addEventListener("input", () => {
    if (state.sampleId && taskEl.value !== SAMPLES[state.sampleId]?.text) {
      state.sampleId = "";
      markSample("");
    }
    taskEl.removeAttribute("aria-invalid");
    if (hintEl.textContent) hintEl.textContent = "";
    staleEl.hidden = !state.steps.length || taskEl.value.trim() === state.source.trim();
  });

  stepsEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-set]");
    if (!button) return;
    const item = button.closest("[data-index]");
    const index = Number(item?.dataset.index);
    const step = state.steps[index];
    if (!step) return;
    step.owner = button.dataset.set === "action" ? "action" : "think";
    step.overridden = step.owner !== step.suggested;
    render();
    document.querySelector(`[data-index="${index}"] [data-set="${step.owner}"]`)?.focus();
  });

  copyBtn.addEventListener("click", async () => {
    const text = planEl.textContent || "";
    if (!text) return;
    const ok = await copyText(text);
    copyBtn.classList.toggle("is-copied", ok);
    copyBtn.textContent = ok ? "已复制" : "复制失败";
    showToast(ok ? "已复制计划" : "复制失败，请在下方文本里手动选择");
    window.setTimeout(() => {
      copyBtn.classList.remove("is-copied");
      copyBtn.textContent = "复制计划";
    }, 1600);
  });

  function generate(raw, sampleId) {
    const steps = parseTask(raw);
    if (!steps.length) {
      taskEl.setAttribute("aria-invalid", "true");
      hintEl.textContent = "先贴一段任务，或点一个示例。";
      taskEl.focus();
      return;
    }

    state.source = raw.trim();
    state.steps = steps;
    state.sampleId = sampleId || "";
    markSample(state.sampleId);
    hintEl.textContent = "";
    taskEl.removeAttribute("aria-invalid");
    staleEl.hidden = true;
    render();
    resultEl.hidden = false;
    if (steps.length === MAX_STEPS) {
      hintEl.textContent = `只拆了前 ${MAX_STEPS} 步。`;
    }
    resultEl.scrollIntoView({ block: "nearest" });
  }

  function render() {
    const actionCount = state.steps.filter((step) => step.owner === "action").length;
    const thinkCount = state.steps.length - actionCount;
    metaEl.textContent = `${state.steps.length} 步 · 动作 ${actionCount} · 思考·输入·看图 ${thinkCount}`;

    stepsEl.innerHTML = state.steps
      .map((step, index) => {
        const why = describe(step);
        return `
          <li class="step" data-owner="${step.owner}" data-index="${index}">
            <span class="idx">${index + 1}</span>
            <p class="step-text">${escapeHtml(step.text)}</p>
            <div class="seg" role="group" aria-label="第 ${index + 1} 步归属">
              <button type="button" data-set="action" aria-pressed="${step.owner === "action"}">动作 agent</button>
              <button type="button" data-set="think" aria-pressed="${step.owner === "think"}">思考·输入·看图</button>
            </div>
            <p class="why">${escapeHtml(why)}</p>
          </li>
        `;
      })
      .join("");

    blocksEl.innerHTML = handoffBlocks(state.steps)
      .map((block) => {
        const title = `${OWNER_LABEL[block.owner]} · ${block.items.length} 步`;
        const preview = block.items.map((step) => step.text).join(" → ");
        return `
          <li class="block" data-owner="${block.owner}">
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(preview)}</p>
          </li>
        `;
      })
      .join("");

    planEl.textContent = formatPlan(state.source, state.steps);
  }

  function markSample(id) {
    for (const button of form.querySelectorAll("[data-sample]")) {
      button.setAttribute("aria-pressed", String(button.dataset.sample === id));
    }
  }

  function showToast(message) {
    toastEl.hidden = false;
    toastEl.textContent = message;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.hidden = true;
    }, 1800);
  }
}

function describe(step) {
  if (!step.hit) {
    return step.overridden
      ? "没有明显动作词，原建议是思考一侧 · 已手改"
      : "没有明显的点击、跳转、滚动或切换，先交给思考一侧";
  }
  const suggestion = `${OWNER_LABEL[step.suggested]} · ${KIND_LABEL[step.kind]} · 「${step.hit}」`;
  const mixed = step.also ? `；这句也有${step.also}，可改标签或拆成两行` : "";
  const edited = step.overridden ? " · 已手改" : "";
  return `建议 ${suggestion}${mixed}${edited}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.append(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

if (typeof document !== "undefined") {
  boot();
}
