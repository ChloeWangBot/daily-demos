const SAMPLES = [
  "OpenAI 今日发布 GPT-5.4，API 已开放试用并下调输入价格",
  "Anthropic just launched Claude 4.6 — developers can apply for API access today",
  "英伟达 Rubin 芯片量产时间表曝光，云厂商本周开始锁单",
  "AMD published next-gen accelerator specs and starts sampling customers this week",
  "欧盟拟收紧通用人工智能模型备案，最晚下月征求意见",
  "为什么大模型总会幻觉：一篇回顾十年对齐研究的长文",
];

const FRESH_TERMS = [
  ["刚刚", 24],
  ["今日", 22],
  ["今天", 22],
  ["昨晚", 20],
  ["今早", 20],
  ["breaking", 22],
  ["today", 20],
  ["本周", 16],
  ["这周", 16],
  ["this week", 16],
  ["发布", 12],
  ["推出", 12],
  ["上线", 12],
  ["曝光", 12],
  ["公布", 12],
  ["宣布", 12],
  ["更新", 10],
  ["launched", 12],
  ["published", 10],
  ["announced", 12],
  ["下月", 8],
  ["本月", 8],
];

const FRESH_TIME = ["刚刚", "今日", "今天", "昨晚", "今早", "breaking", "today", "本周", "这周", "this week", "下月", "本月"];
const FRESH_VERB = ["发布", "推出", "上线", "曝光", "公布", "宣布", "更新", "launched", "published", "announced"];
const EVERGREEN = ["回顾", "十年", "长文", "为什么", "盘点", "retrospective", "essay"];

const ACTION_TERMS = [
  ["api", 18],
  ["sdk", 16],
  ["开源", 16],
  ["试用", 16],
  ["下载", 14],
  ["教程", 16],
  ["how to", 16],
  ["价格", 14],
  ["定价", 14],
  ["免费", 12],
  ["申请", 14],
  ["apply", 14],
  ["额度", 12],
  ["access", 8],
  ["送测", 14],
  ["sampling", 14],
  ["锁单", 12],
  ["征求意见", 12],
  ["备案", 8],
  ["规格", 8],
  ["specs", 8],
  ["时间表", 8],
  ["github", 14],
  ["上手", 12],
];

const THEMES = [
  {
    label: "方法教程",
    keys: ["how to", "教程", "微调", "fine-tune", "recipe", "上手", "指南"],
  },
  {
    label: "开源工具",
    keys: ["开源", "github", "框架", "agent", "技能", "repo", "open source", "open-source"],
  },
  {
    label: "监管政策",
    keys: ["欧盟", "监管", "备案", "法案", "征求意见", "合规", "regulation", "政策"],
  },
  {
    label: "芯片算力",
    keys: ["芯片", "gpu", "英伟达", "nvidia", "amd", "加速卡", "accelerator", "rubin", "量产", "tpu", "算力", "sampling"],
  },
  {
    label: "观点长文",
    keys: ["为什么", "回顾", "长文", "思考", "对齐", "幻觉", "essay", "retrospective"],
  },
  {
    label: "模型发布",
    keys: ["gpt", "claude", "gemini", "llama", "chatgpt", "api", "发布", "推出", "launched"],
  },
];

const STOP_EN = new Set([
  "the", "and", "for", "with", "from", "this", "that", "have", "has", "are", "was",
  "were", "you", "your", "into", "over", "week", "today", "just", "new", "its",
  "how", "can", "for", "and", "starts", "customers", "next", "gen",
]);

const STOP_BG = new Set([
  "一个", "我们", "可以", "已经", "开始", "进行", "以及", "这个", "不会", "什么",
  "怎么", "因为", "所以", "如果", "但是", "还是", "就是", "没有", "自己", "他们",
  "今天", "今日", "本周", "这周", "下月", "本月", "为什", "什么", "总会",
]);

function hasTerm(text, term) {
  const hay = text.toLowerCase();
  const needle = term.toLowerCase();
  if (/[\u4e00-\u9fff]/.test(needle) || needle.includes(" ")) return hay.includes(needle);
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, "i").test(hay);
}

function surface(text, term) {
  const hay = text.toLowerCase();
  const needle = term.toLowerCase();
  if (/[\u4e00-\u9fff]/.test(needle) || needle.includes(" ")) {
    const index = hay.indexOf(needle);
    return index >= 0 ? text.slice(index, index + term.length) : term;
  }
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`(?:^|[^A-Za-z0-9])(${escaped})(?=[^A-Za-z0-9]|$)`, "i"));
  return match ? match[1] : term;
}

