const EXAMPLES = {
  billing: {
    product: "给独立开发者用的订阅记账工具，帮一人公司看清每月订阅收入",
    customer: "一人公司创始人",
    geo: "中国",
  },
  booking: {
    product: "给餐饮店用的预约排班小程序",
    customer: "餐饮店主",
    geo: "中国二三线城市",
  },
};

const PLATFORMS = [
  { id: "xiaohongshu", name: "小红书", hint: "搜笔记标题，找还在问的人" },
  { id: "douyin", name: "抖音", hint: "用口语词搜视频和评论" },
  { id: "zhihu", name: "知乎", hint: "搜问答，找正在选型的人" },
  { id: "weibo", name: "微博", hint: "短词和话题，找公开吐槽" },
  { id: "bilibili", name: "B站", hint: "搜测评和教程下的评论" },
  { id: "x", name: "X / Twitter", hint: "整段粘贴到搜索框" },
  { id: "linkedin", name: "LinkedIn", hint: "搜帖子，找经营者本人" },
  { id: "reddit", name: "Reddit", hint: "整段粘贴到 Reddit 搜索" },
  { id: "github", name: "GitHub", hint: "整段粘贴到 GitHub 搜索" },
];

const CN_VARIANTS = [
  { rec: "推荐", pain: "避坑", alt: "平替", spoken: "怎么选", review: "测评", doubt: "靠谱吗", ask: "求推荐", watch: "教程" },
  { rec: "怎么选", pain: "踩坑", alt: "有用吗", spoken: "值不值", review: "真实分享", doubt: "有哪些坑", ask: "有人用过吗", watch: "入门" },
  { rec: "测评", pain: "一个月体验", alt: "适合谁", spoken: "别买错", review: "对比", doubt: "怎么选型", ask: "安利", watch: "实测" },
];

const GLOBAL_VARIANTS = [
  { find: "recommend OR alternative OR 推荐", pain: "stuck OR 踩坑 OR pricing", stack: "workflow OR stack" },
  { find: "tool OR app OR software", pain: '"what do you use" OR 求推荐', stack: "setup OR migration" },
  { find: '"looking for" OR 替代', pain: "frustrated OR 太贵 OR switching", stack: "checklist OR template" },
];

const ROLES = [
  [/一人公司|超级个体|solo\s*founder/i, "solo founder"],
  [/独立开发|indie/i, "indie hacker"],
  [/创始人|创业者|founder/i, "founder"],
  [/店主|商家|老板|餐饮|门店/i, "shop owner"],
  [/设计师|designer/i, "designer"],
  [/开发者|程序员|工程师|developer/i, "developer"],
  [/学生|student/i, "student"],
  [/自由职业|freelancer/i, "freelancer"],
  [/运营|市场|marketer/i, "marketer"],
];

const PLACES = [
  [/上海/, "Shanghai"],
  [/北京/, "Beijing"],
  [/深圳/, "Shenzhen"],
  [/杭州/, "Hangzhou"],
  [/美国|北美/, "United States"],
  [/欧洲/, "Europe"],
  [/日本/, "Japan"],
  [/东南亚/, "Southeast Asia"],
  [/一线/, "tier-1 China"],
  [/二三线/, "smaller Chinese cities"],
  [/中国|国内/, "China"],
];

const DRAFT_KEY = "lead-search-brief:draft";

export function generateBrief(input) {
  const product = clean(input.product);
  const customer = clean(input.customer);
  const geo = clean(input.geo);
  const variant = Number(input.variant) || 0;
  const distilled = distill(product);
  const who = customer || distilled.inferred;
  const { lang, place } = parseGeo(geo);
  const brief = {
    product,
    core: distilled.core,
    who,
    whoEn: roleEn(who || product),
    place,
    placeEn: placeEn(place),
    lang: lang || "zh",
    variant: ((variant % 3) + 3) % 3,
  };
  const platforms = PLATFORMS.map((platform) => ({
    ...platform,
    queries: queriesFor(platform.id, brief),
  }));
  return {
    brief,
    platforms,
    templates: templatesFor(brief),
    actions: actionsFor(brief, platforms),
  };
}

