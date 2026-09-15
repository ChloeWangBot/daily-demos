const STORAGE_KEY = "expense-pad:ledger:v1";
const WEBHOOK_PATH = "https://example.invalid/webhook/ledger-bot";

const CATEGORY_RULES = [
  {
    category: "餐饮",
    words: ["午饭", "午餐", "早饭", "早餐", "晚饭", "晚餐", "宵夜", "外卖", "美团", "饿了么", "咖啡", "拿铁", "奶茶", "堂食", "食堂", "汉堡", "面条", "米饭", "火锅", "烧烤", "零食", "饮料", "瑞幸", "星巴克", "肯德基", "麦当劳", "喜茶", "包子", "馄饨", "饺子", "披萨", "寿司", "沙拉", "水果", "买饭", "吃饭"],
  },
  {
    category: "交通",
    words: ["地铁", "公交", "打车", "滴滴", "出租", "高铁", "火车", "机票", "加油", "停车", "共享单车", "哈啰", "青桔", "过路费", "出租车"],
  },
  {
    category: "日用",
    words: ["超市", "买菜", "日用", "盒马", "便利店", "洗发水", "纸巾", "洗衣液", "水电", "物业"],
  },
  {
    category: "购物",
    words: ["淘宝", "京东", "拼多多", "衣服", "鞋子", "数码", "电器"],
  },
  {
    category: "娱乐",
    words: ["电影", "游戏", "演出", "会员", "酒吧", "KTV"],
  },
  {
    category: "医疗",
    words: ["药", "医院", "诊所", "挂号"],
  },
  {
    category: "住房",
    words: ["房租", "房贷", "中介"],
  },
];

let els = {};

