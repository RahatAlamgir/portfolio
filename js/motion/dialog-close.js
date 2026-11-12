/* The project dialog fades and scales out instead of vanishing. */

import { $ } from "../core/dom.js";

export function setupDialogClose() {
  const dialog = $("#project-dialog");
  if (!dialog) return;
  const nativeClose = dialog.close.bind(dialog);

  dialog.close = (...args) => {
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    dialog.classList.add("is-closing");
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      dialog.classList.remove("is-closing");
      nativeClose(...args);
    };
    dialog.addEventListener("animationend", (e) => { if (e.target === dialog) finish(); }, { once: true });
    setTimeout(finish, 350); // safety net if no animation event arrives
  };

  // Escape key: run the animated close instead of the instant native one
  dialog.addEventListener("cancel", (e) => { e.preventDefault(); dialog.close(); });
}
