// script.js — portfolio functionality
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function applyProfile() {
  $$('[data-profile="name"]').forEach(el => el.textContent = PROFILE.name);
  $$('[data-profile="badge"]').forEach(el => el.textContent = PROFILE.badge);
  $$('[data-profile="tagline"]').forEach(el => el.textContent = PROFILE.tagline);
  $$('[data-profile="bio"]').forEach(el => el.textContent = PROFILE.bio);
  $$('[data-profile="email"]').forEach(el => el.textContent = PROFILE.email);
  $$('[data-profile="location"]').forEach(el => el.textContent = PROFILE.location);
  $$('[data-profile="roll"]').forEach(el => el.textContent = PROFILE.roll);
  $$('[data-phone-display]').forEach(el => el.textContent = PROFILE.phone);
  $$('[data-profile="phoneLink"]').forEach(el => el.href = `tel:${PROFILE.phone.replace(/[^+0-9]/g, '')}`);
  $$('[data-profile="cvLink"]').forEach(el => {
    el.href = PROFILE.cv;
    el.target = "_blank";
    el.rel = "noreferrer";
  });
  $$('[data-email-link], [data-email-button]').forEach(el => el.href = `mailto:${PROFILE.email}`);
  $$('[data-link="github"]').forEach(el => el.href = PROFILE.github);
  $$('[data-link="linkedin"]').forEach(el => el.href = PROFILE.linkedin);
  $$('[data-link="facebook"]').forEach(el => el.href = PROFILE.facebook);
  
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  renderAboutStats();
  renderSkills();
  renderServices();
  renderEducation();
}

function renderAboutStats() {
  const container = $('#aboutStatsContainer');
  if (!container || !PROFILE.projects) return;

  const totalProjects = PROFILE.projects.length;
  const gameDevCount = PROFILE.projects.filter(p => p.categories && p.categories.includes("Game Dev")).length;
  const mobileCount = PROFILE.projects.filter(p => p.categories && p.categories.includes("Mobile")).length;

  const formatNum = (num) => String(num).padStart(2, '0');

  container.innerHTML = `
    <div class="stat-card"><strong>${formatNum(totalProjects)}</strong><span>Portfolio projects</span></div>
    <div class="stat-card"><strong>${formatNum(gameDevCount)}</strong><span>Game development</span></div>
    <div class="stat-card"><strong>${formatNum(mobileCount)}</strong><span>Mobile development</span></div>
  `;
}