function pad(n) {
  return String(n).padStart(2, "0");
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatClock(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatWhen(iso) {
  const date = new Date(iso);
  return `${dateKey(date)} ${formatClock(date)}`;
}

function yuan(amount) {
  return `¥${amount.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}`;
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : { entries: [] };
    return Array.isArray(parsed.entries) ? parsed : { entries: [] };
  } catch {
    return { entries: [] };
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function parseExpense(text, now = new Date()) {
  const raw = String(text || "").trim().replace(/\s+/g, " ");
  if (!raw) return { ok: false, reason: "empty", raw };

  const time = inferTime(raw, now);
  const amount = inferAmount(raw);
  if (amount == null) {
    return { ok: false, reason: "amount", raw, time };
  }

  const category = inferCategory(raw);
  const note = inferNote(raw, amount);

  return { ok: true, raw, amount, category, note, time: time.toISOString() };
}

function moneyNumbers(raw) {
  const stripped = raw
    .replace(/\d{1,2}[:：]\d{2}/g, " ")
    .replace(/(?:20)?\d{2}[-/.年]\d{1,2}[-/.月]\d{1,2}日?/g, " ");
  return [...stripped.matchAll(/(\d+(?:\.\d{1,2})?)/g)]
    .map((m) => Number(m[1]))
    .filter((n) => n > 0 && n < 100000);
}

function inferAmount(raw) {
  if (/[+＋]/.test(raw)) {
    const parts = moneyNumbers(raw);
    if (parts.length >= 2) return roundMoney(parts.reduce((sum, n) => sum + n, 0));
  }

  const labeled = raw.match(/(?:花了|付了|消费|一共|共|¥|￥)\s*(\d+(?:\.\d{1,2})?)/);
  if (labeled) return roundMoney(Number(labeled[1]));

  const withUnit = raw.match(/(\d+(?:\.\d{1,2})?)\s*(?:元|块钱|块|rmb|RMB)/i);
  if (withUnit) return roundMoney(Number(withUnit[1]));

  const moneyLike = moneyNumbers(raw);
  if (!moneyLike.length) return null;
  return roundMoney(moneyLike[moneyLike.length - 1]);
}

function roundMoney(n) {
  return Math.round(n * 100) / 100;
}

function inferCategory(raw) {
  for (const rule of CATEGORY_RULES) {
    if (rule.words.some((word) => raw.includes(word))) return rule.category;
  }
  return "其他";
}

function inferNote(raw, amount) {
  let note = raw
    .replace(/(?:花了|付了|消费|一共|共)/g, " ")
    .replace(/¥|￥/g, " ")
    .replace(/\d{1,2}[:：]\d{2}/g, " ")
    .replace(/(?:昨天|前天|今天|早上|上午|中午|下午|晚上|夜里)/g, " ")
    .replace(String(amount), " ")
    .replace(/\d+(?:\.\d{1,2})?\s*(?:元|块钱|块|rmb)?/gi, " ")
    .replace(/(?:元|块钱|块)/g, " ")
    .replace(/[+＋\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return note || "未填写备注";
}

function inferTime(raw, now) {
  const date = new Date(now);
  if (raw.includes("前天")) date.setDate(date.getDate() - 2);
  else if (raw.includes("昨天")) date.setDate(date.getDate() - 1);

  const clock = raw.match(/(\d{1,2})[:：](\d{2})/);
  if (clock) {
    let hours = Number(clock[1]);
    const minutes = Number(clock[2]);
    if ((raw.includes("下午") || raw.includes("晚上")) && hours > 0 && hours < 12) hours += 12;
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  if (raw.includes("早上") || raw.includes("上午")) date.setHours(8, 30, 0, 0);
  else if (raw.includes("中午")) date.setHours(12, 0, 0, 0);
  else if (raw.includes("下午")) date.setHours(15, 0, 0, 0);
  else if (raw.includes("晚上") || raw.includes("夜里")) date.setHours(19, 30, 0, 0);
  return date;
}

function selectedChannel() {
  const checked = els.form.querySelector('input[name="channel"]:checked');
  return checked ? checked.value : "text";
}

function channelLabel(channel) {
  if (channel === "screenshot") return "截图";
  if (channel === "audio") return "录音";
  return "文字";
}

function attachmentName() {
  const file = els.file.files && els.file.files[0];
  return file ? file.name : "";
}

function submittedInfo(parsed, channel) {
  if (channel === "screenshot") {
    const name = attachmentName() || "receipt.png";
    return `[截图] ${parsed.raw} · mock://tmp/${encodeURIComponent(name)}`;
  }
  if (channel === "audio") {
    return `[语音转写] ${parsed.raw} · mock://tmp/voice-note.m4a`;
  }
  return parsed.raw;
}

function buildPayload(parsed, channel) {
  return {
    bot: "记账管家",
    dryRun: true,
    source: "expense-pad",
    channel,
    submittedInfo: submittedInfo(parsed, channel),
    parsed: {
      amount: parsed.amount,
      category: parsed.category,
      note: parsed.note,
      time: parsed.time,
    },
    attachment:
      channel === "screenshot"
        ? { type: "image", name: attachmentName() || "receipt.png", uploaded: false }
        : channel === "audio"
          ? { type: "audio", name: "voice-note.m4a", uploaded: false }
          : null,
  };
}

function renderPreview() {
  const parsed = parseExpense(els.raw.value);
  if (!els.raw.value.trim()) {
    els.preview.className = "preview";
    els.preview.textContent = "先写一句花销，这边会拆出金额、类目、备注和时间。";
    return null;
  }
  if (!parsed.ok) {
    els.preview.className = "preview is-bad";
    els.preview.textContent = "没读到金额。补个数字再试，比如「午饭 42 美团」。";
    return parsed;
  }
  els.preview.className = "preview is-ready";
  els.preview.innerHTML = `
    <div class="facts">
      <span class="fact"><b>金额</b>${yuan(parsed.amount)}</span>
      <span class="fact"><b>类目</b>${escapeHtml(parsed.category)}</span>
      <span class="fact"><b>备注</b>${escapeHtml(parsed.note)}</span>
      <span class="fact"><b>时间</b>${escapeHtml(formatWhen(parsed.time))}</span>
    </div>
  `;
  return parsed;
}

function todayEntries(store, now = new Date()) {
  const today = dateKey(now);
  return store.entries
    .filter((entry) => dateKey(new Date(entry.time)) === today)
    .sort((a, b) => new Date(b.time) - new Date(a.time));
}

function renderLedger() {
  const store = loadStore();
  const entries = todayEntries(store);
  const total = entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  els.today.textContent = dateKey(new Date());

  if (!entries.length) {
    els.ledger.hidden = store.entries.length === 0;
    if (store.entries.length) {
      els.ledger.hidden = false;
      els.ledgerMeta.textContent = "今天还是空的。往日记录仍留在本机。";
      els.totals.innerHTML = "";
      els.entries.innerHTML = `<li class="entry"><div>今天还没有入账。</div></li>`;
    }
    return;
  }

  els.ledger.hidden = false;
  els.ledgerMeta.textContent = `${entries.length} 笔 · 合计 ${yuan(total)}`;

  const byCategory = new Map();
  for (const entry of entries) {
    byCategory.set(entry.category, (byCategory.get(entry.category) || 0) + entry.amount);
  }
  const max = Math.max(...byCategory.values());
  els.totals.innerHTML = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(
      ([category, amount]) => `
      <div class="total-row">
        <span>${escapeHtml(category)}</span>
        <div class="bar" aria-hidden="true"><span style="width:${Math.max(8, (amount / max) * 100)}%"></span></div>
        <strong>${yuan(amount)}</strong>
      </div>
    `,
    )
    .join("");

  els.entries.innerHTML = entries
    .map(
      (entry) => `
      <li class="entry">
        <div class="amount">${yuan(entry.amount)}</div>
        <div>
          <div>${escapeHtml(entry.note)} · ${escapeHtml(entry.category)}</div>
          <div class="meta">${escapeHtml(formatWhen(entry.time))} · ${escapeHtml(channelLabel(entry.channel))}</div>
        </div>
        <button type="button" class="drop" data-delete="${escapeHtml(entry.id)}" aria-label="删除这笔记账">删除</button>
      </li>
    `,
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toast(message) {
  document.querySelector(".toast")?.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.remove(), 1800);
}

function syncChannelUi() {
  const channel = selectedChannel();
  els.attach.hidden = channel !== "screenshot";
  for (const label of els.form.querySelectorAll(".chip")) {
    label.classList.toggle("is-on", label.querySelector("input")?.checked);
  }
}

function currentParsedOrLast() {
  const live = parseExpense(els.raw.value);
  if (live.ok) return { parsed: live, channel: selectedChannel() };
  const last = todayEntries(loadStore())[0];
  if (last) {
    return {
      parsed: {
        ok: true,
        raw: last.raw,
        amount: last.amount,
        category: last.category,
        note: last.note,
        time: last.time,
      },
      channel: last.channel || "text",
    };
  }
  return { parsed: live, channel: selectedChannel() };
}

function showWebhook() {
  const { parsed, channel } = currentParsedOrLast();
  if (!parsed.ok) {
    renderPreview();
    toast("先写一笔能读出金额的花销。");
    els.raw.focus();
    return;
  }
  const payload = buildPayload(parsed, channel);
  els.endpoint.textContent = `POST ${WEBHOOK_PATH}`;
  els.payload.textContent = JSON.stringify(payload, null, 2);
  els.sheet.showModal();
}

function exportCsv() {
  const entries = todayEntries(loadStore());
  if (!entries.length) {
    toast("今天还没有可导出的记录。");
    return;
  }
  const header = ["时间", "金额", "类目", "备注", "渠道", "原文"];
  const rows = entries.map((entry) =>
    [formatWhen(entry.time), entry.amount, entry.category, entry.note, channelLabel(entry.channel), entry.raw].map(
      csvCell,
    ),
  );
  const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `expense-pad-${dateKey(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast("已导出今天的 CSV。");
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function init() {
  els = {
    form: document.querySelector("[data-form]"),
    raw: document.querySelector("[data-raw]"),
    preview: document.querySelector("[data-preview]"),
    attach: document.querySelector("[data-attach]"),
    file: document.querySelector("[data-file]"),
    fileLabel: document.querySelector("[data-file-label]"),
    ledger: document.querySelector("[data-ledger]"),
    ledgerMeta: document.querySelector("[data-ledger-meta]"),
    totals: document.querySelector("[data-totals]"),
    entries: document.querySelector("[data-entries]"),
    sheet: document.querySelector("[data-sheet]"),
    endpoint: document.querySelector("[data-endpoint]"),
    payload: document.querySelector("[data-payload]"),
    today: document.querySelector("[data-today]"),
  };

  els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const parsed = parseExpense(els.raw.value);
  renderPreview();
  if (!parsed.ok) {
    els.raw.focus();
    return;
  }
  const store = loadStore();
  store.entries.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    raw: parsed.raw,
    amount: parsed.amount,
    category: parsed.category,
    note: parsed.note,
    time: parsed.time,
    channel: selectedChannel(),
    attachment: attachmentName() || null,
  });
  saveStore(store);
  els.raw.value = "";
  els.file.value = "";
  els.fileLabel.textContent = "附一张收据截图（只留文件名，不上传）";
  renderPreview();
  renderLedger();
  toast("已写入今日账本。");
});

els.raw.addEventListener("input", renderPreview);
els.form.addEventListener("change", (event) => {
  if (event.target.name === "channel") syncChannelUi();
  if (event.target === els.file && els.file.files[0]) {
    els.fileLabel.textContent = `已选 ${els.file.files[0].name}（本地文件名，不上传）`;
  }
});

document.querySelector("[data-webhook]").addEventListener("click", showWebhook);
document.querySelector("[data-export]").addEventListener("click", exportCsv);
document.querySelector("[data-clear]").addEventListener("click", () => {
  const store = loadStore();
  const today = dateKey(new Date());
  const kept = store.entries.filter((entry) => dateKey(new Date(entry.time)) !== today);
  if (kept.length === store.entries.length) {
    toast("今天本来就是空的。");
    return;
  }
  if (!confirm("清空今天的账本？只删今天，往日记录还在。")) return;
  saveStore({ entries: kept });
  renderLedger();
  toast("今天已清空。");
});

document.querySelector("[data-copy-payload]").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.payload.textContent);
    toast("报文已复制。");
  } catch {
    toast("复制失败，请手动选中。");
  }
});

els.entries.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  const store = loadStore();
  store.entries = store.entries.filter((entry) => entry.id !== button.dataset.delete);
  saveStore(store);
  renderLedger();
  toast("已删除。");
});

for (const button of document.querySelectorAll("[data-example]")) {
  button.addEventListener("click", () => {
    els.raw.value = button.dataset.example;
    els.raw.focus();
    els.raw.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

  syncChannelUi();
  renderPreview();
  renderLedger();
}

if (typeof document !== "undefined") init();