function matchedTerms(text, table) {
  const hits = [];
  for (const [term, points] of table) {
    if (hasTerm(text, term)) hits.push({ term, points, label: surface(text, term) });
  }
  return hits;
}

function quoteHits(hits) {
  return hits.map((hit) => `「${hit.label}」`).join("");
}

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function tone(n) {
  if (n >= 75) return "high";
  if (n >= 55) return "mid";
  return "low";
}

function gramsOf(text) {
  const set = new Set();
  const lower = text.toLowerCase();
  for (const word of lower.match(/[a-z][a-z0-9.+-]{2,}/g) || []) {
    if (!STOP_EN.has(word)) set.add(`e:${word}`);
  }
  for (const chunk of text.match(/[\u4e00-\u9fff]{2,}/g) || []) {
    for (let i = 0; i < chunk.length - 1; i += 1) {
      const bg = chunk.slice(i, i + 2);
      if (!STOP_BG.has(bg)) set.add(`z:${bg}`);
    }
  }
  return set;
}

function scoreFresh(text) {
  const hits = matchedTerms(text, FRESH_TERMS);
  let score = 32 + hits.reduce((sum, hit) => sum + hit.points, 0);
  const timed = hits.some((hit) => FRESH_TIME.includes(hit.term));
  const verb = hits.some((hit) => FRESH_VERB.includes(hit.term));
  if (timed && verb) score += 10;
  const evergreen = EVERGREEN.filter((term) => hasTerm(text, term)).map((term) => surface(text, term));
  if (evergreen.length) score = Math.min(score, 36) - 24;
  const why = evergreen.length
    ? `回顾或长文（${evergreen.map((term) => `「${term}」`).join("")}），时间信号弱`
    : hits.length
      ? `命中${quoteHits(hits)}`
      : "没有明显的时间或发布词";
  return { score: clamp(score), why };
}

function scoreAction(text) {
  const hits = matchedTerms(text, ACTION_TERMS);
  let score = 22 + hits.reduce((sum, hit) => sum + hit.points, 0);
  const version = /\d+\.\d+/.test(text) || /\b(?:gpt|claude|llama|gemini)[- ]?\d/i.test(text);
  if (version) score += 10;
  const evergreen = EVERGREEN.filter((term) => hasTerm(text, term));
  if (evergreen.length) score = Math.min(score, 30) - 18;
  const bits = hits.map((hit) => `「${hit.label}」`);
  if (version) bits.push("「版本号」");
  const why = evergreen.length
    ? "偏观点或回顾，可执行信号弱"
    : bits.length
      ? `命中${bits.join("")}`
      : "缺少能跟着做的词";
  return { score: clamp(score), why };
}

function clusterOf(text) {
  let best = { label: "其他", hits: 0, keys: [] };
  for (const theme of THEMES) {
    const keys = theme.keys.filter((key) => hasTerm(text, key));
    if (keys.length > best.hits) best = { label: theme.label, hits: keys.length, keys };
  }
  return best.label;
}

function scoreNovelty(items) {
  const docFreq = new Map();
  for (const item of items) {
    for (const gram of item.grams) docFreq.set(gram, (docFreq.get(gram) || 0) + 1);
  }
  for (const item of items) {
    const size = item.grams.size;
    if (items.length < 2) {
      item.novel = 50;
      item.novelWhy = "只有一条，新颖度先按中性计";
      continue;
    }
    if (!size) {
      item.novel = 45;
      item.novelWhy = "标题太短，新颖度按中性计";
      continue;
    }
    const unique = [...item.grams].filter((gram) => docFreq.get(gram) === 1).length;
    item.novel = clamp(28 + (unique / size) * 62);
    item.novelWhy = `${unique}/${size} 个词只在本条出现`;
  }
}

function weighted(fresh, novel, action, weights) {
  const sum = weights.fresh + weights.novel + weights.action;
  if (!sum) return clamp((fresh + novel + action) / 3);
  return clamp((fresh * weights.fresh + novel * weights.novel + action * weights.action) / sum);
}

