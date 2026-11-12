/* Stats numbers count up from 0 the first time they scroll into view. */

import { $$ } from "../core/dom.js";

const DURATION = 1100; // ms

function countTo(dd) {
  const end = Number(dd.dataset.value);
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / DURATION, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    dd.textContent = String(Math.round(end * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function setupCountUp() {
  const numbers = $$(".stats dd").filter((dd) => /^\d+$/.test(dd.textContent.trim()));
  if (!numbers.length) return;

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.unobserve(entry.target);
      countTo(entry.target);
    }
  }, { threshold: 0.6 });

  for (const dd of numbers) {
    dd.dataset.value = dd.textContent.trim();
    dd.textContent = "0";
    io.observe(dd);
  }
}
