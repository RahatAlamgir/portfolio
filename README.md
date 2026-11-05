# Rahat Alamgir — Portfolio V2

My portfolio

## Structure

```
index.html                 Empty page shell: one mount point per section
data/
  site.json                Page title, nav, section headings, stats, button/label text
  profile.json             Name, hero text, photo, email, phone, CV, social links
  projects.json            Filters, page size, every project
  services.json            "What I do" cards
  skills.json              Languages + skill groups
  education.json           Education list
assets/
  icons.svg                Icon sprite (referenced by name, e.g. "github")
  favicon.svg, profile.jpg, CV, projects/, education/
css/
  main.css                 Imports everything below in order
  base/                    tokens (colours, themes, fonts), reset, layout helpers
  components/              buttons, tags, header, cards, dialog, toast, footer
  sections/                hero, stats, projects, videos, services, skills, education, contact
  responsive.css           Breakpoints + reduced motion
js/
  main.js                  Loads the JSON, then renders each part
  theme-init.js            Applies the saved theme before first paint
  core/                    dom helpers, JSON loader, load-error fallback
  components/              header, theme toggle, mobile menu, active nav, dialog, media, toast, footer
  sections/                one renderer per section
```