export function scoreBatch(lines, weights) {
  const notes = [];
  const cleaned = lines.map((line) => line.trim()).filter(Boolean);
  if (!cleaned.length) {
    return { items: [], clusters: [], notes: ["先贴至少一条标题。"], shortlist: "" };
  }
  if (cleaned.length < 3) notes.push(`建议 3–8 条，当前 ${cleaned.length} 条，新颖度参考有限。`);
  if (cleaned.length > 8) notes.push(`超过 8 条，已只评前 8 条。`);
  const slice = cleaned.slice(0, 8);

  const items = slice.map((text, index) => {
    const fresh = scoreFresh(text);
    const action = scoreAction(text);
    return {
      text,
      index,
      grams: gramsOf(text),
      fresh: fresh.score,
      freshWhy: fresh.why,
      action: action.score,
      actionWhy: action.why,
      cluster: clusterOf(text),
      novel: 0,
      novelWhy: "",
      total: 0,
    };
  });

  scoreNovelty(items);
  for (const item of items) {
    item.total = weighted(item.fresh, item.novel, item.action, weights);
  }
  items.sort((a, b) => b.total - a.total || b.fresh - a.fresh || a.index - b.index);

  const counts = new Map();
  for (const item of items) counts.set(item.cluster, (counts.get(item.cluster) || 0) + 1);
  const best = new Map();
  for (const item of items) best.set(item.cluster, Math.max(best.get(item.cluster) || 0, item.total));
  const clusters = [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || best.get(b.label) - best.get(a.label));

  return {
    items,
    clusters,
    notes,
    shortlist: buildShortlist(items, clusters),
  };
}

