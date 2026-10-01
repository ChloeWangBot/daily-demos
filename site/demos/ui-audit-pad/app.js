const SCREENS = {
  settings: {
    label: "设置",
    keys: ["设置", "settings", "setting"],
    primaryExample: "保存",
    emptyExample: "还没有通知来源。新提醒会出现在这里。",
    emptyActionExample: "添加来源",
  },
  onboarding: {
    label: "新手引导",
    keys: ["新手引导", "引导", "onboarding"],
    primaryExample: "继续",
    emptyExample: "还没有示例。点下面即可看第一张。",
    emptyActionExample: "查看示例",
  },
  empty: {
    label: "空状态",
    keys: ["空状态", "empty", "empty state"],
    primaryExample: "写第一封信",
    emptyExample: "还没有邮件。新消息会出现在这里。",
    emptyActionExample: "写第一封信",
  },
  form: {
    label: "表单",
    keys: ["表单", "form"],
    primaryExample: "创建提醒",
    emptyExample: "名称还空着。写几个字再保存。",
    emptyActionExample: "回到名称",
  },
};

const SCREEN_ORDER = ["settings", "onboarding", "empty", "form"];

export const SAMPLES = {
  settings: `画面: 设置
标题: 通知
说明: 选择哪些提醒可以发到这台设备。
主按钮: 保存
次按钮: 取消
热区: 44pt
对比: #1d1d1f / #ffffff
对比: #8e8e93 / #f5f5f7
字号: 标题 22 正文 17 辅助 13
空状态: 还没有通知来源。
空状态按钮: 添加来源`,
  onboarding: `screen: onboarding
title: Welcome to the revolutionary next-gen synergistic platform!!!
body: Please utilize our comprehensive suite to leverage AI and maximize ROI across every paradigm.
primary: Submit
secondary: Skip for now maybe later if you want
tap: 28px
contrast: #b0b0b0 / #ffffff
size: title 18 body 17 caption 16
empty:`,
  empty: `画面: 空状态
标题: 收件箱
说明:
主按钮:
热区: 44pt
对比: #1d1d1f / #f5f5f7
字号: 标题 22 正文 17 辅助 13
空状态: 暂无数据
空状态按钮:`,
  form: `画面: 表单
标题: 新建提醒
说明: 填写下面的信息后提交即可完成创建流程。
主按钮: 确定
次按钮: 取消
热区: 36pt
对比: #3a3a3c / #ffffff
字号: 标题 17 正文 17 辅助 12
占位符: 请输入
错误:
空状态:`,
};

const KEYS = new Map([
  ["画面", "screen"],
  ["screen", "screen"],
  ["标题", "title"],
  ["title", "title"],
  ["headline", "title"],
  ["说明", "body"],
  ["正文", "body"],
  ["body", "body"],
  ["主按钮", "primary"],
  ["primary", "primary"],
  ["cta", "primary"],
  ["次按钮", "secondary"],
  ["secondary", "secondary"],
  ["热区", "tap"],
  ["tap", "tap"],
  ["对比", "contrast"],
  ["contrast", "contrast"],
  ["字号", "size"],
  ["size", "size"],
  ["空状态", "empty"],
  ["empty", "empty"],
  ["空状态按钮", "emptyAction"],
  ["empty action", "emptyAction"],
  ["占位符", "placeholder"],
  ["placeholder", "placeholder"],
  ["错误", "error"],
  ["error", "error"],
]);

const JARGON = [
  [/赋能/u, "赋能"],
  [/抓手/u, "抓手"],
  [/闭环/u, "闭环"],
  [/底层逻辑/u, "底层逻辑"],
  [/颠覆/u, "颠覆"],
  [/revolutionary/i, "revolutionary"],
  [/next-gen/i, "next-gen"],
  [/synerg\w*/i, "synergy"],
  [/leverage/i, "leverage"],
  [/paradigm/i, "paradigm"],
  [/utilize/i, "utilize"],
  [/maximize roi/i, "maximize ROI"],
  [/comprehensive suite/i, "comprehensive suite"],
  [/empower/i, "empower"],
];

