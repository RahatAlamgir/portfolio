// script.js
const PROFILE = {
  name: "Md Rahat Alamgir",
  badge: "Open to junior roles and internships",
  tagline: "Building small games and mobile projects while growing my development skills.",
  bio: "I'm a Computer Science and Engineering student at the University of Asia Pacific with a deep passion game development and mobile app development with Flutter. I enjoy learning by building projects, experimenting with gameplay mechanics, and creating user-friendly app interfaces. I'm always exploring new ideas, improving my skills, and turning what I learn into practical projects.",
  email: "rahatalamgir93@gmail.com", 
  roll: "Roll: Add your roll number", 
  location: "3/3, Vogoboti Benarjee Road, Tikatuli, Dhaka-1203, Bangladesh",
  phone: "+880 1709086651", 
  github: "https://github.com/RahatAlamgir", 
  linkedin: "https://www.linkedin.com/in/rahat-alamgir/", 
  facebook: "https://www.facebook.com/Rahat.A.145/", 
  cv: "assets/Rahat-Alamgir-CV.pdf", 
  projects: [
    {
      id: "flappy-bird",
      title: "Flappy Bird Clone",
      category: "Game Dev",
      subtitle: "Flutter & Flame",
      image: "assets/projects/FlappyBird.jpg", 
      icon: "🐤",
      description: "A Flappy Bird-inspired 2D game built with Flutter and the Flame game engine. The project uses game components, collision detection and parallax background.",
      details: "Built as a learning project with Flutter, Dart, and Flame. Implemented the bird gameplay, obstacle interactions, collision detection, parallax background and Store best score locally.",
      tags: ["Flutter", "Dart", "Flame", "parallax background"],
      repo: "https://github.com/RahatAlamgir/flappy_bird.git",
      youtube: "https://youtube.com/shorts/QBKQ3Z4OK9U?si=KenCxDbvZViIRkUy" 
    },
    {
      id: "task-manager",
      title: "Task Manager App",
      category: "Flutter & Mobile",
      subtitle: "Mobile productivity app",
      image: "assets/projects/MyTask.jpg",
      icon: "✓",
      description: "A task management application built with Flutter and Dart using REST API integration.",
      details: "User Sign Up and Login, Update Profile, Tasks CRUD operation, Search Tasks, Update Task Status (New, In Progress, Completed)",
      tags: ["Flutter", "Dart", "Rest API"],
      repo: "https://github.com/RahatAlamgir/task_manager.git",
      youtube: ""
    },
    {
      id: "contact_management_app",
      title: "Contact Management App",
      category: "Flutter & Mobile",
      subtitle: "Mobile productivity app",
      image: "assets/projects/ContactManagementApp.jpg",
      icon: "✓",
      description: "Flutter Contact Management App built with a local database.",
      details: "The app provides complete CRUD functionality for managing contacts, along with search and favorite-contact features. Also can swap between dark and light theme",
      tags: ["Flutter", "Dart", "sqflite"],
      repo: "https://github.com/RahatAlamgir/contact_management_app.git",
      youtube: ""
    },
    {
      id: "third-person-shooter-prototype",
      title: "Third Person Shooter prototype",
      category: "Game Dev",
      subtitle: "Unity",
      image: "assets/projects/3dThirdPersonShooter.jpg",
      icon: "🎮",
      description: "3D Third person shooter prototype made with Unity",
      details: "Main Focus was Third-person character movement (extended starter asset), shooting and Basic object interaction. DOTween for (door/chest animation, moving object)",
      tags: ["Unity","C#","DOTween","Starter Assets"],
      repo: "https://github.com/RahatAlamgir/Third-person-shooter-prototype.git",
      youtube: "https://youtu.be/QGNqRSfj12A?si=bPyxzn1xDXOzzpsN"
    },
    {
      id: "django-project-sample",
      title: "RideSchedule",
      category: "Django",
      subtitle: "Web backend",
      image: "assets/projects/rideSchedule.jpg",
      icon: "🐍",
      description: "A Python/Django backend application project.",
      details: "Developed using Django MVC structure, SQLite database.",
      tags: ["Python", "Django", "SQLite"],
      repo: "https://github.com/RahatAlamgir/RideSchedule.git",
      youtube: ""
    },
    {
      id: "action-platformer-prototype",
      title: "2D Action Platformer Prototype",
      category: "Game Dev",
      subtitle: "Godot",
      image: "assets/projects/2dActionPlatform.jpg",
      icon: "🎮",
      description: "Hollow Knight style 2D fast movement action platform made with Godot",
      details: "",
      tags: ["Godot","gdscript","2D"],
      repo: "https://github.com/RahatAlamgir/action-platformer.git",
      youtube: "https://youtu.be/28O3mSs0PSc?si=zenrWMs_nqlYEtjp"
    },
    {
      id: "compiler-project",
      title: "Mini C-to-Assembly Compiler",
      category: "System Software",
      subtitle: "Core Python",
      image: "",
      icon: "⚙️",
      description: "A mini compiler written in Python supporting arithmetic and control structures.",
      details: "Parses custom C-like syntax and emits targeting assembly instructions.",
      tags: ["Python", "Compiler", "Assembly"],
      repo: "https://github.com/RahatAlamgir/Mini-Compiler.git",
      youtube: ""
    },
    {
      id: "C++-project-clock",
      title: "Analog Clock",
      category: "System Software",
      subtitle: "C++ OpenGL",
      image: "assets/projects/analogClock.jpg",
      icon: "⚙️",
      description: "Analog Clock Using OpenGL and C++",
      details: "Analog Clock Using OpenGL and C++",
      tags: ["C++", "OpenGL"],
      repo: "https://github.com/RahatAlamgir/AnalogClock.git",
      youtube: ""
    },
    {
      id: "C++-project-pacman",
      title: "Pacman",
      category: "Game Dev",
      subtitle: "C++ OpenGL",
      image: "assets/projects/pacman.jpg",
      icon: "🎮",
      description: "Pac-man game using OpenGL C++",
      details: "Pac-man game using OpenGL C++",
      tags: ["C++", "OpenGL","arcade game"],
      repo: "https://github.com/RahatAlamgir/Pac-man.git",
      youtube: ""
    }
  ]
};

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
  $('#year').textContent = new Date().getFullYear();
}

