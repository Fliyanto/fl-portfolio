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

    initialised: false,

    historyNavigationPending: false,
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

    /*
     * Read-more links are cached separately so unfinished
     * project destinations such as Lega can remain inert
     * until a real project URL is supplied.
     */

    FLDom.projectReadMore = Array.from(
      document.querySelectorAll("[data-project-read-more]"),
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

      return value === null ? fallback : value;
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
     05 — TRANSLATION HELPER
     ===================================================== */

  function FLGetTranslation(language, key) {
    const dictionary = window.FLTranslations?.[language];

    if (!dictionary || !key) {
      return null;
    }

    /* -------------------------------------------------
       Flat dictionary support:

       { "nav.about": "About" }
       ------------------------------------------------- */

    if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
      const value = dictionary[key];

      return typeof value === "string" ? value : null;
    }

    /* -------------------------------------------------
       Nested dictionary support:

       { nav: { about: "About" } }
       ------------------------------------------------- */

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
      FLWriteStorage(STORAGE_KEYS.reducedMotion, reduceMotion);
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
    if (!FLDom.settingsPanel || FLState.settingsOpen) {
      return false;
    }

    FLCloseMobileNav();

    FLState.settingsOpen = true;

    FLDom.settingsPanel.hidden = false;

    FLDom.settingsPanel.classList.add("is-open");

    FLDom.settingsToggle?.setAttribute("aria-expanded", "true");

    requestAnimationFrame(() => {
      FLDom.settingsClose?.focus?.();
    });

    return true;
  }

  function FLCloseSettings(options = {}) {
    const { returnFocus = false } = options;

    if (!FLDom.settingsPanel || !FLState.settingsOpen) {
      return false;
    }

    FLState.settingsOpen = false;

    FLDom.settingsPanel.classList.remove("is-open");

    FLDom.settingsPanel.hidden = true;

    FLDom.settingsToggle?.setAttribute("aria-expanded", "false");

    if (returnFocus) {
      FLDom.settingsToggle?.focus?.();
    }

    return true;
  }

  function FLToggleSettings() {
    return FLState.settingsOpen
      ? FLCloseSettings({
          returnFocus: true,
        })
      : FLOpenSettings();
  }

  /* =====================================================
   11 — MOBILE NAVIGATION
   ===================================================== */

  function FLOpenMobileNav() {
    if (!FLDom.mobileNav || FLState.mobileNavOpen) {
      return false;
    }

    FLCloseSettings();

    FLState.mobileNavOpen = true;

    FLDom.mobileNav.hidden = false;

    FLDom.mobileNav.classList.add("is-open");

    FLDom.navToggle?.classList.add("is-open");

    FLDom.navToggle?.setAttribute("aria-expanded", "true");

    FLDom.body.classList.add("nav-open");

    return true;
  }

  function FLCloseMobileNav(options = {}) {
    const { returnFocus = false } = options;

    if (!FLDom.mobileNav || !FLState.mobileNavOpen) {
      return false;
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

    return true;
  }

  function FLToggleMobileNav() {
    return FLState.mobileNavOpen
      ? FLCloseMobileNav({
          returnFocus: true,
        })
      : FLOpenMobileNav();
  }

  /* =====================================================
   12 — CLOSE FLOATING UI
   ===================================================== */

  function FLCloseFloatingUI() {
    FLCloseSettings();

    FLCloseMobileNav();
  }

  /* =====================================================
   13 — SCENE HELPERS
   ===================================================== */

  function FLGetSceneElement(sceneName) {
    if (!sceneName) {
      return null;
    }

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
   14 — ACTIVE SCENE
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

      if (active) {
        scene.setAttribute("aria-current", "true");
      } else {
        scene.removeAttribute("aria-current");
      }
    });

    /* -------------------------------------------------
     HEADER + MOBILE NAV CURRENT STATE
     ------------------------------------------------- */

    FLDom.sceneTargets.forEach((control) => {
      const target = control.dataset.sceneTarget;

      const isNavigationControl = Boolean(
        control.closest(".site-nav, [data-mobile-nav]"),
      );

      if (!isNavigationControl) {
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
   15 — HASH HELPERS
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
    const normalized = String(hash || "")
      .trim()
      .toLowerCase();

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
    if (!SCENE_ORDER.includes(sceneName)) {
      return false;
    }

    const { replace = false } = options;

    const hash = FLSceneToHash(sceneName);

    if (window.location.hash === hash) {
      return true;
    }

    try {
      if (replace) {
        window.history.replaceState(null, "", hash);
      } else {
        window.history.pushState(null, "", hash);
      }

      return true;
    } catch {
      return false;
    }
  }

  /* =====================================================
   16 — SCENE NAVIGATION

   animations.js owns animated scroll positioning.

   main.js only communicates:
   - where we want to go
   - which landing state we want
   - whether movement should be immediate
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

    FLCloseFloatingUI();

    /* -------------------------------------------------
     ANIMATION CONTROLLER
     ------------------------------------------------- */

    if (window.FLAnimations?.goToScene) {
      const handled = window.FLAnimations.goToScene(sceneName, {
        landing,

        immediate: immediate || FLIsReducedMotion(),
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
     NATIVE FALLBACK
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
   17 — ADVANCE CURRENT SCENE
   ===================================================== */

  function FLAdvanceScene(sceneName = FLState.currentScene) {
    if (!SCENE_ORDER.includes(sceneName)) {
      return false;
    }

    /* -------------------------------------------------
     animations.js handles staged scenes such as
     Welcome before moving to the next scene.
     ------------------------------------------------- */

    if (window.FLAnimations?.advanceScene) {
      const handled = window.FLAnimations.advanceScene(sceneName);

      if (handled !== false) {
        return true;
      }
    }

    /* -------------------------------------------------
     FALLBACK
     ------------------------------------------------- */

    const nextScene = FLGetNextSceneName(sceneName);

    if (!nextScene) {
      return false;
    }

    return FLGoToScene(nextScene, {
      landing: "ready",
    });
  }
  /* =====================================================
   18 — NAVIGATION CONTROL CLICKS
   ===================================================== */

  function FLHandleSceneTargetClick(event) {
    const control = event.currentTarget;

    const target = control.dataset.sceneTarget;

    if (!target || !SCENE_ORDER.includes(target)) {
      return;
    }

    event.preventDefault();

    event.stopPropagation();

    const landing = target === "welcome" ? "intro" : "ready";

    FLGoToScene(target, {
      landing,

      updateHash: true,
    });
  }

  /* =====================================================
   19 — SECTION CONTINUE BUTTONS

   Welcome uses its dedicated data-welcome-continue
   animation hook, so these are for the remaining scenes.
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
   20 — INTERACTIVE TARGET CHECK
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

  /* =====================================================
   21 — CLICK-ANYWHERE SCENE ADVANCE

   Empty scene space can still act as an alternate
   progression method.

   Interactive content is excluded so opening cards,
   clicking links or using controls never advances
   the scene accidentally.
   ===================================================== */

  function FLInitialiseSceneClickAdvance() {
    FLDom.scenes.forEach((scene) => {
      const sceneName = scene.dataset.scene;

      if (sceneName === "contact") {
        scene.dataset.clickAdvance = "false";

        return;
      }

      scene.dataset.clickAdvance = "true";

      scene.addEventListener("click", (event) => {
        if (event.defaultPrevented) {
          return;
        }

        if (event.button !== 0) {
          return;
        }

        if (scene.dataset.sceneStatus !== "active") {
          return;
        }

        if (FLIsInteractiveTarget(event.target)) {
          return;
        }

        /* -----------------------------------------
             Ignore clicks made while selecting text.
             ----------------------------------------- */

        const selection = window.getSelection?.()?.toString()?.trim();

        if (selection) {
          return;
        }

        FLAdvanceScene(sceneName);
      });
    });
  }

  /* =====================================================
   22 — HISTORY NAVIGATION

   pushState does not fire hashchange itself, but browser
   Back / Forward can produce both popstate and hashchange.

   A tiny lock prevents duplicate scene navigation.
   ===================================================== */

  function FLHandleHistoryNavigation() {
    if (FLState.historyNavigationPending) {
      return;
    }

    const target = FLHashToScene();

    if (!target) {
      return;
    }

    FLState.historyNavigationPending = true;

    FLGoToScene(target, {
      landing: target === "welcome" ? "intro" : "ready",

      immediate: FLIsReducedMotion(),

      updateHash: false,
    });

    window.requestAnimationFrame(() => {
      FLState.historyNavigationPending = false;
    });
  }

  function FLInitialiseHistoryEvents() {
    window.addEventListener("popstate", FLHandleHistoryNavigation);

    window.addEventListener("hashchange", FLHandleHistoryNavigation);
  }

  /* =====================================================
   23 — INITIAL SCENE STATE
   ===================================================== */

  function FLInitialiseSceneState() {
    const hashScene = FLHashToScene();

    const initialScene = hashScene || "welcome";

    FLSetActiveScene(initialScene, {
      forceDispatch: false,
    });

    /* -------------------------------------------------
     Normalise the URL without creating a history step.

     If there is no recognised hash, Welcome becomes the
     canonical initial URL.
     ------------------------------------------------- */

    if (!hashScene) {
      FLUpdateHash("welcome", {
        replace: true,
      });
    }
  }

  /* =====================================================
   24 — DISCIPLINE HELPERS
   ===================================================== */

  function FLGetDiscipline(disciplineId) {
    if (!disciplineId) {
      return null;
    }

    return (
      FLDom.disciplines.find(
        (discipline) => discipline.dataset.discipline === disciplineId,
      ) || null
    );
  }

  function FLGetDisciplineTrigger(disciplineId) {
    if (!disciplineId) {
      return null;
    }

    return (
      FLDom.disciplineTriggers.find(
        (trigger) => trigger.dataset.disciplineTrigger === disciplineId,
      ) || null
    );
  }

  /* =====================================================
   25 — OPEN DISCIPLINE
   ===================================================== */

  function FLOpenDiscipline(disciplineId) {
    const discipline = FLGetDiscipline(disciplineId);

    if (!discipline) {
      return false;
    }

    const alreadyOpen = FLState.activeDiscipline === disciplineId;

    if (alreadyOpen) {
      return FLCloseActiveDiscipline();
    }

    FLState.activeDiscipline = disciplineId;

    FLDom.disciplinePlayground?.classList.add("has-active");

    /* -------------------------------------------------
     CARD STATE
     ------------------------------------------------- */

    FLDom.disciplines.forEach((item) => {
      const active = item.dataset.discipline === disciplineId;

      item.classList.toggle("is-active", active);

      const details = item.querySelector("[data-discipline-details]");

      if (details) {
        details.setAttribute("aria-hidden", String(!active));
      }
    });

    /* -------------------------------------------------
     TRIGGER STATE
     ------------------------------------------------- */

    FLDom.disciplineTriggers.forEach((trigger) => {
      const active = trigger.dataset.disciplineTrigger === disciplineId;

      trigger.setAttribute("aria-expanded", String(active));
    });

    /* -------------------------------------------------
     EVENT FOR animations.js
     ------------------------------------------------- */

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
   26 — CLOSE ACTIVE DISCIPLINE
   ===================================================== */

  function FLCloseActiveDiscipline() {
    if (!FLState.activeDiscipline) {
      return false;
    }

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
   27 — DISCIPLINE TRIGGER
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
   28 — DISCIPLINE OUTSIDE CLOSE

   Clicking elsewhere inside What I Do closes an expanded
   discipline before allowing any scene progression.
   ===================================================== */

  function FLInitialiseDisciplineOutsideClose() {
    document.addEventListener(
      "click",
      (event) => {
        if (!FLState.activeDiscipline) {
          return;
        }

        if (!(event.target instanceof Element)) {
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

        /* ---------------------------------------------
         Explicit navigation controls remain usable.
         --------------------------------------------- */

        if (
          event.target.closest(
            ["a", "button", "[data-scene-continue]"].join(","),
          )
        ) {
          return;
        }

        event.preventDefault();

        event.stopPropagation();

        FLCloseActiveDiscipline();
      },
      true,
    );
  }

  /* =====================================================
   29 — INITIAL DISCIPLINE STATE
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
   30 — PROJECT HELPERS
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

  function FLGetActiveProjectId() {
    const project = window.getActiveFLProject?.();

    return project?.id || null;
  }

  /* =====================================================
   31 — PROJECT PROGRESS

   projects.js owns:
   - active panel
   - active timeline marker
   - current counter
   - previous/next disabled state

   main.js only maintains the responsive timeline fill.
   ===================================================== */

  function FLUpdateProjectProgress(projectId) {
    const order = FLGetProjectOrder();

    const index = FLGetProjectIndex(projectId);

    if (!FLDom.projectProgressFill || index < 0) {
      return false;
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

    return true;
  }

  /* =====================================================
   32 — CHANGE PROJECT

   animations.js gets first opportunity because it owns
   the project transition / scroll timeline.

   If animations.js is unavailable, projects.js becomes
   the direct fallback.
   ===================================================== */

  function FLChangeProject(projectId) {
    if (!projectId) {
      return false;
    }

    const project = window.getFLProject?.(projectId);

    if (!project) {
      return false;
    }

    /* -------------------------------------------------
     ANIMATED ROUTE
     ------------------------------------------------- */

    if (window.FLAnimations?.changeProject) {
      const handled = window.FLAnimations.changeProject(projectId);

      if (handled !== false) {
        return true;
      }
    }

    /* -------------------------------------------------
     FALLBACK ROUTE
     ------------------------------------------------- */

    if (typeof window.setActiveFLProject === "function") {
      const result = window.setActiveFLProject(projectId);

      return result !== false;
    }

    return false;
  }

  /* =====================================================
   33 — NEXT PROJECT
   ===================================================== */

  function FLShowNextProject() {
    const currentId = FLGetActiveProjectId();

    if (!currentId) {
      return false;
    }

    const order = FLGetProjectOrder();

    const currentIndex = FLGetProjectIndex(currentId);

    if (currentIndex < 0 || currentIndex >= order.length - 1) {
      return false;
    }

    return FLChangeProject(order[currentIndex + 1]);
  }

  /* =====================================================
   34 — PREVIOUS PROJECT
   ===================================================== */

  function FLShowPreviousProject() {
    const currentId = FLGetActiveProjectId();

    if (!currentId) {
      return false;
    }

    const order = FLGetProjectOrder();

    const currentIndex = FLGetProjectIndex(currentId);

    if (currentIndex <= 0) {
      return false;
    }

    return FLChangeProject(order[currentIndex - 1]);
  }

  /* =====================================================
   35 — PROJECT DIRECTION
   ===================================================== */

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
   36 — PROJECT MARKER CLICK
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

  /* =====================================================
   37 — PROJECT PREVIOUS CONTROL
   ===================================================== */

  function FLHandleProjectPrevious(event) {
    event.preventDefault();

    event.stopPropagation();

    FLShowPreviousProject();
  }

  /* =====================================================
   38 — PROJECT NEXT CONTROL
   ===================================================== */

  function FLHandleProjectNext(event) {
    event.preventDefault();

    event.stopPropagation();

    FLShowNextProject();
  }

  /* =====================================================
   39 — PROJECT STATE EVENT

   projects.js dispatches flProjectChange whenever the
   canonical active project changes.

   We deliberately do not retoggle panels or markers here.
   ===================================================== */

  function FLHandleProjectChange(event) {
    const projectId =
      event.detail?.projectId ||
      event.detail?.project?.id ||
      FLGetActiveProjectId();

    if (!projectId) {
      return;
    }

    FLUpdateProjectProgress(projectId);
  }

  /* =====================================================
   40 — INITIAL PROJECT STATE
   ===================================================== */

  function FLInitialiseProjectState() {
    const order = FLGetProjectOrder();

    if (!order.length) {
      return false;
    }

    const currentId = FLGetActiveProjectId();

    if (currentId) {
      FLUpdateProjectProgress(currentId);

      return true;
    }

    const firstProject = order[0];

    if (typeof window.setActiveFLProject === "function") {
      window.setActiveFLProject(firstProject);
    }

    FLUpdateProjectProgress(firstProject);

    return true;
  }

  /* =====================================================
   41 — PROJECT PROGRESS RESIZE SYNC

   The rail changes orientation at 720px, so recalculate
   width / height whenever the responsive breakpoint moves.
   ===================================================== */

  function FLSyncProjectProgress() {
    const projectId = FLGetActiveProjectId();

    if (!projectId) {
      return;
    }

    FLUpdateProjectProgress(projectId);
  }

  /* =====================================================
   42 — PLACEHOLDER LINKS

   Project and contact destinations may temporarily use "#".
   Those links should remain visibly present without jumping
   the portfolio back to the top of the page.
   ===================================================== */

  function FLMakePlaceholderLinkInert(link) {
    if (!link) {
      return false;
    }

    const href = link.getAttribute("href");

    if (href !== "#" && href) {
      link.removeAttribute("aria-disabled");

      return false;
    }

    link.addEventListener("click", (event) => {
      event.preventDefault();

      event.stopPropagation();
    });

    link.setAttribute("aria-disabled", "true");

    return true;
  }

  /* -------------------------------------------------
   PROJECT READ-MORE PLACEHOLDERS

   Lega currently uses this state until its live project
   destination is ready. The same protection works for any
   future project that temporarily has no destination.
   ------------------------------------------------- */

  function FLInitialiseProjectPlaceholders() {
    FLDom.projectReadMore.forEach((link) => {
      FLMakePlaceholderLinkInert(link);
    });
  }

  /* -------------------------------------------------
   CONTACT PLACEHOLDERS
   ------------------------------------------------- */

  function FLInitialiseContactPlaceholders() {
    FLDom.contactLinks.forEach((link) => {
      FLMakePlaceholderLinkInert(link);
    });
  }

  /* =====================================================
   43 — HEADER SCROLL STATE
   ===================================================== */

  function FLUpdateHeaderState() {
    FLDom.header?.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  /* =====================================================
   44 — ESCAPE KEY ROUTING
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
   45 — KEYBOARD NAVIGATION
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

    /* -------------------------------------------------
     Let the browser keep standard keyboard scrolling
     if the animation controller is unavailable.
     ------------------------------------------------- */

    if (!window.FLAnimations) {
      return;
    }

    /* -------------------------------------------------
     PAGE DOWN / ALT + DOWN
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
     PAGE UP / ALT + UP
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
   46 — HEADER EVENTS
   ===================================================== */

  function FLInitialiseHeaderEvents() {
    /* -------------------------------------------------
     SETTINGS
     ------------------------------------------------- */

    FLDom.settingsToggle?.addEventListener("click", (event) => {
      event.preventDefault();

      event.stopPropagation();

      FLToggleSettings();
    });

    FLDom.settingsClose?.addEventListener("click", (event) => {
      event.preventDefault();

      event.stopPropagation();

      FLCloseSettings({
        returnFocus: true,
      });
    });

    /* -------------------------------------------------
     MOBILE NAV
     ------------------------------------------------- */

    FLDom.navToggle?.addEventListener("click", (event) => {
      event.preventDefault();

      event.stopPropagation();

      FLToggleMobileNav();
    });

    /* -------------------------------------------------
     CLICK OUTSIDE FLOATING UI
     ------------------------------------------------- */

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

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
     HEADER SCROLL APPEARANCE
     ------------------------------------------------- */

    window.addEventListener("scroll", FLUpdateHeaderState, {
      passive: true,
    });

    FLUpdateHeaderState();
  }

  /* =====================================================
   47 — LANGUAGE + ACCESSIBILITY EVENTS
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
   48 — SCENE EVENT BINDINGS

   Important:

   Next buttons also contain data-scene-target for semantic
   destination information.

   They must only use the Continue handler, otherwise one
   click would trigger both direct navigation and scene
   advancement.
   ===================================================== */

  function FLInitialiseSceneEvents() {
    FLDom.sceneTargets.forEach((control) => {
      if (control.hasAttribute("data-scene-continue")) {
        return;
      }

      control.addEventListener("click", FLHandleSceneTargetClick);
    });

    FLDom.sceneContinue.forEach((control) => {
      control.addEventListener("click", FLHandleSceneContinue);
    });

    FLInitialiseSceneClickAdvance();
  }

  /* =====================================================
   49 — DISCIPLINE EVENT BINDINGS
   ===================================================== */

  function FLInitialiseDisciplineEvents() {
    FLDom.disciplineTriggers.forEach((trigger) => {
      trigger.addEventListener("click", FLHandleDisciplineTrigger);
    });

    FLInitialiseDisciplineOutsideClose();
  }

  /* =====================================================
   50 — PROJECT EVENT BINDINGS
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
   51 — SCENE CHANGE CLEANUP
   ===================================================== */

  function FLHandleSceneChange(event) {
    const sceneName = event.detail?.scene;

    if (!sceneName) {
      return;
    }

    /* -------------------------------------------------
     Expanded What I Do cards should not remain open
     after leaving the section.
     ------------------------------------------------- */

    if (sceneName !== "services" && FLState.activeDiscipline) {
      FLCloseActiveDiscipline();
    }

    /* -------------------------------------------------
     Floating header UI should never persist between
     major scenes.
     ------------------------------------------------- */

    FLCloseFloatingUI();
  }

  function FLInitialiseGlobalSiteEvents() {
    window.addEventListener("flSceneChange", FLHandleSceneChange);
  }

  /* =====================================================
   52 — RESPONSIVE PROJECT PROGRESS SYNC

   The project rail changes:

   desktop = vertical
   mobile  = horizontal

   Recalculate whenever viewport dimensions change.
   ===================================================== */

  let FLResizeFrame = null;

  function FLHandleViewportResize() {
    if (FLResizeFrame) {
      window.cancelAnimationFrame(FLResizeFrame);
    }

    FLResizeFrame = window.requestAnimationFrame(() => {
      FLResizeFrame = null;

      FLSyncProjectProgress();
    });
  }

  function FLInitialiseResizeEvents() {
    window.addEventListener("resize", FLHandleViewportResize, {
      passive: true,
    });
  }

  /* =====================================================
   53 — NORMALISE FLOATING UI
   ===================================================== */

  function FLInitialiseFloatingUIState() {
    FLState.settingsOpen = false;

    FLState.mobileNavOpen = false;

    if (FLDom.settingsPanel) {
      FLDom.settingsPanel.hidden = true;

      FLDom.settingsPanel.classList.remove("is-open");
    }

    FLDom.settingsToggle?.setAttribute("aria-expanded", "false");

    if (FLDom.mobileNav) {
      FLDom.mobileNav.hidden = true;

      FLDom.mobileNav.classList.remove("is-open");
    }

    FLDom.navToggle?.classList.remove("is-open");

    FLDom.navToggle?.setAttribute("aria-expanded", "false");

    FLDom.body.classList.remove("nav-open");
  }

  /* =====================================================
   54 — PUBLIC SITE API

   animations.js communicates through this object instead
   of duplicating application state.
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
     FONT SIZE
     ------------------------------------------------- */

    getFontSize() {
      return FLState.fontSize;
    },

    applyFontSize(size, options = {}) {
      return FLApplyFontSize(size, options);
    },

    /* -------------------------------------------------
     REDUCED MOTION
     ------------------------------------------------- */

    isReducedMotion() {
      return FLIsReducedMotion();
    },

    applyReducedMotion(enabled, options = {}) {
      return FLApplyReducedMotion(enabled, options);
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

    getActiveDiscipline() {
      return FLState.activeDiscipline;
    },

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

    updateProjectProgress(projectId) {
      return FLUpdateProjectProgress(projectId);
    },

    /* -------------------------------------------------
     UI
     ------------------------------------------------- */

    closeFloatingUI() {
      FLCloseFloatingUI();
    },
  };
  /* =====================================================
   55 — INITIALISE SITE
   ===================================================== */

  function FLInitialiseSite() {
    if (FLState.initialised) {
      return;
    }

    FLState.initialised = true;

    /* -------------------------------------------------
     CACHE + BASE STATE
     ------------------------------------------------- */

    FLCacheDOM();

    FLInitialiseFloatingUIState();

    FLLoadPreferences();

    FLInitialiseSceneState();

    FLInitialiseDisciplineState();

    FLInitialiseProjectState();

    /* -------------------------------------------------
     UI EVENTS
     ------------------------------------------------- */

    FLInitialiseHeaderEvents();

    FLInitialisePreferenceEvents();

    FLInitialiseSceneEvents();

    FLInitialiseDisciplineEvents();

    FLInitialiseProjectEvents();

    /*
     * Keep unfinished project destinations inert until
     * their final URLs are supplied.
     */

    FLInitialiseProjectPlaceholders();

    FLInitialiseContactPlaceholders();

    FLInitialiseHistoryEvents();

    FLInitialiseGlobalSiteEvents();

    FLInitialiseResizeEvents();

    document.addEventListener("keydown", FLHandleKeyboard);

    /* -------------------------------------------------
     FINAL SYNCHRONISATION
     ------------------------------------------------- */

    FLSyncProjectProgress();

    FLUpdateHeaderState();

    /* -------------------------------------------------
     SITE READY EVENT

     animations.js can now safely build ScrollTriggers
     knowing that application state and UI controls exist.
     ------------------------------------------------- */

    window.dispatchEvent(
      new CustomEvent("flSiteReady", {
        detail: {
          scene: FLState.currentScene,

          language: FLState.language,

          fontSize: FLState.fontSize,

          reducedMotion: FLState.reducedMotion,
        },
      }),
    );
  }

  /* =====================================================
   56 — RUN
   ===================================================== */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", FLInitialiseSite, {
      once: true,
    });
  } else {
    FLInitialiseSite();
  }
})();
