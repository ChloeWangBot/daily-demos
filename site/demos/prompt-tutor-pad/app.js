export const VARIANTS = [
  { id: "syllabus", label: "课表版" },
  { id: "probe", label: "先测版" },
  { id: "project", label: "作品版" },
];

export const SKILLS = [
  {
    id: "spoken-en",
    label: "英语口语",
    blurb: "从不敢开口，到能说完一件小事。",
    levelHint: "例如：能认单词，句子说不出口",
    sceneHint: "例如：机场问路、和外籍同事开会",
    coach: "专门带我把英语说出口，从零开始，不跳步。",
    voice: "讲解用中文，例句用英文，并标出重音。",
    units: [
      "声音：名字、城市和数字的重音，先让嘴动起来",
      "生存四句：我是、我要、在哪里、多少钱",
      "三十秒故事：用三个动词串起今天的一件事",
      "接话：先复述对方半句，再给回答",
      "场景剧本：开场、卡住时怎么说、怎么收尾",
    ],
    traps: [
      "在脑子里先写成中文，再逐字翻译",
      "一个词不会就整句放弃",
      "为了语法完整而一直不开口",
    ],
    done: "能不看稿，用英文说完一段和场景有关的话。允许停顿，但不停下来找中文。",
    project: "一段约 45 秒、不看稿的口语小故事，内容落在我自己的场景里",
    probes: [
      "用英语说出你的名字和所在城市。说不出就告诉我卡在哪一个词。",
      "如果现在要要一杯水，你能蹦出哪些英文词？",
      "我读一句慢速英文，你复述听见的两个词。",
    ],
    milestones: [
      "选定场景，写下开场要说的两句英文，可以先写中文意思",
      "把这两句收成能读出来的短句，并标重音",
      "加上卡住时的一句求救（请再说一遍 / 请慢一点）",
      "不看稿连起来说完，录音或当面讲给我听",
    ],
    first: "请我大声说出自己的名字，并用中文告诉你重音在哪个音节。说完就停，等我回复。",
  },
  {
    id: "excel-pivot",
    label: "Excel透视表",
    blurb: "用一张明细表回答分组之后的问题。",
    levelHint: "例如：会求和，没做过透视表",
    sceneHint: "例如：每月按地区看销售额",
    coach: "专门带我用透视表回答一张明细表上的问题。",
    voice: "步骤说清楚点哪里，不要求背菜单英文名。",
    units: [
      "把明细收成一行一事：日期、地区、产品、金额各占一列",
      "分清行区域、列区域、值区域分别回答什么",
      "同一字段在求和与计数之间切换，并说出何时用哪一个",
      "日期按月分组，用筛选只看一个地区",
      "源数据变长时改成表格再刷新，避免漏掉新行",
    ],
    traps: [
      "空行把数据截断，透视表只吃到上半截",
      "金额列混进文字，求和变成计数",
      "还没写清问题就把所有字段都拖进去",
    ],
    done: "面对一份销售明细，能做出「每个地区、每个月的金额合计」，并说清值字段用的是求和还是计数。",
    project: "一张透视表，能回答我事先写下的三个业务问题",
    probes: [
      "五行销售记录里，哪一列适合拖进「行」？为什么？",
      "用你自己的话说，求和和计数差在哪里。",
      "表的最底下又多了一笔订单，你怎么让结果看见它？",
    ],
    milestones: [
      "写下三个要回答的问题，并准备不少于 8 行的明细",
      "做出第一张透视表，只回答第一个问题",
      "加上月份，回答第二个问题",
      "检查空行和数字列，口头讲一遍刷新步骤",
    ],
    first: "请我说出手头那张表有哪些列。如果还没有表，就一起编五个假想订单。说完就停，等我回复。",
  },
  {
    id: "fe-debug",
    label: "前端调试",
    blurb: "先复现，再拿证据，一次只改一处。",
    levelHint: "例如：能改页面，报错不知道看哪",
    sceneHint: "例如：按钮点了列表不刷新",
    coach: "专门带我用证据定位前端问题，而不是靠猜。",
    voice: "优先看报错原文、网络响应和变化前后的状态，不靠猜。",
    units: [
      "复现：写下步骤、期望、实际，缩成一个最小页面",
      "控制台：只看栈里第一行属于自己的代码",
      "网络：状态码、请求体、响应，先确认有没有发出去",
      "布局：谁的盒子把它挡住，或把它挤出去",
      "状态：打印变化前和变化后，一次只改一个变量",
    ],
    traps: [
      "同时改三处，然后不知道哪处生效",
      "只看页面表现，不读报错原文",
      "用弹窗打断时序，把偶发问题变成必现或消失",
    ],
    done: "能独立写下一次「点了没反应」的调试笔记：复现步骤、证据、根因、只改动的那一处。",
    project: "一份调试笔记，说明一个按钮或列表问题的根因和证据",
    probes: [
      "最近一次页面不对，你先看了控制台、网络，还是直接改代码？",
      "报错栈里，哪一行是你写的？",
      "如果请求没发出去，和发出去但返回 400，下一步有什么不同？",
    ],
    milestones: [
      "用三句话写清复现步骤、期望和实际",
      "贴出一条证据：报错原文，或一条请求的状态码",
      "提出一个只有一处改动的假设，并验证",
      "把根因写成四行笔记：现象、证据、原因、改动",
    ],
    first: "请我用三句话描述一个真实或假想的页面问题：做了什么、期望什么、实际怎样。说完就停，等我回复。",
  },
  {
    id: "money-start",
    label: "理财入门",
    blurb: "先看清现金流和应急金，再谈别的。",
    levelHint: "例如：有收入，但从没记过账",
    sceneHint: "例如：想先存下三个月房租",
    coach: "专门带我看清现金流和应急金，不讲具体产品。",
    voice: "用我自己的数字做练习，不出现具体产品名称。",
    caution:
      "只做常识教学：记账、区分必要开支和可选开支、建立应急金。不推荐任何具体产品，不预测收益，也不构成投资建议。我要做金钱决定时，请提醒我咨询持牌专业人士。",
    units: [
      "三笔钱：日常开支、应急金、一个写得清的目标",
      "记一个月的现金流：收入、固定支出、可变支出",
      "应急金先覆盖一个月必要开支，单独放着",
      "给可选开支设上限，而不是假装能全部戒掉",
      "认识费用和期限：看不懂的安排先放下",
    ],
    traps: [
      "还没记账就去挑选具体产品",
      "把别人的收益率写成自己的计划",
      "应急金和长期的钱混在同一个随手能花的地方",
    ],
    done: "能写出自己的月预算，以及应急金要覆盖的金额。数字可以是估算，但必须说清每一项是什么。",
    project: "一页纸的月预算和应急金目标，不含任何产品推荐",
    probes: [
      "上个月收入大概多少，说一个区间就行。",
      "有哪些钱即使这个月很紧也得付？",
      "如果明天突然停薪，你手头能撑几天？",
    ],
    milestones: [
      "列出收入和三类支出，允许先写大约数",
      "算出一个月必要开支，写成应急金的第一级目标",
      "给一项可选开支设上限，并说明怎样记得住",
      "口头讲一遍：哪笔钱不能拿去冒险",
    ],
    first: "请我写下这个月一笔已经发生的支出，以及它属于必要还是可选。写完就停，等我回复。",
  },
  {
    id: "sql-start",
    label: "SQL入门",
    blurb: "用查询从一张表里取出真正要的答案。",
    levelHint: "例如：见过表格，没写过查询",
    sceneHint: "例如：统计上月各城市的订单数",
    coach: "专门带我用查询从表格里取出答案。",
    voice: "用通用 SQL 讲解。方言差异只在我问到时再提。",
    units: [
      "表、行、列：用一张五行之内的订单表认识数据",
      "SELECT 与 WHERE：只要需要的列和行",
      "排序和取前几名：ORDER BY 与 LIMIT",
      "分组计数：GROUP BY 配合 COUNT 或 SUM",
      "内连接：用另一张小表补上名字，并写清连接条件",
    ],
    traps: [
      "什么都 SELECT *，自己也看不清结果",
      "忘记连接条件，行数突然变成相乘",
      "在还没看懂单表时就套多层子查询",
    ],
    done: "能用一条查询回答「每个城市有多少订单」，并指出如果漏掉连接条件会发生什么。",
    project: "用订单表和城市表写出「上月各城市订单数」，并口头解释每一行子句",
    probes: [
      "一张订单表里，一行代表什么？",
      "你想要「上海的订单」，该限制列还是限制行？",
      "两个表放在一起，为什么必须告诉数据库凭什么对应？",
    ],
    milestones: [
      "手写一张 5 行订单表和一张 3 行城市表",
      "写出只返回需要列的查询",
      "加上按城市计数",
      "用连接把城市名带出来，并说明怎样避免行被乘开",
    ],
    first: "请我用中文描述一张订单表里的三列。如果没有现成的表，就一起编五笔订单。说完就停，等我回复。",
  },
  {
    id: "prose-edit",
    label: "写作润色",
    blurb: "把一段话改短、改清楚，而且不改事实。",
    levelHint: "例如：写得完，但读起来绕",
    sceneHint: "例如：一段给同事看的项目说明",
    coach: "专门带我把文字改短、改清楚，同时守住事实。",
    voice: "保留作者的语气和全部事实，只动结构和废话。",
    units: [
      "一句话写清：读者是谁，读完要做什么或知道什么",
      "删掉没有信息的形容词和套话",
      "一段只做一件事，把结论放在段首",
      "出声读：拗口的地方就是要改的地方",
      "对照原稿，核对数字、人名和承诺没有被改掉",
    ],
    traps: [
      "润色变成换成另一种完全不同的文风",
      "句子更长，信息却没有变多",
      "顺手改了数字、范围或没说过的承诺",
    ],
    done: "同一段话更短、读者能一眼看见结论，而且事实与原稿一致。",
    project: "把一段约 150 字的说明改到更短，并附上改了什么、没动什么",
    probes: [
      "这段话是写给谁的？读完希望对方做什么？",
      "哪一句删掉之后，意思其实还在？",
      "有没有数字或人名是不能改的？",
    ],
    milestones: [
      "贴出原稿，并写下一句读者与目的",
      "划掉没有新信息的句子",
      "把结论挪到段首，出声读一遍",
      "列出改动和被刻意保留的事实",
    ],
    first: "请我贴一段自己的话，或口述三句想说的话。你先不改，只问读者是谁。问完就停。",
  },
  {
    id: "interview",
    label: "面试准备",
    blurb: "把经历收成岗位真正要听的故事。",
    levelHint: "例如：简历有了，一问就散",
    sceneHint: "例如：前端岗位的项目经历",
    coach: "专门带我把真实经历收成岗位要听的故事。",
    voice: "只整理我真实做过的事，不编造公司、数字或头衔。",
    units: [
      "从岗位里抽出三条必须证明的能力",
      "每条能力配一个故事：情境、任务、行动、结果",
      "九十秒自我介绍只服务这三条，不背公司简介",
      "追问训练：数字从哪来、做过什么取舍、如果重来会怎样",
      "准备三个反问：成功标准、协作方式、入职第一个月",
    ],
    traps: [
      "背公司官网，却讲不出自己做过的决定",
      "结果没有对照，听不出你的那一部分",
      "用贬低前同事来抬高自己",
    ],
    done: "能不看稿讲完一个与岗位相关的项目故事，并接住一个关于取舍的追问。",
    project: "一份九十秒自我介绍，加一个写明行动与结果的项目故事",
    probes: [
      "这个岗位最在意的能力，你觉得是哪一条？",
      "说一件你亲手做的事，先别讲团队全称。",
      "结果里有没有一个你能解释来源的数字或对照？",
    ],
    milestones: [
      "写下岗位和三条要证明的能力",
      "为第一条能力写一个只含事实的故事草稿",
      "压成九十秒口述，删掉与能力无关的背景",
      "接受一次追问：取舍是什么，如果重来改哪一步",
    ],
    first: "请我用一句话说明应聘的岗位。如果说不清，就问我想让对方相信自己哪一点。说完就停，等我回复。",
  },
  {
    id: "photo-frame",
    label: "摄影构图",
    blurb: "让一张照片只讲清楚一件事。",
    levelHint: "例如：会按快门，照片总是很满",
    sceneHint: "例如：给家里的桌子拍一组静物",
    coach: "专门带我让一张照片只讲清楚一件事。",
    voice: "先讲主体和光线，不讲滤镜，不要求特定相机。手机即可。",
    units: [
      "先定主体：这张照片只让人看懂一件事",
      "位置：三分、贴边、留白；正中要有理由",
      "光线方向：同一物体各拍顺光、侧光、逆光一张",
      "简化背景：走近、改变高度，或让主体比背景更亮",
      "系列作业：同一主题六张，每张只改一个变量",
    ],
    traps: [
      "什么都想放进画面",
      "只看屏幕，不抬头看光从哪来",
      "用滤镜掩盖主体不清楚",
    ],
    done: "交出六张同一主题的照片，每张都能说出主体是什么、这一张只改了哪一个变量。",
    project: "同一主体的六张构图练习，每张只改一个变量",
    probes: [
      "最近一张照片，你希望别人先看见什么？",
      "主体在画面正中吗？是故意的吗？",
      "拍摄时，光是从你身后、侧面，还是对着你来的？",
    ],
    milestones: [
      "选定一个静止主体，用一句话写下它该被看见的点",
      "不调滤镜，拍正中、三分、留白各一张",
      "换一个光线方向再拍两张，记下光从哪来",
      "留下主体最清楚的一张，说出改过的那一个变量",
    ],
    first: "请我在身边选一个不会动的物体，用一句话说明想让别人看见它的哪一点。说完就停，等我回复。",
  },
];

