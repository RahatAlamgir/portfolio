// Loads all site content from /data and fills the HTML elements that reference it.
const DATA_FILES = {
  profile: 'data/profile.json',
  site: 'data/site.json',
  skills: 'data/skills.json',
  services: 'data/services.json',
  education: 'data/education.json',
  projects: 'data/projects.json',
};

// Attribute on an element -> what to set from the content value.
export const BINDING_ATTRIBUTES = ['data-text', 'data-src', 'data-alt', 'data-href', 'data-aria-label', 'data-title'];

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url} (HTTP ${response.status})`);
  }
  return response.json();
}

export async function loadContent() {
  const entries = await Promise.all(
    Object.entries(DATA_FILES).map(async ([key, url]) => [key, await fetchJSON(url)]),
  );
  return Object.fromEntries(entries);
}

// Reads a value by dotted path, for example getPath(content, 'profile.name').
export function getPath(source, path) {
  return path.split('.').reduce((value, key) => value?.[key], source);
}

// Fills every element that has a data-text / data-src / data-alt / data-href /
// data-aria-label attribute with the value at that path.
export function applyBindings(root, content) {
  const setters = {
    'data-text': (el, value) => {
      el.textContent = value;
    },
    'data-src': (el, value) => el.setAttribute('src', value),
    'data-alt': (el, value) => el.setAttribute('alt', value),
    'data-href': (el, value) => el.setAttribute('href', value),
    'data-aria-label': (el, value) => el.setAttribute('aria-label', value),
    'data-title': (el, value) => el.setAttribute('title', value),
  };

  for (const attribute of BINDING_ATTRIBUTES) {
    root.querySelectorAll(`[${attribute}]`).forEach((el) => {
      const value = getPath(content, el.getAttribute(attribute));
      if (value === undefined) return;
      setters[attribute](el, String(value));
    });
  }
}

// Replaces {name} placeholders in a message, for example fill('Hi {name}', { name: 'Ana' }).
export function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match));
}
