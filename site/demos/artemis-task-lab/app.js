const CHECKS = [
  { id: "dev", label: "已打开开发者选项" },
  { id: "adb", label: "USB 调试已开启" },
  { id: "auth", label: "这台电脑已获授权" },
  { id: "cable", label: "数据线已连接（或无线调试）" },
];

const STORAGE_KEY = "artemis-task-lab-usb";

const TASKS = {
  maps: {
    id: "maps",
    label: "地图车程 → YouTube",
    prompt: "查一下去机场的车程，然后打开 YouTube 放一首路上听的歌。",
    steps: [
      {
        title: "打开地图",
        action: "launch Maps",
        screen: "maps",
        detail: "启动地图，准备搜机场。",
        verify: "地图搜索框可见",
      },
      {
        title: "搜索机场",
        action: "type “机场”",
        screen: "maps-search",
        detail: "输入目的地并确认第一条结果。",
        verify: "出现机场路线卡片",
      },
      {
        title: "读车程",
        action: "read ETA",
        screen: "maps-route",
        detail: "当前最快路线约 38 分钟 / 27 km。",
        verify: "车程文本已解析",
      },
      {
        title: "切到 YouTube",
        action: "launch YouTube",
        screen: "youtube",
        detail: "后台记住车程，打开 YouTube。",
        verify: "YouTube 首页已加载",
      },
      {
        title: "播放路途歌单",
        action: "tap play",
        screen: "youtube-play",
        detail: "点开 “Drive north · lo-fi mix”。",
        verify: "播放器状态 = playing",
      },
    ],
  },
  battery: {
    id: "battery",
    label: "设置 → 电池电量",
    prompt: "打开设置，看一下现在电池还剩多少，并把低电量模式状态记下来。",
    steps: [
      {
        title: "打开设置",
        action: "launch Settings",
        screen: "settings",
        detail: "从主屏幕进入设置。",
        verify: "设置分组列表可见",
      },
      {
        title: "进入电池",
        action: "tap Battery",
        screen: "battery",
        detail: "滚到电池项并点进去。",
        verify: "电池页标题匹配",
      },
      {
        title: "读取电量",
        action: "read level",
        screen: "battery-read",
        detail: "当前电量 86%，低电量模式关闭。",
        verify: "level=86, saver=off",
      },
    ],
  },
  note: {
    id: "note",
    label: "跨应用复制备忘",
    prompt: "把备忘录里的会议室地址复制出来，粘到信息里发给自己。",
    steps: [
      {
        title: "打开备忘录",
        action: "launch Notes",
        screen: "notes",
        detail: "找到置顶笔记 “周四评审”。",
        verify: "笔记正文可见",
      },
      {
        title: "复制地址",
        action: "copy selection",
        screen: "notes-copy",
        detail: "选中 “8F · 海淀西街 9 号”。",
        verify: "剪贴板长度 > 0",
      },
      {
        title: "打开信息",
        action: "launch Messages",
        screen: "messages",
        detail: "新建发给自己的草稿。",
        verify: "输入框获得焦点",
      },
      {
        title: "粘贴并待发",
        action: "paste + draft",
        screen: "messages-paste",
        detail: "粘贴地址，生成待发送草稿（不真发）。",
        verify: "草稿含原地址",
      },
    ],
  },
};

const FALLBACK_STEPS = [
  {
    title: "理解提示词",
    action: "parse goal",
    screen: "home",
    detail: "把自由文本收成可执行目标。",
    verify: "目标可解析",
  },
  {
    title: "打开相关应用",
    action: "launch app",
    screen: "settings",
    detail: "按关键词挑一个入口应用。",
    verify: "前台应用已切换",
  },
  {
    title: "执行主操作",
    action: "primary tap",
    screen: "battery",
    detail: "点进最可能完成任务的控件。",
    verify: "关键控件命中",
  },
  {
    title: "汇总结果",
    action: "summarize",
    screen: "home",
    detail: "没有样例脚本时给出干跑摘要。",
    verify: "报告字段齐全",
  },
];

