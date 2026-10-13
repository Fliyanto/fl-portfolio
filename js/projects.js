/* =========================================================
   F.LIYANTO PORTFOLIO
   PROJECT DATABASE

   Selected Work order:
   01 — LEGA
   02 — Pulse Diary
   03 — Nada Nusantara

   The project section is no longer a timeline or project
   rail. Projects now exist as independent Selected Work
   cards that open project dialogs.
   ========================================================= */

(() => {
  "use strict";

  /* =====================================================
     01 — PROJECT DATA
     ===================================================== */

  const FLProjects = {
    /* ===================================================
       LEGA
       =================================================== */

    lega: {
      id: "lega",

      number: "01",

      title: "LEGA",

      year: 2026,

      status: "completed",

      type: {
        en: "Emotional Reflection Tool",

        id: "Alat Refleksi Emosional",
      },

      disciplines: ["UI Design", "Interaction Design", "Front-End"],

      technology: ["HTML", "CSS", "JavaScript"],

      preview: {
        en: "LEGA is an emotional reflection tool designed for people who find traditional journaling difficult. It uses sliders, emojis and visual timelines to make checking in feel quicker, calmer and less demanding.",

        id: "LEGA adalah alat refleksi emosional untuk orang yang merasa journaling tradisional cukup sulit. Slider, emoji dan timeline visual membantu proses check-in terasa lebih cepat, tenang dan tidak membebani.",
      },

      interaction: {
        theme: "lega",

        visual: "sliders",
      },

      relationship: {
        predecessor: "pulse-diary",

        successor: null,

        group: "reflection-lineage",

        relation: {
          en: "LEGA grew from ideas first explored through Pulse Diary, developing them into a more practical reflection experience designed for repeated everyday use.",

          id: "LEGA berkembang dari ide yang pertama kali dieksplorasi melalui Pulse Diary, lalu mengembangkannya menjadi pengalaman refleksi yang lebih praktis untuk penggunaan sehari-hari secara berulang.",
        },
      },

      disclaimer: {
        enabled: false,
      },

      links: {
        liveProject: "https://lega-moments.netlify.app/",

        caseStudy: null,

        github: null,
      },
    },

    /* ===================================================
       PULSE DIARY
       =================================================== */

    "pulse-diary": {
      id: "pulse-diary",

      number: "02",

      title: "Pulse Diary",

      year: 2026,

      status: "completed",

      type: {
        en: "Interactive Digital Diary",

        id: "Digital Diary Interaktif",
      },

      disciplines: ["UI Design", "Interaction Design"],

      technology: ["HTML", "CSS", "JavaScript"],

      preview: {
        en: "Pulse Diary explores how visual feedback, movement and small interactions can make digital journaling feel more expressive. The interface turns personal reflection into something more visual, responsive and enjoyable to revisit.",

        id: "Pulse Diary mengeksplorasi bagaimana visual feedback, gerakan dan interaksi kecil dapat membuat digital journaling terasa lebih ekspresif. Interface mengubah refleksi pribadi menjadi pengalaman yang lebih visual, responsif dan menarik untuk dilihat kembali.",
      },

      interaction: {
        theme: "pulse",

        visual: "pulse",
      },

      relationship: {
        predecessor: null,

        successor: "lega",

        group: "reflection-lineage",

        relation: {
          en: "Pulse Diary became an early conceptual foundation for LEGA. Its experiments with emotional reflection and responsive feedback later developed into a more structured experience.",

          id: "Pulse Diary menjadi salah satu fondasi konseptual awal untuk LEGA. Eksperimennya dengan refleksi emosional dan feedback responsif kemudian berkembang menjadi pengalaman yang lebih terstruktur.",
        },
      },

      disclaimer: {
        enabled: false,
      },

      links: {
        liveProject: "https://pulsediary.netlify.app/",

        caseStudy: null,

        github: null,
      },
    },

    /* ===================================================
       NADA NUSANTARA
       =================================================== */

    "nada-nusantara": {
      id: "nada-nusantara",

      number: "03",

      title: "Nada Nusantara",

      year: 2025,

      status: "completed",

      type: {
        en: "Interactive Web Experience",

        id: "Pengalaman Web Interaktif",
      },

      disciplines: ["Web Design", "Interaction Design", "Front-End"],

      technology: ["HTML", "CSS", "JavaScript"],

      preview: {
        en: "Nada Nusantara is an interactive web experience celebrating Indonesian music and culture through digital storytelling. Sound, movement and playful interactions work together to make cultural exploration feel lively and approachable.",

        id: "Nada Nusantara adalah pengalaman web interaktif yang merayakan musik dan budaya Indonesia melalui digital storytelling. Suara, gerakan dan interaksi playful bekerja bersama untuk membuat eksplorasi budaya terasa hidup dan mudah didekati.",
      },

      interaction: {
        theme: "rhythm",

        visual: "rhythm",
      },

      relationship: {
        predecessor: null,

        successor: null,

        group: null,

        relation: null,
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
        liveProject: "https://nadanusantarafinal.netlify.app/",

        caseStudy: null,

        github: null,
      },
    },
  };

  /* =====================================================
     02 — SELECTED WORK ORDER

     Strongest / most representative work first rather than
     chronological ordering.
     ===================================================== */

  const FLProjectOrder = ["lega", "pulse-diary", "nada-nusantara"];

  /* =====================================================
     03 — COMPATIBILITY ACTIVE PROJECT

     The old portfolio required one permanently active
     project because only one project panel could be shown.

     The new portfolio does not need that UI behaviour, but
     retaining a lightweight active-project value keeps older
     helpers safe while the final integration is tested.
     ===================================================== */

  let activeFLProjectIndex = 0;

  /* =====================================================
     04 — GET PROJECT
     ===================================================== */

  function getFLProject(projectId) {
    if (!projectId) {
      return null;
    }

    return FLProjects[projectId] || null;
  }

  /* =====================================================
     05 — GET PROJECTS IN DISPLAY ORDER
     ===================================================== */

  function getFLProjectsInOrder() {
    return FLProjectOrder.map((projectId) => FLProjects[projectId]).filter(
      Boolean,
    );
  }

  /* =====================================================
     06 — GET PROJECT INDEX
     ===================================================== */

  function getFLProjectIndex(projectId) {
    return FLProjectOrder.indexOf(projectId);
  }

  /* =====================================================
     07 — CURRENT ACTIVE PROJECT
     ===================================================== */

  function getActiveFLProject() {
    const projectId = FLProjectOrder[activeFLProjectIndex];

    return getFLProject(projectId);
  }

  /* =====================================================
     08 — PROJECT TEXT HELPER

     Supports:
     getFLProjectText(
       "lega",
       "preview",
       "en"
     )

     Nested paths are also supported:
     getFLProjectText(
       "lega",
       "relationship.relation",
       "id"
     )
     ===================================================== */

  function getFLProjectText(projectId, propertyPath, language = "en") {
    const project = getFLProject(projectId);

    if (!project || !propertyPath) {
      return null;
    }

    const properties = String(propertyPath).split(".");

    let value = project;

    for (const property of properties) {
      if (
        value === null ||
        value === undefined ||
        typeof value !== "object" ||
        !(property in value)
      ) {
        return null;
      }

      value = value[property];
    }

    if (value === null || value === undefined) {
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

  /* =====================================================
     09 — PROJECT RELATIONSHIP
     ===================================================== */

  function getFLProjectRelationship(projectId) {
    const project = getFLProject(projectId);

    return project?.relationship || null;
  }

  /* =====================================================
     10 — PROJECT LIVE LINK
     ===================================================== */

  function getFLProjectLiveLink(projectId) {
    return getFLProject(projectId)?.links?.liveProject || null;
  }

  /* =====================================================
     11 — SET ACTIVE PROJECT
     ===================================================== */

  function setActiveFLProject(projectId, options = {}) {
    const { dispatch = true } = options;

    const nextIndex = getFLProjectIndex(projectId);

    if (nextIndex < 0) {
      return false;
    }

    const previousIndex = activeFLProjectIndex;

    const previousProjectId = FLProjectOrder[previousIndex] || null;

    activeFLProjectIndex = nextIndex;

    const project = getFLProject(projectId);

    if (dispatch) {
      window.dispatchEvent(
        new CustomEvent("flProjectChange", {
          detail: {
            projectId,

            project,

            index: nextIndex,

            previousProjectId,

            previousIndex,

            progress: getFLProjectProgress(),
          },
        }),
      );
    }

    return true;
  }

  /* =====================================================
     12 — NEXT PROJECT
     ===================================================== */

  function getNextFLProject(projectId = null) {
    const currentIndex = projectId
      ? getFLProjectIndex(projectId)
      : activeFLProjectIndex;

    if (currentIndex < 0) {
      return null;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= FLProjectOrder.length) {
      return null;
    }

    return getFLProject(FLProjectOrder[nextIndex]);
  }

  /* =====================================================
     13 — PREVIOUS PROJECT
     ===================================================== */

  function getPreviousFLProject(projectId = null) {
    const currentIndex = projectId
      ? getFLProjectIndex(projectId)
      : activeFLProjectIndex;

    if (currentIndex <= 0) {
      return null;
    }

    return getFLProject(FLProjectOrder[currentIndex - 1]);
  }

  /* =====================================================
     14 — MOVE TO NEXT PROJECT

     Compatibility helper. The new interface normally moves
     between projects through cards / dialogs instead.
     ===================================================== */

  function moveToNextFLProject() {
    const nextProject = getNextFLProject();

    if (!nextProject) {
      return false;
    }

    return setActiveFLProject(nextProject.id);
  }

  /* =====================================================
     15 — MOVE TO PREVIOUS PROJECT
     ===================================================== */

  function moveToPreviousFLProject() {
    const previousProject = getPreviousFLProject();

    if (!previousProject) {
      return false;
    }

    return setActiveFLProject(previousProject.id);
  }

  /* =====================================================
     16 — PROJECT PROGRESS

     Retained only for compatibility with any remaining older
     code. It no longer controls a visible progress rail.
     ===================================================== */

  function getFLProjectProgress() {
    if (FLProjectOrder.length <= 1) {
      return 1;
    }

    return activeFLProjectIndex / (FLProjectOrder.length - 1);
  }

  /* =====================================================
     17 — PROJECT ID FROM ELEMENT
     ===================================================== */

  function getFLProjectIdFromElement(element) {
    if (!element || !(element instanceof Element)) {
      return null;
    }

    if (element.dataset.projectOpen) {
      return element.dataset.projectOpen;
    }

    if (element.dataset.projectModal) {
      return element.dataset.projectModal;
    }

    if (element.dataset.projectLive) {
      return element.dataset.projectLive;
    }

    if (element.dataset.project) {
      return element.dataset.project;
    }

    const modal = element.closest("[data-project-modal]");

    if (modal?.dataset.projectModal) {
      return modal.dataset.projectModal;
    }

    const card = element.closest("[data-project]");

    if (card?.dataset.project) {
      return card.dataset.project;
    }

    const trigger = element.closest("[data-project-open]");

    if (trigger?.dataset.projectOpen) {
      return trigger.dataset.projectOpen;
    }

    return null;
  }

  /* =====================================================
     18 — ATTACH PROJECT METADATA
     ===================================================== */

  function initialiseFLProjectMetadata() {
    FLProjectOrder.forEach((projectId, index) => {
      const project = getFLProject(projectId);

      if (!project) {
        return;
      }

      const selectors = [
        `[data-project="${projectId}"]`,

        `[data-project-open="${projectId}"]`,

        `[data-project-modal="${projectId}"]`,
      ].join(",");

      document.querySelectorAll(selectors).forEach((element) => {
        element.dataset.projectIndex = String(index);

        element.dataset.projectNumber = project.number;

        element.dataset.projectYear = String(project.year);

        element.dataset.projectTheme = project.interaction?.theme || "";

        element.dataset.projectVisual = project.interaction?.visual || "";

        element.dataset.projectStatus = project.status || "";
      });
    });
  }

  /* =====================================================
     19 — PROJECT TRIGGERS
     ===================================================== */

  function initialiseFLProjectTriggers() {
    document.querySelectorAll("[data-project-open]").forEach((trigger) => {
      const projectId = trigger.dataset.projectOpen;

      const project = getFLProject(projectId);

      if (!project) {
        trigger.setAttribute("aria-disabled", "true");

        if ("disabled" in trigger) {
          trigger.disabled = true;
        }

        return;
      }

      trigger.removeAttribute("aria-disabled");

      trigger.setAttribute("aria-haspopup", "dialog");

      trigger.setAttribute("aria-expanded", "false");

      const modal = document.querySelector(
        `[data-project-modal="${projectId}"]`,
      );

      if (modal?.id) {
        trigger.setAttribute("aria-controls", modal.id);
      }
    });
  }

  /* =====================================================
     20 — PROJECT MODALS
     ===================================================== */

  function initialiseFLProjectModals() {
    document.querySelectorAll("[data-project-modal]").forEach((modal) => {
      const projectId = modal.dataset.projectModal;

      const project = getFLProject(projectId);

      if (!project) {
        return;
      }

      modal.dataset.projectIndex = String(getFLProjectIndex(projectId));

      modal.dataset.projectTheme = project.interaction?.theme || "";

      modal.dataset.projectVisual = project.interaction?.visual || "";

      if (
        !modal.getAttribute("aria-label") &&
        !modal.getAttribute("aria-labelledby")
      ) {
        modal.setAttribute("aria-label", `${project.title} project`);
      }
    });
  }

  /* =====================================================
     21 — PROJECT VISUALS
     ===================================================== */

  function initialiseFLProjectVisuals() {
    document
      .querySelectorAll("[data-project-visual], .project-visual")
      .forEach((visual) => {
        const projectId = getFLProjectIdFromElement(visual);

        const project = getFLProject(projectId);

        if (!project) {
          return;
        }

        visual.dataset.visualTheme =
          project.interaction?.visual || project.interaction?.theme || "";
      });
  }

  /* =====================================================
     22 — PROJECT LIVE LINK ID
     ===================================================== */

  function getFLProjectIdFromLiveLink(link) {
    if (!link) {
      return null;
    }

    if (link.dataset.projectLive) {
      return link.dataset.projectLive;
    }

    return getFLProjectIdFromElement(link);
  }

  /* =====================================================
     23 — LIVE LINK ACCESSIBLE LABEL
     ===================================================== */

  function getFLProjectLiveLabel(project) {
    if (!project) {
      return "";
    }

    const language =
      window.FLSite?.getLanguage?.() || document.documentElement.lang || "en";

    if (String(language).toLowerCase().startsWith("id")) {
      return `Buka proyek ${project.title}`;
    }

    return `Visit ${project.title} live project`;
  }

  /* =====================================================
     24 — INITIALISE LIVE PROJECT LINKS
     ===================================================== */

  function initialiseFLProjectLinks() {
    document.querySelectorAll("[data-project-live]").forEach((link) => {
      const projectId = getFLProjectIdFromLiveLink(link);

      const project = getFLProject(projectId);

      if (!project) {
        link.setAttribute("href", "#");

        link.setAttribute("aria-disabled", "true");

        link.removeAttribute("target");

        link.removeAttribute("rel");

        return;
      }

      const liveDestination = project.links?.liveProject;

      const fallbackDestination = project.links?.caseStudy;

      const destination = liveDestination || fallbackDestination;

      if (!destination) {
        link.setAttribute("href", "#");

        link.setAttribute("aria-disabled", "true");

        link.removeAttribute("target");

        link.removeAttribute("rel");

        return;
      }

      link.removeAttribute("aria-disabled");

      link.href = destination;

      link.setAttribute("aria-label", getFLProjectLiveLabel(project));

      if (liveDestination) {
        link.target = "_blank";

        link.rel = "noopener noreferrer";

        return;
      }

      link.removeAttribute("target");

      link.removeAttribute("rel");
    });
  }

  /* =====================================================
     25 — LANGUAGE CHANGE
     ===================================================== */

  function handleFLProjectLanguageChange() {
    initialiseFLProjectLinks();
  }

  /* =====================================================
     26 — PROJECT MODAL CHANGE

     Opening a project modal updates the lightweight active
     project value so compatibility helpers remain accurate.
     ===================================================== */

  function handleFLProjectModalChange(event) {
    const projectId = event.detail?.projectId;

    const open = Boolean(event.detail?.open);

    if (!open || !projectId) {
      return;
    }

    setActiveFLProject(projectId);
  }

  /* =====================================================
     27 — VALIDATE PROJECT ORDER
     ===================================================== */

  function validateFLProjectOrder() {
    FLProjectOrder.forEach((projectId) => {
      if (FLProjects[projectId]) {
        return;
      }

      console.warn(
        `Project "${projectId}" exists in FLProjectOrder but not FLProjects.`,
      );
    });
  }

  /* =====================================================
     28 — INITIALISE PROJECT DATABASE
     ===================================================== */

  function initialiseFLProjects() {
    validateFLProjectOrder();

    initialiseFLProjectMetadata();

    initialiseFLProjectTriggers();

    initialiseFLProjectModals();

    initialiseFLProjectVisuals();

    initialiseFLProjectLinks();

    window.addEventListener("flProjectModalChange", handleFLProjectModalChange);

    window.addEventListener("flLanguageChange", handleFLProjectLanguageChange);

    window.dispatchEvent(
      new CustomEvent("flProjectsReady", {
        detail: {
          projects: getFLProjectsInOrder(),

          order: [...FLProjectOrder],

          activeProject: getActiveFLProject(),

          activeIndex: activeFLProjectIndex,
        },
      }),
    );
  }

  /* =====================================================
     29 — PUBLIC PROJECT API
     ===================================================== */

  window.FLProjects = FLProjects;

  window.FLProjectOrder = FLProjectOrder;

  window.getFLProject = getFLProject;

  window.getFLProjectsInOrder = getFLProjectsInOrder;

  window.getActiveFLProject = getActiveFLProject;

  window.getFLProjectIndex = getFLProjectIndex;

  window.getFLProjectText = getFLProjectText;

  window.getFLProjectRelationship = getFLProjectRelationship;

  window.getFLProjectLiveLink = getFLProjectLiveLink;

  window.setActiveFLProject = setActiveFLProject;

  window.getNextFLProject = getNextFLProject;

  window.getPreviousFLProject = getPreviousFLProject;

  window.moveToNextFLProject = moveToNextFLProject;

  window.moveToPreviousFLProject = moveToPreviousFLProject;

  window.getFLProjectProgress = getFLProjectProgress;

  /* =====================================================
     30 — RUN
     ===================================================== */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseFLProjects, {
      once: true,
    });
  } else {
    initialiseFLProjects();
  }
})();
