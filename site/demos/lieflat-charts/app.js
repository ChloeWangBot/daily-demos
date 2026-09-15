const mornings = [
  { id: "d01", label: "Sep 2", saved: 16, picked: 0, note: "The morning after the Lieflat Charts post. Overnight bookmarks stack up." },
  { id: "d02", label: "Sep 3", saved: 11, picked: 0, note: "Still reading. No demo is dispatched." },
  { id: "d03", label: "Sep 4", saved: 8, picked: 1, note: "One visualization bookmark earns a closer look." },
  { id: "d04", label: "Sep 5", saved: 6, picked: 0, note: "Counts settle after the first spike." },
  { id: "d05", label: "Sep 6", saved: 5, picked: 0, note: "Weekend thinning. Hairlines stay honest." },
  { id: "d06", label: "Sep 7", saved: 3, picked: 0, note: "Sunday trickle of maps and type." },
  { id: "d07", label: "Sep 8", saved: 4, picked: 1, note: "An agents repo is picked for the host itself." },
  { id: "d08", label: "Sep 9", saved: 9, picked: 0, note: "Infrastructure bookmarks, rarely pictorial." },
  { id: "d09", label: "Sep 10", saved: 7, picked: 0, note: "Midweek plateau." },
  { id: "d10", label: "Sep 11", saved: 6, picked: 0, note: "Typography bookmarks: type as data." },
  { id: "d11", label: "Sep 12", saved: 8, picked: 1, note: "A type-as-data bookmark earns a demo slot." },
  { id: "d12", label: "Sep 13", saved: 5, picked: 0, note: "Another thin day. Units still countable." },
  { id: "d13", label: "Sep 14", saved: 4, picked: 0, note: "The ledger waits for a morning picture." },
  { id: "d14", label: "Sep 15", saved: 10, picked: 1, note: "Lieflat Charts becomes today's constructed gallery." },
];

const families = [
  { id: "viz", name: "Visualization", bookmarks: 16, demos: 2, note: "Where Lieflat Charts sits. Hairlines, not dashboards." },
  { id: "agent", name: "Agents", bookmarks: 11, demos: 1, note: "The dispatch step: one agent, one morning folder." },
  { id: "type", name: "Typography", bookmarks: 8, demos: 1, note: "Editorial type treated as a data surface." },
  { id: "infra", name: "Infra", bookmarks: 7, demos: 0, note: "Useful machinery. Rarely the picture." },
  { id: "maps", name: "Maps", bookmarks: 4, demos: 0, note: "Pretty, but not today's pick." },
  { id: "other", name: "Other", bookmarks: 2, demos: 0, note: "Noise left on the ledger." },
];

const els = {
  mornings: document.querySelector("[data-chart=\"mornings\"]"),
  units: document.querySelector("[data-chart=\"units\"]"),
  rank: document.querySelector("[data-chart=\"rank\"]"),
  title: document.querySelector("[data-note-title]"),
  stat: document.querySelector("[data-note-stat]"),
  body: document.querySelector("[data-note-body]"),
  saved: document.querySelector("[data-total-saved]"),
  demos: document.querySelector("[data-total-demos]"),
  speedLabel: document.querySelector("[data-speed-label]"),
  caption: document.querySelector("[data-caption-mornings]"),
  speedButtons: [...document.querySelectorAll("[data-speed]")],
};

const totalSaved = mornings.reduce((sum, day) => sum + day.saved, 0);
const totalDemos = mornings.reduce((sum, day) => sum + day.picked, 0);

let speed = "slow";
let selected = { kind: "morning", id: "d01" };

function svgEl(name, attrs = {}, children = []) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    node.setAttribute(key, String(value));
  }
  for (const child of children) node.append(child);
  return node;
}

function record(kind, id) {
  return kind === "morning"
    ? mornings.find((day) => day.id === id)
    : families.find((row) => row.id === id);
}

