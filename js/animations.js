/* =========================================================
   F.LIYANTO PORTFOLIO
   ANIMATION + SCENE SYSTEM
   ========================================================= */

/* =========================================================
   01 — GSAP SETUP
   ========================================================= */

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  if (typeof MotionPathPlugin !== "undefined") {
    gsap.registerPlugin(MotionPathPlugin);
  }

  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });
}

/* =========================================================
   02 — GLOBAL ANIMATION STATE
   ========================================================= */

const FLAnimationState = {
  ready: false,

  rebuilding: false,

  eventsInitialised: false,

  cursorInitialised: false,

  currentScene: "welcome",

  viewportMode: null,

  reducedMotion: false,

  context: null,

  resizeTimer: null,

  refreshTimer: null,

  scrollTween: null,

  autoPlay: {
    active: false,
    scene: null,
  },

  welcome: {
    timeline: null,
    scrollTrigger: null,
    progress: 0,
    step: 0,
    reducedStep: 0,
  },

  about: {
    timeline: null,
    travelTimeline: null,
    scrollTrigger: null,
  },

  services: {
    timeline: null,
    scrollTrigger: null,
  },

  projects: {
    timeline: null,
    scrollTrigger: null,
  },

  contact: {
    timeline: null,
    scrollTrigger: null,
  },

  modals: {
    discipline: null,
    project: null,
  },

  cursor: {
    element: null,
    label: null,
    moveX: null,
    moveY: null,
    insideWelcome: false,
  },
};

/* =========================================================
   03 — BASIC HELPERS
   ========================================================= */

function FLHasGSAP() {
  return typeof gsap !== "undefined";
}

function FLHasScrollTrigger() {
  return typeof ScrollTrigger !== "undefined";
}

function FLHasMotionPath() {
  return typeof MotionPathPlugin !== "undefined";
}

function FLIsReducedMotion() {
  return (
    document.documentElement.dataset.reduceMotion === "true" ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true
  );
}

function FLIsMobile() {
  return window.innerWidth <= 720;
}

function FLIsTablet() {
  return window.innerWidth <= 960;
}

function FLIsFinePointer() {
  return Boolean(
    window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches,
  );
}

function FLClamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function FLGetScene(sceneName) {
  if (!sceneName) {
    return null;
  }

  return document.querySelector(`[data-scene="${sceneName}"]`);
}

function FLGetSceneState(sceneName) {
  return FLAnimationState[sceneName] || null;
}

function FLGetViewportMode() {
  if (window.matchMedia("(max-width: 720px)").matches) {
    return "mobile";
  }

  if (window.matchMedia("(max-width: 960px)").matches) {
    return "tablet";
  }

  return "desktop";
}

function FLGetHeaderHeight() {
  return document.querySelector("[data-header]")?.offsetHeight || 0;
}

function FLGetAbsoluteTop(element) {
  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();

  return window.scrollY + rect.top;
}

function FLSetSceneActive(sceneName) {
  if (!sceneName) {
    return;
  }

  FLAnimationState.currentScene = sceneName;

  window.FLSite?.setActiveScene?.(sceneName);
}

/* =========================================================
   04 — SCROLL TWEEN
   ========================================================= */

function FLStopScrollTween() {
  if (FLAnimationState.scrollTween) {
    FLAnimationState.scrollTween.kill();

    FLAnimationState.scrollTween = null;
  }

  FLAnimationState.autoPlay.active = false;

  FLAnimationState.autoPlay.scene = null;
}

function FLScrollToY(targetY, options = {}) {
  const {
    duration = 0.85,

    ease = "power3.inOut",

    immediate = false,

    onComplete = null,
  } = options;

  const safeTarget = Math.max(0, Number(targetY) || 0);

  FLStopScrollTween();

  if (!FLHasGSAP() || immediate || FLIsReducedMotion()) {
    window.scrollTo({
      top: safeTarget,
      behavior: "auto",
    });

    FLHasScrollTrigger() && ScrollTrigger.update();

    onComplete?.();

    return null;
  }

  const root = document.documentElement;

  const previousScrollBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = "auto";

  const proxy = {
    y: window.scrollY,
  };

  const restoreScrollBehaviour = () => {
    root.style.scrollBehavior = previousScrollBehavior;
  };

  const tween = gsap.to(proxy, {
    y: safeTarget,

    duration,

    ease,

    overwrite: true,

    onUpdate() {
      window.scrollTo(0, proxy.y);
    },

    onComplete() {
      restoreScrollBehaviour();

      FLAnimationState.scrollTween = null;

      FLAnimationState.autoPlay.active = false;

      FLAnimationState.autoPlay.scene = null;

      FLHasScrollTrigger() && ScrollTrigger.update();

      onComplete?.();
    },

    onInterrupt() {
      restoreScrollBehaviour();

      FLAnimationState.scrollTween = null;

      FLAnimationState.autoPlay.active = false;

      FLAnimationState.autoPlay.scene = null;
    },
  });

  FLAnimationState.scrollTween = tween;

  return tween;
}

/* =========================================================
   05 — REFRESH
   ========================================================= */

function FLRefreshLayout(delay = 0) {
  window.clearTimeout(FLAnimationState.refreshTimer);

  FLAnimationState.refreshTimer = window.setTimeout(() => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        FLHasScrollTrigger() && ScrollTrigger.refresh();
      });
    });
  }, delay);
}

/* =========================================================
   06 — WELCOME PROGRESS
   ========================================================= */

function FLUpdateWelcomeProgress(progress) {
  const safeProgress = FLClamp(progress);

  FLAnimationState.welcome.progress = safeProgress;

  let step = 0;

  if (safeProgress >= 0.72) {
    step = 2;
  } else if (safeProgress >= 0.27) {
    step = 1;
  }

  FLAnimationState.welcome.step = step;

  document
    .querySelectorAll("[data-welcome-progress] > span")
    .forEach((item, index) => {
      item.classList.toggle("is-active", index === step);
    });
}

/* =========================================================
   07 — WELCOME ELEMENTS
   ========================================================= */

function FLGetWelcomeElements() {
  const scene = FLGetScene("welcome");

  if (!scene) {
    return null;
  }

  return {
    scene,

    name: scene.querySelector("[data-welcome-name]"),

    intro: scene.querySelector('[data-welcome-state="intro"]'),

    specialisms: scene.querySelector('[data-welcome-state="specialisms"]'),

    ui: scene.querySelector(".welcome-specialism--ui"),

    interaction: scene.querySelector(".welcome-specialism--interaction"),

    frontend: scene.querySelector(".welcome-specialism--frontend"),

    statementContainer: scene.querySelector('[data-welcome-state="statement"]'),

    statement: scene.querySelector(".welcome__statement-text"),

    progress: scene.querySelector(".scene-progress"),

    shapeOne: scene.querySelector("[data-shape='welcome-one']"),

    shapeTwo: scene.querySelector("[data-shape='welcome-two']"),

    shapeThree: scene.querySelector("[data-shape='welcome-three']"),

    shapeFour: scene.querySelector("[data-shape='welcome-four']"),
  };
}

/* =========================================================
   08 — PREPARE WELCOME
   ========================================================= */

function FLPrepareWelcomeScene() {
  if (!FLHasGSAP()) {
    return;
  }

  const elements = FLGetWelcomeElements();

  if (!elements) {
    return;
  }

  const {
    name,
    intro,
    specialisms,
    ui,
    interaction,
    frontend,
    statementContainer,
    statement,
    progress,
    shapeOne,
    shapeTwo,
    shapeThree,
    shapeFour,
  } = elements;

  gsap.killTweensOf(
    [
      name,
      intro,
      specialisms,
      ui,
      interaction,
      frontend,
      statementContainer,
      statement,
      progress,
      shapeOne,
      shapeTwo,
      shapeThree,
      shapeFour,
    ].filter(Boolean),
  );

  gsap.set(
    [
      name,
      intro,
      specialisms,
      ui,
      interaction,
      frontend,
      statementContainer,
      statement,
      progress,
      shapeOne,
      shapeTwo,
      shapeThree,
      shapeFour,
    ].filter(Boolean),
    {
      clearProps: "transform,opacity,visibility",
    },
  );
}

/* =========================================================
   09 — REDUCED MOTION WELCOME
   ========================================================= */

function FLSetReducedWelcomeStep(step) {
  const elements = FLGetWelcomeElements();

  if (!elements || !FLHasGSAP()) {
    return false;
  }

  const safeStep = Math.max(0, Math.min(2, Number(step) || 0));

  FLAnimationState.welcome.reducedStep = safeStep;

  FLAnimationState.welcome.step = safeStep;

  FLAnimationState.welcome.progress =
    safeStep === 0 ? 0 : safeStep === 1 ? 0.5 : 0.85;

  const { intro, specialisms, statementContainer, progress } = elements;

  gsap.set(intro, {
    autoAlpha: safeStep === 0 ? 1 : 0,

    pointerEvents: safeStep === 0 ? "auto" : "none",
  });

  gsap.set(specialisms, {
    autoAlpha: safeStep === 1 ? 1 : 0,

    pointerEvents: safeStep === 1 ? "auto" : "none",
  });

  gsap.set(statementContainer, {
    autoAlpha: safeStep === 2 ? 1 : 0,

    pointerEvents: safeStep === 2 ? "auto" : "none",
  });

  gsap.set(progress, {
    autoAlpha: 1,
  });

  document
    .querySelectorAll("[data-welcome-progress] > span")
    .forEach((item, index) => {
      item.classList.toggle("is-active", index === safeStep);
    });

  return true;
}