const VAGUE =
  /^(确定|确认|好的|好|是|否|ok|okay|submit|click here|点击这里|点这里|yes|no|done|提交|点击|按钮)$/i;

const VERB_CN =
  /^(保存|继续|下一步|开始|开启|关闭|允许|添加|创建|删除|发送|分享|重试|打开|更新|应用|登录|注册|跳过|取消|返回|编辑|搜索|导出|导入|完成|获取|查看|了解|新建|去|写)/;
const VERB_EN =
  /^(save|continue|next|get started|allow|turn on|create|add|send|delete|share|retry|skip|cancel|sign in|back|edit|search|start)\b/i;

const GENERIC_EMPTY =
  /^(暂无数据|暂无内容|没有数据|无数据|无内容|暂无|空|无|empty|no data|no items|nothing here|nothing to show)\.?$/i;

const FILLER = /填写下面|请填写以下|如下信息|提交即可|please fill|lorem ipsum/i;

const STATUS_LABEL = { fail: "未过", warn: "警告", pass: "通过" };
const STATUS_RANK = { fail: 0, warn: 1, pass: 2 };

const state = {
  screen: "settings",
  filter: "all",
  report: null,
  source: "",
};

export function audit(raw, screenHint) {
  const text = String(raw || "").replace(/\r\n/g, "\n");
  if (!text.trim()) return null;
  const parsed = parse(text);
  const screen = resolveScreen(parsed.screen, screenHint);
  const items = [
    checkPrimary(parsed, screen),
    checkHierarchy(parsed),
    checkTap(parsed),
    checkContrast(parsed),
    checkRecovery(parsed, screen),
    checkButtons(parsed, screen),
    checkVoice(parsed),
  ].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
  return { screen, parsed, items };
}

function parse(text) {
  const parsed = {
    structured: false,
    screen: "",
    title: "",
    body: "",
    primary: [],
    secondary: "",
    taps: [],
    pairs: [],
    sizes: {},
    empty: "",
    emptyAction: "",
    placeholder: "",
    error: "",
  };
  const leftover = [];

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^([^:：]{1,16})[:：]\s*(.*)$/);
    const key = match ? KEYS.get(match[1].trim().toLowerCase()) : null;
    if (!key) {
      leftover.push(trimmed);
      continue;
    }
    parsed.structured = true;
    assignField(parsed, key, match[2].trim());
  }

  if (!parsed.structured) {
    parsed.title = leftover[0] || "";
    parsed.body = leftover.slice(1).join(" ");
  }

  mineMeasurements(text, parsed);
  parsed.taps = unique(parsed.taps);
  parsed.pairs = uniquePairs(parsed.pairs);
  parsed.primary = unique(parsed.primary.map((item) => item.trim()).filter(Boolean));
  return parsed;
}

function assignField(parsed, key, value) {
  if (key === "primary") {
    parsed.primary.push(...splitActions(value));
    return;
  }
  if (key === "tap") {
    parsed.taps.push(...readTaps(value));
    return;
  }
  if (key === "contrast") {
    const pair = readPair(value);
    if (pair) parsed.pairs.push(pair);
    return;
  }
  if (key === "size") {
    Object.assign(parsed.sizes, readSizes(value));
    return;
  }
  parsed[key] = value;
}

