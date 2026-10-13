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

  const SCENE_HASHES = {
    welcome: "#welcome",
    about: "#about",
    services: "#what-i-do",
    projects: "#selected-work",
    contact: "#contact",
  };

  const HASH_SCENES = {
    "#welcome": "welcome",
    "#about": "about",
    "#what-i-do": "services",
    "#services": "services",
    "#selected-work": "projects",
    "#projects": "projects",
    "#recent-projects": "projects",
    "#contact": "contact",
  };

  /* =====================================================
     02 — SITE STATE
     ===================================================== */

  const FLState = {
    language: DEFAULTS.language,

    fontSize: DEFAULTS.fontSize,

    reducedMotion: DEFAULTS.reducedMotion,

    currentScene: "welcome",

    settingsOpen: false,

    mobileNavOpen: false,

    openDisciplineModal: null,

    openProjectModal: null,

    disciplineReturnFocus: null,

    projectReturnFocus: null,

    sceneObserver: null,

    historyNavigationPending: false,

    sceneNavigationPending: false,

    initialised: false,
  };

  /* =====================================================
     03 — DOM CACHE
     ===================================================== */

  const FLDom = {};

  function FLCacheDOM() {
    FLDom.root = document.documentElement;

    FLDom.body = document.body;

    FLDom.header = document.querySelector("[data-header]");

    FLDom.metaDescription = document.querySelector('meta[name="description"]');

    FLDom.liveRegion = document.querySelector("[data-live-region]");

    /* -------------------------------------------------
       SETTINGS
       ------------------------------------------------- */

    FLDom.settingsToggle = document.querySelector("[data-settings-toggle]");

    FLDom.settingsPanel = document.querySelector("[data-settings-panel]");

    FLDom.settingsClose = document.querySelector("[data-settings-close]");

    /* -------------------------------------------------
       MOBILE NAVIGATION
       ------------------------------------------------- */

    FLDom.navToggle = document.querySelector("[data-nav-toggle]");

    FLDom.mobileNav = document.querySelector("[data-mobile-nav]");

    /* -------------------------------------------------
       SCENES
       ------------------------------------------------- */

    FLDom.scenes = Array.from(document.querySelectorAll("[data-scene]"));

    FLDom.sceneTargets = Array.from(
      document.querySelectorAll("[data-scene-target]"),
    );

    /* -------------------------------------------------
       LANGUAGE + ACCESSIBILITY
       ------------------------------------------------- */

    FLDom.languageButtons = Array.from(
      document.querySelectorAll("[data-language]"),
    );

    FLDom.fontSizeButtons = Array.from(
      document.querySelectorAll("[data-font-size]"),
    );

    FLDom.reduceMotion = document.querySelector("[data-reduce-motion]");

    /* -------------------------------------------------
       DISCIPLINE MODALS
       ------------------------------------------------- */

    FLDom.disciplineTriggers = Array.from(
      document.querySelectorAll("[data-discipline-trigger]"),
    );

    FLDom.disciplineModals = Array.from(
      document.querySelectorAll("[data-discipline-modal]"),
    );

    FLDom.disciplineCloseButtons = Array.from(
      document.querySelectorAll("[data-discipline-close]"),
    );

    /* -------------------------------------------------
       PROJECT MODALS
       ------------------------------------------------- */

    FLDom.projectTriggers = Array.from(
      document.querySelectorAll("[data-project-open]"),
    );

    FLDom.projectModals = Array.from(
      document.querySelectorAll("[data-project-modal]"),
    );

    FLDom.projectCloseButtons = Array.from(
      document.querySelectorAll("[data-project-close]"),
    );

    /* -------------------------------------------------
       CONTACT
       ------------------------------------------------- */

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
     05 — LIVE REGION
     ===================================================== */

  function FLAnnounce(message) {
    if (!FLDom.liveRegion || !message) {
      return;
    }

    FLDom.liveRegion.textContent = "";

    window.requestAnimationFrame(() => {
      FLDom.liveRegion.textContent = message;
    });
  }

  /* =====================================================
     06 — TRANSLATION HELPER
     ===================================================== */

  function FLGetTranslation(language, key) {
    const dictionary = window.FLTranslations?.[language];

    if (!dictionary || !key) {
      return null;
    }

    if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
      const value = dictionary[key];

      return typeof value === "string" ? value : null;
    }

    const value = key.split(".").reduce((current, segment) => {
      return current && typeof current === "object"
        ? current[segment]
        : undefined;
    }, dictionary);

    return typeof value === "string" ? value : null;
  }

  /* =====================================================
     07 — LANGUAGE
     ===================================================== */

  function FLApplyLanguage(language, options = {}) {
    const { persist = true, dispatch = true, announce = false } = options;

    const safeLanguage = VALID_LANGUAGES.includes(language)
      ? language
      : DEFAULTS.language;

    FLState.language = safeLanguage;

    FLDom.root.lang = safeLanguage === "id" ? "id" : "en";

    FLDom.root.dataset.language = safeLanguage;

    /* -------------------------------------------------
       META
       ------------------------------------------------- */

    const translatedTitle = FLGetTranslation(safeLanguage, "meta.title");

    if (translatedTitle) {
      document.title = translatedTitle;
    }

    const translatedDescription = FLGetTranslation(
      safeLanguage,
      "meta.description",
    );

    if (translatedDescription && FLDom.metaDescription) {
      FLDom.metaDescription.setAttribute("content", translatedDescription);
    }

    /* -------------------------------------------------
       TEXT
       ------------------------------------------------- */

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;

      const translation = FLGetTranslation(safeLanguage, key);

      if (translation !== null) {
        element.textContent = translation;
      }
    });

    /* -------------------------------------------------
       PLACEHOLDERS
       ------------------------------------------------- */

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.dataset.i18nPlaceholder;

      const translation = FLGetTranslation(safeLanguage, key);

      if (translation !== null) {
        element.setAttribute("placeholder", translation);
      }
    });

    /* -------------------------------------------------
       ACCESSIBLE LABELS
       ------------------------------------------------- */

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      const key = element.dataset.i18nAriaLabel;

      const translation = FLGetTranslation(safeLanguage, key);

      if (translation !== null) {
        element.setAttribute("aria-label", translation);
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

    if (announce) {
      FLAnnounce(
        safeLanguage === "id"
          ? "Bahasa Indonesia dipilih."
          : "English selected.",
      );
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
     08 — FONT SIZE
     ===================================================== */

  function FLApplyFontSize(size, options = {}) {
    const { persist = true, dispatch = true, announce = false } = options;

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

    if (announce) {
      const sizeLabels = {
        small: "Small text selected.",
        default: "Default text selected.",
        large: "Large text selected.",
      };

      FLAnnounce(sizeLabels[safeSize]);
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
     09 — REDUCED MOTION
     ===================================================== */

  function FLApplyReducedMotion(enabled, options = {}) {
    const { persist = true, dispatch = true, announce = false } = options;

    const reduceMotion = Boolean(enabled);

    FLState.reducedMotion = reduceMotion;

    FLDom.root.dataset.reduceMotion = String(reduceMotion);

    if (FLDom.reduceMotion) {
      FLDom.reduceMotion.checked = reduceMotion;
    }

    if (persist) {
      FLWriteStorage(STORAGE_KEYS.reducedMotion, reduceMotion);
    }

    if (announce) {
      FLAnnounce(
        reduceMotion ? "Reduced motion enabled." : "Reduced motion disabled.",
      );
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
     10 — LOAD SAVED PREFERENCES
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
     11 — SETTINGS PANEL
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

    window.requestAnimationFrame(() => {
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
    if (FLState.settingsOpen) {
      return FLCloseSettings({
        returnFocus: true,
      });
    }

    return FLOpenSettings();
  }

  /* =====================================================
     12 — MOBILE NAVIGATION
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

    FLDom.navToggle?.setAttribute("aria-label", "Close navigation");

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

    FLDom.navToggle?.setAttribute("aria-label", "Open navigation");

    FLDom.body.classList.remove("nav-open");

    if (returnFocus) {
      FLDom.navToggle?.focus?.();
    }

    return true;
  }

  function FLToggleMobileNav() {
    if (FLState.mobileNavOpen) {
      return FLCloseMobileNav({
        returnFocus: true,
      });
    }

    return FLOpenMobileNav();
  }

  /* =====================================================
     13 — FLOATING UI
     ===================================================== */

  function FLCloseFloatingUI() {
    FLCloseSettings();

    FLCloseMobileNav();
  }

  /* =====================================================
     14 — SCENE HELPERS
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
     15 — ACTIVE SCENE
     ===================================================== */

  function FLSetActiveScene(sceneName, options = {}) {
    if (!SCENE_ORDER.includes(sceneName)) {
      return false;
    }

    const { forceDispatch = false } = options;

    const previousScene = FLState.currentScene;

    FLState.currentScene = sceneName;

    FLDom.scenes.forEach((scene) => {
      const active = scene.dataset.scene === sceneName;

      scene.dataset.sceneStatus = active ? "active" : "inactive";

      if (active) {
        scene.setAttribute("aria-current", "true");
      } else {
        scene.removeAttribute("aria-current");
      }
    });

    FLDom.sceneTargets.forEach((control) => {
      const target = control.dataset.sceneTarget;

      const navigationControl = Boolean(
        control.closest([".site-nav", "[data-mobile-nav]"].join(", ")),
      );

      if (!navigationControl) {
        return;
      }

      if (target === sceneName) {
        control.setAttribute("aria-current", "page");
      } else {
        control.removeAttribute("aria-current");
      }
    });

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
     16 — HASH HELPERS
     ===================================================== */

  function FLSceneToHash(sceneName) {
    return SCENE_HASHES[sceneName] || "#welcome";
  }

  function FLHashToScene(hash = window.location.hash) {
    const normalized = String(hash || "")
      .trim()
      .toLowerCase();

    return HASH_SCENES[normalized] || null;
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
     17 — SCENE NAVIGATION
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

      closeModals = true,
    } = options;

    FLCloseFloatingUI();

    if (closeModals) {
      FLCloseAllModals({
        returnFocus: false,
      });
    }

    FLState.sceneNavigationPending = true;

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

        window.setTimeout(
          () => {
            FLState.sceneNavigationPending = false;
          },
          FLIsReducedMotion() ? 0 : 700,
        );

        return true;
      }
    }

    const scene = FLGetSceneElement(sceneName);

    if (!scene) {
      FLState.sceneNavigationPending = false;

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

    window.setTimeout(
      () => {
        FLState.sceneNavigationPending = false;
      },
      FLIsReducedMotion() ? 0 : 500,
    );

    return true;
  }

  function FLAdvanceScene(sceneName = FLState.currentScene) {
    if (!SCENE_ORDER.includes(sceneName)) {
      return false;
    }

    if (FLState.openDisciplineModal || FLState.openProjectModal) {
      return false;
    }

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
      updateHash: true,
    });
  }

  /* =====================================================
     18 — SCENE TARGET CLICKS
     ===================================================== */

  function FLHandleSceneTargetClick(event) {
    const control = event.currentTarget;

    const target = control.dataset.sceneTarget;

    if (!target || !SCENE_ORDER.includes(target)) {
      return;
    }

    event.preventDefault();

    event.stopPropagation();

    FLGoToScene(target, {
      landing: target === "welcome" ? "intro" : "ready",

      updateHash: true,
    });
  }

  /* =====================================================
     19 — HISTORY NAVIGATION
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
     20 — INITIAL SCENE STATE
     ===================================================== */

  function FLInitialiseSceneState() {
    const hashScene = FLHashToScene();

    const initialScene = hashScene || "welcome";

    FLSetActiveScene(initialScene, {
      forceDispatch: false,
    });

    if (!hashScene) {
      FLUpdateHash("welcome", {
        replace: true,
      });

      return;
    }

    window.requestAnimationFrame(() => {
      const scene = FLGetSceneElement(initialScene);

      scene?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    });
  }

  /* =====================================================
     21 — SCROLL SCENE OBSERVER
     ===================================================== */

  function FLInitialiseSceneObserver() {
    if (!("IntersectionObserver" in window) || !FLDom.scenes.length) {
      return false;
    }

    FLState.sceneObserver?.disconnect?.();

    FLState.sceneObserver = new IntersectionObserver(
      (entries) => {
        if (
          FLState.sceneNavigationPending ||
          FLState.openDisciplineModal ||
          FLState.openProjectModal
        ) {
          return;
        }

        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleEntries.length) {
          return;
        }

        const sceneName = visibleEntries[0].target.dataset.scene;

        if (!sceneName || sceneName === FLState.currentScene) {
          return;
        }

        FLSetActiveScene(sceneName);

        FLUpdateHash(sceneName, {
          replace: true,
        });
      },
      {
        root: null,

        rootMargin: "-18% 0px -56% 0px",

        threshold: [0, 0.15, 0.35, 0.55],
      },
    );

    FLDom.scenes.forEach((scene) => {
      FLState.sceneObserver.observe(scene);
    });

    return true;
  }

  /* =====================================================
     22 — DIALOG HELPERS
     ===================================================== */

  function FLIsDialogOpen(dialog) {
    if (!dialog) {
      return false;
    }

    return dialog.open || dialog.hasAttribute("open");
  }

  function FLShowDialog(dialog) {
    if (!dialog) {
      return false;
    }

    if (FLIsDialogOpen(dialog)) {
      return true;
    }

    try {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }

      return true;
    } catch {
      dialog.setAttribute("open", "");

      return true;
    }
  }

  function FLCloseDialog(dialog) {
    if (!dialog) {
      return false;
    }

    if (!FLIsDialogOpen(dialog)) {
      return true;
    }

    try {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }

      return true;
    } catch {
      dialog.removeAttribute("open");

      return true;
    }
  }

  function FLUpdateModalLock() {
    const anyModalOpen = Boolean(
      FLState.openDisciplineModal || FLState.openProjectModal,
    );

    FLDom.body.classList.toggle("modal-open", anyModalOpen);

    FLDom.root.dataset.modalOpen = String(anyModalOpen);
  }

  function FLGetFocusableElements(container) {
    if (!container) {
      return [];
    }

    return Array.from(
      container.querySelectorAll(
        [
          "a[href]",
          "button:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])",
        ].join(","),
      ),
    ).filter((element) => {
      return !element.hasAttribute("hidden");
    });
  }

  function FLFocusFirstInDialog(dialog) {
    if (!dialog) {
      return;
    }

    window.requestAnimationFrame(() => {
      const focusable = FLGetFocusableElements(dialog);

      focusable[0]?.focus?.();
    });
  }

  /* =====================================================
     23 — DISCIPLINE MODAL HELPERS
     ===================================================== */

  function FLGetDisciplineModal(disciplineId) {
    if (!disciplineId) {
      return null;
    }

    return (
      FLDom.disciplineModals.find(
        (modal) => modal.dataset.disciplineModal === disciplineId,
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

  function FLSetDisciplineTriggerState(disciplineId, expanded) {
    const trigger = FLGetDisciplineTrigger(disciplineId);

    if (!trigger) {
      return;
    }

    trigger.setAttribute("aria-expanded", String(expanded));
  }

  /* =====================================================
     24 — OPEN DISCIPLINE MODAL
     ===================================================== */

  function FLOpenDiscipline(disciplineId, options = {}) {
    const { returnFocusElement = null } = options;

    const modal = FLGetDisciplineModal(disciplineId);

    const trigger = FLGetDisciplineTrigger(disciplineId);

    if (!modal) {
      return false;
    }

    if (FLState.openDisciplineModal === disciplineId) {
      return true;
    }

    FLCloseSettings();

    FLCloseMobileNav();

    FLCloseProjectModal(null, {
      returnFocus: false,
    });

    if (FLState.openDisciplineModal) {
      FLCloseActiveDiscipline({
        returnFocus: false,
      });
    }

    FLState.openDisciplineModal = disciplineId;

    FLState.disciplineReturnFocus =
      returnFocusElement || trigger || document.activeElement;

    FLSetDisciplineTriggerState(disciplineId, true);

    if (!FLShowDialog(modal)) {
      FLState.openDisciplineModal = null;

      FLSetDisciplineTriggerState(disciplineId, false);

      return false;
    }

    FLUpdateModalLock();

    FLFocusFirstInDialog(modal);

    window.dispatchEvent(
      new CustomEvent("flDisciplineModalChange", {
        detail: {
          discipline: disciplineId,

          open: true,
        },
      }),
    );

    return true;
  }

  /* =====================================================
     25 — CLOSE DISCIPLINE MODAL
     ===================================================== */

  function FLCloseActiveDiscipline(options = {}) {
    const { returnFocus = true, dispatch = true } = options;

    const disciplineId = FLState.openDisciplineModal;

    if (!disciplineId) {
      return false;
    }

    const modal = FLGetDisciplineModal(disciplineId);

    FLSetDisciplineTriggerState(disciplineId, false);

    FLState.openDisciplineModal = null;

    FLCloseDialog(modal);

    FLUpdateModalLock();

    const focusTarget = FLState.disciplineReturnFocus;

    FLState.disciplineReturnFocus = null;

    if (returnFocus && focusTarget instanceof HTMLElement) {
      window.requestAnimationFrame(() => {
        focusTarget.focus?.();
      });
    }

    if (dispatch) {
      window.dispatchEvent(
        new CustomEvent("flDisciplineModalChange", {
          detail: {
            discipline: disciplineId,

            open: false,
          },
        }),
      );
    }

    return true;
  }

  /* =====================================================
     26 — DISCIPLINE TRIGGER
     ===================================================== */

  function FLHandleDisciplineTrigger(event) {
    event.preventDefault();

    event.stopPropagation();

    const trigger = event.currentTarget;

    const disciplineId = trigger.dataset.disciplineTrigger;

    if (!disciplineId) {
      return;
    }

    FLOpenDiscipline(disciplineId, {
      returnFocusElement: trigger,
    });
  }

  function FLHandleDisciplineClose(event) {
    event.preventDefault();

    event.stopPropagation();

    FLCloseActiveDiscipline({
      returnFocus: true,
    });
  }

  /* =====================================================
     27 — DISCIPLINE DIALOG EVENTS
     ===================================================== */

  function FLInitialiseDisciplineDialogEvents() {
    FLDom.disciplineTriggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");

      trigger.addEventListener("click", FLHandleDisciplineTrigger);
    });

    FLDom.disciplineCloseButtons.forEach((button) => {
      button.addEventListener("click", FLHandleDisciplineClose);
    });

    FLDom.disciplineModals.forEach((modal) => {
      modal.addEventListener("cancel", (event) => {
        event.preventDefault();

        FLCloseActiveDiscipline({
          returnFocus: true,
        });
      });

      modal.addEventListener("click", (event) => {
        if (event.target !== modal) {
          return;
        }

        FLCloseActiveDiscipline({
          returnFocus: true,
        });
      });

      modal.addEventListener("close", () => {
        const disciplineId = modal.dataset.disciplineModal;

        if (FLState.openDisciplineModal === disciplineId) {
          FLState.openDisciplineModal = null;

          FLSetDisciplineTriggerState(disciplineId, false);

          FLUpdateModalLock();
        }
      });
    });
  }

  /* =====================================================
     28 — INITIAL DISCIPLINE STATE
     ===================================================== */

  function FLInitialiseDisciplineState() {
    FLState.openDisciplineModal = null;

    FLState.disciplineReturnFocus = null;

    FLDom.disciplineTriggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");
    });

    FLDom.disciplineModals.forEach((modal) => {
      if (modal.hasAttribute("open")) {
        FLCloseDialog(modal);
      }
    });
  }

  /* =====================================================
     29 — PROJECT MODAL LOOKUP
     ===================================================== */

  function FLGetProjectModal(projectId) {
    if (!projectId) {
      return null;
    }

    return (
      FLDom.projectModals.find(
        (modal) => modal.dataset.projectModal === projectId,
      ) || null
    );
  }

  function FLGetProjectTrigger(projectId) {
    if (!projectId) {
      return null;
    }

    return (
      FLDom.projectTriggers.find(
        (trigger) => trigger.dataset.projectOpen === projectId,
      ) || null
    );
  }

  function FLSetProjectTriggerState(projectId, expanded) {
    const trigger = FLGetProjectTrigger(projectId);

    if (!trigger) {
      return;
    }

    trigger.setAttribute("aria-expanded", String(expanded));
  }

  /* =====================================================
     30 — PROJECT ORDER
     ===================================================== */

  function FLGetProjectOrder() {
    return FLDom.projectTriggers
      .map((trigger) => trigger.dataset.projectOpen)
      .filter(Boolean);
  }

  function FLGetProjectIndex(projectId) {
    return FLGetProjectOrder().indexOf(projectId);
  }

  function FLGetNextProjectId(projectId) {
    const order = FLGetProjectOrder();

    const index = order.indexOf(projectId);

    if (index < 0 || index >= order.length - 1) {
      return null;
    }

    return order[index + 1];
  }

  function FLGetPreviousProjectId(projectId) {
    const order = FLGetProjectOrder();

    const index = order.indexOf(projectId);

    if (index <= 0) {
      return null;
    }

    return order[index - 1];
  }
  /* =====================================================
     31 — OPEN PROJECT MODAL
     ===================================================== */

  function FLOpenProjectModal(projectId, options = {}) {
    const { returnFocusElement = null } = options;

    const modal = FLGetProjectModal(projectId);

    const trigger = FLGetProjectTrigger(projectId);

    if (!modal) {
      return false;
    }

    if (FLState.openProjectModal === projectId) {
      return true;
    }

    FLCloseSettings();

    FLCloseMobileNav();

    FLCloseActiveDiscipline({
      returnFocus: false,
    });

    if (FLState.openProjectModal) {
      FLCloseProjectModal(FLState.openProjectModal, {
        returnFocus: false,
        dispatch: false,
      });
    }

    FLState.openProjectModal = projectId;

    FLState.projectReturnFocus =
      returnFocusElement || trigger || document.activeElement;

    FLSetProjectTriggerState(projectId, true);

    if (!FLShowDialog(modal)) {
      FLState.openProjectModal = null;

      FLSetProjectTriggerState(projectId, false);

      return false;
    }

    FLUpdateModalLock();

    FLFocusFirstInDialog(modal);

    window.dispatchEvent(
      new CustomEvent("flProjectModalChange", {
        detail: {
          projectId,
          open: true,
        },
      }),
    );

    return true;
  }

  /* =====================================================
     32 — CLOSE PROJECT MODAL
     ===================================================== */

  function FLCloseProjectModal(
    projectId = FLState.openProjectModal,
    options = {},
  ) {
    const { returnFocus = true, dispatch = true } = options;

    if (!projectId) {
      return false;
    }

    const modal = FLGetProjectModal(projectId);

    FLSetProjectTriggerState(projectId, false);

    if (FLState.openProjectModal === projectId) {
      FLState.openProjectModal = null;
    }

    FLCloseDialog(modal);

    FLUpdateModalLock();

    const focusTarget = FLState.projectReturnFocus;

    FLState.projectReturnFocus = null;

    if (returnFocus && focusTarget instanceof HTMLElement) {
      window.requestAnimationFrame(() => {
        focusTarget.focus?.();
      });
    }

    if (dispatch) {
      window.dispatchEvent(
        new CustomEvent("flProjectModalChange", {
          detail: {
            projectId,
            open: false,
          },
        }),
      );
    }

    return true;
  }

  /* =====================================================
     33 — CLOSE ALL MODALS
     ===================================================== */

  function FLCloseAllModals(options = {}) {
    const { returnFocus = false } = options;

    let closed = false;

    if (FLState.openDisciplineModal) {
      FLCloseActiveDiscipline({
        returnFocus,
      });

      closed = true;
    }

    if (FLState.openProjectModal) {
      FLCloseProjectModal(FLState.openProjectModal, {
        returnFocus,
      });

      closed = true;
    }

    FLUpdateModalLock();

    return closed;
  }

  /* =====================================================
     34 — PROJECT TRIGGER
     ===================================================== */

  function FLHandleProjectOpen(event) {
    event.preventDefault();

    event.stopPropagation();

    const trigger = event.currentTarget;

    const projectId = trigger.dataset.projectOpen;

    if (!projectId) {
      return;
    }

    FLOpenProjectModal(projectId, {
      returnFocusElement: trigger,
    });
  }

  function FLHandleProjectClose(event) {
    event.preventDefault();

    event.stopPropagation();

    FLCloseProjectModal(FLState.openProjectModal, {
      returnFocus: true,
    });
  }

  /* =====================================================
     35 — PROJECT DIALOG EVENTS
     ===================================================== */

  function FLInitialiseProjectDialogEvents() {
    FLDom.projectTriggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");

      trigger.addEventListener("click", FLHandleProjectOpen);
    });

    FLDom.projectCloseButtons.forEach((button) => {
      button.addEventListener("click", FLHandleProjectClose);
    });

    FLDom.projectModals.forEach((modal) => {
      modal.addEventListener("cancel", (event) => {
        event.preventDefault();

        FLCloseProjectModal(FLState.openProjectModal, {
          returnFocus: true,
        });
      });

      modal.addEventListener("click", (event) => {
        if (event.target !== modal) {
          return;
        }

        FLCloseProjectModal(FLState.openProjectModal, {
          returnFocus: true,
        });
      });

      modal.addEventListener("close", () => {
        const projectId = modal.dataset.projectModal;

        if (FLState.openProjectModal === projectId) {
          FLState.openProjectModal = null;

          FLSetProjectTriggerState(projectId, false);

          FLUpdateModalLock();
        }
      });
    });
  }

  /* =====================================================
     36 — INITIAL PROJECT STATE
     ===================================================== */

  function FLInitialiseProjectState() {
    FLState.openProjectModal = null;

    FLState.projectReturnFocus = null;

    FLDom.projectTriggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");
    });

    FLDom.projectModals.forEach((modal) => {
      if (modal.hasAttribute("open")) {
        FLCloseDialog(modal);
      }
    });
  }

  /* =====================================================
     37 — CHANGE PROJECT MODAL
     ===================================================== */

  function FLChangeProject(projectId) {
    if (!projectId) {
      return false;
    }

    const modal = FLGetProjectModal(projectId);

    if (!modal) {
      return false;
    }

    const current = FLState.openProjectModal;

    if (current === projectId) {
      return true;
    }

    if (current) {
      FLCloseProjectModal(current, {
        returnFocus: false,
        dispatch: false,
      });
    }

    return FLOpenProjectModal(projectId, {
      returnFocusElement: FLGetProjectTrigger(projectId),
    });
  }

  /* =====================================================
     38 — NEXT / PREVIOUS PROJECT
     ===================================================== */

  function FLShowNextProject() {
    const currentId = FLState.openProjectModal;

    if (!currentId) {
      return false;
    }

    const nextId = FLGetNextProjectId(currentId);

    if (!nextId) {
      return false;
    }

    return FLChangeProject(nextId);
  }

  function FLShowPreviousProject() {
    const currentId = FLState.openProjectModal;

    if (!currentId) {
      return false;
    }

    const previousId = FLGetPreviousProjectId(currentId);

    if (!previousId) {
      return false;
    }

    return FLChangeProject(previousId);
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
     39 — ACTIVE DIALOG
     ===================================================== */

  function FLGetActiveDialog() {
    if (FLState.openProjectModal) {
      return FLGetProjectModal(FLState.openProjectModal);
    }

    if (FLState.openDisciplineModal) {
      return FLGetDisciplineModal(FLState.openDisciplineModal);
    }

    return null;
  }

  /* =====================================================
     40 — FALLBACK FOCUS TRAP
     ===================================================== */

  function FLTrapDialogFocus(event) {
    if (event.key !== "Tab") {
      return false;
    }

    const dialog = FLGetActiveDialog();

    if (!dialog) {
      return false;
    }

    const focusable = FLGetFocusableElements(dialog);

    if (!focusable.length) {
      event.preventDefault();

      return true;
    }

    const first = focusable[0];

    const last = focusable[focusable.length - 1];

    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();

      last.focus();

      return true;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();

      first.focus();

      return true;
    }

    return false;
  }

  /* =====================================================
     41 — PLACEHOLDER LINKS
     ===================================================== */

  function FLMakePlaceholderLinkInert(link) {
    if (!link) {
      return false;
    }

    const href = link.getAttribute("href");

    if (href && href !== "#") {
      link.removeAttribute("aria-disabled");

      return false;
    }

    link.setAttribute("aria-disabled", "true");

    link.addEventListener("click", (event) => {
      event.preventDefault();

      event.stopPropagation();
    });

    return true;
  }

  function FLInitialiseContactPlaceholders() {
    FLDom.contactLinks.forEach((link) => {
      FLMakePlaceholderLinkInert(link);
    });
  }

  /* =====================================================
     42 — HEADER SCROLL STATE
     ===================================================== */

  function FLUpdateHeaderState() {
    FLDom.header?.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  /* =====================================================
     43 — INTERACTIVE TARGET CHECK
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
    "dialog",
    "[role='button']",
    "[contenteditable='true']",
    "[data-settings-panel]",
    "[data-mobile-nav]",
    "[data-no-scene-advance]",
    "[data-discipline-trigger]",
    "[data-project-open]",
    "[data-discipline-modal]",
    "[data-project-modal]",
    ".contact-link",
  ].join(",");

  function FLIsInteractiveTarget(target) {
    if (!(target instanceof Element)) {
      return false;
    }

    return Boolean(target.closest(FLInteractiveSelector));
  }

  function FLHasTextSelection() {
    const selection = window.getSelection?.()?.toString()?.trim();

    return Boolean(selection);
  }

  /* =====================================================
     44 — WELCOME CLICK-ANYWHERE

     Click-anywhere behaviour now belongs ONLY to the first
     landing experience. It no longer follows users through
     the rest of the portfolio.
     ===================================================== */

  function FLHandleWelcomeClickAdvance(event) {
    const scene = event.currentTarget;

    if (scene.dataset.scene !== "welcome") {
      return;
    }

    if (scene.dataset.sceneStatus !== "active") {
      return;
    }

    if (event.defaultPrevented || event.button !== 0) {
      return;
    }

    if (
      FLState.settingsOpen ||
      FLState.mobileNavOpen ||
      FLState.openDisciplineModal ||
      FLState.openProjectModal
    ) {
      return;
    }

    if (FLIsInteractiveTarget(event.target)) {
      return;
    }

    if (FLHasTextSelection()) {
      return;
    }

    FLAdvanceScene("welcome");
  }

  function FLInitialiseWelcomeClickAdvance() {
    const welcomeScene = FLGetSceneElement("welcome");

    if (!welcomeScene) {
      return false;
    }

    welcomeScene.dataset.clickAdvance = "true";

    welcomeScene.addEventListener("click", FLHandleWelcomeClickAdvance);

    FLDom.scenes
      .filter((scene) => scene !== welcomeScene)
      .forEach((scene) => {
        scene.dataset.clickAdvance = "false";
      });

    return true;
  }

  /* =====================================================
     45 — ESCAPE KEY ROUTING
     ===================================================== */

  function FLHandleEscape() {
    if (FLState.openProjectModal) {
      FLCloseProjectModal(FLState.openProjectModal, {
        returnFocus: true,
      });

      return true;
    }

    if (FLState.openDisciplineModal) {
      FLCloseActiveDiscipline({
        returnFocus: true,
      });

      return true;
    }

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

    return false;
  }

  /* =====================================================
     46 — KEYBOARD NAVIGATION
     ===================================================== */

  function FLHandleKeyboard(event) {
    const target = event.target;

    const typing =
      target instanceof HTMLElement &&
      (target.matches(["input", "textarea", "select"].join(", ")) ||
        target.isContentEditable);

    if (typing) {
      return;
    }

    if (event.key === "Escape") {
      if (FLHandleEscape()) {
        event.preventDefault();
      }

      return;
    }

    if (FLGetActiveDialog()) {
      FLTrapDialogFocus(event);

      if (
        FLState.openProjectModal &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        if (event.key === "ArrowRight") {
          if (FLShowNextProject()) {
            event.preventDefault();
          }

          return;
        }

        if (event.key === "ArrowLeft") {
          if (FLShowPreviousProject()) {
            event.preventDefault();
          }

          return;
        }
      }

      return;
    }

    if (FLState.settingsOpen || FLState.mobileNavOpen) {
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

        updateHash: true,
      });
    }
  }

  /* =====================================================
     47 — HEADER EVENTS
     ===================================================== */

  function FLInitialiseHeaderEvents() {
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

    FLDom.navToggle?.addEventListener("click", (event) => {
      event.preventDefault();

      event.stopPropagation();

      FLToggleMobileNav();
    });

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

    window.addEventListener("scroll", FLUpdateHeaderState, {
      passive: true,
    });

    FLUpdateHeaderState();
  }

  /* =====================================================
     48 — LANGUAGE + ACCESSIBILITY EVENTS
     ===================================================== */

  function FLInitialisePreferenceEvents() {
    FLDom.languageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        FLApplyLanguage(button.dataset.language, {
          announce: true,
        });
      });
    });

    FLDom.fontSizeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        FLApplyFontSize(button.dataset.fontSize, {
          announce: true,
        });
      });
    });

    FLDom.reduceMotion?.addEventListener("change", (event) => {
      FLApplyReducedMotion(event.currentTarget.checked, {
        announce: true,
      });
    });
  }

  /* =====================================================
     49 — SCENE EVENTS
     ===================================================== */

  function FLInitialiseSceneEvents() {
    FLDom.sceneTargets.forEach((control) => {
      control.addEventListener("click", FLHandleSceneTargetClick);
    });

    FLInitialiseWelcomeClickAdvance();

    FLInitialiseSceneObserver();
  }

  /* =====================================================
     50 — SCENE CHANGE CLEANUP
     ===================================================== */

  function FLHandleSceneChange(event) {
    const sceneName = event.detail?.scene;

    if (!sceneName) {
      return;
    }

    if (sceneName !== "services" && FLState.openDisciplineModal) {
      FLCloseActiveDiscipline({
        returnFocus: false,
      });
    }

    if (sceneName !== "projects" && FLState.openProjectModal) {
      FLCloseProjectModal(FLState.openProjectModal, {
        returnFocus: false,
      });
    }

    FLCloseFloatingUI();
  }

  function FLInitialiseGlobalSiteEvents() {
    window.addEventListener("flSceneChange", FLHandleSceneChange);
  }

  /* =====================================================
     51 — VIEWPORT CHANGE CLEANUP
     ===================================================== */

  function FLHandleViewportChange() {
    if (window.innerWidth > 960 && FLState.mobileNavOpen) {
      FLCloseMobileNav();
    }

    FLUpdateHeaderState();
  }

  function FLInitialiseViewportEvents() {
    let resizeFrame = null;

    window.addEventListener(
      "resize",
      () => {
        if (resizeFrame) {
          window.cancelAnimationFrame(resizeFrame);
        }

        resizeFrame = window.requestAnimationFrame(() => {
          resizeFrame = null;

          FLHandleViewportChange();
        });
      },
      {
        passive: true,
      },
    );
  }

  /* =====================================================
     52 — NORMALISE FLOATING UI
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

    FLDom.navToggle?.setAttribute("aria-label", "Open navigation");

    FLDom.body.classList.remove("nav-open");

    FLDom.body.classList.remove("modal-open");

    FLDom.root.dataset.modalOpen = "false";
  }

  /* =====================================================
     53 — MODAL INITIALISATION
     ===================================================== */

  function FLInitialiseModalEvents() {
    FLInitialiseDisciplineDialogEvents();

    FLInitialiseProjectDialogEvents();
  }

  /* =====================================================
     54 — PUBLIC SITE API
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
      return FLState.openDisciplineModal;
    },

    getOpenDisciplineModal() {
      return FLState.openDisciplineModal;
    },

    openDiscipline(disciplineId, options = {}) {
      return FLOpenDiscipline(disciplineId, options);
    },

    closeActiveDiscipline(options = {}) {
      return FLCloseActiveDiscipline(options);
    },

    /* -------------------------------------------------
       PROJECTS
       ------------------------------------------------- */

    getProjectOrder() {
      return FLGetProjectOrder();
    },

    getProjectIndex(projectId) {
      return FLGetProjectIndex(projectId);
    },

    getOpenProjectModal() {
      return FLState.openProjectModal;
    },

    openProject(projectId, options = {}) {
      return FLOpenProjectModal(projectId, options);
    },

    closeProject(projectId = FLState.openProjectModal, options = {}) {
      return FLCloseProjectModal(projectId, options);
    },

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

    /* -------------------------------------------------
       LEGACY PROJECT API

       Kept temporarily so animations.js / projects.js from
       the previous build do not immediately throw errors.
       These now map to the new project dialog system.
       ------------------------------------------------- */

    getOpenProjectStory() {
      return FLState.openProjectModal;
    },

    openProjectStory(projectId, options = {}) {
      return FLOpenProjectModal(projectId, options);
    },

    closeProjectStory(projectId = FLState.openProjectModal, options = {}) {
      return FLCloseProjectModal(projectId, options);
    },

    isProjectReadingMode() {
      return Boolean(FLState.openProjectModal);
    },

    /* -------------------------------------------------
       MODALS
       ------------------------------------------------- */

    closeAllModals(options = {}) {
      return FLCloseAllModals(options);
    },

    /* -------------------------------------------------
       UI
       ------------------------------------------------- */

    closeFloatingUI() {
      FLCloseFloatingUI();
    },

    announce(message) {
      FLAnnounce(message);
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

    FLCacheDOM();

    FLInitialiseFloatingUIState();

    FLLoadPreferences();

    FLInitialiseSceneState();

    FLInitialiseDisciplineState();

    FLInitialiseProjectState();

    /* -------------------------------------------------
       EVENTS
       ------------------------------------------------- */

    FLInitialiseHeaderEvents();

    FLInitialisePreferenceEvents();

    FLInitialiseSceneEvents();

    FLInitialiseModalEvents();

    FLInitialiseContactPlaceholders();

    FLInitialiseHistoryEvents();

    FLInitialiseGlobalSiteEvents();

    FLInitialiseViewportEvents();

    document.addEventListener("keydown", FLHandleKeyboard);

    /* -------------------------------------------------
       FINAL SYNCHRONISATION
       ------------------------------------------------- */

    FLUpdateHeaderState();

    FLUpdateModalLock();

    /* -------------------------------------------------
       SITE READY
       ------------------------------------------------- */

    window.dispatchEvent(
      new CustomEvent("flSiteReady", {
        detail: {
          scene: FLState.currentScene,

          language: FLState.language,

          fontSize: FLState.fontSize,

          reducedMotion: FLState.reducedMotion,

          openDisciplineModal: FLState.openDisciplineModal,

          openProjectModal: FLState.openProjectModal,

          /* Legacy compatibility */

          openProjectStory: FLState.openProjectModal,

          projectReadingMode: Boolean(FLState.openProjectModal),
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
