// data.js — Centralized source of truth for all portfolio data
const PROFILE = {
  name: "Md Rahat Alamgir",
  badge: "Open to junior roles and internships",
  tagline: "Building small games and mobile projects while growing my development skills.",
  bio: "I'm a Computer Science and Engineering student at the University of Asia Pacific with a deep passion for game development and mobile app development with Flutter. I enjoy learning by building projects, experimenting with gameplay mechanics, and creating user-friendly app interfaces.",
  email: "rahatalamgir93@gmail.com", 
  roll: "Roll: Add your roll number", 
  location: "3/3, Vogoboti Benarjee Road, Tikatuli, Dhaka-1203, Bangladesh",
  phone: "+880 1709086651", 
  github: "https://github.com/RahatAlamgir", 
  linkedin: "https://www.linkedin.com/in/rahat-alamgir/", 
  facebook: "https://www.facebook.com/Rahat.A.145/", 
  cv: "assets/Rahat-Alamgir-CV.pdf", 

  // Skills Data
  skills: [
    {
      category: "Flutter Mobile Dev",
      items: [
        { name: "Flutter & Dart", level: "85%" },
        { name: "Provider", level: "70%" },
        { name: "Firebase", level: "50%" },
        { name: "REST API implementation", level: "60%" }
      ]
    },
    {
      category: "Game Dev",
      items: [
        { name: "Unity / C#", level: "70%" },
        { name: "Godot / GDScript", level: "60%" },
        { name: "Pygame", level: "50%" },
        { name: "Flame Engine", level: "50%" }
      ]
    },
    {
      category: "Tools & Workflow",
      items: [
        { name: "Git & GitHub", level: "85%" },
        { name: "VS Code & Android Studio", level: "82%" },
        { name: "Canva", level: "78%" },
        { name: "Figma", level: "70%" }
      ]
    }
  ],

  // Services Data (Using clean SVG code for single-color styling)
  services: [
    {
      type: "svg",
      icon: '<svg height="22" width="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',
      title: "App Development",
      description: "Creating user-friendly mobile applications with seamless functionality and appealing interfaces using Flutter and Dart."
    },
    {
      type: "svg",
      icon: '<svg height="22" width="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><circle cx="15" cy="12" r="1"></circle><circle cx="18" cy="10" r="1"></circle></svg>',
      title: "Game Development",
      description: "Creating engaging 2D and 3D indie game prototypes and gameplay mechanics using Unity, Godot, and Flutter's Flame engine."
    },  
    {
      type: "svg",
      icon: '<svg height="22" width="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.504 5.555-5.555C21.965 6.012 17.461 2 12 2z"></path></svg>',
      title: "UI/UX Design",
      description: "Designing intuitive and visually appealing interfaces that enhance user experience and engagement."
    },
    {
      type: "svg",
      icon: '<svg height="22" width="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
      title: "Web Development",
      description: "Building responsive and scalable web applications using HTML, CSS, Django, and databases."
    },
    // {
    //   type: "svg",
    //   icon: '<svg height="22" width="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>',
    //   title: "Backend Development",
    //   description: "Building robust server-side applications, RESTful APIs, and database management systems."
    // }
  ],

  // Education Data
  education: [
    {
      meta: "CURRENT FOCUS",
      title: "App Development with Flutter & AI — Ostad",
      description: "Currently expanding mobile engineering skills by completing the 'App Development with Flutter & AI' online course at <a href='https://ostad.app' target='_blank' rel='noopener'>Ostad</a>, focusing on practical, hands-on cross-platform mobile app development and modern integration workflows.",
      tags: ["Flutter", "Dart", "AI Integration", "Ostad"],
      logo: "assets/education/ostad.jpg",
      logoPlaceholder: "OS"
    },
    {
      meta: "EDUCATION",
      title: "B.Sc. in Computer Science & Engineering",
      description: "University of Asia Pacific, Dhaka",
      tags: ["CGPA: 3.51/4.00", "2025"],
      logo: "assets/education/uap.jpg",
      logoPlaceholder: "UAP"
    },
    {
      meta: "EDUCATION",
      title: "Higher Secondary Certificate (HSC)",
      description: "Dhaka City College",
      tags: ["GPA: 5.00/5.00", "2020"],
      logo: "assets/education/dcc.jpg",
      logoPlaceholder: "DCC"
    }
  ],

  // Projects Data
  projects: [
    {
      id: "real_time_location_tracker",
      title: "Real Time Loaction Tracker",
      categories: ["Flutter", "Mobile"],
      subtitle: "Mobile productivity app",
      image: "assets/projects/locationTracker.jpg",
      icon: "✓",
      description: "A feature-rich Flutter mobile application built with Google Maps and Geolocator that delivers real-time location tracking, dynamic route recording, interactive map animations, and persistent local storage management for saved paths",
      details: "A feature-rich Flutter mobile application built with Google Maps and Geolocator that delivers real-time location tracking, dynamic route recording, interactive map animations, and persistent local storage management for saved paths",
      tags: ["Flutter", "Dart", "Google Map API"],
      repo: "https://github.com/RahatAlamgir/real_time_location_tracker.git",
      youtube: ""
    },
  
    {
      id: "flappy-bird",
      title: "Flappy Bird Clone",
      categories: ["Game Dev", "Flutter", "Mobile"],
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
      categories: ["Flutter", "Mobile"],
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
      categories: ["Flutter", "Mobile"],
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
      categories: ["Game Dev"],
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
      categories: ["Web", "Other"],
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
      categories: ["Game Dev"],
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
      categories: ["Other"],
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
      categories: ["C++", "Other"],
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
      categories: ["Game Dev", "C++"],
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