function FLBuildReducedWelcome() {
  FLPrepareWelcomeScene();

  const elements = FLGetWelcomeElements();

  if (!elements || !FLHasGSAP()) {
    return;
  }

  gsap.set(
    [
      elements.name,
      elements.ui,
      elements.interaction,
      elements.frontend,
      elements.statement,
    ].filter(Boolean),
    {
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,
    },
  );

  FLAnimationState.welcome.timeline = null;

  FLAnimationState.welcome.scrollTrigger = null;

  FLSetReducedWelcomeStep(0);
}

/* =========================================================
   10 — WELCOME MASTER TIMELINE
   ========================================================= */

function FLBuildWelcomeScene() {
  const elements = FLGetWelcomeElements();

  if (!elements || !FLHasGSAP()) {
    return;
  }

  if (FLIsReducedMotion() || !FLHasScrollTrigger()) {
    FLBuildReducedWelcome();

    return;
  }

  FLPrepareWelcomeScene();

  const {
    scene,
    intro,
    name,
    specialisms,
    ui,
    interaction,
    frontend,
    statementContainer,
    statement,
    progress,
    shapeOne,
    shapeTwo,
    shapeThree,
    shapeFour,
  } = elements;

  const specialismItems = [ui, interaction, frontend].filter(Boolean);

  const shapes = [shapeOne, shapeTwo, shapeThree, shapeFour].filter(Boolean);

  gsap.set(intro, {
    autoAlpha: 1,
  });

  gsap.set(name, {
    x: 0,
    y: 0,
    scale: 1,
    autoAlpha: 1,
  });

  gsap.set(specialisms, {
    autoAlpha: 1,
  });

  gsap.set(ui, {
    x: 70,
    y: -15,
    scale: 0.94,
    autoAlpha: 0,
  });

  gsap.set(interaction, {
    y: 40,
    scale: 0.94,
    autoAlpha: 0,
  });

  gsap.set(frontend, {
    x: -70,
    y: 20,
    scale: 0.94,
    autoAlpha: 0,
  });

  gsap.set(statementContainer, {
    autoAlpha: 1,
  });

  gsap.set(statement, {
    y: 34,
    scale: 0.97,
    autoAlpha: 0,
  });

  gsap.set(progress, {
    autoAlpha: 1,
  });

  const timeline = gsap.timeline({
    defaults: {
      ease: "none",
    },

    scrollTrigger: {
      trigger: scene,

      start: "top top",

      end: () => {
        const multiplier = FLIsMobile() ? 3.1 : FLIsTablet() ? 3.25 : 3.4;

        return `+=${window.innerHeight * multiplier}`;
      },

      pin: true,

      pinSpacing: true,

      scrub: 0.28,

      anticipatePin: 1,

      invalidateOnRefresh: true,

      onEnter() {
        FLSetSceneActive("welcome");
      },

      onEnterBack() {
        FLSetSceneActive("welcome");
      },

      onLeave() {
        FLSetSceneActive("about");
      },

      onUpdate(self) {
        FLUpdateWelcomeProgress(self.progress);
      },
    },
  });

  timeline.addLabel("intro", 0);

  timeline.to(
    {},
    {
      duration: 0.7,
    },
  );

  timeline.to(
    name,
    {
      y: -20,

      scale: 0.985,

      autoAlpha: 0,

      duration: 0.55,

      ease: "power2.inOut",
    },
    0.55,
  );

  timeline.to(
    intro,
    {
      autoAlpha: 0,

      duration: 0.42,

      ease: "power2.inOut",
    },
    0.62,
  );

  timeline.to(
    shapeOne,
    {
      xPercent: -10,
      yPercent: 8,
      rotation: 24,
      scale: 1.04,
      duration: 2.2,
      ease: "sine.inOut",
    },
    0.5,
  );

  timeline.to(
    shapeTwo,
    {
      xPercent: 15,
      yPercent: -12,
      scale: 1.07,
      duration: 2.2,
      ease: "sine.inOut",
    },
    0.5,
  );

  timeline.to(
    shapeThree,
    {
      xPercent: 12,
      yPercent: 14,
      rotation: -9,
      scale: 1.05,
      duration: 2.2,
      ease: "sine.inOut",
    },
    0.5,
  );

  timeline.to(
    shapeFour,
    {
      xPercent: -10,
      yPercent: -6,
      rotation: 26,
      duration: 2.2,
      ease: "sine.inOut",
    },
    0.5,
  );

  timeline.addLabel("specialisms", 1.1);

  timeline.to(
    ui,
    {
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,

      duration: 0.66,

      ease: "power3.out",
    },
    1.02,
  );

  timeline.to(
    interaction,
    {
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,

      duration: 0.72,

      ease: "power3.out",
    },
    1.18,
  );

  timeline.to(
    frontend,
    {
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,

      duration: 0.66,

      ease: "power3.out",
    },
    1.35,
  );

  timeline.addLabel("specialismsReady", 1.95);

  timeline.to(
    {},
    {
      duration: 0.9,
    },
  );

  timeline.to(
    ui,
    {
      x: 34,
      y: -16,
      scale: 0.975,
      autoAlpha: 0,

      duration: 0.55,

      ease: "power2.inOut",
    },
    2.78,
  );

  timeline.to(
    interaction,
    {
      y: -22,
      scale: 0.975,
      autoAlpha: 0,

      duration: 0.58,

      ease: "power2.inOut",
    },
    2.84,
  );

  timeline.to(
    frontend,
    {
      x: -34,
      y: -12,
      scale: 0.975,
      autoAlpha: 0,

      duration: 0.55,

      ease: "power2.inOut",
    },
    2.9,
  );

  timeline.addLabel("statement", 3.38);

  timeline.to(
    statement,
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,

      duration: 0.75,

      ease: "power3.out",
    },
    3.3,
  );

  timeline.addLabel("ready", 4.05);

  timeline.to(
    {},
    {
      duration: 0.8,
    },
  );

  timeline.to(
    statement,
    {
      y: -24,
      scale: 0.985,
      autoAlpha: 0,

      duration: 0.54,

      ease: "power2.inOut",
    },
    4.78,
  );

  timeline.to(
    progress,
    {
      y: 10,
      autoAlpha: 0,

      duration: 0.4,

      ease: "power2.inOut",
    },
    4.84,
  );

  timeline.to(
    shapes,
    {
      scale: 1.07,
      autoAlpha: 0,

      stagger: 0.03,

      duration: 0.52,

      ease: "power2.inOut",
    },
    4.82,
  );

  timeline.addLabel("complete", 5.4);

  FLAnimationState.welcome.timeline = timeline;

  FLAnimationState.welcome.scrollTrigger = timeline.scrollTrigger;

  FLUpdateWelcomeProgress(0);
}

/* =========================================================
   11 — WELCOME LABEL POSITION
   ========================================================= */

function FLGetWelcomeLabelProgress(label) {
  const timeline = FLAnimationState.welcome.timeline;

  if (!timeline || timeline.labels[label] === undefined) {
    return null;
  }

  const duration = timeline.duration();

  if (!duration) {
    return 0;
  }

  return FLClamp(timeline.labels[label] / duration);
}

function FLScrollWelcomeToLabel(label, options = {}) {
  const trigger = FLAnimationState.welcome.scrollTrigger;

  const progress = FLGetWelcomeLabelProgress(label);

  if (!trigger || progress === null) {
    return false;
  }

  const targetY = trigger.start + (trigger.end - trigger.start) * progress;

  FLAnimationState.autoPlay.active = true;

  FLAnimationState.autoPlay.scene = "welcome";

  FLScrollToY(targetY, {
    duration: options.duration ?? 1.05,

    ease: options.ease ?? "power2.inOut",

    onComplete() {
      FLSetSceneActive("welcome");
    },
  });

  return true;
}

/* =========================================================
   12 — WELCOME ADVANCE
   ========================================================= */

function FLAdvanceWelcome() {
  if (FLIsReducedMotion()) {
    const currentStep = FLAnimationState.welcome.reducedStep;

    if (currentStep === 0) {
      FLSetReducedWelcomeStep(1);

      return true;
    }

    if (currentStep === 1) {
      FLSetReducedWelcomeStep(2);

      return true;
    }

    return FLGoToScene("about", {
      duration: 0,
      immediate: true,
    });
  }

  const progress =
    FLAnimationState.welcome.scrollTrigger?.progress ??
    FLAnimationState.welcome.progress ??
    0;

  if (progress < 0.26) {
    return FLScrollWelcomeToLabel("specialismsReady", {
      duration: 1.05,
    });
  }

  if (progress < 0.7) {
    return FLScrollWelcomeToLabel("statement", {
      duration: 1.05,
    });
  }

  return FLGoToScene("about", {
    duration: 1,
  });
}

/* =========================================================
   13 — SCENE LANDING Y
   ========================================================= */

