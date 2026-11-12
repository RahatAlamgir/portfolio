/* Scroll reveal: sections fade up as they enter the screen; grids and chips stagger. */

import { $$ } from "../core/dom.js";

const GRID_PARENTS = ".project-grid, .stats, .services, .skill-cards, .video-grid, .edu-list";

function addSkillTargets(layout, targets) {
  // Intro block, then each skill card in turn; their chips pop in after
  const parts = [layout.querySelector(".skills-intro"), ...layout.querySelectorAll(".skill-card")];
  parts.forEach((item, i) => {
    item.style.setProperty("--i", String(i));
    targets.push(item);
  });

  $$(".lang-list li, .skill-card li", layout).forEach((chip) => {
    const index = [...chip.closest("ul").children].indexOf(chip);
    const base = chip.closest(".skill-card") ? 3 : 2; // let the card land first
    chip.style.setProperty("--i", String(base + index * 0.6));
    chip.classList.add("pop");
    targets.push(chip);
  });
}

function collectTargets() {
  const targets = [];
  for (const section of $$("main > section:not(#top)")) {
    for (const child of section.children) {
      if (child.matches(".skills-layout")) {
        addSkillTargets(child, targets);
      } else if (child.matches(GRID_PARENTS)) {
        // Stagger the items of a grid instead of fading the whole grid at once
        [...child.children].forEach((item, i) => {
          item.style.setProperty("--i", String(i % 6));
          targets.push(item);
        });
      } else {
        targets.push(child);
      }
    }
  }
  return targets;
}

export function setupReveal() {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  for (const target of collectTargets()) {
    target.classList.add("reveal");
    io.observe(target);
  }
}
