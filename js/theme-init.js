/* Runs in <head> before the page paints, so a saved light theme
   doesn't flash dark first. Dark is the default. */
(function () {
  try {
    var saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      document.documentElement.setAttribute("data-theme", saved);
    }
  } catch (e) {}
})();