export function briefText(result, outreachLang) {
  const { brief, platforms, templates } = result;
  const actions = actionsFor(brief, platforms, outreachLang === "en" ? "en" : "zh");
  const lines = [
    "获客搜索简报",
    `产品：${brief.product}`,
    brief.who ? `目标客户：${brief.who}` : "",
    brief.place ? `地区：${brief.place}` : "",
    "",
  ];
  platforms.forEach((platform) => {
    lines.push(`## ${platform.name}`);
    platform.queries.forEach((query) => lines.push(query));
    lines.push("");
  });
  const packs = outreachLang === "en" ? [["EN", templates.en]] : [["中文", templates.zh], ["EN", templates.en]];
  if (outreachLang === "en") packs.push(["中文", templates.zh]);
  packs.forEach(([label, items]) => {
    lines.push(`## 私信（${label}）`);
    items.forEach((item) => {
      lines.push(item.title);
      lines.push(item.body);
      lines.push("");
    });
  });
  lines.push("## 下一步");
  actions.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
  return lines.filter((line, index, all) => line !== "" || all[index - 1] !== "").join("\n").trim();
}

function queriesFor(id, brief) {
  const v = CN_VARIANTS[brief.variant];
  const g = GLOBAL_VARIANTS[brief.variant];
  const core = brief.core;
  const who = brief.who;
  const place = brief.place;
  const q = core.replaceAll('"', "");
  const whoEn = (englishAudience(brief) || brief.who || "solo founder").replaceAll('"', "");
  const where = brief.placeEn || place;

  if (id === "xiaohongshu") {
    return pack([
      `${core} ${v.rec}`,
      `${core} ${v.pain}`,
      who ? `${who} ${core}` : `${core} ${v.alt}`,
      place ? `${place} ${core}` : "",
    ]);
  }
  if (id === "douyin") {
    return pack([
      `${core} ${v.spoken}`,
      `${core} ${v.review}`,
      who ? `${who} ${core}` : `${core} 真实体验`,
      place ? `${place} ${core}` : "",
    ]);
  }
  if (id === "zhihu") {
    return pack([
      `${who || "大家"} ${core} 用什么`,
      `${core} ${v.doubt}`,
      `${core} 选型`,
      place ? `${place} ${core}` : "",
    ]);
  }
  if (id === "weibo") {
    const tag = who ? hashTag(who) : "";
    return pack([
      `${core} ${v.ask}`,
      `${core} 吐槽`,
      tag ? `${tag} ${core}` : who ? `${who} ${core}` : `${core} 讨论`,
      place ? `${place} ${core}` : "",
    ]);
  }
  if (id === "bilibili") {
    return pack([
      `${core} ${v.review}`,
      `${core} ${v.watch}`,
      who ? `${who} ${core} 工作流` : `${core} 工作流`,
      place ? `${place} ${core} 实测` : "",
    ]);
  }
  if (id === "x") {
    return pack([
      `"${q}" (${g.find})`,
      `"${q}" (${g.pain}) -is:retweet`,
      `"${whoEn}" "${q}"`,
      where ? `"${q}" ${where}` : `"${q}" (${g.stack})`,
    ]);
  }
  if (id === "linkedin") {
    const extra = /^(founder|operator)$/i.test(whoEn) ? "" : ` OR ${quoteIfNeeded(whoEn)}`;
    return pack([
      `"${q}" (founder OR operator${extra})`,
      `"${q}" (${g.find})`,
      `"${whoEn}" "${q}"`,
      where ? `"${q}" ${where}` : "",
    ]);
  }
  if (id === "reddit") {
    return pack([
      `"${q}" (${g.find})`,
      `"${q}" ("what do you use" OR recommend)`,
      `"${whoEn}" "${q}"`,
      where ? `"${q}" ${where}` : `"looking for" "${q}"`,
    ]);
  }
  const term = quoteIfNeeded(q);
  return pack([
    `${term} in:readme`,
    `${term} in:description`,
    `awesome ${term}`,
    where ? `${term} ${quoteIfNeeded(where)}` : "",
  ]);
}

