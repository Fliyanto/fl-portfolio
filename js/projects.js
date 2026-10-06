/* =========================================================
   F.LIYANTO PORTFOLIO
   PROJECT DATABASE
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

    type: {
      en: "Interactive Web Experience",

      id: "Pengalaman Web Interaktif",
    },

    disciplines: ["Interaction Design", "Web Design", "Front-End"],

    technology: ["HTML", "CSS", "JavaScript"],

    preview: {
      en: "An interactive web experience exploring Indonesian traditional instruments through sound, spatial interaction and playful visual movement.",

      id: "Sebuah pengalaman web interaktif yang mengeksplorasi alat musik tradisional Indonesia melalui suara, interaksi spasial, dan gerakan visual yang playful.",
    },

    introduction: {
      en: "Nada Nusantara is an interactive web experience exploring Indonesian traditional instruments through digital interaction, sound and playful visual movement. The project combines cultural storytelling, interface design and front-end development to encourage users to discover Indonesian music through interaction rather than static information.",

      id: "Nada Nusantara adalah pengalaman web interaktif yang mengeksplorasi alat musik tradisional Indonesia melalui interaksi digital, suara, dan gerakan visual yang playful. Proyek ini menggabungkan storytelling budaya, desain interface, dan front-end development agar pengguna dapat mengenal musik Indonesia melalui interaksi, bukan hanya informasi statis.",
    },

    purpose: {
      en: "The project explores how sound, movement and interactive web design can communicate cultural identity while encouraging playful discovery.",

      id: "Proyek ini mengeksplorasi bagaimana suara, gerakan, dan desain web interaktif dapat menyampaikan identitas budaya sekaligus mendorong proses eksplorasi yang playful.",
    },

    interaction: {
      theme: "rhythm",

      hoverLabel: {
        en: "Feel the rhythm",

        id: "Rasakan ritmenya",
      },
    },

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

    links: {
      caseStudy: "projects/nada-nusantara.html",

      liveProject: "https://nadanusantarafinal.netlify.app/",

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

    type: {
      en: "Interactive Digital Diary",

      id: "Digital Diary Interaktif",
    },

    disciplines: ["UI Design", "Interaction Design", "Creative Coding"],

    technology: ["HTML", "CSS", "JavaScript"],

    preview: {
      en: "An expressive digital diary that transforms daily emotional reflections into a visual pulse through colour, rhythm and interaction.",

      id: "Sebuah digital diary ekspresif yang mengubah refleksi emosional sehari-hari menjadi visual pulse melalui warna, ritme, dan interaksi.",
    },

    introduction: {
      en: "Pulse Diary explores how a digital diary can make emotional reflection feel more expressive than a traditional text-based journal. Daily entries are translated into visual responses through colour, rhythm, interface behaviour and interactive feedback.",

      id: "Pulse Diary mengeksplorasi bagaimana digital diary dapat membuat refleksi emosional terasa lebih ekspresif dibandingkan jurnal berbasis teks tradisional. Catatan harian diterjemahkan menjadi respons visual melalui warna, ritme, perilaku interface, dan feedback interaktif.",
    },

    purpose: {
      en: "The project investigates how responsive visual feedback and interface behaviour can make personal reflection feel less static and more emotionally engaging.",

      id: "Proyek ini mengeksplorasi bagaimana feedback visual yang responsif dan perilaku interface dapat membuat proses refleksi pribadi terasa lebih hidup dan lebih emosional.",
    },

    interaction: {
      theme: "pulse",

      hoverLabel: {
        en: "Feel the pulse",

        id: "Rasakan pulsanya",
      },
    },

    disclaimer: {
      enabled: false,
    },

    links: {
      caseStudy: "projects/pulse-diary.html",

      liveProject: "https://pulsediary.netlify.app/",

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

    type: {
      en: "Interactive Emotional Reflection Experience",

      id: "Pengalaman Refleksi Emosional Interaktif",
    },

    disciplines: ["UI Design", "Interaction Design", "Front-End"],

    technology: ["HTML", "CSS", "JavaScript"],

    preview: {
      en: "A private emotional reflection experience that uses sliders, templates and visual timelines to help people understand what they are feeling without needing to label the emotion first.",

      id: "Sebuah pengalaman refleksi emosional pribadi yang menggunakan slider, template dan timeline visual untuk membantu pengguna memahami apa yang mereka rasakan tanpa harus memberi label pada emosinya terlebih dahulu.",
    },

    introduction: {
      en: "Lega is a private emotional reflection experience designed to help people understand what they are feeling without requiring them to name or label the emotion first. The interface uses sliders, templates, emojis and visual timelines to make reflection easier to start, revisit and understand over time.",

      id: "Lega adalah pengalaman refleksi emosional pribadi yang dirancang untuk membantu pengguna memahami apa yang mereka rasakan tanpa harus langsung memberi nama atau label pada emosinya. Interface menggunakan slider, template, emoji dan timeline visual agar proses refleksi lebih mudah dimulai, dilihat kembali dan dipahami dari waktu ke waktu.",
    },

    purpose: {
      en: "The project explores how interaction design can make emotional reflection feel more approachable by reducing the pressure to identify emotions through words before users are ready.",

      id: "Proyek ini mengeksplorasi bagaimana interaction design dapat membuat refleksi emosional terasa lebih mudah didekati dengan mengurangi tekanan untuk menjelaskan emosi melalui kata-kata sebelum pengguna siap.",
    },

    interaction: {
      theme: "lega",

      hoverLabel: {
        en: "Take a moment",

        id: "Luangkan sejenak",
      },
    },

    disclaimer: {
      enabled: false,
    },

    /*
     * The Lega project itself remains fully represented in
     * the portfolio. Its final destination can be added here
     * once the live build is ready.
     */

    links: {
      caseStudy: null,

      liveProject: null,

      github: null,
    },
  },
};

