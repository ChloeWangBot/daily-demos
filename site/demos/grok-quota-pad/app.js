const STORAGE_KEY = "grok-quota-pad:v1";
const RECOVER_RATIO = 0.65;

export const MODES = [
  {
    id: "frugal",
    label: "省着用",
    cap: 40,
    blurb: "一条主线，其余先停",
    guardTitle: "锁住一条主线",
    guard: (line) =>
      `今天新开的 Grok Bot 对话不超过 1 条。主线写成「${line}」。多出来的问题记一行，明天再看。`,
    note: (n) =>
      `本周按省着用，上限 ${n.cap} 点。主线是「${n.line}」。当前燃烧 ${n.burn} 点，勾选若今天执行，大约还剩 ${n.remaining} 点。附带 bot 先停，输出保持短清单。`,
  },
  {
    id: "steady",
    label: "正常",
    cap: 72,
    blurb: "日常问答，加一条自动化",
    guardTitle: "自动化只留一条",
    guard: (line) =>
      `日常问答可以留着。定时或自动跟进只保留和「${line}」有关的一条；出现第二条时，先停掉第一条。`,
    note: (n) =>
      `本周按正常节奏，上限 ${n.cap} 点。主线是「${n.line}」。当前燃烧 ${n.burn} 点，勾选若今天执行，大约还剩 ${n.remaining} 点。并行探索先不做。`,
  },
  {
    id: "sprint",
    label: "冲刺",
    cap: 110,
    blurb: "允许一次深挖，其余锁死",
    guardTitle: "深挖只锁一个目标",
    guard: (line) =>
      `本周只允许一次深挖，目标就是「${line}」。深挖之外保持今天勾的止损，不把冲刺变成每天的默认。`,
    note: (n) =>
      `本周按冲刺，上限 ${n.cap} 点。深挖目标是「${n.line}」。当前燃烧 ${n.burn} 点，勾选若今天执行，大约还剩 ${n.remaining} 点。深挖窗口结束就回到省着用。`,
  },
];

export const SEE = [
  {
    id: "dump",
    label: "整文件、日志、截图一次塞进对话",
    detail: "单轮上下文突然变厚",
    weight: 22,
  },
  {
    id: "parallel",
    label: "多个 agent 并行做同一件事",
    detail: "同一问题被算了两三遍",
    weight: 20,
  },
  {
    id: "replay",
    label: "同一段仓库说明反复整段粘贴",
    detail: "旧上下文被一次次重放",
    weight: 16,
  },
  {
    id: "retry",
    label: "失败后原样重跑，不缩小范围",
    detail: "错误路径被完整再付一次",
    weight: 16,
  },
  {
    id: "tools",
    label: "搜索和浏览每轮默认全开",
    detail: "没问到的工具也在跑",
    weight: 14,
  },
  {
    id: "plan",
    label: "先写长计划，再改实现",
    detail: "计划本身比改动更贵",
    weight: 10,
  },
];

export const STOP = [
  {
    id: "pause-sidebots",
    label: "暂停非主线的定时 bot",
    detail: "今天只留正在用的那条",
    relief: 14,
    covers: ["parallel", "tools"],
    action: "打开定时任务，停掉名称里不带今天主线的 bot。",
  },
  {
    id: "no-rerun",
    label: "不再重跑失败的大任务",
    detail: "先把范围砍到一个文件或一个问题",
    relief: 16,
    covers: ["retry", "dump"],
    action: "失败任务先写一句「这次只改一处」，再决定要不要重开。",
  },
  {
    id: "close-sidechats",
    label: "关掉附属对话和顺手再问",
    detail: "一条线程做完再开下一条",
    relief: 12,
    covers: ["replay", "plan"],
    action: "把附属对话归档，新问题写进主线，不新开窗。",
  },
  {
    id: "pause-review-bots",
    label: "暂停非紧急的代码审查 bot",
    detail: "审查改到你点名再跑",
    relief: 10,
    covers: ["parallel", "tools"],
    action: "审查 bot 改为手动触发，今天不自动跟 PR。",
  },
  {
    id: "defer-explore",
    label: "探索性实验延到下周",
    detail: "新想法先记一行，不现在跑",
    relief: 8,
    covers: ["plan", "parallel"],
    action: "想试的点子写成一行备忘，本周不派 agent。",
  },
];

