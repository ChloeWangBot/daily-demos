const FAV_KEY = "public-api-pad:favs";

const APIS = [
  {
    id: "open-meteo",
    name: "Open-Meteo",
    use: "查全球天气预报与历史气候，适合仪表盘起步。",
    cat: "天气",
    needsKey: false,
    auth: "无需 Key。注意礼貌限流。",
    path: "/v1/forecast?latitude=35.68&longitude=139.69&current_weather=true",
    host: "api.example.com/weather",
  },
  {
    id: "openweather",
    name: "OpenWeatherMap",
    use: "按城市名取当前天气、预报与空气质量。",
    cat: "天气",
    needsKey: true,
    auth: "Query：appid=YOUR_API_KEY",
    path: "/data/2.5/weather?q=Tokyo&appid=YOUR_API_KEY",
    host: "api.example.com/weather",
  },
  {
    id: "weatherapi",
    name: "WeatherAPI",
    use: "实时天气、预报、天文与历史查询。",
    cat: "天气",
    needsKey: true,
    auth: "Query：key=YOUR_API_KEY",
    path: "/v1/current.json?key=YOUR_API_KEY&q=Shanghai",
    host: "api.example.com/weather",
  },
  {
    id: "nws",
    name: "NWS Forecast",
    use: "美国国家气象局网格预报，官方开放数据。",
    cat: "天气",
    needsKey: false,
    auth: "无需 Key。请求请带可识别 User-Agent。",
    path: "/points/39.7456,-97.0892",
    host: "api.example.com/weather",
  },
  {
    id: "met-no",
    name: "MET Norway",
    use: "北欧气象研究所位置预报，覆盖全球格点。",
    cat: "天气",
    needsKey: false,
    auth: "无需 Key。必须设置 Unique User-Agent。",
    path: "/locationforecast/2.0/compact?lat=59.91&lon=10.75",
    host: "api.example.com/weather",
  },
  {
    id: "7timer",
    name: "7Timer",
    use: "轻量民用预报，适合演示与教学。",
    cat: "天气",
    needsKey: false,
    auth: "无需 Key。",
    path: "/bin/civil.php?lon=121.47&lat=31.23&ac=0&unit=metric&output=json&tzshift=0",
    host: "api.example.com/weather",
  },
  {
    id: "newsapi",
    name: "NewsAPI",
    use: "按关键词或来源拉头条与检索文章。",
    cat: "新闻",
    needsKey: true,
    auth: "Query：apiKey=YOUR_API_KEY（开发环境限本机）",
    path: "/v2/top-headlines?country=us&apiKey=YOUR_API_KEY",
    host: "api.example.com/news",
  },
  {
    id: "gnews",
    name: "GNews",
    use: "多语言头条与搜索，返回标题、摘要和链接。",
    cat: "新闻",
    needsKey: true,
    auth: "Query：apikey=YOUR_API_KEY",
    path: "/api/v4/top-headlines?lang=zh&apikey=YOUR_API_KEY",
    host: "api.example.com/news",
  },
  {
    id: "guardian",
    name: "The Guardian",
    use: "卫报开放内容搜索，适合媒体实验。",
    cat: "新闻",
    needsKey: true,
    auth: "Query：api-key=YOUR_API_KEY",
    path: "/search?q=climate&api-key=YOUR_API_KEY",
    host: "api.example.com/news",
  },
  {
    id: "nytimes",
    name: "NYTimes Top Stories",
    use: "纽约时报分区头条，按栏目取最新稿。",
    cat: "新闻",
    needsKey: true,
    auth: "Query：api-key=YOUR_API_KEY",
    path: "/svc/topstories/v2/home.json?api-key=YOUR_API_KEY",
    host: "api.example.com/news",
  },
  {
    id: "spaceflight",
    name: "Spaceflight News",
    use: "航天新闻聚合，文章、博客与报告。",
    cat: "新闻",
    needsKey: false,
    auth: "无需 Key。",
    path: "/v4/articles/?limit=5",
    host: "api.example.com/news",
  },
  {
    id: "hn",
    name: "Hacker News",
    use: "官方 Firebase 接口，读热帖与条目详情。",
    cat: "新闻",
    needsKey: false,
    auth: "无需 Key。先取 topstories 再取 item。",
    path: "/v0/topstories.json",
    host: "api.example.com/news",
  },
  {
    id: "nominatim",
    name: "Nominatim",
    use: "OpenStreetMap 地理编码：地名 ↔ 坐标。",
    cat: "地图",
    needsKey: false,
    auth: "无需 Key。必须带 User-Agent，遵守用量政策。",
    path: "/search?q=Tokyo%20Station&format=json&limit=1",
    host: "api.example.com/geo",
    headers: { "User-Agent": "public-api-pad-demo/1.0" },
  },
  {
    id: "photon",
    name: "Photon",
    use: "Komoot 开源地理编码器，适合自动完成。",
    cat: "地图",
    needsKey: false,
    auth: "无需 Key。公共实例请控制频率。",
    path: "/api/?q=Berlin&limit=3",
    host: "api.example.com/geo",
  },
  {
    id: "openmeteo-geo",
    name: "Open-Meteo Geocoding",
    use: "城市名转经纬度，和天气预报接口配套。",
    cat: "地图",
    needsKey: false,
    auth: "无需 Key。",
    path: "/v1/search?name=Hangzhou&count=3&language=zh",
    host: "api.example.com/geo",
  },
  {
    id: "mapbox",
    name: "Mapbox Geocoding",
    use: "正/逆地理编码与地址补全。",
    cat: "地图",
    needsKey: true,
    auth: "Query：access_token=YOUR_API_KEY",
    path: "/geocoding/v5/mapbox.places/shanghai.json?access_token=YOUR_API_KEY",
    host: "api.example.com/geo",
  },
  {
    id: "geojs",
    name: "GeoJS",
    use: "用访问者 IP 估测国家与大致坐标。",
    cat: "地图",
    needsKey: false,
    auth: "无需 Key。精度有限，勿当精确定位。",
    path: "/v1/ip/geo.json",
    host: "api.example.com/geo",
  },
  {
    id: "zippopotam",
    name: "Zippopotam",
    use: "邮政编码查城市与经纬度。",
    cat: "地图",
    needsKey: false,
    auth: "无需 Key。",
    path: "/us/90210",
    host: "api.example.com/geo",
  },
  {
    id: "coingecko",
    name: "CoinGecko",
    use: "加密货币价格、市值与简单行情。",
    cat: "加密货币",
    needsKey: false,
    auth: "公开读无需 Key；高配额要 Key。",
    path: "/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
    host: "api.example.com/crypto",
  },
  {
    id: "coincap",
    name: "CoinCap",
    use: "资产列表与实时价格快照。",
    cat: "加密货币",
    needsKey: false,
    auth: "无需 Key。",
    path: "/v2/assets/bitcoin",
    host: "api.example.com/crypto",
  },
  {
    id: "coinpaprika",
    name: "CoinPaprika",
    use: "币种资料、行情与交易所列表。",
    cat: "加密货币",
    needsKey: false,
    auth: "无需 Key。",
    path: "/v1/tickers/btc-bitcoin",
    host: "api.example.com/crypto",
  },
  {
    id: "binance",
    name: "Binance Public",
    use: "公开行情：最新成交价与 24h 统计。",
    cat: "加密货币",
    needsKey: false,
    auth: "行情接口无需 Key。交易接口不在此列。",
    path: "/api/v3/ticker/price?symbol=BTCUSDT",
    host: "api.example.com/crypto",
  },
  {
    id: "cryptocompare",
    name: "CryptoCompare",
    use: "多市场报价与历史分钟线。",
    cat: "加密货币",
    needsKey: true,
    auth: "Header：authorization: Apikey YOUR_API_KEY",
    path: "/data/price?fsym=ETH&tsyms=USD,EUR",
    host: "api.example.com/crypto",
    headers: { authorization: "Apikey YOUR_API_KEY" },
  },
  {
    id: "coindesk",
    name: "CoinDesk BPI",
    use: "比特币价格指数（教学与展示常用）。",
    cat: "加密货币",
    needsKey: false,
    auth: "无需 Key。",
    path: "/v1/bpi/currentprice.json",
    host: "api.example.com/crypto",
  },
  {
    id: "github",
    name: "GitHub REST",
    use: "读公开仓库、议题与用户资料。",
    cat: "开发工具",
    needsKey: false,
    auth: "公开读可不带 Key；写操作或更高限额用 Token。",
    path: "/repos/public-apis/public-apis",
    host: "api.example.com/dev",
  },
  {
    id: "jsonplaceholder",
    name: "JSONPlaceholder",
    use: "假 REST 资源，练 CRUD 与列表页。",
    cat: "开发工具",
    needsKey: false,
    auth: "无需 Key。",
    path: "/posts/1",
    host: "api.example.com/dev",
  },
  {
    id: "httpbin",
    name: "httpbin",
    use: "回显请求头、方法与状态码，调试 HTTP。",
    cat: "开发工具",
    needsKey: false,
    auth: "无需 Key。",
    path: "/get?demo=1",
    host: "api.example.com/dev",
  },
  {
    id: "reqres",
    name: "ReqRes",
    use: "模拟用户登录与分页列表的测试 API。",
    cat: "开发工具",
    needsKey: false,
    auth: "无需 Key。登录返回假 token。",
    path: "/api/users?page=1",
    host: "api.example.com/dev",
  },
  {
    id: "dummyjson",
    name: "DummyJSON",
    use: "商品、用户、购物车假数据，适合原型。",
    cat: "开发工具",
    needsKey: false,
    auth: "无需 Key。",
    path: "/products/1",
    host: "api.example.com/dev",
  },
  {
    id: "ipify",
    name: "ipify",
    use: "返回当前公网 IP，一行就能接到设置页。",
    cat: "开发工具",
    needsKey: false,
    auth: "无需 Key。",
    path: "/?format=json",
    host: "api.example.com/dev",
  },
  {
    id: "uuid",
    name: "UUIDTools",
    use: "生成 UUID v4，给本地原型当主键。",
    cat: "开发工具",
    needsKey: false,
    auth: "无需 Key。",
    path: "/api/generate/v4",
    host: "api.example.com/dev",
  },
  {
    id: "restcountries",
    name: "REST Countries",
    use: "国家名称、区号、货币与国旗数据。",
    cat: "开发工具",
    needsKey: false,
    auth: "无需 Key。",
    path: "/v3.1/name/japan",
    host: "api.example.com/dev",
  },
  {
    id: "nasa-apod",
    name: "NASA APOD",
    use: "每日天文图片与说明。",
    cat: "其他",
    needsKey: true,
    auth: "Query：api_key=YOUR_API_KEY（可用 DEMO_KEY 试）",
    path: "/planetary/apod?api_key=YOUR_API_KEY",
    host: "api.example.com/misc",
  },
  {
    id: "openlibrary",
    name: "Open Library",
    use: "按书名或 ISBN 搜索图书与封面。",
    cat: "其他",
    needsKey: false,
    auth: "无需 Key。",
    path: "/search.json?q=dune",
    host: "api.example.com/misc",
  },
  {
    id: "dictionary",
    name: "Free Dictionary",
    use: "英英释义、音标与例句。",
    cat: "其他",
    needsKey: false,
    auth: "无需 Key。",
    path: "/api/v2/entries/en/serendipity",
    host: "api.example.com/misc",
  },
  {
    id: "exchangerate",
    name: "ExchangeRate-API",
    use: "法币汇率表，做简易换算器。",
    cat: "其他",
    needsKey: true,
    auth: "路径或 Query 带 YOUR_API_KEY",
    path: "/v6/YOUR_API_KEY/latest/USD",
    host: "api.example.com/misc",
  },
  {
    id: "pokeapi",
    name: "PokéAPI",
    use: "宝可梦图鉴、技能与精灵数据。",
    cat: "其他",
    needsKey: false,
    auth: "无需 Key。请缓存结果。",
    path: "/api/v2/pokemon/pikachu",
    host: "api.example.com/misc",
  },
  {
    id: "catfacts",
    name: "Cat Facts",
    use: "随机猫咪冷知识，适合小部件演示。",
    cat: "其他",
    needsKey: false,
    auth: "无需 Key。",
    path: "/fact",
    host: "api.example.com/misc",
  },
];

