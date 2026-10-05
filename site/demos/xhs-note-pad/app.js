const TITLE_MAX = 20;
const graphemes = new Intl.Segmenter("zh", { granularity: "grapheme" });

const EXAMPLE = {
  topic: "空气炸锅",
  audience: "租房上班族",
  style: "experience",
};

const STYLES = {
  list: {
    label: "干货清单",
    angles: [
      {
        name: "收藏清单",
        cover: "清单收好",
        seeds: ["干货分享", "笔记模板", "实用技巧", "收藏备用", "清单体", "步骤拆解"],
        titles: [
          (topic) => joinTitle(["✨", shrink(topic), "清单收好"]),
          (topic, audience) => joinTitle(["📒", shrink(audience), "必看", shrink(topic)]),
          (topic) => joinTitle(["✅", shrink(topic), "按条做"]),
        ],
        hook: (topic, audience) =>
          `先把结论放前面：${topic}不用收藏一百篇。下面是写给${audience}的清单，【】里换成你的数字和例子。`,
        points: (topic, audience) => [
          `这篇写给谁：【填：除了${audience}，还有谁会看】`,
          `先备好什么：【填：和${topic}相关的 3 样东西】`,
          "步骤一：【填：开头的动作，一句话】",
          "步骤二：【填：接着的动作，一句话】",
          "步骤三：【填：收尾的动作，一句话】",
          "做完怎么判断：【填：一个看得到的结果】",
        ],
      },
      {
        name: "五步顺序",
        cover: "五步就够",
        seeds: ["顺序写法", "可执行", "时间成本", "复盘", "新手也能做", "照着填"],
        titles: [
          (topic) => joinTitle(["🔢", shrink(topic), "五步"]),
          (topic, audience) => joinTitle(["📌", shrink(audience), "照做"]),
          (topic) => joinTitle(["🧩", shrink(topic), "拆开写"]),
        ],
        hook: (topic, audience) =>
          `这篇只讲顺序。${audience}如果时间少，就按编号把${topic}填完，不用另起炉灶。`,
        points: (topic) => [
          `目标一句话：【填：读者看完要对${topic}做什么】`,
          "材料或前提：【填：需要什么】",
          "核心三步：【填：每步不超过 15 字】",
          "耗时与花费：【填：大概多久 / 多少钱】",
          "复盘一句：【填：下次会改哪里】",
        ],
      },
      {
        name: "问答骨架",
        cover: "先答这问",
        seeds: ["问答体", "评论区", "新手问题", "从哪开始", "适不适合", "下一步"],
        titles: [
          (topic) => joinTitle(["💬", shrink(topic), "常见问"]),
          (topic, audience) => joinTitle(["🧭", shrink(audience), "先看"]),
          (topic) => joinTitle(["📎", shrink(topic), "问答"]),
        ],
        hook: (topic, audience) =>
          `评论区翻来覆去就这几问。按${audience}的视角，把${topic}列成问答，【】换成你的答案。`,
        points: (topic) => [
          `适不适合我：【填：${topic}适合谁、不适合谁】`,
          "从哪开始：【填：先做的那一件小事】",
          "要花多少：【填：时间或预算区间】",
          "容易失误的地方：【填：一个真实例子】",
          "做完之后：【填：建议继续看什么】",
        ],
      },
    ],
  },
  experience: {
    label: "亲测体验",
    angles: [
      {
        name: "用后记录",
        cover: "我的实测",
        seeds: ["真实分享", "使用感受", "体验笔记", "个人记录", "好与不好", "继续用吗"],
        titles: [
          (topic) => joinTitle(["🙌", "我试了", shrink(topic)]),
          (topic, audience) => joinTitle(["📖", shrink(audience), "手记"]),
          (topic) => joinTitle(["🌟", shrink(topic), "用后感"]),
        ],
        hook: (topic, audience) =>
          `不写参数表。这是给${audience}的一段${topic}记录，好和不好都留了空，【】换成你的原话。`,
        points: (topic, audience) => [
          `为什么试：【填：${audience}当时的需求】`,
          `怎么用的：【填：${topic}的频率、时长、场景】`,
          "超出预期的一点：【填：具体细节】",
          "不满意的一点：【填：具体不爽，避免空泛】",
          "还会不会继续：【填：会 / 不会，以及条件】",
        ],
      },
      {
        name: "一天时间线",
        cover: "一天记录",
        seeds: ["一天记录", "时间线", "日常片段", "随手记", "真实一天", "生活场景"],
        titles: [
          (topic) => joinTitle(["📅", "一天", shrink(topic)]),
          (topic, audience) => joinTitle(["☕", shrink(audience), "日常"]),
          (topic) => joinTitle(["📷", shrink(topic), "随手记"]),
        ],
        hook: (topic, audience) =>
          `用一天的时间线写${topic}。${audience}可以直接套这个骨架，把括号里换成你的时刻。`,
        points: (topic) => [
          `早上：【填：刚用到${topic}的情境】`,
          "中段：【填：一个具体动作和结果】",
          "卡住时：【填：你怎么处理的】",
          "晚上复盘：【填：值不值得占你的时间】",
        ],
      },
      {
        name: "前后对照",
        cover: "用前用后",
        seeds: ["用前用后", "个人变化", "旧做法", "两周后", "同路人", "仍然麻烦"],
        titles: [
          (topic) => joinTitle(["🔁", shrink(topic), "前后"]),
          (topic, audience) => joinTitle(["🌱", shrink(audience), "变化"]),
          (topic) => joinTitle(["👀", shrink(topic), "我的记"]),
        ],
        hook: (topic, audience) =>
          `只对照我自己的前后，不给别人下结论。主题是${topic}，看的人是${audience}。`,
        points: (topic) => [
          `用之前：【填：旧做法，以及${topic}没介入时的烦恼】`,
          "改变了什么：【填：你具体换了哪一步】",
          "两周后：【填：一个看得见的变化】",
          "仍然麻烦：【填：没解决的部分】",
          "想对同路人说：【填：一句提醒】",
        ],
      },
    ],
  },
  pitfall: {
    label: "避坑提醒",
    angles: [
      {
        name: "常见坑",
        cover: "先避这坑",
        seeds: ["避坑", "经验提醒", "注意事项", "踩坑记录", "替代做法", "该停就停"],
        titles: [
          (topic) => joinTitle(["⚠️", shrink(topic), "别踩"]),
          (topic, audience) => joinTitle(["🚧", shrink(audience), "注意"]),
          (topic) => joinTitle(["🛑", shrink(topic), "先看坑"]),
        ],
        hook: (topic, audience) =>
          `这篇是提醒，不是安利。${audience}准备碰${topic}之前，先把这些坑换成你自己的例子。`,
        points: (topic) => [
          `坑一：【填：${topic}的一个常见误区】`,
          "为什么会中招：【填：当时怎么想的】",
          "坑二：【填：花费、时间或预期上的偏差】",
          "我的替代做法：【填：下次会怎么做】",
          "什么情况该停：【填：一个停止信号】",
        ],
      },
      {
        name: "花费账",
        cover: "先算这笔",
        seeds: ["花费", "隐形成本", "预算", "下单前", "少花一点", "算清楚"],
        titles: [
          (topic) => joinTitle(["💸", shrink(topic), "花费"]),
          (topic, audience) => joinTitle(["🧮", shrink(audience), "算账"]),
          (topic) => joinTitle(["🔎", shrink(topic), "下单前"]),
        ],
        hook: (topic, audience) =>
          `钱和时间很容易被写虚。下面每条都要一个数字，写${topic}给${audience}看。`,
        points: () => [
          "表面价格：【填：标价或时间】",
          "隐形成本：【填：配件、学习、返工】",
          "我多花在哪：【填：一笔不必要的开支】",
          "怎样少花：【填：一个具体省法】",
          "预算建议：【填：你认为够用的区间】",
        ],
      },
      {
        name: "预期差",
        cover: "预期放低",
        seeds: ["预期管理", "现实一面", "别照单全收", "适合谁", "不适合谁", "慢一点"],
        titles: [
          (topic) => joinTitle(["🎯", shrink(topic), "预期"]),
          (topic, audience) => joinTitle(["📉", shrink(audience), "现实"]),
          (topic) => joinTitle(["🌙", shrink(topic), "慢一点"]),
        ],
        hook: (topic, audience) =>
          `把预期写清楚，比堆好处有用。${topic}做不到的部分，${audience}请直接写出来。`,
        points: () => [
          "我原以为：【填：当时的预期】",
          "实际上：【填：真实结果，带一个例子】",
          "宣传里容易误导的点：【填：哪句话别照单全收】",
          "仍然值得的情况：【填：适合谁】",
          "不建议碰的情况：【填：不适合谁】",
        ],
      },
    ],
  },
  compare: {
    label: "对比测评",
    angles: [
      {
        name: "两个选项",
        cover: "放一起看",
        seeds: ["怎么选", "两个选项", "选购参考", "同一场景", "花费差别", "我会怎么选"],
        titles: [
          (topic) => joinTitle(["⚖️", shrink(topic), "怎么选"]),
          (topic, audience) => joinTitle(["🔀", shrink(audience), "对照"]),
          (topic) => joinTitle(["🧭", "两边看", shrink(topic)]),
        ],
        hook: (topic, audience) =>
          `只放两个选项，不排名次。围绕${topic}来写，看的人是${audience}。A / B 换成你要放在一起的对象。`,
        points: (topic) => [
          `选项 A：【填：名称，以及你在${topic}上在意的一点】`,
          "选项 B：【填：名称，以及对应的一点】",
          "同一场景下的差别：【填：时间、手感或结果】",
          "花费差别：【填：两个数字】",
          "我会怎么选：【填：什么条件下选 A，什么条件下选 B】",
        ],
      },
      {
        name: "四个维度",
        cover: "四个维度",
        seeds: ["四个维度", "同一标准", "上手难度", "稳定程度", "取舍", "对照表"],
        titles: [
          (topic) => joinTitle(["📊", shrink(topic), "四维"]),
          (topic, audience) => joinTitle(["🧪", shrink(audience), "同尺"]),
          (topic) => joinTitle(["📐", shrink(topic), "对照表"]),
        ],
        hook: (topic, audience) =>
          `用同一把尺子量${topic}，避免各说各话。四个维度都要填，空着就先别发。写给${audience}。`,
        points: () => [
          "上手难度：【填：A 与 B 各用一句话】",
          "日常成本：【填：钱或时间】",
          "稳定程度：【填：你观察到的波动】",
          "适合的人：【填：A 适合谁，B 适合谁】",
          "我的取舍：【填：你放弃了哪一项】",
        ],
      },
      {
        name: "按场景",
        cover: "按场景选",
        seeds: ["按场景", "对号入座", "赶时间", "预算紧", "长期用", "不评价"],
        titles: [
          (topic) => joinTitle(["🗺️", shrink(topic), "按场景"]),
          (topic, audience) => joinTitle(["🏷️", shrink(audience), "对号"]),
          (topic) => joinTitle(["👥", "谁适合", shrink(topic)]),
        ],
        hook: (topic, audience) =>
          `不写谁赢谁输。按场景把${topic}拆开，让${audience}对号入座。`,
        points: () => [
          "场景一：【填：例如赶时间，选哪边，为什么】",
          "场景二：【填：例如预算紧，选哪边】",
          "场景三：【填：例如想长期用，选哪边】",
          "我的场景：【填：你自己属于哪一种】",
          "还没比过的：【填：你故意不评价的部分】",
        ],
      },
    ],
  },
};

