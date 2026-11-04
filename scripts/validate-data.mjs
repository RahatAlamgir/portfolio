// Checks the content in /data and the HTML bindings before publishing.
// Run from the project root:  node scripts/validate-data.mjs
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// Usage: node scripts/validate-data.mjs [dataDir] [--skip-assets]
const DATA_DIR = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? 'data';
const SKIP_ASSETS = process.argv.includes('--skip-assets');
const errors = [];
const warnings = [];

const read = (relativePath) => JSON.parse(readFileSync(join(root, relativePath), 'utf8'));
const readText = (relativePath) => readFileSync(join(root, relativePath), 'utf8');
const fail = (file, message) => errors.push(`${file}: ${message}`);
const warn = (file, message) => warnings.push(`${file}: ${message}`);

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';
const isHttpsUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};
const assetExists = (path) => SKIP_ASSETS || existsSync(join(root, path));
const getPath = (source, path) => path.split('.').reduce((value, key) => value?.[key], source);

function requireFields(file, item, fields, label) {
  for (const field of fields) {
    if (!isNonEmptyString(item[field])) fail(file, `${label} is missing "${field}"`);
  }
}

// ---- profile.json -------------------------------------------------------
const profileFile = DATA_DIR + '/profile.json';
const profile = read(profileFile);
requireFields(profileFile, profile, ['name', 'initials', 'badge', 'tagline', 'bio', 'email', 'location', 'phone', 'cv'], 'profile');
if (isNonEmptyString(profile.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
  fail(profileFile, `email "${profile.email}" is not a valid address`);
}
if (isNonEmptyString(profile.cv) && !assetExists(profile.cv)) fail(profileFile, `cv file not found: ${profile.cv}`);
if (profile.photo?.src && !assetExists(profile.photo.src)) fail(profileFile, `photo not found: ${profile.photo.src}`);
for (const network of ['github', 'linkedin', 'facebook']) {
  if (!isHttpsUrl(profile.social?.[network] ?? '')) fail(profileFile, `social.${network} must be an https URL`);
}

// ---- site.json ----------------------------------------------------------
const siteFile = DATA_DIR + '/site.json';
const site = read(siteFile);
const siteUi = site.ui ?? {};

for (const [key, value] of Object.entries(siteUi)) {
  if (!isNonEmptyString(value)) fail(siteFile, `ui.${key} is empty`);
}
for (const [index, link] of (site.navLinks ?? []).entries()) {
  requireFields(siteFile, link, ['label', 'href'], `nav link ${index + 1}`);
}
for (const network of [...(site.social?.heroOrder ?? []), ...(site.social?.contactOrder ?? [])]) {
  if (!profile.social?.[network]) fail(siteFile, `social network "${network}" has no URL in profile.json`);
  if (!site.social?.labels?.[network]) fail(siteFile, `social network "${network}" has no label`);
}
for (const [index, item] of (site.sections?.contact?.items ?? []).entries()) {
  requireFields(siteFile, item, ['label', 'icon', 'type', 'field'], `contact item ${index + 1}`);
  if (item.field && getPath({ profile }, item.field) === undefined) fail(siteFile, `contact item "${item.label}" points to missing ${item.field}`);
}
const terminal = site.hero?.terminal ?? {};
if (!Array.isArray(terminal.lines) || terminal.lines.length === 0) fail(siteFile, 'hero.terminal.lines is empty');
for (const [index, line] of (terminal.lines ?? []).entries()) {
  if (!line.br && !Array.isArray(line.tokens)) fail(siteFile, `terminal line ${index + 1} needs "tokens" or "br"`);
}
const iconSource = readText('js/modules/icons.js');
const knownIcons = new Set([...iconSource.matchAll(/^\s{2}(\w+):/gm)].map((match) => match[1]));
for (const [index, button] of (site.hero?.buttons ?? []).entries()) {
  const label = `hero button ${index + 1}`;
  requireFields(siteFile, button, ['label'], label);
  if (button.icon && !knownIcons.has(button.icon)) fail(siteFile, `${label} uses unknown icon "${button.icon}"`);
  if (button.hrefFrom && getPath({ profile }, button.hrefFrom) === undefined) fail(siteFile, `${label} points to missing ${button.hrefFrom}`);
}

// ---- skills.json --------------------------------------------------------
const skillsFile = DATA_DIR + '/skills.json';
for (const [index, category] of read(skillsFile).entries()) {
  const label = `skill category ${index + 1}`;
  requireFields(skillsFile, category, ['category'], label);
  if (!Array.isArray(category.items) || category.items.length === 0) {
    fail(skillsFile, `${label} has no items`);
    continue;
  }
  for (const item of category.items) {
    requireFields(skillsFile, item, ['name', 'level'], `skill in "${category.category}"`);
    if (!/^(100|[1-9]?\d)%$/.test(item.level ?? '')) {
      fail(skillsFile, `"${item.name}" level must be a percentage from 0% to 100%, got "${item.level}"`);
    }
  }
}

// ---- services.json ------------------------------------------------------
const servicesFile = DATA_DIR + '/services.json';
for (const [index, service] of read(servicesFile).entries()) {
  const label = `service ${index + 1}`;
  requireFields(servicesFile, service, ['icon', 'title', 'description'], label);
  if (service.icon && !knownIcons.has(service.icon)) {
    fail(servicesFile, `${label} uses unknown icon "${service.icon}" (add it to js/modules/icons.js)`);
  }
}

// ---- education.json -----------------------------------------------------
const educationFile = DATA_DIR + '/education.json';
for (const [index, item] of read(educationFile).entries()) {
  const label = `education ${index + 1}`;
  requireFields(educationFile, item, ['meta', 'title', 'description', 'logo', 'logoPlaceholder'], label);
  if (!Array.isArray(item.tags) || item.tags.length === 0) fail(educationFile, `${label} has no tags`);
  if (item.logo && !assetExists(item.logo)) fail(educationFile, `${label} logo not found: ${item.logo}`);
}

// ---- projects.json ------------------------------------------------------
const projectsFile = DATA_DIR + '/projects.json';
const filters = site.sections?.projects?.filters ?? [];
const allowedCategories = new Set(filters.slice(1));
const projects = read(projectsFile);
const seenIds = new Set();

for (const [index, project] of projects.entries()) {
  const label = `project ${index + 1} (${project.id ?? 'no id'})`;
  requireFields(projectsFile, project, ['id', 'title', 'subtitle', 'description'], label);
  if (!isNonEmptyString(project.details)) warn(projectsFile, `${label} has no details text for its dialog`);

  if (seenIds.has(project.id)) fail(projectsFile, `duplicate id "${project.id}"`);
  seenIds.add(project.id);

  if (!Array.isArray(project.categories) || project.categories.length === 0) {
    fail(projectsFile, `${label} has no categories`);
  } else {
    for (const category of project.categories) {
      if (!allowedCategories.has(category)) {
        fail(projectsFile, `${label} uses category "${category}", which is not in site.json filters`);
      }
    }
  }

  if (!Array.isArray(project.tags) || project.tags.length === 0) fail(projectsFile, `${label} has no tags`);
  if (project.image && !assetExists(project.image)) fail(projectsFile, `${label} image not found: ${project.image}`);

  for (const field of ['repo', 'youtube']) {
    if (project[field] && !isHttpsUrl(project[field])) fail(projectsFile, `${label} ${field} must be an https URL`);
  }

  if (!project.repo && !project.youtube) warn(projectsFile, `${label} has no repo or YouTube link`);
}

// ---- index.html ---------------------------------------------------------
const htmlFile = 'index.html';
const html = readText(htmlFile);
const content = { profile, site };

// Every binding must point to a value that exists in the JSON files.
const bindingPattern = /data-(?:text|src|alt|href|aria-label|title)="((?:profile|site)\.[\w.]+)"/g;
for (const match of html.matchAll(bindingPattern)) {
  if (getPath(content, match[1]) === undefined) fail(htmlFile, `binding points to missing value: ${match[1]}`);
}

// The HTML must not contain visible text; all text comes from /data.
const visibleText = html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
  .replace(/<[^>]+>/g, '')
  .trim();
if (visibleText !== '') {
  fail(htmlFile, `visible text found in HTML, move it to /data: "${visibleText.slice(0, 80)}"`);
}

// ---- report -------------------------------------------------------------
for (const message of warnings) console.warn(`warning  ${message}`);
for (const message of errors) console.error(`error    ${message}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(`Data is valid (${warnings.length} warning(s)).`);
