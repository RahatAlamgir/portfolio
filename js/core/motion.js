/* Motion layer entry point. Each effect lives in its own file in js/motion/.
   Pure progressive enhancement: with reduced motion (or no JS) nothing here runs
   and the page stays fully visible and static. */

import { setupReveal } from "../motion/reveal.js";
import { setupProgressBar } from "../motion/scroll-progress.js";
import { setupGlitch } from "../motion/glitch.js";
import { setupCursorGlow } from "../motion/cursor-glow.js";
import { setupCardTilt } from "../motion/card-tilt.js";
import { setupCountUp } from "../motion/count-up.js";
import { setupNavIndicator } from "../motion/nav-indicator.js";
import { setupCustomCursor } from "../motion/custom-cursor.js";
import { setupTyped } from "../motion/typed.js";
import { setupDialogClose } from "../motion/dialog-close.js";
import { setupThemeFade } from "../motion/theme-fade.js";

export function initMotion() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.documentElement.classList.add("motion");

  setupReveal();
  setupProgressBar();
  setupGlitch();
  setupCursorGlow();
  setupCardTilt();
  setupCountUp();
  setupNavIndicator();
  setupCustomCursor();
  setupTyped();
  setupDialogClose();
  setupThemeFade();
}
