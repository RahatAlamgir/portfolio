/* Highlights the nav link of the section currently in view. */

export function initActiveNav(links) {
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const id = `#${entry.target.id}`;
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
    }
  }, { rootMargin: "-45% 0px -50% 0px" });

  for (const link of links) {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) observer.observe(section);
  }
}
