/* =========================================================
   F.LIYANTO PORTFOLIO
   PROJECT DATABASE

   Stores:
   - Project order
   - Dates / duration
   - Disciplines
   - Descriptions
   - Interaction identities
   - Case-study routes
   - Future live-project links
   - Project state helpers
   ========================================================= */

/* =========================================================
   01 — PROJECT DATA
   ========================================================= */

const FLProjects = {
  /* =====================================================
       NADA NUSANTARA
       ===================================================== */

  "nada-nusantara": {
    id: "nada-nusantara",

    number: "01",

    title: "Nada Nusantara",

    /* -------------------------------------------------
           TIMELINE
        ------------------------------------------------- */

    timeline: {
      year: 2025,

      startMonth: 7,

      endMonth: 10,

      startLabel: {
        en: "Jul 2025",
        id: "Jul 2025",
      },

      endLabel: {
        en: "Oct 2025",
        id: "Okt 2025",
      },

      displayLabel: {
        en: "Jul — Oct 2025",
        id: "Jul — Okt 2025",
      },

      status: "completed",
    },

    /* -------------------------------------------------
           PROJECT TYPE
        ------------------------------------------------- */

    type: {
      en: "Interactive Web Experience",

      id: "Pengalaman Web Interaktif",
    },

    /* -------------------------------------------------
           DISCIPLINES
        ------------------------------------------------- */

    disciplines: ["Interaction Design", "Web Design", "Front-End"],

    /* -------------------------------------------------
           TECHNOLOGY
        ------------------------------------------------- */

    technology: ["HTML", "CSS", "JavaScript"],

    /* -------------------------------------------------
           HOMEPAGE PREVIEW
        ------------------------------------------------- */

    preview: {
      en: "An interactive web experience exploring Indonesian music, culture and digital storytelling through sound, movement and playful interaction.",

      id: "Sebuah pengalaman web interaktif yang mengeksplorasi musik, budaya dan storytelling digital Indonesia melalui suara, gerakan dan interaksi yang playful.",
    },

    /* -------------------------------------------------
           CASE STUDY INTRODUCTION

           Used later on:
           projects/nada-nusantara.html
        ------------------------------------------------- */

    introduction: {
      en: "Nada Nusantara is an interactive web experience created to explore Indonesian music and cultural identity through digital interaction. The project combines sound, visual design, front-end development and playful navigation to encourage users to discover Indonesian music in a more engaging way.",

      id: "Nada Nusantara adalah pengalaman web interaktif yang dibuat untuk mengeksplorasi musik dan identitas budaya Indonesia melalui interaksi digital. Proyek ini menggabungkan suara, desain visual, front-end development dan navigasi yang playful untuk mengajak pengguna mengenal musik Indonesia dengan cara yang lebih menarik.",
    },

    /* -------------------------------------------------
           PROJECT PURPOSE
        ------------------------------------------------- */

    purpose: {
      en: "The project explores how an interactive website can communicate cultural identity through music, movement and digital storytelling instead of relying only on static information.",

      id: "Proyek ini mengeksplorasi bagaimana sebuah website interaktif dapat menyampaikan identitas budaya melalui musik, gerakan dan storytelling digital, bukan hanya melalui informasi statis.",
    },

    /* -------------------------------------------------
           INTERACTION IDENTITY
        ------------------------------------------------- */

    interaction: {
      theme: "rhythm",

      hoverLabel: {
        en: "Feel the rhythm",
        id: "Rasakan ritmenya",
      },
    },

    /* -------------------------------------------------
           COPYRIGHT / EDUCATIONAL DISCLAIMER
        ------------------------------------------------- */

    disclaimer: {
      enabled: true,

      label: {
        en: "Educational use disclaimer",

        id: "Pemberitahuan penggunaan edukasi",
      },

      text: {
        en: "Nada Nusantara was created solely for educational and non-commercial purposes. Any third-party music, audio, imagery or other copyrighted material used within the project remains the property of its respective copyright holders. No ownership of third-party material is claimed.",

        id: "Nada Nusantara dibuat semata-mata untuk tujuan pendidikan dan non-komersial. Musik, audio, gambar maupun materi berhak cipta dari pihak ketiga yang digunakan dalam proyek ini tetap menjadi milik masing-masing pemegang hak cipta. Tidak ada klaim kepemilikan atas materi pihak ketiga.",
      },
    },

    /* -------------------------------------------------
           LINKS

           liveProject stays null until you add it later.
        ------------------------------------------------- */

    links: {
      caseStudy: "projects/nada-nusantara.html",

      liveProject: null,

      github: null,
    },
  },

  /* =====================================================
       PULSE DIARY
       ===================================================== */

  "pulse-diary": {
    id: "pulse-diary",

    number: "02",

    title: "Pulse Diary",

    /* -------------------------------------------------
           TIMELINE

           Exact months can be added later.
        ------------------------------------------------- */

    timeline: {
      year: 2026,

      startMonth: null,

      endMonth: null,

      startLabel: {
        en: "2026",
        id: "2026",
      },

      endLabel: {
        en: "2026",
        id: "2026",
      },

      displayLabel: {
        en: "2026",
        id: "2026",
      },

      status: "completed",
    },

    /* -------------------------------------------------
           PROJECT TYPE
        ------------------------------------------------- */

    type: {
      en: "Interactive Digital Diary",

      id: "Digital Diary Interaktif",
    },

    /* -------------------------------------------------
           DISCIPLINES
        ------------------------------------------------- */

    disciplines: ["UI Design", "Interaction Design", "Creative Coding"],

    /* -------------------------------------------------
           TECHNOLOGY
        ------------------------------------------------- */

    technology: ["HTML", "CSS", "JavaScript"],

    /* -------------------------------------------------
           HOMEPAGE PREVIEW
        ------------------------------------------------- */

    preview: {
      en: "An expressive digital diary exploring how interface behaviour, visual feedback and interaction can make personal reflection feel more engaging.",

      id: "Sebuah digital diary ekspresif yang mengeksplorasi bagaimana perilaku interface, feedback visual dan interaksi dapat membuat proses refleksi pribadi terasa lebih menarik.",
    },

    /* -------------------------------------------------
           CASE STUDY INTRODUCTION
        ------------------------------------------------- */

    introduction: {
      en: "Pulse Diary explores how a digital diary can feel more expressive than a traditional text-based journal. The experience uses visual response, motion and interactive behaviour to make reflection feel more personal and engaging.",

      id: "Pulse Diary mengeksplorasi bagaimana sebuah digital diary dapat terasa lebih ekspresif dibandingkan jurnal berbasis teks biasa. Pengalaman ini menggunakan respons visual, motion dan perilaku interaktif untuk membuat proses refleksi terasa lebih personal dan menarik.",
    },

    /* -------------------------------------------------
           PROJECT PURPOSE
        ------------------------------------------------- */

    purpose: {
      en: "The project investigates how interface behaviour and responsive visual feedback can make personal reflection feel less static and more emotionally engaging.",

      id: "Proyek ini mengeksplorasi bagaimana perilaku interface dan feedback visual yang responsif dapat membuat proses refleksi pribadi terasa lebih hidup dan lebih emosional.",
    },

    /* -------------------------------------------------
           INTERACTION IDENTITY
        ------------------------------------------------- */

    interaction: {
      theme: "pulse",

      hoverLabel: {
        en: "Feel the pulse",
        id: "Rasakan pulsanya",
      },
    },

    /* -------------------------------------------------
           DISCLAIMER
        ------------------------------------------------- */

    disclaimer: {
      enabled: false,
    },

    /* -------------------------------------------------
           LINKS
        ------------------------------------------------- */

    links: {
      caseStudy: "projects/pulse-diary.html",

      liveProject: null,

      github: null,
    },
  },

  /* =====================================================
       LEGA
       ===================================================== */

  lega: {
    id: "lega",

    number: "03",

    title: "Lega",

    /* -------------------------------------------------
           TIMELINE
        ------------------------------------------------- */

    timeline: {
      year: 2026,

      startMonth: 8,

      endMonth: null,

      startLabel: {
        en: "Aug 2026",
        id: "Agu 2026",
      },

      endLabel: {
        en: "Ongoing",
        id: "Berlangsung",
      },

      displayLabel: {
        en: "Aug 2026 — Ongoing",
        id: "Agu 2026 — Sekarang",
      },

      status: "ongoing",
    },

    /* -------------------------------------------------
           PROJECT TYPE
        ------------------------------------------------- */

    type: {
      en: "Emotional Reflection Experience",

      id: "Pengalaman Refleksi Emosional",
    },

    /* -------------------------------------------------
           DISCIPLINES
        ------------------------------------------------- */

    disciplines: [
      "UI Design",

      "Interaction Design",

      "UX Research",

      "Front-End",
    ],

    /* -------------------------------------------------
           TECHNOLOGY
        ------------------------------------------------- */

    technology: ["HTML", "CSS", "JavaScript"],

    /* -------------------------------------------------
           HOMEPAGE PREVIEW
        ------------------------------------------------- */

    preview: {
      en: "A private emotional reflection experience designed to help people understand what they are feeling without needing to label the emotion first.",

      id: "Sebuah pengalaman refleksi emosional privat yang dirancang untuk membantu seseorang memahami apa yang sedang mereka rasakan tanpa harus langsung memberi label pada emosinya.",
    },

    /* -------------------------------------------------
           CASE STUDY INTRODUCTION
        ------------------------------------------------- */

    introduction: {
      en: "Lega is a private emotional reflection experience built around the idea that people should not always need to immediately name what they are feeling. Instead, users reflect through simple interactive controls describing qualities such as intensity, heaviness, tension, energy and overwhelm.",

      id: "Lega adalah pengalaman refleksi emosional privat yang dibangun dari gagasan bahwa seseorang tidak selalu harus langsung memberi nama pada apa yang sedang mereka rasakan. Sebagai gantinya, pengguna melakukan refleksi melalui kontrol interaktif sederhana seperti intensitas, rasa berat, ketegangan, energi dan overwhelm.",
    },

    /* -------------------------------------------------
           PROJECT PURPOSE
        ------------------------------------------------- */

    purpose: {
      en: "The project explores how emotional reflection can feel easier to begin when users are not immediately asked to identify or label a specific emotion.",

      id: "Proyek ini mengeksplorasi bagaimana refleksi emosional dapat terasa lebih mudah untuk dimulai ketika pengguna tidak langsung diminta untuk mengidentifikasi atau memberi label pada emosi tertentu.",
    },

    /* -------------------------------------------------
           INTERACTION IDENTITY
        ------------------------------------------------- */

    interaction: {
      theme: "sliders",

      hoverLabel: {
        en: "Move the feeling",
        id: "Gerakkan rasanya",
      },
    },

    /* -------------------------------------------------
           DISCLAIMER
        ------------------------------------------------- */

    disclaimer: {
      enabled: false,
    },

    /* -------------------------------------------------
           LINKS
        ------------------------------------------------- */

    links: {
      caseStudy: "projects/lega.html",

      liveProject: null,

      github: null,
    },
  },
};

