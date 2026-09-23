const SAMPLE = `产品周会 · 9月23日 16:10
参会：林夏、周衡、苏晚、陈舟

上周留的搜索改版还没结。林夏说数据看下来新排序点击率掉了 8%，先不要全量。
决定：搜索排序先回滚到 v3，灰度只留 5% 给周衡继续看。截止下周三给结论。

预算这边拍板了，Q4 内容投放砍到 40 万，不再加信息流。@苏晚 去和财务对一下合同，周五前邮件同步。

待办：
- 陈舟负责把竞品「拾光」的纪要模板拆一版，下周一会前发群里
- 请林夏整理一页用户原声，重点是「找不到昨天的记录」
- 需要补一版空状态文案，负责人还没定，下次会再分

研究同步：访谈里 3 个用户提到导出。结论是导出先不做 PDF，只做 Markdown。下一步让周衡出交互草图，明天前丢到文档。

另外会议室投影仪又坏了，行政说周四才能修。这个不算产品的事。

下次会：下周一 10:00，确认回滚后的数据和导出范围。
`;

const OWNER_STOP = new Set([
  "我们", "大家", "需要", "请先", "然后", "这个", "那个", "会议", "产品", "今天",
  "明天", "后天", "后续", "相关", "团队", "行政", "用户", "财务", "文档", "群里",
  "会前", "数据", "搜索", "内容", "预算", "导出", "灰度", "自己", "对方", "会上",
  "会后", "周五", "周一", "结论", "决定", "待办", "可以", "应该", "已经", "还是",
  "什么", "一个", "一下", "版本", "模板", "合同", "邮件", "原声", "文案", "草图",
  "交互", "竞品", "纪要", "排序", "全量", "信息", "投放", "访谈", "研究", "同步",
  "空状态", "负责人", "未指定", "还没", "还没定", "下次", "确认", "范围", "结果",
]);

const NAME_TAIL = new Set("继出整在去来把的了要将已再还就都也和与跟看做写发交约补对给到说是有会能可想让请后前".split(""));
const DECISION_RE = /决定|拍板|结论|通过了|不再|砍掉|砍到|冻结|定为|选定|采用|先不做|先不要|回滚|不上|不做|decided|decision|agreed/i;
const TODO_RE = /待办|todo|action item|请|负责|跟进|安排|整理|补一|补上|调研|输出|草图|发群|邮件|对一下|拆一|需要|跟一下|记得|别忘/i;

function sanitizeName(raw) {
  if (!raw) return null;
  const name = String(raw).replace(/[，。；、,.:：]/g, "").trim();
  if (name.length < 2 || name.length > 8) return null;
  if (OWNER_STOP.has(name)) return null;
  if (/^(一|这|那|全|不|已|再|先|后|把|将|被|从|向|对|和|与|及|或|在|到|用|按|去|来|做|出|看|说|个|次|会|其|每|某)/.test(name)) {
    return null;
  }
  if (/[0-9]/.test(name)) return null;
  if (/^[\u4e00-\u9fa5]{2,4}$/.test(name)) return name;
  if (/^[A-Za-z][A-Za-z0-9_-]{1,15}$/.test(name)) return name;
  return null;
}

function takeName(source) {
  const chars = [...String(source || "")];
  if (chars.length < 2) return null;
  const candidates = [];
  if (chars.length >= 3 && !NAME_TAIL.has(chars[2])) candidates.push(chars.slice(0, 3).join(""));
  candidates.push(chars.slice(0, 2).join(""));
  for (const candidate of candidates) {
    const name = sanitizeName(candidate);
    if (name) return name;
  }
  return null;
}

function chineseNameAt(run) {
  return takeName((String(run).match(/^[\u4e00-\u9fa5]{2,4}/) || [])[0] || "");
}

function explicitOwner(text) {
  let match = text.match(/负责人[:：]\s*([^\s，,。；;、]{2,8})/);
  if (match && !/还没|未定|待定|没有|暂无/.test(match[1])) {
    const name = sanitizeName(match[1]) || chineseNameAt(match[1]);
    if (name) return { name, how: "明确" };
  }

  match = text.match(/([\u4e00-\u9fa5]{2,4})\s*(?:负责|牵头)/);
  if (match) {
    const name = chineseNameAt(match[1]);
    if (name) return { name, how: "明确" };
  }

  match = text.match(/由\s*([\u4e00-\u9fa5]{2,4})\s*(?:负责|跟进|牵头|推进)/);
  if (match) {
    const name = chineseNameAt(match[1]);
    if (name) return { name, how: "明确" };
  }

  return null;
}

