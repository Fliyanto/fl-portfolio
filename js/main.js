(() => {
  "use strict";

  const SCENE_ORDER = ["welcome", "about", "services", "projects", "contact"];

  const STORAGE_KEYS = {
    language: "flPortfolio.language",
    fontSize: "flPortfolio.fontSize",
    reducedMotion: "flPortfolio.reducedMotion",
    theme: "fl-theme",
    legacyTheme: "flPortfolio.theme",
  };

  const DEFAULTS = {
    language: "en",
    fontSize: "default",
    reducedMotion: false,
    theme: "light",
  };

  const VALID_LANGUAGES = ["en", "id"];
  const VALID_FONT_SIZES = ["small", "default", "large"];
  const VALID_THEMES = ["light", "dark", "contrast"];

  const THEME_META_COLOURS = {
    light: "#eee7dd",
    dark: "#171715",
    contrast: "#000000",
  };

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

  const INTERACTIVE_SELECTOR = [
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
  ].join(", ");

  const FLState = {
    language: DEFAULTS.language,
    fontSize: DEFAULTS.fontSize,
    reducedMotion: DEFAULTS.reducedMotion,
    theme: DEFAULTS.theme,
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
    sceneNavigationTimer: null,
    initialised: false,
  };

  const FLDom = {};

  function FLCacheDOM() {
    FLDom.root = document.documentElement;
    FLDom.body = document.body;
    FLDom.header = document.querySelector("[data-header]");
    FLDom.metaDescription = document.querySelector('meta[name="description"]');
    FLDom.metaThemeColour = document.querySelector('meta[name="theme-color"]');
    FLDom.liveRegion = document.querySelector("[data-live-region]");
    FLDom.settingsToggle = document.querySelector("[data-settings-toggle]");
    FLDom.settingsPanel = document.querySelector("[data-settings-panel]");
    FLDom.settingsClose = document.querySelector("[data-settings-close]");
    FLDom.navToggle = document.querySelector("[data-nav-toggle]");
    FLDom.mobileNav = document.querySelector("[data-mobile-nav]");
    FLDom.scenes = Array.from(document.querySelectorAll("[data-scene]"));
    FLDom.sceneTargets = Array.from(
      document.querySelectorAll("[data-scene-target]"),
    );
    FLDom.languageButtons = Array.from(
      document.querySelectorAll("[data-language]"),
    );
    FLDom.fontSizeButtons = Array.from(
      document.querySelectorAll("[data-font-size]"),
    );
    FLDom.reduceMotion = document.querySelector("[data-reduce-motion]");
    FLDom.themeControls = document.querySelector("[data-theme-controls]");
    FLDom.themeButtons = Array.from(
      document.querySelectorAll("[data-theme-option]"),
    );
    FLDom.disciplineTriggers = Array.from(
      document.querySelectorAll("[data-discipline-trigger]"),
    );
    FLDom.disciplineModals = Array.from(
      document.querySelectorAll("[data-discipline-modal]"),
    );
    FLDom.disciplineCloseButtons = Array.from(
      document.querySelectorAll("[data-discipline-close]"),
    );
    FLDom.projectTriggers = Array.from(
      document.querySelectorAll("[data-project-open]"),
    );
    FLDom.projectModals = Array.from(
      document.querySelectorAll("[data-project-modal]"),
    );
    FLDom.projectCloseButtons = Array.from(
      document.querySelectorAll("[data-project-close]"),
    );
    FLDom.contactLinks = Array.from(
      document.querySelectorAll("[data-contact]"),
    );
  }

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

  function FLRemoveStorage(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function FLAnnounce(message) {
    if (!FLDom.liveRegion || !message) {
      return;
    }

    FLDom.liveRegion.textContent = "";

    window.requestAnimationFrame(() => {
      FLDom.liveRegion.textContent = message;
    });
  }

  function FLGetTranslation(language, key) {
    const dictionary = window.FLTranslations?.[language];

    if (!dictionary || !key) {
      return null;
    }

    if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
      const directValue = dictionary[key];

      return typeof directValue === "string" ? directValue : null;
    }

    const value = key.split(".").reduce((current, segment) => {
      if (!current || typeof current !== "object") {
        return undefined;
      }

      return current[segment];
    }, dictionary);

    return typeof value === "string" ? value : null;
  }

  function FLApplyLanguage(language, options = {}) {
    const { persist = true, dispatch = true, announce = false } = options;

    const safeLanguage = VALID_LANGUAGES.includes(language)
      ? language
      : DEFAULTS.language;

    FLState.language = safeLanguage;
    FLDom.root.lang = safeLanguage === "id" ? "id" : "en";
    FLDom.root.dataset.language = safeLanguage;

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

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const translation = FLGetTranslation(safeLanguage, element.dataset.i18n);

      if (translation !== null) {
        element.textContent = translation;
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const translation = FLGetTranslation(
        safeLanguage,
        element.dataset.i18nPlaceholder,
      );

      if (translation !== null) {
        element.setAttribute("placeholder", translation);
      }
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      const translation = FLGetTranslation(
        safeLanguage,
        element.dataset.i18nAriaLabel,
      );

      if (translation !== null) {
        element.setAttribute("aria-label", translation);
      }
    });

    FLDom.languageButtons.forEach((button) => {
      const active = button.dataset.language === safeLanguage;

      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    FLUpdateNavigationToggleLabel();

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
      const labels =
        FLState.language === "id"
          ? {
              small: "Ukuran teks kecil dipilih.",
              default: "Ukuran teks normal dipilih.",
              large: "Ukuran teks besar dipilih.",
            }
          : {
              small: "Small text selected.",
              default: "Default text selected.",
              large: "Large text selected.",
            };

      FLAnnounce(labels[safeSize]);
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
        FLState.language === "id"
          ? reduceMotion
            ? "Gerakan dikurangi."
            : "Gerakan normal diaktifkan."
          : reduceMotion
            ? "Reduced motion enabled."
            : "Reduced motion disabled.",
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

  function FLGetThemeLabel(theme, language = FLState.language) {
    const labels = {
      en: {
        light: "Light theme selected.",
        dark: "Dark theme selected.",
        contrast: "High contrast mode selected.",
      },
      id: {
        light: "Tema terang dipilih.",
        dark: "Tema gelap dipilih.",
        contrast: "Mode kontras tinggi dipilih.",
      },
    };

    return (labels[language] || labels.en)[theme] || labels.en.light;
  }

  function FLApplyTheme(theme, options = {}) {
    const { persist = true, dispatch = true, announce = false } = options;

    const safeTheme = VALID_THEMES.includes(theme) ? theme : DEFAULTS.theme;

    FLState.theme = safeTheme;
    FLDom.root.dataset.theme = safeTheme;
    FLDom.root.dataset.highContrast = String(safeTheme === "contrast");

    FLDom.themeButtons.forEach((button) => {
      const active = button.dataset.themeOption === safeTheme;

      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    FLDom.metaThemeColour?.setAttribute(
      "content",
      THEME_META_COLOURS[safeTheme] || THEME_META_COLOURS.light,
    );

    if (persist) {
      FLWriteStorage(STORAGE_KEYS.theme, safeTheme);
      FLRemoveStorage(STORAGE_KEYS.legacyTheme);
    }

    if (announce) {
      FLAnnounce(FLGetThemeLabel(safeTheme));
    }

    if (dispatch) {
      window.dispatchEvent(
        new CustomEvent("flThemeChange", {
          detail: {
            theme: safeTheme,
            highContrast: safeTheme === "contrast",
          },
        }),
      );
    }

    return safeTheme;
  }

  function FLGetTheme() {
    return FLState.theme;
  }

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

    const savedTheme =
      FLReadStorage(STORAGE_KEYS.theme, null) ||
      FLReadStorage(STORAGE_KEYS.legacyTheme, null) ||
      FLDom.root.dataset.theme ||
      DEFAULTS.theme;

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

    FLApplyTheme(savedTheme, {
      persist: false,
      dispatch: false,
    });
  }

  function FLIsFinePointer() {
    return Boolean(
      window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches,
    );
  }

  function FLIsMobileLayout() {
    return window.innerWidth <= 960;
  }

  function FLGetNavigationToggleLabel() {
    if (FLState.language === "id") {
      return FLState.mobileNavOpen ? "Tutup navigasi" : "Buka navigasi";
    }

    return FLState.mobileNavOpen ? "Close navigation" : "Open navigation";
  }

  function FLUpdateNavigationToggleLabel() {
    FLDom.navToggle?.setAttribute("aria-label", FLGetNavigationToggleLabel());
  }

  function FLOpenSettings() {
    if (!FLDom.settingsPanel || FLState.settingsOpen) {
      return false;
    }

    FLCloseMobileNav();

    FLState.settingsOpen = true;
    FLDom.settingsPanel.hidden = false;
    FLDom.settingsPanel.setAttribute("aria-hidden", "false");
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
    FLDom.settingsPanel.setAttribute("aria-hidden", "true");

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

  function FLOpenMobileNav() {
    if (!FLDom.mobileNav || FLState.mobileNavOpen) {
      return false;
    }

    FLCloseSettings();

    FLState.mobileNavOpen = true;
    FLDom.mobileNav.hidden = false;
    FLDom.mobileNav.setAttribute("aria-hidden", "false");
    FLDom.mobileNav.classList.add("is-open");

    FLDom.navToggle?.classList.add("is-open");
    FLDom.navToggle?.setAttribute("aria-expanded", "true");

    FLDom.body.classList.add("nav-open");
    FLDom.root.dataset.navOpen = "true";

    FLUpdateNavigationToggleLabel();

    window.requestAnimationFrame(() => {
      FLDom.mobileNav?.querySelector("[data-scene-target]")?.focus?.();
    });

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
    FLDom.mobileNav.setAttribute("aria-hidden", "true");

    FLDom.navToggle?.classList.remove("is-open");
    FLDom.navToggle?.setAttribute("aria-expanded", "false");

    FLDom.body.classList.remove("nav-open");
    FLDom.root.dataset.navOpen = "false";

    FLUpdateNavigationToggleLabel();

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

  function FLCloseFloatingUI() {
    FLCloseSettings();
    FLCloseMobileNav();
  }

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

    return index >= 0 && index < SCENE_ORDER.length - 1
      ? SCENE_ORDER[index + 1]
      : null;
  }

  function FLGetPreviousSceneName(sceneName = FLState.currentScene) {
    const index = FLGetSceneIndex(sceneName);

    return index > 0 ? SCENE_ORDER[index - 1] : null;
  }

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
      if (!control.closest(".site-nav, [data-mobile-nav]")) {
        return;
      }

      const active = control.dataset.sceneTarget === sceneName;

      control.classList.toggle("is-active", active);

      if (active) {
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

  function FLFinishSceneNavigation(sceneName, options = {}) {
    const { updateHash = false, replaceHash = false } = options;

    window.clearTimeout(FLState.sceneNavigationTimer);
    FLState.sceneNavigationTimer = null;
    FLState.sceneNavigationPending = false;

    FLSetActiveScene(sceneName);

    if (updateHash) {
      FLUpdateHash(sceneName, {
        replace: replaceHash,
      });
    }
  }
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

    window.clearTimeout(FLState.sceneNavigationTimer);

    if (updateHash) {
      FLUpdateHash(sceneName, {
        replace: replaceHash,
      });
    }

    if (window.FLAnimations?.goToScene) {
      const handled = window.FLAnimations.goToScene(sceneName, {
        landing,
        immediate: immediate || FLIsReducedMotion(),
        onComplete() {
          FLFinishSceneNavigation(sceneName, {
            updateHash: false,
            replaceHash: true,
          });
        },
      });

      if (handled !== false) {
        FLState.sceneNavigationTimer = window.setTimeout(
          () => {
            if (!FLState.sceneNavigationPending) {
              return;
            }

            FLFinishSceneNavigation(sceneName, {
              updateHash: false,
              replaceHash: true,
            });
          },
          FLIsReducedMotion() ? 0 : 1600,
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

    FLState.sceneNavigationTimer = window.setTimeout(
      () => {
        FLFinishSceneNavigation(sceneName, {
          updateHash: false,
          replaceHash: true,
        });
      },
      immediate || FLIsReducedMotion() ? 0 : 550,
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

  function FLHasTextSelection() {
    return String(window.getSelection?.() || "").trim().length > 0;
  }

  function FLIsWelcomeSequenceRunning() {
    const welcomeScene = FLGetSceneElement("welcome");
    const animationState = window.FLAnimations?.getState?.();

    return Boolean(
      FLState.sceneNavigationPending ||
      welcomeScene?.dataset.welcomeRunning === "true" ||
      animationState?.welcomeSequenceActive ||
      animationState?.welcomeBridgeActive,
    );
  }

  function FLHandleWelcomeClickAdvance(event) {
    if (FLState.currentScene !== "welcome" || !FLIsFinePointer()) {
      return;
    }

    if (
      FLState.settingsOpen ||
      FLState.mobileNavOpen ||
      FLState.openDisciplineModal ||
      FLState.openProjectModal ||
      FLIsWelcomeSequenceRunning()
    ) {
      return;
    }

    if (!(event.target instanceof Element)) {
      return;
    }

    if (event.target.closest(INTERACTIVE_SELECTOR) || FLHasTextSelection()) {
      return;
    }

    FLAdvanceScene("welcome");
  }

  function FLInitialiseWelcomeClickAdvance() {
    const welcomeScene = FLGetSceneElement("welcome");

    if (!welcomeScene || welcomeScene.dataset.clickAdvance === "true") {
      return false;
    }

    welcomeScene.dataset.clickAdvance = "true";
    welcomeScene.dataset.welcomeRunning ||= "false";

    welcomeScene.addEventListener("click", FLHandleWelcomeClickAdvance);

    return true;
  }

  function FLHandleBackgroundSceneAdvance(event, sceneName) {
    if (!FLIsFinePointer() || FLIsMobileLayout()) {
      return;
    }

    if (FLState.currentScene !== sceneName) {
      return;
    }

    if (
      FLState.openDisciplineModal ||
      FLState.openProjectModal ||
      FLState.settingsOpen ||
      FLState.mobileNavOpen
    ) {
      return;
    }

    if (!(event.target instanceof Element)) {
      return;
    }

    if (event.target.closest(INTERACTIVE_SELECTOR) || FLHasTextSelection()) {
      return;
    }

    FLAdvanceScene(sceneName);
  }

  function FLInitialiseBackgroundAdvance() {
    ["services", "projects"].forEach((sceneName) => {
      const scene = FLGetSceneElement(sceneName);

      if (!scene || scene.dataset.backgroundAdvance === "true") {
        return;
      }

      scene.dataset.backgroundAdvance = "true";

      scene.addEventListener("click", (event) => {
        FLHandleBackgroundSceneAdvance(event, sceneName);
      });
    });
  }

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

    window.setTimeout(
      () => {
        FLState.historyNavigationPending = false;
      },
      FLIsReducedMotion() ? 0 : 80,
    );
  }

  function FLInitialiseHistoryEvents() {
    window.addEventListener("popstate", FLHandleHistoryNavigation);
    window.addEventListener("hashchange", FLHandleHistoryNavigation);
  }

  function FLInitialiseSceneState() {
    const hashScene = FLHashToScene();
    const initialScene = hashScene || "welcome";

    FLSetActiveScene(initialScene);

    if (!hashScene) {
      FLUpdateHash("welcome", {
        replace: true,
      });
    }
  }

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

        const animationState = window.FLAnimations?.getState?.();

        if (
          animationState?.welcomeBridgeActive ||
          animationState?.welcomeSequenceActive
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
          "summary",
          "[tabindex]:not([tabindex='-1'])",
        ].join(","),
      ),
    ).filter((element) => {
      if (
        element.hasAttribute("hidden") ||
        element.getAttribute("aria-hidden") === "true" ||
        element.getAttribute("aria-disabled") === "true" ||
        element.hasAttribute("inert") ||
        element.closest("[inert]")
      ) {
        return false;
      }

      const styles = window.getComputedStyle(element);

      return styles.display !== "none" && styles.visibility !== "hidden";
    });
  }

  function FLFocusFirstInDialog(dialog) {
    if (!dialog) {
      return;
    }

    window.requestAnimationFrame(() => {
      const focusable = FLGetFocusableElements(dialog);

      if (focusable.length) {
        focusable[0].focus?.();
        return;
      }

      if (!dialog.hasAttribute("tabindex")) {
        dialog.setAttribute("tabindex", "-1");
      }

      dialog.focus?.();
    });
  }

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

    if (FLState.openProjectModal) {
      FLCloseProjectModal(FLState.openProjectModal, {
        returnFocus: false,
        dispatch: false,
      });
    }

    if (FLState.openDisciplineModal) {
      FLCloseActiveDiscipline({
        returnFocus: false,
        dispatch: false,
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

    const surface = modal.querySelector(".discipline-modal__surface");

    if (surface) {
      surface.scrollTop = 0;
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

  function FLCloseActiveDiscipline(options = {}) {
    const { returnFocus = true, dispatch = true } = options;
    const disciplineId = FLState.openDisciplineModal;

    if (!disciplineId) {
      return false;
    }

    const modal = FLGetDisciplineModal(disciplineId);
    const focusTarget = FLState.disciplineReturnFocus;

    FLSetDisciplineTriggerState(disciplineId, false);

    FLState.openDisciplineModal = null;
    FLState.disciplineReturnFocus = null;

    FLCloseDialog(modal);
    FLUpdateModalLock();

    if (
      returnFocus &&
      focusTarget instanceof HTMLElement &&
      focusTarget.isConnected
    ) {
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
          FLState.disciplineReturnFocus = null;

          FLSetDisciplineTriggerState(disciplineId, false);
          FLUpdateModalLock();
        }
      });
    });
  }

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

  function FLGetProjectOrder() {
    const configuredOrder = Array.isArray(window.FLProjectOrder)
      ? window.FLProjectOrder.filter((projectId) =>
          FLGetProjectModal(projectId),
        )
      : [];

    if (configuredOrder.length) {
      return configuredOrder;
    }

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

    if (FLState.openDisciplineModal) {
      FLCloseActiveDiscipline({
        returnFocus: false,
        dispatch: false,
      });
    }

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

    const surface = modal.querySelector(".project-modal__surface");

    if (surface) {
      surface.scrollTop = 0;
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

  function FLCloseProjectModal(
    projectId = FLState.openProjectModal,
    options = {},
  ) {
    const { returnFocus = true, dispatch = true } = options;

    if (!projectId) {
      return false;
    }

    const modal = FLGetProjectModal(projectId);
    const focusTarget = FLState.projectReturnFocus;

    FLSetProjectTriggerState(projectId, false);

    if (FLState.openProjectModal === projectId) {
      FLState.openProjectModal = null;
    }

    FLState.projectReturnFocus = null;

    FLCloseDialog(modal);
    FLUpdateModalLock();

    if (
      returnFocus &&
      focusTarget instanceof HTMLElement &&
      focusTarget.isConnected
    ) {
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
          FLState.projectReturnFocus = null;

          FLSetProjectTriggerState(projectId, false);
          FLUpdateModalLock();
        }
      });
    });
  }

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

  function FLChangeProject(projectId) {
    if (!projectId || !FLGetProjectModal(projectId)) {
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

  function FLGetActiveDialog() {
    if (FLState.openProjectModal) {
      return FLGetProjectModal(FLState.openProjectModal);
    }

    if (FLState.openDisciplineModal) {
      return FLGetDisciplineModal(FLState.openDisciplineModal);
    }

    return null;
  }

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
      dialog.focus?.();

      return true;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();

      return true;
    }

    if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();

      return true;
    }

    return false;
  }
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

  function FLUpdateHeaderState() {
    FLDom.header?.classList.toggle("is-scrolled", window.scrollY > 12);
  }

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

  function FLHandleKeyboard(event) {
    const target = event.target;

    const typing =
      target instanceof HTMLElement &&
      (target.matches("input, textarea, select") || target.isContentEditable);

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

    if (
      event.key === "PageDown" ||
      (event.key === "ArrowDown" && event.altKey)
    ) {
      event.preventDefault();

      FLAdvanceScene(FLState.currentScene);

      return;
    }

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

    FLDom.themeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        FLApplyTheme(button.dataset.themeOption, {
          announce: true,
        });
      });
    });
  }

  function FLInitialiseSceneEvents() {
    FLDom.sceneTargets.forEach((control) => {
      control.addEventListener("click", FLHandleSceneTargetClick);
    });

    FLInitialiseWelcomeClickAdvance();
    FLInitialiseBackgroundAdvance();
    FLInitialiseSceneObserver();
  }

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

  function FLHandleViewportChange() {
    if (window.innerWidth > 960 && FLState.mobileNavOpen) {
      FLCloseMobileNav();
    }

    if (FLIsMobileLayout()) {
      const welcomeScene = FLGetSceneElement("welcome");

      if (
        welcomeScene &&
        welcomeScene.dataset.welcomeRunning === "true" &&
        !window.FLAnimations?.getState?.()?.welcomeSequenceActive
      ) {
        welcomeScene.dataset.welcomeRunning = "false";
      }
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

  function FLInitialiseFloatingUIState() {
    FLState.settingsOpen = false;
    FLState.mobileNavOpen = false;

    if (FLDom.settingsPanel) {
      FLDom.settingsPanel.hidden = true;
      FLDom.settingsPanel.setAttribute("aria-hidden", "true");
      FLDom.settingsPanel.classList.remove("is-open");
    }

    FLDom.settingsToggle?.setAttribute("aria-expanded", "false");

    if (FLDom.mobileNav) {
      FLDom.mobileNav.hidden = true;
      FLDom.mobileNav.setAttribute("aria-hidden", "true");
      FLDom.mobileNav.classList.remove("is-open");
    }

    FLDom.navToggle?.classList.remove("is-open");
    FLDom.navToggle?.setAttribute("aria-expanded", "false");

    FLDom.body.classList.remove("nav-open", "modal-open");

    FLDom.root.dataset.navOpen = "false";
    FLDom.root.dataset.modalOpen = "false";

    FLUpdateNavigationToggleLabel();
  }

  function FLInitialiseModalEvents() {
    FLInitialiseDisciplineDialogEvents();
    FLInitialiseProjectDialogEvents();
  }

  window.FLSite = {
    getLanguage() {
      return FLState.language;
    },

    applyLanguage(language, options = {}) {
      return FLApplyLanguage(language, options);
    },

    getFontSize() {
      return FLState.fontSize;
    },

    applyFontSize(size, options = {}) {
      return FLApplyFontSize(size, options);
    },

    isReducedMotion() {
      return FLIsReducedMotion();
    },

    applyReducedMotion(enabled, options = {}) {
      return FLApplyReducedMotion(enabled, options);
    },

    getTheme() {
      return FLGetTheme();
    },

    applyTheme(theme, options = {}) {
      return FLApplyTheme(theme, options);
    },

    getCurrentScene() {
      return FLState.currentScene;
    },

    getActiveScene() {
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

    closeAllModals(options = {}) {
      return FLCloseAllModals(options);
    },

    closeFloatingUI() {
      FLCloseFloatingUI();
    },

    announce(message) {
      FLAnnounce(message);
    },

    getState() {
      return {
        language: FLState.language,
        fontSize: FLState.fontSize,
        reducedMotion: FLState.reducedMotion,
        theme: FLState.theme,
        currentScene: FLState.currentScene,
        settingsOpen: FLState.settingsOpen,
        mobileNavOpen: FLState.mobileNavOpen,
        sceneNavigationPending: FLState.sceneNavigationPending,
        openDisciplineModal: FLState.openDisciplineModal,
        openProjectModal: FLState.openProjectModal,
      };
    },
  };

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

    FLInitialiseHeaderEvents();
    FLInitialisePreferenceEvents();
    FLInitialiseSceneEvents();
    FLInitialiseModalEvents();
    FLInitialiseContactPlaceholders();
    FLInitialiseHistoryEvents();
    FLInitialiseGlobalSiteEvents();
    FLInitialiseViewportEvents();

    document.addEventListener("keydown", FLHandleKeyboard);

    FLUpdateHeaderState();
    FLUpdateModalLock();

    FLDom.root.dataset.siteReady = "true";

    window.dispatchEvent(
      new CustomEvent("flSiteReady", {
        detail: {
          scene: FLState.currentScene,
          language: FLState.language,
          fontSize: FLState.fontSize,
          reducedMotion: FLState.reducedMotion,
          theme: FLState.theme,
          highContrast: FLState.theme === "contrast",
          openDisciplineModal: FLState.openDisciplineModal,
          openProjectModal: FLState.openProjectModal,
          openProjectStory: FLState.openProjectModal,
          projectReadingMode: Boolean(FLState.openProjectModal),
        },
      }),
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", FLInitialiseSite, {
      once: true,
    });
  } else {
    FLInitialiseSite();
  }
})();