let activeProjectFilter = 'All';
let visibleProjectCount = 6;

function filterProjects(projects, filter) {
  if (filter === 'All') return projects;
  if (filter === 'Game Dev') return projects.filter(p => p.category === 'Game Dev');
  if (filter === 'Flutter & Mobile') return projects.filter(p => p.category === 'Flutter & Mobile');
  if (filter === 'Others') {
    return projects.filter(p => p.category !== 'Game Dev' && p.category !== 'Flutter & Mobile');
  }
  return projects.filter(p => p.category === filter);
}

function renderProjects(filter = activeProjectFilter) {
  activeProjectFilter = filter;
  const grid = $('#projectGrid');
  const filteredProjects = filterProjects(PROFILE.projects, filter);
  const projects = filteredProjects.slice(0, visibleProjectCount);

  if (projects.length === 0) {
    grid.innerHTML = `<p class="body-copy" style="grid-column: 1/-1; padding: 20px 0;">No projects found in this category.</p>`;
    $('#showMoreProjects').hidden = true;
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
          <span class="project-category">${escapeHTML(project.category)}</span>
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
  moreButton.hidden = filteredProjects.length <= visibleProjectCount;
  moreButton.textContent = `Show more projects (${filteredProjects.length - visibleProjectCount} remaining)`;
}

function openProject(id) {
  const project = PROFILE.projects.find(p => p.id === id);
  if (!project) return;
  
  const dialogArt = $('#dialogArt');
  if (project.image) {
    dialogArt.innerHTML = `<img src="${escapeAttr(project.image)}" alt="${escapeAttr(project.title)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
  } else {
    dialogArt.textContent = project.icon || '📁';
  }
  
  $('#dialogCategory').textContent = project.category;
  $('#dialogTitle').textContent = project.title;
  $('#dialogDescription').textContent = project.details;
  $('#dialogTags').innerHTML = project.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('');
  
  $('#dialogLinks').innerHTML = `
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

$('#dialogClose').addEventListener('click', () => $('#projectDialog').close());
$('#projectDialog').addEventListener('click', event => {
  if (event.target === $('#projectDialog')) $('#projectDialog').close();
});

$$('.filter-button').forEach(button => {
  button.addEventListener('click', () => {
    $$('.filter-button').forEach(item => item.classList.toggle('active', item === button));
    visibleProjectCount = 6;
    renderProjects(button.dataset.filter);
  });
});

$('#showMoreProjects').addEventListener('click', () => {
  visibleProjectCount += 6;
  renderProjects(activeProjectFilter);
});

$('#themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
  const light = document.body.classList.contains('light');
  $('#themeToggle').textContent = light ? '☾' : '☼';
  document.querySelector('meta[name="theme-color"]').content = light ? '#f5f7fb' : '#090d16';
});

$('#menuToggle').addEventListener('click', () => {
  const nav = $('#mobileNav');
  const open = nav.classList.toggle('open');
  $('#menuToggle').setAttribute('aria-expanded', String(open));
  $('#menuToggle').setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  $('#menuToggle').textContent = open ? '×' : '☰';
});

$$('#mobileNav a').forEach(link => link.addEventListener('click', () => {
  $('#mobileNav').classList.remove('open');
  $('#menuToggle').setAttribute('aria-expanded', 'false');
  $('#menuToggle').textContent = '☰';
}));

$('#copyEmail').addEventListener('click', async () => {
  const status = $('#copyStatus');
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
  $('#scrollProgress').style.width = `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`;
}, { passive: true });