function splitActions(value) {
  return value
    .split(/\s*(?:\/|、|,|，|\|)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function readTaps(value) {
  const found = [];
  const re = /(\d+(?:\.\d+)?)\s*(px|pt)\b/gi;
  let match = re.exec(value);
  while (match) {
    found.push(Number(match[1]));
    match = re.exec(value);
  }
  return found;
}

function readPair(value) {
  const hexes = [];
  const re = /#([0-9a-f]{3}|[0-9a-f]{6})\b/gi;
  let match = re.exec(value);
  while (match) {
    hexes.push(normalizeHex(match[1]));
    match = re.exec(value);
  }
  if (hexes.length < 2) return null;
  return { fg: hexes[0], bg: hexes[1] };
}

function readSizes(value) {
  const sizes = {};
  const map = {
    标题: "title",
    title: "title",
    正文: "body",
    body: "body",
    说明: "body",
    辅助: "caption",
    caption: "caption",
    注释: "caption",
  };
  const re = /(标题|title|正文|body|说明|辅助|caption|注释)\s*(\d+(?:\.\d+)?)/gi;
  let match = re.exec(value);
  while (match) {
    const slot = map[match[1].toLowerCase()] || map[match[1]];
    if (slot) sizes[slot] = Number(match[2]);
    match = re.exec(value);
  }
  return sizes;
}

function mineMeasurements(text, parsed) {
  parsed.taps.push(...readTaps(text));
  const lines = text.split("\n");
  for (const line of lines) {
    const pair = readPair(line);
    if (pair) parsed.pairs.push(pair);
  }
}

function resolveScreen(value, hint) {
  const raw = String(value || "").trim().toLowerCase();
  for (const id of SCREEN_ORDER) {
    if (SCREENS[id].keys.includes(raw)) return id;
  }
  if (hint && SCREENS[hint]) return hint;
  return "settings";
}

function checkPrimary(parsed, screen) {
  const meta = SCREENS[screen];
  const actions =
    screen === "empty"
      ? parsed.primary.length
        ? parsed.primary
        : parsed.emptyAction
          ? [parsed.emptyAction]
          : []
      : parsed.primary;
  const rule = "一个画面只强调一个主操作。";
  if (actions.length === 0) {
    return row({
      id: "primary",
      category: "层级",
      title: "单一主操作",
      status: "fail",
      detail: "没有找到主按钮。",
      fix:
        screen === "empty"
          ? `加一个离开空白的按钮，例如「${meta.primaryExample}」。`
          : `放一个主按钮，文案用动词，例如「${meta.primaryExample}」。`,
      rule,
    });
  }
  if (actions.length > 1) {
    return row({
      id: "primary",
      category: "层级",
      title: "单一主操作",
      status: "fail",
      detail: `主按钮有 ${actions.length} 个：${quoteList(actions)}。`,
      fix: "只留一个主按钮。其余改成次按钮或文字链。",
      rule,
    });
  }
  const extra =
    screen !== "empty" && parsed.emptyAction
      ? `空状态另有「${parsed.emptyAction}」，不和主按钮抢。`
      : "";
  return row({
    id: "primary",
    category: "层级",
    title: "单一主操作",
    status: "pass",
    detail: [`主操作是「${actions[0]}」。`, extra].filter(Boolean).join(""),
    fix: "保持只有一个实心主按钮。",
    rule,
  });
}

function checkHierarchy(parsed) {
  const rule = "标题短于说明，字号逐级变小，相邻至少差 2pt。";
  const notes = [];
  let status = "pass";
  const title = parsed.title.trim();
  const { title: titleSize, body: bodySize, caption: captionSize } = parsed.sizes;

  if (!title) {
    return row({
      id: "hierarchy",
      category: "层级",
      title: "标题层级",
      status: "fail",
      detail: "没有标题。",
      fix: "加一行短标题，说明这个画面是干什么的。",
      rule,
    });
  }

  const long = titleTooLong(title);
  const fixes = [];
  if (long) {
    status = worse(status, "warn");
    notes.push(`标题有 ${long}，第一眼读不完。`);
    fixes.push("把标题收成一句短语，细节放进说明。");
  }

  const sized = titleSize || bodySize || captionSize;
  if (!sized) {
    status = worse(status, "warn");
    notes.push("没有标注字号。");
    fixes.push("补上字号，例如标题 22、正文 17、辅助 13。");
  } else {
    if (titleSize && bodySize && titleSize <= bodySize) {
      status = worse(status, "fail");
      notes.push(`标题 ${trimNum(titleSize)}pt，正文 ${trimNum(bodySize)}pt，标题没有更大。`);
      fixes.push("把标题加大到正文以上，建议 22 / 17 / 13。");
    } else if (titleSize && bodySize && titleSize - bodySize < 2) {
      status = worse(status, "warn");
      notes.push(`标题和正文只差 ${trimNum(titleSize - bodySize)}pt。`);
      fixes.push("标题至少比正文大 2pt。");
    }
    if (bodySize && captionSize && captionSize >= bodySize) {
      status = worse(status, "fail");
      notes.push(`辅助字 ${trimNum(captionSize)}pt，不小于正文 ${trimNum(bodySize)}pt。`);
      fixes.push("辅助说明要小于正文。");
    }
    if (!fixes.length) {
      const bits = [
        titleSize ? `标题 ${trimNum(titleSize)}` : "",
        bodySize ? `正文 ${trimNum(bodySize)}` : "",
        captionSize ? `辅助 ${trimNum(captionSize)}` : "",
      ].filter(Boolean);
      notes.push(`字号 ${bits.join(" / ")}pt，逐级变小。`);
    }
  }

  if (!long) notes.unshift(`标题「${clip(title, 28)}」够短。`);

  const fix = status === "pass" ? "维持标题短、字号逐级下降。" : fixes.join("");

  return row({
    id: "hierarchy",
    category: "层级",
    title: "标题层级",
    status,
    detail: notes.join(" "),
    fix,
    rule,
  });
}

function checkTap(parsed) {
  const rule = "可点区域至少 44×44pt。标成 px 时按 1 倍屏幕估算。";
  if (!parsed.taps.length) {
    return row({
      id: "tap",
      category: "热区",
      title: "最小热区 44pt",
      status: "warn",
      detail: "文案里没有热区尺寸。",
      fix: "把可点控件标到至少 44×44pt，间距另外留。",
      rule,
    });
  }
  const min = Math.min(...parsed.taps);
  const listed = parsed.taps.map((n) => `${trimNum(n)}pt`).join("、");
  if (min < 44) {
    return row({
      id: "tap",
      category: "热区",
      title: "最小热区 44pt",
      status: "fail",
      detail: `标了 ${listed}，最小 ${trimNum(min)}pt。`,
      fix: `把可点区域加到 44×44pt。现在最小是 ${trimNum(min)}pt。`,
      rule,
    });
  }
  return row({
    id: "tap",
    category: "热区",
    title: "最小热区 44pt",
    status: "pass",
    detail: `${listed}，都不小于 44pt。`,
    fix: "继续按 44×44pt 留热区，不要只加大图标。",
    rule,
  });
}

function checkContrast(parsed) {
  const rule = "小于 18pt 的文字，对比度按 4.5:1 计。";
  if (!parsed.pairs.length) {
    return row({
      id: "contrast",
      category: "对比",
      title: "文字对比度",
      status: "warn",
      detail: "没有写前景色和背景色。",
      fix: "补一组颜色，例如 #1d1d1f / #ffffff，并让正文达到 4.5:1。",
      rule,
    });
  }
  const target = contrastTarget(parsed.sizes);
  const measured = parsed.pairs.map((pair, index) => ({
    ...pair,
    index,
    ratio: contrastRatio(pair.fg, pair.bg),
  }));
  const worst = measured.reduce((a, b) => (a.ratio < b.ratio ? a : b));
  const status = worst.ratio < target ? "fail" : "pass";
  const detail = measured
    .map((pair) => {
      const name = measured.length > 1 ? (pair.index === 0 ? "第一组" : "下一组") : "这组";
      const mark = pair.ratio < target ? `，低于 ${target.toFixed(1)}:1` : "";
      return `${name} ${pair.fg} / ${pair.bg} 为 ${formatRatio(pair.ratio)}${mark}`;
    })
    .join("。") + "。";
  const failing = measured.filter((pair) => pair.ratio < target);
  const fix = failing.length
    ? failing
        .map((pair) => {
          const next = suggestForeground(pair.fg, pair.bg, target);
          return `把 ${pair.fg} 调到 ${next}（在 ${pair.bg} 上约 ${formatRatio(contrastRatio(next, pair.bg))}）。`;
        })
        .join(" ")
    : "这组对比度够用，辅助字也别调淡。";
  return row({
    id: "contrast",
    category: "对比",
    title: "文字对比度",
    status,
    detail,
    fix,
    rule,
  });
}

function checkRecovery(parsed, screen) {
  const meta = SCREENS[screen];
  const rule = "空白或失败时，要写原因，并给一个下一步。";
  if (screen === "form") {
    const error = parsed.error.trim();
    const placeholder = parsed.placeholder.trim();
    const genericPlaceholder = /^(请输入|请填写|请选择|enter|type here|placeholder)$/i.test(placeholder);
    if (!error && genericPlaceholder) {
      return row({
        id: "recovery",
        category: "空状态",
        title: "失败时有去处",
        status: "fail",
        detail: `占位符是「${placeholder}」，也没有错误文案。`,
        fix: "标签常驻在框外。校验失败时写清差了什么，例如「名称还空着」。",
        rule,
      });
    }
    if (!error) {
      return row({
        id: "recovery",
        category: "空状态",
        title: "失败时有去处",
        status: "warn",
        detail: "没有错误文案。",
        fix: "校验失败时说明原因和下一步，不要只把框变红。",
        rule,
      });
    }
    if (genericPlaceholder) {
      return row({
        id: "recovery",
        category: "空状态",
        title: "失败时有去处",
        status: "warn",
        detail: "有错误文案，但占位符仍像唯一标签。",
        fix: "把「请输入」换成常驻标签，占位符只放例子。",
        rule,
      });
    }
    return row({
      id: "recovery",
      category: "空状态",
      title: "失败时有去处",
      status: "pass",
      detail: `错误文案是「${clip(error, 36)}」。`,
      fix: "失败时继续说原因，并告诉人改哪一项。",
      rule,
    });
  }

  const text = parsed.empty.trim();
  const action = parsed.emptyAction.trim();
  const generic = !text || GENERIC_EMPTY.test(text);
  const title = "空状态有去处";

  if (screen === "empty") {
    if (generic && !action) {
      return row({
        id: "recovery",
        category: "空状态",
        title,
        status: "fail",
        detail: text ? `只写了「${text}」，没有原因，也没有按钮。` : "空状态是空的。",
        fix: `换成原因加动作。例如「${meta.emptyExample}」按钮「${meta.emptyActionExample}」。`,
        rule,
      });
    }
    if (generic) {
      return row({
        id: "recovery",
        category: "空状态",
        title,
        status: "warn",
        detail: `有按钮「${action}」，但说明仍是空话。`,
        fix: `先写为什么是空的，例如「${meta.emptyExample}」。`,
        rule,
      });
    }
    if (!action) {
      return row({
        id: "recovery",
        category: "空状态",
        title,
        status: "warn",
        detail: `说明是「${clip(text, 36)}」，没有下一步。`,
        fix: `补一个按钮，例如「${meta.emptyActionExample}」。`,
        rule,
      });
    }
    return row({
      id: "recovery",
      category: "空状态",
      title,
      status: "pass",
      detail: `「${clip(text, 28)}」配有「${action}」。`,
      fix: "空状态继续同时给原因和动作。",
      rule,
    });
  }

  if (!text && !action) {
    return row({
      id: "recovery",
      category: "空状态",
      title,
      status: "warn",
      detail: "没有写列表为空时的文案。",
      fix: `补一句原因和一个动作，例如「${meta.emptyExample}」与「${meta.emptyActionExample}」。`,
      rule,
    });
  }
  if (generic || !action) {
    return row({
      id: "recovery",
      category: "空状态",
      title,
      status: "warn",
      detail: generic ? "空状态还是「暂无数据」这类空话。" : "空状态说了原因，但没有动作。",
      fix: `写成「${meta.emptyExample}」，并给按钮「${meta.emptyActionExample}」。`,
      rule,
    });
  }
  return row({
    id: "recovery",
    category: "空状态",
    title,
    status: "pass",
    detail: `空状态「${clip(text, 28)}」，动作「${action}」。`,
    fix: "列表为空时保持这句原因和这个动作。",
    rule,
  });
}

function checkButtons(parsed, screen) {
  const meta = SCREENS[screen];
  const rule = "按钮用具体动词，次要操作保持短。";
  const label = (screen === "empty" && !parsed.primary[0] ? parsed.emptyAction : parsed.primary[0] || "").trim();
  const secondary = parsed.secondary.trim();
  const notes = [];
  let status = "pass";

  if (!label) {
    status = "warn";
    notes.push("还没有按钮文案。");
  } else if (VAGUE.test(label)) {
    status = "fail";
    notes.push(`「${label}」太泛，看不出会做什么。`);
  } else if (labelUnits(label) > (mostlyCjk(label) ? 8 : 22)) {
    status = "warn";
    notes.push(`「${label}」偏长。`);
  } else if (!isVerb(label)) {
    status = "warn";
    notes.push(`「${label}」不像一个动作。`);
  } else {
    notes.push(`「${label}」是明确动作。`);
  }

  if (secondary && [...secondary].length > 16) {
    status = worse(status, "warn");
    notes.push(`次按钮「${clip(secondary, 42)}」像一句话。`);
  }

  const fix =
    status === "pass"
      ? "主按钮继续用动词，次按钮保持两三个字。"
      : VAGUE.test(label)
        ? `把「${label}」改成具体动作，例如「${meta.primaryExample}」。`
        : secondary && [...secondary].length > 16
          ? "次按钮改成短词，例如「跳过」或「取消」。"
          : `主按钮写成动词，例如「${meta.primaryExample}」。`;

  return row({
    id: "buttons",
    category: "文案",
    title: "按钮说动作",
    status,
    detail: notes.join(" "),
    fix,
    rule,
  });
}

function checkVoice(parsed) {
  const rule = "避免口号、黑话和感叹号。一句话说明结果。";
  const blob = [parsed.title, parsed.body].filter((part) => part && part.trim()).join("\n");
  if (!blob.trim()) {
    return row({
      id: "voice",
      category: "文案",
      title: "句子说人话",
      status: "warn",
      detail: "没有可阅读的标题或说明。",
      fix: "用一句话写清这个画面能做什么。",
      rule,
    });
  }
  const hits = [];
  for (const [pattern, name] of JARGON) {
    if (pattern.test(blob) && !hits.includes(name)) hits.push(name);
  }
  const bangs = (blob.match(/[!！]/g) || []).length;
  const filler = FILLER.test(blob);
  const body = parsed.body.trim();
  const longBody = body && (mostlyCjk(body) ? [...body].length > 48 : body.split(/\s+/).length > 28);
  const notes = [];
  let status = "pass";

  if (hits.length || bangs >= 2) {
    status = "fail";
    const jargon = hits.slice(0, 3).join("、");
    notes.push(
      [
        jargon ? `出现了 ${jargon}` : "",
        bangs >= 2 ? "还有连续感叹号" : "",
      ]
        .filter(Boolean)
        .join("，") + "。",
    );
  }
  if (filler) {
    status = worse(status, "warn");
    notes.push("说明在交代流程，没有说结果。");
  }
  if (longBody) {
    status = worse(status, "warn");
    notes.push("说明偏长，首屏一句就该说完。");
  }
  if (status === "pass") {
    notes.push(parsed.body.trim() ? "标题和说明都短，没有口号腔。" : "标题够短，没有口号腔。");
  }

  const fix =
    status === "fail"
      ? "改成用户能完成的那件事。少用口号，去掉感叹号。"
      : filler
        ? "换成结果。例如「到点会响一声。」"
        : longBody
          ? "说明收成一句，细节留给下一屏。"
          : "保持短句，直接说结果。";

  return row({
    id: "voice",
    category: "文案",
    title: "句子说人话",
    status,
    detail: notes.join(" "),
    fix,
    rule,
  });
}

function row(entry) {
  return entry;
}

function worse(current, next) {
  return STATUS_RANK[next] < STATUS_RANK[current] ? next : current;
}

function isVerb(label) {
  const text = label.trim();
  if (VAGUE.test(text)) return false;
  return VERB_CN.test(text) || VERB_EN.test(text);
}

function titleTooLong(title) {
  if (mostlyCjk(title)) {
    const count = [...title].length;
    return count > 18 ? `${count} 个字` : "";
  }
  const words = title.replace(/[!！。.]/g, "").trim().split(/\s+/).filter(Boolean);
  return words.length > 6 ? `${words.length} 个词` : "";
}

function labelUnits(label) {
  return [...label.replace(/\s+/g, "")].length;
}

function mostlyCjk(value) {
  const chars = [...value];
  if (!chars.length) return false;
  const cjk = chars.filter((ch) => /[\u4e00-\u9fff]/.test(ch)).length;
  return cjk >= chars.length * 0.3;
}

function contrastTarget(sizes) {
  const known = [sizes.title, sizes.body, sizes.caption].filter((n) => typeof n === "number");
  if (known.length && known.every((n) => n >= 18)) return 3;
  return 4.5;
}

function normalizeHex(raw) {
  let hex = raw.toLowerCase();
  if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
  return `#${hex}`;
}

function hexToRgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }) {
  const channel = (value) => Math.round(value).toString(16).padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function mixHex(from, to, amount) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  });
}