function FLGetSceneLandingY(sceneName, landing = "ready") {
  const scene = FLGetScene(sceneName);

  if (!scene) {
    return null;
  }

  if (sceneName === "welcome" && FLAnimationState.welcome.scrollTrigger) {
    const trigger = FLAnimationState.welcome.scrollTrigger;

    const label =
      landing === "intro"
        ? "intro"
        : landing === "specialisms"
          ? "specialismsReady"
          : landing === "statement"
            ? "statement"
            : "ready";

    const progress = FLGetWelcomeLabelProgress(label);

    if (progress !== null) {
      return trigger.start + (trigger.end - trigger.start) * progress;
    }
  }

  return FLGetAbsoluteTop(scene);
}

/* =========================================================
   14 — GO TO SCENE
   ========================================================= */

function FLGoToScene(sceneName, options = {}) {
  const scene = FLGetScene(sceneName);

  if (!scene) {
    return false;
  }

  const {
    landing = sceneName === "welcome" ? "intro" : "ready",

    immediate = false,

    duration = 0.9,
  } = options;

  const targetY = FLGetSceneLandingY(sceneName, landing);

  if (targetY === null) {
    return false;
  }

  FLAnimationState.autoPlay.active = true;

  FLAnimationState.autoPlay.scene = sceneName;

  FLScrollToY(targetY, {
    duration,

    immediate,

    ease: "power3.inOut",

    onComplete() {
      FLSetSceneActive(sceneName);
    },
  });

  return true;
}

/* =========================================================
   15 — NEXT SCENE
   ========================================================= */

function FLGetNextSceneName(sceneName) {
  const order = ["welcome", "about", "services", "projects", "contact"];

  const index = order.indexOf(sceneName);

  if (index < 0 || index >= order.length - 1) {
    return null;
  }

  return order[index + 1];
}

function FLAdvanceScene(sceneName) {
  if (sceneName === "welcome") {
    return FLAdvanceWelcome();
  }

  const nextScene = FLGetNextSceneName(sceneName);

  if (!nextScene) {
    return false;
  }

  return FLGoToScene(nextScene, {
    duration: 0.9,
  });
}

/* =========================================================
   16 — MANUAL INPUT CANCELS AUTOPLAY
   ========================================================= */

function FLCancelAutoPlayFromUserInput() {
  if (!FLAnimationState.autoPlay.active) {
    return;
  }

  FLStopScrollTween();
}

function FLInitialiseScrollInterruption() {
  window.addEventListener("wheel", FLCancelAutoPlayFromUserInput, {
    passive: true,
  });

  window.addEventListener("touchstart", FLCancelAutoPlayFromUserInput, {
    passive: true,
  });

  window.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType === "mouse") {
        return;
      }

      FLCancelAutoPlayFromUserInput();
    },
    {
      passive: true,
    },
  );

  window.addEventListener("keydown", (event) => {
    const scrollKeys = [
      "ArrowUp",
      "ArrowDown",
      "PageUp",
      "PageDown",
      "Home",
      "End",
      " ",
    ];

    if (!scrollKeys.includes(event.key)) {
      return;
    }

    FLCancelAutoPlayFromUserInput();
  });
}

/* =========================================================
   17 — WELCOME CONTINUE
   ========================================================= */

function FLInitialiseWelcomeContinue() {
  const button = document.querySelector("[data-welcome-continue]");

  if (!button) {
    return;
  }

  button.addEventListener("click", (event) => {
    event.preventDefault();

    event.stopPropagation();

    FLAdvanceWelcome();
  });
}

/* =========================================================
   18 — ABOUT PREPARATION
   ========================================================= */

function FLPrepareAboutScene() {
  const scene = FLGetScene("about");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  const elements = [
    scene.querySelector(".scene-indicator"),

    scene.querySelector(".about__eyebrow"),

    scene.querySelector(".about__title"),

    ...scene.querySelectorAll(".about__story p"),

    scene.querySelector("[data-travel-story]"),

    scene.querySelector("[data-travel-origin]"),

    scene.querySelector("[data-travel-destination]"),

    scene.querySelector("[data-travel-plane]"),

    scene.querySelector("[data-travel-path]"),

    ...scene.querySelectorAll(".shape"),
  ].filter(Boolean);

  gsap.killTweensOf(elements);

  gsap.set(elements, {
    clearProps: "transform,opacity,visibility,strokeDasharray,strokeDashoffset",
  });
}

/* =========================================================
   19 — REDUCED MOTION ABOUT
   ========================================================= */

function FLBuildReducedAbout() {
  FLPrepareAboutScene();

  const scene = FLGetScene("about");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  const path = scene.querySelector("[data-travel-path]");

  const plane = scene.querySelector("[data-travel-plane]");

  gsap.set(
    [
      scene.querySelector(".scene-indicator"),

      scene.querySelector(".about__eyebrow"),

      scene.querySelector(".about__title"),

      ...scene.querySelectorAll(".about__story p"),

      scene.querySelector("[data-travel-story]"),

      scene.querySelector("[data-travel-origin]"),

      scene.querySelector("[data-travel-destination]"),
    ].filter(Boolean),
    {
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,
    },
  );

  if (path) {
    gsap.set(path, {
      strokeDashoffset: 0,
    });
  }

  gsap.set(plane, {
    autoAlpha: 0,
  });

  FLAnimationState.about.timeline = null;

  FLAnimationState.about.travelTimeline = null;

  FLAnimationState.about.scrollTrigger = null;
}

/* =========================================================
   20 — ABOUT ENTRANCE
   ========================================================= */

function FLBuildAboutScene() {
  const scene = FLGetScene("about");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  if (FLIsReducedMotion() || !FLHasScrollTrigger()) {
    FLBuildReducedAbout();

    return;
  }

  FLPrepareAboutScene();

  const indicator = scene.querySelector(".scene-indicator");

  const eyebrow = scene.querySelector(".about__eyebrow");

  const title = scene.querySelector(".about__title");

  const paragraphs = scene.querySelectorAll(".about__story p");

  const travelStory = scene.querySelector("[data-travel-story]");

  const shapeOne = scene.querySelector("[data-shape='about-one']");

  const shapeTwo = scene.querySelector("[data-shape='about-two']");

  const shapeThree = scene.querySelector("[data-shape='about-three']");

  gsap.set(indicator, {
    x: -12,
    autoAlpha: 0,
  });

  gsap.set(eyebrow, {
    y: 14,
    autoAlpha: 0,
  });

  gsap.set(title, {
    y: 28,
    autoAlpha: 0,
  });

  gsap.set(paragraphs, {
    y: 20,
    autoAlpha: 0,
  });

  gsap.set(travelStory, {
    y: 32,
    scale: 0.98,
    autoAlpha: 0,
  });

  const timeline = gsap.timeline({
    paused: true,

    defaults: {
      ease: "power3.out",
    },
  });

  timeline.to(
    indicator,
    {
      x: 0,
      autoAlpha: 1,
      duration: 0.42,
    },
    0,
  );

  timeline.to(
    eyebrow,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.42,
    },
    0.08,
  );

  timeline.to(
    title,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.65,
    },
    0.13,
  );

  timeline.to(
    paragraphs,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.52,
      stagger: 0.09,
      ease: "power2.out",
    },
    0.3,
  );

  timeline.to(
    travelStory,
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: 0.68,
    },
    0.48,
  );

  timeline.fromTo(
    shapeOne,
    {
      xPercent: 14,
      yPercent: -8,
    },
    {
      xPercent: 0,
      yPercent: 0,
      duration: 1.1,
      ease: "sine.out",
    },
    0.1,
  );

  timeline.fromTo(
    shapeTwo,
    {
      xPercent: -12,
      yPercent: 8,
    },
    {
      xPercent: 0,
      yPercent: 0,
      duration: 1.1,
      ease: "sine.out",
    },
    0.12,
  );

  timeline.fromTo(
    shapeThree,
    {
      scale: 0.82,
    },
    {
      scale: 1,
      duration: 0.9,
      ease: "back.out(1.25)",
    },
    0.22,
  );

  const trigger = ScrollTrigger.create({
    trigger: scene,

    start: "top 68%",

    once: true,

    onEnter() {
      FLSetSceneActive("about");

      timeline.play();
    },
  });

  FLAnimationState.about.timeline = timeline;

  FLAnimationState.about.scrollTrigger = trigger;

  FLBuildTravelAnimation();
}

/* =========================================================
   21 — ABOUT TRAVEL ANIMATION
   ========================================================= */