const RULES = [
  {
    id: "zui",
    reason: "像绝对化宣传，改成你自己的比较。",
    find(text) {
      return unique(text.match(/最(?!后|近|终)/g) || []);
    },
  },
  {
    id: "diyi",
    reason: "像排名或权威背书，没有依据就不要写。",
    find(text) {
      return unique(text.match(/第一(?!步|次|天|眼|个)/g) || []);
    },
  },
  {
    id: "juedui",
    reason: "把话说死了，改成适用条件。",
    find(text) {
      return unique(text.match(/绝对/g) || []);
    },
  },
  {
    id: "percent",
    reason: "无法证实的承诺，改成具体比例或个例。",
    find(text) {
      const folded = foldWidth(text);
      return unique(folded.match(/100\s*[%％]|百分百|百分之百/g) || []).map((hit) =>
        hit.replace(/\s+/g, ""),
      );
    },
  },
  {
    id: "cure",
    reason: "像医疗承诺，改成使用后的个人感受。",
    find(text) {
      return unique(text.match(/治愈/g) || []);
    },
  },
  {
    id: "root",
    reason: "是疗效表述，普通分享不要写。",
    find(text) {
      return unique(text.match(/根治/g) || []);
    },
  },
  {
    id: "contact",
    reason: "站外联系方式容易被限流，不要写进标题。",
    find(text) {
      const hits = text.match(/微信|威信|薇信|v信|weixin|wechat/gi) || [];
      for (const match of text.matchAll(/vx/gi)) {
        const before = match.index > 0 ? text[match.index - 1] : "";
        const after = text[match.index + 2] || "";
        if (!/[a-z]/i.test(before) && !/[a-z]/i.test(after)) hits.push(match[0]);
      }
      return unique(hits);
    },
  },
];