/* =========================================================
   02 — PROJECT ORDER
   ========================================================= */

const FLProjectOrder = ["nada-nusantara", "pulse-diary", "lega"];

/* =========================================================
   03 — ACTIVE PROJECT STATE
   ========================================================= */

let activeFLProjectIndex = 0;

/* =========================================================
   04 — GET PROJECT
   ========================================================= */

function getFLProject(projectId) {
  return FLProjects[projectId] || null;
}

/* =========================================================
   05 — GET PROJECTS IN ORDER
   ========================================================= */

function getFLProjectsInOrder() {
  return FLProjectOrder.map((projectId) => FLProjects[projectId])

    .filter(Boolean);
}

/* =========================================================
   06 — GET CURRENT ACTIVE PROJECT
   ========================================================= */

function getActiveFLProject() {
  const projectId = FLProjectOrder[activeFLProjectIndex];

  return FLProjects[projectId] || null;
}

/* =========================================================
   07 — GET PROJECT INDEX
   ========================================================= */

function getFLProjectIndex(projectId) {
  return FLProjectOrder.indexOf(projectId);
}

/* =========================================================
   08 — PROJECT TRANSLATION HELPER
   ========================================================= */

function getFLProjectText(projectId, property, language = "en") {
  const project = getFLProject(projectId);

  if (!project) {
    return null;
  }

  const value = project[property];

  if (value === undefined || value === null) {
    return null;
  }

  /*
       Arrays are returned directly.
    */

  if (Array.isArray(value)) {
    return value;
  }

  /*
       Normal values are returned directly.
    */

  if (typeof value !== "object") {
    return value;
  }

  /*
       Bilingual object.
    */

  if (value[language] !== undefined) {
    return value[language];
  }

  /*
       Fall back to English.
    */

  if (value.en !== undefined) {
    return value.en;
  }

  return value;
}

