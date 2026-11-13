/* Hidden way into the private editor (admin/): type "admin" anywhere on the page, or tap the
   copyright line in the footer 5 times quickly (for touch screens). There is no visible link. */

const WORD = "admin";
const TAPS_NEEDED = 5;
const TAP_WINDOW = 900; // ms allowed between taps

const goToAdmin = () => { location.href = new URL("admin/", document.baseURI).href; };

export function setupAdminLink() {
  let progress = 0;
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    if (document.querySelector("dialog[open], .game-overlay")) return;

    const key = e.key.length === 1 ? e.key.toLowerCase() : "";
    progress = key === WORD[progress] ? progress + 1 : (key === WORD[0] ? 1 : 0);
    if (progress === WORD.length) { progress = 0; goToAdmin(); }
  });

  const target = document.querySelector("#site-footer > span");
  if (!target) return;
  let taps = 0;
  let timer;
  target.addEventListener("click", () => {
    taps += 1;
    clearTimeout(timer);
    timer = setTimeout(() => { taps = 0; }, TAP_WINDOW);
    if (taps >= TAPS_NEEDED) { taps = 0; goToAdmin(); }
  });
}
