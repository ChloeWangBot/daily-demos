const TRIGGERS = {
  text: {
    label: "样例文字",
    placeholder: "例如：午饭 38 元，咖啡加三明治",
    contentKey: "text",
    inputName: "文字",
  },
  screenshot_url: {
    label: "截图链接",
    placeholder: "https://example.com/receipts/lunch.png",
    contentKey: "screenshot_url",
    inputName: "截图链接",
  },
  audio_url: {
    label: "音频链接",
    placeholder: "https://example.com/voice/standup.m4a",
    contentKey: "audio_url",
    inputName: "音频链接",
  },
};

const SAMPLE = {
  trigger: "text",
  label: "记账管家",
  category: "餐饮",
  content: "午饭 38 元，咖啡加三明治",
  amount: "38",
  note: "公司附近",
  useAmount: true,
  useCategory: true,
  useNote: true,
};

const CONTENT_BY_TRIGGER = {
  text: SAMPLE.content,
  screenshot_url: "https://example.com/receipts/lunch.png",
  audio_url: "https://example.com/voice/standup.m4a",
};

const KNOWN_CONTENT = new Set(Object.values(CONTENT_BY_TRIGGER));

const els = {
  generate: document.querySelector("#generate"),
  loadSample: document.querySelector("#load-sample"),
  status: document.querySelector("#status"),
  label: document.querySelector("#label"),
  category: document.querySelector("#category"),
  content: document.querySelector("#content"),
  contentLabel: document.querySelector("#content-label"),
  useAmount: document.querySelector("#use-amount"),
  useCategory: document.querySelector("#use-category"),
  useNote: document.querySelector("#use-note"),
  amountWrap: document.querySelector("#amount-wrap"),
  noteWrap: document.querySelector("#note-wrap"),
  amount: document.querySelector("#amount"),
  note: document.querySelector("#note"),
  keys: document.querySelector("#keys"),
  output: document.querySelector("#output"),
  waiting: document.querySelector("#waiting"),
  steps: document.querySelector("#steps"),
  json: document.querySelector("#json"),
  copySteps: document.querySelector("#copy-steps"),
  copyJson: document.querySelector("#copy-json"),
  urlHint: document.querySelector("#url-hint"),
  toast: document.querySelector("#toast"),
  form: document.querySelector("#planner"),
};

let generated = false;
let snapshot = "";
let toastTimer = 0;

function trigger() {
  const picked = document.querySelector('input[name="trigger"]:checked');
  return picked ? picked.value : "text";
}

function readForm() {
  const kind = trigger();
  return {
    trigger: kind,
    label: els.label.value.trim(),
    category: els.category.value.trim(),
    content: els.content.value.trim(),
    amount: els.amount.value.trim(),
    note: els.note.value.trim(),
    useAmount: els.useAmount.checked,
    useCategory: els.useCategory.checked,
    useNote: els.useNote.checked,
  };
}

function payloadOf(form) {
  const meta = TRIGGERS[form.trigger];
  const body = {
    label: form.label || "未命名助手",
    trigger: form.trigger,
  };
  body[meta.contentKey] = form.content || meta.placeholder;
  if (form.useAmount) body.amount = form.amount;
  if (form.useCategory) body.category = form.category;
  if (form.useNote) body.note = form.note;
  return body;
}

function stepsOf(form, body) {
  const name = body.label;
  const meta = TRIGGERS[form.trigger];
  const extra = [];
  if (form.useAmount) extra.push("amount");
  if (form.useCategory) extra.push("category");
  if (form.useNote) extra.push("note");
  const extraText = extra.length ? `，并写入 ${extra.join("、")}` : "";
  const grab =
    form.trigger === "text"
      ? `加入「要求输入」，提示「要发给${name}的文字」，类型选文本。`
      : form.trigger === "screenshot_url"
        ? "用「选择照片」或分享表单取得截图，并准备一个 https 图片链接。"
        : "用「录音」或「选取文件」取得音频，并准备一个 https 音频链接。";

  return [
    `打开「快捷指令」，新建指令「发给${name}」。`,
    grab,
    `加入「词典」：写入 label、trigger，把${meta.inputName}放进 ${meta.contentKey}${extraText}。`,
    "加入「获取 URL 内容」：方法 POST，请求体选 JSON，贴上右侧样例。",
    "URL 粘贴桌面端 Grok Bot 例程里的 Webhook 地址；请求头加 Authorization: Bearer 与例程 key。",
    `加入「显示通知」：${name}已收到这条${meta.inputName}。`,
  ];
}

function syncContentField() {
  const meta = TRIGGERS[trigger()];
  els.contentLabel.textContent = meta.label;
  els.content.placeholder = meta.placeholder;
  els.content.inputMode = trigger() === "text" ? "text" : "url";
}