function FLBuildTravelAnimation() {
  const scene = FLGetScene("about");

  if (!scene || !FLHasGSAP() || !FLHasScrollTrigger() || FLIsReducedMotion()) {
    return;
  }

  const travelStory = scene.querySelector("[data-travel-story]");

  const origin = scene.querySelector("[data-travel-origin]");

  const destination = scene.querySelector("[data-travel-destination]");

  const originDot = origin?.querySelector(".travel-location__dot");

  const destinationDot = destination?.querySelector(".travel-location__dot");

  const plane = scene.querySelector("[data-travel-plane]");

  const path = scene.querySelector("[data-travel-path]");

  if (!travelStory) {
    return;
  }

  gsap.set(destination, {
    autoAlpha: 0.42,
  });

  gsap.set(destinationDot, {
    scale: 0.7,
  });

  gsap.set(plane, {
    scale: 0.88,
    autoAlpha: 0,
  });

  let pathLength = 0;

  if (path) {
    pathLength = path.getTotalLength?.() || 500;

    gsap.set(path, {
      strokeDasharray: pathLength,

      strokeDashoffset: pathLength,
    });
  }

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: travelStory,

      start: "top 72%",

      end: "bottom 35%",

      scrub: 0.35,

      invalidateOnRefresh: true,
    },
  });

  timeline.to(
    originDot,
    {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    },
    0,
  );

  if (path) {
    timeline.to(
      path,
      {
        strokeDashoffset: 0,
        duration: 1,
        ease: "none",
      },
      0.05,
    );
  }

  timeline.to(
    plane,
    {
      autoAlpha: 1,
      scale: 1,
      duration: 0.15,
      ease: "power2.out",
    },
    0.05,
  );

  if (plane && path && FLHasMotionPath()) {
    timeline.to(
      plane,
      {
        motionPath: {
          path,

          align: path,

          alignOrigin: [0.5, 0.5],

          autoRotate: true,
        },

        duration: 1,

        ease: "none",
      },
      0.05,
    );
  } else if (plane) {
    timeline.to(
      plane,
      {
        x: () => Math.max(130, travelStory.clientWidth * 0.42),

        y: -8,

        duration: 1,

        ease: "none",
      },
      0.05,
    );
  }

  timeline.to(
    origin,
    {
      autoAlpha: 0.68,
      duration: 0.28,
    },
    0.62,
  );

  timeline.to(
    destination,
    {
      autoAlpha: 1,
      duration: 0.3,
    },
    0.72,
  );

  timeline.to(
    destinationDot,
    {
      scale: 1.08,
      duration: 0.25,
      ease: "back.out(1.5)",
    },
    0.8,
  );

  timeline.to(
    plane,
    {
      scale: 0.84,
      autoAlpha: 0,
      duration: 0.2,
    },
    0.95,
  );

  FLAnimationState.about.travelTimeline = timeline;
}

/* =========================================================
   22 — SERVICES PREPARATION
   ========================================================= */

function FLPrepareServicesScene() {
  const scene = FLGetScene("services");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  const elements = [
    scene.querySelector(".scene-indicator"),

    scene.querySelector(".services__eyebrow"),

    scene.querySelector(".services__title"),

    scene.querySelector(".services__instruction"),

    ...scene.querySelectorAll(".discipline"),

    scene.querySelector(".scene-next--projects"),

    ...scene.querySelectorAll(".shape"),
  ].filter(Boolean);

  gsap.killTweensOf(elements);

  gsap.set(elements, {
    clearProps: "transform,opacity,visibility",
  });
}

/* =========================================================
   23 — REDUCED MOTION SERVICES
   ========================================================= */

function FLBuildReducedServices() {
  FLPrepareServicesScene();

  const scene = FLGetScene("services");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  gsap.set(
    [
      scene.querySelector(".scene-indicator"),

      scene.querySelector(".services__eyebrow"),

      scene.querySelector(".services__title"),

      scene.querySelector(".services__instruction"),

      ...scene.querySelectorAll(".discipline"),

      scene.querySelector(".scene-next--projects"),
    ].filter(Boolean),
    {
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,
    },
  );

  FLAnimationState.services.timeline = null;

  FLAnimationState.services.scrollTrigger = null;
}

/* =========================================================
   24 — SERVICES ENTRANCE
   ========================================================= */

function FLBuildServicesScene() {
  const scene = FLGetScene("services");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  if (FLIsReducedMotion() || !FLHasScrollTrigger()) {
    FLBuildReducedServices();

    return;
  }

  FLPrepareServicesScene();

  const indicator = scene.querySelector(".scene-indicator");

  const eyebrow = scene.querySelector(".services__eyebrow");

  const title = scene.querySelector(".services__title");

  const instruction = scene.querySelector(".services__instruction");

  const disciplines = Array.from(scene.querySelectorAll(".discipline"));

  const next = scene.querySelector(".scene-next--projects");

  const shapeOne = scene.querySelector("[data-shape='services-one']");

  const shapeTwo = scene.querySelector("[data-shape='services-two']");

  gsap.set(indicator, {
    x: -10,
    autoAlpha: 0,
  });

  gsap.set(eyebrow, {
    y: 12,
    autoAlpha: 0,
  });

  gsap.set(title, {
    y: 26,
    autoAlpha: 0,
  });

  gsap.set(instruction, {
    y: 14,
    autoAlpha: 0,
  });

  gsap.set(disciplines, {
    y: 32,
    scale: 0.98,
    autoAlpha: 0,
  });

  gsap.set(next, {
    y: 14,
    autoAlpha: 0,
  });

  const timeline = gsap.timeline({
    paused: true,
  });

  timeline.to(
    indicator,
    {
      x: 0,
      autoAlpha: 1,
      duration: 0.38,
      ease: "power2.out",
    },
    0,
  );

  timeline.to(
    eyebrow,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.4,
      ease: "power2.out",
    },
    0.05,
  );

  timeline.to(
    title,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.62,
      ease: "power3.out",
    },
    0.1,
  );

  timeline.to(
    instruction,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.4,
      ease: "power2.out",
    },
    0.26,
  );

  timeline.to(
    disciplines,
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,

      stagger: 0.09,

      duration: 0.56,

      ease: "power3.out",
    },
    0.34,
  );

  timeline.to(
    next,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.4,
      ease: "power2.out",
    },
    0.66,
  );

  timeline.fromTo(
    shapeOne,
    {
      xPercent: -12,
      yPercent: -10,
      rotation: -8,
    },
    {
      xPercent: 0,
      yPercent: 0,
      rotation: 0,
      duration: 1,
      ease: "sine.out",
    },
    0.16,
  );

  timeline.fromTo(
    shapeTwo,
    {
      xPercent: 14,
      yPercent: 10,
      rotation: 8,
    },
    {
      xPercent: 0,
      yPercent: 0,
      rotation: -10,
      duration: 1,
      ease: "sine.out",
    },
    0.18,
  );

  const trigger = ScrollTrigger.create({
    trigger: scene,

    start: "top 72%",

    once: true,

    onEnter() {
      FLSetSceneActive("services");

      timeline.play();
    },
  });

  FLAnimationState.services.timeline = timeline;

  FLAnimationState.services.scrollTrigger = trigger;
}

/* =========================================================
   25 — DISCIPLINE HOVER
   ========================================================= */

function FLInitialiseDisciplineHover() {
  if (!FLHasGSAP() || !FLIsFinePointer()) {
    return;
  }

  document.querySelectorAll(".discipline").forEach((discipline) => {
    const trigger = discipline.querySelector(".discipline__trigger");

    if (!trigger) {
      return;
    }

    trigger.addEventListener("mouseenter", () => {
      if (FLIsReducedMotion()) {
        return;
      }

      gsap.to(discipline, {
        y: -6,
        scale: 1.006,

        duration: 0.28,

        ease: "power2.out",

        overwrite: "auto",
      });
    });

    trigger.addEventListener("mouseleave", () => {
      gsap.to(discipline, {
        y: 0,
        scale: 1,

        duration: 0.32,

        ease: "power2.out",

        overwrite: "auto",
      });
    });
  });
}

/* =========================================================
   26 — DISCIPLINE MODAL ANIMATION
   ========================================================= */

function FLAnimateDisciplineModalOpen(disciplineId) {
  if (!disciplineId || !FLHasGSAP() || FLIsReducedMotion()) {
    return;
  }

  const modal = document.querySelector(
    `[data-discipline-modal="${disciplineId}"]`,
  );

  if (!modal) {
    return;
  }

  const surface = modal.querySelector(".discipline-modal__surface");

  const number = modal.querySelector(".discipline-modal__number");

  const title = modal.querySelector(".discipline-modal__title");

  const skills = modal.querySelectorAll(".discipline-modal__skills li");

  const description = modal.querySelector(".discipline-modal__description");

  const close = modal.querySelector(".discipline-modal__close");

  gsap.killTweensOf(
    [surface, number, title, ...skills, description, close].filter(Boolean),
  );

  const timeline = gsap.timeline();

  timeline.fromTo(
    surface,
    {
      y: 26,
      scale: 0.975,
      autoAlpha: 0,
    },
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,

      duration: 0.42,

      ease: "power3.out",
    },
  );

  timeline.fromTo(
    number,
    {
      x: -18,
      autoAlpha: 0,
    },
    {
      x: 0,
      autoAlpha: 1,

      duration: 0.38,

      ease: "power2.out",
    },
    0.08,
  );

  timeline.fromTo(
    title,
    {
      y: 18,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,

      duration: 0.46,

      ease: "power3.out",
    },
    0.1,
  );

  timeline.fromTo(
    skills,
    {
      y: 10,
      scale: 0.96,
      autoAlpha: 0,
    },
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,

      stagger: 0.055,

      duration: 0.34,

      ease: "power2.out",
    },
    0.2,
  );

  timeline.fromTo(
    description,
    {
      y: 14,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,

      duration: 0.42,

      ease: "power2.out",
    },
    0.28,
  );

  timeline.fromTo(
    close,
    {
      scale: 0.75,
      autoAlpha: 0,
    },
    {
      scale: 1,
      autoAlpha: 1,

      duration: 0.32,

      ease: "back.out(1.5)",
    },
    0.16,
  );

  FLAnimationState.modals.discipline = timeline;
}

function FLHandleDisciplineModalChange(event) {
  const disciplineId = event.detail?.discipline;

  const open = Boolean(event.detail?.open);

  if (!disciplineId || !open) {
    return;
  }

  FLAnimateDisciplineModalOpen(disciplineId);
}