function templatesFor(brief) {
  const name = brief.core;
  const who = brief.who || "现在这个阶段的人";
  const whoEn = englishAudience(brief) || brief.who || "someone at your stage";
  return {
    zh: [
      {
        id: "comment",
        title: "评论区轻回复",
        body: `看你在找「${name}」。我整理过一版筛选标准：预算、上手时间、适不适合${who}。需要的话我直接写在评论里，不夹链接。`,
      },
      {
        id: "dm",
        title: "私信价值交换",
        body: `你好，看到你提到${name}。${who}在选的时候，通常卡在「不知道该信谁」。我可以按你的情况给 5 行对照：现在用什么、卡在哪、要不要换。你看完再决定要不要聊。`,
      },
      {
        id: "follow",
        title: "跟进约 15 分钟",
        body: `上次的对照不知道有没有用。如果这周还在看${name}，我可以约 15 分钟，只帮你缩到 2 个方案。不合适就当没说。`,
      },
    ],
    en: [
      {
        id: "comment",
        title: "Comment reply",
        body: `Saw you're looking at "${name}". I keep a short filter for this: budget, setup time, and whether it fits ${whoEn}. Happy to paste it here — no link unless you ask.`,
      },
      {
        id: "dm",
        title: "Value-first DM",
        body: `Hi — noticed your note about "${name}". The hard part is usually knowing who to trust. I can send a 5-line comparison for your setup: what you use now, where it sticks, and whether to switch. Read that first; we only talk if it's useful.`,
      },
      {
        id: "follow",
        title: "15-minute follow-up",
        body: `Checking back on the comparison. If you're still deciding on "${name}" this week, I can do 15 minutes and narrow it to two options. Totally fine to say no.`,
      },
    ],
  };
}

function actionsFor(brief, platforms, lang = brief.lang) {
  const xhs = platforms.find((item) => item.id === "xiaohongshu").queries[0];
  const zhihu = platforms.find((item) => item.id === "zhihu").queries[0];
  const x = platforms.find((item) => item.id === "x").queries[0];
  const reddit = platforms.find((item) => item.id === "reddit").queries[0];
  if (lang === "en") {
    return [
      `在 X 粘贴「${x}」，收藏 5 条仍在提问的帖子。`,
      `在 Reddit 粘贴「${reddit}」，挑 3 个公开帖，用英文 Comment reply 回复，先不放链接。`,
      "有人回复后，改用 Value-first DM 跟进，把对方、平台和原话记在一张表里。",
    ];
  }
  return [
    `打开小红书，粘贴「${xhs}」，收藏 5 条最近仍在问的笔记。`,
    `再搜知乎「${zhihu}」，挑 3 条公开回答，用「评论区轻回复」先说话，先不放链接。`,
    "有人回复后，改用「私信价值交换」跟进，把对方、平台和原话记在一张表里。",
  ];
}

function distill(product) {
  let text = product.replace(/^(我想要?|想做|我们想?做|请帮我|帮我做|做一款|一款|一个)\s*/, "");
  let inferred = "";
  const matched = text.match(/^(?:给|面向|为)([^的]{2,18}?)用?的\s*(.+)$/);
  if (matched) {
    inferred = clean(matched[1]);
    text = clean(matched[2]);
  }
  const sentence = text.split(/[。！？!?]/)[0];
  let core = sentence.split(/[，,]/)[0].trim();
  if (core.length < 2) core = sentence.trim();
  if (core.length > 32) {
    const sliced = core.slice(0, 32);
    const lastSpace = sliced.lastIndexOf(" ");
    core = (lastSpace > 12 ? sliced.slice(0, lastSpace) : sliced).trim();
  }
  if (core.length < 2) core = product.slice(0, 24);
  return { core, inferred };
}

function parseGeo(geo) {
  const lang = /英文|英语|\benglish\b|\ben\b/i.test(geo)
    ? "en"
    : /中文|汉语|\bchinese\b|\bzh\b/i.test(geo)
      ? "zh"
      : "";
  const place = clean(
    geo
      .replace(/英文|英语|中文|汉语/g, "")
      .replace(/\b(english|chinese|en|zh)\b/gi, "")
      .replace(/[\/|,，、]+/g, " "),
  );
  return { lang, place };
}

function englishAudience(brief) {
  if (brief.whoEn) return brief.whoEn;
  if (brief.who && /[A-Za-z]/.test(brief.who)) return brief.who;
  return "";
}

function roleEn(text) {
  const found = ROLES.find(([pattern]) => pattern.test(text));
  return found ? found[1] : "";
}

function placeEn(place) {
  if (!place) return "";
  const found = PLACES.find(([pattern]) => pattern.test(place));
  if (found) return found[1];
  return /[A-Za-z]/.test(place) ? place : "";
}

