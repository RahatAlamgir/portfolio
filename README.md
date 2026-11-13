# Rahat Alamgir — Portfolio V2

My portfolio

## Structure

```
index.html                 Empty page shell: one mount point per section
404.html                   Standalone "page not found" page (GitHub Pages serves it automatically)
robots.txt, sitemap.xml    Search engine files (update the URL inside if the site address changes)
admin/                      Private editor at /admin/ (needs a GitHub token with write access to the repo; saves commit to GitHub)
  js/                       main (entry), editor (screen), fields (forms), uploads (images), github (API), auth, save, state, util
data/
  site.json                Page title, nav, section headings, stats, button/label text
  profile.json             Name, hero text, photo, email, phone, CV, social links
  projects.json            Filters, page size, every project
  services.json            "What I do" cards
  skills.json              Languages + skill groups
  education.json           Education list
  learning.json            "Currently learning" strip (topic, detail, progress 0-100)
assets/
  icons.svg                Icon sprite (referenced by name, e.g. "github")
  favicon.svg, profile.jpg, CV, projects/, education/
css/
  main.css                 Imports everything below in order
  base/                    tokens (colours, themes, fonts), reset, layout helpers,
                           motion (animations) and cursor (custom cursor)
  components/              buttons, tags, header, cards, dialog, toast, footer, back-to-top
  sections/                hero, stats, learning, projects, videos, services, skills, education, contact
  responsive.css           Breakpoints + reduced motion
js/
  main.js                  Loads the JSON, then renders each part
  theme-init.js            Applies the saved theme before first paint
  core/                    dom helpers, JSON loader, load-error fallback, motion entry point
  motion/                  one file per effect: reveal, glitch, typed text, cursor glow,
                           custom cursor, card tilt, count-up, nav underline, dialog close, secret mini-game...
  components/              header, theme toggle, mobile menu, active nav, dialog, media, pagination, toast, footer, back-to-top
  sections/                one renderer per section
```

