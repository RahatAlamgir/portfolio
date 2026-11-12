/* Thin accent bar at the top of the page showing how far you have scrolled. */

export function setupProgressBar() {
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.prepend(bar);

  // The scrollable distance is measured only when the page size changes, not on
  // every scroll frame (reading scrollHeight forces a layout).
  let max = 0;
  let queued = false;

  const paint = () => {
    queued = false;
    bar.style.setProperty("--progress", max > 0 ? String(Math.min(scrollY / max, 1)) : "0");
  };
  const schedule = () => {
    if (!queued) { queued = true; requestAnimationFrame(paint); }
  };
  const measure = () => {
    max = document.documentElement.scrollHeight - innerHeight;
    schedule();
  };

  addEventListener("scroll", schedule, { passive: true });
  new ResizeObserver(measure).observe(document.body); // also covers late content (GitHub graph)
  addEventListener("resize", measure);
  measure();
}