function hashTag(text) {
  const tag = clean(text).replace(/[#＃\s]/g, "");
  if (!tag || tag.length > 16) return "";
  return `#${tag}#`;
}

function quoteIfNeeded(value) {
  const text = value.trim();
  if (!text) return "";
  if (/\s/.test(text) || /[()]/.test(text)) return `"${text.replaceAll('"', "")}"`;
  return text.replaceAll('"', "");
}

function pack(list) {
  const out = [];
  list.forEach((item) => {
    const text = clean(item);
    if (text && !out.includes(text)) out.push(text);
  });
  return out.slice(0, 4);
}

function clean(value) {
  return String(value || "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const state = {
  variant: 0,
  example: "",
  outreachLang: "zh",
  result: null,
};

function boot() {
  const form = document.querySelector("#brief-form");
  const product = document.querySelector("#product");
  const customer = document.querySelector("#customer");
  const geo = document.querySelector("#geo");
  const error = document.querySelector("#product-error");
  const results = document.querySelector("#results");
  const toast = document.querySelector("#toast");
  let toastTimer = 0;
  let copiedTimer = 0;

  restoreDraft();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!clean(product.value)) {
      product.setAttribute("aria-invalid", "true");
      error.hidden = false;
      product.focus();
      return;
    }
    product.removeAttribute("aria-invalid");
    error.hidden = true;
    state.example = "";
    syncExamples();
    if (state.result) state.variant += 1;
    runGenerate();
  });

  product.addEventListener("input", () => {
    if (clean(product.value)) {
      product.removeAttribute("aria-invalid");
      error.hidden = true;
    }
  });

  product.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  document.querySelectorAll("[data-example]").forEach((button) => {
    button.addEventListener("click", () => {
      const example = EXAMPLES[button.dataset.example];
      if (!example) return;
      product.value = example.product;
      customer.value = example.customer;
      geo.value = example.geo;
      product.removeAttribute("aria-invalid");
      error.hidden = true;
      state.example = button.dataset.example;
      state.variant = 0;
      state.result = null;
      syncExamples();
      runGenerate();
    });
  });

  results.addEventListener("click", async (event) => {
    const langButton = event.target.closest("[data-lang]");
    if (langButton) {
      state.outreachLang = langButton.dataset.lang === "en" ? "en" : "zh";
      render();
      return;
    }
    const button = event.target.closest("[data-copy]");
    if (!button || !state.result) return;
    const text = textFor(button.dataset.copy);
    if (!text) return;
    await copyText(text);
    markCopied(button.dataset.copy);
    showToast(toastFor(button.dataset.copy));
  });

  function runGenerate() {
    const generated = generateBrief({
      product: product.value,
      customer: customer.value,
      geo: geo.value,
      variant: state.variant,
    });
    const first = !state.result;
    if (generated.brief.lang === "en") state.outreachLang = "en";
    else if (/中文|汉语|\bchinese\b|\bzh\b/i.test(geo.value) || first) state.outreachLang = "zh";
    state.result = generated;
    document.querySelector("#generate").textContent = "换一版说法";
    saveDraft();
    render();
    const title = document.querySelector("#results-title");
    if (!title) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    title.focus({ preventScroll: true });
    title.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function render() {
    const result = state.result;
    if (!result) {
      results.hidden = true;
      results.innerHTML = "";
      return;
    }
    const lang = state.outreachLang === "en" ? "en" : "zh";
    const letters = result.templates[lang];
    const actions = actionsFor(result.brief, result.platforms, lang);
    const count = result.platforms.reduce((sum, platform) => sum + platform.queries.length, 0);
    results.hidden = false;
    results.innerHTML = `
      <div class="section-head">
        <div>
          <h2 id="results-title" tabindex="-1">可复制的简报</h2>
          <p id="result-meta">${escapeHtml(result.brief.core)} · ${count} 条搜索词 · 第 ${result.brief.variant + 1} 版</p>
        </div>
        <div class="head-actions">
          <button type="button" class="ghost" data-copy="all" data-copy-key="all" data-label="复制整份简报">复制整份简报</button>
        </div>
      </div>
      <div class="platforms">
        ${result.platforms.map((platform) => platformCard(platform)).join("")}
      </div>
      <div class="section-head">
        <div>
          <h2>私信草稿</h2>
          <p>先评论，再私信，最后才约时间。</p>
        </div>
        <div class="lang-toggle" role="group" aria-label="私信语言">
          <button type="button" class="ghost" data-lang="zh" aria-pressed="${lang === "zh"}">中文</button>
          <button type="button" class="ghost" data-lang="en" aria-pressed="${lang === "en"}">EN</button>
        </div>
      </div>
      <div class="letters">
        ${letters.map((item) => letterCard(item)).join("")}
      </div>
      <article class="actions">
        <div class="actions-top">
          <h2>下一步</h2>
          <button type="button" class="ghost" data-copy="actions" data-copy-key="actions" data-label="复制清单">复制清单</button>
        </div>
        <ol>
          ${actions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ol>
      </article>
    `;
  }

  function platformCard(platform) {
    return `
      <article class="platform">
        <div class="platform-top">
          <div>
            <h3>${escapeHtml(platform.name)}</h3>
            <p class="hint">${escapeHtml(platform.hint)}</p>
          </div>
          <button type="button" class="ghost" data-copy="platform:${platform.id}" data-copy-key="platform:${platform.id}" data-label="复制全部">复制全部</button>
        </div>
        ${platform.queries
          .map(
            (query, index) => `
              <div class="query">
                <p>${escapeHtml(query)}</p>
                <button type="button" class="ghost" data-copy="query:${platform.id}:${index}" data-copy-key="query:${platform.id}:${index}" data-label="复制">复制</button>
              </div>
            `,
          )
          .join("")}
      </article>
    `;
  }

  function letterCard(item) {
    return `
      <article class="letter">
        <div class="letter-top">
          <h3>${escapeHtml(item.title)}</h3>
          <button type="button" class="ghost" data-copy="letter:${item.id}" data-copy-key="letter:${item.id}" data-label="复制">复制</button>
        </div>
        <p>${escapeHtml(item.body)}</p>
      </article>
    `;
  }

  function textFor(key) {
    const result = state.result;
    if (!result) return "";
    if (key === "all") return briefText(result, state.outreachLang);
    if (key === "actions") {
      return actionsFor(result.brief, result.platforms, state.outreachLang)
        .map((item, index) => `${index + 1}. ${item}`)
        .join("\n");
    }
    if (key.startsWith("platform:")) {
      const platform = result.platforms.find((item) => item.id === key.slice(9));
      return platform ? platform.queries.join("\n") : "";
    }
    if (key.startsWith("query:")) {
      const [, id, index] = key.split(":");
      const platform = result.platforms.find((item) => item.id === id);
      return platform ? platform.queries[Number(index)] || "" : "";
    }
    if (key.startsWith("letter:")) {
      const id = key.slice(7);
      const letters = result.templates[state.outreachLang] || [];
      const letter = letters.find((item) => item.id === id);
      return letter ? letter.body : "";
    }
    return "";
  }

  function toastFor(key) {
    if (key.startsWith("query:") || key.startsWith("platform:")) {
      const id = key.split(":")[1];
      const platform = PLATFORMS.find((item) => item.id === id);
      return platform ? `已复制，可粘贴到${platform.name}` : "已复制";
    }
    if (key.startsWith("letter:")) return "已复制私信";
    if (key === "actions") return "已复制下一步";
    return "已复制整份简报";
  }

  function markCopied(key) {
    results.querySelectorAll("[data-copy-key]").forEach((button) => {
      const on = button.dataset.copyKey === key;
      button.classList.toggle("is-copied", on);
      button.textContent = on ? "已复制" : button.dataset.label;
    });
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      results.querySelectorAll("[data-copy-key]").forEach((button) => {
        button.classList.remove("is-copied");
        button.textContent = button.dataset.label;
      });
    }, 1600);
  }

  function showToast(message) {
    toast.hidden = false;
    toast.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 1800);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
  }

  function syncExamples() {
    document.querySelectorAll("[data-example]").forEach((button) => {
      button.classList.toggle("is-on", button.dataset.example === state.example);
    });
  }

  function saveDraft() {
    const draft = {
      product: product.value,
      customer: customer.value,
      geo: geo.value,
    };
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* private mode can block storage */
    }
  }

  function restoreDraft() {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (typeof draft.product === "string") product.value = draft.product;
      if (typeof draft.customer === "string") customer.value = draft.customer;
      if (typeof draft.geo === "string") geo.value = draft.geo;
    } catch {
      /* ignore broken drafts */
    }
  }
}

if (typeof document !== "undefined") boot();