export const TRIM = [
  {
    id: "trim-prompt",
    label: "默认提示词去掉范例、客套和旧记录",
    detail: "系统提示只留角色、边界、输出",
    relief: 12,
    covers: ["replay", "plan"],
    action: "把系统提示收成三行：角色、边界、输出格式。",
  },
  {
    id: "tool-allowlist",
    label: "工具只留读写和必要搜索",
    detail: "浏览、截图、子代理移出默认",
    relief: 14,
    covers: ["tools"],
    action: "默认白名单改为读、写、搜索；其余改为点名才开。",
  },
  {
    id: "short-output",
    label: "输出改成短清单，不写长文",
    detail: "先给步骤，再按需展开",
    relief: 10,
    covers: ["plan", "dump", "retry"],
    action: "在默认指令末尾加上：只回清单，除非我要求展开。",
  },
  {
    id: "no-vision",
    label: "关掉截图和视觉理解",
    detail: "能用文字说清的不贴图",
    relief: 12,
    covers: ["dump"],
    action: "视觉工具移出默认栈，需要时单次打开。",
  },
  {
    id: "clear-memory",
    label: "本周不带长期记忆",
    detail: "旧对话摘要先不注入",
    relief: 11,
    covers: ["replay"],
    action: "关掉记忆注入，需要的背景改成你手写的三句话。",
  },
  {
    id: "no-subagents",
    label: "子代理默认关闭",
    detail: "同一件事不再分身",
    relief: 16,
    covers: ["parallel"],
    action: "子代理开关设为关闭，只有你写出分工才允许再开。",
  },
];

const BUCKETS = [
  { key: "see", title: "看清", kicker: "什么在烧额度", items: SEE, tone: "see" },
  { key: "stop", title: "止损", kicker: "今天先停什么", items: STOP, tone: "stop" },
  { key: "trim", title: "底座减脂", kicker: "默认栈里拿掉什么", items: TRIM, tone: "trim" },
];

const FALLBACK_LINE = "只留一条主线，其余 Grok Bot 今天先停";

export const DEFAULTS = {
  mode: "frugal",
  mainline: FALLBACK_LINE,
  note: true,
  see: ["dump", "replay", "retry", "tools"],
  stop: ["pause-sidebots", "no-rerun", "close-sidechats"],
  trim: ["trim-prompt", "tool-allowlist", "short-output"],
};

const CUTS = [...STOP, ...TRIM];

function sum(items, field) {
  return items.reduce((total, item) => total + item[field], 0);
}

function byId(list, ids) {
  const picked = new Set(ids);
  return list.filter((item) => picked.has(item.id));
}

function cleanLine(value) {
  const line = String(value || "").replace(/\s+/g, " ").trim();
  return line || FALLBACK_LINE;
}

function best(items) {
  return [...items].sort((a, b) => b.relief - a.relief)[0] || null;
}

