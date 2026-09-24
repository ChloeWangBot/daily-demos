const KEY = "codex-path-pad:v1";

export const SAMPLE =
  "我在改公司内部的订餐页。菜单来自本地 JSON，现在过了 10:30 仍然能下单。今天只想做成：10:30 后菜单只读，提交按钮停用，并显示「今日菜单已截止」。不要改数据来源，也不要动列表样式。希望先读现有的下单校验，确认理解后再改代码。";

const START_BRIDGE =
  "还没标任何一步。今天不要跳到插件或技能，先把 Annotate 做实：标出位置和结果。";

const START_CHECKS = [
  "手头这件事能否用一句话说清要改的行为",
  "你是否知道要标注的是哪一处，而不是整个项目",
  "今天想看到的结果是否小到一次练习里能核对",
];

export const STEPS = [
  {
    id: "annotate",
    name: "Annotate",
    label: "标注",
    tip: "先标出要改的那一处，并写上改完应看到的结果。位置和结果都要具体，别只留一句「帮我改一下」。",
    bullets: [
      "标出真正要动的那一处，界面或逻辑都可以",
      "写上改完后能看见的结果，以及今天明确不动的部分",
      "让 Codex 先复述标注，对上了再允许它改文件",
    ],
    practiceLead: "指出位置、写上结果、划出不动的部分。",
    practiceSteps: [
      "找出真正要动的那一处，用一句话点名它。",
      "写下改完后能直接看见的结果。",
      "补上今天不动什么，然后让 Codex 复述，先不要改文件。",
    ],
    doneLooks: "离开聊天也能看懂：改哪里、变成什么样、哪里不动。",
    bridge: "标注已经落在具体位置上。今天不要再改措辞，用 Fork 分出一条对照支线。",
    checks: [
      "是否点名了要动的那一处，而不是整仓都算目标",
      "改完的样子是否能被看见或被检查",
      "不动的部分有没有写上",
    ],
  },
  {
    id: "fork",
    name: "Fork",
    label: "分叉",
    tip: "想试另一种做法时，把会话从这里分出去。分叉复制的是对话，文件不会自动退回，支线开头要写明这次只试什么。",
    bullets: [
      "从当前会话分出支线，主线先停住",
      "支线第一句写明只试哪一种做法，以及文件要不要和主线分开",
      "试完用一句话记下结论，再决定留下还是丢掉",
    ],
    practiceLead: "分出一条支线，只试一种做法，主线留着当对照。",
    practiceSteps: [
      "确认主线上的标注还在，不要在主线里直接改口。",
      "分出支线，开头写清：只验证一种做法，文件不自动退回。",
      "试完写一句结论：保留、丢掉，或只带回哪一点。",
    ],
    doneLooks: "主线和支线都能打开，支线上有一句对照结论。",
    bridge: "支线已经有对照。今天把不再打开的会话收进 Archive，别让列表堆着半成品。",
    checks: [
      "支线是否只试一件事，没有和主线同时大改",
      "你是否记得文件不会跟着对话自动退回",
      "支线上是否已经有一句结论",
    ],
  },
  {
    id: "archive",
    name: "Archive",
    label: "归档",
    tip: "列表里只留还要往下做的会话。做完、放弃或只是试过的，收进归档，并留下一句以后搜得到的结论。",
    bullets: [
      "给每条还开着的会话写一句状态：在做、有结论，或作废",
      "把今天不会再打开的收进归档，标题里带上结论里的词",
      "归档前把必须记住的决定贴回还留着的主线",
    ],
    practiceLead: "收拾会话列表：留下要推进的，收起其余的。",
    practiceSteps: [
      "列出还开着的会话，每条用一句话写状态。",
      "今天不会再看的，收进归档，让标题能搜到结论。",
      "若结论只写在即将收起的会话里，先贴回主线再归档。",
    ],
    doneLooks: "打开列表时，留下的每一条都对应今天还要做的事。",
    bridge: "列表已经收干净。今天进入 Plan，只批准一段今天能做完的计划。",
    checks: [
      "收起的会话是否各有一句结论，而不是只剩日期",
      "还留着的会话是否都对应今天要做的事",
      "关键决定是否还在主线上，不靠翻已归档的对话",
    ],
  },
  {
    id: "plan",
    name: "Plan",
    label: "计划",
    tip: "先看计划再改文件。计划里要有步骤、今天不做的范围，以及你能当场核对的结果。多出来的步骤直接划掉。",
    bullets: [
      "用一句话写下今天结束时要看到的结果",
      "让 Codex 先列出几步计划和每步怎样核对，先不改文件",
      "划掉今天做不完的步骤，只批准剩下的那一段",
    ],
    practiceLead: "先把计划删到能做完的长度，再考虑动文件。",
    practiceSteps: [
      "用一句话写出今天结束时能看到的结果。",
      "列出步骤，每步旁边写你怎样核对。",
      "划掉超出今天的步骤，只留下你愿意批准的一段。",
    ],
    doneLooks: "计划短到今天能走完，每一步都有可核对的结果。",
    bridge: "计划已经能核对。今天只接一个 Plugin，替代一件你正在重复的事。",
    checks: [
      "每一步是否都有你能当场核对的结果",
      "超出今天的步骤是否已经划掉",
      "计划是否还沿着标注里的目标，而不是另起一套",
    ],
  },
  {
    id: "plugin",
    name: "Plugin",
    label: "插件",
    tip: "插件是一组可以装上的能力。今天只启用一个你真的用得上的，在手头这件事上试一次，先不要连装一串。",
    bullets: [
      "写出今天重复了两次以上、仍靠手工完成的动作",
      "只启用一个对得上的插件，不顺便再装第二个",
      "用手头这件事试一次，确认它拿到的上下文和标注一致",
    ],
    practiceLead: "只启用一个插件，替代一个你正在重复的手工动作。",
    practiceSteps: [
      "从手头的事里挑一个重复动作。",
      "只启用一个对得上的插件，先别连装。",
      "试一次，看它用到的上下文是不是你的标注和计划。",
    ],
    doneLooks: "这个动作不必再手工重做一遍；不成功时你知道怎么改回手工。",
    bridge: "插件已经试过一次。今天把它收成 Skill：写清何时用、要什么、产出什么。",
    checks: [
      "这个插件是否替代了你今天真的重复过的动作",
      "试跑时拿到的上下文是否和标注、计划一致",
      "不成功时你是否知道怎样改回手工做",
    ],
  },
  {
    id: "skill",
    name: "Skill",
    label: "技能",
    tip: "把刚走通的做法写成技能：什么情况下用、需要哪些输入、应该产出什么、什么时候不要用。下次同类任务直接调用它。",
    bullets: [
      "写清触发时机、需要的输入、期望的产出，以及不要用的情况",
      "把标注习惯、分叉方式和插件名称写进这段说明",
      "开一条新会话，只靠这段技能重做手头事的一小段",
    ],
    practiceLead: "把走通的做法收成技能，并在新会话里重做一小段。",
    practiceSteps: [
      "写下何时启用、要什么输入、产出什么、何时停用。",
      "点名你依赖的标注方式和插件。",
      "开新会话，不翻旧对话，只靠这段说明重做一小段。",
    ],
    doneLooks: "不翻旧会话，只靠技能说明就能重做同类任务的一小段。",
    bridge: "六步都已标上。今天不要新开一条路径，用这段技能重做一小段手头的事。",
    checks: [
      "说明里是否写清何时用、要什么输入、产出什么、何时停用",
      "不翻旧会话，只靠技能能否重做一小段",
      "技能里点名的插件或标注习惯现在是否仍然成立",
    ],
  },
];