function channelLinear(value) {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLinear(r) + 0.7152 * channelLinear(g) + 0.0722 * channelLinear(b);
}

function contrastRatio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  const light = Math.max(a, b);
  const dark = Math.min(a, b);
  return (light + 0.05) / (dark + 0.05);
}

function suggestForeground(fg, bg, target) {
  const toward = luminance(bg) > 0.5 ? "#000000" : "#ffffff";
  let best = toward;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 18; i += 1) {
    const mid = (low + high) / 2;
    const color = mixHex(fg, toward, mid);
    if (contrastRatio(color, bg) >= target) {
      best = color;
      high = mid;
    } else {
      low = mid;
    }
  }
  return best;
}

function formatRatio(value) {
  return `${value.toFixed(1)}:1`;
}

function unique(values) {
  return [...new Set(values)];
}

function uniquePairs(pairs) {
  const seen = new Set();
  const result = [];
  for (const pair of pairs) {
    const key = `${pair.fg}|${pair.bg}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(pair);
  }
  return result;
}

function trimNum(value) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);
}

function clip(value, max) {
  const chars = [...value];
  if (chars.length <= max) return value;
  return `${chars.slice(0, max).join("")}…`;
}

function quoteList(values) {
  return values.map((value) => `「${value}」`).join("、");
}

function boot() {
  const snippet = document.querySelector("#snippet");
  const hint = document.querySelector("#hint");
  const btnAudit = document.querySelector("#btn-audit");
  const btnCopy = document.querySelector("#btn-copy");
  const placeholder = document.querySelector("#placeholder");
  const score = document.querySelector("#score");
  const readout = document.querySelector("#readout");
  const stats = document.querySelector("#stats");
  const stale = document.querySelector("#stale");
  const filters = document.querySelector("#filters");
  const list = document.querySelector("#list");
  const filterEmpty = document.querySelector("#filter-empty");
  const toast = document.querySelector("#toast");
  let toastTimer = 0;

  function showToast(message) {
    toast.hidden = false;
    toast.textContent = message;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }

  function setPressed(selector, attr, value) {
    document.querySelectorAll(selector).forEach((button) => {
      const on = button.getAttribute(attr) === value;
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function loadSample(id) {
    const sample = SAMPLES[id];
    if (!sample) return;
    state.screen = id;
    snippet.value = sample;
    setPressed(".example", "data-load", id);
    setPressed(".screen", "data-screen", id);
    const label = SCREENS[id].label;
    hint.textContent = `已载入「${label}」样例。Ctrl + Enter 同样会审计。`;
    markStale();
  }

  function markStale() {
    if (!state.report) return;
    stale.hidden = snippet.value === state.source;
  }

  function render() {
    const report = state.report;
    if (!report) {
      placeholder.hidden = false;
      score.hidden = true;
      filters.hidden = true;
      btnCopy.hidden = true;
      list.innerHTML = "";
      filterEmpty.hidden = true;
      return;
    }
    placeholder.hidden = true;
    score.hidden = false;
    filters.hidden = false;
    btnCopy.hidden = false;
    stale.hidden = snippet.value === state.source;

    const counts = { fail: 0, warn: 0, pass: 0 };
    for (const item of report.items) counts[item.status] += 1;
    const screenLabel = SCREENS[report.screen].label;
    const mode = report.parsed.structured ? "按字段阅读" : "未识别字段，已把首行当作标题";
    readout.textContent = `${mode} · 画面 ${screenLabel} · ${summarize(report)}`;
    stats.innerHTML = ["fail", "warn", "pass"]
      .map(
        (key) =>
          `<div class="stat ${key}"><b>${counts[key]}</b><span>${STATUS_LABEL[key]}</span></div>`,
      )
      .join("");

    const visible = report.items.filter((item) => state.filter === "all" || item.status === state.filter);
    list.innerHTML = visible.map(renderItem).join("");
    filterEmpty.hidden = visible.length !== 0;
  }

  function summarize(report) {
    const bits = [];
    if (report.parsed.title) bits.push(`标题「${clip(report.parsed.title, 18)}」`);
    if (report.parsed.primary.length) bits.push(`主按钮${quoteList(report.parsed.primary)}`);
    if (report.parsed.taps.length) bits.push(`热区 ${report.parsed.taps.map((n) => trimNum(n)).join("/")}pt`);
    if (report.parsed.pairs.length) bits.push(`${report.parsed.pairs.length} 组颜色`);
    return bits.join(" · ");
  }

  function renderItem(item) {
    return `<article class="row ${item.status}">
      <div class="row-top">
        <span class="pill ${item.status}">${STATUS_LABEL[item.status]}</span>
        <span class="cat">${escapeHtml(item.category)}</span>
        <h3>${escapeHtml(item.title)}</h3>
      </div>
      <p class="detail">${escapeHtml(item.detail)}</p>
      <p class="fix"><b>修复</b> ${escapeHtml(item.fix)}</p>
      <p class="rule">规则 · ${escapeHtml(item.rule)}</p>
    </article>`;
  }

  function runAudit() {
    const report = audit(snippet.value, state.screen);
    if (!report) {
      state.report = null;
      state.source = "";
      render();
      showToast("先贴一段文案，或点一个样例");
      return;
    }
    state.report = report;
    state.screen = report.screen;
    state.source = snippet.value;
    setPressed(".screen", "data-screen", report.screen);
    render();
    score.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function fixListText() {
    const report = state.report;
    if (!report) return "";
    const issues = report.items.filter((item) => item.status !== "pass");
    const counts = { fail: 0, warn: 0, pass: 0 };
    for (const item of report.items) counts[item.status] += 1;
    const lines = [
      `UI 审计垫 · ${SCREENS[report.screen].label}`,
      `${counts.pass} 通过 · ${counts.warn} 警告 · ${counts.fail} 未过`,
      "",
    ];
    if (!issues.length) {
      lines.push("没有待修复项。");
      return lines.join("\n");
    }
    for (const item of issues) {
      lines.push(
        `${STATUS_LABEL[item.status]} · ${item.category} · ${item.title}`,
        `观察：${item.detail}`,
        `修复：${item.fix}`,
        "",
      );
    }
    return lines.join("\n").trim();
  }

  async function copyFixes() {
    const text = fixListText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    const issues = state.report.items.filter((item) => item.status !== "pass").length;
    showToast(issues ? `已复制 ${issues} 条修复` : "已复制，没有待修复项");
  }

  document.querySelectorAll("[data-load]").forEach((button) => {
    button.addEventListener("click", () => loadSample(button.dataset.load));
  });

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    state.filter = button.dataset.filter;
    filters.querySelectorAll("[data-filter]").forEach((chip) => {
      const on = chip === button;
      chip.classList.toggle("is-on", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });
    render();
  });

  btnAudit.addEventListener("click", runAudit);
  btnCopy.addEventListener("click", () => {
    copyFixes();
  });
  snippet.addEventListener("input", markStale);
  snippet.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runAudit();
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

if (typeof document !== "undefined") boot();
