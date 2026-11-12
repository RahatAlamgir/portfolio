/* Hero line that types and erases a rotating list of phrases.
   Pauses while the hero is off-screen so it does no work when nobody can see it. */

import { $ } from "../core/dom.js";

const TYPE_MS = 45;
const ERASE_MS = 22;
const HOLD_MS = 1800;
const GAP_MS = 350;

export function setupTyped() {
  const line = $(".hero-typed");
  const target = line && $(".typed-text", line);
  if (!target) return;

  let words;
  try { words = JSON.parse(line.dataset.words); } catch { return; }
  if (!Array.isArray(words) || words.length < 2) return;

  let inView = true;
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }).observe(line);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const step = async (ms) => {
    while (!inView || document.hidden) await wait(250);
    await wait(ms);
  };

  let wordIndex = 0;
  let charIndex = words[0].length; // the first phrase is already on screen

  async function loop() {
    await wait(HOLD_MS + 800); // let the hero entrance finish first
    for (;;) {
      while (charIndex > 0) {
        charIndex -= 1;
        target.textContent = words[wordIndex].slice(0, charIndex);
        await step(ERASE_MS);
      }
      await step(GAP_MS);
      wordIndex = (wordIndex + 1) % words.length;
      while (charIndex < words[wordIndex].length) {
        charIndex += 1;
        target.textContent = words[wordIndex].slice(0, charIndex);
        await step(TYPE_MS);
      }
      await step(HOLD_MS);
    }
  }

  loop();
}