/* =========================================================
   27 — PROJECTS PREPARATION
   ========================================================= */

function FLPrepareProjectsScene() {
  const scene = FLGetScene("projects");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  const elements = [
    scene.querySelector(".scene-indicator"),

    scene.querySelector(".projects__eyebrow"),

    scene.querySelector(".projects__title"),

    ...scene.querySelectorAll(".selected-project"),

    scene.querySelector(".projects__interaction-hint"),

    scene.querySelector(".scene-next--contact"),

    ...scene.querySelectorAll(".shape"),
  ].filter(Boolean);

  gsap.killTweensOf(elements);

  gsap.set(elements, {
    clearProps: "transform,opacity,visibility",
  });
}

/* =========================================================
   28 — PROJECT VISUAL RESET
   ========================================================= */

function FLResetProjectVisuals(container = document) {
  if (!FLHasGSAP()) {
    return;
  }

  const visualElements = [
    ...container.querySelectorAll(".rhythm-line"),

    ...container.querySelectorAll(".pulse-ring"),

    ...container.querySelectorAll(".pulse-core"),

    ...container.querySelectorAll(".pulse-marker"),

    ...container.querySelectorAll(".lega-visual__ring"),

    ...container.querySelectorAll(".lega-visual__core"),

    ...container.querySelectorAll(".lega-visual__slider"),

    ...container.querySelectorAll(".lega-visual__slider > span"),
  ].filter(Boolean);

  gsap.killTweensOf(visualElements);

  gsap.set(visualElements, {
    clearProps: "transform,opacity,visibility",
  });
}

/* =========================================================
   29 — PROJECT VISUAL ENTRANCE
   ========================================================= */

function FLAnimateProjectVisual(container, projectId, options = {}) {
  if (!container || !FLHasGSAP() || FLIsReducedMotion()) {
    return;
  }

  const { delay = 0 } = options;

  if (projectId === "nada-nusantara") {
    const lines = container.querySelectorAll(".rhythm-line");

    gsap.fromTo(
      lines,
      {
        scaleY: 0.24,

        autoAlpha: 0.18,

        transformOrigin: "center center",
      },
      {
        scaleY: 1,

        autoAlpha: 1,

        duration: 0.55,

        delay,

        stagger: {
          each: 0.055,
          from: "center",
        },

        ease: "back.out(1.3)",

        overwrite: "auto",
      },
    );

    return;
  }

  if (projectId === "pulse-diary") {
    const rings = container.querySelectorAll(".pulse-ring");

    const core = container.querySelector(".pulse-core");

    const markers = container.querySelectorAll(".pulse-marker");

    gsap.fromTo(
      rings,
      {
        scale: 0.72,
        autoAlpha: 0,
      },
      {
        scale: 1,
        autoAlpha: 1,

        duration: 0.62,

        delay,

        stagger: 0.07,

        ease: "power3.out",

        overwrite: "auto",
      },
    );

    gsap.fromTo(
      core,
      {
        scale: 0.62,
        autoAlpha: 0,
      },
      {
        scale: 1,
        autoAlpha: 1,

        duration: 0.44,

        delay: delay + 0.1,

        ease: "back.out(1.55)",

        overwrite: "auto",
      },
    );

    gsap.fromTo(
      markers,
      {
        scale: 0.55,
        autoAlpha: 0,
      },
      {
        scale: 1,
        autoAlpha: 1,

        duration: 0.36,

        delay: delay + 0.16,

        stagger: 0.055,

        ease: "back.out(1.45)",

        overwrite: "auto",
      },
    );

    return;
  }

  if (projectId === "lega") {
    const rings = container.querySelectorAll(".lega-visual__ring");

    const core = container.querySelector(".lega-visual__core");

    const sliders = container.querySelectorAll(".lega-visual__slider");

    const handles = container.querySelectorAll(".lega-visual__slider > span");

    gsap.fromTo(
      rings,
      {
        scale: 0.72,
        autoAlpha: 0,
      },
      {
        scale: 1,
        autoAlpha: 1,

        duration: 0.58,

        delay,

        stagger: 0.07,

        ease: "power3.out",

        overwrite: "auto",
      },
    );

    gsap.fromTo(
      core,
      {
        scale: 0.64,
        autoAlpha: 0,
      },
      {
        scale: 1,
        autoAlpha: 1,

        duration: 0.42,

        delay: delay + 0.1,

        ease: "back.out(1.55)",

        overwrite: "auto",
      },
    );

    gsap.fromTo(
      sliders,
      {
        x: 16,
        autoAlpha: 0,
      },
      {
        x: 0,
        autoAlpha: 1,

        duration: 0.38,

        delay: delay + 0.1,

        stagger: 0.05,

        ease: "power2.out",

        overwrite: "auto",
      },
    );

    gsap.fromTo(
      handles,
      {
        scale: 0.6,
        autoAlpha: 0,
      },
      {
        scale: 1,
        autoAlpha: 1,

        duration: 0.3,

        delay: delay + 0.2,

        stagger: 0.04,

        ease: "back.out(1.6)",

        overwrite: "auto",
      },
    );
  }
}

/* =========================================================
   30 — REDUCED MOTION PROJECTS
   ========================================================= */

function FLBuildReducedProjects() {
  FLPrepareProjectsScene();

  FLResetProjectVisuals();

  const scene = FLGetScene("projects");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  gsap.set(
    [
      scene.querySelector(".scene-indicator"),

      scene.querySelector(".projects__eyebrow"),

      scene.querySelector(".projects__title"),

      ...scene.querySelectorAll(".selected-project"),

      scene.querySelector(".projects__interaction-hint"),

      scene.querySelector(".scene-next--contact"),
    ].filter(Boolean),
    {
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,
    },
  );

  FLAnimationState.projects.timeline = null;

  FLAnimationState.projects.scrollTrigger = null;
}

/* =========================================================
   31 — PROJECTS ENTRANCE
   ========================================================= */

function FLBuildProjectsScene() {
  const scene = FLGetScene("projects");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  if (FLIsReducedMotion() || !FLHasScrollTrigger()) {
    FLBuildReducedProjects();

    return;
  }

  FLPrepareProjectsScene();

  FLResetProjectVisuals(scene);

  const indicator = scene.querySelector(".scene-indicator");

  const eyebrow = scene.querySelector(".projects__eyebrow");

  const title = scene.querySelector(".projects__title");

  const projects = Array.from(scene.querySelectorAll(".selected-project"));

  const hint = scene.querySelector(".projects__interaction-hint");

  const next = scene.querySelector(".scene-next--contact");

  const shapeOne = scene.querySelector("[data-shape='projects-one']");

  const shapeTwo = scene.querySelector("[data-shape='projects-two']");

  gsap.set(indicator, {
    x: -10,
    autoAlpha: 0,
  });

  gsap.set(eyebrow, {
    y: 12,
    autoAlpha: 0,
  });

  gsap.set(title, {
    y: 24,
    autoAlpha: 0,
  });

  gsap.set(projects, {
    y: 34,
    scale: 0.985,
    autoAlpha: 0,
  });

  gsap.set(hint, {
    y: 10,
    autoAlpha: 0,
  });

  gsap.set(next, {
    y: 12,
    autoAlpha: 0,
  });

  const timeline = gsap.timeline({
    paused: true,
  });

  timeline.to(
    indicator,
    {
      x: 0,
      autoAlpha: 1,
      duration: 0.38,
      ease: "power2.out",
    },
    0,
  );

  timeline.to(
    eyebrow,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.4,
      ease: "power2.out",
    },
    0.05,
  );

  timeline.to(
    title,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.62,
      ease: "power3.out",
    },
    0.1,
  );

  timeline.to(
    projects,
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,

      stagger: 0.13,

      duration: 0.62,

      ease: "power3.out",
    },
    0.3,
  );

  timeline.to(
    hint,
    {
      y: 0,
      autoAlpha: 1,

      duration: 0.36,

      ease: "power2.out",
    },
    0.72,
  );

  timeline.to(
    next,
    {
      y: 0,
      autoAlpha: 1,

      duration: 0.38,

      ease: "power2.out",
    },
    0.78,
  );

  timeline.fromTo(
    shapeOne,
    {
      xPercent: 12,
      yPercent: -10,
      rotation: -10,
    },
    {
      xPercent: 0,
      yPercent: 0,
      rotation: 18,

      duration: 1.1,

      ease: "sine.out",
    },
    0.15,
  );

  timeline.fromTo(
    shapeTwo,
    {
      xPercent: -13,
      yPercent: 10,
      rotation: 8,
    },
    {
      xPercent: 0,
      yPercent: 0,
      rotation: -14,

      duration: 1.1,

      ease: "sine.out",
    },
    0.17,
  );

  projects.forEach((project, index) => {
    const projectId = project.dataset.project;

    timeline.call(
      () => {
        FLAnimateProjectVisual(project, projectId);
      },
      null,
      0.42 + index * 0.13,
    );
  });

  const trigger = ScrollTrigger.create({
    trigger: scene,

    start: "top 72%",

    once: true,

    onEnter() {
      FLSetSceneActive("projects");

      timeline.play();
    },
  });

  FLAnimationState.projects.timeline = timeline;

  FLAnimationState.projects.scrollTrigger = trigger;
}

