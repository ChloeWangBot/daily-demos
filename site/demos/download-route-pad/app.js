const MODES = {
  verbatim: "逐字稿",
  summary: "要点摘要",
  bilingual: "双语",
};

const PERSONAL =
  "仅供个人学习与研究。遵守平台条款和版权，不要公开再分发原片、原音频或完整字幕。";

export const SAMPLES = [
  "https://www.youtube.com/watch?v=aircAruvnKk",
  "https://www.xiaoyuzhoufm.com/episode/5e280fa7418a84a0461f8a1e",
  "https://arxiv.org/abs/1706.03762",
];

const EXPECTED = {
  youtube: {
    verbatim: "中文逐字稿，按句或每 1–2 分钟保留时间戳。",
    summary: "中文要点摘要：主题、关键论点、结论，并附对应时间戳。",
    bilingual: "双语对照稿：原文字幕或转写在前，中文在后，保留时间戳。",
  },
  bilibili: {
    verbatim: "中文逐字稿，按分 P 与时间戳组织。",
    summary: "中文要点摘要：这集在讲什么、关键步骤、结论，并附时间戳。",
    bilingual: "双语对照稿：原文字幕或转写配中文，多 P 按顺序分开。",
  },
  podcast: {
    verbatim: "中文逐字稿。能分出说话人时标上说话人，切段后按时间合并。",
    summary: "中文要点摘要：嘉宾、话题、结论，以及可以跟着做的收获。",
    bilingual: "双语对照稿：原文转写配中文。本来就是中文时，保留口语稿并另给一份书面语整理。",
  },
  arxiv: {
    verbatim: "保存 PDF，并按章节给出尽量逐段的中文译文。公式、图注和表题保留原文。",
    summary: "保存 PDF，并写中文要点：问题、方法、结果、局限。",
    bilingual: "保存 PDF。摘要、方法、结论做中英对照，其余章节按需补。",
  },
  doi: {
    verbatim: "优先保存官方 PDF，再按章节给出中文译文。没有 PDF 时只译摘要页。",
    summary: "优先保存官方 PDF，并写中文要点：问题、方法、结果、局限。",
    bilingual: "优先保存官方 PDF。摘要和结论做中英对照。",
  },
  pdf: {
    verbatim: "保存 PDF。文本层直接抽取后逐段译成中文；扫描件先 OCR。",
    summary: "保存 PDF，并写中文要点摘要。扫描件先 OCR 再摘要。",
    bilingual: "保存 PDF。关键章节中英对照；扫描件先 OCR。",
  },
  paper: {
    verbatim: "确认是 arXiv、DOI 还是 PDF 后，保存原文并给出中文逐段译文。",
    summary: "确认载体后保存原文，并写中文要点：问题、方法、结果、局限。",
    bilingual: "确认载体后保存原文，摘要和结论做中英对照。",
  },
  article: {
    verbatim: "中文全文整理稿，按原文段落顺序，去掉导航、推荐和评论。",
    summary: "中文要点摘要：谁在说、核心主张、依据和结论。",
    bilingual: "双语对照：保留原文段落，每段下面附中文。",
  },
  unknown: {
    verbatim: "先确认类型，再给中文逐字稿或逐段译文。",
    summary: "先确认类型，再给中文要点摘要。",
    bilingual: "先确认类型，再给双语对照。",
  },
};

const LENGTH = {
  youtube: "长于约 45 分钟时，按章节或每 20–30 分钟切段，做完再按时间顺序合并。",
  bilibili: "多 P，或长于约 45 分钟时，按分 P 或每 20–30 分钟切段，再合并成一份。",
  podcast: "单集长于约 30 分钟时，按章节或每 20–30 分钟切段识别，再合并。",
  arxiv: "按章节处理：先摘要和结论，再方法与实验。不要把整篇一次性塞进上下文。",
  doi: "先取得 PDF 或摘要。正文很长时按章节抽取，先结论，后方法。",
  pdf: "页数很多时按章节或每 20 页一块抽取，再合并。扫描件单独走 OCR。",
  paper: "确认载体之后，长文按章节处理，先摘要和结论。",
  article: "长文按小标题分段整理，再合并成一份产出。",
  unknown: "确认是音视频、论文还是网页之后，再决定要不要切段。",
};