function shrink(text) {
  return { text, shrink: true };
}

function splitGraphemes(text) {
  return [...graphemes.segment(String(text ?? ""))].map((part) => part.segment);
}

function charLen(text) {
  return splitGraphemes(text).length;
}

function clipChars(text, max) {
  return splitGraphemes(text).slice(0, Math.max(0, max)).join("");
}

function joinTitle(segments, max = TITLE_MAX) {
  const parts = [];
  for (const segment of segments) {
    const item = typeof segment === "string" ? { text: segment, shrink: false } : segment;
    if (!item.text) continue;
    parts.push({ text: String(item.text), shrink: !!item.shrink });
  }
  const lengths = parts.map((part) => charLen(part.text));
  let overflow = lengths.reduce((sum, length) => sum + length, 0) - max;
  while (overflow > 0) {
    let index = -1;
    for (let i = 0; i < parts.length; i += 1) {
      if (!parts[i].shrink || lengths[i] <= 1) continue;
      if (index === -1 || lengths[i] > lengths[index]) index = i;
    }
    if (index === -1) break;
    lengths[index] -= 1;
    overflow -= 1;
  }
  const text = parts.map((part, index) => clipChars(part.text, lengths[index])).join("");
  const length = charLen(text);
  return { text, length, over: length > max };
}