function inferredOwner(text) {
  let match = text.match(/@([A-Za-z][\w-]{1,15}|[\u4e00-\u9fa5]{2,4})/);
  if (match) {
    const name = sanitizeName(match[1]) || chineseNameAt(match[1]);
    if (name) return { name, how: "推断" };
  }

  const ask = /(?:请|让)\s*([\u4e00-\u9fa5]{2,4})/g;
  let found = ask.exec(text);
  while (found) {
    const name = chineseNameAt(found[1]);
    if (name) return { name, how: "推断" };
    found = ask.exec(text);
  }

  const give = /给\s*([\u4e00-\u9fa5]{2,4})/g;
  found = give.exec(text);
  while (found) {
    const name = chineseNameAt(found[1]);
    if (name) return { name, how: "推断" };
    found = give.exec(text);
  }

  return null;
}

function extractOwner(text) {
  return explicitOwner(text) || inferredOwner(text) || { name: "未指定", how: "未指定" };
}

function extractDeadline(text) {
  const dated = text.match(/(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}月\d{1,2}日)(?:前|之前|以内)?/);
  if (dated) return dated[1];

  const relative = text.match(
    /(今天|明天|后天|大后天|下周一|下周二|下周三|下周四|下周五|下周六|下周日|本周一|本周二|本周三|本周四|本周五|本周六|本周日|本周[一二三四五六日天]|下周[一二三四五六日天]|下周|月底|周[一二三四五六日])(?:前|之前|以内|会前)/,
  );
  if (relative) return relative[1];

  const due = text.match(/截止(?:时间|日期)?[:：\s]*([^\s，,。；;、]{2,18})/);
  if (due) {
    const inner = due[1].match(
      /(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}月\d{1,2}日|今天|明天|后天|下周一|下周二|下周三|下周四|下周五|本周[一二三四五六日天]?|下周[一二三四五六日天]?|周[一二三四五六日]|月底|尽快)/,
    );
    if (inner) return inner[1];
  }

  const weekday = text.match(
    /\b(today|tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i,
  );
  if (weekday) return weekday[1];

  if (/尽快|ASAP/i.test(text)) return "尽快";
  return "";
}

function stripLeadingActor(text) {
  let out = text.trim();
  out = out.replace(/^\s*(?:[-*•]|\d+[.、)]|（\d+）)\s*/, "");
  out = out.replace(/^【[^】]{1,12}】\s*/, "");
  out = out.replace(/^(?:下一步|待办|TODO|ToDo|Action|决定|结论是|结论|拍板了?|Decision)\s*[:：]?\s*/i, "");
  out = out.replace(/^[\u4e00-\u9fa5]{2,3}说[:：，,]?\s*/, "");
  out = out.replace(/^@([A-Za-z][\w-]{0,15}|[\u4e00-\u9fa5]{2,4})\s*/, "");
  out = out.replace(/^(?:请|让)\s*([\u4e00-\u9fa5]{2,4})/, (all, run) => {
    const name = chineseNameAt(run);
    if (!name) return all;
    return run.slice([...name].length);
  });
  out = out.replace(/^([\u4e00-\u9fa5]{2,4})\s*(?:负责|牵头)\s*/, (all, run) => {
    const name = chineseNameAt(run);
    if (!name) return all;
    return run.slice([...name].length);
  });
  out = out.replace(/^负责人[:：]\s*[^\s，,。；;、]{2,8}\s*[，,]?\s*/, "");
  out = out.replace(/负责人(?:还没|未|待)定[，,]?\s*/g, "");
  out = out.replace(/^[去来]\s*/, "");
  out = out.replace(/^在(?=(?:今天|明天|后天|大后天|周|下|本|月底|\d))/, "");
  return out.replace(/\s+/g, " ").replace(/^[，,\s]+|[，,\s]+$/g, "").trim();
}

function cleanContent(text) {
  return stripLeadingActor(text);
}