const MAX_ITEMS = 12;

export function splitInputs(raw) {
  const lines = String(raw)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const items = [];
  for (const line of lines) {
    const urls = line.match(/https?:\/\/[^\s<>"'“”]+/gi);
    if (urls && urls.length > 1) {
      items.push(...urls.map(cleanUrlToken));
    } else {
      items.push(line);
    }
  }
  return items;
}

export function classify(input) {
  const raw = String(input).trim();
  const url = firstUrl(raw);
  if (url) return classifyUrl(raw, url);
  return classifyText(raw);
}

export function expectedOutput(item, mode) {
  const table = EXPECTED[item.kind] || EXPECTED.unknown;
  return table[mode] || table.summary;
}

export function buildBrief(items, mode) {
  const label = MODES[mode] || MODES.verbatim;
  const lines = [
    "【下载任务简报】",
    `产出偏好：${label}`,
    "输出语言：中文",
    "处理方式：按下面每条的路线提取，不要改期望产出。这些地址还没有被打开。",
    `条目：${items.length}`,
    "",
  ];
  items.forEach((item, index) => {
    lines.push(
      `—— ${index + 1} ——`,
      `来源：${item.source}`,
      `类型：${item.typeLabel}`,
      `建议路线：${item.route}`,
      `期望产出：${expectedOutput(item, mode)}`,
      `长度处理：${item.length}`,
      "注意：",
      ...item.caveats.map((caveat) => `- ${caveat}`),
      "",
    );
  });
  lines.push("缺具体链接的条目，先补上地址再继续。");
  return `${lines.join("\n").trim()}\n`;
}

function classifyUrl(raw, href) {
  let url;
  try {
    url = new URL(href);
  } catch {
    return classifyText(raw);
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const path = url.pathname.toLowerCase();
  const source = href;

  if (isYoutube(host)) return finish("youtube", raw, source, youtubeDetail(url));
  if (isBilibili(host)) return finish("bilibili", raw, source, bilibiliDetail(path));
  if (isPodcast(host, path, raw)) return finish("podcast", raw, source, podcastDetail(host, path));
  if (isArxivHost(host)) return finish("arxiv", raw, source, arxivDetail(path));
  if (isDoiHost(host) || /^\/10\.\d{4,9}\//.test(path)) {
    return finish("doi", raw, source, doiDetail(href));
  }
  if (path.endsWith(".pdf")) return finish("pdf", raw, source, pdfDetail());
  if (/\.(mp3|m4a|aac|ogg|opus|wav)$/.test(path)) {
    return finish("podcast", raw, source, {
      typeLabel: "音频文件",
      routeTag: "音频转写",
      route: "这是音频文件。按 20–30 分钟切段做语音识别，再整理成所选中文产出。",
      caveats: ["长音频必须切段，避免一次识别中途截断。", PERSONAL],
    });
  }
  if (/\.(mp4|mkv|webm|mov)$/.test(path)) {
    return finish("youtube", raw, source, {
      typeLabel: "视频文件",
      routeTag: "字幕优先",
      route: "这是视频文件。先找内嵌或外挂字幕；没有字幕时抽出音轨做语音识别，再整理成所选中文产出。",
      caveats: ["长视频请切段处理。", PERSONAL],
      length: LENGTH.youtube,
    });
  }
  return finish("article", raw, source, articleDetail(host));
}

function classifyText(raw) {
  const missing = "这是描述，还没有具体链接。执行前请补上可打开的地址。";
  const rules = [
    {
      test: /b站|哔哩|bilibili|b23\.tv/i,
      kind: "bilibili",
      detail: {
        typeLabel: "Bilibili 视频",
        routeTag: "字幕优先",
        route: `先取 CC 字幕或 AI 字幕；没有字幕再抽音频做语音识别。多 P 按分 P 处理。${missing}`,
        caveats: bilibiliDetail("").caveats,
      },
    },
    {
      test: /youtube|youtu\.be|油管/i,
      kind: "youtube",
      detail: {
        typeLabel: "YouTube 视频",
        routeTag: "字幕优先",
        route: `先取字幕（人工字幕优先于自动字幕）；没有字幕再走音频转写。${missing}`,
        caveats: youtubeDetail({ search: "" }).caveats,
      },
    },
    {
      test: /小宇宙|播客|podcast|apple\s*podcasts/i,
      kind: "podcast",
      detail: {
        typeLabel: "播客",
        routeTag: "文稿或音频",
        route: `先找节目文字稿或章节文案；没有则从单集音频或 RSS enclosure 取音频，切段后做语音识别。${missing}`,
        caveats: podcastDetail("", "").caveats,
      },
    },
    {
      test: /arxiv|ar5iv/i,
      kind: "arxiv",
      detail: {
        typeLabel: "arXiv 论文",
        routeTag: "摘要页转 PDF",
        route: `若是摘要页，把 /abs/<id> 换成 /pdf/<id>.pdf 再下载；若已经是 PDF 就直接下载。然后抽取正文，整理成所选中文产出。${missing}`,
        caveats: arxivDetail("/abs/").caveats,
      },
    },
    {
      test: /\bdoi\b|10\.\d{4,9}\//i,
      kind: "doi",
      detail: {
        typeLabel: "DOI 文献",
        routeTag: "DOI 解析",
        route: `用 doi.org 解析这条 DOI，优先保存官方或机构库 PDF；没有 PDF 就只用摘要页。不要绕过付费墙。${missing}`,
        caveats: doiDetail("").caveats,
      },
    },
    {
      test: /\.pdf\b|\bpdf\b|技术报告|tech report/i,
      kind: "pdf",
      detail: {
        typeLabel: "PDF / 技术报告",
        routeTag: "直接下载 PDF",
        route: `直接下载 PDF。有文本层就抽取文字，扫描件先 OCR，再整理成所选中文产出。${missing}`,
        caveats: pdfDetail().caveats,
      },
    },
    {
      test: /论文|预印本|preprint/i,
      kind: "paper",
      detail: {
        typeLabel: "论文",
        routeTag: "先辨载体",
        route:
          "先看地址类型：arXiv 摘要页要换成 PDF（/abs/ → /pdf/）；已经是 PDF 就直接下载；DOI 用 doi.org 解析后再找官方 PDF。请补上 arXiv 编号、DOI 或 PDF 链接。",
        caveats: ["缺具体链接，先补地址再下载。", "出版版本可能有付费墙，拿不到就停在摘要。", PERSONAL],
      },
    },
    {
      test: /文章|网页|博客|报道|公众号|webpage|\barticle\b|\bblog\b/i,
      kind: "article",
      detail: {
        typeLabel: "文章 / 网页",
        routeTag: "抽取正文",
        route: `抽取标题和正文，去掉导航、推荐和评论，再整理成所选中文产出。${missing}`,
        caveats: articleDetail("").caveats,
      },
    },
  ];

  const hit = rules.find((rule) => rule.test.test(raw));
  if (!hit) {
    return finish("unknown", raw, raw, {
      typeLabel: "未能识别",
      routeTag: "待补充",
      route: "看不出来源类型。请换成可打开的链接，或写明是 YouTube、B站、小宇宙/播客、arXiv、DOI、PDF，还是普通网页。",
      caveats: ["信息不够，无法判断要不要登录，也没法估计时长。"],
    });
  }
  return finish(hit.kind, raw, raw, hit.detail);
}

function finish(kind, raw, source, detail) {
  return {
    raw,
    source,
    kind,
    typeLabel: detail.typeLabel,
    routeTag: detail.routeTag,
    route: detail.route,
    length: detail.length || LENGTH[kind] || LENGTH.unknown,
    caveats: detail.caveats,
  };
}

function youtubeDetail(url) {
  const playlist = url.search.includes("list=") && !url.search.includes("v=");
  return {
    typeLabel: playlist ? "YouTube 播放列表" : "YouTube 视频",
    routeTag: "字幕优先",
    route: playlist
      ? "先确认要哪一集，或按集逐条处理。每一集都先取字幕（人工字幕优先于自动字幕），没有字幕再走音频转写。"
      : "先取字幕：有人工字幕用人工字幕，否则用自动字幕。字幕不是中文时再译成中文。没有可用字幕时，改为音频转写，再整理成所选产出。",
    caveats: [
      "会员片、年龄限制或地区限制时，可能需要已登录的会话。不要把账号或 Cookie 写进简报。",
      "长视频必须切段，避免后半段在转写时丢失。",
      PERSONAL,
    ],
  };
}

function bilibiliDetail(path) {
  const course = path.includes("/cheese/") || path.includes("/bangumi/");
  return {
    typeLabel: "Bilibili 视频",
    routeTag: "字幕优先",
    route: "先取 CC 字幕或 AI 字幕。没有字幕时抽取音频做语音识别。多 P 按分 P 处理，不要只做第一 P。",
    caveats: [
      course
        ? "课堂或番剧通常需要登录，有的还要大会员。不要绕过访问限制。"
        : "部分视频需要登录或大会员。不要绕过访问限制。",
      "长视频或多 P 要切段后再合并。",
      PERSONAL,
    ],
  };
}

function podcastDetail(host, path) {
  const rss = path.endsWith(".rss") || path.endsWith("/rss") || path.includes("/feed");
  let typeLabel = "播客";
  if (host.includes("xiaoyuzhou")) typeLabel = "小宇宙播客";
  else if (host.includes("apple")) typeLabel = "Apple Podcasts";
  else if (rss) typeLabel = "播客 RSS";
  return {
    typeLabel,
    routeTag: rss ? "RSS 音频" : "文稿或音频",
    route: rss
      ? "这是 RSS。优先读 shownotes 或文字稿；没有文稿时取 enclosure 音频，按 20–30 分钟切段做语音识别，再合并。"
      : "先找节目自带文字稿、shownotes 或章节文案。没有文稿时，从单集音频或 RSS 的 enclosure 取得音频，按 20–30 分钟切段做语音识别，再合并。小宇宙和 Apple Podcasts 页面通常不是文件地址，要先定位音频或 RSS。",
    caveats: [
      "客户端里的单集可能要登录后才能看到音频地址。",
      "长音频必须切段，避免一次识别中途截断。",
      PERSONAL,
    ],
  };
}

function arxivDetail(path) {
  let form = "abs";
  if (path.includes("/pdf/")) form = "pdf";
  else if (path.includes("/html/")) form = "html";
  const route = {
    pdf: "这是 arXiv PDF。直接下载，抽取正文后再整理成所选中文产出。公式和图表题注保留原文。",
    html: "这是 arXiv HTML。优先改用同编号的 PDF（路径换成 /pdf/<id>.pdf）作为存档；HTML 用来核对段落。",
    abs: "这是 arXiv 摘要页。把路径里的 /abs/ 换成 /pdf/，并补上 .pdf，下载 PDF 后再抽取正文。不要只停在摘要页。",
  }[form];
  return {
    typeLabel: "arXiv 论文",
    routeTag: form === "pdf" ? "直接下载 PDF" : "摘要页转 PDF",
    route,
    caveats: [
      "预印本通常可个人保存。若另有出版版本，以出版商许可为准，不要绕过付费墙。",
      PERSONAL,
    ],
  };
}

function doiDetail(href) {
  const arxivId = href.match(/arxiv[./](\d{4}\.\d{4,5})/i);
  return {
    typeLabel: arxivId ? "DOI → arXiv" : "DOI 文献",
    routeTag: arxivId ? "摘要页转 PDF" : "DOI 解析",
    route: arxivId
      ? `这条 DOI 指向 arXiv ${arxivId[1]}。仍按摘要页转 PDF：下载 arxiv.org 上该编号的 PDF，再抽取正文。`
      : "用 doi.org 解析这条 DOI，打开落地页后优先保存出版商或机构库提供的 PDF。没有 PDF 时只处理摘要页正文。不要绕过付费墙或机构登录。",
    caveats: [
      "出版商页面可能需要机构登录。拿不到 PDF 就停在摘要。",
      PERSONAL,
    ],
    length: LENGTH.doi,
  };
}

function pdfDetail() {
  return {
    typeLabel: "PDF",
    routeTag: "直接下载 PDF",
    route: "链接已经指向 PDF。直接下载。有文本层就抽取文字；扫描件先 OCR，再整理成所选中文产出。",
    caveats: [
      "若返回登录页而不是文件，说明没有访问权限。不要绕过登录。",
      "扫描版需要 OCR，页数多时分块处理。",
      PERSONAL,
    ],
  };
}

function articleDetail() {
  return {
    typeLabel: "文章 / 网页",
    routeTag: "抽取正文",
    route: "把页面当文章：抽取标题和正文，去掉导航、推荐和评论。动态页面若抽不到正文，改用阅读模式或改为粘贴正文。本页不会请求这个链接。",
    caveats: [
      "登录墙或付费墙时，只处理你已经能阅读的正文。",
      PERSONAL,
    ],
  };
}

function isYoutube(host) {
  return host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com" || host.endsWith(".youtube-nocookie.com");
}

function isBilibili(host) {
  return host === "b23.tv" || host === "acg.tv" || host === "bilibili.com" || host.endsWith(".bilibili.com");
}

function isPodcast(host, path, raw) {
  const hosts = [
    "xiaoyuzhoufm.com",
    "podcasts.apple.com",
    "overcast.fm",
    "pocketcasts.com",
    "castbox.fm",
    "podbean.com",
    "anchor.fm",
    "listennotes.com",
  ];
  if (hosts.some((item) => host === item || host.endsWith(`.${item}`))) return true;
  if (host.includes("podcast")) return true;
  if (path.endsWith(".rss") || path.endsWith("/rss")) return true;
  if ((path.includes("/feed") || path.endsWith(".xml")) && /podcast|播客|小宇宙/i.test(raw)) return true;
  return false;
}

function isArxivHost(host) {
  return host === "arxiv.org" || host.endsWith(".arxiv.org") || host === "ar5iv.labs.arxiv.org";
}

function isDoiHost(host) {
  return host === "doi.org" || host === "dx.doi.org";
}

function firstUrl(text) {
  const match = text.match(/https?:\/\/[^\s<>"'“”]+/i);
  return match ? cleanUrlToken(match[0]) : "";
}

function cleanUrlToken(token) {
  return token.replace(/[),，。；、）】\]]+$/g, "");
}

function boot() {
  const els = {
    form: document.querySelector("#form"),
    links: document.querySelector("#links"),
    example: document.querySelector("#btn-example"),
    copy: document.querySelector("#btn-copy"),
    cards: document.querySelector("#cards"),
    brief: document.querySelector("#brief"),
    briefWrap: document.querySelector("#brief-wrap"),
    placeholder: document.querySelector("#placeholder"),
    status: document.querySelector("#status"),
    stale: document.querySelector("#stale"),
    toast: document.querySelector("#toast"),
    modes: [...document.querySelectorAll('input[name="mode"]')],
  };

  const state = {
    items: [],
    mode: "verbatim",
    sourceText: "",
    copied: false,
  };

  function toast(text) {
    els.toast.hidden = false;
    els.toast.textContent = text;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      els.toast.hidden = true;
    }, 1600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.left = "-9999px";
        document.body.append(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        return ok;
      } catch {
        return false;
      }
    }
  }

  function currentBrief() {
    return buildBrief(state.items, state.mode);
  }

  function render() {
    const has = state.items.length > 0;
    els.placeholder.hidden = has;
    els.copy.hidden = !has;
    els.briefWrap.hidden = !has;
    els.copy.classList.toggle("is-copied", state.copied);
    els.copy.textContent = state.copied ? "已复制" : "复制简报";
    els.cards.replaceChildren();
    if (!has) {
      els.status.textContent = "";
      els.brief.textContent = "";
      return;
    }
    const counts = countKinds(state.items);
    els.status.textContent = `已生成 ${state.items.length} 条路线（${counts}）。切换期望产出会立刻改写简报。`;
    state.items.forEach((item, index) => els.cards.append(renderCard(item, index)));
    els.brief.textContent = currentBrief();
  }

  function renderCard(item, index) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.kind = item.kind;

    const top = document.createElement("div");
    top.className = "card-top";
    const title = document.createElement("h3");
    const num = document.createElement("span");
    num.className = "index";
    num.textContent = String(index + 1).padStart(2, "0");
    title.append(num, document.createTextNode(item.typeLabel));
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item.routeTag;
    top.append(title, tag);

    const src = document.createElement("p");
    src.className = "src";
    src.textContent = item.source;

    const list = document.createElement("dl");
    list.append(
      row("建议路线", item.route),
      row("期望产出", expectedOutput(item, state.mode)),
      row("长度处理", item.length),
    );

    const caveats = document.createElement("ul");
    caveats.className = "caveats";
    item.caveats.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      caveats.append(li);
    });

    card.append(top, src, list, caveats);
    return card;
  }

  function run() {
    const raw = els.links.value;
    const parts = splitInputs(raw);
    if (!parts.length) {
      state.items = [];
      state.sourceText = "";
      state.copied = false;
      els.stale.hidden = true;
      render();
      els.status.textContent = "请先贴上链接，或写一句来源描述。";
      els.placeholder.hidden = true;
      els.links.focus();
      return;
    }
    const capped = parts.slice(0, MAX_ITEMS);
    state.items = capped.map(classify);
    state.sourceText = raw;
    state.copied = false;
    els.stale.hidden = true;
    render();
    if (parts.length > MAX_ITEMS) {
      els.status.textContent = `${els.status.textContent} 只处理了前 ${MAX_ITEMS} 条。`;
    }
  }

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    run();
  });

  els.links.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      run();
    }
  });

  els.links.addEventListener("input", () => {
    els.stale.hidden = !state.items.length || els.links.value === state.sourceText;
  });

  els.example.addEventListener("click", () => {
    els.links.value = SAMPLES.join("\n");
    run();
    els.briefWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  els.modes.forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      state.mode = input.value;
      state.copied = false;
      render();
    });
  });

  els.copy.addEventListener("click", async () => {
    if (!state.items.length) return;
    const ok = await copyText(currentBrief());
    state.copied = ok;
    render();
    toast(ok ? "已复制简报" : "复制失败，请手动选择简报");
    if (!ok) els.brief.focus();
  });

  render();
}

function row(term, text) {
  const wrap = document.createElement("div");
  const dt = document.createElement("dt");
  dt.textContent = term;
  const dd = document.createElement("dd");
  dd.textContent = text;
  wrap.append(dt, dd);
  return wrap;
}

function countKinds(items) {
  const labels = [];
  const seen = new Set();
  items.forEach((item) => {
    if (seen.has(item.typeLabel)) return;
    seen.add(item.typeLabel);
    labels.push(item.typeLabel);
  });
  return labels.join("、");
}

if (typeof document !== "undefined") boot();