function announce() {
  const item = record(selected.kind, selected.id);
  if (!item) return;
  if (selected.kind === "morning") {
    els.title.textContent = item.label;
    els.stat.textContent = `${item.saved} bookmarks · ${item.picked} demo${item.picked === 1 ? "" : "s"}`;
  } else {
    els.title.textContent = item.name;
    els.stat.textContent = `${item.bookmarks} bookmarks · ${item.demos} demo${item.demos === 1 ? "" : "s"}`;
  }
  els.body.textContent = item.note;
}

function bindMarks(root) {
  root.querySelectorAll("[data-kind]").forEach((node) => {
    const activate = () => select(node.dataset.kind, node.dataset.id);
    node.addEventListener("pointerenter", activate);
    node.addEventListener("focus", activate);
    node.addEventListener("click", activate);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
      if (node.dataset.kind === "morning" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        const index = mornings.findIndex((day) => day.id === node.dataset.id);
        const next = event.key === "ArrowRight" ? index + 1 : index - 1;
        const day = mornings[Math.max(0, Math.min(mornings.length - 1, next))];
        select("morning", day.id);
        root.querySelector(`[data-id="${day.id}"]`)?.focus();
      }
    });
  });
}

function drawMornings() {
  const width = 640;
  const height = 260;
  const margin = { top: 22, right: 18, bottom: 36, left: 36 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const yMax = 18;
  const x = (index) => margin.left + (index / (mornings.length - 1)) * innerW;
  const y = (value) => margin.top + innerH - (value / yMax) * innerH;
  const slow = speed === "slow";

  const svg = svgEl("svg", {
    viewBox: `0 0 ${width} ${height}`,
    role: "group",
    "aria-label": "Bookmarks saved across fourteen mornings",
  });

  for (let tick = 0; tick <= yMax; tick += 3) {
    svg.append(
      svgEl("line", {
        x1: margin.left,
        x2: width - margin.right,
        y1: y(tick),
        y2: y(tick),
        stroke: "rgba(20,20,20,0.12)",
        "stroke-width": tick === 0 ? 1 : 0.5,
      }),
      svgEl("text", {
        class: "chart-label",
        x: margin.left - 8,
        y: y(tick) + 3,
        "text-anchor": "end",
      }, [String(tick)]),
    );
  }

  svg.append(
    svgEl("line", {
      class: "guide",
      x1: x(0),
      x2: x(0),
      y1: margin.top,
      y2: height - margin.bottom,
      stroke: "rgba(20,20,20,0.35)",
      "stroke-width": 0.75,
      "stroke-dasharray": "2 3",
    }),
  );

  svg.append(
    svgEl("polyline", {
      fill: "none",
      stroke: "#141414",
      "stroke-width": slow ? 1.15 : 3.2,
      "stroke-linejoin": "round",
      "stroke-linecap": "round",
      points: mornings.map((day, index) => `${x(index)},${y(day.saved)}`).join(" "),
    }),
  );

  mornings.forEach((day, index) => {
    const group = svgEl("g", {
      class: "mark",
      tabindex: "0",
      role: "button",
      "aria-label": `${day.label}: ${day.saved} bookmarks, ${day.picked} demos`,
      "data-kind": "morning",
      "data-id": day.id,
      "data-x": x(index),
    });
    group.append(
      svgEl("circle", {
        class: "hit",
        cx: x(index),
        cy: y(day.saved),
        r: 14,
        fill: "transparent",
      }),
      svgEl("circle", {
        class: "dot",
        cx: x(index),
        cy: y(day.saved),
        r: slow ? 3.2 : 2.2,
        fill: day.picked ? "#141414" : "#f1eee6",
        stroke: "#141414",
        "stroke-width": 1.15,
      }),
    );
    if (slow && (index === 0 || index === mornings.length - 1)) {
      group.append(
        svgEl("text", {
          class: "chart-label",
          x: x(index),
          y: height - 12,
          "text-anchor": index === 0 ? "start" : "end",
        }, [day.label.replace("Sep ", "")]),
      );
    }
    svg.append(group);
  });

  if (!slow) {
    svg.append(
      svgEl("text", {
        class: "chart-title",
        x: margin.left,
        y: 14,
      }, [`${totalSaved} bookmarks across 14 mornings`]),
    );
  }

  els.mornings.replaceChildren(svg);
  bindMarks(svg);
}

function drawUnits() {
  const cols = 16;
  const size = 16;
  const gap = 6;
  const rowGap = 28;
  const labelW = 108;
  const width = labelW + cols * (size + gap);
  const height = 18 + families.length * rowGap;
  const slow = speed === "slow";
  const svg = svgEl("svg", {
    viewBox: `0 0 ${width} ${height}`,
    "aria-label": "Forty-eight bookmarks as countable ticks",
  });

  families.forEach((family, row) => {
    const y = 10 + row * rowGap;
    svg.append(
      svgEl("text", {
        class: "chart-label",
        x: 0,
        y: y + 11,
      }, [family.name]),
    );

    if (slow) {
      const row = svgEl("g", {
        class: "row",
        tabindex: "0",
        role: "button",
        "aria-label": `${family.name}: ${family.bookmarks} bookmarks, ${family.demos} demos`,
        "data-kind": "family",
        "data-id": family.id,
      });
      row.append(
        svgEl("rect", {
          class: "hit",
          x: 0,
          y: y - 4,
          width,
          height: size + 8,
          fill: "transparent",
        }),
      );
      for (let i = 0; i < family.bookmarks; i += 1) {
        const filled = i < family.demos;
        row.append(
          svgEl("rect", {
            class: "tick",
            x: labelW + i * (size + gap),
            y,
            width: size,
            height: size,
            fill: filled ? "#141414" : "transparent",
            stroke: "#141414",
            "stroke-width": 1,
          }),
        );
      }
      svg.append(row);
    } else {
      const max = Math.max(...families.map((item) => item.bookmarks));
      const track = cols * (size + gap) - gap;
      const bar = svgEl("g", {
        class: "row",
        tabindex: "0",
        role: "button",
        "aria-label": `${family.name}: ${family.bookmarks} bookmarks, ${family.demos} demos`,
        "data-kind": "family",
        "data-id": family.id,
      });
      bar.append(
        svgEl("rect", {
          class: "hit",
          x: 0,
          y: y - 4,
          width,
          height: 18,
          fill: "transparent",
        }),
        svgEl("rect", {
          x: labelW,
          y: y + 3,
          width: track,
          height: 10,
          fill: "rgba(20,20,20,0.08)",
        }),
        svgEl("rect", {
          class: "fill",
          x: labelW,
          y: y + 3,
          width: (family.bookmarks / max) * track,
          height: 10,
          fill: "#141414",
        }),
      );
      svg.append(bar);
    }
  });

  els.units.replaceChildren(svg);
  bindMarks(svg);
}

function drawRank() {
  const width = 640;
  const rowH = 36;
  const height = 16 + families.length * rowH;
  const labelW = 120;
  const track = 420;
  const max = Math.max(...families.map((item) => item.bookmarks));
  const slow = speed === "slow";
  const ranked = [...families].sort((a, b) => b.bookmarks - a.bookmarks);
  const svg = svgEl("svg", {
    viewBox: `0 0 ${width} ${height}`,
    "aria-label": "Bookmark families ranked by count",
  });

  ranked.forEach((family, index) => {
    const y = 8 + index * rowH;
    const group = svgEl("g", {
      class: "row",
      tabindex: "0",
      role: "button",
      "aria-label": `${family.name}: ${family.bookmarks} bookmarks, ${family.demos} demos`,
      "data-kind": "family",
      "data-id": family.id,
    });
    group.append(
      svgEl("rect", {
        class: "hit",
        x: 0,
        y: y - 6,
        width,
        height: rowH,
        fill: "transparent",
      }),
      svgEl("text", {
        class: "chart-label",
        x: 0,
        y: y + 14,
      }, [family.name]),
      svgEl("rect", {
        x: labelW,
        y: y + (slow ? 8 : 4),
        width: track,
        height: slow ? 2 : 14,
        fill: "rgba(20,20,20,0.08)",
      }),
      svgEl("rect", {
        class: "fill",
        x: labelW,
        y: y + (slow ? 8 : 4),
        width: (family.bookmarks / max) * track,
        height: slow ? 2 : 14,
        fill: "#6a6a6a",
      }),
    );

    if (family.demos && slow) {
      group.append(
        svgEl("rect", {
          x: labelW,
          y: y + 5,
          width: Math.max(4, (family.demos / max) * track),
          height: 8,
          fill: "#141414",
        }),
      );
    }

    group.append(
      svgEl("text", {
        class: "chart-label",
        x: labelW + track + 10,
        y: y + 14,
      }, [slow ? `${family.bookmarks} / ${family.demos}` : String(family.bookmarks)]),
    );
    svg.append(group);
  });

  els.rank.replaceChildren(svg);
  bindMarks(svg);
}

function paintSelection() {
  const guide = els.mornings.querySelector(".guide");
  const morning = els.mornings.querySelector(`[data-id="${selected.id}"]`);
  if (guide && selected.kind === "morning" && morning) {
    const x = morning.getAttribute("data-x");
    guide.setAttribute("x1", x);
    guide.setAttribute("x2", x);
    guide.setAttribute("opacity", "1");
  } else if (guide) {
    guide.setAttribute("opacity", "0");
  }

  els.mornings.querySelectorAll(".mark circle.dot").forEach((circle) => {
    const on = circle.parentNode.dataset.id === selected.id && selected.kind === "morning";
    circle.setAttribute("r", on ? "5.5" : speed === "slow" ? "3.2" : "2.2");
  });

  document.querySelectorAll("[data-chart] [data-kind]").forEach((node) => {
    const on = node.dataset.kind === selected.kind && node.dataset.id === selected.id;
    node.setAttribute("data-on", on ? "true" : "false");
    const fill = node.querySelector?.(".fill") || (node.classList.contains("fill") ? node : null);
    if (fill && fill.tagName === "rect" && node.classList.contains("row")) {
      fill.setAttribute("fill", on || speed === "fast" ? "#141414" : "#6a6a6a");
    }
  });

  els.rank.querySelectorAll(".row .fill").forEach((fill) => {
    const on = fill.parentNode.dataset.id === selected.id && selected.kind === "family";
    fill.setAttribute("fill", on || speed === "fast" ? "#141414" : "#6a6a6a");
  });

  els.units.querySelectorAll(".row").forEach((node) => {
    const on = selected.kind === "family" && node.dataset.id === selected.id;
    node.querySelectorAll(".tick").forEach((tick) => {
      tick.setAttribute("stroke-width", on ? "1.7" : "1");
    });
  });
}

function select(kind, id) {
  if (selected.kind === kind && selected.id === id) {
    announce();
    paintSelection();
    return;
  }
  selected = { kind, id };
  announce();
  paintSelection();
}

function render() {
  document.body.classList.toggle("is-fast", speed === "fast");
  els.speedLabel.textContent = speed === "slow" ? "Slow" : "Fast";
  els.caption.textContent =
    speed === "slow"
      ? "One hairline is one day. Each dot is a morning count. A filled dot minted a demo."
      : `The same ledger, pre-aggregated: ${totalSaved} bookmarks, ${totalDemos} demos, fourteen mornings.`;
  els.saved.textContent = String(totalSaved);
  els.demos.textContent = String(totalDemos);
  els.speedButtons.forEach((button) => {
    button.classList.toggle("is-on", button.dataset.speed === speed);
  });
  drawMornings();
  drawUnits();
  drawRank();
  announce();
  paintSelection();
}

els.speedButtons.forEach((button) => {
  button.addEventListener("click", () => {
    speed = button.dataset.speed;
    render();
  });
});

render();