const els = {
  chips: document.querySelector("[data-chips]"),
  prompt: document.querySelector("[data-prompt]"),
  checks: document.querySelector("[data-checks]"),
  run: document.querySelector("[data-run]"),
  stop: document.querySelector("[data-stop]"),
  reset: document.querySelector("[data-reset]"),
  hint: document.querySelector("[data-hint]"),
  screen: document.querySelector("[data-screen]"),
  phoneCap: document.querySelector("[data-phone-cap]"),
  clock: document.querySelector("[data-clock]"),
  runnerMeta: document.querySelector("[data-runner-meta]"),
  plan: document.querySelector("[data-plan]"),
  planList: document.querySelector("[data-plan-list]"),
  log: document.querySelector("[data-log]"),
  report: document.querySelector("[data-report]"),
};

let selectedId = "maps";
let running = false;
let timers = [];

function sleep(ms) {
  return new Promise((resolve) => {
    const id = window.setTimeout(resolve, ms);
    timers.push(id);
  });
}

function clearTimers() {
  timers.forEach((id) => window.clearTimeout(id));
  timers = [];
}

function loadChecks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveChecks(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function readyCount(state) {
  return CHECKS.filter((item) => state[item.id]).length;
}

function profile() {
  return document.querySelector('input[name="profile"]:checked')?.value || "flash";
}

function currentTask() {
  return TASKS[selectedId] || null;
}

function resolvedSteps() {
  const task = currentTask();
  if (task && els.prompt.value.trim() === task.prompt) return task.steps;
  const text = els.prompt.value.toLowerCase();
  if (text.includes("youtube") || text.includes("地图") || text.includes("机场")) {
    return TASKS.maps.steps;
  }
  if (text.includes("电池") || text.includes("设置")) return TASKS.battery.steps;
  if (text.includes("备忘") || text.includes("复制") || text.includes("信息")) {
    return TASKS.note.steps;
  }
  return FALLBACK_STEPS;
}

function renderChips() {
  els.chips.innerHTML = Object.values(TASKS)
    .map(
      (task) => `
        <button type="button" class="chip${selectedId === task.id ? " is-on" : ""}" data-chip="${task.id}" role="listitem">
          ${task.label}
        </button>
      `,
    )
    .join("");
}

function renderChecks() {
  const state = loadChecks();
  els.checks.innerHTML = CHECKS.map(
    (item) => `
      <li>
        <label>
          <input type="checkbox" data-check="${item.id}" ${state[item.id] ? "checked" : ""} />
          <span>${item.label}</span>
        </label>
      </li>
    `,
  ).join("");
  refreshHint();
}

function refreshHint() {
  const state = loadChecks();
  const n = readyCount(state);
  const mode = profile() === "pro" ? "Pro 会先写计划再核验。" : "Flash 会直接逐步点下去。";
  els.hint.textContent = `USB 清单 ${n}/${CHECKS.length}。${mode}`;
}

function renderHome(hot = "") {
  const apps = [
    ["地图", "maps"],
    ["YouTube", "youtube"],
    ["设置", "settings"],
    ["备忘录", "notes"],
    ["信息", "messages"],
    ["相册", ""],
  ];
  return `
    <div class="app-home">
      <h4>Pixel 模拟</h4>
      <div class="grid-apps">
        ${apps
          .map(
            ([name, key]) => `
              <div class="app-tile${hot === key ? " is-hot" : ""}">${name}</div>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function screenHtml(kind) {
  switch (kind) {
    case "maps":
      return `<div class="app-pane"><h4>地图</h4><div class="search">搜地点、公交或车程</div><div class="card-soft">最近：公司 · 家</div></div>`;
    case "maps-search":
      return `<div class="app-pane"><h4>地图</h4><div class="search">机场</div><div class="card-soft is-hot"><b>首都国际机场 T3</b>北京 · 首选结果</div></div>`;
    case "maps-route":
      return `<div class="app-pane"><h4>路线</h4><div class="card-soft"><span class="route">38 分</span>27 km · 最快 · 避开拥堵</div><div class="card-soft">备选 46 分 · 机场巴士</div></div>`;
    case "youtube":
      return `<div class="app-pane"><h4>YouTube</h4><div class="yt-frame">▶</div><div class="card-soft">为你推荐 · 路途歌单</div></div>`;
    case "youtube-play":
      return `<div class="app-pane"><h4>YouTube</h4><div class="yt-frame">♪</div><div class="card-soft"><b>Drive north · lo-fi mix</b>正在播放 · 0:12</div></div>`;
    case "settings":
      return `<div class="app-pane"><h4>设置</h4><div class="settings-row">网络和互联网<span>›</span></div><div class="settings-row is-hot">电池<span>86% ›</span></div><div class="settings-row">显示<span>›</span></div></div>`;
    case "battery":
    case "battery-read":
      return `<div class="app-pane"><h4>电池</h4><div class="battery-ring">86%</div><div class="settings-row">低电量模式<span>关闭</span></div></div>`;
    case "notes":
      return `<div class="app-pane"><h4>备忘录</h4><div class="card-soft"><b>周四评审</b><div class="note-line">议题：范围冻结</div><div class="note-line">8F · 海淀西街 9 号</div></div></div>`;
    case "notes-copy":
      return `<div class="app-pane"><h4>备忘录</h4><div class="card-soft"><b>周四评审</b><div class="note-line is-hot">8F · 海淀西街 9 号</div></div><div class="toast">已复制到剪贴板</div></div>`;
    case "messages":
      return `<div class="app-pane"><h4>信息 · 我</h4><div class="card-soft">新草稿</div><div class="search">输入短信</div></div>`;
    case "messages-paste":
      return `<div class="app-pane"><h4>信息 · 我</h4><div class="msg-bubble">8F · 海淀西街 9 号</div><div class="toast">草稿已就绪 · 未发送</div></div>`;
    default:
      return renderHome();
  }
}

function setScreen(kind, caption) {
  els.screen.innerHTML = screenHtml(kind);
  els.phoneCap.textContent = caption;
}

function tickClock() {
  const now = new Date();
  els.clock.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function traceId() {
  const hex = Math.random().toString(16).slice(2, 10);
  return `art-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${hex}`;
}

function setBusy(isBusy) {
  running = isBusy;
  els.run.disabled = isBusy;
  els.stop.disabled = !isBusy;
  document.querySelectorAll("[data-chip], input[name='profile'], [data-check]").forEach((node) => {
    node.disabled = isBusy;
  });
  els.prompt.disabled = isBusy;
}

function appendLog(step, state, extra = "") {
  const li = document.createElement("li");
  li.className = `is-${state}`;
  li.innerHTML = `
    <div class="meta"><span>${step.action}</span><span>${state}</span></div>
    <strong>${step.title}</strong>
    <div>${step.detail}${extra}</div>
  `;
  els.log.append(li);
  els.log.scrollTop = els.log.scrollHeight;
  return li;
}

function showPlan(steps) {
  els.plan.hidden = false;
  els.planList.innerHTML = steps.map((step) => `<li>${step.title} · ${step.action}</li>`).join("");
}

function hidePlan() {
  els.plan.hidden = true;
  els.planList.innerHTML = "";
}

function renderReport({ ok, steps, mode, id, note }) {
  els.report.innerHTML = `
    <p class="${ok ? "ok" : "warn"}">${ok ? "试跑完成" : "已停止"}</p>
    <h3>${ok ? "设备动作已按脚本走完" : "干跑中断，未写真实设备"}</h3>
    <p>${note}</p>
    <div class="stats">
      <div><b>结果</b>${ok ? "success" : "aborted"}</div>
      <div><b>步数</b>${steps}</div>
      <div><b>档案</b>${mode}</div>
      <div><b>trace</b>${id}</div>
    </div>
  `;
}

async function runLab() {
  if (running) return;
  const steps = resolvedSteps();
  const mode = profile();
  const id = traceId();
  const pace = mode === "flash" ? 1100 : 1700;

  setBusy(true);
  els.log.innerHTML = "";
  hidePlan();
  els.report.innerHTML = `<p class="muted">正在干跑 ${mode} 档案…</p>`;
  els.runnerMeta.textContent = `${mode} · 准备中`;
  setScreen("home", "待命 · 主屏幕");

  if (mode === "pro") {
    showPlan(steps);
    els.runnerMeta.textContent = "Pro · 规划";
    await sleep(900);
    if (!running) return;
  }

  for (let i = 0; i < steps.length; i += 1) {
    if (!running) return;
    const step = steps[i];
    els.runnerMeta.textContent = `${mode} · ${i + 1}/${steps.length}`;
    setScreen(step.screen, `${step.title} · ${step.action}`);
    const row = appendLog(step, "run");
    await sleep(pace);
    if (!running) return;
    row.className = "is-ok";
    row.querySelector(".meta span:last-child").textContent = "ok";
    if (mode === "pro") {
      appendLog(
        {
          title: `核验：${step.verify}`,
          action: "verify",
          detail: "截图对比 + 控件树检查（模拟）。",
        },
        "verify",
      );
      await sleep(700);
    }
  }

  const ready = readyCount(loadChecks());
  renderReport({
    ok: true,
    steps: steps.length,
    mode,
    id,
    note:
      ready === CHECKS.length
        ? "清单齐全。若接真机，这就是 ADB 出发前的状态。"
        : `模拟成功。真机前请补齐 USB 清单（现 ${ready}/${CHECKS.length}）。`,
  });
  els.runnerMeta.textContent = `${mode} · 完成`;
  els.hint.textContent = "可以改提示词或档案再跑一次。";
  setBusy(false);
}

function stopLab() {
  clearTimers();
  if (!running) return;
  renderReport({
    ok: false,
    steps: els.log.querySelectorAll("li.is-ok").length,
    mode: profile(),
    id: "—",
    note: "用户停止。没有对任何设备下发指令。",
  });
  els.runnerMeta.textContent = "已停止";
  setBusy(false);
}

function applyTask(id) {
  selectedId = id;
  els.prompt.value = TASKS[id].prompt;
  renderChips();
}

function resetLab() {
  clearTimers();
  running = false;
  setBusy(false);
  applyTask("maps");
  hidePlan();
  els.log.innerHTML = "";
  els.report.innerHTML = `<p class="muted">跑完后这里会出现成功状态、步数、档案和 trace id。</p>`;
  els.runnerMeta.textContent = "空闲 · 等待开始";
  setScreen("home", "待命 · 主屏幕");
  refreshHint();
}

els.chips.addEventListener("click", (event) => {
  const button = event.target.closest("[data-chip]");
  if (!button || running) return;
  applyTask(button.dataset.chip);
});

els.checks.addEventListener("change", (event) => {
  const box = event.target.closest("[data-check]");
  if (!box) return;
  const state = loadChecks();
  state[box.dataset.check] = box.checked;
  saveChecks(state);
  refreshHint();
});

document.querySelector(".profile").addEventListener("change", refreshHint);

els.run.addEventListener("click", () => {
  runLab().catch((error) => {
    els.hint.textContent = error.message;
    setBusy(false);
  });
});

els.stop.addEventListener("click", stopLab);
els.reset.addEventListener("click", resetLab);

els.prompt.addEventListener("input", () => {
  const match = Object.values(TASKS).find((task) => task.prompt === els.prompt.value.trim());
  selectedId = match?.id || "";
  renderChips();
});

tickClock();
renderChecks();
resetLab();