/* =========================================================
   32 — PROJECT CARD HOVER
   ========================================================= */

function FLInitialiseProjectHover() {
  if (!FLHasGSAP() || !FLIsFinePointer()) {
    return;
  }

  document.querySelectorAll(".selected-project").forEach((project) => {
    const trigger = project.querySelector(".selected-project__trigger");

    const visual = project.querySelector(".selected-project__visual");

    if (!trigger) {
      return;
    }

    trigger.addEventListener("mouseenter", () => {
      if (FLIsReducedMotion()) {
        return;
      }

      gsap.to(visual, {
        scale: 1.025,

        duration: 0.42,

        ease: "power2.out",

        overwrite: "auto",
      });
    });

    trigger.addEventListener("mouseleave", () => {
      gsap.to(visual, {
        scale: 1,

        duration: 0.46,

        ease: "power2.out",

        overwrite: "auto",
      });
    });
  });
}

/* =========================================================
   33 — PROJECT MODAL OPEN ANIMATION
   ========================================================= */

function FLAnimateProjectModalOpen(projectId) {
  if (!projectId || !FLHasGSAP() || FLIsReducedMotion()) {
    return;
  }

  const modal = document.querySelector(`[data-project-modal="${projectId}"]`);

  if (!modal) {
    return;
  }

  const surface = modal.querySelector(".project-modal__surface");

  const visual = modal.querySelector(".project-modal__visual");

  const meta = modal.querySelector(".project-modal__meta");

  const title = modal.querySelector(".project-modal__title");

  const disciplines = modal.querySelectorAll(".project-modal__disciplines li");

  const description = modal.querySelector(".project-modal__description");

  const actions = modal.querySelector(".project-modal__actions");

  const disclaimer = modal.querySelector(".project-disclaimer");

  const close = modal.querySelector(".project-modal__close");

  gsap.killTweensOf(
    [
      surface,
      visual,
      meta,
      title,
      ...disciplines,
      description,
      actions,
      disclaimer,
      close,
    ].filter(Boolean),
  );

  const timeline = gsap.timeline();

  timeline.fromTo(
    surface,
    {
      y: 28,
      scale: 0.975,
      autoAlpha: 0,
    },
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,

      duration: 0.44,

      ease: "power3.out",
    },
  );

  timeline.fromTo(
    visual,
    {
      scale: 0.96,
      autoAlpha: 0,
    },
    {
      scale: 1,
      autoAlpha: 1,

      duration: 0.5,

      ease: "power3.out",
    },
    0.06,
  );

  timeline.fromTo(
    meta,
    {
      y: 8,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,

      duration: 0.32,

      ease: "power2.out",
    },
    0.12,
  );

  timeline.fromTo(
    title,
    {
      y: 18,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,

      duration: 0.48,

      ease: "power3.out",
    },
    0.14,
  );

  timeline.fromTo(
    disciplines,
    {
      y: 8,
      scale: 0.96,
      autoAlpha: 0,
    },
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,

      duration: 0.32,

      stagger: 0.05,

      ease: "power2.out",
    },
    0.24,
  );

  timeline.fromTo(
    description,
    {
      y: 12,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,

      duration: 0.4,

      ease: "power2.out",
    },
    0.3,
  );

  timeline.fromTo(
    [actions, disclaimer].filter(Boolean),
    {
      y: 10,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,

      duration: 0.34,

      stagger: 0.06,

      ease: "power2.out",
    },
    0.38,
  );

  timeline.fromTo(
    close,
    {
      scale: 0.72,
      autoAlpha: 0,
    },
    {
      scale: 1,
      autoAlpha: 1,

      duration: 0.32,

      ease: "back.out(1.55)",
    },
    0.14,
  );

  timeline.call(
    () => {
      FLAnimateProjectVisual(modal, projectId, {
        delay: 0,
      });
    },
    null,
    0.16,
  );

  FLAnimationState.modals.project = timeline;
}

function FLHandleProjectModalChange(event) {
  const projectId = event.detail?.projectId;

  const open = Boolean(event.detail?.open);

  if (!projectId || !open) {
    return;
  }

  FLAnimateProjectModalOpen(projectId);
}

/* =========================================================
   34 — PROJECT CHANGE COMPATIBILITY

   The old portfolio used this API to move through a pinned
   project rail. Projects are now independent selected-work
   cards, so changing project simply opens its modal.
   ========================================================= */

function FLChangeProject(projectId) {
  if (!projectId) {
    return false;
  }

  return window.FLSite?.openProject?.(projectId) ?? false;
}

/* =========================================================
   35 — LEGACY PROJECT READING COMPATIBILITY

   main.js still exposes aliases temporarily so older project
   data cannot break the site while we replace projects.js.
   There is no longer a pinned reading journey to suspend.
   ========================================================= */

function FLSetProjectReadingMode() {
  return true;
}
/* =========================================================
   36 — CONTACT PREPARATION
   ========================================================= */

function FLPrepareContactScene() {
  const scene = FLGetScene("contact");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  const elements = [
    scene.querySelector(".scene-indicator"),

    scene.querySelector(".contact__eyebrow"),

    scene.querySelector(".contact__title"),

    scene.querySelector(".contact__description"),

    ...scene.querySelectorAll(".contact-link"),

    scene.querySelector("[data-contact-brand]"),

    scene.querySelector(".contact__restart"),

    ...scene.querySelectorAll(".shape"),
  ].filter(Boolean);

  gsap.killTweensOf(elements);

  gsap.set(elements, {
    clearProps: "transform,opacity,visibility",
  });
}

/* =========================================================
   37 — REDUCED MOTION CONTACT
   ========================================================= */

function FLBuildReducedContact() {
  FLPrepareContactScene();

  const scene = FLGetScene("contact");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  gsap.set(
    [
      scene.querySelector(".scene-indicator"),

      scene.querySelector(".contact__eyebrow"),

      scene.querySelector(".contact__title"),

      scene.querySelector(".contact__description"),

      ...scene.querySelectorAll(".contact-link"),

      scene.querySelector("[data-contact-brand]"),

      scene.querySelector(".contact__restart"),
    ].filter(Boolean),
    {
      x: 0,

      y: 0,

      xPercent: 0,

      scale: 1,

      autoAlpha: 1,
    },
  );

  FLAnimationState.contact.timeline = null;

  FLAnimationState.contact.scrollTrigger = null;
}

/* =========================================================
   38 — CONTACT ENTRANCE
   ========================================================= */

function FLBuildContactScene() {
  const scene = FLGetScene("contact");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  if (FLIsReducedMotion() || !FLHasScrollTrigger()) {
    FLBuildReducedContact();

    return;
  }

  FLPrepareContactScene();

  const indicator = scene.querySelector(".scene-indicator");

  const eyebrow = scene.querySelector(".contact__eyebrow");

  const title = scene.querySelector(".contact__title");

  const description = scene.querySelector(".contact__description");

  const links = scene.querySelectorAll(".contact-link");

  const brand = scene.querySelector("[data-contact-brand]");

  const restart = scene.querySelector(".contact__restart");

  const shapeOne = scene.querySelector("[data-shape='contact-one']");

  const shapeTwo = scene.querySelector("[data-shape='contact-two']");

  const shapeThree = scene.querySelector("[data-shape='contact-three']");

  gsap.set(indicator, {
    x: -10,

    autoAlpha: 0,
  });

  gsap.set(eyebrow, {
    y: 12,

    autoAlpha: 0,
  });

  gsap.set(title, {
    y: 28,

    autoAlpha: 0,
  });

  gsap.set(description, {
    y: 16,

    autoAlpha: 0,
  });

  gsap.set(links, {
    x: -14,

    autoAlpha: 0,
  });

  gsap.set(brand, {
    xPercent: 8,

    scale: 0.96,

    autoAlpha: 0,
  });

  gsap.set(restart, {
    y: 10,

    autoAlpha: 0,
  });

  const timeline = gsap.timeline({
    paused: true,
  });

  timeline.to(
    indicator,
    {
      x: 0,

      autoAlpha: 1,

      duration: 0.36,

      ease: "power2.out",
    },
    0,
  );

  timeline.to(
    eyebrow,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.4,

      ease: "power2.out",
    },
    0.05,
  );

  timeline.to(
    title,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.62,

      ease: "power3.out",
    },
    0.1,
  );

  timeline.to(
    description,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.44,

      ease: "power2.out",
    },
    0.25,
  );

  timeline.to(
    links,
    {
      x: 0,

      autoAlpha: 1,

      stagger: 0.075,

      duration: 0.42,

      ease: "power2.out",
    },
    0.38,
  );

  timeline.to(
    brand,
    {
      xPercent: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.7,

      ease: "power3.out",
    },
    0.25,
  );

  timeline.to(
    restart,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.38,

      ease: "power2.out",
    },
    0.7,
  );

  timeline.fromTo(
    shapeOne,
    {
      xPercent: 18,

      yPercent: -12,

      rotation: -10,

      scale: 0.9,
    },
    {
      xPercent: 0,

      yPercent: 0,

      rotation: 0,

      scale: 1,

      duration: 0.85,

      ease: "power2.out",
    },
    0.08,
  );

  timeline.fromTo(
    shapeTwo,
    {
      xPercent: 20,

      yPercent: 24,

      rotation: 18,

      scale: 0.86,
    },
    {
      xPercent: 0,

      yPercent: 0,

      rotation: 12,

      scale: 1,

      duration: 0.88,

      ease: "power2.out",
    },
    0.1,
  );

  timeline.fromTo(
    shapeThree,
    {
      xPercent: -18,

      yPercent: 16,

      rotation: 10,

      scale: 0.88,
    },
    {
      xPercent: 0,

      yPercent: 0,

      rotation: -14,

      scale: 1,

      duration: 0.9,

      ease: "power2.out",
    },
    0.1,
  );

  const trigger = ScrollTrigger.create({
    trigger: scene,

    start: "top 72%",

    once: true,

    onEnter() {
      FLSetSceneActive("contact");

      timeline.play();
    },
  });

  FLAnimationState.contact.timeline = timeline;

  FLAnimationState.contact.scrollTrigger = trigger;
}