/* =========================================================
   02 — PROJECT ORDER

   This order is shared by:
   - Previous / Next controls
   - Project progress
   - Timeline markers
   - Scroll / click animation routing
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
  return FLProjectOrder.map((projectId) => FLProjects[projectId]).filter(
    Boolean,
  );
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

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (value[language] !== undefined) {
    return value[language];
  }

  if (value.en !== undefined) {
    return value.en;
  }

  return value;
}

/* =========================================================
   09 — SET ACTIVE PROJECT
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

        progress: getFLProjectProgress(),
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
   14 — PROJECT PROGRESS

   3-project result:
   Nada  → 0.0
   Pulse → 0.5
   Lega  → 1.0
   ========================================================= */

function getFLProjectProgress() {
  if (FLProjectOrder.length <= 1) {
    return 1;
  }

  return activeFLProjectIndex / (FLProjectOrder.length - 1);
}
/* =========================================================
   15 — UPDATE PROJECT DOM STATE
   ========================================================= */

function updateFLProjectDOMState(projectId) {
  const project = getFLProject(projectId);

  if (!project) {
    return;
  }

  const activeIndex = getFLProjectIndex(projectId);

  /* -----------------------------------------------------
     PANELS
     ----------------------------------------------------- */

  document.querySelectorAll("[data-project-panel]").forEach((panel) => {
    const isActive = panel.dataset.projectPanel === projectId;

    panel.classList.toggle("is-active", isActive);

    panel.setAttribute("aria-hidden", String(!isActive));
  });

  /* -----------------------------------------------------
     TIMELINE MARKERS
     ----------------------------------------------------- */

  document.querySelectorAll("[data-project-jump]").forEach((marker) => {
    const isActive = marker.dataset.projectJump === projectId;

    marker.classList.toggle("is-active", isActive);

    marker.setAttribute("aria-current", isActive ? "true" : "false");
  });

  /* -----------------------------------------------------
     COUNTER
     ----------------------------------------------------- */

  const counter = document.querySelector("[data-project-current]");

  if (counter) {
    counter.textContent = String(activeIndex + 1).padStart(2, "0");
  }

  /* -----------------------------------------------------
     PROGRESS FILL

     3 project positions:
     Nada  → 0%
     Pulse → 50%
     Lega  → 100%
     ----------------------------------------------------- */

  const progressFill = document.querySelector("[data-project-progress-fill]");

  if (progressFill) {
    const progress = getFLProjectProgress();

    progressFill.style.setProperty("--project-progress", progress);

    progressFill.dataset.progress = String(progress);
  }

  /* -----------------------------------------------------
     PREVIOUS / NEXT CONTROLS
     ----------------------------------------------------- */

  const previousButton = document.querySelector("[data-project-previous]");

  const nextButton = document.querySelector("[data-project-next]");

  if (previousButton) {
    previousButton.disabled = activeIndex <= 0;
  }

  if (nextButton) {
    nextButton.disabled = activeIndex >= FLProjectOrder.length - 1;
  }
}