/* =========================================================
   09 — SET ACTIVE PROJECT

   Updates internal project state and broadcasts an event.

   The visual transition itself will be handled later
   by main.js / animations.js.
   ========================================================= */

function setActiveFLProject(projectId) {
  const newIndex = getFLProjectIndex(projectId);

  if (newIndex === -1) {
    return false;
  }

  const previousIndex = activeFLProjectIndex;

  const previousProjectId = FLProjectOrder[previousIndex];

  activeFLProjectIndex = newIndex;

  const project = FLProjects[projectId];

  window.dispatchEvent(
    new CustomEvent("flProjectChange", {
      detail: {
        projectId,

        project,

        index: activeFLProjectIndex,

        previousProjectId,

        previousIndex,
      },
    }),
  );

  return true;
}

/* =========================================================
   10 — NEXT PROJECT
   ========================================================= */

function getNextFLProject() {
  const nextIndex = activeFLProjectIndex + 1;

  if (nextIndex >= FLProjectOrder.length) {
    return null;
  }

  const projectId = FLProjectOrder[nextIndex];

  return FLProjects[projectId] || null;
}

/* =========================================================
   11 — PREVIOUS PROJECT
   ========================================================= */

function getPreviousFLProject() {
  const previousIndex = activeFLProjectIndex - 1;

  if (previousIndex < 0) {
    return null;
  }

  const projectId = FLProjectOrder[previousIndex];

  return FLProjects[projectId] || null;
}