/* =========================================================
   39 — CURSOR AVAILABILITY

   The custom cursor is intentionally limited to the FIRST
   welcome state only.

   Once the visitor reaches specialisms, the statement,
   About, or any later section, it disappears.
   ========================================================= */

function FLIsWelcomeIntroActive() {
  const currentScene =
    window.FLSite?.getCurrentScene?.() || FLAnimationState.currentScene;

  if (currentScene !== "welcome") {
    return false;
  }

  if (FLIsReducedMotion()) {
    return FLAnimationState.welcome.reducedStep === 0;
  }

  const progress =
    FLAnimationState.welcome.scrollTrigger?.progress ??
    FLAnimationState.welcome.progress ??
    0;

  return progress < 0.27;
}

function FLCursorCanDisplay() {
  return FLIsFinePointer() && !FLIsReducedMotion() && FLIsWelcomeIntroActive();
}

/* =========================================================
   40 — CURSOR TARGET CHECK
   ========================================================= */

function FLPointerIsInsideWelcome(target) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest('[data-scene="welcome"]'));
}

/* =========================================================
   41 — HIDE CUSTOM CURSOR
   ========================================================= */

function FLHideCustomCursor() {
  const cursor = FLAnimationState.cursor.element;

  if (!cursor) {
    return;
  }

  cursor.classList.remove("is-visible", "is-interactive");

  const label = FLAnimationState.cursor.label;

  if (label) {
    label.textContent = "";
  }

  FLAnimationState.cursor.insideWelcome = false;
}

/* =========================================================
   42 — SYNCHRONISE CUSTOM CURSOR
   ========================================================= */

function FLSynchroniseCustomCursor() {
  const cursor = FLAnimationState.cursor.element;

  if (!cursor) {
    return;
  }

  if (!FLCursorCanDisplay() || !FLAnimationState.cursor.insideWelcome) {
    FLHideCustomCursor();

    return;
  }

  cursor.classList.add("is-visible");
}

/* =========================================================
   43 — CUSTOM CURSOR
   ========================================================= */

function FLInitialiseCustomCursor() {
  if (FLAnimationState.cursorInitialised) {
    return;
  }

  FLAnimationState.cursorInitialised = true;

  const cursor = document.querySelector("[data-cursor]");

  const label = document.querySelector("[data-cursor-label]");

  FLAnimationState.cursor.element = cursor;

  FLAnimationState.cursor.label = label;

  if (!cursor || !FLHasGSAP()) {
    return;
  }

  if (!FLIsFinePointer()) {
    gsap.set(cursor, {
      display: "none",
    });

    return;
  }

  const moveX = gsap.quickTo(cursor, "x", {
    duration: 0.1,

    ease: "power3.out",
  });

  const moveY = gsap.quickTo(cursor, "y", {
    duration: 0.1,

    ease: "power3.out",
  });

  FLAnimationState.cursor.moveX = moveX;

  FLAnimationState.cursor.moveY = moveY;

  window.addEventListener(
    "pointermove",
    (event) => {
      moveX(event.clientX);

      moveY(event.clientY);

      const insideWelcome = FLPointerIsInsideWelcome(event.target);

      FLAnimationState.cursor.insideWelcome = insideWelcome;

      if (!insideWelcome || !FLCursorCanDisplay()) {
        FLHideCustomCursor();

        return;
      }

      cursor.classList.add("is-visible");

      const interactive =
        event.target instanceof Element
          ? event.target.closest(
              ["[data-welcome-continue]", "[data-scene-target]"].join(","),
            )
          : null;

      cursor.classList.toggle("is-interactive", Boolean(interactive));

      if (label) {
        label.textContent = interactive ? "Explore" : "Click";
      }
    },
    {
      passive: true,
    },
  );

  window.addEventListener(
    "scroll",
    () => {
      FLSynchroniseCustomCursor();
    },
    {
      passive: true,
    },
  );

  document.addEventListener(
    "click",
    () => {
      window.requestAnimationFrame(() => {
        FLSynchroniseCustomCursor();
      });
    },
    {
      capture: true,
    },
  );

  document.documentElement.addEventListener("mouseleave", () => {
    FLHideCustomCursor();
  });

  window.addEventListener("blur", () => {
    FLHideCustomCursor();
  });
}

/* =========================================================
   44 — SCENE CHANGE
   ========================================================= */

function FLHandleAnimationSceneChange(event) {
  const scene = event.detail?.scene;

  if (!scene) {
    return;
  }

  FLAnimationState.currentScene = scene;

  if (scene !== "welcome") {
    FLHideCustomCursor();
  } else {
    window.requestAnimationFrame(() => {
      FLSynchroniseCustomCursor();
    });
  }
}

/* =========================================================
   45 — LANGUAGE CHANGE
   ========================================================= */

function FLHandleLanguageChange() {
  FLRefreshLayout(20);
}

/* =========================================================
   46 — FONT SIZE CHANGE
   ========================================================= */

function FLHandleFontSizeChange() {
  FLRebuildAnimations({
    preservePosition: true,
  });
}

/* =========================================================
   47 — MOTION PREFERENCE CHANGE
   ========================================================= */

function FLHandleMotionPreferenceChange() {
  FLHideCustomCursor();

  FLRebuildAnimations({
    preservePosition: true,
  });
}

/* =========================================================
   48 — DISCIPLINE MODAL EVENT
   ========================================================= */

function FLInitialiseModalAnimationEvents() {
  window.addEventListener(
    "flDisciplineModalChange",
    FLHandleDisciplineModalChange,
  );

  window.addEventListener("flProjectModalChange", FLHandleProjectModalChange);
}

/* =========================================================
   49 — CLEAR ANIMATION SYSTEM
   ========================================================= */

function FLClearAnimations() {
  FLStopScrollTween();

  window.clearTimeout(FLAnimationState.refreshTimer);

  if (FLAnimationState.modals.discipline) {
    FLAnimationState.modals.discipline.kill?.();

    FLAnimationState.modals.discipline = null;
  }

  if (FLAnimationState.modals.project) {
    FLAnimationState.modals.project.kill?.();

    FLAnimationState.modals.project = null;
  }

  if (FLAnimationState.context) {
    FLAnimationState.context.revert();

    FLAnimationState.context = null;
  }

  ["welcome", "about", "services", "projects", "contact"].forEach(
    (sceneName) => {
      const state = FLAnimationState[sceneName];

      if (!state) {
        return;
      }

      state.timeline = null;

      state.scrollTrigger = null;

      if (sceneName === "about") {
        state.travelTimeline = null;
      }
    },
  );
}

/* =========================================================
   50 — BUILD ALL ANIMATIONS
   ========================================================= */

function FLBuildAllAnimations() {
  FLAnimationState.reducedMotion = FLIsReducedMotion();

  FLAnimationState.viewportMode = FLGetViewportMode();

  if (!FLHasGSAP()) {
    console.warn(
      "GSAP was not available. Portfolio is using its static fallback.",
    );

    return;
  }

  FLAnimationState.context = gsap.context(() => {
    FLBuildWelcomeScene();

    FLBuildAboutScene();

    FLBuildServicesScene();

    FLBuildProjectsScene();

    FLBuildContactScene();
  }, document.body);

  FLRefreshLayout(0);
}

/* =========================================================
   51 — CAPTURE CURRENT POSITION
   ========================================================= */

function FLCaptureCurrentPosition() {
  const sceneName =
    window.FLSite?.getCurrentScene?.() ||
    FLAnimationState.currentScene ||
    "welcome";

  if (sceneName === "welcome") {
    const progress =
      FLAnimationState.welcome.scrollTrigger?.progress ??
      FLAnimationState.welcome.progress ??
      0;

    return {
      scene: "welcome",

      welcomeProgress: FLClamp(progress),

      reducedStep: FLAnimationState.welcome.reducedStep,

      offset: 0,
    };
  }

  const scene = FLGetScene(sceneName);

  const sceneTop = FLGetAbsoluteTop(scene);

  return {
    scene: sceneName,

    welcomeProgress: 0,

    reducedStep: 0,

    offset: sceneTop === null ? 0 : Math.max(0, window.scrollY - sceneTop),
  };
}

/* =========================================================
   52 — RESTORE CAPTURED POSITION
   ========================================================= */