const els = {
  form: document.querySelector("#search-form"),
  q: document.querySelector("#q"),
  cards: document.querySelector("#cards"),
  empty: document.querySelector("#empty"),
  meta: document.querySelector("#result-meta"),
  toast: document.querySelector("#toast"),
  fmt: document.querySelector("#fmt"),
  favs: document.querySelector("#btn-favs"),
  cats: [...document.querySelectorAll("[data-cat]")],
  examples: [...document.querySelectorAll("[data-example]")],
};

const state = {
  query: "",
  cat: "all",
  noKey: false,
  onlyFavs: false,
  selected: null,
  copied: null,
};

function loadFavs() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

function saveFavs(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
}

let favs = loadFavs();

function snippet(api) {
  const url = `https://${api.host}${api.path}`;
  const headers = api.headers || (api.needsKey && api.auth.startsWith("Header")
    ? { Authorization: "Bearer YOUR_API_KEY" }
    : null);

  if (els.fmt.value === "curl") {
    const headerFlags = headers
      ? Object.entries(headers)
          .map(([k, v]) => ` \\\n  -H "${k}: ${v}"`)
          .join("")
      : "";
    return `# ${api.name} · ${api.needsKey ? "替换 YOUR_API_KEY" : "无需 Key"}\ncurl -s "${url}"${headerFlags}`;
  }

  const headerBlock = headers
    ? `, {\n  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")}\n}`
    : "";
  return `// ${api.name} · ${api.needsKey ? "替换 YOUR_API_KEY" : "无需 Key"}\nfetch("${url}"${headerBlock})\n  .then((r) => r.json())\n  .then((data) => console.log(data));`;
}