function sanitizeTag(raw) {
  const cleaned = String(raw)
    .replace(/[#＃]/g, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\uFE0F/g, "")
    .replace(/[\s,，.。!！?？、:：;；"'“”‘’()（）【】[\]/\\]+/g, "");
  return clipChars(cleaned, 16);
}

function hashtags(topic, audienceRaw, seeds) {
  const tags = [];
  const push = (raw) => {
    const tag = sanitizeTag(raw);
    if (tag && !tags.includes(tag)) tags.push(tag);
  };
  push(topic);
  if (audienceRaw) push(audienceRaw);
  for (const seed of seeds) push(seed);
  if (tags.length < 5) {
    for (const extra of ["笔记草稿", "标题灵感", "正文提纲", "封面文案", "本地模板"]) {
      push(extra);
      if (tags.length >= 5) break;
    }
  }
  return tags.slice(0, 8);
}

function createPack(input) {
  const topic = String(input.topic || "").trim();
  const audienceRaw = String(input.audience || "").trim();
  const audience = audienceRaw || "大家";
  const styleId = STYLES[input.style] ? input.style : "list";
  if (!topic) return { ok: false };
  const style = STYLES[styleId];
  const drafts = style.angles.map((angle) => {
    const titles = angle.titles.map((make) => make(topic, audience));
    return {
      styleId,
      styleLabel: style.label,
      angle: angle.name,
      titles,
      hook: angle.hook(topic, audience),
      points: angle.points(topic, audience),
      tags: hashtags(topic, audienceRaw, angle.seeds),
      coverTopic: clipChars(topic, 8),
      coverPhrase: angle.cover,
      cover: `${clipChars(topic, 8)}\n${angle.cover}`,
    };
  });
  return { ok: true, topic, audience, audienceRaw, styleId, styleLabel: style.label, drafts };
}

function foldWidth(text) {
  return String(text).replace(/[０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xff10 + 0x30),
  );
}

function unique(list) {
  const seen = new Set();
  const result = [];
  for (const item of list) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function audit(input, drafts) {
  const sources = [
    { label: "主题", text: input.topic || "" },
    { label: "受众", text: input.audience || "" },
  ];
  drafts.forEach((draft, draftIndex) => {
    draft.titles.forEach((title, titleIndex) => {
      sources.push({
        label: `草稿${draftIndex + 1}标题${titleIndex + 1}`,
        text: title.text,
      });
    });
    sources.push({
      label: `草稿${draftIndex + 1}正文`,
      text: `${draft.hook}\n${draft.points.join("\n")}`,
    });
  });

  const grouped = new Map();
  for (const source of sources) {
    if (!source.text) continue;
    for (const rule of RULES) {
      for (const word of rule.find(source.text)) {
        const key = `${rule.id}:${word.toLowerCase()}`;
        if (!grouped.has(key)) {
          grouped.set(key, { word, reason: rule.reason, where: [] });
        }
        const row = grouped.get(key);
        if (!row.where.includes(source.label)) row.where.push(source.label);
      }
    }
  }
  return [...grouped.values()];
}

function formatDraft(draft, index) {
  const titles = draft.titles
    .map((title, titleIndex) => `${titleIndex + 1}. ${title.text}（${title.length}字）`)
    .join("\n");
  const points = draft.points.map((point, pointIndex) => `${pointIndex + 1}. ${point}`).join("\n");
  const tags = draft.tags.map((tag) => `#${tag}`).join(" ");
  return [
    `草稿 ${index + 1} · ${draft.styleLabel} · ${draft.angle}`,
    "",
    "标题",
    titles,
    "",
    "开头",
    draft.hook,
    "",
    "正文提纲",
    points,
    "",
    "话题",
    tags,
    "",
    "封面大字",
    draft.cover,
  ].join("\n");
}

function formatAll(drafts) {
  return drafts.map((draft, index) => formatDraft(draft, index)).join("\n\n----\n\n");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function highlightPlaces(escaped) {
  return escaped.replace(/【([^】]*)】/g, "<mark>【$1】</mark>");
}

const ui = {};
let styleId = "list";
let generated = false;
let renderedTopic = "";
let lastPack = null;
let composing = false;
let toastTimer = 0;

function boot() {
  ui.form = document.querySelector("#compose");
  ui.topic = document.querySelector("#topic");
  ui.audience = document.querySelector("#audience");
  ui.msg = document.querySelector("#form-msg");
  ui.example = document.querySelector("#btn-example");
  ui.styles = [...document.querySelectorAll("[data-style]")];
  ui.check = document.querySelector("#check");
  ui.checkCount = document.querySelector("#check-count");
  ui.checkList = document.querySelector("#check-list");
  ui.results = document.querySelector("#results");
  ui.drafts = document.querySelector("#drafts");
  ui.copyAll = document.querySelector("#btn-copy-all");
  ui.toast = document.querySelector("#toast");

  ui.form.addEventListener("submit", (event) => {
    event.preventDefault();
    generate();
  });
  ui.example.addEventListener("click", fillExample);
  ui.audience.addEventListener("compositionstart", () => {
    composing = true;
  });
  ui.audience.addEventListener("compositionend", () => {
    composing = false;
    refreshLive();
  });
  ui.audience.addEventListener("input", () => {
    if (!composing) refreshLive();
  });
  ui.topic.addEventListener("input", () => {
    if (!generated) return;
    const topic = ui.topic.value.trim();
    ui.msg.textContent =
      topic && topic !== renderedTopic ? "主题已改，点「生成」更新草稿。" : "";
  });
  for (const button of ui.styles) {
    button.addEventListener("click", () => {
      setStyle(button.dataset.style);
      refreshLive();
    });
  }
  ui.copyAll.addEventListener("click", () => {
    if (!lastPack?.ok) return;
    copyText(formatAll(lastPack.drafts), "已复制全部 3 条");
  });
  ui.drafts.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy]");
    if (!button) return;
    if (!lastPack?.ok) return;
    const index = Number(button.dataset.copy);
    const draft = lastPack.drafts[index];
    if (!draft) return;
    copyText(formatDraft(draft, index), `已复制草稿 ${index + 1}`);
  });
}

function setStyle(next) {
  styleId = STYLES[next] ? next : "list";
  for (const button of ui.styles) {
    const on = button.dataset.style === styleId;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-checked", on ? "true" : "false");
  }
}

function fillExample() {
  ui.topic.value = EXAMPLE.topic;
  ui.audience.value = EXAMPLE.audience;
  setStyle(EXAMPLE.style);
  ui.msg.textContent = "";
  generated = true;
  render();
  ui.results.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function generate() {
  const topic = ui.topic.value.trim();
  if (!topic) {
    ui.msg.textContent = "先写一个主题或产品。";
    ui.topic.focus();
    return;
  }
  ui.msg.textContent = "";
  generated = true;
  render();
}

function refreshLive() {
  if (!generated) return;
  if (!ui.topic.value.trim()) {
    ui.msg.textContent = "先写一个主题或产品。";
    return;
  }
  ui.msg.textContent = "";
  render();
}

function currentPack() {
  if (!generated) return null;
  return createPack({
    topic: ui.topic.value,
    audience: ui.audience.value,
    style: styleId,
  });
}

function render() {
  const pack = currentPack();
  if (!pack?.ok) return;
  renderedTopic = pack.topic;
  lastPack = pack;
  renderCheck(audit({ topic: pack.topic, audience: pack.audienceRaw }, pack.drafts));
  ui.results.hidden = false;
  ui.drafts.innerHTML = pack.drafts
    .map((draft, index) => renderDraft(draft, index))
    .join("");
}

function placeLabel(where) {
  const names = [];
  if (where.includes("主题")) names.push("主题");
  if (where.includes("受众")) names.push("受众");
  if (where.some((item) => item.includes("标题"))) names.push("标题");
  if (where.some((item) => item.includes("正文"))) names.push("正文");
  return names.join("、");
}

function renderCheck(flags) {
  ui.check.hidden = false;
  ui.check.classList.toggle("is-hot", flags.length > 0);
  ui.check.classList.toggle("is-clear", flags.length === 0);
  if (!flags.length) {
    ui.checkCount.textContent = "通过";
    ui.checkList.innerHTML = "<li>主题、受众、标题和正文没有命中绝对化用语、疗效承诺或站外联系方式。</li>";
    return;
  }
  ui.checkCount.textContent = `命中 ${flags.length} 处`;
  ui.checkList.innerHTML = flags
    .map(
      (flag) =>
        `<li><strong>${escapeHtml(placeLabel(flag.where))}</strong>里的「${escapeHtml(flag.word)}」：${escapeHtml(flag.reason)}</li>`,
    )
    .join("");
}

function renderDraft(draft, index) {
  const titles = draft.titles
    .map((title) => {
      const hint = title.over ? `${title.length} 字 · 超过 20` : `${title.length} 字 · ≤20`;
      return `<li><span class="title-text">${escapeHtml(title.text)}</span><span class="len${title.over ? " is-over" : ""}">${hint}</span></li>`;
    })
    .join("");
  const points = draft.points
    .map((point) => `<li>${highlightPlaces(escapeHtml(point))}</li>`)
    .join("");
  const tags = draft.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("");
  return `
    <article class="draft">
      <div class="cover" aria-hidden="true">
        <span class="cover-kicker">封面</span>
        <span>
          <span class="cover-topic">${escapeHtml(draft.coverTopic)}</span>
          <span class="cover-phrase">${escapeHtml(draft.coverPhrase)}</span>
        </span>
      </div>
      <div class="draft-body">
        <div class="draft-top">
          <p class="angle">${escapeHtml(draft.styleLabel)} · ${escapeHtml(draft.angle)}</p>
          <button type="button" class="ghost" data-copy="${index}">复制这条</button>
        </div>
        <ol class="titles">${titles}</ol>
        <div class="block">
          <div class="block-label">开头</div>
          <p>${highlightPlaces(escapeHtml(draft.hook))}</p>
        </div>
        <div class="block">
          <div class="block-label">正文提纲</div>
          <ol class="outline">${points}</ol>
        </div>
        <div class="block">
          <div class="block-label">话题</div>
          <div class="tags">${tags}</div>
        </div>
        <p class="cover-caption">封面大字 ${escapeHtml(draft.coverTopic)} · ${escapeHtml(draft.coverPhrase)}</p>
      </div>
    </article>
  `;
}

async function copyText(text, okMessage) {
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    copied = document.execCommand("copy");
    area.remove();
  }
  showToast(copied ? okMessage : "复制失败，请手动选择文字");
}

function showToast(message) {
  ui.toast.hidden = false;
  ui.toast.textContent = message;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    ui.toast.hidden = true;
  }, 1800);
}

if (typeof document !== "undefined") boot();

export {
  EXAMPLE,
  TITLE_MAX,
  STYLES,
  audit,
  charLen,
  createPack,
  formatAll,
  formatDraft,
};