export function buildPlan(input) {
  const mode = MODES.find((item) => item.id === input.mode) || MODES[0];
  const line = cleanLine(input.mainline);
  const burns = byId(SEE, input.see);
  const stops = byId(STOP, input.stop);
  const trims = byId(TRIM, input.trim);
  const cuts = [...stops, ...trims];
  const burn = sum(burns, "weight");
  const coveredBurns = burns.filter((item) => cuts.some((cut) => cut.covers.includes(item.id)));
  const covered = sum(coveredBurns, "weight");
  const recovered = Math.round(covered * RECOVER_RATIO);
  const remaining = Math.max(0, burn - recovered);
  const uncovered = burns.filter((item) => !coveredBurns.includes(item));
  const cutIds = new Set(cuts.map((item) => item.id));
  const suggestions = CUTS.filter((item) => !cutIds.has(item.id))
    .map((item) => {
      const hit = uncovered.filter((burnItem) => item.covers.includes(burnItem.id));
      return { item, cover: sum(hit, "weight") };
    })
    .filter((entry) => entry.cover > 0)
    .sort((a, b) => b.cover - a.cover || b.item.relief - a.item.relief);

  const over = remaining > mode.cap;
  const actions = [];

  if (over) {
    for (const entry of suggestions.slice(0, 2)) {
      actions.push({
        title: `补上：${entry.item.label}`,
        body: `${entry.item.action}这一项盖住约 ${entry.cover} 点还没被勾选盖住的燃烧。`,
      });
    }
  } else {
    const topStop = best(stops);
    const topTrim = best(trims);
    if (topStop) actions.push({ title: `今天先停：${topStop.label}`, body: topStop.action });
    if (topTrim) actions.push({ title: `底座先拿掉：${topTrim.label}`, body: topTrim.action });
  }

  actions.push({ title: mode.guardTitle, body: mode.guard(line) });

  const fillers = [
    ...[...cuts].sort((a, b) => b.relief - a.relief).map((item) => ({
      title: item.label,
      body: item.action,
    })),
    ...suggestions.map((entry) => ({
      title: `补上：${entry.item.label}`,
      body: entry.item.action,
    })),
    {
      title: "失败不要原样重跑",
      body: "同一报错先缩小到一个文件或一个问题，再决定是否新开一轮。",
    },
    {
      title: "默认输出改成短清单",
      body: "在指令末尾写上：只回清单，除非我要求展开。",
    },
    {
      title: "今天不新开并行 agent",
      body: "同一件事只留一个对话。要分身时先把分工写成三行。",
    },
  ];

  for (const filler of fillers) {
    if (actions.length >= 3) break;
    if (actions.some((item) => item.title === filler.title)) continue;
    actions.push(filler);
  }

  const date = formatDate(input.now);
  const cutLines = [
    `主线：${line}`,
    `节奏：${mode.label}（本周上限 ${mode.cap} 点）`,
    `燃烧 ${burn} 点，计划收回约 ${recovered} 点，还剩 ${remaining} 点。`,
    "",
    "看清",
    ...linesOrEmpty(
      burns.map((item) => `- ${item.label}（${item.weight} 点）`),
      "- （这项先空着）打开今天的对话，圈出重复粘贴、整段日志、并行 agent 里最贵的一处。",
    ),
    "",
    "今天停",
    ...linesOrEmpty(
      stops.map((item) => `- ${item.label}：${item.action}`),
      "- （这项先空着）先暂停非主线的定时 bot。",
    ),
    "",
    "底座拿掉",
    ...linesOrEmpty(
      trims.map((item) => `- ${item.label}：${item.action}`),
      "- （这项先空着）默认工具只留读、写、搜索。",
    ),
  ];
  const actionLines = actions.map((item, index) => `${index + 1}. ${item.title}\n   ${item.body}`);
  const noteText = input.note ? mode.note({ cap: mode.cap, line, burn, remaining }) : "";
  const markdown = [
    `Grok 额度卫生 · 减支清单`,
    `日期：${date}（本地生成，未连接账户）`,
    "",
    ...cutLines,
    "",
    "接下来三步",
    ...actionLines,
    ...(noteText ? ["", "本周额度备注", noteText] : []),
  ].join("\n");

  return {
    mode,
    line,
    burn,
    covered,
    recovered,
    remaining,
    over,
    burns,
    stops,
    trims,
    uncovered,
    suggestions,
    actions: actions.slice(0, 3),
    date,
    cutText: cutLines.join("\n"),
    actionsText: actionLines.join("\n"),
    noteText,
    markdown,
  };
}

