/* One full-window teal glow that follows the cursor (no section seams). */

export function setupCursorGlow() {
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.prepend(glow);

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    glow.style.setProperty("--gx", `${e.clientX}px`);
    glow.style.setProperty("--gy", `${e.clientY}px`);
    glow.classList.add("is-on");
  });
  document.documentElement.addEventListener("pointerleave", () => glow.classList.remove("is-on"));
}
