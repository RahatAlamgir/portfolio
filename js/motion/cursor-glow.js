/* One teal glow that follows the cursor behind the whole page (no section seams).
   Moved with `transform` only, so it never forces the page to repaint. */

export function setupCursorGlow() {
  if (!matchMedia("(pointer: fine)").matches) return;

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.prepend(glow);

  let x = 0;
  let y = 0;
  let queued = false;
  const paint = () => {
    queued = false;
    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    x = e.clientX;
    y = e.clientY;
    glow.classList.add("is-on");
    if (!queued) { queued = true; requestAnimationFrame(paint); }
  });
  document.documentElement.addEventListener("pointerleave", () => glow.classList.remove("is-on"));
}
