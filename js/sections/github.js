/* GitHub activity: a contribution graph drawn from live data.

   The section starts hidden (see index.html) and is only shown once
   valid data arrives. If the service is down, slow, or returns
   anything unexpected, it simply stays hidden. */

import { el, icon, externalLink, fmt } from "../core/dom.js";

const DAYS_IN_WEEK = 7;

/* ---------- Fetching + validation ---------- */

async function fetchContributions({ username, contributionsApi, timeoutMs = 8000 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(fmt(contributionsApi, { username: encodeURIComponent(username) }), {
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Contributions API → ${response.status}`);
    return validate(await response.json());
  } finally {
    clearTimeout(timer);
  }
}

function validate(data) {
  const days = data && Array.isArray(data.contributions) ? data.contributions : null;
  const isDay = (d) =>
    d && /^\d{4}-\d{2}-\d{2}$/.test(d.date) && Number.isFinite(d.count) && Number.isInteger(d.level);
  if (!days || days.length < 30 || !days.every(isDay)) throw new Error("Contributions API → unexpected data");

  const total = data.total && Number.isFinite(data.total.lastYear)
    ? data.total.lastYear
    : days.reduce((sum, d) => sum + d.count, 0);

  return { total, days };
}

/* ---------- Building the grid ---------- */

// "2025-11-02" → local Date (avoids the UTC shift of new Date("2025-11-02"))
function toDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function buildGraph(days, copy) {
  const lang = document.documentElement.lang || undefined;
  const monthName = new Intl.DateTimeFormat(lang, { month: "short" });
  const weekdayName = new Intl.DateTimeFormat(lang, { weekday: "short" });
  const fullDate = new Intl.DateTimeFormat(lang, { month: "short", day: "numeric", year: "numeric" });

  const offset = toDate(days[0].date).getDay(); // Sunday = 0 → first row
  const weeks = Math.ceil((days.length + offset) / DAYS_IN_WEEK);

  const graph = el("div", { className: "gh-graph", style: `--weeks: ${weeks}` });

  // Weekday labels (Mon, Wed, Fri) in the first column
  [1, 3, 5].forEach((dow) => {
    const sample = new Date(2024, 0, 7 + dow); // Jan 7 2024 was a Sunday
    graph.append(el("span", {
      className: "gh-day-label",
      style: `grid-row: ${dow + 2}`,
      text: weekdayName.format(sample)
    }));
  });

  let lastMonth = -1;
  let lastLabelWeek = -10;

  days.forEach((day, i) => {
    const index = i + offset;
    const week = Math.floor(index / DAYS_IN_WEEK);
    const dow = index % DAYS_IN_WEEK;
    const date = toDate(day.date);

    // Month label above the first week that starts a new month
    if (date.getMonth() !== lastMonth && (dow === 0 || i === 0)) {
      if (week - lastLabelWeek >= 3) {
        graph.append(el("span", {
          className: "gh-month-label",
          style: `grid-column: ${week + 2}`,
          text: monthName.format(date)
        }));
        lastLabelWeek = week;
      }
      lastMonth = date.getMonth();
    }

    const tooltipTemplate = day.count === 0 ? copy.tooltipNone : day.count === 1 ? copy.tooltipOne : copy.tooltip;
    graph.append(el("span", {
      className: "gh-cell",
      "data-level": Math.max(0, Math.min(4, day.level)),
      "data-tip": fmt(tooltipTemplate, { count: day.count, date: fullDate.format(date) }),
      style: `grid-column: ${week + 2}; grid-row: ${dow + 2}`
    }));
  });

  return graph;
}

function legend(copy) {
  return el("div", { className: "gh-legend", "aria-hidden": "true" }, [
    el("span", { text: copy.less }),
    ...[0, 1, 2, 3, 4].map((level) => el("span", { className: "gh-cell", "data-level": level })),
    el("span", { text: copy.more })
  ]);
}

/* One floating tooltip for the whole graph (cheaper than 365 tooltips) */
function attachTooltip(scroller, graph) {
  const tip = el("div", { className: "gh-tooltip", role: "presentation" });
  scroller.parentElement.append(tip);

  const show = (cell) => {
    tip.textContent = cell.dataset.tip;
    const host = scroller.parentElement.getBoundingClientRect();
    const r = cell.getBoundingClientRect();
    tip.style.left = `${r.left - host.left + r.width / 2}px`;
    tip.style.top = `${r.top - host.top}px`;
    tip.classList.add("show");
  };
  const hide = () => tip.classList.remove("show");

  graph.addEventListener("mouseover", (e) => {
    const cell = e.target.closest(".gh-cell");
    if (cell) show(cell);
  });
  graph.addEventListener("mouseleave", hide);
  scroller.addEventListener("scroll", hide, { passive: true });
}

/* ---------- Public ---------- */

export async function renderGithub(mount, { site, profile }) {
  const config = profile.github;
  if (!config || !config.username || !config.contributionsApi) return;

  const copy = site.sections.github;
  let data;
  try {
    data = await fetchContributions(config);
  } catch (error) {
    console.warn("GitHub activity hidden:", error.message);
    return; // section stays hidden
  }

  const graph = buildGraph(data.days, copy);
  const scroller = el("div", {
    className: "gh-scroll",
    role: "img",
    "aria-label": fmt(copy.graphLabel, { count: data.total })
  }, [graph]);

  const card = el("div", { className: "gh-card" }, [
    el("div", { className: "gh-head" }, [
      el("div", {}, [
        el("p", { className: "label gh-label" }, [icon("github"), copy.label]),
        el("p", { className: "gh-total" }, (() => {
          const [before, after = ""] = copy.total.split("{count}");
          return [before, el("strong", { text: String(data.total) }), after];
        })())
      ]),
      externalLink(config.profileUrl, "btn btn-outline gh-profile-btn", [icon("github"), copy.profileButton])
    ]),
    el("div", { className: "gh-graph-wrap" }, [scroller]),
    legend(copy)
  ]);

  mount.replaceChildren(card);
  mount.hidden = false;

  attachTooltip(scroller, graph);
  // On narrow screens, keep the newest weeks in view until the visitor scrolls the graph
  let userScrolled = false;
  const scrollToNewest = () => { if (!userScrolled) scroller.scrollLeft = scroller.scrollWidth; };
  ["pointerdown", "wheel", "touchstart", "keydown"].forEach((type) =>
    scroller.addEventListener(type, () => { userScrolled = true; }, { passive: true, once: true })
  );
  scrollToNewest();
  if ("ResizeObserver" in window) new ResizeObserver(scrollToNewest).observe(scroller);
}
