/* Project cards tilt slightly toward the cursor. */

const MAX_TILT = 5; // degrees

export function setupCardTilt() {
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const card = e.target.closest?.(".card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.setProperty("--ry", `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
    card.style.setProperty("--rx", `${((0.5 - y) * 2 * MAX_TILT).toFixed(2)}deg`);
  });
  document.addEventListener("pointerout", (e) => {
    const card = e.target.closest?.(".card");
    if (!card || card.contains(e.relatedTarget)) return;
    card.style.removeProperty("--rx");
    card.style.removeProperty("--ry");
  });
}