function linesOrEmpty(lines, emptyLine) {
  return lines.length ? lines : [emptyLine];
}

function formatDate(now) {
  const date = now instanceof Date ? now : new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function sameSelection(state, sample) {
  const keys = ["mode", "note"];
  if (keys.some((key) => state[key] !== sample[key])) return false;
  if (cleanLine(state.mainline) !== cleanLine(sample.mainline)) return false;
  return ["see", "stop", "trim"].every((key) => sameIds(state[key], sample[key]));
}

function sameIds(left, right) {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((id) => rightSet.has(id));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!raw || typeof raw !== "object") return structuredClone(DEFAULTS);
    return {
      mode: MODES.some((item) => item.id === raw.mode) ? raw.mode : DEFAULTS.mode,
      mainline: typeof raw.mainline === "string" ? raw.mainline : DEFAULTS.mainline,
      note: typeof raw.note === "boolean" ? raw.note : DEFAULTS.note,
      see: sanitizeIds(raw.see, SEE),
      stop: sanitizeIds(raw.stop, STOP),
      trim: sanitizeIds(raw.trim, TRIM),
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

function sanitizeIds(value, list) {
  const allowed = new Set(list.map((item) => item.id));
  if (!Array.isArray(value)) return [];
  return list.filter((item) => value.includes(item.id) && allowed.has(item.id)).map((item) => item.id);
}

function boot() {
  const els = {
    modes: document.querySelector("#modes"),
    buckets: document.querySelector("#buckets"),
    mainline: document.querySelector("#mainline"),
    note: document.querySelector("#include-note"),
    progress: document.querySelector("#progress"),
    generate: document.querySelector("#generate"),
    reset: document.querySelector("#reset"),
    empty: document.querySelector("#result-empty"),
    body: document.querySelector("#result-body"),
    title: document.querySelector("#result-title"),
    meter: document.querySelector("#meter"),
    meterLabel: document.querySelector("#meter-label"),
    meterCap: document.querySelector("#meter-cap"),
    meterFill: document.querySelector("#meter-fill"),
    meterDetail: document.querySelector("#meter-detail"),
    suggest: document.querySelector("#apply-suggest"),
    sheet: document.querySelector("#sheet-cut"),
    actions: document.querySelector("#next-actions"),
    budgetBlock: document.querySelector("#budget-block"),
    budget: document.querySelector("#budget-note"),
    copyAll: document.querySelector("#copy-all"),
    copyCut: document.querySelector("#copy-cut"),
    copyActions: document.querySelector("#copy-actions"),
    copyNote: document.querySelector("#copy-note"),
    toast: document.querySelector("#toast"),
  };

  const state = loadState();
  let generated = false;
  let plan = buildPlan(state);

  els.modes.innerHTML = MODES.map(
    (mode) => `
      <button type="button" class="mode" role="radio" data-mode="${mode.id}" aria-checked="false">
        <b>${mode.label}</b>
        <span>上限 ${mode.cap} · ${mode.blurb}</span>
      </button>
    `,
  ).join("");

  els.buckets.innerHTML = BUCKETS.map((bucket) => {
    const points = bucket.key === "see" ? "weight" : "relief";
    const unit = bucket.key === "see" ? "燃烧" : "大约收回";
    return `
      <section class="bucket ${bucket.tone}" aria-labelledby="${bucket.key}-title">
        <div class="bucket-head">
          <div>
            <p class="bucket-kicker">${bucket.kicker}</p>
            <h2 id="${bucket.key}-title">${bucket.title}</h2>
          </div>
        </div>
        <ul class="items">
          ${bucket.items
            .map(
              (item) => `
                <li>
                  <label class="item">
                    <input type="checkbox" data-bucket="${bucket.key}" value="${item.id}" />
                    <span class="item-copy">
                      <span class="item-label">${escapeHtml(item.label)}</span>
                      <span class="item-detail">${escapeHtml(item.detail)} · ${unit} ${item[points]} 点</span>
                    </span>
                    <span class="pts">${item[points]}</span>
                  </label>
                </li>
              `,
            )
            .join("")}
        </ul>
      </section>
    `;
  }).join("");

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode */
    }
  }

  function syncControls() {
    els.mainline.value = state.mainline;
    els.note.checked = state.note;
    for (const button of els.modes.querySelectorAll("[data-mode]")) {
      const on = button.dataset.mode === state.mode;
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-checked", String(on));
    }
    for (const input of els.buckets.querySelectorAll("input[data-bucket]")) {
      const on = state[input.dataset.bucket].includes(input.value);
      input.checked = on;
      input.closest(".item")?.classList.toggle("is-on", on);
    }
  }

  function progressText() {
    const mode = MODES.find((item) => item.id === state.mode) || MODES[0];
    const counts = `看清 ${state.see.length} · 止损 ${state.stop.length} · 减脂 ${state.trim.length}`;
    if (!generated && sameSelection(state, DEFAULTS)) {
      return `示例已勾好 · ${mode.label} · 上限 ${mode.cap} · ${counts}。点一次即可生成。`;
    }
    return `${mode.label} · 上限 ${mode.cap} · ${counts}${generated ? " · 清单已按勾选更新" : ""}`;
  }

  function renderSheet(items, emptyText, mapLine) {
    if (!items.length) {
      return `<p class="lead">${escapeHtml(emptyText)}</p>`;
    }
    return `<ul>${items.map((item) => `<li>${escapeHtml(mapLine(item))}</li>`).join("")}</ul>`;
  }

  function renderResult() {
    plan = buildPlan(state);
    const ratio = plan.mode.cap === 0 ? 1 : plan.remaining / plan.mode.cap;
    els.meter.classList.toggle("is-over", plan.over);
    els.meterLabel.textContent = plan.over
      ? `高出 ${plan.remaining - plan.mode.cap} 点`
      : `还剩 ${plan.remaining} 点`;
    els.meterCap.textContent = `上限 ${plan.mode.cap}`;
    els.meterFill.style.width = `${Math.min(100, Math.round(ratio * 100))}%`;
    const uncovered = plan.uncovered.length
      ? `还没盖住：${plan.uncovered.map((item) => item.label).join("、")}。`
      : "已勾的止损和减脂盖住了当前燃烧项。";
    els.meterDetail.textContent = `燃烧 ${plan.burn} 点，计划收回约 ${plan.recovered} 点。${uncovered}${
      plan.over ? "先补上下面这项。" : `已压进「${plan.mode.label}」。`
    }`;

    const suggestion = plan.over ? plan.suggestions[0] : null;
    els.suggest.hidden = !suggestion;
    if (suggestion) {
      els.suggest.dataset.add = suggestion.item.id;
      els.suggest.textContent = `补上：${suggestion.item.label}`;
    } else {
      delete els.suggest.dataset.add;
    }

    els.sheet.innerHTML = `
      <p class="lead">${escapeHtml(`主线：${plan.line}`)}</p>
      <p class="lead">${escapeHtml(`节奏：${plan.mode.label}（本周上限 ${plan.mode.cap} 点）· ${plan.date}`)}</p>
      <div>
        <h4>看清</h4>
        ${renderSheet(plan.burns, "这项先空着。打开今天的对话，圈出重复粘贴、整段日志、并行 agent 里最贵的一处。", (item) => `${item.label}（${item.weight} 点）`)}
      </div>
      <div>
        <h4>今天停</h4>
        ${renderSheet(plan.stops, "这项先空着。先暂停非主线的定时 bot。", (item) => `${item.label}：${item.action}`)}
      </div>
      <div>
        <h4>底座拿掉</h4>
        ${renderSheet(plan.trims, "这项先空着。默认工具只留读、写、搜索。", (item) => `${item.label}：${item.action}`)}
      </div>
    `;

    els.actions.innerHTML = plan.actions
      .map(
        (item) => `
          <li>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.body)}</p>
          </li>
        `,
      )
      .join("");

    els.budgetBlock.hidden = !plan.noteText;
    els.budget.textContent = plan.noteText;
    els.empty.hidden = true;
    els.body.hidden = false;
    els.copyAll.hidden = false;
  }

  function refresh() {
    syncControls();
    els.progress.textContent = progressText();
    if (generated) renderResult();
  }

  function setBucket(bucket, id, on) {
    const next = new Set(state[bucket]);
    if (on) next.add(id);
    else next.delete(id);
    const source = BUCKETS.find((item) => item.key === bucket).items;
    state[bucket] = source.filter((item) => next.has(item.id)).map((item) => item.id);
  }

  async function copyText(text, button) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.left = "-9999px";
        document.body.append(area);
        area.select();
        ok = document.execCommand("copy");
        area.remove();
      } catch {
        ok = false;
      }
    }
    if (button) {
      button.classList.toggle("is-copied", ok);
      const previous = button.textContent;
      if (ok) button.textContent = "已复制";
      clearTimeout(button._t);
      button._t = setTimeout(() => {
        button.classList.remove("is-copied");
        button.textContent = previous;
      }, 1200);
    }
    toast(ok ? "已复制" : "复制失败，请手动选择文字");
  }

  function toast(text) {
    els.toast.hidden = false;
    els.toast.textContent = text;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      els.toast.hidden = true;
    }, 1600);
  }

  function generate() {
    generated = true;
    renderResult();
    els.progress.textContent = progressText();
    els.title.focus();
    if (window.matchMedia("(max-width: 860px)").matches) {
      els.title.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  els.mainline.addEventListener("input", () => {
    state.mainline = els.mainline.value;
    persist();
    refresh();
  });

  els.note.addEventListener("change", () => {
    state.note = els.note.checked;
    persist();
    refresh();
  });

  els.modes.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (!button) return;
    state.mode = button.dataset.mode;
    persist();
    refresh();
  });

  els.modes.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const buttons = [...els.modes.querySelectorAll("[data-mode]")];
    const index = buttons.findIndex((button) => button.dataset.mode === state.mode);
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = buttons[(index + delta + buttons.length) % buttons.length];
    state.mode = next.dataset.mode;
    persist();
    refresh();
    next.focus();
    event.preventDefault();
  });

  els.buckets.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.dataset.bucket) return;
    setBucket(input.dataset.bucket, input.value, input.checked);
    persist();
    refresh();
  });

  els.generate.addEventListener("click", generate);
  els.reset.addEventListener("click", () => {
    Object.assign(state, structuredClone(DEFAULTS));
    persist();
    refresh();
    toast("已恢复示例");
  });

  els.suggest.addEventListener("click", () => {
    const id = els.suggest.dataset.add;
    if (!id) return;
    const bucket = STOP.some((item) => item.id === id) ? "stop" : "trim";
    setBucket(bucket, id, true);
    persist();
    refresh();
    const input = els.buckets.querySelector(`input[value="${CSS.escape(id)}"]`);
    const row = input?.closest(".item");
    row?.classList.add("is-flash");
    clearTimeout(els.suggest._flash);
    els.suggest._flash = setTimeout(() => row?.classList.remove("is-flash"), 1400);
    toast("已补上");
  });

  els.copyAll.addEventListener("click", () => copyText(plan.markdown, els.copyAll));
  els.copyCut.addEventListener("click", () => copyText(plan.cutText, els.copyCut));
  els.copyActions.addEventListener("click", () => copyText(plan.actionsText, els.copyActions));
  els.copyNote.addEventListener("click", () => copyText(plan.noteText, els.copyNote));

  refresh();
}

if (typeof document !== "undefined") boot();