function withoutDeadline(text, when) {
  if (!when) return text;
  const escaped = when.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .replace(new RegExp(`\\bby\\s+${escaped}\\b`, "ig"), "")
    .replace(new RegExp(`截止(?:时间|日期)?[:：]?\\s*${escaped}`, "ig"), "")
    .replace(new RegExp(`${escaped}(?:前|之前|以内|会前)`, "ig"), "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.。])/g, "$1")
    .replace(/^[，,\s.。]+|[，,\s.。]+$/g, "")
    .replace(/，{2,}/g, "，")
    .trim();
}

function kindOf(text) {
  const trimmed = text.trim();
  const decision = DECISION_RE.test(trimmed);
  const assignment = /@|请\s*[\u4e00-\u9fa5]|让\s*[\u4e00-\u9fa5]|[\u4e00-\u9fa5]{2,3}\s*(?:负责|牵头)|下一步/.test(trimmed);
  const todo = TODO_RE.test(trimmed) || assignment;

  if (/负责人(?:还没|未|待)定|还没定/.test(trimmed)) return "待办";
  if (/^(请|让|@|下一步)/.test(trimmed)) return "待办";
  if (/[\u4e00-\u9fa5]{2,3}\s*(?:负责|牵头)/.test(trimmed) && !/决定[:：]|结论|拍板/.test(trimmed)) {
    return "待办";
  }
  if (decision) return "决策";
  if (todo) return "待办";
  return null;
}

function dueLine(when, action) {
  const body = action || "推进这件事";
  if (/[A-Za-z]/.test(when)) return `by ${when}: ${body}`;
  return `${when}前完成：${body}`;
}

function computeNext(item, extra = "") {
  const blob = `${item.source || ""} ${item.content} ${extra}`.trim();
  const when = item.deadline;
  const action = withoutDeadline(item.content, when) || item.content;

  if (item.kind === "待办") {
    if (/还没定|未定|待定|再分/.test(blob) && item.owner.name === "未指定") {
      return "下次会议指定负责人后再启动";
    }
    if (when && /给结论|出结论/.test(blob)) return /[A-Za-z]/.test(when) ? `by ${when}: give a conclusion` : `${when}前给出结论`;
    if (when) return dueLine(when, action);
    if (item.owner.name === "未指定") return `先指定负责人，然后：${action}`;
    return action;
  }

  if (/给结论|出结论/.test(blob) && when) {
    return /[A-Za-z]/.test(when) ? `by ${when}: confirm this decision` : `${when}前给出结论`;
  }
  if (/回滚/.test(blob)) return when ? `${when}前确认回滚结果` : "执行回滚，并同步影响面";
  if (/砍|冻结/.test(blob)) return "按新额度执行，并通知相关合同";
  if (/先不要|先不做|不做|不上|不再/.test(blob)) return "按这个范围停下，避免继续铺开";
  if (when) return /[A-Za-z]/.test(when) ? `by ${when}: review this decision` : `${when}前复核这项决定`;
  return "写入纪要，并同步相关人";
}

function isMeta(line) {
  if (/^下次(?:会|会议)?[:：]/.test(line)) return true;
  if (/^(参会|出席|列席|记录人|主持人|时间|地点|日期|主题|会议主题)[:：\s]/.test(line)) return true;
  if (/^(产品周会|周会|会议纪要)/.test(line) && !/决定|待办|请|负责/.test(line)) return true;
  if (/^待办\s*[:：]?$/.test(line)) return true;
  if (/^#{1,3}\s+\S/.test(line) && line.length < 24) return true;
  return false;
}

function isDeadlineFragment(text) {
  const trimmed = text.trim();
  if (trimmed.length > 28 || /请|负责|@/.test(trimmed)) return false;
  return /^(截止|deadline|ddl)/i.test(trimmed);
}

function explode(text) {
  if (!/[，,]/.test(text)) return [text];
  if (!DECISION_RE.test(text)) return [text];
  if (!/(@|请\s*[\u4e00-\u9fa5]|让\s*[\u4e00-\u9fa5]|[\u4e00-\u9fa5]{2,3}\s*(?:负责|牵头))/.test(text)) {
    return [text];
  }

  const pieces = text.split(/[，,]/).map((part) => part.trim()).filter(Boolean);
  const decisions = [];
  const tasks = [];
  for (const piece of pieces) {
    const taskLike = /@|请\s*[\u4e00-\u9fa5]|让\s*[\u4e00-\u9fa5]|负责/.test(piece);
    const decisionLike = /决定|结论|拍板|不再|回滚|先不/.test(piece);
    if (taskLike && !decisionLike) tasks.push(piece);
    else decisions.push(piece);
  }
  if (decisions.length && tasks.length) return [decisions.join("，"), tasks.join("，")];
  return [text];
}

function segmentsOf(raw) {
  const lines = String(raw || "").replace(/\r\n/g, "\n").split("\n");
  const segments = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (isMeta(trimmed)) {
      const next = trimmed.match(/^下次(?:会|会议)?[:：]\s*(.+)$/);
      if (next) segments.push({ type: "next", text: next[1].trim() });
      continue;
    }
    const parts = trimmed.split(/[。；;]+/).map((part) => part.trim()).filter(Boolean);
    for (const part of parts) {
      for (const piece of explode(part)) segments.push({ type: "text", text: piece });
    }
  }
  return segments;
}

export function extractBrief(raw) {
  const items = [];
  let nextMeeting = "";

  for (const segment of segmentsOf(raw)) {
    if (segment.type === "next") {
      nextMeeting = segment.text;
      continue;
    }

    if (isDeadlineFragment(segment.text) && items.length) {
      const prev = items[items.length - 1];
      const deadline = extractDeadline(segment.text);
      if (deadline) prev.deadline = deadline;
      prev.next = computeNext(prev, segment.text);
      continue;
    }

    const kind = kindOf(segment.text);
    if (!kind) continue;

    const content = cleanContent(segment.text);
    if (content.length < 6) continue;

    const owner = extractOwner(segment.text);
    const deadline = extractDeadline(segment.text);
    const item = { kind, content, source: segment.text, owner, deadline, next: "" };
    item.next = computeNext(item);
    items.push(item);
  }

  const decisions = items.filter((item) => item.kind === "决策");
  const todos = items.filter((item) => item.kind === "待办");
  return {
    items: [...decisions, ...todos],
    nextMeeting,
  };
}

function ownerLine(owner) {
  if (owner.name === "未指定") return "未指定";
  return `${owner.name}（${owner.how}）`;
}

export function toMarkdown(brief) {
  const items = brief.items || [];
  const decisions = items.filter((item) => item.kind === "决策");
  const todos = items.filter((item) => item.kind === "待办");
  const unnamed = items.filter((item) => item.owner.name === "未指定").length;
  const lines = [
    "# 行动简报",
    "",
    `决策 ${decisions.length} 条，待办 ${todos.length} 条，负责人未指定 ${unnamed} 条。`,
    "",
  ];

  const writeSection = (title, list) => {
    lines.push(`## ${title}`, "");
    if (!list.length) {
      lines.push("（无）", "");
      return;
    }
    list.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.content}`);
      lines.push(`   - 负责人：${ownerLine(item.owner)}`);
      lines.push(`   - 下一步：${item.next}`);
      lines.push("");
    });
  };

  writeSection("决策", decisions);
  writeSection("待办", todos);

  if (brief.nextMeeting) {
    lines.push("## 下次", "", brief.nextMeeting, "");
  }

  lines.push("— 由会议行动垫在本地整理。标成「推断」的负责人请再确认一次。");
  return `${lines.join("\n").trim()}\n`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function init() {
  const notes = document.querySelector("#notes");
  const extractBtn = document.querySelector("#extract");
  const sampleBtn = document.querySelector("#sample");
  const clearBtn = document.querySelector("#clear");
  const result = document.querySelector("#result");
  const summary = document.querySelector("#summary");
  const filters = document.querySelector("#filters");
  const tableWrap = document.querySelector("#table-wrap");
  const empty = document.querySelector("#empty");
  const brief = document.querySelector("#brief");
  const copyBtn = document.querySelector("#copy");
  const toast = document.querySelector("#toast");
  const count = document.querySelector("#count");

  let briefState = { items: [], nextMeeting: "" };
  let filter = "all";
  let ran = false;
  let toastTimer = 0;

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }

  function visibleItems() {
    if (filter === "决策" || filter === "待办") {
      return briefState.items.filter((item) => item.kind === filter);
    }
    if (filter === "未指定") {
      return briefState.items.filter((item) => item.owner.name === "未指定");
    }
    return briefState.items;
  }

  function renderFilters() {
    const items = briefState.items;
    const specs = [
      ["all", `全部 ${items.length}`],
      ["决策", `决策 ${items.filter((item) => item.kind === "决策").length}`],
      ["待办", `待办 ${items.filter((item) => item.kind === "待办").length}`],
      ["未指定", `未指定 ${items.filter((item) => item.owner.name === "未指定").length}`],
    ];
    filters.innerHTML = specs
      .map(
        ([id, label]) =>
          `<button type="button" class="chip${filter === id ? " is-on" : ""}" data-filter="${id}" aria-pressed="${filter === id}">${label}</button>`,
      )
      .join("");
  }

  function renderTable() {
    const rows = visibleItems();
    if (!briefState.items.length) {
      tableWrap.innerHTML = "";
      empty.hidden = false;
      empty.textContent = ran
        ? "没有抽出决策或待办。试着写上「决定」「请某人」「周五前」这类句子，或先填入示例。"
        : "";
      return;
    }

    empty.hidden = rows.length > 0;
    if (!rows.length) {
      tableWrap.innerHTML = "";
      empty.hidden = false;
      empty.textContent = "这个筛选下没有条目。换一个筛选，或改笔记后再提取。";
      return;
    }

    const body = rows
      .map((item) => {
        const index = briefState.items.indexOf(item);
        const who =
          item.owner.name === "未指定"
            ? `<span class="who missing">未指定</span>`
            : `<span class="who">${escapeHtml(item.owner.name)}</span> <span class="how">${escapeHtml(item.owner.how)}</span>`;
        return `<tr>
          <td><span class="cell-label">类型</span><span class="kind kind-${item.kind === "决策" ? "decision" : "todo"}">${item.kind}</span></td>
          <td><span class="cell-label">事项</span>${escapeHtml(item.content)}</td>
          <td><span class="cell-label">负责人</span>${who}</td>
          <td><span class="cell-label">下一步</span>${escapeHtml(item.next)}</td>
          <td><span class="cell-label">操作</span><button type="button" class="ghost tiny" data-remove="${index}">去掉</button></td>
        </tr>`;
      })
      .join("");

    tableWrap.innerHTML = `<table>
      <caption class="sr-only">抽出的决策与待办</caption>
      <thead>
        <tr>
          <th scope="col">类型</th>
          <th scope="col">事项</th>
          <th scope="col">负责人</th>
          <th scope="col">下一步</th>
          <th scope="col"><span class="sr-only">操作</span></th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>`;
  }

  function render() {
    const decisions = briefState.items.filter((item) => item.kind === "决策").length;
    const todos = briefState.items.filter((item) => item.kind === "待办").length;
    const unnamed = briefState.items.filter((item) => item.owner.name === "未指定").length;
    summary.textContent = briefState.items.length
      ? `抽出 ${briefState.items.length} 条：决策 ${decisions}，待办 ${todos}，负责人未指定 ${unnamed}。`
      : "这次没有抽出可执行的条目。";
    if (briefState.nextMeeting) {
      summary.textContent += ` 下次：${briefState.nextMeeting}`;
    }
    const markdown = toMarkdown({
      items: visibleItems(),
      nextMeeting: filter === "all" ? briefState.nextMeeting : "",
    });
    brief.textContent = briefState.items.length ? markdown : "";
    copyBtn.disabled = !visibleItems().length;
    renderFilters();
    renderTable();
  }

  function runExtract() {
    const text = notes.value.trim();
    if (!text) {
      showToast("先贴上纪要，或点「填入示例纪要」");
      notes.focus();
      return;
    }
    ran = true;
    filter = "all";
    briefState = extractBrief(text);
    result.hidden = false;
    render();
    result.scrollIntoView({ behavior: "smooth", block: "start" });
    if (briefState.items.length) {
      showToast(`已抽出 ${briefState.items.length} 条，可以复制简报`);
    }
  }

  extractBtn.addEventListener("click", runExtract);
  sampleBtn.addEventListener("click", () => {
    notes.value = SAMPLE;
    count.textContent = `${notes.value.length} 字`;
    showToast("已填入一份产品周会纪要");
    extractBtn.focus();
  });
  clearBtn.addEventListener("click", () => {
    notes.value = "";
    count.textContent = "0 字";
    briefState = { items: [], nextMeeting: "" };
    ran = false;
    filter = "all";
    result.hidden = true;
    notes.focus();
  });
  notes.addEventListener("input", () => {
    count.textContent = `${notes.value.trim().length} 字`;
  });
  notes.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      runExtract();
    }
  });
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    filter = button.dataset.filter;
    render();
  });
  tableWrap.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;
    const index = Number(button.dataset.remove);
    briefState.items.splice(index, 1);
    render();
    showToast("已从简报里去掉");
  });
  copyBtn.addEventListener("click", async () => {
    const markdown = brief.textContent;
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      showToast("Markdown 简报已复制");
    } catch {
      const area = document.createElement("textarea");
      area.value = markdown;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      showToast("Markdown 简报已复制");
    }
    copyBtn.textContent = "已复制";
    window.setTimeout(() => {
      copyBtn.textContent = "一键复制";
    }, 1600);
  });
}

if (typeof document !== "undefined") init();
