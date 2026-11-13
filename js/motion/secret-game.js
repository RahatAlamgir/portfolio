/* Easter egg for a game developer: open the hidden mini-game by typing "rahat" anywhere
   on the page, or by tapping the logo or the profile photo 5 times quickly (works on
   touch screens too). */

import { $ } from "../core/dom.js";
import { openMiniGame } from "./mini-game.js";

const SECRET = ["r", "a", "h", "a", "t"];
const TAP_TARGETS = [".brand-mark", ".hero-photo img"];
const TAPS_NEEDED = 5;
const TAP_WINDOW = 900; // ms allowed between taps

function onRapidTaps(element, callback) {
  let taps = 0;
  let timer;
  element.addEventListener("click", () => {
    taps += 1;
    clearTimeout(timer);
    timer = setTimeout(() => { taps = 0; }, TAP_WINDOW);
    if (taps >= TAPS_NEEDED) {
      taps = 0;
      callback();
    }
  });
}

export function setupSecretGame(gameText) {
  const open = () => openMiniGame(gameText);

  let progress = 0;
  document.addEventListener("keydown", (e) => {
    // Ignore shortcuts, typing in fields, and anything while a dialog is open
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    if (document.querySelector("dialog[open], .game-overlay")) return;

    const key = e.key.length === 1 ? e.key.toLowerCase() : "";
    progress = key === SECRET[progress] ? progress + 1 : (key === SECRET[0] ? 1 : 0);
    if (progress === SECRET.length) {
      progress = 0;
      open();
    }
  });

  for (const selector of TAP_TARGETS) {
    const target = $(selector);
    if (target) onRapidTaps(target, open);
  }
}