function maybeSwapSampleContent(nextTrigger) {
  const current = els.content.value.trim();
  if (current === "" || KNOWN_CONTENT.has(current)) {
    els.content.value = CONTENT_BY_TRIGGER[nextTrigger];
  }
}

function syncExtras() {
  els.amountWrap.hidden = !els.useAmount.checked;
  els.noteWrap.hidden = !els.useNote.checked;
  els.category.disabled = !els.useCategory.checked;
  const keys = ["label", "trigger", TRIGGERS[trigger()].contentKey];
  if (els.useAmount.checked) keys.push("amount");
  if (els.useCategory.checked) keys.push("category");
  if (els.useNote.checked) keys.push("note");
  els.keys.textContent = `JSON 将包含 ${keys.join(" · ")}`;
}

function fingerprint() {
  return JSON.stringify(readForm());
}

function markFreshness() {
  if (!generated) {
    els.status.textContent = "示例已填好，直接点生成。";
    els.status.className = "status";
    els.output.classList.remove("is-stale");
    return;
  }
  const stale = fingerprint() !== snapshot;
  els.output.classList.toggle("is-stale", stale);
  if (stale) {
    els.status.textContent = "字段已改，再点一次生成。";
    els.status.className = "status is-stale";
  } else {
    els.status.textContent = "已生成，可以分别复制步骤和 JSON。";
    els.status.className = "status is-ready";
  }
}

function showToast(message) {
  els.toast.hidden = false;
  els.toast.textContent = message;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 1800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
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

function flashCopied(button, label) {
  button.textContent = "已复制";
  button.classList.add("is-copied");
  window.setTimeout(() => {
    button.textContent = label;
    button.classList.remove("is-copied");
  }, 1400);
}

function render() {
  const form = readForm();
  const body = payloadOf(form);
  const steps = stepsOf(form, body);
  const json = JSON.stringify(body, null, 2);

  els.steps.replaceChildren();
  for (const line of steps) {
    const item = document.createElement("li");
    item.textContent = line;
    els.steps.append(item);
  }
  els.json.textContent = json;
  els.copySteps.disabled = false;
  els.copyJson.disabled = false;
  els.output.hidden = false;
  els.waiting.hidden = true;

  const needsUrl = form.trigger !== "text";
  const content = form.content || TRIGGERS[form.trigger].placeholder;
  const looksUrl = /^https?:\/\/\S+$/i.test(content);
  els.urlHint.hidden = !needsUrl || looksUrl;

  generated = true;
  snapshot = fingerprint();
  markFreshness();
  els.output.scrollIntoView({ behavior: "smooth", block: "nearest" });

  return { steps, json };
}

function applySample() {
  for (const input of document.querySelectorAll('input[name="trigger"]')) {
    input.checked = input.value === SAMPLE.trigger;
  }
  els.label.value = SAMPLE.label;
  els.category.value = SAMPLE.category;
  els.content.value = SAMPLE.content;
  els.amount.value = SAMPLE.amount;
  els.note.value = SAMPLE.note;
  els.useAmount.checked = SAMPLE.useAmount;
  els.useCategory.checked = SAMPLE.useCategory;
  els.useNote.checked = SAMPLE.useNote;
  syncContentField();
  syncExtras();
  markFreshness();
}

let lastBundle = { steps: [], json: "" };

els.generate.addEventListener("click", () => {
  lastBundle = render();
});

els.loadSample.addEventListener("click", () => {
  applySample();
  showToast("已载入记账示例");
});

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  lastBundle = render();
});

els.form.addEventListener("input", () => {
  syncContentField();
  syncExtras();
  markFreshness();
});

els.form.addEventListener("change", () => {
  syncContentField();
  syncExtras();
  markFreshness();
});

for (const input of document.querySelectorAll('input[name="trigger"]')) {
  input.addEventListener("change", () => {
    if (input.checked) maybeSwapSampleContent(input.value);
  });
}

els.copySteps.addEventListener("click", async () => {
  const text = lastBundle.steps.map((line, index) => `${index + 1}. ${line}`).join("\n");
  const ok = await copyText(text);
  if (ok) {
    flashCopied(els.copySteps, "复制步骤");
    showToast("步骤已复制");
  } else {
    showToast("复制失败，请长按文本手动复制");
  }
});

els.copyJson.addEventListener("click", async () => {
  const ok = await copyText(lastBundle.json);
  if (ok) {
    flashCopied(els.copyJson, "复制 JSON");
    showToast("JSON 已复制");
  } else {
    showToast("复制失败，请长按文本手动复制");
  }
});

applySample();