/* =========================================================
   12 — MOVE TO NEXT PROJECT
   ========================================================= */

function moveToNextFLProject() {
  const nextProject = getNextFLProject();

  if (!nextProject) {
    return false;
  }

  return setActiveFLProject(nextProject.id);
}

/* =========================================================
   13 — MOVE TO PREVIOUS PROJECT
   ========================================================= */

function moveToPreviousFLProject() {
  const previousProject = getPreviousFLProject();

  if (!previousProject) {
    return false;
  }

  return setActiveFLProject(previousProject.id);
}

/* =========================================================
   14 — TIMELINE PROGRESS
   ========================================================= */

function getFLProjectProgress() {
  if (FLProjectOrder.length <= 1) {
    return 1;
  }

  return activeFLProjectIndex / (FLProjectOrder.length - 1);
}

/* =========================================================
   15 — INITIALISE PROJECT ELEMENTS

   Adds project metadata to the existing HTML so CSS and
   animations.js can understand which interaction belongs
   to each project.
   ========================================================= */

function initialiseFLProjectElements() {
  document.querySelectorAll("[data-project-panel]").forEach((panel) => {
    const projectId = panel.dataset.projectPanel;

    const project = getFLProject(projectId);

    if (!project) {
      return;
    }

    panel.dataset.projectIndex = getFLProjectIndex(projectId);

    panel.dataset.projectTheme = project.interaction.theme;

    panel.dataset.projectStatus = project.timeline.status;
  });
}

/* =========================================================
   16 — INITIALISE READ MORE LINKS
   ========================================================= */

function initialiseFLProjectLinks() {
  document.querySelectorAll("[data-project-read-more]").forEach((link) => {
    const projectId = link.dataset.projectReadMore;

    const project = getFLProject(projectId);

    if (!project) {
      link.setAttribute("aria-disabled", "true");

      return;
    }

    if (project.links.caseStudy) {
      link.href = project.links.caseStudy;
    }

    link.setAttribute("aria-label", `Read more about ${project.title}`);
  });
}

/* =========================================================
   17 — INITIALISE PROJECT MARKERS
   ========================================================= */

function initialiseFLProjectMarkers() {
  document.querySelectorAll("[data-project-jump]").forEach((button) => {
    const projectId = button.dataset.projectJump;

    const project = getFLProject(projectId);

    if (!project) {
      button.disabled = true;

      return;
    }

    button.dataset.projectIndex = getFLProjectIndex(projectId);
  });
}

/* =========================================================
   18 — INITIALISE PROJECT DATABASE
   ========================================================= */

function initialiseFLProjects() {
  initialiseFLProjectElements();

  initialiseFLProjectLinks();

  initialiseFLProjectMarkers();
}

/* =========================================================
   19 — RUN
   ========================================================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiseFLProjects);
} else {
  initialiseFLProjects();
}

/* =========================================================
   20 — GLOBAL ACCESS

   Allows main.js, animations.js and future case-study pages
   to access the project database.
   ========================================================= */

window.FLProjects = FLProjects;

window.FLProjectOrder = FLProjectOrder;

window.getFLProject = getFLProject;

window.getFLProjectsInOrder = getFLProjectsInOrder;

window.getActiveFLProject = getActiveFLProject;

window.getFLProjectIndex = getFLProjectIndex;

window.getFLProjectText = getFLProjectText;

window.setActiveFLProject = setActiveFLProject;

window.getNextFLProject = getNextFLProject;

window.getPreviousFLProject = getPreviousFLProject;

window.moveToNextFLProject = moveToNextFLProject;

window.moveToPreviousFLProject = moveToPreviousFLProject;

window.getFLProjectProgress = getFLProjectProgress;
