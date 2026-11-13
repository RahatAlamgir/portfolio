/* Hidden mini-game: a tiny Flappy-style game (a nod to the Flappy Bird project).
   Opened from secret-game.js (typing "rahat", or 5 quick taps on the logo / photo). Space / ArrowUp / click / tap to
   flap, Esc to close. Best score is remembered in localStorage when it is available. */

import { el, icon } from "../core/dom.js";

const W = 360;
const H = 540;
const BIRD = { x: 90, size: 26 };
const GRAVITY = 0.42;
const FLAP = -7;
const SPEED = 2.6;
const PIPE = { width: 56, gap: 150, spacing: 200 };
const FLOOR = 28;
const BEST_KEY = "miniGameBest";

const readBest = () => {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
};
const saveBest = (value) => {
  try { localStorage.setItem(BEST_KEY, String(value)); } catch { /* storage blocked: best just isn't kept */ }
};

export function openMiniGame(text) {
  if (document.querySelector(".game-overlay")) return;

  const previousFocus = document.activeElement;
  const canvas = el("canvas", { className: "game-canvas", "aria-label": text.title });
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = W * ratio;
  canvas.height = H * ratio;
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);

  const closeButton = el("button", {
    className: "icon-btn game-close",
    type: "button",
    "aria-label": text.close,
    onclick: close
  }, [icon("close")]);

  const overlay = el("div", {
    className: "game-overlay",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": text.title,
    tabindex: "-1"
  }, [
    el("div", { className: "game-card" }, [
      el("p", { className: "label game-title", text: text.title }),
      closeButton,
      canvas,
      el("p", { className: "muted game-hint", text: text.hint })
    ])
  ]);

  // Colours come from the current theme
  const css = getComputedStyle(document.documentElement);
  const color = (name) => css.getPropertyValue(name).trim();
  const palette = {
    bg: color("--surface"),
    line: color("--line-strong"),
    text: color("--text"),
    muted: color("--muted"),
    accent: color("--accent"),
    accentSoft: color("--accent-soft"),
    dark: "#0A0B0D"
  };
  const mono = '600 13px "JetBrains Mono", ui-monospace, Consolas, monospace';

  let state = "ready"; // ready | playing | over
  let bird, pipes, score, best, frameId, last;
  best = readBest();

  function reset() {
    bird = { y: H / 2 - 40, vy: 0 };
    pipes = [];
    score = 0;
    spawnPipe(W + 60);
    spawnPipe(W + 60 + PIPE.spacing);
  }

  function spawnPipe(x) {
    const margin = 70;
    pipes.push({ x, top: margin + Math.random() * (H - FLOOR - PIPE.gap - margin * 2), passed: false });
  }

  function flap() {
    if (state === "ready") { state = "playing"; }
    else if (state === "over") { reset(); state = "playing"; }
    bird.vy = FLAP;
  }

  function die() {
    state = "over";
    if (score > best) { best = score; saveBest(best); }
  }

  function update(dt) {
    if (state !== "playing") return;

    bird.vy += GRAVITY * dt;
    bird.y += bird.vy * dt;

    for (const p of pipes) {
      p.x -= SPEED * dt;
      if (!p.passed && p.x + PIPE.width < BIRD.x) { p.passed = true; score += 1; }
    }
    if (pipes[0].x + PIPE.width < 0) pipes.shift();
    if (pipes[pipes.length - 1].x < W - PIPE.spacing) spawnPipe(pipes[pipes.length - 1].x + PIPE.spacing);

    // Collisions: floor, ceiling, pipes (slightly forgiving hit box)
    const half = BIRD.size / 2 - 3;
    const cx = BIRD.x + BIRD.size / 2;
    const cy = bird.y + BIRD.size / 2;
    if (cy + half > H - FLOOR || cy - half < 0) return die();
    for (const p of pipes) {
      const overlapsX = cx + half > p.x && cx - half < p.x + PIPE.width;
      if (overlapsX && (cy - half < p.top || cy + half > p.top + PIPE.gap)) return die();
    }
  }

  function draw() {
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, W, H);

    // faint dot grid
    ctx.fillStyle = palette.line;
    for (let gx = 14; gx < W; gx += 28) for (let gy = 14; gy < H - FLOOR; gy += 28) ctx.fillRect(gx, gy, 1.5, 1.5);

    // pipes
    for (const p of pipes) {
      ctx.fillStyle = palette.accentSoft;
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 2;
      ctx.fillRect(p.x, 0, PIPE.width, p.top);
      ctx.strokeRect(p.x, -2, PIPE.width, p.top + 2);
      const bottomY = p.top + PIPE.gap;
      ctx.fillRect(p.x, bottomY, PIPE.width, H - FLOOR - bottomY);
      ctx.strokeRect(p.x, bottomY, PIPE.width, H - FLOOR - bottomY + 2);
    }

    // floor
    ctx.fillStyle = palette.line;
    ctx.fillRect(0, H - FLOOR, W, FLOOR);
    ctx.fillStyle = palette.accent;
    ctx.fillRect(0, H - FLOOR, W, 2);

    // bird: a teal square that tilts with its speed
    const tilt = Math.max(-0.5, Math.min(0.9, bird.vy / 12));
    ctx.save();
    ctx.translate(BIRD.x + BIRD.size / 2, bird.y + BIRD.size / 2);
    ctx.rotate(tilt);
    ctx.fillStyle = palette.accent;
    ctx.fillRect(-BIRD.size / 2, -BIRD.size / 2, BIRD.size, BIRD.size);
    ctx.fillStyle = palette.dark;
    ctx.fillRect(2, -7, 6, 6); // eye
    ctx.restore();

    // text
    ctx.textAlign = "center";
    ctx.fillStyle = palette.text;
    ctx.font = '700 40px "Inter Tight", Inter, system-ui, sans-serif';
    ctx.fillText(String(score), W / 2, 64);

    ctx.font = mono;
    ctx.fillStyle = palette.muted;
    if (state === "ready") {
      ctx.fillText(text.start, W / 2, H / 2 + 60);
    } else if (state === "over") {
      ctx.fillStyle = palette.text;
      ctx.font = '700 26px "Inter Tight", Inter, system-ui, sans-serif';
      ctx.fillText(text.over, W / 2, H / 2 - 10);
      ctx.font = mono;
      ctx.fillStyle = palette.muted;
      ctx.fillText(`${text.best}: ${best}`, W / 2, H / 2 + 18);
      ctx.fillText(text.retry, W / 2, H / 2 + 46);
    }
  }

  function loop(now) {
    // dt is "frames at 60fps" so speed is the same on 60Hz and 144Hz screens
    const dt = Math.min((now - last) / 16.667, 2.5);
    last = now;
    update(dt);
    draw();
    frameId = requestAnimationFrame(loop);
  }

  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      e.preventDefault();
      flap();
    }
  }

  const pageParts = [...document.querySelectorAll("header.site-header, #main, footer.site-footer")];

  function close() {
    cancelAnimationFrame(frameId);
    document.removeEventListener("keydown", onKey, true);
    overlay.remove();
    pageParts.forEach((p) => p.removeAttribute("inert"));
    previousFocus?.focus?.();
  }

  canvas.addEventListener("pointerdown", (e) => { e.preventDefault(); flap(); });
  document.addEventListener("keydown", onKey, true);

  pageParts.forEach((p) => p.setAttribute("inert", ""));
  document.body.append(overlay);
  overlay.focus();

  reset();
  last = performance.now();
  frameId = requestAnimationFrame(loop);
}