function FLRestoreCapturedPosition(captured) {
  if (!captured) {
    return;
  }

  const sceneName = captured.scene || "welcome";

  if (sceneName === "welcome") {
    if (FLIsReducedMotion() || !FLAnimationState.welcome.scrollTrigger) {
      FLSetReducedWelcomeStep(captured.reducedStep ?? 0);

      const scene = FLGetScene("welcome");

      const top = FLGetAbsoluteTop(scene);

      if (top !== null) {
        window.scrollTo({
          top,
          behavior: "auto",
        });
      }

      FLSetSceneActive("welcome");

      return;
    }

    const trigger = FLAnimationState.welcome.scrollTrigger;

    const progress = FLClamp(captured.welcomeProgress ?? 0);

    const targetY = trigger.start + (trigger.end - trigger.start) * progress;

    window.scrollTo({
      top: Math.max(0, targetY),

      behavior: "auto",
    });

    FLAnimationState.welcome.progress = progress;

    FLUpdateWelcomeProgress(progress);

    FLSetSceneActive("welcome");

    FLHasScrollTrigger() && ScrollTrigger.update();

    return;
  }

  const scene = FLGetScene(sceneName);

  const sceneTop = FLGetAbsoluteTop(scene);

  if (sceneTop === null) {
    return;
  }

  const targetY = Math.max(0, sceneTop + (captured.offset || 0));

  window.scrollTo({
    top: targetY,

    behavior: "auto",
  });

  FLSetSceneActive(sceneName);

  FLHasScrollTrigger() && ScrollTrigger.update();
}

/* =========================================================
   53 — REBUILD ANIMATIONS
   ========================================================= */

function FLRebuildAnimations(options = {}) {
  if (FLAnimationState.rebuilding) {
    return false;
  }

  FLAnimationState.rebuilding = true;

  const { preservePosition = true } = options;

  const captured = preservePosition
    ? FLCaptureCurrentPosition()
    : {
        scene: "welcome",
        welcomeProgress: 0,
        reducedStep: 0,
        offset: 0,
      };

  FLClearAnimations();

  FLBuildAllAnimations();

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      FLHasScrollTrigger() && ScrollTrigger.refresh();

      if (preservePosition) {
        FLRestoreCapturedPosition(captured);
      }

      FLAnimationState.rebuilding = false;

      FLSynchroniseCustomCursor();
    });
  });

  return true;
}

/* =========================================================
   54 — RESIZE
   ========================================================= */

function FLHandleAnimationResize() {
  window.clearTimeout(FLAnimationState.resizeTimer);

  FLAnimationState.resizeTimer = window.setTimeout(() => {
    const nextMode = FLGetViewportMode();

    if (nextMode !== FLAnimationState.viewportMode) {
      FLRebuildAnimations({
        preservePosition: true,
      });

      return;
    }

    FLAnimationState.viewportMode = nextMode;

    FLRefreshLayout(10);
  }, 180);
}

/* =========================================================
   55 — ORIENTATION CHANGE
   ========================================================= */

function FLHandleOrientationChange() {
  window.setTimeout(() => {
    FLRebuildAnimations({
      preservePosition: true,
    });
  }, 220);
}

/* =========================================================
   56 — SCENE OBSERVATION SUPPORT
   ========================================================= */

function FLInitialiseSceneAwareness() {
  if (!FLHasScrollTrigger()) {
    return;
  }

  ["about", "services", "projects", "contact"].forEach((sceneName) => {
    const scene = FLGetScene(sceneName);

    if (!scene) {
      return;
    }

    ScrollTrigger.create({
      trigger: scene,

      start: "top 48%",

      end: "bottom 48%",

      onEnter() {
        FLSetSceneActive(sceneName);
      },

      onEnterBack() {
        FLSetSceneActive(sceneName);
      },
    });
  });
}

/* =========================================================
   57 — ACTIVE WELCOME CURSOR ON PROGRESS
   ========================================================= */

function FLInitialiseWelcomeCursorSync() {
  window.addEventListener(
    "scroll",
    () => {
      if (FLAnimationState.currentScene !== "welcome") {
        return;
      }

      FLSynchroniseCustomCursor();
    },
    {
      passive: true,
    },
  );
}

/* =========================================================
   58 — INITIALISE ANIMATION EVENTS
   ========================================================= */

function FLInitialiseAnimationEvents() {
  if (FLAnimationState.eventsInitialised) {
    return;
  }

  FLAnimationState.eventsInitialised = true;

  FLInitialiseScrollInterruption();

  FLInitialiseWelcomeContinue();

  FLInitialiseDisciplineHover();

  FLInitialiseProjectHover();

  FLInitialiseModalAnimationEvents();

  FLInitialiseWelcomeCursorSync();

  window.addEventListener("flSceneChange", FLHandleAnimationSceneChange);

  window.addEventListener("flLanguageChange", FLHandleLanguageChange);

  window.addEventListener("flFontSizeChange", FLHandleFontSizeChange);

  window.addEventListener(
    "flMotionPreferenceChange",
    FLHandleMotionPreferenceChange,
  );

  window.addEventListener("resize", FLHandleAnimationResize, {
    passive: true,
  });

  window.addEventListener("orientationchange", FLHandleOrientationChange, {
    passive: true,
  });

  window.addEventListener(
    "load",
    () => {
      FLRefreshLayout(20);
    },
    {
      once: true,
    },
  );

  document.fonts?.ready
    ?.then(() => {
      FLRefreshLayout(10);
    })
    .catch(() => {});
}

/* =========================================================
   59 — INITIAL SCENE POSITION
   ========================================================= */

function FLCorrectInitialScenePosition() {
  const sceneName = window.FLSite?.getCurrentScene?.() || "welcome";

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      FLHasScrollTrigger() && ScrollTrigger.refresh();

      if (sceneName === "welcome") {
        FLGoToScene("welcome", {
          landing: "intro",

          immediate: true,
        });

        return;
      }

      FLGoToScene(sceneName, {
        landing: "ready",

        immediate: true,
      });
    });
  });
}

/* =========================================================
   60 — STATIC FALLBACK VISIBILITY
   ========================================================= */

function FLApplyStaticFallback() {
  if (FLHasGSAP()) {
    return;
  }

  document
    .querySelectorAll(
      [
        ".welcome__intro",
        ".welcome-specialism",
        ".welcome__statement",
        ".about__content",
        ".travel-story",
        ".discipline",
        ".selected-project",
        ".contact__content",
      ].join(","),
    )
    .forEach((element) => {
      element.style.opacity = "1";

      element.style.visibility = "visible";

      element.style.transform = "none";
    });
}

/* =========================================================
   61 — INITIALISE
   ========================================================= */

function FLInitialiseAnimations() {
  if (FLAnimationState.ready) {
    FLRebuildAnimations({
      preservePosition: true,
    });

    return;
  }

  FLAnimationState.ready = true;

  FLAnimationState.currentScene =
    window.FLSite?.getCurrentScene?.() || "welcome";

  FLAnimationState.reducedMotion = FLIsReducedMotion();

  FLAnimationState.viewportMode = FLGetViewportMode();

  FLInitialiseAnimationEvents();

  FLInitialiseCustomCursor();

  if (!FLHasGSAP()) {
    FLApplyStaticFallback();

    return;
  }

  FLBuildAllAnimations();

  if (FLHasScrollTrigger()) {
    FLInitialiseSceneAwareness();
  }

  FLCorrectInitialScenePosition();

  window.requestAnimationFrame(() => {
    FLSynchroniseCustomCursor();
  });
}

/* =========================================================
   62 — PUBLIC ANIMATION API
   ========================================================= */

window.FLAnimations = {
  /* -------------------------------------------------
     SCENE NAVIGATION
     ------------------------------------------------- */

  goToScene(sceneName, options = {}) {
    return FLGoToScene(sceneName, options);
  },

  advanceScene(sceneName) {
    return FLAdvanceScene(sceneName);
  },

  /* -------------------------------------------------
     PROJECTS
     ------------------------------------------------- */

  changeProject(projectId) {
    return FLChangeProject(projectId);
  },

  /* -------------------------------------------------
     LEGACY COMPATIBILITY

     These remain temporarily while projects.js is still
     being replaced. There is no longer a project-reading
     scroll mode.
     ------------------------------------------------- */

  setProjectReadingMode(enabled, options = {}) {
    return FLSetProjectReadingMode(enabled, options);
  },

  isProjectReadingMode() {
    return false;
  },

  /* -------------------------------------------------
     WELCOME
     ------------------------------------------------- */

  advanceWelcome() {
    return FLAdvanceWelcome();
  },

  getWelcomeProgress() {
    return (
      FLAnimationState.welcome.scrollTrigger?.progress ??
      FLAnimationState.welcome.progress ??
      0
    );
  },

  /* -------------------------------------------------
     LAYOUT
     ------------------------------------------------- */

  refresh() {
    FLRefreshLayout();
  },

  rebuild(options = {}) {
    return FLRebuildAnimations(options);
  },

  /* -------------------------------------------------
     AUTOPLAY
     ------------------------------------------------- */

  isAutoPlaying() {
    return Boolean(FLAnimationState.autoPlay.active);
  },

  cancelAutoPlay() {
    FLStopScrollTween();
  },

  /* -------------------------------------------------
     STATE
     ------------------------------------------------- */

  getState() {
    return FLAnimationState;
  },
};

/* =========================================================
   63 — RUN
   ========================================================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", FLInitialiseAnimations, {
    once: true,
  });
} else {
  FLInitialiseAnimations();
}