const CODA = {
  bullets: [
    "换手头事里更小的一块，只提供技能要求的输入",
    "把说明里含糊的一句改成可以核对的输入或产出",
    "若技能用到插件，写上不成功时退回计划还是手工",
  ],
  practiceLead: "用技能重做一小段，不再口头补充背景。",
  practiceSteps: [
    "选最小的一块，只给技能要求的输入。",
    "按技能跑一遍，缺什么就补进说明，不在会话里临场解释。",
    "跑完改一处含糊措辞，让下次还能直接调用。",
  ],
  doneLooks: "技能被实际用过一次，说明比刚才更短、更具体。",
  checks: [
    "重做时是否只给了技能要求的输入，没有把背景再讲一遍",
    "含糊的那句是否已经改成可以核对的输入或产出",
    "用到插件时，技能里是否写了不成功就退回哪一步",
  ],
};

export function farthestIndex(flags) {
  let far = -1;
  flags.forEach((on, index) => {
    if (on) far = index;
  });
  return far;
}

export function normalize(flags) {
  const far = farthestIndex(flags);
  return STEPS.map((_, index) => index <= far);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hook(paste) {
  const raw = String(paste || "").trim().replace(/\s+/g, " ");
  if (!raw) return "";
  const sentence = raw.split(/[。！？\n]/)[0].trim();
  const base = sentence || raw;
  if (base.length <= 28) return base;
  return `${base.slice(0, 28)}…`;
}

function taskText(paste) {
  const raw = String(paste || "").trim();
  if (!raw) return "未填写。不填也能练，默认当成一件三十分钟内能收尾的小改动。";
  const limit = 600;
  if (raw.length <= limit) return raw;
  return `${raw.slice(0, limit)}…\n（原文更长，简报只保留前 ${limit} 字）`;
}

function cueLines(paste) {
  const text = String(paste || "");
  if (!text.trim()) return [];
  const lines = [];
  if (/截止|只读|禁用|停用|不能再/.test(text)) {
    lines.push("描述里有状态切换，完成标准写成「之前怎样、之后怎样」两句即可。");
  }
  if (/不要|别动|禁止|勿改/.test(text)) {
    lines.push("你已经写了边界，把它原样收进「不要动」那一行。");
  }
  if (/测试|断言|用例/.test(text)) {
    lines.push("你提到了检查或测试，验收就写成一条能跑出的结果。");
  }
  if (/接口|API|字段|请求|响应/.test(text)) {
    lines.push("你会动到接口或字段，禁区里点名哪些字段不能改。");
  }
  if (/样式|布局|视觉|CSS/.test(text)) {
    lines.push("若样式不是今天的目标，写进禁区，避免练习滑去做界面。");
  }
  return lines.slice(0, 2);
}

function currentLabel(far) {
  if (far < 0) return "尚未开始（0/6）";
  const step = STEPS[far];
  return `${step.name} · ${step.label}（${far + 1}/6）`;
}

function practiceFor(far) {
  if (far >= STEPS.length - 1) return CODA;
  return STEPS[far + 1];
}

function practiceLabel(far) {
  if (far >= STEPS.length - 1) return "用技能重做一小段";
  const step = STEPS[far + 1];
  return `${step.name} · ${step.label}`;
}

function checkPack(far) {
  if (far < 0) return { title: "卡点自检 · 开始前", items: START_CHECKS };
  if (far >= STEPS.length - 1) return { title: "卡点自检 · Skill · 技能", items: CODA.checks };
  const step = STEPS[far];
  return { title: `卡点自检 · ${step.name} · ${step.label}`, items: step.checks };
}

export function buildReport(flags, paste, now = new Date()) {
  const done = normalize(flags);
  const far = farthestIndex(done);
  const practice = practiceFor(far);
  const pack = checkPack(far);
  if (pack.items.length !== 3 || practice.practiceSteps.length !== 3 || practice.bullets.length !== 3) {
    throw new Error("每个阶段需要 3 条下一步、3 条做法和 3 条自检");
  }

  const bullets = practice.bullets.map((item, index) => {
    if (index !== 0) return item;
    const title = hook(paste);
    return title ? `结合「${title}」：${item}` : item;
  });

  const stage = [
    `当前阶段：${currentLabel(far)}`,
    `下一站：${practiceLabel(far)}`,
    "",
    "下一步：",
    ...bullets.map((item) => `• ${item}`),
  ].join("\n");

  const bridge = far < 0 ? START_BRIDGE : STEPS[far].bridge;
  const cues = cueLines(paste);
  const briefLines = [
    "今日练习简报",
    `日期：${formatDate(now)}`,
    "路径：Annotate → Fork → Archive → Plan → Plugin → Skill",
    "",
    `当前阶段：${currentLabel(far)}`,
    `今天练习：${practiceLabel(far)}`,
    "",
    "手头的事：",
    taskText(paste),
    "",
    bridge,
    "",
    "今日只做：",
    practice.practiceLead,
    "",
    "做法：",
    ...practice.practiceSteps.map((item, index) => `${index + 1}. ${item}`),
    "",
    "做完的样子：",
    practice.doneLooks,
  ];
  if (cues.length) {
    briefLines.push("", "从你的描述里抽出的提醒：", ...cues.map((item) => `• ${item}`));
  }

  return {
    far,
    stage,
    brief: briefLines.join("\n"),
    checkTitle: pack.title,
    checks: pack.items.slice(),
  };
}

export function formatChecks(title, items, checked = []) {
  const lines = items.map((item, index) => `${checked[index] ? "☑" : "□"} ${item}`);
  return [title, ...lines].join("\n");
}

export function formatAll(report, checked = []) {
  return [report.stage, report.brief, formatChecks(report.checkTitle, report.checks, checked)].join("\n\n");
}

export function progressText(far) {
  if (far < 0) return "还没勾选。可以直接生成起点简报。";
  if (far >= STEPS.length - 1) return "六步都已勾上。再生成会得到「用技能重做一小段」的简报。";
  const current = STEPS[far];
  const next = STEPS[far + 1];
  return `最远到 ${current.name} · ${current.label}（${far + 1}/6）。下一站 ${next.name}。`;
}

function init() {
  const stagesEl = document.querySelector("#stages");
  const stepsEl = document.querySelector("#steps");
  const progressEl = document.querySelector("#progress");
  const pasteEl = document.querySelector("#paste");
  const clearBtn = document.querySelector("#clear");
  const generateBtn = document.querySelector("#generate");
  const emptyEl = document.querySelector("#result-empty");
  const bodyEl = document.querySelector("#result-body");
  const staleEl = document.querySelector("#stale");
  const sheetStage = document.querySelector("#sheet-stage");
  const sheetBrief = document.querySelector("#sheet-brief");
  const checkKicker = document.querySelector("#check-kicker");
  const checkList = document.querySelector("#check-list");
  const resultTitle = document.querySelector("#result-title");
  const copyAllBtn = document.querySelector("#copy-all");
  const toastEl = document.querySelector("#toast");

  let done = STEPS.map(() => false);
  let report = null;
  let reportKey = "";
  let toastTimer = 0;

  STEPS.forEach((step, index) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "stage";
    chip.dataset.index = String(index);
    const idx = document.createElement("span");
    idx.className = "stage-idx";
    idx.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("span");
    name.className = "stage-name";
    name.textContent = step.name;
    const zh = document.createElement("span");
    zh.className = "stage-zh";
    zh.textContent = step.label;
    chip.append(idx, name, zh);
    chip.addEventListener("click", () => setFrontier(index));
    stagesEl.append(chip);

    const item = document.createElement("li");
    item.className = "step";
    item.dataset.index = String(index);

    const num = document.createElement("span");
    num.className = "num";
    num.textContent = String(index + 1);

    const main = document.createElement("div");
    main.className = "step-main";
    const heading = document.createElement("h3");
    heading.append(document.createTextNode(step.name));
    const gloss = document.createElement("span");
    gloss.textContent = step.label;
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.hidden = true;
    heading.append(gloss, pill);
    const tip = document.createElement("p");
    tip.className = "tip";
    tip.id = `tip-${step.id}`;
    tip.textContent = step.tip;
    main.append(heading, tip);

    const mark = document.createElement("button");
    mark.type = "button";
    mark.className = "mark";
    mark.dataset.index = String(index);
    mark.setAttribute("aria-describedby", tip.id);
    mark.addEventListener("click", () => setFrontier(index));

    item.append(num, main, mark);
    stepsEl.append(item);
  });

  function signature() {
    return JSON.stringify({ done, paste: pasteEl.value.trim() });
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.hidden = true;
    }, 1600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const helper = document.createElement("textarea");
        helper.value = text;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.left = "-9999px";
        document.body.append(helper);
        helper.select();
        const ok = document.execCommand("copy");
        helper.remove();
        return ok;
      } catch {
        return false;
      }
    }
  }

  function checkedFlags() {
    return [...checkList.querySelectorAll("input")].map((input) => input.checked);
  }

  async function onCopy(button, getText) {
    const ok = await copyText(getText());
    if (!ok) {
      showToast("复制失败，请直接选中文字");
      return;
    }
    const previous = button.textContent;
    button.textContent = "已复制";
    button.classList.add("is-copied");
    showToast("已复制");
    window.setTimeout(() => {
      button.textContent = previous;
      button.classList.remove("is-copied");
    }, 1600);
  }

  function renderChecks(items) {
    checkList.replaceChildren();
    items.forEach((item) => {
      const li = document.createElement("li");
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      const text = document.createElement("span");
      text.textContent = item;
      label.append(input, text);
      li.append(label);
      checkList.append(li);
    });
  }

  function render() {
    const far = farthestIndex(done);
    stagesEl.querySelectorAll(".stage").forEach((chip, index) => {
      chip.classList.toggle("is-done", index < far);
      chip.classList.toggle("is-far", index === far);
      chip.classList.toggle("is-next", index === far + 1);
      chip.setAttribute("aria-pressed", index <= far ? "true" : "false");
      const step = STEPS[index];
      const state = index === far ? "当前" : index < far ? "已完成" : index === far + 1 ? "下一步" : "未到";
      chip.setAttribute("aria-label", `${index + 1} ${step.name} ${step.label}，${state}`);
    });

    stepsEl.querySelectorAll(".step").forEach((item, index) => {
      const step = STEPS[index];
      const pressed = index <= far;
      item.classList.toggle("is-done", index < far);
      item.classList.toggle("is-far", index === far);
      item.classList.toggle("is-next", index === far + 1);
      if (index === far) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
      const mark = item.querySelector(".mark");
      mark.setAttribute("aria-pressed", pressed ? "true" : "false");
      mark.textContent = pressed ? "已做到" : "我做到这了";
      mark.setAttribute("aria-label", `${step.name} ${step.label}：${pressed ? "已做到" : "我做到这了"}`);
      const pill = item.querySelector(".pill");
      if (index === far) {
        pill.hidden = false;
        pill.textContent = "当前";
        pill.classList.remove("next");
      } else if (index === far + 1) {
        pill.hidden = false;
        pill.textContent = "下一步";
        pill.classList.add("next");
      } else {
        pill.hidden = true;
        pill.textContent = "";
      }
    });

    progressEl.textContent = progressText(far);
    clearBtn.disabled = far < 0;
    if (bodyEl.dataset.ready === "true") staleEl.hidden = reportKey === signature();
    save();
  }

  function setFrontier(index) {
    const far = farthestIndex(done);
    const nextFar = index === far ? index - 1 : index;
    done = STEPS.map((_, step) => step <= nextFar);
    render();
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ done, paste: pasteEl.value }));
    } catch {
      /* private mode or blocked storage */
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.done) && data.done.length === STEPS.length) {
        done = normalize(data.done.map(Boolean));
      }
      if (typeof data.paste === "string") pasteEl.value = data.paste;
    } catch {
      /* ignore broken storage */
    }
  }

  function generate() {
    report = buildReport(done, pasteEl.value, new Date());
    reportKey = signature();
    sheetStage.textContent = report.stage;
    sheetBrief.textContent = report.brief;
    checkKicker.textContent = report.checkTitle;
    renderChecks(report.checks);
    emptyEl.hidden = true;
    bodyEl.hidden = false;
    bodyEl.dataset.ready = "true";
    copyAllBtn.hidden = false;
    staleEl.hidden = true;
    const rect = resultTitle.getBoundingClientRect();
    const inView = rect.top >= 0 && rect.top < window.innerHeight * 0.7;
    if (!inView) resultTitle.scrollIntoView({ behavior: "smooth", block: "start" });
    resultTitle.focus({ preventScroll: true });
  }

  clearBtn.addEventListener("click", () => {
    done = STEPS.map(() => false);
    render();
  });

  document.querySelector("#fill-sample").addEventListener("click", () => {
    pasteEl.value = SAMPLE;
    pasteEl.focus();
    render();
    showToast("已填入示例，可再改");
  });

  pasteEl.addEventListener("input", render);

  generateBtn.addEventListener("click", generate);

  document.querySelector("#copy-stage").addEventListener("click", (event) => {
    if (!report) return;
    onCopy(event.currentTarget, () => report.stage);
  });
  document.querySelector("#copy-brief").addEventListener("click", (event) => {
    if (!report) return;
    onCopy(event.currentTarget, () => report.brief);
  });
  document.querySelector("#copy-checks").addEventListener("click", (event) => {
    if (!report) return;
    onCopy(event.currentTarget, () => formatChecks(report.checkTitle, report.checks, checkedFlags()));
  });
  copyAllBtn.addEventListener("click", (event) => {
    if (!report) return;
    onCopy(event.currentTarget, () => formatAll(report, checkedFlags()));
  });

  load();
  render();
}

if (typeof document !== "undefined") init();