/* =========================================================
   16 — INITIALISE PROJECT ELEMENTS
   ========================================================= */

function initialiseFLProjectElements() {
  document.querySelectorAll("[data-project-panel]").forEach((panel) => {
    const projectId = panel.dataset.projectPanel;

    const project = getFLProject(projectId);

    if (!project) {
      panel.hidden = true;

      return;
    }

    panel.hidden = false;

    panel.dataset.projectIndex = getFLProjectIndex(projectId);

    panel.dataset.projectTheme = project.interaction.theme;

    panel.dataset.projectStatus = project.timeline.status;
  });
}

/* =========================================================
   17 — INITIALISE LIVE PROJECT LINKS

   Nada and Pulse currently have live destinations.

   Lega remains part of the full portfolio experience, but
   its final URL is intentionally null for now. The button
   remains in the HTML and can be activated later simply by
   adding the finished URL to FLProjects.lega.links.
   ========================================================= */

function initialiseFLProjectLinks() {
  document.querySelectorAll("[data-project-read-more]").forEach((link) => {
    const projectId = link.dataset.projectReadMore;

    const project = getFLProject(projectId);

    if (!project) {
      link.setAttribute("aria-disabled", "true");

      return;
    }

    const destination = project.links.liveProject || project.links.caseStudy;

    /* -------------------------------------------------
         NO DESTINATION YET

         Keep the existing visual control in place.
         main.js already prevents "#" placeholder links
         from navigating.
         ------------------------------------------------- */

    if (!destination) {
      link.href = "#";

      link.setAttribute("aria-disabled", "true");

      link.removeAttribute("target");

      link.removeAttribute("rel");

      link.setAttribute("aria-label", project.title);

      return;
    }

    /* -------------------------------------------------
         ACTIVE DESTINATION
         ------------------------------------------------- */

    link.removeAttribute("aria-disabled");

    link.href = destination;

    if (project.links.liveProject) {
      link.target = "_blank";

      link.rel = "noopener noreferrer";

      link.setAttribute("aria-label", `View ${project.title} live project`);
    } else {
      link.removeAttribute("target");

      link.removeAttribute("rel");

      link.setAttribute("aria-label", `Read more about ${project.title}`);
    }
  });
}

/* =========================================================
   18 — INITIALISE PROJECT MARKERS
   ========================================================= */

function initialiseFLProjectMarkers() {
  document.querySelectorAll("[data-project-jump]").forEach((button) => {
    const projectId = button.dataset.projectJump;

    const project = getFLProject(projectId);

    if (!project) {
      button.disabled = true;

      return;
    }

    button.disabled = false;

    button.dataset.projectIndex = getFLProjectIndex(projectId);
  });
}

/* =========================================================
   19 — PROJECT STATE LISTENER
   ========================================================= */

function handleFLProjectDOMChange(event) {
  const projectId = event.detail?.projectId;

  if (!projectId) {
    return;
  }

  updateFLProjectDOMState(projectId);
}

/* =========================================================
   20 — INITIALISE PROJECT DATABASE
   ========================================================= */

function initialiseFLProjects() {
  initialiseFLProjectElements();

  initialiseFLProjectLinks();

  initialiseFLProjectMarkers();

  updateFLProjectDOMState(FLProjectOrder[activeFLProjectIndex]);

  window.addEventListener("flProjectChange", handleFLProjectDOMChange);
}

/* =========================================================
   21 — RUN
   ========================================================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiseFLProjects, {
    once: true,
  });
} else {
  initialiseFLProjects();
}

/* =========================================================
   22 — GLOBAL ACCESS
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
