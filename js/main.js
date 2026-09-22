/* =========================================================
   F.LIYANTO PORTFOLIO
   MAIN INTERACTION CONTROLLER
   ========================================================= */

(() => {
  "use strict";

  /* =====================================================
       01 — CORE CONSTANTS
       ===================================================== */

  const SCENE_ORDER = ["welcome", "about", "services", "projects", "contact"];

  const STORAGE_KEYS = {
    language: "flPortfolio.language",

    fontSize: "flPortfolio.fontSize",

    reducedMotion: "flPortfolio.reducedMotion",
  };

  const DEFAULTS = {
    language: "en",

    fontSize: "default",

    reducedMotion: false,
  };

  const VALID_LANGUAGES = ["en", "id"];

  const VALID_FONT_SIZES = ["small", "default", "large"];

  /* =====================================================
       02 — SITE STATE
       ===================================================== */

  const FLState = {
    language: DEFAULTS.language,

    fontSize: DEFAULTS.fontSize,

    reducedMotion: DEFAULTS.reducedMotion,

    currentScene: "welcome",

    activeDiscipline: null,

    mobileNavOpen: false,

    settingsOpen: false,

    touch: {
      tracking: false,

      scene: null,

      startX: 0,

      startY: 0,

      startScrollY: 0,

      startTime: 0,
    },
  };

  /* =====================================================
       03 — DOM CACHE
       ===================================================== */

  const FLDom = {};

  function FLCacheDOM() {
    FLDom.root = document.documentElement;

    FLDom.body = document.body;

    FLDom.header = document.querySelector("[data-header]");

    FLDom.settingsToggle = document.querySelector("[data-settings-toggle]");

    FLDom.settingsPanel = document.querySelector("[data-settings-panel]");

    FLDom.settingsClose = document.querySelector("[data-settings-close]");

    FLDom.navToggle = document.querySelector("[data-nav-toggle]");

    FLDom.mobileNav = document.querySelector("[data-mobile-nav]");

    FLDom.scenes = Array.from(document.querySelectorAll("[data-scene]"));

    FLDom.languageButtons = Array.from(
      document.querySelectorAll("[data-language]"),
    );

    FLDom.fontSizeButtons = Array.from(
      document.querySelectorAll("[data-font-size]"),
    );

    FLDom.reduceMotion = document.querySelector("[data-reduce-motion]");

    FLDom.sceneTargets = Array.from(
      document.querySelectorAll("[data-scene-target]"),
    );

    FLDom.sceneContinue = Array.from(
      document.querySelectorAll("[data-scene-continue]"),
    );

    FLDom.disciplineTriggers = Array.from(
      document.querySelectorAll("[data-discipline-trigger]"),
    );

    FLDom.disciplines = Array.from(
      document.querySelectorAll("[data-discipline]"),
    );

    FLDom.disciplinePlayground = document.querySelector(
      "[data-discipline-playground]",
    );

    FLDom.projectMarkers = Array.from(
      document.querySelectorAll("[data-project-jump]"),
    );

    FLDom.projectPanels = Array.from(
      document.querySelectorAll("[data-project-panel]"),
    );

    FLDom.projectPrevious = document.querySelector("[data-project-previous]");

    FLDom.projectNext = document.querySelector("[data-project-next]");

    FLDom.projectCurrent = document.querySelector("[data-project-current]");

    FLDom.projectProgressFill = document.querySelector(
      "[data-project-progress-fill]",
    );

    FLDom.contactLinks = Array.from(
      document.querySelectorAll("[data-contact]"),
    );
  }

  /* =====================================================
       04 — SAFE LOCAL STORAGE
       ===================================================== */

  function FLReadStorage(key, fallback = null) {
    try {
      const value = window.localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return value;
    } catch {
      return fallback;
    }
  }

  function FLWriteStorage(key, value) {
    try {
      window.localStorage.setItem(key, String(value));

      return true;
    } catch {
      return false;
    }
  }

  /* =====================================================
       05 — TRANSLATION HELPERS
       ===================================================== */

  function FLGetTranslation(language, key) {
    const dictionary = window.FLTranslations?.[language];

    if (!dictionary || !key) {
      return null;
    }

    /*
           First support flat keys:
           { "nav.about": "About" }
        */

    if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
      return dictionary[key];
    }

    /*
           Also support nested dictionaries:
           { nav: { about: "About" } }
        */

    const value = key.split(".").reduce((current, segment) => {
      return current && typeof current === "object"
        ? current[segment]
        : undefined;
    }, dictionary);

    return typeof value === "string" ? value : null;
  }

  /* =====================================================
       06 — LANGUAGE
       ===================================================== */

  function FLApplyLanguage(language, options = {}) {
    const { persist = true, dispatch = true } = options;

    const safeLanguage = VALID_LANGUAGES.includes(language)
      ? language
      : DEFAULTS.language;

    FLState.language = safeLanguage;

    FLDom.root.lang = safeLanguage === "id" ? "id" : "en";

    FLDom.root.dataset.language = safeLanguage;

    /* -------------------------------------------------
           TRANSLATED TEXT
        ------------------------------------------------- */

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;

      const translation = FLGetTranslation(safeLanguage, key);

      if (translation !== null) {
        element.textContent = translation;
      }
    });

    /* -------------------------------------------------
           TRANSLATED PLACEHOLDERS
        ------------------------------------------------- */

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.dataset.i18nPlaceholder;

      const translation = FLGetTranslation(safeLanguage, key);

      if (translation !== null) {
        element.setAttribute("placeholder", translation);
      }
    });

    /* -------------------------------------------------
           LANGUAGE CONTROLS
        ------------------------------------------------- */

    FLDom.languageButtons.forEach((button) => {
      const active = button.dataset.language === safeLanguage;

      button.classList.toggle("is-active", active);

      button.setAttribute("aria-pressed", String(active));
    });

    if (persist) {
      FLWriteStorage(STORAGE_KEYS.language, safeLanguage);
    }

    if (dispatch) {
      window.dispatchEvent(
        new CustomEvent("flLanguageChange", {
          detail: {
            language: safeLanguage,
          },
        }),
      );
    }

    return safeLanguage;
  }

  /* =====================================================
       07 — FONT SIZE
       ===================================================== */

  function FLApplyFontSize(size, options = {}) {
    const { persist = true, dispatch = true } = options;

    const safeSize = VALID_FONT_SIZES.includes(size) ? size : DEFAULTS.fontSize;

    FLState.fontSize = safeSize;

    FLDom.root.dataset.fontSize = safeSize;

    FLDom.fontSizeButtons.forEach((button) => {
      const active = button.dataset.fontSize === safeSize;

      button.classList.toggle("is-active", active);

      button.setAttribute("aria-pressed", String(active));
    });

    if (persist) {
      FLWriteStorage(STORAGE_KEYS.fontSize, safeSize);
    }

    if (dispatch) {
      window.dispatchEvent(
        new CustomEvent("flFontSizeChange", {
          detail: {
            size: safeSize,
          },
        }),
      );
    }

    return safeSize;
  }

  /* =====================================================
       08 — REDUCED MOTION
       ===================================================== */

  function FLApplyReducedMotion(enabled, options = {}) {
    const { persist = true, dispatch = true } = options;

    const reduceMotion = Boolean(enabled);

    FLState.reducedMotion = reduceMotion;

    FLDom.root.dataset.reduceMotion = String(reduceMotion);

    if (FLDom.reduceMotion) {
      FLDom.reduceMotion.checked = reduceMotion;
    }

    if (persist) {
      FLWriteStorage(STORAGE_KEYS.reducedMotion, String(reduceMotion));
    }

    if (dispatch) {
      window.dispatchEvent(
        new CustomEvent("flMotionPreferenceChange", {
          detail: {
            reducedMotion: reduceMotion,
          },
        }),
      );
    }

    return reduceMotion;
  }

  function FLIsReducedMotion() {
    return FLState.reducedMotion || FLDom.root.dataset.reduceMotion === "true";
  }

  /* =====================================================
       09 — LOAD SAVED PREFERENCES
       ===================================================== */

  function FLLoadPreferences() {
    const savedLanguage = FLReadStorage(
      STORAGE_KEYS.language,
      DEFAULTS.language,
    );

    const savedFontSize = FLReadStorage(
      STORAGE_KEYS.fontSize,
      DEFAULTS.fontSize,
    );

    const savedMotion = FLReadStorage(STORAGE_KEYS.reducedMotion, null);

    let reducedMotion = DEFAULTS.reducedMotion;

    if (savedMotion === "true") {
      reducedMotion = true;
    } else if (savedMotion === "false") {
      reducedMotion = false;
    } else {
      reducedMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ??
        false;
    }

    FLApplyLanguage(savedLanguage, {
      persist: false,
      dispatch: false,
    });

    FLApplyFontSize(savedFontSize, {
      persist: false,
      dispatch: false,
    });

    FLApplyReducedMotion(reducedMotion, {
      persist: false,
      dispatch: false,
    });
  }

  /* =====================================================
       10 — SETTINGS PANEL
       ===================================================== */

  function FLOpenSettings() {
    if (!FLDom.settingsPanel) {
      return;
    }

    FLCloseMobileNav();

    FLState.settingsOpen = true;

    FLDom.settingsPanel.hidden = false;

    FLDom.settingsPanel.classList.add("is-open");

    FLDom.settingsToggle?.setAttribute("aria-expanded", "true");

    requestAnimationFrame(() => {
      FLDom.settingsClose?.focus?.();
    });
  }

  function FLCloseSettings(options = {}) {
    const { returnFocus = false } = options;

    if (!FLDom.settingsPanel) {
      return;
    }

    FLState.settingsOpen = false;

    FLDom.settingsPanel.classList.remove("is-open");

    FLDom.settingsPanel.hidden = true;

    FLDom.settingsToggle?.setAttribute("aria-expanded", "false");

    if (returnFocus) {
      FLDom.settingsToggle?.focus?.();
    }
  }

  function FLToggleSettings() {
    if (FLState.settingsOpen) {
      FLCloseSettings({
        returnFocus: true,
      });
    } else {
      FLOpenSettings();
    }
  }

  /* =====================================================
       11 — MOBILE NAVIGATION
       ===================================================== */

  function FLOpenMobileNav() {
    if (!FLDom.mobileNav) {
      return;
    }

    FLCloseSettings();

    FLState.mobileNavOpen = true;

    FLDom.mobileNav.hidden = false;

    FLDom.mobileNav.classList.add("is-open");

    FLDom.navToggle?.classList.add("is-open");

    FLDom.navToggle?.setAttribute("aria-expanded", "true");

    FLDom.body.classList.add("nav-open");
  }

  function FLCloseMobileNav(options = {}) {
    const { returnFocus = false } = options;

    if (!FLDom.mobileNav) {
      return;
    }

    FLState.mobileNavOpen = false;

    FLDom.mobileNav.classList.remove("is-open");

    FLDom.mobileNav.hidden = true;

    FLDom.navToggle?.classList.remove("is-open");

    FLDom.navToggle?.setAttribute("aria-expanded", "false");

    FLDom.body.classList.remove("nav-open");

    if (returnFocus) {
      FLDom.navToggle?.focus?.();
    }
  }

  function FLToggleMobileNav() {
    if (FLState.mobileNavOpen) {
      FLCloseMobileNav({
        returnFocus: true,
      });
    } else {
      FLOpenMobileNav();
    }
  }

  /* =====================================================
       12 — SCENE HELPERS
       ===================================================== */

  function FLGetSceneElement(sceneName) {
    return document.querySelector(`[data-scene="${sceneName}"]`);
  }

  function FLGetSceneIndex(sceneName) {
    return SCENE_ORDER.indexOf(sceneName);
  }

  function FLGetNextSceneName(sceneName = FLState.currentScene) {
    const index = FLGetSceneIndex(sceneName);

    if (index < 0 || index >= SCENE_ORDER.length - 1) {
      return null;
    }

    return SCENE_ORDER[index + 1];
  }

  function FLGetPreviousSceneName(sceneName = FLState.currentScene) {
    const index = FLGetSceneIndex(sceneName);

    if (index <= 0) {
      return null;
    }

    return SCENE_ORDER[index - 1];
  }

  /* =====================================================
       13 — ACTIVE SCENE
       ===================================================== */

  function FLSetActiveScene(sceneName, options = {}) {
    if (!SCENE_ORDER.includes(sceneName)) {
      return false;
    }

    const { forceDispatch = false } = options;

    const previousScene = FLState.currentScene;

    FLState.currentScene = sceneName;

    /* -------------------------------------------------
           SCENE STATUS
        ------------------------------------------------- */

    FLDom.scenes.forEach((scene) => {
      const active = scene.dataset.scene === sceneName;

      scene.dataset.sceneStatus = active ? "active" : "inactive";

      scene.setAttribute("aria-current", active ? "true" : "false");
    });

    /* -------------------------------------------------
           NAV CURRENT STATE
        ------------------------------------------------- */

    FLDom.sceneTargets.forEach((control) => {
      const target = control.dataset.sceneTarget;

      const isNavControl = Boolean(
        control.closest(".site-nav, [data-mobile-nav]"),
      );

      if (!isNavControl) {
        return;
      }

      if (target === sceneName) {
        control.setAttribute("aria-current", "page");
      } else {
        control.removeAttribute("aria-current");
      }
    });

    /* -------------------------------------------------
           EVENT
        ------------------------------------------------- */

    if (previousScene !== sceneName || forceDispatch) {
      window.dispatchEvent(
        new CustomEvent("flSceneChange", {
          detail: {
            scene: sceneName,

            previousScene,
          },
        }),
      );
    }

    return true;
  }

  /* =====================================================
       14 — HASH HELPERS
       ===================================================== */

  function FLSceneToHash(sceneName) {
    const hashes = {
      welcome: "#welcome",

      about: "#about",

      services: "#what-i-do",

      projects: "#recent-projects",

      contact: "#contact",
    };

    return hashes[sceneName] || "#welcome";
  }

  function FLHashToScene(hash = window.location.hash) {
    const normalized = String(hash || "").toLowerCase();

    const scenes = {
      "#welcome": "welcome",

      "#about": "about",

      "#what-i-do": "services",

      "#services": "services",

      "#recent-projects": "projects",

      "#projects": "projects",

      "#contact": "contact",
    };

    return scenes[normalized] || null;
  }

  function FLUpdateHash(sceneName, options = {}) {
    const { replace = false } = options;

    const hash = FLSceneToHash(sceneName);

    if (window.location.hash === hash) {
      return;
    }

    try {
      if (replace) {
        window.history.replaceState(null, "", hash);
      } else {
        window.history.pushState(null, "", hash);
      }
    } catch {
      /*
               Hash navigation is optional.
               No action needed if History API is blocked.
            */
    }
  }

  /* =====================================================
       15 — SCENE NAVIGATION

       Header navigation now asks animations.js for a
       meaningful landing state rather than blindly going
       to the first frame of a pinned animation.

       animations.js will define the exact ready position.
       ===================================================== */

  function FLGoToScene(sceneName, options = {}) {
    if (!SCENE_ORDER.includes(sceneName)) {
      return false;
    }

    const {
      landing = sceneName === "welcome" ? "intro" : "ready",

      immediate = false,

      updateHash = false,

      replaceHash = false,
    } = options;

    FLCloseMobileNav();

    FLCloseSettings();

    /*
           The animation controller owns scroll positioning
           whenever it is available.
        */

    if (window.FLAnimations?.goToScene) {
      const handled = window.FLAnimations.goToScene(sceneName, {
        landing,
        immediate,
      });

      if (handled !== false) {
        if (updateHash) {
          FLUpdateHash(sceneName, {
            replace: replaceHash,
          });
        }

        return true;
      }
    }

    /* -------------------------------------------------
           NON-GSAP FALLBACK
        ------------------------------------------------- */

    const scene = FLGetSceneElement(sceneName);

    if (!scene) {
      return false;
    }

    scene.scrollIntoView({
      behavior: immediate || FLIsReducedMotion() ? "auto" : "smooth",

      block: "start",
    });

    FLSetActiveScene(sceneName);

    if (updateHash) {
      FLUpdateHash(sceneName, {
        replace: replaceHash,
      });
    }

    return true;
  }

  /* =====================================================
       16 — ADVANCE CURRENT SCENE
       ===================================================== */

  function FLAdvanceScene(sceneName = FLState.currentScene) {
    if (window.FLAnimations?.advanceScene) {
      const handled = window.FLAnimations.advanceScene(sceneName);

      if (handled !== false) {
        return true;
      }
    }

    const nextScene = FLGetNextSceneName(sceneName);

    if (!nextScene) {
      return false;
    }

    return FLGoToScene(nextScene, {
      landing: "ready",
    });
  }

  /* =====================================================
       17 — NAVIGATION CONTROL CLICKS
       ===================================================== */

  function FLHandleSceneTargetClick(event) {
    const control = event.currentTarget;

    const target = control.dataset.sceneTarget;

    if (!target) {
      return;
    }

    event.preventDefault();

    /*
           Top navigation should always land at the scene's
           readable / interactive resting state.

           Restarting at Welcome returns to its intro.
        */

    const landing = target === "welcome" ? "intro" : "ready";

    FLGoToScene(target, {
      landing,
      updateHash: true,
    });
  }

  /* =====================================================
       18 — CONTINUE BUTTONS
       ===================================================== */

  function FLHandleSceneContinue(event) {
    event.preventDefault();

    event.stopPropagation();

    const scene = event.currentTarget.closest("[data-scene]");

    const sceneName = scene?.dataset.scene;

    if (!sceneName) {
      return;
    }

    FLAdvanceScene(sceneName);
  }

  /* =====================================================
       19 — CLICK-ANYWHERE ADVANCE

       Clicking open/background space advances the exact
       same animation used by the Continue control.

       Interactive UI is deliberately excluded.
       ===================================================== */

  const FLInteractiveSelector = [
    "a",
    "button",
    "input",
    "select",
    "textarea",
    "summary",
    "details",
    "label",

    "[role='button']",
    "[contenteditable='true']",

    "[data-settings-panel]",
    "[data-mobile-nav]",

    ".discipline",
    ".project-panel",
    ".project-progress__marker",
    ".project-controls",
    ".contact-link",

    "[data-no-scene-advance]",
  ].join(",");

  function FLIsInteractiveTarget(target) {
    if (!(target instanceof Element)) {
      return false;
    }

    return Boolean(target.closest(FLInteractiveSelector));
  }

  function FLInitialiseSceneClickAdvance() {
    FLDom.scenes.forEach((scene) => {
      /*
                       Contact is intentionally the end of the
                       journey, so background clicking does not
                       advance anywhere from there.
                    */

      if (scene.dataset.scene === "contact") {
        scene.dataset.clickAdvance = "false";

        return;
      }

      scene.dataset.clickAdvance = "true";

      scene.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.button !== 0) {
          return;
        }

        if (scene.dataset.sceneStatus !== "active") {
          return;
        }

        if (FLIsInteractiveTarget(event.target)) {
          return;
        }

        /*
                               Allow text selection without
                               accidentally advancing.
                            */

        const selection = window.getSelection?.()?.toString()?.trim();

        if (selection) {
          return;
        }

        FLAdvanceScene(scene.dataset.scene);
      });
    });
  }

  /* =====================================================
       20 — TOUCH / FLICK SUPPORT

       Native scrolling remains the primary mobile gesture.

       This only acts as a fallback when a deliberate quick
       upward flick did NOT already move the page enough to
       progress naturally.

       That prevents a normal swipe from advancing twice.
       ===================================================== */

  function FLHandleTouchStart(event) {
    if (event.touches.length !== 1) {
      FLState.touch.tracking = false;

      return;
    }

    if (FLIsInteractiveTarget(event.target)) {
      FLState.touch.tracking = false;

      return;
    }

    const scene = event.target.closest("[data-scene]");

    if (!scene || scene.dataset.sceneStatus !== "active") {
      FLState.touch.tracking = false;

      return;
    }

    const touch = event.touches[0];

    FLState.touch = {
      tracking: true,

      scene: scene.dataset.scene,

      startX: touch.clientX,

      startY: touch.clientY,

      startScrollY: window.scrollY,

      startTime: performance.now(),
    };
  }

  function FLHandleTouchEnd(event) {
    if (!FLState.touch.tracking) {
      return;
    }

    const state = {
      ...FLState.touch,
    };

    FLState.touch.tracking = false;

    const touch = event.changedTouches?.[0];

    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - state.startX;

    const deltaY = touch.clientY - state.startY;

    const absX = Math.abs(deltaX);

    const absY = Math.abs(deltaY);

    const duration = performance.now() - state.startTime;

    const nativeScrollDistance = Math.abs(window.scrollY - state.startScrollY);

    /*
           Requirements for a deliberate quick flick.
        */

    const fastEnough = duration <= 360;

    const farEnough = absY >= 85;

    const mostlyVertical = absY > absX * 1.4;

    const upward = deltaY < 0;

    /*
           If the browser already moved the scroll position
           significantly, ScrollTrigger is already handling
           the gesture beautifully.

           Do not add a second movement.
        */

    const browserAlreadyHandledIt = nativeScrollDistance > 28;

    if (
      fastEnough &&
      farEnough &&
      mostlyVertical &&
      upward &&
      !browserAlreadyHandledIt
    ) {
      FLAdvanceScene(state.scene);
    }
  }

  function FLInitialiseTouchGestures() {
    document.addEventListener("touchstart", FLHandleTouchStart, {
      passive: true,
    });

    document.addEventListener("touchend", FLHandleTouchEnd, {
      passive: true,
    });

    document.addEventListener(
      "touchcancel",
      () => {
        FLState.touch.tracking = false;
      },
      {
        passive: true,
      },
    );
  }
  /* =====================================================
       21 — DISCIPLINE HELPERS
       ===================================================== */

  function FLGetDiscipline(disciplineId) {
    return (
      FLDom.disciplines.find((discipline) => {
        return discipline.dataset.discipline === disciplineId;
      }) || null
    );
  }

  function FLGetDisciplineTrigger(disciplineId) {
    return (
      FLDom.disciplineTriggers.find((trigger) => {
        return trigger.dataset.disciplineTrigger === disciplineId;
      }) || null
    );
  }

  /* =====================================================
       22 — OPEN DISCIPLINE
       ===================================================== */

  function FLOpenDiscipline(disciplineId) {
    const discipline = FLGetDiscipline(disciplineId);

    if (!discipline) {
      return false;
    }

    const alreadyOpen = FLState.activeDiscipline === disciplineId;

    if (alreadyOpen) {
      FLCloseActiveDiscipline();

      return true;
    }

    FLState.activeDiscipline = disciplineId;

    FLDom.disciplinePlayground?.classList.add("has-active");

    FLDom.disciplines.forEach((item) => {
      const active = item.dataset.discipline === disciplineId;

      item.classList.toggle("is-active", active);

      const details = item.querySelector("[data-discipline-details]");

      if (details) {
        details.setAttribute("aria-hidden", String(!active));
      }
    });

    FLDom.disciplineTriggers.forEach((trigger) => {
      const active = trigger.dataset.disciplineTrigger === disciplineId;

      trigger.setAttribute("aria-expanded", String(active));
    });

    window.dispatchEvent(
      new CustomEvent("flDisciplineChange", {
        detail: {
          discipline: disciplineId,
        },
      }),
    );

    return true;
  }

  /* =====================================================
       23 — CLOSE DISCIPLINE
       ===================================================== */

  function FLCloseActiveDiscipline() {
    if (!FLState.activeDiscipline) {
      return false;
    }

    FLState.activeDiscipline = null;

    FLDom.disciplinePlayground?.classList.remove("has-active");

    FLDom.disciplines.forEach((discipline) => {
      discipline.classList.remove("is-active");

      const details = discipline.querySelector("[data-discipline-details]");

      details?.setAttribute("aria-hidden", "true");
    });

    FLDom.disciplineTriggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");
    });

    window.dispatchEvent(
      new CustomEvent("flDisciplineChange", {
        detail: {
          discipline: null,
        },
      }),
    );

    return true;
  }

  /* =====================================================
       24 — DISCIPLINE CLICKS
       ===================================================== */

  function FLHandleDisciplineTrigger(event) {
    event.preventDefault();

    event.stopPropagation();

    const disciplineId = event.currentTarget.dataset.disciplineTrigger;

    if (!disciplineId) {
      return;
    }

    FLOpenDiscipline(disciplineId);
  }

  /* =====================================================
       25 — DISCIPLINE OUTSIDE CLICK

       If a discipline is currently expanded, clicking the
       empty playground area closes it first instead of also
       progressing the whole scene.

       The scene click listener from Part 1 sees the event
       as prevented and therefore does not advance.
       ===================================================== */

  function FLInitialiseDisciplineOutsideClose() {
    document.addEventListener(
      "click",
      (event) => {
        if (!FLState.activeDiscipline) {
          return;
        }

        const servicesScene = event.target.closest('[data-scene="services"]');

        if (!servicesScene) {
          return;
        }

        const activeDiscipline = FLGetDiscipline(FLState.activeDiscipline);

        if (activeDiscipline?.contains(event.target)) {
          return;
        }

        /*
                   Let explicit controls continue working.
                */

        if (
          event.target.closest(
            ["a", "button", "[data-scene-continue]"].join(","),
          )
        ) {
          return;
        }

        event.preventDefault();

        FLCloseActiveDiscipline();
      },
      true,
    );
  }

  /* =====================================================
       26 — PROJECT HELPERS
       ===================================================== */

  function FLGetProjectOrder() {
    return Array.isArray(window.FLProjectOrder) ? window.FLProjectOrder : [];
  }

  function FLGetProjectIndex(projectId) {
    if (typeof window.getFLProjectIndex === "function") {
      return window.getFLProjectIndex(projectId);
    }

    return FLGetProjectOrder().indexOf(projectId);
  }

  /* =====================================================
       27 — PROJECT DISPLAY
       ===================================================== */

  function FLUpdateProjectDisplay(projectId) {
    const projectOrder = FLGetProjectOrder();

    const index = FLGetProjectIndex(projectId);

    if (index < 0) {
      return false;
    }

    /* -------------------------------------------------
           PANELS
        ------------------------------------------------- */

    FLDom.projectPanels.forEach((panel) => {
      const active = panel.dataset.projectPanel === projectId;

      panel.classList.toggle("is-active", active);

      panel.setAttribute("aria-hidden", String(!active));
    });

    /* -------------------------------------------------
           TIMELINE MARKERS
        ------------------------------------------------- */

    FLDom.projectMarkers.forEach((marker) => {
      const active = marker.dataset.projectJump === projectId;

      marker.classList.toggle("is-active", active);

      marker.setAttribute("aria-pressed", String(active));
    });

    /* -------------------------------------------------
           CURRENT NUMBER
        ------------------------------------------------- */

    if (FLDom.projectCurrent) {
      FLDom.projectCurrent.textContent = String(index + 1).padStart(2, "0");
    }

    /* -------------------------------------------------
           PREVIOUS / NEXT AVAILABILITY
        ------------------------------------------------- */

    if (FLDom.projectPrevious) {
      FLDom.projectPrevious.disabled = index <= 0;
    }

    if (FLDom.projectNext) {
      FLDom.projectNext.disabled = index >= projectOrder.length - 1;
    }

    FLUpdateProjectProgress(projectId);

    return true;
  }

  /* =====================================================
       28 — FALLBACK PROJECT PROGRESS

       animations.js replaces this with continuous progress
       during scroll.

       This discrete version remains useful for reduced
       motion and non-GSAP fallback behaviour.
       ===================================================== */

  function FLUpdateProjectProgress(projectId) {
    const order = FLGetProjectOrder();

    const index = FLGetProjectIndex(projectId);

    if (!FLDom.projectProgressFill || index < 0) {
      return;
    }

    const denominator = Math.max(order.length - 1, 1);

    const percentage = (index / denominator) * 100;

    const mobile = window.matchMedia("(max-width: 720px)").matches;

    if (mobile) {
      FLDom.projectProgressFill.style.width = `${percentage}%`;

      FLDom.projectProgressFill.style.height = "100%";
    } else {
      FLDom.projectProgressFill.style.height = `${percentage}%`;

      FLDom.projectProgressFill.style.width = "100%";
    }
  }

  /* =====================================================
       29 — CHANGE PROJECT

       animations.js gets first opportunity so project
       clicks can move through the exact same scroll timeline
       used by manual scrolling.

       Important:
       this function does NOT call itself through FLSite.
       ===================================================== */

  function FLChangeProject(projectId) {
    if (!projectId || !window.getFLProject?.(projectId)) {
      return false;
    }

    if (window.FLAnimations?.changeProject) {
      const handled = window.FLAnimations.changeProject(projectId);

      if (handled !== false) {
        return true;
      }
    }

    /* -------------------------------------------------
           FALLBACK
        ------------------------------------------------- */

    const changed = window.setActiveFLProject?.(projectId);

    FLUpdateProjectDisplay(projectId);

    return changed !== false;
  }

  /* =====================================================
       30 — NEXT PROJECT
       ===================================================== */

  function FLShowNextProject() {
    const current = window.getActiveFLProject?.();

    if (!current) {
      return false;
    }

    const currentIndex = FLGetProjectIndex(current.id);

    const order = FLGetProjectOrder();

    if (currentIndex < 0 || currentIndex >= order.length - 1) {
      return false;
    }

    return FLChangeProject(order[currentIndex + 1]);
  }

  /* =====================================================
       31 — PREVIOUS PROJECT
       ===================================================== */

  function FLShowPreviousProject() {
    const current = window.getActiveFLProject?.();

    if (!current) {
      return false;
    }

    const currentIndex = FLGetProjectIndex(current.id);

    const order = FLGetProjectOrder();

    if (currentIndex <= 0) {
      return false;
    }

    return FLChangeProject(order[currentIndex - 1]);
  }

  function FLNavigateProjectDirection(direction) {
    if (direction === "next") {
      return FLShowNextProject();
    }

    if (direction === "previous") {
      return FLShowPreviousProject();
    }

    return false;
  }

  /* =====================================================
       32 — PROJECT CONTROL EVENTS
       ===================================================== */

  function FLHandleProjectMarker(event) {
    event.preventDefault();

    event.stopPropagation();

    const projectId = event.currentTarget.dataset.projectJump;

    if (!projectId) {
      return;
    }

    FLChangeProject(projectId);
  }

  function FLHandleProjectPrevious(event) {
    event.preventDefault();

    event.stopPropagation();

    FLShowPreviousProject();
  }

  function FLHandleProjectNext(event) {
    event.preventDefault();

    event.stopPropagation();

    FLShowNextProject();
  }

  /* =====================================================
       33 — EXTERNAL PROJECT STATE EVENT

       projects.js owns the active project data.

       Whenever that data changes, update the interface.
       ===================================================== */

  function FLHandleProjectChange(event) {
    const projectId = event.detail?.projectId || event.detail?.project?.id;

    if (!projectId) {
      return;
    }

    FLUpdateProjectDisplay(projectId);
  }

  /* =====================================================
       34 — CONTACT PLACEHOLDERS
       ===================================================== */

  function FLInitialiseContactPlaceholders() {
    FLDom.contactLinks.forEach((link) => {
      const href = link.getAttribute("href");

      if (href === "#" || !href) {
        link.addEventListener("click", (event) => {
          event.preventDefault();

          event.stopPropagation();
        });
      }
    });
  }

  /* =====================================================
       35 — HEADER SCROLL STATE
       ===================================================== */

  function FLUpdateHeaderState() {
    FLDom.header?.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  /* =====================================================
       36 — ESCAPE KEY
       ===================================================== */

  function FLHandleEscape() {
    if (FLState.settingsOpen) {
      FLCloseSettings({
        returnFocus: true,
      });

      return true;
    }

    if (FLState.mobileNavOpen) {
      FLCloseMobileNav({
        returnFocus: true,
      });

      return true;
    }

    if (FLState.activeDiscipline) {
      FLCloseActiveDiscipline();

      return true;
    }

    return false;
  }

  /* =====================================================
       37 — KEYBOARD NAVIGATION
       ===================================================== */

  function FLHandleKeyboard(event) {
    const target = event.target;

    const typing =
      target instanceof HTMLElement &&
      (target.matches("input, textarea, select") || target.isContentEditable);

    if (typing) {
      return;
    }

    /* -------------------------------------------------
           ESCAPE
        ------------------------------------------------- */

    if (event.key === "Escape") {
      if (FLHandleEscape()) {
        event.preventDefault();
      }

      return;
    }

    /*
           If animation controller isn't available, leave
           native PageUp / PageDown behaviour untouched.
        */

    if (!window.FLAnimations) {
      return;
    }

    /* -------------------------------------------------
           PAGE DOWN
        ------------------------------------------------- */

    if (
      event.key === "PageDown" ||
      (event.key === "ArrowDown" && event.altKey)
    ) {
      event.preventDefault();

      FLAdvanceScene(FLState.currentScene);

      return;
    }

    /* -------------------------------------------------
           PAGE UP
        ------------------------------------------------- */

    if (event.key === "PageUp" || (event.key === "ArrowUp" && event.altKey)) {
      const previous = FLGetPreviousSceneName(FLState.currentScene);

      if (!previous) {
        return;
      }

      event.preventDefault();

      FLGoToScene(previous, {
        landing: previous === "welcome" ? "intro" : "ready",
      });
    }
  }

  /* =====================================================
       38 — SETTINGS / HEADER EVENTS
       ===================================================== */

  function FLInitialiseHeaderEvents() {
    FLDom.settingsToggle?.addEventListener("click", (event) => {
      event.preventDefault();

      event.stopPropagation();

      FLToggleSettings();
    });

    FLDom.settingsClose?.addEventListener("click", (event) => {
      event.preventDefault();

      FLCloseSettings({
        returnFocus: true,
      });
    });

    FLDom.navToggle?.addEventListener("click", (event) => {
      event.preventDefault();

      event.stopPropagation();

      FLToggleMobileNav();
    });

    /* -------------------------------------------------
           CLOSE FLOATING UI WHEN CLICKING OUTSIDE
        ------------------------------------------------- */

    document.addEventListener("click", (event) => {
      if (
        FLState.settingsOpen &&
        !FLDom.settingsPanel?.contains(event.target) &&
        !FLDom.settingsToggle?.contains(event.target)
      ) {
        FLCloseSettings();
      }

      if (
        FLState.mobileNavOpen &&
        !FLDom.mobileNav?.contains(event.target) &&
        !FLDom.navToggle?.contains(event.target)
      ) {
        FLCloseMobileNav();
      }
    });

    /* -------------------------------------------------
           HEADER APPEARANCE
        ------------------------------------------------- */

    window.addEventListener("scroll", FLUpdateHeaderState, {
      passive: true,
    });

    FLUpdateHeaderState();
  }

  /* =====================================================
       39 — LANGUAGE / ACCESSIBILITY EVENTS
       ===================================================== */

  function FLInitialisePreferenceEvents() {
    FLDom.languageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        FLApplyLanguage(button.dataset.language);
      });
    });

    FLDom.fontSizeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        FLApplyFontSize(button.dataset.fontSize);
      });
    });

    FLDom.reduceMotion?.addEventListener("change", (event) => {
      FLApplyReducedMotion(event.currentTarget.checked);
    });
  }

  /* =====================================================
       40 — SCENE EVENT BINDINGS
       ===================================================== */

  function FLInitialiseSceneEvents() {
    FLDom.sceneTargets.forEach((control) => {
      control.addEventListener("click", FLHandleSceneTargetClick);
    });

    FLDom.sceneContinue.forEach((control) => {
      control.addEventListener("click", FLHandleSceneContinue);
    });

    FLInitialiseSceneClickAdvance();

    FLInitialiseTouchGestures();
  }

  /* =====================================================
       41 — DISCIPLINE EVENT BINDINGS
       ===================================================== */

  function FLInitialiseDisciplineEvents() {
    FLDom.disciplineTriggers.forEach((trigger) => {
      trigger.addEventListener("click", FLHandleDisciplineTrigger);
    });

    FLInitialiseDisciplineOutsideClose();
  }

  /* =====================================================
       42 — PROJECT EVENT BINDINGS
       ===================================================== */

  function FLInitialiseProjectEvents() {
    FLDom.projectMarkers.forEach((marker) => {
      marker.addEventListener("click", FLHandleProjectMarker);
    });

    FLDom.projectPrevious?.addEventListener("click", FLHandleProjectPrevious);

    FLDom.projectNext?.addEventListener("click", FLHandleProjectNext);

    window.addEventListener("flProjectChange", FLHandleProjectChange);
  }

  /* =====================================================
       43 — HISTORY / HASH NAVIGATION
       ===================================================== */

  function FLHandleHistoryNavigation() {
    const target = FLHashToScene();

    if (!target) {
      return;
    }

    FLGoToScene(target, {
      landing: target === "welcome" ? "intro" : "ready",

      immediate: FLIsReducedMotion(),

      updateHash: false,
    });
  }

  function FLInitialiseHistoryEvents() {
    window.addEventListener("popstate", FLHandleHistoryNavigation);

    window.addEventListener("hashchange", FLHandleHistoryNavigation);
  }

  /* =====================================================
       44 — INITIAL PROJECT STATE
       ===================================================== */

  function FLInitialiseProjectState() {
    const activeProject = window.getActiveFLProject?.();

    if (activeProject?.id) {
      FLUpdateProjectDisplay(activeProject.id);

      return;
    }

    const firstProject = FLGetProjectOrder()[0];

    if (!firstProject) {
      return;
    }

    window.setActiveFLProject?.(firstProject);

    FLUpdateProjectDisplay(firstProject);
  }

  /* =====================================================
       45 — INITIAL DISCIPLINE STATE
       ===================================================== */

  function FLInitialiseDisciplineState() {
    FLState.activeDiscipline = null;

    FLDom.disciplinePlayground?.classList.remove("has-active");

    FLDom.disciplines.forEach((discipline) => {
      discipline.classList.remove("is-active");

      discipline
        .querySelector("[data-discipline-details]")
        ?.setAttribute("aria-hidden", "true");
    });

    FLDom.disciplineTriggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");
    });
  }

  /* =====================================================
       46 — INITIAL SCENE STATE
       ===================================================== */

  function FLInitialiseSceneState() {
    const hashScene = FLHashToScene();

    const initialScene = hashScene || "welcome";

    FLSetActiveScene(initialScene, {
      forceDispatch: false,
    });
  }

  /* =====================================================
       47 — PUBLIC SITE API

       animations.js uses this object to coordinate with
       main.js without duplicating application state.
       ===================================================== */

  window.FLSite = {
    /* -------------------------------------------------
           LANGUAGE
        ------------------------------------------------- */

    getLanguage() {
      return FLState.language;
    },

    applyLanguage(language, options = {}) {
      return FLApplyLanguage(language, options);
    },

    /* -------------------------------------------------
           SCENES
        ------------------------------------------------- */

    getCurrentScene() {
      return FLState.currentScene;
    },

    setActiveScene(sceneName, options = {}) {
      return FLSetActiveScene(sceneName, options);
    },

    goToScene(sceneName, options = {}) {
      return FLGoToScene(sceneName, options);
    },

    advanceScene(sceneName = FLState.currentScene) {
      return FLAdvanceScene(sceneName);
    },

    getNextSceneName(sceneName = FLState.currentScene) {
      return FLGetNextSceneName(sceneName);
    },

    getPreviousSceneName(sceneName = FLState.currentScene) {
      return FLGetPreviousSceneName(sceneName);
    },

    /* -------------------------------------------------
           DISCIPLINES
        ------------------------------------------------- */

    openDiscipline(disciplineId) {
      return FLOpenDiscipline(disciplineId);
    },

    closeActiveDiscipline() {
      return FLCloseActiveDiscipline();
    },

    /* -------------------------------------------------
           PROJECTS
        ------------------------------------------------- */

    changeProject(projectId) {
      return FLChangeProject(projectId);
    },

    showNextProject() {
      return FLShowNextProject();
    },

    showPreviousProject() {
      return FLShowPreviousProject();
    },

    navigateProjectDirection(direction) {
      return FLNavigateProjectDirection(direction);
    },

    updateProjectDisplay(projectId) {
      return FLUpdateProjectDisplay(projectId);
    },

    updateProjectProgress(projectId) {
      return FLUpdateProjectProgress(projectId);
    },

    /* -------------------------------------------------
           ACCESSIBILITY
        ------------------------------------------------- */

    isReducedMotion() {
      return FLIsReducedMotion();
    },
  };

  /* =====================================================
       48 — INITIALISE SITE
       ===================================================== */

  function FLInitialiseSite() {
    FLCacheDOM();

    FLLoadPreferences();

    FLInitialiseSceneState();

    FLInitialiseDisciplineState();

    FLInitialiseProjectState();

    FLInitialiseHeaderEvents();

    FLInitialisePreferenceEvents();

    FLInitialiseSceneEvents();

    FLInitialiseDisciplineEvents();

    FLInitialiseProjectEvents();

    FLInitialiseContactPlaceholders();

    FLInitialiseHistoryEvents();

    document.addEventListener("keydown", FLHandleKeyboard);

    /*
           Notify animations.js and any future modules that
           the application controller is fully available.
        */

    window.dispatchEvent(
      new CustomEvent("flSiteReady", {
        detail: {
          scene: FLState.currentScene,

          language: FLState.language,

          reducedMotion: FLState.reducedMotion,
        },
      }),
    );
  }

  /* =====================================================
       49 — RUN
       ===================================================== */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", FLInitialiseSite, {
      once: true,
    });
  } else {
    FLInitialiseSite();
  }
})();
