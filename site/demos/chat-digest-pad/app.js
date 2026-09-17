const SAMPLE = `张三 09:12
明天记得把需求文档发给客户，@李四 你跟一下进度

李四 09:14
好的，我来安排。另外这周排期我们决定用方案B，大家同意吗？

王五 09:15
同意。下周上线时间定了吗？

张三 09:16
决定了：下周三发布。待办：我去改权限配置

李四 09:17
@王五 测试账号准备好了吗？还有灰度范围是多少？

王五 09:18
还没，明天上午给你。TODO：我先拉一份测试名单`;

const TODO_RE = /待办|TODO|todo|记得|安排|准备|发给|跟一下|麻烦|需要你|去改|拉一份|上午给你|下午给你/;
const DECISION_RE = /决定|同意|就用|拍板|定为|通过|方案[ABC]/;
const QUESTION_RE = /[？?]|吗$|呢$|定了吗|好了吗|多少/;
const MENTION_RE = /@([^\s@，,。！？?、；;：:]+)/g;
const HEADER_RE =
  /^(.+?)\s+(\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+)?(\d{1,2}:\d{2}(?::\d{2})?)$/;
const BRACKET_RE = /^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.+)$/;
const COLON_RE = /^([^：:]{1,16})[：:]\s*(.*)$/;

const els = {
  input: document.querySelector("#chat-input"),
  extract: document.querySelector("#btn-extract"),
  sample: document.querySelector("#btn-sample"),
  clear: document.querySelector("#btn-clear"),
  copy: document.querySelector("#btn-copy"),
  download: document.querySelector("#btn-download"),
  empty: document.querySelector("#result-empty"),
  board: document.querySelector("#result-board"),
  meta: document.querySelector("#result-meta"),
  toast: document.querySelector("#toast"),
};

let state = emptyState();

function emptyState() {
  return {
    messages: 0,
    todos: [],
    decisions: [],
    people: [],
    questions: [],
  };
}

function isLikelyName(name) {
  const n = name.trim();
  if (n.length < 1 || n.length > 16) return false;
  if (/[？?！!。]/.test(n)) return false;
  if (TODO_RE.test(n) || DECISION_RE.test(n)) return false;
  return !/^(另外|好的|还没|明天|下周|待办|决定)/.test(n);
}