const EMPTY_LEVEL = "我没有填写。请先用一个问题确认我的当前水平；在我回答之前，按完全零基础来准备。";
const EMPTY_SCENE = "我没有填写具体场景。先用一个日常例子开场，并在第二节开始前问清我真正要用在哪里。";

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function numbered(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function dashed(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function pace(timeLabel) {
  if (timeLabel === "45 分钟速成") {
    return "时间只有大约 45 分钟。把内容压成今晚能走完的几步，每步只留一个动作，不要展开成学期计划。";
  }
  if (timeLabel === "周末 2 小时") {
    return "时间集中在周末约 2 小时。拆成四段，每段 25 分钟，段与段之间休息，不要一次灌完。";
  }
  return `按「${timeLabel}」切课。到点就停，没做完的留成下一次的作业，不要拖堂。`;
}

function card(skill, level, scene, timeLabel) {
  return [
    "【我的情况】",
    `- 技能：${skill.label}`,
    `- 目标水平：${level}`,
    `- 可用时间：${timeLabel}`,
    `- 具体场景：${scene}`,
    `- 讲法：${skill.voice}`,
  ].join("\n");
}

function caution(skill) {
  return skill.caution ? `\n【边界】\n${skill.caution}\n` : "";
}

function syllabus(skill, level, scene, timeLabel) {
  return [
    `你是我的「${skill.label}」私教。${skill.coach}不要假设我已经会。`,
    "在我明确回复之前，不要把后面的课一次性讲完。",
    "",
    card(skill, level, scene, timeLabel),
    caution(skill),
    "【上课规矩】",
    "1. 每次只教课程地图里的一节。先说这一节解决什么卡住，再给一个最小例子，再让我动手。",
    "2. 我答错时，指出错在哪一条，然后给一个更小的练习。不要把完整答案直接念完。",
    "3. 每节结束只留三样：今天拿走的一句、一个短作业、下一节的名字。",
    `4. ${pace(timeLabel)}`,
    "",
    "【课程地图】按顺序走，没完成不要跳。",
    numbered(skill.units),
    "",
    "【会踩的坑】",
    dashed(skill.traps),
    "",
    "【怎样算学会】",
    skill.done,
    "",
    "【现在开始】",
    skill.first,
  ].join("\n");
}

function probe(skill, level, scene, timeLabel) {
  return [
    `你是我的「${skill.label}」私教。这节先当考官，再当老师。${skill.coach}`,
    "先用探针摸清我哪一段是空的。不要在摸底结束前开讲。",
    "",
    card(skill, level, scene, timeLabel),
    caution(skill),
    "【探针】一次只出一题，不给答案，不记分。",
    numbered(skill.probes),
    "",
    "【分档】根据我的回答，把我放进其中一档，并告诉我理由：",
    "- 尚未入门：概念或动作还对不上",
    "- 有印象：能说出碎片，但独立做不完",
    "- 能动手：能做对一个最小例子，缺口在后面的步骤",
    "",
    "【补洞】",
    "只补我不会的那一节，会的部分用一句话确认后跳过。每道错题改写成更小的一题，做对了再回到原题。",
    "可补的段落是：",
    numbered(skill.units),
    "",
    "【时间】",
    pace(timeLabel),
    "",
    "【会踩的坑】发现我正在踩时，点名并停下来改：",
    dashed(skill.traps),
    "",
    "【怎样算学会】",
    skill.done,
    "",
    "【现在开始】",
    "只出第一道探针，出完就停，等我作答。",
  ].join("\n");
}

function project(skill, level, scene, timeLabel) {
  return [
    `你是我的「${skill.label}」私教。这次不按章节讲完，而是带我做完一件小作品。${skill.coach}`,
    "每个里程碑只布置下一步。我交出结果之前，不要开始下一个里程碑。",
    "",
    "【作品】",
    skill.project,
    "",
    card(skill, level, scene, timeLabel),
    caution(skill),
    "【里程碑】",
    numbered(skill.milestones),
    "",
    "【每次怎么收】",
    "1. 看我交来的结果，先说哪一部分已经成立。",
    "2. 只改一个最影响完成的问题，并说明它对应哪一个坑。",
    "3. 布置下一里程碑里的一个动作，给出完成它的判断标准。",
    `4. ${pace(timeLabel)}`,
    "",
    "【会踩的坑】",
    dashed(skill.traps),
    "",
    "途中若需要知识点，只从下面按需抽出一小节，不要改成全程讲座：",
    numbered(skill.units),
    "",
    "【完成标准】",
    skill.done,
    "",
    "【现在开始】",
    `把作品用我的场景重说一遍，然后只布置第 1 个里程碑的第一步。${skill.first}`,
  ].join("\n");
}

const BUILDERS = [syllabus, probe, project];

export function buildPrompt(skill, input) {
  const level = clean(input.level) || EMPTY_LEVEL;
  const scene = clean(input.scene) || EMPTY_SCENE;
  const timeLabel = input.timeLabel || "每天 15 分钟";
  const variant = ((input.variant % BUILDERS.length) + BUILDERS.length) % BUILDERS.length;
  return BUILDERS[variant](skill, level, scene, timeLabel).replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function boot() {
  const els = {
    blurb: document.querySelector("#skill-blurb"),
    form: document.querySelector("#builder"),
    level: document.querySelector("#level"),
    scene: document.querySelector("#scene"),
    prompt: document.querySelector("#prompt"),
    meta: document.querySelector("#out-meta"),
    copy: document.querySelector("#btn-copy"),
    swap: document.querySelector("#btn-swap"),
    toast: document.querySelector("#toast"),
    skills: [...document.querySelectorAll("[data-skill]")],
    times: [...document.querySelectorAll("[data-time]")],
  };

  const state = {
    skillId: null,
    variant: 0,
    timeLabel: "每天 15 分钟",
    ready: false,
  };

  function skill() {
    return SKILLS.find((item) => item.id === state.skillId) || null;
  }

  function toast(text) {
    els.toast.hidden = false;
    els.toast.textContent = text;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      els.toast.hidden = true;
    }, 1600);
  }

  function markRadios(nodes, on) {
    nodes.forEach((node) => {
      const active = on(node);
      node.classList.toggle("is-on", active);
      node.setAttribute("aria-checked", String(active));
    });
  }

  function refresh({ announce, scroll } = {}) {
    const current = skill();
    if (!current) {
      state.ready = false;
      els.prompt.value = "";
      els.meta.textContent = "先点一个技能，完整提示词会出现在这里。";
      els.copy.disabled = true;
      els.swap.disabled = true;
      return;
    }

    const level = clean(els.level.value);
    const scene = clean(els.scene.value);
    const text = buildPrompt(current, {
      level,
      scene,
      timeLabel: state.timeLabel,
      variant: state.variant,
    });
    els.prompt.value = text;
    state.ready = true;
    els.copy.disabled = false;
    els.swap.disabled = false;

    const notes = [VARIANTS[state.variant].label, current.label, `${text.length} 字`];
    if (!level) notes.push("水平留空");
    if (!scene) notes.push("场景留空");
    els.meta.textContent = notes.join(" · ");
    els.blurb.textContent = current.blurb;
    els.level.placeholder = current.levelHint;
    els.scene.placeholder = current.sceneHint;

    if (announce) toast(announce);
    if (scroll) els.prompt.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function copyViaSelection(text) {
    const area = els.prompt;
    const wasReadOnly = area.hasAttribute("readonly");
    if (wasReadOnly) area.removeAttribute("readonly");
    area.focus();
    area.select();
    area.setSelectionRange(0, text.length);
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    if (wasReadOnly) area.setAttribute("readonly", "");
    return ok;
  }

  async function copyText(text) {
    if (copyViaSelection(text)) return true;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  els.skills.forEach((button) => {
    button.addEventListener("click", () => {
      state.skillId = button.dataset.skill;
      state.variant = 0;
      markRadios(els.skills, (node) => node === button);
      const current = skill();
      refresh({
        announce: current ? `已生成${current.label} · 课表版` : "",
        scroll: true,
      });
    });
  });

  els.times.forEach((button) => {
    button.addEventListener("click", () => {
      state.timeLabel = button.dataset.time;
      markRadios(els.times, (node) => node === button);
      if (state.skillId) refresh();
    });
  });

  els.level.addEventListener("input", () => {
    if (state.skillId) refresh();
  });
  els.scene.addEventListener("input", () => {
    if (state.skillId) refresh();
  });

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.skillId) {
      toast("先点一个技能");
      els.skills[0]?.focus();
      return;
    }
    refresh({ announce: "已按当前填写生成", scroll: true });
  });

  els.swap.addEventListener("click", () => {
    if (!state.skillId) return;
    state.variant = (state.variant + 1) % VARIANTS.length;
    const label = VARIANTS[state.variant].label;
    refresh({ announce: `已换成${label}`, scroll: true });
  });

  els.copy.addEventListener("click", async () => {
    if (!state.ready || !els.prompt.value) {
      toast("还没有提示词");
      return;
    }
    const ok = await copyText(els.prompt.value);
    if (ok) {
      els.copy.classList.add("is-copied");
      toast("已复制");
      clearTimeout(els.copy.reset);
      els.copy.reset = setTimeout(() => els.copy.classList.remove("is-copied"), 1600);
    } else {
      els.prompt.removeAttribute("readonly");
      els.prompt.focus();
      els.prompt.select();
      els.prompt.setAttribute("readonly", "");
      toast("复制失败，请在文本框里手动复制");
    }
  });
}

if (typeof document !== "undefined") boot();