function matches(api) {
  if (state.cat !== "all" && api.cat !== state.cat) return false;
  if (state.noKey && api.needsKey) return false;
  if (state.onlyFavs && !favs.has(api.id)) return false;
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  const hay = [api.name, api.use, api.cat, api.auth, api.needsKey ? "需要key" : "无key 无需key"]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function toast(text) {
  els.toast.hidden = false;
  els.toast.textContent = text;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => {
    els.toast.hidden = true;
  }, 1600);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

async function copyApi(api, fromButton) {
  const ok = await copyText(snippet(api));
  state.selected = api.id;
  state.copied = ok ? api.id : null;
  render();
  if (ok) {
    toast("已复制");
    if (fromButton) fromButton.focus();
  } else {
    toast("复制失败，请手动选择片段");
  }
}

function setCat(cat) {
  state.cat = cat;
  els.cats.forEach((btn) => {
    const on = btn.dataset.cat === cat;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-selected", String(on));
  });
  syncExamples();
}

function syncExamples() {
  els.examples.forEach((btn) => {
    const key = btn.dataset.example;
    const on =
      (key === "weather" && state.cat === "天气") ||
      (key === "news" && state.cat === "新闻") ||
      (key === "nokey" && state.noKey);
    btn.classList.toggle("is-on", on);
  });
}

function filtered() {
  return APIS.filter(matches);
}

function render() {
  const list = filtered();
  els.meta.textContent = state.onlyFavs
    ? `收藏 ${list.length} / ${favs.size}`
    : `${list.length} 条${state.noKey ? " · 无 Key" : ""}${state.cat !== "all" ? ` · ${state.cat}` : ""}`;
  els.empty.hidden = list.length > 0;
  els.cards.innerHTML = list
    .map((api) => {
      const fav = favs.has(api.id);
      const copied = state.copied === api.id;
      const selected = state.selected === api.id;
      return `
        <article class="card${selected ? " is-on" : ""}" data-id="${api.id}" tabindex="0">
          <div class="card-top">
            <h3>${escapeHtml(api.name)}</h3>
            <div class="tags">
              <span class="tag">${escapeHtml(api.cat)}</span>
              <span class="tag ${api.needsKey ? "key-yes" : "key-no"}">需 Key：${api.needsKey ? "是" : "否"}</span>
            </div>
          </div>
          <p class="use">${escapeHtml(api.use)}</p>
          <p class="auth">Auth：${escapeHtml(api.auth)}</p>
          <div class="card-actions">
            <button type="button" class="ghost${copied ? " is-copied" : ""}" data-copy="${api.id}">
              ${copied ? "已复制" : "复制起步片段"}
            </button>
            <button type="button" class="ghost${fav ? " is-fav" : ""}" data-fav="${api.id}">
              ${fav ? "已收藏" : "收藏"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function applyExample(key) {
  if (key === "weather") {
    state.noKey = false;
    state.onlyFavs = false;
    els.favs.setAttribute("aria-pressed", "false");
    els.q.value = "";
    state.query = "";
    setCat("天气");
  } else if (key === "news") {
    state.noKey = false;
    state.onlyFavs = false;
    els.favs.setAttribute("aria-pressed", "false");
    els.q.value = "";
    state.query = "";
    setCat("新闻");
  } else if (key === "nokey") {
    state.noKey = !state.noKey;
    syncExamples();
  }
  render();
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = els.q.value;
  render();
  els.q.focus();
});

els.q.addEventListener("input", () => {
  state.query = els.q.value;
  render();
});

els.cats.forEach((btn) => {
  btn.addEventListener("click", () => {
    setCat(btn.dataset.cat);
    render();
  });
});

els.examples.forEach((btn) => {
  btn.addEventListener("click", () => applyExample(btn.dataset.example));
});

els.favs.addEventListener("click", () => {
  state.onlyFavs = !state.onlyFavs;
  els.favs.setAttribute("aria-pressed", String(state.onlyFavs));
  els.favs.classList.toggle("is-on", state.onlyFavs);
  render();
});

els.fmt.addEventListener("change", () => {
  if (state.copied) {
    state.copied = null;
    render();
  }
});

els.cards.addEventListener("click", async (event) => {
  const favBtn = event.target.closest("[data-fav]");
  if (favBtn) {
    event.stopPropagation();
    const id = favBtn.dataset.fav;
    if (favs.has(id)) favs.delete(id);
    else favs.add(id);
    saveFavs(favs);
    render();
    return;
  }

  const copyBtn = event.target.closest("[data-copy]");
  const card = event.target.closest("[data-id]");
  if (!card) return;
  const api = APIS.find((item) => item.id === card.dataset.id);
  if (!api) return;
  await copyApi(api, copyBtn);
});

els.cards.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-id]");
  if (!card || event.target.closest("button")) return;
  event.preventDefault();
  const api = APIS.find((item) => item.id === card.dataset.id);
  if (api) await copyApi(api);
});

render();