function parseChat(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const messages = [];
  let current = null;

  const push = () => {
    if (current?.text.trim()) {
      messages.push({
        speaker: current.speaker,
        time: current.time,
        text: current.text.trim(),
      });
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    let match = line.match(HEADER_RE);
    if (match && isLikelyName(match[1])) {
      push();
      current = { speaker: match[1].trim(), time: match[3], text: "" };
      continue;
    }

    match = line.match(BRACKET_RE);
    if (match && isLikelyName(match[2])) {
      push();
      current = { speaker: match[2].trim(), time: match[1], text: "" };
      continue;
    }

    match = line.match(COLON_RE);
    if (match && isLikelyName(match[1])) {
      push();
      current = {
        speaker: match[1].trim(),
        time: "",
        text: match[2] || "",
      };
      continue;
    }

    if (current) {
      current.text = current.text ? `${current.text}\n${line}` : line;
    } else {
      current = { speaker: "未知", time: "", text: line };
    }
  }

  push();
  return messages;
}

function splitSentences(text) {
  const parts = text
    .split(/(?<=[。！？?;；])\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length ? parts : [text.trim()];
}

function refineMixed(sentence) {
  if (!(QUESTION_RE.test(sentence) && DECISION_RE.test(sentence))) {
    return [sentence];
  }
  const idx = Math.max(sentence.lastIndexOf("，"), sentence.lastIndexOf(","));
  if (idx < 1) return [sentence];
  return [sentence.slice(0, idx), sentence.slice(idx + 1)].map((s) => s.trim()).filter(Boolean);
}

function classify(sentence) {
  const s = sentence.replace(/^[-*•\d.、]+\s*/, "").trim();
  if (!s) return null;
  if (QUESTION_RE.test(s)) return "question";
  if (DECISION_RE.test(s)) return "decision";
  if (TODO_RE.test(s)) return "todo";
  return null;
}

function collectMentions(text) {
  return [...text.matchAll(MENTION_RE)].map((m) => m[1].replace(/的$/, ""));
}

function extract(text) {
  const messages = parseChat(text);
  const next = emptyState();
  next.messages = messages.length;
  const seen = {
    todos: new Set(),
    decisions: new Set(),
    questions: new Set(),
    people: new Set(),
  };

  const add = (bucket, key, item) => {
    if (!item.text || seen[key].has(item.text)) return;
    seen[key].add(item.text);
    next[bucket].push(item);
  };

  for (const msg of messages) {
    for (const person of collectMentions(msg.text)) {
      if (!seen.people.has(person)) {
        seen.people.add(person);
        next.people.push({ name: person, by: msg.speaker });
      }
    }

    const clauses = splitSentences(msg.text).flatMap(refineMixed);
    for (const clause of clauses) {
      const kind = classify(clause);
      const item = { text: clause.replace(/^待办[:：]\s*|^TODO[:：]\s*/i, ""), speaker: msg.speaker, done: false };
      if (kind === "todo") add("todos", "todos", item);
      if (kind === "decision") add("decisions", "decisions", item);
      if (kind === "question") add("questions", "questions", item);
    }
  }

  return next;
}

function render() {
  const hasItems =
    state.todos.length + state.decisions.length + state.people.length + state.questions.length > 0;

  els.empty.hidden = hasItems;
  els.board.hidden = !hasItems;
  els.copy.disabled = !hasItems;
  els.download.disabled = !hasItems;

  if (!hasItems) {
    els.meta.textContent =
      state.messages === 0
        ? "点「提取要点」即可，约 30 秒看完四类清单。"
        : `读到 ${state.messages} 条消息，但规则没命中关键词。可再贴一段含「记得 / 决定 / ？ / @」的记录。`;
    els.board.innerHTML = "";
    return;
  }

  els.meta.textContent = `从 ${state.messages} 条消息本地抽出 ${
    state.todos.length + state.decisions.length + state.people.length + state.questions.length
  } 条要点（非 AI）。`;

  els.board.innerHTML = [
    renderChecklist("待办", state.todos, "todo", "todos"),
    renderChecklist("决策", state.decisions, "decision", "decisions"),
    renderPeople(),
    renderChecklist("待跟进问题", state.questions, "follow", "questions"),
  ].join("");
}

function renderChecklist(title, items, tone, bucket) {
  const body = items.length
    ? items
        .map(
          (item, index) => `
        <label class="item">
          <input type="checkbox" data-bucket="${bucket}" data-index="${index}" ${item.done ? "checked" : ""} />
          <span><span class="who">${escapeHtml(item.speaker)}</span>${escapeHtml(item.text)}</span>
        </label>`
        )
        .join("")
    : `<p class="none">这一段没有扫到。</p>`;

  return `
    <article class="section">
      <div class="section-head">
        <h3>${title}</h3>
        <span class="count ${tone}">${items.length}</span>
      </div>
      ${body}
    </article>`;
}

function renderPeople() {
  const body = state.people.length
    ? `<div class="chip-row">${state.people
        .map((p) => `<span class="chip">@${escapeHtml(p.name)}<span class="who">由 ${escapeHtml(p.by)} 提及</span></span>`)
        .join("")}</div>`
    : `<p class="none">没有扫到 @人名。</p>`;

  return `
    <article class="section">
      <div class="section-head">
        <h3>提及的人</h3>
        <span class="count people">${state.people.length}</span>
      </div>
      ${body}
    </article>`;
}

function toMarkdown() {
  const box = (item) => `- [${item.done ? "x" : " "}] ${item.speaker}：${item.text}`;
  const lines = [
    "# 聊天纪要",
    "",
    "> 本地规则提取，非 AI",
    "",
    `## 待办（${state.todos.length}）`,
    ...(state.todos.length ? state.todos.map(box) : ["- 无"]),
    "",
    `## 决策（${state.decisions.length}）`,
    ...(state.decisions.length ? state.decisions.map(box) : ["- 无"]),
    "",
    `## 提及的人（${state.people.length}）`,
    ...(state.people.length ? state.people.map((p) => `- @${p.name}（由 ${p.by} 提及）`) : ["- 无"]),
    "",
    `## 待跟进问题（${state.questions.length}）`,
    ...(state.questions.length ? state.questions.map(box) : ["- 无"]),
    "",
  ];
  return lines.join("\n");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function showToast(message) {
  els.toast.hidden = false;
  els.toast.textContent = message;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    els.toast.hidden = true;
  }, 1800);
}

function runExtract() {
  const text = els.input.value.trim();
  if (!text) {
    state = emptyState();
    render();
    showToast("先粘贴一段聊天，或点「填入示例」");
    return;
  }
  state = extract(text);
  render();
  showToast("已按本地规则抽出要点");
}

function fillSample() {
  els.input.value = SAMPLE;
  showToast("已填入示例对话");
}

els.input.value = SAMPLE;

els.extract.addEventListener("click", runExtract);
els.sample.addEventListener("click", fillSample);
els.clear.addEventListener("click", () => {
  els.input.value = "";
  state = emptyState();
  render();
  els.input.focus();
});

els.copy.addEventListener("click", async () => {
  const markdown = toMarkdown();
  try {
    await navigator.clipboard.writeText(markdown);
    showToast("Markdown 已复制");
  } catch {
    fallbackCopy(markdown);
  }
});

els.download.addEventListener("click", () => {
  const blob = new Blob([toMarkdown()], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "chat-digest.md";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("已开始下载 chat-digest.md");
});

els.board.addEventListener("change", (event) => {
  const box = event.target;
  if (!(box instanceof HTMLInputElement) || box.type !== "checkbox") return;
  const bucket = box.dataset.bucket;
  const index = Number(box.dataset.index);
  if (!state[bucket]?.[index]) return;
  state[bucket][index].done = box.checked;
});

els.input.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    runExtract();
  }
});

function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.append(area);
  area.select();
  try {
    document.execCommand("copy");
    showToast("Markdown 已复制");
  } catch {
    showToast("复制失败，请手动选择文本");
  }
  area.remove();
}

render();