function renderSkills() {
  const container = $('#skillsContainer');
  if (!container || !PROFILE.skills) return;

  container.innerHTML = PROFILE.skills.map(cat => `
    <div class="skill-category-card">
      <h3>${escapeHTML(cat.category)}</h3>
      ${cat.items.map(skill => `
        <div class="skill-bar-item">
          <div class="skill-info">
            <span>${escapeHTML(skill.name)}</span>
            <span>${escapeHTML(skill.level)}</span>
          </div>
          <div class="skill-progress-track">
            <div class="skill-progress-fill" style="width: ${escapeAttr(skill.level)};"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function renderServices() {
  const container = $('#servicesContainer');
  if (!container || !PROFILE.services) return;

  container.innerHTML = PROFILE.services.map(s => `
    <article class="service-card-custom">
      <div class="service-icon-wrap">${s.icon}</div>
      <h3>${escapeHTML(s.title)}</h3>
      <p>${escapeHTML(s.description)}</p>
    </article>
  `).join('');
}

function renderEducation() {
  const container = $('#educationContainer');
  if (!container || !PROFILE.education) return;

  container.innerHTML = PROFILE.education.map(edu => `
    <article class="timeline-item">
      <span class="timeline-dot"></span>
      <div class="timeline-card">
        <div class="timeline-card-body">
          <div class="timeline-meta">${escapeHTML(edu.meta)}</div>
          <h3>${escapeHTML(edu.title)}</h3>
          <p>${edu.description}</p>
          <div class="tag-list">
            ${edu.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}
          </div>
        </div>
        <div class="timeline-logo-wrap">
          <img src="${escapeAttr(edu.logo)}" class="timeline-logo" alt="${escapeAttr(edu.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          <span class="timeline-logo-placeholder">${escapeHTML(edu.logoPlaceholder)}</span>
        </div>
      </div>
    </article>
  `).join('');
}

let activeProjectFilter = 'All';
let visibleProjectCount = 6;

function filterProjects(projects, filter) {
  if (filter === 'All') return projects;
  return projects.filter(p => p.categories && p.categories.includes(filter));
}

function renderProjects(filter = activeProjectFilter) {
  activeProjectFilter = filter;
  const grid = $('#projectGrid');
  if (!grid) return;
  const filteredProjects = filterProjects(PROFILE.projects, filter);
  const projects = filteredProjects.slice(0, visibleProjectCount);

  if (projects.length === 0) {
    grid.innerHTML = `<p class="body-copy" style="grid-column: 1/-1; padding: 20px 0;">No projects found in this category.</p>`;
    const moreButton = $('#showMoreProjects');
    if (moreButton) moreButton.hidden = true;
    return;
  }

  grid.innerHTML = projects.map(project => {
    const artMarkup = project.image
      ? `<img class="project-img" src="${escapeAttr(project.image)}" alt="${escapeAttr(project.title)}" onerror="this.outerHTML=\`<span class='art-icon'>${escapeHTML(project.icon || '📁')}</span>\`;">`
      : `<span class="art-icon" aria-hidden="true">${escapeHTML(project.icon || '📁')}</span>`;

    return `
      <article class="project-card">
        <div class="project-art">
          ${artMarkup}
          <span class="art-label">${escapeHTML(project.subtitle)}</span>
        </div>
        <div class="project-content">
          <span class="project-category">${escapeHTML(project.categories ? project.categories.join(' • ') : '')}</span>
          <div class="project-title-row"><h3>${escapeHTML(project.title)}</h3></div>
          <p class="project-description">${escapeHTML(project.description)}</p>
          <div class="tag-list">${project.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div>
        </div>
        <div class="project-actions">
          <button class="text-button" data-project="${escapeHTML(project.id)}">View project details ↗</button>
          <div class="project-links-group" style="display:flex; gap:10px; align-items:center;">
            ${project.youtube ? `<a class="repo-link youtube-link" href="${escapeAttr(project.youtube)}" target="_blank" rel="noreferrer">YouTube ↗</a>` : ''}
            ${project.repo ? `<a class="repo-link" href="${escapeAttr(project.repo)}" target="_blank" rel="noreferrer">GitHub ↗</a>` : '<span class="repo-link">Repository not added</span>'}
          </div>
        </div>
      </article>
    `;
  }).join('');

  $$('[data-project]', grid).forEach(button => button.addEventListener('click', () => openProject(button.dataset.project)));
  const moreButton = $('#showMoreProjects');
  if (moreButton) {
    moreButton.hidden = filteredProjects.length <= visibleProjectCount;
    moreButton.textContent = `Show more projects (${filteredProjects.length - visibleProjectCount} remaining)`;
  }
}

function openProject(id) {
  const project = PROFILE.projects.find(p => p.id === id);
  if (!project) return;
  
  const dialogArt = $('#dialogArt');
  if (!dialogArt || !$('#projectDialog')) return;
  if (project.image) {
    dialogArt.innerHTML = `<img src="${escapeAttr(project.image)}" alt="${escapeAttr(project.title)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
  } else {
    dialogArt.textContent = project.icon || '📁';
  }
  
  const dialogCategory = $('#dialogCategory');
  const dialogTitle = $('#dialogTitle');
  const dialogDescription = $('#dialogDescription');
  const dialogTags = $('#dialogTags');
  if (dialogCategory) dialogCategory.textContent = project.categories ? project.categories.join(' • ') : '';
  if (dialogTitle) dialogTitle.textContent = project.title;
  if (dialogDescription) dialogDescription.textContent = project.details;
  if (dialogTags) dialogTags.innerHTML = project.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('');
  
  const dialogLinks = $('#dialogLinks');
  if (dialogLinks) dialogLinks.innerHTML = `
    ${project.repo ? `<a class="button" href="${escapeAttr(project.repo)}" target="_blank" rel="noreferrer">View source code ↗</a>` : ''}
    ${project.youtube ? `<a class="button button-outline" href="${escapeAttr(project.youtube)}" target="_blank" rel="noreferrer">Watch on YouTube ↗</a>` : ''}
    ${!project.repo && !project.youtube ? `<span class="form-note">Add a real link in js/script.js when it's ready.</span>` : ''}
  `;
  $('#projectDialog').showModal();
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function escapeAttr(value) {
  return escapeHTML(value);
}

applyProfile();
renderProjects();

const dialogClose = $('#dialogClose');
const projectDialog = $('#projectDialog');
if (dialogClose && projectDialog) dialogClose.addEventListener('click', () => projectDialog.close());
if (projectDialog) projectDialog.addEventListener('click', event => {
  if (event.target === projectDialog) projectDialog.close();
});

$$('.filter-button').forEach(button => {
  button.addEventListener('click', () => {
    $$('.filter-button').forEach(item => item.classList.toggle('active', item === button));
    visibleProjectCount = 6;
    renderProjects(button.dataset.filter);
  });
});

const showMoreProjects = $('#showMoreProjects');
if (showMoreProjects) showMoreProjects.addEventListener('click', () => {
  visibleProjectCount += 6;
  renderProjects(activeProjectFilter);
});

const themeToggle = $('#themeToggle');
if (themeToggle) themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const light = document.body.classList.contains('light');
  themeToggle.textContent = light ? '☾' : '☼';
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.content = light ? '#f5f7fb' : '#090d16';
});

const menuToggle = $('#menuToggle');
if (menuToggle) menuToggle.addEventListener('click', () => {
  const nav = $('#mobileNav');
  if (!nav) return;
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menuToggle.textContent = open ? '×' : '☰';
});

$$('#mobileNav a').forEach(link => link.addEventListener('click', () => {
  const nav = $('#mobileNav');
  const toggle = $('#menuToggle');
  if (nav) nav.classList.remove('open');
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
  }
}));

const copyEmail = $('#copyEmail');
if (copyEmail) copyEmail.addEventListener('click', async () => {
  const status = $('#copyStatus');
  if (!status) return;
  try {
    await navigator.clipboard.writeText(PROFILE.email);
    status.textContent = 'Email copied to clipboard.';
  } catch {
    status.textContent = `Email: ${PROFILE.email}`;
  }
  window.setTimeout(() => status.textContent = '', 2500);
});

window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = $('#scrollProgress');
  if (progress) progress.style.width = `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`;
}, { passive: true });