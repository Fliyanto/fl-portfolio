(() => {
  "use strict";

  const FLProjects = {
    lega: {
      id: "lega",
      number: "01",
      title: "LEGA",
      year: 2026,
      status: "completed",
      type: {
        en: "Emotional Reflection Tool",
        id: "Alat Refleksi Emosi",
      },
      disciplines: ["UI Design", "Interaction Design", "Front-End"],
      technology: ["HTML", "CSS", "JavaScript"],
      preview: {
        en: "LEGA is an emotional reflection tool designed for people who find traditional journaling difficult. It uses sliders, emojis and visual timelines to make checking in feel quicker, calmer and less demanding.",
        id: "LEGA adalah alat refleksi emosi untuk orang yang merasa journaling tradisional sulit dimulai atau terlalu menuntut. Slider, emoji, dan timeline visual membantu proses check-in terasa lebih cepat, tenang, dan ringan.",
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
          id: "LEGA berkembang dari ide yang pertama kali saya eksplor melalui Pulse Diary, lalu membawanya menjadi pengalaman refleksi yang lebih praktis dan dirancang untuk penggunaan sehari-hari.",
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

    "pulse-diary": {
      id: "pulse-diary",
      number: "02",
      title: "Pulse Diary",
      year: 2026,
      status: "completed",
      type: {
        en: "Interactive Digital Diary",
        id: "Diary Digital Interaktif",
      },
      disciplines: ["UI Design", "Interaction Design"],
      technology: ["HTML", "CSS", "JavaScript"],
      preview: {
        en: "Pulse Diary explores how visual feedback, movement and small interactions can make digital journaling feel more expressive. The interface turns personal reflection into something more visual, responsive and enjoyable to revisit.",
        id: "Pulse Diary mengeksplorasi bagaimana visual feedback, motion, dan interaksi kecil dapat membuat journaling digital terasa lebih ekspresif. Refleksi pribadi menjadi pengalaman yang lebih visual, responsif, dan menarik untuk dilihat kembali.",
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
          id: "Pulse Diary menjadi salah satu fondasi awal untuk LEGA. Eksperimen dengan refleksi emosi dan responsive feedback di proyek ini kemudian berkembang menjadi pengalaman yang lebih terstruktur dan praktis.",
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
        id: "Nada Nusantara adalah pengalaman web interaktif yang membawa musik dan budaya Indonesia ke dalam digital storytelling. Suara, motion, dan interaksi playful bekerja bersama agar proses menjelajah budaya terasa hidup, menarik, dan mudah didekati.",
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
          id: "Catatan penggunaan materi",
        },
        text: {
          en: "Nada Nusantara was created solely for educational and non-commercial purposes. Any third-party music, audio, imagery or other copyrighted material used within the project remains the property of its respective copyright holders. No ownership of third-party material is claimed.",
          id: "Nada Nusantara dibuat khusus untuk keperluan pendidikan dan bukan untuk tujuan komersial. Musik, audio, gambar, dan materi berhak cipta milik pihak ketiga yang digunakan dalam proyek ini tetap menjadi milik pemegang hak cipta masing-masing. Saya tidak mengklaim kepemilikan atas materi tersebut.",
        },
      },
      links: {
        liveProject: "https://nadanusantarafinal.netlify.app/",
        caseStudy: null,
        github: null,
      },
    },
  };

  const FLProjectOrder = ["lega", "pulse-diary", "nada-nusantara"];

  let activeFLProjectIndex = 0;
  let projectsInitialised = false;

  function getFLProject(projectId) {
    return projectId ? FLProjects[projectId] || null : null;
  }

  function getFLProjectsInOrder() {
    return FLProjectOrder.map((projectId) => FLProjects[projectId]).filter(
      Boolean,
    );
  }

  function getFLProjectIndex(projectId) {
    return FLProjectOrder.indexOf(projectId);
  }

  function getActiveFLProject() {
    return getFLProject(FLProjectOrder[activeFLProjectIndex]);
  }

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

    if (Array.isArray(value) || typeof value !== "object") {
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

  function getFLProjectRelationship(projectId) {
    return getFLProject(projectId)?.relationship || null;
  }

  function getFLProjectLiveLink(projectId) {
    return getFLProject(projectId)?.links?.liveProject || null;
  }

  function getFLProjectProgress() {
    if (FLProjectOrder.length <= 1) {
      return 1;
    }

    return activeFLProjectIndex / (FLProjectOrder.length - 1);
  }

  function setActiveFLProject(projectId, options = {}) {
    const { dispatch = true } = options;
    const nextIndex = getFLProjectIndex(projectId);

    if (nextIndex < 0) {
      return false;
    }

    const previousIndex = activeFLProjectIndex;
    const previousProjectId = FLProjectOrder[previousIndex] || null;

    activeFLProjectIndex = nextIndex;

    if (dispatch) {
      window.dispatchEvent(
        new CustomEvent("flProjectChange", {
          detail: {
            projectId,
            project: getFLProject(projectId),
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

  function getNextFLProject(projectId = null) {
    const currentIndex = projectId
      ? getFLProjectIndex(projectId)
      : activeFLProjectIndex;

    if (currentIndex < 0 || currentIndex >= FLProjectOrder.length - 1) {
      return null;
    }

    return getFLProject(FLProjectOrder[currentIndex + 1]);
  }

  function getPreviousFLProject(projectId = null) {
    const currentIndex = projectId
      ? getFLProjectIndex(projectId)
      : activeFLProjectIndex;

    if (currentIndex <= 0) {
      return null;
    }

    return getFLProject(FLProjectOrder[currentIndex - 1]);
  }

  function moveToNextFLProject() {
    const nextProject = getNextFLProject();

    return nextProject ? setActiveFLProject(nextProject.id) : false;
  }

  function moveToPreviousFLProject() {
    const previousProject = getPreviousFLProject();

    return previousProject ? setActiveFLProject(previousProject.id) : false;
  }

  function getFLProjectIdFromElement(element) {
    if (!(element instanceof Element)) {
      return null;
    }

    const directId =
      element.dataset.projectOpen ||
      element.dataset.projectModal ||
      element.dataset.projectLive ||
      element.dataset.project;

    if (directId) {
      return directId;
    }

    return (
      element.closest("[data-project-modal]")?.dataset.projectModal ||
      element.closest("[data-project]")?.dataset.project ||
      element.closest("[data-project-open]")?.dataset.projectOpen ||
      null
    );
  }

  function getFLProjectLanguage() {
    const siteLanguage = window.FLSite?.getLanguage?.();

    if (siteLanguage === "id" || siteLanguage === "en") {
      return siteLanguage;
    }

    const rootLanguage =
      document.documentElement.dataset.language ||
      document.documentElement.lang ||
      "en";

    return String(rootLanguage).toLowerCase().startsWith("id") ? "id" : "en";
  }

  function getFLProjectLiveLabel(project) {
    if (!project) {
      return "";
    }

    return getFLProjectLanguage() === "id"
      ? `Kunjungi proyek ${project.title}`
      : `Visit ${project.title} live project`;
  }

  function getFLProjectModalLabel(project) {
    if (!project) {
      return "";
    }

    return getFLProjectLanguage() === "id"
      ? `Detail proyek ${project.title}`
      : `${project.title} project details`;
  }

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

      if (!modal.getAttribute("aria-labelledby")) {
        modal.setAttribute("aria-label", getFLProjectModalLabel(project));
      }
    });
  }

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

  function initialiseFLProjectLinks() {
    document.querySelectorAll("[data-project-live]").forEach((link) => {
      const projectId = getFLProjectIdFromElement(link);
      const project = getFLProject(projectId);

      const liveDestination = project?.links?.liveProject || null;
      const fallbackDestination = project?.links?.caseStudy || null;
      const destination = liveDestination || fallbackDestination;

      if (!project || !destination) {
        link.setAttribute("href", "#");
        link.setAttribute("aria-disabled", "true");
        link.removeAttribute("target");
        link.removeAttribute("rel");
        return;
      }

      link.removeAttribute("aria-disabled");
      link.setAttribute("href", destination);
      link.setAttribute("aria-label", getFLProjectLiveLabel(project));

      if (liveDestination) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      } else {
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
    });
  }

  function syncFLProjectLanguage() {
    initialiseFLProjectLinks();
    initialiseFLProjectModals();
  }

  function handleFLProjectModalChange(event) {
    const projectId = event.detail?.projectId;
    const open = Boolean(event.detail?.open);

    if (open && projectId) {
      setActiveFLProject(projectId);
    }
  }

  function validateFLProjectOrder() {
    const seen = new Set();

    FLProjectOrder.forEach((projectId) => {
      if (!FLProjects[projectId]) {
        console.warn(
          `Project "${projectId}" exists in FLProjectOrder but not FLProjects.`,
        );
        return;
      }

      if (seen.has(projectId)) {
        console.warn(`Project "${projectId}" appears more than once.`);
      }

      seen.add(projectId);
    });

    Object.keys(FLProjects).forEach((projectId) => {
      if (!seen.has(projectId)) {
        console.warn(
          `Project "${projectId}" exists in FLProjects but is missing from FLProjectOrder.`,
        );
      }
    });
  }

  function initialiseFLProjects() {
    if (projectsInitialised) {
      return;
    }

    projectsInitialised = true;

    validateFLProjectOrder();
    initialiseFLProjectMetadata();
    initialiseFLProjectTriggers();
    initialiseFLProjectModals();
    initialiseFLProjectVisuals();
    initialiseFLProjectLinks();

    window.addEventListener("flProjectModalChange", handleFLProjectModalChange);

    window.addEventListener("flLanguageChange", syncFLProjectLanguage);
    window.addEventListener("flSiteReady", syncFLProjectLanguage);

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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseFLProjects, {
      once: true,
    });
  } else {
    initialiseFLProjects();
  }
})();
