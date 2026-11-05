/* Fallback shown when the JSON files can't be fetched
   (usually because index.html was opened straight from disk). */

import { el } from "./dom.js";

export function renderLoadError(error) {
  console.error(error);
  const main = document.getElementById("main");
  main.replaceChildren(
    el("div", { className: "container load-error" }, [
      el("h1", { text: "Content couldn't load" }),
      el("p", {}, [
        "This site reads its content from JSON files, so it must be served over HTTP. Run ",
        el("code", { text: "python -m http.server" }),
        " in the project folder and open the address it prints."
      ])
    ])
  );
}