export function buildShortlist(items, clusters) {
  const top = items.slice(0, Math.min(3, items.length));
  const lines = ["热点短名单", ""];
  top.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.total}  [${item.cluster}] ${item.text}`);
    lines.push(`   新鲜 ${item.fresh} · 新颖 ${item.novel} · 可执行 ${item.action}`);
  });
  if (clusters.length) {
    lines.push("");
    lines.push(`聚类：${clusters.map((cluster) => `${cluster.label} ×${cluster.count}`).join("；")}`);
  }
  lines.push("");
  lines.push("（本地启发式，只看标题用词，不是事实核查）");
  return lines.join("\n");
}

function readWeights() {
  return {
    fresh: Number(document.querySelector("#w-fresh").value),
    novel: Number(document.querySelector("#w-novel").value),
    action: Number(document.querySelector("#w-action").value),
  };
}

function parseLines() {
  return document.querySelector("#headlines").value.split(/\r?\n/);
}

function renderMeter(label, value, why, kind) {
  const row = document.createElement("div");
  row.className = "meter";
  const name = document.createElement("span");
  name.textContent = label;
  const track = document.createElement("span");
  track.className = "meter-track";
  const fill = document.createElement("span");
  fill.className = `meter-fill ${kind}`;
  fill.style.width = `${value}%`;
  track.append(fill);
  const num = document.createElement("span");
  num.className = "meter-num";
  num.textContent = String(value);
  num.title = why;
  row.append(name, track, num);
  return row;
}

function render(result, { scroll = false } = {}) {
  const results = document.querySelector("#results");
  const status = document.querySelector("#status");
  const clusters = document.querySelector("#clusters");
  const ranked = document.querySelector("#ranked");
  const shortlist = document.querySelector("#shortlist");
  const copy = document.querySelector("#btn-copy");

  results.hidden = false;
  clusters.replaceChildren();
  ranked.replaceChildren();
  shortlist.textContent = result.shortlist;
  copy.disabled = !result.items.length;
  copy.textContent = "复制短名单";
  copy.classList.remove("is-copied");

  if (!result.items.length) {
    status.textContent = result.notes[0] || "没有可评的标题。";
    if (scroll) scrollTo(results);
    return;
  }

  const note = result.notes.length ? ` ${result.notes.join("")}` : "";
  status.textContent = `已评 ${result.items.length} 条。综合分按当前权重。${note}`;

  for (const cluster of result.clusters) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.dataset.cluster = cluster.label;
    button.textContent = `${cluster.label} ×${cluster.count}`;
    button.setAttribute("aria-pressed", "false");
    clusters.append(button);
  }

  result.items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "item";
    li.dataset.cluster = item.cluster;

    const rank = document.createElement("div");
    rank.className = "rank";
    rank.textContent = String(index + 1);

    const body = document.createElement("div");
    const top = document.createElement("div");
    top.className = "item-top";
    const headline = document.createElement("p");
    headline.className = "headline";
    headline.textContent = item.text;
    const total = document.createElement("div");
    total.className = `total tone-${tone(item.total)}`;
    total.textContent = String(item.total);
    const caption = document.createElement("small");
    caption.textContent = "综合";
    total.append(caption);
    top.append(headline, total);

    const tag = document.createElement("div");
    tag.className = "tag";
    tag.textContent = item.cluster;

    const meters = document.createElement("div");
    meters.className = "meters";
    meters.append(
      renderMeter("新鲜", item.fresh, item.freshWhy, "fresh"),
      renderMeter("新颖", item.novel, item.novelWhy, "novel"),
      renderMeter("可执行", item.action, item.actionWhy, "action"),
    );

    const why = document.createElement("p");
    why.className = "why";
    why.textContent = `新鲜：${item.freshWhy}。新颖：${item.novelWhy}。可执行：${item.actionWhy}。`;

    body.append(top, tag, meters, why);
    li.append(rank, body);
    ranked.append(li);
  });

  if (scroll) scrollTo(results);
}

function scrollTo(node) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
}

function currentResult() {
  return scoreBatch(parseLines(), readWeights());
}

async function copyShortlist(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

function updateCount() {
  const count = parseLines().map((line) => line.trim()).filter(Boolean).length;
  const el = document.querySelector("#count");
  el.textContent = `${count} 条`;
  const hint = document.querySelector("#hint");
  if (!count) hint.textContent = "先贴至少一条标题。Ctrl 或 ⌘ + Enter 也可以评分。";
  else if (count < 3 || count > 8) hint.textContent = `当前 ${count} 条，建议 3–8 条。Ctrl 或 ⌘ + Enter 也可以评分。`;
  else hint.textContent = "建议 3–8 条。Ctrl 或 ⌘ + Enter 也可以评分。";
}

function syncWeightLabels() {
  document.querySelector("#out-fresh").textContent = document.querySelector("#w-fresh").value;
  document.querySelector("#out-novel").textContent = document.querySelector("#w-novel").value;
  document.querySelector("#w-action-out").textContent = document.querySelector("#w-action").value;
}

function fillSamples() {
  document.querySelector("#headlines").value = SAMPLES.join("\n");
  updateCount();
}

function init() {
  const headlines = document.querySelector("#headlines");
  const results = document.querySelector("#results");
  let scored = false;

  fillSamples();

  headlines.addEventListener("input", () => {
    updateCount();
  });

  document.querySelector("#btn-reset").addEventListener("click", () => {
    fillSamples();
    headlines.focus();
  });

  document.querySelector("#btn-score").addEventListener("click", () => {
    scored = true;
    render(currentResult(), { scroll: true });
  });

  headlines.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      scored = true;
      render(currentResult(), { scroll: true });
    }
  });

  for (const id of ["#w-fresh", "#w-novel", "#w-action"]) {
    document.querySelector(id).addEventListener("input", () => {
      syncWeightLabels();
      if (scored && !results.hidden) render(currentResult());
    });
  }

  document.querySelector("#clusters").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const on = button.getAttribute("aria-pressed") === "true";
    for (const chip of document.querySelectorAll("#clusters .chip")) {
      chip.classList.remove("is-on");
      chip.setAttribute("aria-pressed", "false");
    }
    const label = on ? "" : button.dataset.cluster;
    if (!on) {
      button.classList.add("is-on");
      button.setAttribute("aria-pressed", "true");
    }
    for (const item of document.querySelectorAll("#ranked .item")) {
      item.classList.toggle("is-dim", Boolean(label) && item.dataset.cluster !== label);
    }
  });

  document.querySelector("#btn-copy").addEventListener("click", async () => {
    const text = document.querySelector("#shortlist").textContent;
    const button = document.querySelector("#btn-copy");
    const ok = await copyShortlist(text);
    button.textContent = ok ? "已复制" : "请手动复制下方短名单";
    button.classList.toggle("is-copied", ok);
    if (!ok) {
      const node = document.querySelector("#shortlist");
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(node);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    window.setTimeout(() => {
      if (button.textContent === "已复制" || button.textContent === "请手动复制下方短名单") {
        button.textContent = "复制短名单";
        button.classList.remove("is-copied");
      }
    }, 1600);
  });
}

if (typeof document !== "undefined") init();
