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
  },

  about: {
    timeline: null,
    scrollTrigger: null,
  },

  services: {
    timeline: null,
    scrollTrigger: null,
  },

  projects: {
    timeline: null,
    scrollTrigger: null,
    currentProjectIndex: 0,
  },

  contact: {
    timeline: null,
    scrollTrigger: null,
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
  return document.documentElement.dataset.reduceMotion === "true";
}

function FLIsMobile() {
  return window.innerWidth <= 720;
}

function FLIsTablet() {
  return window.innerWidth <= 960;
}

function FLClamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function FLGetScene(sceneName) {
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

/* =========================================================
   04 — ACTIVE SCENE
   ========================================================= */

function FLSetSceneActive(sceneName) {
  if (!sceneName) {
    return;
  }

  FLAnimationState.currentScene = sceneName;

  window.FLSite?.setActiveScene?.(sceneName);
}

/* =========================================================
   05 — SCROLL TWEEN CONTROL
   ========================================================= */

function FLStopScrollTween() {
  if (FLAnimationState.scrollTween) {
    FLAnimationState.scrollTween.kill();

    FLAnimationState.scrollTween = null;
  }

  FLAnimationState.autoPlay.active = false;

  FLAnimationState.autoPlay.scene = null;
}

/* =========================================================
   06 — SMOOTH PROGRAMMATIC SCROLL

   GSAP owns all automatic scene movement.

   CSS smooth scrolling is temporarily disabled during these
   movements so the browser and GSAP never fight each other.

   This is especially important for longer choreographed
   transitions such as Welcome and About.
   ========================================================= */

function FLScrollToY(targetY, options = {}) {
  const {
    duration = 0.9,
    ease = "power3.inOut",
    immediate = false,
    onComplete = null,
  } = options;

  const safeTarget = Math.max(0, targetY);

  FLStopScrollTween();

  if (!FLHasGSAP() || immediate || FLIsReducedMotion()) {
    window.scrollTo({
      top: safeTarget,
      behavior: "auto",
    });

    if (FLHasScrollTrigger()) {
      ScrollTrigger.update();
    }

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

      if (FLHasScrollTrigger()) {
        ScrollTrigger.update();
      }

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
   07 — TIMELINE LABEL HELPERS
   ========================================================= */

function FLGetLabelProgress(sceneName, label) {
  const timeline = FLGetSceneState(sceneName)?.timeline;

  if (!timeline || timeline.labels[label] === undefined) {
    return null;
  }

  const duration = timeline.duration();

  if (!duration) {
    return 0;
  }

  return FLClamp(timeline.labels[label] / duration);
}

function FLGetFallbackLandingProgress(sceneName, landing) {
  if (landing === "intro") {
    return 0.02;
  }

  const defaults = {
    welcome: 0.04,
    about: 0.42,
    services: 0.72,
    projects: 0.24,
    contact: 0.64,
  };

  return defaults[sceneName] ?? 0.08;
}

function FLResolveLandingProgress(sceneName, landing) {
  const labelledProgress = FLGetLabelProgress(sceneName, landing);

  if (labelledProgress !== null) {
    return labelledProgress;
  }

  return FLGetFallbackLandingProgress(sceneName, landing);
}

/* =========================================================
   08 — SCENE LANDING POSITION
   ========================================================= */

function FLGetSceneLandingY(sceneName, landing = "ready") {
  const scene = FLGetScene(sceneName);

  if (!scene) {
    return null;
  }

  const trigger = FLGetSceneState(sceneName)?.scrollTrigger;

  if (trigger) {
    const progress = FLResolveLandingProgress(sceneName, landing);

    return trigger.start + (trigger.end - trigger.start) * progress;
  }

  const rect = scene.getBoundingClientRect();

  return window.scrollY + rect.top;
}

/* =========================================================
   09 — GO DIRECTLY TO A SCENE
   ========================================================= */

function FLGoToScene(sceneName, options = {}) {
  const scene = FLGetScene(sceneName);

  if (!scene) {
    return false;
  }

  const {
    landing = sceneName === "welcome" ? "intro" : "ready",

    immediate = false,

    duration = 0.95,
  } = options;

  const targetY = FLGetSceneLandingY(sceneName, landing);

  if (targetY === null) {
    return false;
  }

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
   10 — AUTOMATIC SCENE PLAYBACK

   Continue does not jump between finished states.

   It scrolls through the same GSAP timeline used by manual
   scrolling, allowing the visitor to actually watch the
   animation happen.

   Individual scenes can request longer timings when their
   choreography deserves more breathing room.
   ========================================================= */

function FLPlaySceneToNext(sceneName, nextScene, options = {}) {
  if (!sceneName || !nextScene) {
    return false;
  }

  if (FLAnimationState.autoPlay.active) {
    return false;
  }

  if (FLIsReducedMotion()) {
    return FLGoToScene(nextScene, {
      landing: options.nextLanding ?? "ready",

      duration: 0.5,
    });
  }

  const targetY = FLGetSceneLandingY(nextScene, options.nextLanding ?? "ready");

  if (targetY === null) {
    return false;
  }

  const distance = Math.abs(targetY - window.scrollY);

  const viewportDistance = distance / Math.max(window.innerHeight, 1);

  const minimumDuration = options.minimumDuration ?? 1.8;

  const maximumDuration = options.maximumDuration ?? 3.2;

  const duration = FLClamp(
    0.9 + viewportDistance * 0.72,

    minimumDuration,

    maximumDuration,
  );

  const tween = FLScrollToY(targetY, {
    duration,

    ease: options.ease ?? "power2.inOut",

    onComplete() {
      FLSetSceneActive(nextScene);
    },
  });

  if (!tween) {
    return true;
  }

  FLAnimationState.autoPlay.active = true;

  FLAnimationState.autoPlay.scene = sceneName;

  return true;
}

/* =========================================================
   11 — MANUAL INPUT CANCELS AUTOPLAY
   ========================================================= */

function FLCancelAutoPlayFromUserInput() {
  if (!FLAnimationState.autoPlay.active) {
    return;
  }

  FLStopScrollTween();
}

/* =========================================================
   12 — WELCOME PROGRESS INDICATOR
   ========================================================= */

function FLUpdateWelcomeProgress(progress) {
  const safeProgress = FLClamp(progress);

  FLAnimationState.welcome.progress = safeProgress;

  let step = 0;

  if (safeProgress >= 0.84) {
    step = 3;
  } else if (safeProgress >= 0.61) {
    step = 2;
  } else if (safeProgress >= 0.23) {
    step = 1;
  }

  if (step === FLAnimationState.welcome.step) {
    return;
  }

  FLAnimationState.welcome.step = step;

  const steps = document.querySelectorAll("[data-welcome-progress] > span");

  steps.forEach((item, index) => {
    item.classList.toggle("is-active", index === step);
  });
}

/* =========================================================
   13 — WELCOME PREPARATION
   ========================================================= */

function FLPrepareWelcomeScene() {
  const scene = FLGetScene("welcome");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  const elements = [
    scene.querySelector(".welcome__eyebrow"),

    scene.querySelector(".welcome__title-small"),

    scene.querySelector("[data-welcome-name]"),

    ...scene.querySelectorAll(".welcome-specialism"),

    scene.querySelector(".welcome__statement-text"),

    scene.querySelector(".scene-progress"),

    ...scene.querySelectorAll(".shape"),
  ].filter(Boolean);

  gsap.set(elements, {
    clearProps: "transform,opacity,visibility",
  });
}

/* =========================================================
   14 — REDUCED MOTION WELCOME

   Reduced-motion visitors receive one clean static opening
   composition instead of multiple states occupying the same
   space at once.
   ========================================================= */

function FLBuildReducedWelcome() {
  FLPrepareWelcomeScene();

  const scene = FLGetScene("welcome");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  const eyebrow = scene.querySelector(".welcome__eyebrow");

  const titleSmall = scene.querySelector(".welcome__title-small");

  const name = scene.querySelector("[data-welcome-name]");

  const specialisms = scene.querySelectorAll(".welcome-specialism");

  const statement = scene.querySelector(".welcome__statement-text");

  const progress = scene.querySelector(".scene-progress");

  gsap.set([eyebrow, titleSmall, name, progress].filter(Boolean), {
    autoAlpha: 1,
  });

  gsap.set(specialisms, {
    autoAlpha: 0,
  });

  gsap.set(statement, {
    autoAlpha: 0,
  });

  FLAnimationState.welcome.timeline = null;

  FLAnimationState.welcome.scrollTrigger = null;
}

/* =========================================================
   15 — WELCOME MASTER TIMELINE

   Choreography:

   Hello & Welcome
   ↓
   Portfolio of F.Liyanto
   ↓
   intro disappears completely
   ↓
   UI Design / Interaction Design / Front-End
   ↓
   visual breathing room
   ↓
   "I like making digital things feel alive."
   ↓
   About

   The background shapes remain visible throughout the main
   Welcome choreography so all states feel like one scene
   rather than separate presentation slides.
   ========================================================= */

function FLBuildWelcomeScene() {
  const scene = FLGetScene("welcome");

  if (!scene || !FLHasGSAP() || !FLHasScrollTrigger()) {
    return;
  }

  if (FLIsReducedMotion()) {
    FLBuildReducedWelcome();

    return;
  }

  FLPrepareWelcomeScene();

  const eyebrow = scene.querySelector(".welcome__eyebrow");

  const titleSmall = scene.querySelector(".welcome__title-small");

  const name = scene.querySelector("[data-welcome-name]");

  const ui = scene.querySelector(".welcome-specialism--ui");

  const interaction = scene.querySelector(".welcome-specialism--interaction");

  const frontend = scene.querySelector(".welcome-specialism--frontend");

  const specialisms = [ui, interaction, frontend].filter(Boolean);

  const statement = scene.querySelector(".welcome__statement-text");

  const progress = scene.querySelector(".scene-progress");

  const shapeOne = scene.querySelector("[data-shape='welcome-one']");

  const shapeTwo = scene.querySelector("[data-shape='welcome-two']");

  const shapeThree = scene.querySelector("[data-shape='welcome-three']");

  const shapeFour = scene.querySelector("[data-shape='welcome-four']");

  /* =====================================================
     INITIAL STATE
     ===================================================== */

  gsap.set([eyebrow, titleSmall, name, progress].filter(Boolean), {
    autoAlpha: 1,
  });

  /* Each discipline has its own entry direction so the
     composition assembles rather than simply popping in. */

  gsap.set(ui, {
    x: 70,
    y: -12,
    scale: 0.94,
    autoAlpha: 0,
  });

  gsap.set(interaction, {
    x: 0,
    y: 38,
    scale: 0.94,
    autoAlpha: 0,
  });

  gsap.set(frontend, {
    x: -70,
    y: 18,
    scale: 0.94,
    autoAlpha: 0,
  });

  gsap.set(statement, {
    y: 34,
    scale: 0.97,
    autoAlpha: 0,
  });

  /* =====================================================
     MASTER TIMELINE
     ===================================================== */

  const timeline = gsap.timeline({
    defaults: {
      ease: "none",
    },

    scrollTrigger: {
      trigger: scene,

      start: "top top",

      /*
       * Slightly longer scroll distance keeps the exact
       * choreography intact while giving the opening more
       * breathing room during manual scrolling.
       */

      end: () => `+=${window.innerHeight * 3.75}`,

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

  /* =====================================================
     STATE 01 — OPENING HOLD
     ===================================================== */

  timeline.addLabel("intro", 0);

  timeline.to(
    {},
    {
      duration: 0.58,
    },
  );

  /* -----------------------------------------------------
     Hello / Portfolio of fades first
     ----------------------------------------------------- */

  timeline.to(
    [eyebrow, titleSmall].filter(Boolean),
    {
      y: -22,

      autoAlpha: 0,

      duration: 0.72,

      ease: "power2.inOut",
    },
    0.52,
  );

  /* -----------------------------------------------------
     F.Liyanto exits COMPLETELY.

     Nothing from the name remains behind the specialisms.
     ----------------------------------------------------- */

  timeline.to(
    name,
    {
      y: -18,

      scale: 0.985,

      autoAlpha: 0,

      transformOrigin: "left center",

      duration: 0.82,

      ease: "power2.inOut",
    },
    0.6,
  );

  /* =====================================================
     BACKGROUND SHAPE MOTION

     Shapes never disappear during the specialism state.
     They simply drift gently behind the typography.
     ===================================================== */

  timeline.to(
    shapeOne,
    {
      xPercent: -12,

      yPercent: 8,

      rotation: 24,

      scale: 1.03,

      duration: 2.3,

      ease: "sine.inOut",
    },
    0.68,
  );

  timeline.to(
    shapeTwo,
    {
      xPercent: 15,

      yPercent: -12,

      scale: 1.07,

      duration: 2.3,

      ease: "sine.inOut",
    },
    0.68,
  );

  timeline.to(
    shapeThree,
    {
      xPercent: 12,

      yPercent: 14,

      rotation: -9,

      scale: 1.04,

      duration: 2.3,

      ease: "sine.inOut",
    },
    0.68,
  );

  timeline.to(
    shapeFour,
    {
      xPercent: -10,

      yPercent: -5,

      rotation: 27,

      duration: 2.3,

      ease: "sine.inOut",
    },
    0.68,
  );

  /* =====================================================
     BREATHING SPACE

     The intro is fully gone before anything new arrives.
     ===================================================== */

  timeline.to(
    {},
    {
      duration: 0.22,
    },
  );

  /* =====================================================
     STATE 02 — SPECIALISMS
     ===================================================== */

  timeline.addLabel("specialisms", 1.55);

  /* -----------------------------------------------------
     UI DESIGN
     ----------------------------------------------------- */

  timeline.to(
    ui,
    {
      x: 0,
      y: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.78,

      ease: "power3.out",
    },
    1.42,
  );

  /* -----------------------------------------------------
     INTERACTION DESIGN

     Main visual anchor enters second.
     ----------------------------------------------------- */

  timeline.to(
    interaction,
    {
      x: 0,
      y: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.84,

      ease: "power3.out",
    },
    1.6,
  );

  /* -----------------------------------------------------
     FRONT-END
     ----------------------------------------------------- */

  timeline.to(
    frontend,
    {
      x: 0,
      y: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.78,

      ease: "power3.out",
    },
    1.8,
  );

  /* -----------------------------------------------------
     SPECIALISM HOLD

     Give the visitor enough time to actually read the
     composition before we begin taking it away.
     ----------------------------------------------------- */

  timeline.addLabel("specialismsReady", 2.48);

  timeline.to(
    {},
    {
      duration: 0.82,
    },
  );

  /* =====================================================
     SPECIALISMS EXIT
     ===================================================== */

  timeline.to(
    ui,
    {
      x: 34,
      y: -16,

      scale: 0.975,

      autoAlpha: 0,

      duration: 0.66,

      ease: "power2.inOut",
    },
    3.18,
  );

  timeline.to(
    interaction,
    {
      y: -20,

      scale: 0.975,

      autoAlpha: 0,

      duration: 0.72,

      ease: "power2.inOut",
    },
    3.24,
  );

  timeline.to(
    frontend,
    {
      x: -34,
      y: -10,

      scale: 0.975,

      autoAlpha: 0,

      duration: 0.66,

      ease: "power2.inOut",
    },
    3.3,
  );

  /* =====================================================
     STATE 03 — PERSONAL STATEMENT
     ===================================================== */

  timeline.addLabel("statement", 3.78);

  timeline.to(
    statement,
    {
      y: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.88,

      ease: "power3.out",
    },
    3.7,
  );

  /* -----------------------------------------------------
     Statement resting state
     ----------------------------------------------------- */

  timeline.addLabel("ready", 4.36);

  timeline.to(
    {},
    {
      duration: 0.92,
    },
  );

  /* =====================================================
     STATE 04 — WELCOME EXIT
     ===================================================== */

  timeline.addLabel("exit", 5.18);

  timeline.to(
    statement,
    {
      y: -26,

      scale: 0.985,

      autoAlpha: 0,

      duration: 0.74,

      ease: "power2.inOut",
    },
    5.08,
  );

  timeline.to(
    progress,
    {
      y: 10,

      autoAlpha: 0,

      duration: 0.48,

      ease: "power2.inOut",
    },
    5.2,
  );

  /* -----------------------------------------------------
     The shapes only leave at the final transition into About.

     They stay present through:
     intro → specialisms → statement.
     ----------------------------------------------------- */

  timeline.to(
    [shapeOne, shapeTwo, shapeThree, shapeFour].filter(Boolean),
    {
      scale: 1.08,

      autoAlpha: 0,

      stagger: 0.035,

      duration: 0.7,

      ease: "power2.inOut",
    },
    5.22,
  );

  timeline.addLabel("complete", 5.98);

  FLAnimationState.welcome.timeline = timeline;

  FLAnimationState.welcome.scrollTrigger = timeline.scrollTrigger;
}

/* =========================================================
   16 — WELCOME CONTINUE

   One click now deliberately takes its time:

   intro
   → specialisms
   → statement
   → About

   It should feel like watching one designed animation,
   rather than rapidly clicking through presentation slides.
   ========================================================= */

function FLAdvanceWelcome() {
  return FLPlaySceneToNext("welcome", "about", {
    nextLanding: "ready",

    minimumDuration: 6.5,

    maximumDuration: 7.6,

    ease: "sine.inOut",
  });
}
/* =========================================================
   17 — ABOUT PREPARATION
   ========================================================= */

function FLPrepareAboutScene() {
  const scene = FLGetScene("about");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  const elements = [
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

  gsap.set(elements, {
    clearProps: "transform,opacity,visibility,strokeDashoffset,strokeDasharray",
  });
}

/* =========================================================
   18 — REDUCED MOTION ABOUT
   ========================================================= */

function FLBuildReducedAbout() {
  FLPrepareAboutScene();

  const scene = FLGetScene("about");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  const plane = scene.querySelector("[data-travel-plane]");

  const path = scene.querySelector("[data-travel-path]");

  const destination = scene.querySelector("[data-travel-destination]");

  gsap.set(destination, {
    autoAlpha: 1,
  });

  gsap.set(plane, {
    autoAlpha: 0,
  });

  if (path) {
    gsap.set(path, {
      strokeDashoffset: 0,
    });
  }

  FLAnimationState.about.timeline = null;

  FLAnimationState.about.scrollTrigger = null;
}

/* =========================================================
   19 — ABOUT MASTER TIMELINE

   About intentionally moves more slowly than before.

   Sequence:

   Introduction
   ↓
   Surabaya / Melbourne travel card
   ↓
   Plane appears
   ↓
   Plane travels once from Surabaya to Melbourne
   ↓
   Arrival settles
   ↓
   What I Do

   Manual scrolling still controls the same choreography.
   ========================================================= */

function FLBuildAboutScene() {
  const scene = FLGetScene("about");

  if (!scene || !FLHasGSAP() || !FLHasScrollTrigger()) {
    return;
  }

  if (FLIsReducedMotion()) {
    FLBuildReducedAbout();

    return;
  }

  FLPrepareAboutScene();

  const eyebrow = scene.querySelector(".about__eyebrow");

  const title = scene.querySelector(".about__title");

  const paragraphs = scene.querySelectorAll(".about__story p");

  const travelStory = scene.querySelector("[data-travel-story]");

  const origin = scene.querySelector("[data-travel-origin]");

  const destination = scene.querySelector("[data-travel-destination]");

  const originDot = origin?.querySelector(".travel-location__dot");

  const destinationDot = destination?.querySelector(".travel-location__dot");

  const plane = scene.querySelector("[data-travel-plane]");

  const path = scene.querySelector("[data-travel-path]");

  const nextButton = scene.querySelector(".scene-next");

  const shapeOne = scene.querySelector("[data-shape='about-one']");

  const shapeTwo = scene.querySelector("[data-shape='about-two']");

  const shapeThree = scene.querySelector("[data-shape='about-three']");

  /* =====================================================
     INITIAL STATE
     ===================================================== */

  gsap.set(eyebrow, {
    y: 18,

    autoAlpha: 0,
  });

  gsap.set(title, {
    y: 26,

    autoAlpha: 0,
  });

  gsap.set(paragraphs, {
    y: 20,

    autoAlpha: 0,
  });

  gsap.set(travelStory, {
    y: 38,

    scale: 0.975,

    autoAlpha: 0,
  });

  gsap.set(origin, {
    autoAlpha: 1,
  });

  gsap.set(destination, {
    autoAlpha: 0.34,
  });

  gsap.set(originDot, {
    scale: 0.72,
  });

  gsap.set(destinationDot, {
    scale: 0.62,
  });

  gsap.set(plane, {
    scale: 0.92,

    autoAlpha: 0,
  });

  gsap.set(nextButton, {
    y: 12,

    autoAlpha: 0,
  });

  if (path) {
    const pathLength = path.getTotalLength?.() || 120;

    gsap.set(path, {
      strokeDasharray: pathLength,

      strokeDashoffset: pathLength,
    });
  }

  /* =====================================================
     MASTER TIMELINE
     ===================================================== */

  const timeline = gsap.timeline({
    defaults: {
      ease: "none",
    },

    scrollTrigger: {
      trigger: scene,

      start: "top top",

      /*
       * More scroll distance gives the flight enough visual
       * time when either scrolling or clicking Continue.
       */

      end: () => `+=${window.innerHeight * 2.75}`,

      pin: true,

      pinSpacing: true,

      scrub: 0.24,

      anticipatePin: 1,

      invalidateOnRefresh: true,

      onEnter() {
        FLSetSceneActive("about");
      },

      onEnterBack() {
        FLSetSceneActive("about");
      },

      onLeave() {
        FLSetSceneActive("services");
      },

      onLeaveBack() {
        FLSetSceneActive("welcome");
      },
    },
  });

  /* =====================================================
     ABOUT INTRODUCTION
     ===================================================== */

  timeline.addLabel("intro", 0);

  timeline.to(
    eyebrow,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.48,

      ease: "power3.out",
    },
    0.08,
  );

  timeline.to(
    title,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.62,

      ease: "power3.out",
    },
    0.16,
  );

  timeline.to(
    paragraphs,
    {
      y: 0,

      autoAlpha: 1,

      stagger: 0.1,

      duration: 0.52,

      ease: "power2.out",
    },
    0.34,
  );

  /* -----------------------------------------------------
     Background movement stays deliberately subtle.
     ----------------------------------------------------- */

  timeline.to(
    shapeOne,
    {
      xPercent: -9,

      yPercent: 7,

      rotation: 6,

      duration: 1.15,

      ease: "sine.inOut",
    },
    0.1,
  );

  timeline.to(
    shapeTwo,
    {
      xPercent: 10,

      yPercent: -5,

      rotation: -5,

      duration: 1.15,

      ease: "sine.inOut",
    },
    0.1,
  );

  /* =====================================================
     TRAVEL STORY APPEARS
     ===================================================== */

  timeline.addLabel("travel", 0.82);

  timeline.to(
    travelStory,
    {
      y: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.72,

      ease: "power3.out",
    },
    0.7,
  );

  timeline.to(
    originDot,
    {
      scale: 1,

      duration: 0.4,

      ease: "back.out(1.6)",
    },
    0.94,
  );

  /*
   * Navigation to About lands here.
   *
   * The visitor can read the section before the flight begins.
   */

  timeline.addLabel("ready", 1.42);

  timeline.to(
    {},
    {
      duration: 0.4,
    },
  );

  /* =====================================================
     SURABAYA → MELBOURNE FLIGHT
     ===================================================== */

  timeline.addLabel("flight", 1.82);

  /* -----------------------------------------------------
     Draw the route gradually.
     ----------------------------------------------------- */

  if (path) {
    timeline.to(
      path,
      {
        strokeDashoffset: 0,

        duration: 1.55,

        ease: "sine.inOut",
      },
      1.72,
    );
  }

  /* -----------------------------------------------------
     Plane appears gently at Surabaya.
     ----------------------------------------------------- */

  timeline.to(
    plane,
    {
      scale: 1,

      autoAlpha: 1,

      duration: 0.38,

      ease: "power2.out",
    },
    1.72,
  );

  /* -----------------------------------------------------
     Primary plane journey

     This is intentionally much slower than the old flight.
     ----------------------------------------------------- */

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

        duration: 1.75,

        ease: "sine.inOut",
      },
      1.82,
    );
  } else {
    timeline.to(
      plane,
      {
        x: () => Math.max(180, (travelStory?.clientWidth || 500) * 0.48),

        y: -8,

        duration: 1.75,

        ease: "sine.inOut",
      },
      1.82,
    );
  }

  /* -----------------------------------------------------
     Surabaya softly recedes while Melbourne becomes active.
     ----------------------------------------------------- */

  timeline.to(
    origin,
    {
      autoAlpha: 0.58,

      duration: 0.72,

      ease: "power2.inOut",
    },
    2.64,
  );

  timeline.to(
    destination,
    {
      autoAlpha: 1,

      duration: 0.72,

      ease: "power2.out",
    },
    2.72,
  );

  /* =====================================================
     MELBOURNE ARRIVAL
     ===================================================== */

  timeline.addLabel("arrival", 3.52);

  timeline.to(
    destinationDot,
    {
      scale: 1.12,

      duration: 0.42,

      ease: "back.out(1.7)",
    },
    3.42,
  );

  timeline.to(
    shapeThree,
    {
      xPercent: 14,

      yPercent: -10,

      scale: 1.08,

      duration: 0.7,

      ease: "power2.out",
    },
    3.38,
  );

  /* -----------------------------------------------------
     Plane settles rather than vanishing immediately.
     ----------------------------------------------------- */

  timeline.to(
    plane,
    {
      scale: 0.9,

      autoAlpha: 0,

      duration: 0.48,

      ease: "power2.in",
    },
    3.55,
  );

  timeline.to(
    nextButton,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.42,

      ease: "power2.out",
    },
    3.58,
  );

  timeline.addLabel("arrivalReady", 3.98);

  /* -----------------------------------------------------
     Arrival hold
     ----------------------------------------------------- */

  timeline.to(
    {},
    {
      duration: 0.62,
    },
  );

  /* =====================================================
     ABOUT EXIT
     ===================================================== */

  timeline.addLabel("exit", 4.58);

  timeline.to(
    [eyebrow, title, ...paragraphs].filter(Boolean),
    {
      y: -16,

      autoAlpha: 0,

      stagger: 0.025,

      duration: 0.52,

      ease: "power2.inOut",
    },
    4.5,
  );

  timeline.to(
    travelStory,
    {
      y: -18,

      scale: 0.985,

      autoAlpha: 0,

      duration: 0.58,

      ease: "power2.inOut",
    },
    4.54,
  );

  timeline.to(
    nextButton,
    {
      y: -10,

      autoAlpha: 0,

      duration: 0.4,

      ease: "power2.inOut",
    },
    4.58,
  );

  timeline.addLabel("complete", 5.22);

  FLAnimationState.about.timeline = timeline;

  FLAnimationState.about.scrollTrigger = timeline.scrollTrigger;
}

/* =========================================================
   20 — ABOUT CONTINUE

   The plane journey is now intentionally visible when the
   visitor clicks Continue.

   About
   → flight
   → Melbourne arrival
   → What I Do
   ========================================================= */

function FLAdvanceAbout() {
  return FLPlaySceneToNext("about", "services", {
    nextLanding: "ready",

    minimumDuration: 5.2,

    maximumDuration: 6.4,

    ease: "sine.inOut",
  });
}

/* =========================================================
   21 — SERVICES PREPARATION
   ========================================================= */

function FLPrepareServicesScene() {
  const scene = FLGetScene("services");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  const elements = [
    scene.querySelector(".services__eyebrow"),

    scene.querySelector(".services__title"),

    scene.querySelector(".services__instruction"),

    scene.querySelector(".scene-indicator"),

    scene.querySelector(".scene-next--projects"),

    ...scene.querySelectorAll(".discipline"),

    ...scene.querySelectorAll(".discipline__trigger"),

    ...scene.querySelectorAll(".shape"),
  ].filter(Boolean);

  gsap.set(elements, {
    clearProps: "transform,opacity,visibility,clipPath,filter",
  });
}

/* =========================================================
   22 — REDUCED MOTION SERVICES
   ========================================================= */

function FLBuildReducedServices() {
  FLPrepareServicesScene();

  FLAnimationState.services.timeline = null;

  FLAnimationState.services.scrollTrigger = null;
}

/* =========================================================
   23 — SERVICES MASTER TIMELINE

   What I Do is intentionally calmer than the opening.

   The four cards enter as a coordinated group and settle
   into their interactive state.
   ========================================================= */

function FLBuildServicesScene() {
  const scene = FLGetScene("services");

  if (!scene || !FLHasGSAP() || !FLHasScrollTrigger()) {
    return;
  }

  if (FLIsReducedMotion()) {
    FLBuildReducedServices();

    return;
  }

  FLPrepareServicesScene();

  const indicator = scene.querySelector(".scene-indicator");

  const eyebrow = scene.querySelector(".services__eyebrow");

  const title = scene.querySelector(".services__title");

  const instruction = scene.querySelector(".services__instruction");

  const disciplines = [
    scene.querySelector(".discipline--ui"),

    scene.querySelector(".discipline--interaction"),

    scene.querySelector(".discipline--frontend"),

    scene.querySelector(".discipline--web"),
  ].filter(Boolean);

  const triggers = scene.querySelectorAll(".discipline__trigger");

  const nextButton = scene.querySelector(".scene-next--projects");

  const shapeOne = scene.querySelector("[data-shape='services-one']");

  const shapeTwo = scene.querySelector("[data-shape='services-two']");

  /* =====================================================
     INITIAL STATE
     ===================================================== */

  gsap.set(indicator, {
    autoAlpha: 1,
  });

  gsap.set(eyebrow, {
    y: 12,

    autoAlpha: 0,
  });

  gsap.set(title, {
    y: 20,

    autoAlpha: 0,
  });

  gsap.set(instruction, {
    y: 10,

    autoAlpha: 0,
  });

  gsap.set(disciplines, {
    y: 34,

    scale: 0.975,

    autoAlpha: 0,
  });

  gsap.set(triggers, {
    autoAlpha: 1,
  });

  gsap.set(nextButton, {
    y: 10,

    autoAlpha: 0,
  });

  /* =====================================================
     MASTER TIMELINE
     ===================================================== */

  const timeline = gsap.timeline({
    defaults: {
      ease: "none",
    },

    scrollTrigger: {
      trigger: scene,

      start: "top top",

      end: () => `+=${window.innerHeight * 1.9}`,

      pin: true,

      pinSpacing: true,

      scrub: 0.22,

      anticipatePin: 1,

      invalidateOnRefresh: true,

      onEnter() {
        FLSetSceneActive("services");
      },

      onEnterBack() {
        FLSetSceneActive("services");
      },

      onLeave() {
        window.FLSite?.closeActiveDiscipline?.();

        FLSetSceneActive("projects");
      },

      onLeaveBack() {
        window.FLSite?.closeActiveDiscipline?.();

        FLSetSceneActive("about");
      },
    },
  });

  /* =====================================================
     INTRODUCTION
     ===================================================== */

  timeline.addLabel("intro", 0);

  timeline.to(
    eyebrow,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.38,

      ease: "power3.out",
    },
    0.05,
  );

  timeline.to(
    title,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.52,

      ease: "power3.out",
    },
    0.12,
  );

  timeline.to(
    instruction,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.38,

      ease: "power2.out",
    },
    0.28,
  );

  /* =====================================================
     DISCIPLINE REVEAL
     ===================================================== */

  timeline.addLabel("disciplines", 0.58);

  timeline.to(
    disciplines,
    {
      y: 0,

      scale: 1,

      autoAlpha: 1,

      stagger: {
        each: 0.1,

        from: "start",
      },

      duration: 0.58,

      ease: "power3.out",
    },
    0.5,
  );

  /* =====================================================
     SOFT BACKGROUND MOTION
     ===================================================== */

  timeline.to(
    shapeOne,
    {
      xPercent: 18,

      yPercent: 14,

      rotation: 12,

      scale: 1.05,

      duration: 1.15,

      ease: "sine.inOut",
    },
    0.44,
  );

  timeline.to(
    shapeTwo,
    {
      xPercent: -16,

      yPercent: -12,

      rotation: -10,

      scale: 1.04,

      duration: 1.15,

      ease: "sine.inOut",
    },
    0.44,
  );

  /* =====================================================
     INTERACTIVE RESTING STATE
     ===================================================== */

  timeline.addLabel("ready", 1.38);

  timeline.to(
    nextButton,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.4,

      ease: "power2.out",
    },
    1.24,
  );

  timeline.to(
    {},
    {
      duration: 0.55,
    },
  );

  /* =====================================================
     SERVICES EXIT
     ===================================================== */

  timeline.addLabel("exit", 1.9);

  timeline.to(
    instruction,
    {
      y: -8,

      autoAlpha: 0,

      duration: 0.34,

      ease: "power2.inOut",
    },
    1.9,
  );

  timeline.to(
    disciplines,
    {
      y: -18,

      scale: 0.985,

      autoAlpha: 0,

      stagger: {
        each: 0.045,

        from: "end",
      },

      duration: 0.44,

      ease: "power2.inOut",
    },
    1.94,
  );

  timeline.to(
    [title, eyebrow].filter(Boolean),
    {
      y: -12,

      autoAlpha: 0,

      stagger: 0.035,

      duration: 0.4,

      ease: "power2.inOut",
    },
    2.02,
  );

  timeline.to(
    nextButton,
    {
      y: -8,

      autoAlpha: 0,

      duration: 0.3,

      ease: "power2.inOut",
    },
    2.04,
  );

  timeline.to(
    [shapeOne, shapeTwo].filter(Boolean),
    {
      scale: 1.08,

      autoAlpha: 0,

      duration: 0.44,

      ease: "power2.inOut",
    },
    2,
  );

  timeline.addLabel("complete", 2.5);

  FLAnimationState.services.timeline = timeline;

  FLAnimationState.services.scrollTrigger = timeline.scrollTrigger;
}

/* =========================================================
   24 — SERVICES CONTINUE
   ========================================================= */

function FLAdvanceServices() {
  window.FLSite?.closeActiveDiscipline?.();

  return FLPlaySceneToNext("services", "projects", {
    nextLanding: "ready",

    minimumDuration: 2.8,

    maximumDuration: 3.8,

    ease: "sine.inOut",
  });
}

/* =========================================================
   25 — DISCIPLINE INTERACTION ANIMATION

   IMPORTANT:

   CSS owns the expanded-card geometry.

   GSAP must NOT leave scale / translate transforms fighting
   the active-card CSS, otherwise the expanded card can jump
   downward or lose its vertical centring.
   ========================================================= */

function FLHandleDisciplineChange(event) {
  if (FLIsReducedMotion() || !FLHasGSAP()) {
    return;
  }

  const scene = FLGetScene("services");

  if (!scene) {
    return;
  }

  const disciplineId = event.detail?.discipline;

  const activeDiscipline = disciplineId
    ? scene.querySelector(`[data-discipline="${disciplineId}"]`)
    : null;

  const disciplines = [...scene.querySelectorAll(".discipline")];

  const title = scene.querySelector(".services__title");

  const eyebrow = scene.querySelector(".services__eyebrow");

  const instruction = scene.querySelector(".services__instruction");

  /* =====================================================
     DISCIPLINE OPENED
     ===================================================== */

  if (activeDiscipline) {
    /*
     * Kill hover movement before switching geometry.
     */

    disciplines.forEach((discipline) => {
      gsap.killTweensOf(discipline);
    });

    /*
     * Active cards use top: 50% in CSS.
     *
     * yPercent -50 keeps the card centred vertically while
     * still allowing GSAP to coexist with that CSS geometry.
     */

    gsap.set(activeDiscipline, {
      x: 0,

      y: 0,

      xPercent: 0,

      yPercent: -50,

      scale: 1,

      autoAlpha: 1,
    });

    /*
     * The surrounding heading becomes quieter, but remains
     * visible enough that the visitor still understands the
     * section context.
     */

    gsap.to([title, eyebrow, instruction].filter(Boolean), {
      autoAlpha: 0.28,

      duration: 0.35,

      ease: "power2.out",

      overwrite: "auto",
    });

    return;
  }

  /* =====================================================
     DISCIPLINE CLOSED
     ===================================================== */

  disciplines.forEach((discipline) => {
    gsap.killTweensOf(discipline);
  });

  /*
   * Return cards to their normal 2×2 resting geometry.
   */

  gsap.set(disciplines, {
    x: 0,

    y: 0,

    xPercent: 0,

    yPercent: 0,

    scale: 1,

    autoAlpha: 1,
  });

  gsap.to([title, eyebrow, instruction].filter(Boolean), {
    autoAlpha: 1,

    duration: 0.34,

    ease: "power2.out",

    overwrite: "auto",
  });
}

/* =========================================================
   26 — DISCIPLINE HOVER MOTION
   ========================================================= */

function FLInitialiseDisciplineHover() {
  if (FLIsMobile() || !FLHasGSAP()) {
    return;
  }

  document.querySelectorAll(".discipline").forEach((discipline) => {
    const trigger = discipline.querySelector(".discipline__trigger");

    if (!trigger) {
      return;
    }

    trigger.addEventListener("mouseenter", () => {
      if (
        discipline.classList.contains("is-expanded") ||
        discipline.classList.contains("is-active")
      ) {
        return;
      }

      gsap.to(discipline, {
        y: -5,

        scale: 1.008,

        duration: 0.3,

        ease: "power2.out",

        overwrite: "auto",
      });
    });

    trigger.addEventListener("mouseleave", () => {
      if (
        discipline.classList.contains("is-expanded") ||
        discipline.classList.contains("is-active")
      ) {
        return;
      }

      gsap.to(discipline, {
        y: 0,

        scale: 1,

        duration: 0.34,

        ease: "power2.out",

        overwrite: "auto",
      });
    });
  });
}

/* =========================================================
   27 — DISCIPLINE EVENTS
   ========================================================= */

function FLInitialiseDisciplineAnimationEvents() {
  window.addEventListener("flDisciplineChange", FLHandleDisciplineChange);

  FLInitialiseDisciplineHover();
}
/* =========================================================
   28 — PROJECT CONSTANTS
   ========================================================= */

const FLProjectIds = ["nada-nusantara", "pulse-diary", "lega"];

const FLProjectLandingLabels = {
  "nada-nusantara": "nadaReady",

  "pulse-diary": "pulseReady",

  lega: "legaReady",
};

/* =========================================================
   29 — PROJECT HELPERS
   ========================================================= */

function FLGetProjectIdByIndex(index) {
  return FLProjectIds[index] || null;
}

function FLGetProjectIndex(projectId) {
  return FLProjectIds.indexOf(projectId);
}

function FLGetProjectPanel(projectId) {
  return document.querySelector(`[data-project-panel="${projectId}"]`);
}

/* =========================================================
   30 — PROJECT RAIL PROGRESS
   ========================================================= */

function FLSetProjectRailProgress(progress) {
  const fill = document.querySelector("[data-project-progress-fill]");

  if (!fill) {
    return;
  }

  const safeProgress = FLClamp(progress);

  const percentage = `${safeProgress * 100}%`;

  if (FLIsMobile()) {
    fill.style.width = percentage;

    fill.style.height = "100%";
  } else {
    fill.style.width = "100%";

    fill.style.height = percentage;
  }
}

/* =========================================================
   31 — PROJECT INDEX FROM SCROLL

   Three project states:

   0 = Nada Nusantara
   1 = Pulse Diary
   2 = Lega
   ========================================================= */

function FLGetProjectIndexFromProgress(progress) {
  const safeProgress = FLClamp(progress);

  const nadaProgress = FLResolveLandingProgress("projects", "nadaReady");

  const pulseProgress = FLResolveLandingProgress("projects", "pulseReady");

  const legaProgress = FLResolveLandingProgress("projects", "legaReady");

  const nadaPulseMidpoint = (nadaProgress + pulseProgress) / 2;

  const pulseLegaMidpoint = (pulseProgress + legaProgress) / 2;

  if (safeProgress < nadaPulseMidpoint) {
    return 0;
  }

  if (safeProgress < pulseLegaMidpoint) {
    return 1;
  }

  return 2;
}

/* =========================================================
   32 — NORMALISED PROJECT RAIL POSITION
   ========================================================= */

function FLGetProjectRailPosition(index) {
  if (FLProjectIds.length <= 1) {
    return 1;
  }

  const safeIndex = Math.max(0, Math.min(index, FLProjectIds.length - 1));

  return safeIndex / (FLProjectIds.length - 1);
}

/* =========================================================
   33 — SYNCHRONISE PROJECT STATE
   ========================================================= */

function FLSynchroniseProjectState(index) {
  const safeIndex = Math.max(0, Math.min(index, FLProjectIds.length - 1));

  const projectId = FLGetProjectIdByIndex(safeIndex);

  if (!projectId) {
    return;
  }

  const activeProject = window.getActiveFLProject?.();

  FLAnimationState.projects.currentProjectIndex = safeIndex;

  FLSetProjectRailProgress(FLGetProjectRailPosition(safeIndex));

  if (activeProject?.id === projectId) {
    return;
  }

  window.setActiveFLProject?.(projectId);
}

/* =========================================================
   34 — PROJECT SCENE PREPARATION
   ========================================================= */

function FLPrepareProjectsScene() {
  const scene = FLGetScene("projects");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  const elements = [
    scene.querySelector(".scene-indicator"),

    scene.querySelector(".projects__heading"),

    scene.querySelector(".projects__eyebrow"),

    scene.querySelector(".projects__title"),

    scene.querySelector("[data-project-stage]"),

    scene.querySelector(".project-progress"),

    scene.querySelector(".project-controls"),

    scene.querySelector(".projects__interaction-hint"),

    scene.querySelector(".scene-next--contact"),

    ...scene.querySelectorAll(".shape"),
  ].filter(Boolean);

  gsap.set(elements, {
    clearProps: "transform,opacity,visibility",
  });

  scene.querySelectorAll("[data-project-panel]").forEach((panel) => {
    gsap.set(panel, {
      clearProps:
        "transform,opacity,visibility,position,inset,display,pointerEvents,transition",
    });
  });
}

/* =========================================================
   35 — DESKTOP PROJECT PANEL SETUP

   Nada, Pulse and Lega all occupy the same coordinate
   system so changing project never moves the surrounding
   portfolio layout.
   ========================================================= */

function FLPrepareDesktopProjectPanels() {
  const scene = FLGetScene("projects");

  if (!scene || !FLHasGSAP()) {
    return;
  }

  const panels = FLProjectIds.map((projectId) =>
    scene.querySelector(`[data-project-panel="${projectId}"]`),
  ).filter(Boolean);

  panels.forEach((panel) => {
    gsap.set(panel, {
      position: "absolute",

      inset: 0,

      display: "flex",

      pointerEvents: "none",

      transition: "none",

      transformOrigin: "center center",
    });
  });

  const nada = FLGetProjectPanel("nada-nusantara");

  const pulse = FLGetProjectPanel("pulse-diary");

  const lega = FLGetProjectPanel("lega");

  gsap.set(nada, {
    y: 18,

    scale: 0.985,

    autoAlpha: 0,
  });

  gsap.set(pulse, {
    y: 28,

    scale: 0.975,

    autoAlpha: 0,
  });

  gsap.set(lega, {
    y: 28,

    scale: 0.975,

    autoAlpha: 0,
  });
}

/* =========================================================
   36 — REDUCED MOTION PROJECTS
   ========================================================= */

function FLBuildReducedProjects() {
  FLPrepareProjectsScene();

  window.setActiveFLProject?.("nada-nusantara");

  FLAnimationState.projects.currentProjectIndex = 0;

  FLAnimationState.projects.timeline = null;

  FLAnimationState.projects.scrollTrigger = null;

  FLSetProjectRailProgress(0);
}

/* =========================================================
   37 — MOBILE PROJECT SCENE

   Mobile follows the same project order:

   Nada
   → Pulse
   → Lega
   → Contact

   The panels still change discretely on smaller screens,
   while scroll position controls which project is active.
   ========================================================= */

function FLBuildMobileProjectsScene() {
  const scene = FLGetScene("projects");

  if (!scene || !FLHasGSAP() || !FLHasScrollTrigger()) {
    return;
  }

  FLPrepareProjectsScene();

  FLAnimationState.projects.currentProjectIndex = 0;

  window.setActiveFLProject?.("nada-nusantara");

  const trigger = ScrollTrigger.create({
    trigger: scene,

    start: "top top",

    end: () => `+=${window.innerHeight * 2.6}`,

    pin: true,

    pinSpacing: true,

    anticipatePin: 1,

    invalidateOnRefresh: true,

    onEnter() {
      FLSetSceneActive("projects");
    },

    onEnterBack() {
      FLSetSceneActive("projects");
    },

    onLeave() {
      FLSetSceneActive("contact");
    },

    onLeaveBack() {
      FLSetSceneActive("services");
    },

    onUpdate(self) {
      let index = 0;

      if (self.progress >= 0.7) {
        index = 2;
      } else if (self.progress >= 0.36) {
        index = 1;
      }

      FLSynchroniseProjectState(index);
    },
  });

  FLAnimationState.projects.timeline = null;

  FLAnimationState.projects.scrollTrigger = trigger;
}

/* =========================================================
   38 — PROJECT MASTER TIMELINE

   ONE CONTINUOUS MANUAL-SCROLL JOURNEY:

   Recent Projects arrives
   ↓
   Nada Nusantara
   ↓
   Pulse Diary
   ↓
   Lega
   ↓
   Contact

   Click / Continue routing:

   Nada → Pulse
   Pulse → Lega
   Lega → Contact

   No project is skipped.
   ========================================================= */

function FLBuildProjectsScene() {
  const scene = FLGetScene("projects");

  if (!scene || !FLHasGSAP() || !FLHasScrollTrigger()) {
    return;
  }

  if (FLIsReducedMotion()) {
    FLBuildReducedProjects();

    return;
  }

  if (FLIsMobile()) {
    FLBuildMobileProjectsScene();

    return;
  }

  FLPrepareProjectsScene();

  FLPrepareDesktopProjectPanels();

  FLAnimationState.projects.currentProjectIndex = 0;

  window.setActiveFLProject?.("nada-nusantara");

  /* =====================================================
     REFERENCES
     ===================================================== */

  const indicator = scene.querySelector(".scene-indicator");

  const eyebrow = scene.querySelector(".projects__eyebrow");

  const title = scene.querySelector(".projects__title");

  const stage = scene.querySelector("[data-project-stage]");

  const projectProgress = scene.querySelector(".project-progress");

  const controls = scene.querySelector(".project-controls");

  const hint = scene.querySelector(".projects__interaction-hint");

  const nextButton = scene.querySelector(".scene-next--contact");

  const nada = FLGetProjectPanel("nada-nusantara");

  const pulse = FLGetProjectPanel("pulse-diary");

  const lega = FLGetProjectPanel("lega");

  const nadaVisual = nada?.querySelector(".project-visual--rhythm");

  const pulseVisual = pulse?.querySelector(".project-visual--pulse");

  const pulseRings = pulse?.querySelectorAll(".pulse-ring");

  const pulseMarkers = pulse?.querySelectorAll(".pulse-marker");

  const legaVisual = lega?.querySelector(".project-visual--lega");

  const legaRings = lega?.querySelectorAll(".lega-visual__ring");

  const legaCore = lega?.querySelector(".lega-visual__core");

  const legaSliders = lega?.querySelectorAll(".lega-visual__slider");

  const shapeOne = scene.querySelector("[data-shape='projects-one']");

  const shapeTwo = scene.querySelector("[data-shape='projects-two']");

  /* =====================================================
     INITIAL STATE
     ===================================================== */

  gsap.set(indicator, {
    autoAlpha: 1,
  });

  gsap.set(eyebrow, {
    y: 12,

    autoAlpha: 0,
  });

  gsap.set(title, {
    y: 18,

    autoAlpha: 0,
  });

  gsap.set(stage, {
    y: 28,

    scale: 0.985,

    autoAlpha: 0,
  });

  gsap.set(projectProgress, {
    autoAlpha: 0,
  });

  gsap.set(controls, {
    y: 10,

    autoAlpha: 0,
  });

  gsap.set(hint, {
    y: 8,

    autoAlpha: 0,
  });

  /*
   * Contact Continue stays hidden until Lega, because
   * Lega is now the final project in the sequence.
   */

  gsap.set(nextButton, {
    y: 10,

    autoAlpha: 0,
  });

  /* -----------------------------------------------------
     NADA VISUAL
     ----------------------------------------------------- */

  gsap.set(nadaVisual, {
    x: 28,

    scaleX: 0.95,
  });

  /* -----------------------------------------------------
     PULSE VISUAL
     ----------------------------------------------------- */

  gsap.set(pulseVisual, {
    scale: 0.92,
  });

  gsap.set(pulseRings, {
    scale: 0.84,

    transformOrigin: "center center",
  });

  gsap.set(pulseMarkers, {
    scale: 0.65,

    autoAlpha: 0,
  });

  /* -----------------------------------------------------
     LEGA VISUAL
     ----------------------------------------------------- */

  gsap.set(legaVisual, {
    x: 24,

    scale: 0.94,

    transformOrigin: "center center",
  });

  gsap.set(legaRings, {
    scale: 0.82,

    autoAlpha: 0.35,

    transformOrigin: "center center",
  });

  gsap.set(legaCore, {
    scale: 0.78,

    autoAlpha: 0,
  });

  gsap.set(legaSliders, {
    x: 20,

    autoAlpha: 0,
  });

  /* =====================================================
     MASTER TIMELINE
     ===================================================== */

  const timeline = gsap.timeline({
    defaults: {
      ease: "none",
    },

    scrollTrigger: {
      trigger: scene,

      start: "top top",

      /*
       * The extra project receives its own full visual
       * moment without speeding up Nada or Pulse.
       */

      end: () => `+=${window.innerHeight * 3.45}`,

      pin: true,

      pinSpacing: true,

      scrub: 0.22,

      anticipatePin: 1,

      invalidateOnRefresh: true,

      onEnter() {
        FLSetSceneActive("projects");
      },

      onEnterBack() {
        FLSetSceneActive("projects");
      },

      onLeave() {
        FLSetSceneActive("contact");
      },

      onLeaveBack() {
        FLSetSceneActive("services");
      },

      onUpdate(self) {
        const index = FLGetProjectIndexFromProgress(self.progress);

        FLSynchroniseProjectState(index);
      },
    },
  });

  /* =====================================================
     PROJECT SCENE ARRIVAL
     ===================================================== */

  timeline.addLabel("intro", 0);

  timeline.to(
    eyebrow,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.36,

      ease: "power3.out",
    },
    0.05,
  );

  timeline.to(
    title,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.5,

      ease: "power3.out",
    },
    0.1,
  );

  timeline.to(
    stage,
    {
      y: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.6,

      ease: "power3.out",
    },
    0.22,
  );

  timeline.to(
    projectProgress,
    {
      autoAlpha: 1,

      duration: 0.42,

      ease: "power2.out",
    },
    0.3,
  );

  timeline.to(
    controls,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.4,

      ease: "power2.out",
    },
    0.38,
  );

  timeline.to(
    hint,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.36,

      ease: "power2.out",
    },
    0.42,
  );

  /* =====================================================
     PROJECT 01 — NADA NUSANTARA
     ===================================================== */

  timeline.to(
    nada,
    {
      y: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.58,

      ease: "power3.out",
    },
    0.26,
  );

  timeline.to(
    nadaVisual,
    {
      x: 0,

      scaleX: 1,

      duration: 0.62,

      ease: "power3.out",
    },
    0.34,
  );

  timeline.set(
    nada,
    {
      pointerEvents: "auto",
    },
    0.62,
  );

  timeline.to(
    shapeOne,
    {
      xPercent: -12,

      yPercent: 12,

      rotation: 12,

      duration: 0.9,

      ease: "sine.inOut",
    },
    0.18,
  );

  timeline.to(
    shapeTwo,
    {
      xPercent: 14,

      yPercent: -10,

      rotation: -10,

      duration: 0.9,

      ease: "sine.inOut",
    },
    0.18,
  );

  timeline.addLabel("ready", 0.86);

  timeline.addLabel("nadaReady", 0.86);

  /* -----------------------------------------------------
     NADA HOLD
     ----------------------------------------------------- */

  timeline.to(
    {},
    {
      duration: 0.64,
    },
  );

  /* =====================================================
     NADA → PULSE
     ===================================================== */

  timeline.addLabel("toPulse", 1.5);

  timeline.to(
    nada,
    {
      y: -14,

      scale: 0.985,

      autoAlpha: 0,

      duration: 0.56,

      ease: "power2.inOut",
    },
    1.46,
  );

  timeline.to(
    nadaVisual,
    {
      x: 32,

      scaleX: 1.08,

      duration: 0.52,

      ease: "power2.inOut",
    },
    1.44,
  );

  timeline.set(
    nada,
    {
      pointerEvents: "none",
    },
    1.86,
  );

  timeline.to(
    pulse,
    {
      y: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.62,

      ease: "power3.out",
    },
    1.6,
  );

  timeline.to(
    pulseVisual,
    {
      scale: 1,

      duration: 0.68,

      ease: "power3.out",
    },
    1.62,
  );

  timeline.to(
    pulseRings,
    {
      scale: 1,

      stagger: 0.075,

      duration: 0.52,

      ease: "power2.out",
    },
    1.68,
  );

  timeline.to(
    pulseMarkers,
    {
      scale: 1,

      autoAlpha: 1,

      stagger: 0.07,

      duration: 0.38,

      ease: "back.out(1.5)",
    },
    1.82,
  );

  timeline.set(
    pulse,
    {
      pointerEvents: "auto",
    },
    2.02,
  );

  /* =====================================================
     PROJECT 02 — PULSE DIARY
     ===================================================== */

  timeline.addLabel("pulseReady", 2.18);

  timeline.to(
    pulseRings,
    {
      scale: (index) => 1 + index * 0.018,

      duration: 0.42,

      ease: "sine.inOut",
    },
    2.08,
  );

  timeline.to(
    pulseMarkers,
    {
      y: (index) => (index % 2 === 0 ? -3 : 3),

      duration: 0.36,

      ease: "sine.inOut",
    },
    2.12,
  );

  /* -----------------------------------------------------
     PULSE HOLD
     ----------------------------------------------------- */

  timeline.to(
    {},
    {
      duration: 0.68,
    },
  );

  /* =====================================================
     PULSE → LEGA
     ===================================================== */

  timeline.addLabel("toLega", 2.86);

  timeline.to(
    pulse,
    {
      y: -14,

      scale: 0.985,

      autoAlpha: 0,

      duration: 0.56,

      ease: "power2.inOut",
    },
    2.82,
  );

  timeline.to(
    pulseVisual,
    {
      scale: 1.06,

      autoAlpha: 0.5,

      duration: 0.5,

      ease: "power2.inOut",
    },
    2.82,
  );

  timeline.set(
    pulse,
    {
      pointerEvents: "none",
    },
    3.2,
  );

  /* -----------------------------------------------------
     Lega enters once Pulse begins settling away.
     ----------------------------------------------------- */

  timeline.to(
    lega,
    {
      y: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.62,

      ease: "power3.out",
    },
    2.96,
  );

  timeline.to(
    legaVisual,
    {
      x: 0,

      scale: 1,

      duration: 0.68,

      ease: "power3.out",
    },
    2.98,
  );

  timeline.to(
    legaRings,
    {
      scale: 1,

      autoAlpha: 1,

      stagger: 0.08,

      duration: 0.54,

      ease: "power2.out",
    },
    3.04,
  );

  timeline.to(
    legaCore,
    {
      scale: 1,

      autoAlpha: 1,

      duration: 0.46,

      ease: "back.out(1.45)",
    },
    3.12,
  );

  timeline.to(
    legaSliders,
    {
      x: 0,

      autoAlpha: 1,

      stagger: 0.065,

      duration: 0.4,

      ease: "power2.out",
    },
    3.16,
  );

  timeline.set(
    lega,
    {
      pointerEvents: "auto",
    },
    3.34,
  );

  /* =====================================================
     PROJECT 03 — LEGA
     ===================================================== */

  timeline.addLabel("legaReady", 3.54);

  timeline.to(
    legaRings,
    {
      scale: (index) => 1 + index * 0.012,

      duration: 0.44,

      ease: "sine.inOut",
    },
    3.42,
  );

  timeline.to(
    legaSliders,
    {
      y: (index) => (index % 2 === 0 ? -2 : 2),

      duration: 0.4,

      ease: "sine.inOut",
    },
    3.46,
  );

  /*
   * Contact control appears only when the visitor reaches
   * the final portfolio project.
   */

  timeline.to(
    nextButton,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.38,

      ease: "power2.out",
    },
    3.46,
  );

  /* -----------------------------------------------------
     LEGA HOLD
     ----------------------------------------------------- */

  timeline.to(
    {},
    {
      duration: 0.68,
    },
  );

  /* =====================================================
     LEGA → CONTACT
     ===================================================== */

  timeline.addLabel("exit", 4.22);

  timeline.to(
    lega,
    {
      y: -14,

      scale: 0.985,

      autoAlpha: 0,

      duration: 0.5,

      ease: "power2.inOut",
    },
    4.18,
  );

  timeline.to(
    legaVisual,
    {
      x: 20,

      scale: 1.035,

      autoAlpha: 0.55,

      duration: 0.5,

      ease: "power2.inOut",
    },
    4.18,
  );

  timeline.set(
    lega,
    {
      pointerEvents: "none",
    },
    4.54,
  );

  timeline.to(
    stage,
    {
      y: -12,

      scale: 0.99,

      autoAlpha: 0,

      duration: 0.54,

      ease: "power2.inOut",
    },
    4.22,
  );

  timeline.to(
    [title, eyebrow].filter(Boolean),
    {
      y: -14,

      autoAlpha: 0,

      stagger: 0.03,

      duration: 0.42,

      ease: "power2.inOut",
    },
    4.26,
  );

  timeline.to(
    [projectProgress, controls, hint, nextButton].filter(Boolean),
    {
      y: -8,

      autoAlpha: 0,

      duration: 0.4,

      ease: "power2.inOut",
    },
    4.28,
  );

  timeline.to(
    [shapeOne, shapeTwo].filter(Boolean),
    {
      scale: 1.08,

      autoAlpha: 0,

      duration: 0.48,

      ease: "power2.inOut",
    },
    4.26,
  );

  timeline.to(
    indicator,
    {
      autoAlpha: 0,

      duration: 0.34,

      ease: "power2.inOut",
    },
    4.4,
  );

  timeline.addLabel("complete", 4.82);

  FLAnimationState.projects.timeline = timeline;

  FLAnimationState.projects.scrollTrigger = timeline.scrollTrigger;
}

/* =========================================================
   39 — PROJECT SCROLL PROGRESS
   ========================================================= */

function FLGetProjectProgress(projectId) {
  /*
   * Mobile does not use the full GSAP project timeline,
   * so it uses explicit scroll stops.
   */

  if (FLIsMobile() || !FLAnimationState.projects.timeline) {
    const mobileStops = {
      "nada-nusantara": 0.15,

      "pulse-diary": 0.5,

      lega: 0.82,
    };

    return mobileStops[projectId] ?? null;
  }

  const label = FLProjectLandingLabels[projectId];

  if (!label) {
    return null;
  }

  return FLResolveLandingProgress("projects", label);
}

/* =========================================================
   40 — SCROLL DIRECTLY TO PROJECT

   Used by:
   - timeline markers
   - Previous
   - Next
   - scene click progression

   It does NOT leave the Projects scene.
   ========================================================= */

function FLScrollToProject(projectId, options = {}) {
  if (!FLProjectIds.includes(projectId)) {
    return false;
  }

  const trigger = FLAnimationState.projects.scrollTrigger;

  const progress = FLGetProjectProgress(projectId);

  if (progress === null || progress === undefined) {
    return false;
  }

  const index = FLGetProjectIndex(projectId);

  const railProgress = FLGetProjectRailPosition(index);

  /* -----------------------------------------------------
     Reduced-motion / no-trigger fallback
     ----------------------------------------------------- */

  if (FLIsReducedMotion() || !trigger) {
    if (index >= 0) {
      FLAnimationState.projects.currentProjectIndex = index;
    }

    window.setActiveFLProject?.(projectId);

    FLSetProjectRailProgress(railProgress);

    return true;
  }

  /* -----------------------------------------------------
     Animated project change
     ----------------------------------------------------- */

  const targetY =
    trigger.start + (trigger.end - trigger.start) * FLClamp(progress);

  const tween = FLScrollToY(targetY, {
    duration: options.duration ?? 1.05,

    immediate: options.immediate ?? false,

    ease: options.ease ?? "sine.inOut",

    onComplete() {
      if (index >= 0) {
        FLAnimationState.projects.currentProjectIndex = index;
      }

      window.setActiveFLProject?.(projectId);

      FLSetProjectRailProgress(railProgress);

      FLSetSceneActive("projects");
    },
  });

  return tween !== false;
}

/* =========================================================
   41 — PROJECT CHANGE API
   ========================================================= */

function FLChangeProject(projectId) {
  if (!FLProjectIds.includes(projectId)) {
    return false;
  }

  return FLScrollToProject(projectId, {
    duration: 1.05,

    ease: "sine.inOut",
  });
}

/* =========================================================
   42 — PROJECT CONTINUE

   Project progression:

   Nada
   → Pulse

   Pulse
   → Lega

   Lega
   → Contact

   The final project-to-Contact timing remains the same as
   the previous Pulse-to-Contact transition.
   ========================================================= */

function FLAdvanceProjects() {
  const activeProject = window.getActiveFLProject?.();

  let currentIndex = FLGetProjectIndex(activeProject?.id);

  /*
   * Use animation state as a fallback in case projects.js
   * has not yet returned an active project object.
   */

  if (currentIndex < 0) {
    currentIndex = FLAnimationState.projects.currentProjectIndex;
  }

  currentIndex = Math.max(0, Math.min(currentIndex, FLProjectIds.length - 1));

  /* =====================================================
     NADA → PULSE
     ===================================================== */

  if (currentIndex === 0) {
    return FLScrollToProject("pulse-diary", {
      duration: 1.35,

      ease: "sine.inOut",
    });
  }

  /* =====================================================
     PULSE → LEGA
     ===================================================== */

  if (currentIndex === 1) {
    return FLScrollToProject("lega", {
      duration: 1.35,

      ease: "sine.inOut",
    });
  }

  /* =====================================================
     LEGA → CONTACT

     Preserve the previous Projects → Contact pacing.
     ===================================================== */

  return FLPlaySceneToNext("projects", "contact", {
    nextLanding: "ready",

    minimumDuration: 2.6,

    maximumDuration: 3.6,

    ease: "sine.inOut",
  });
}

/* =========================================================
   43 — PROJECT STATE EVENT
   ========================================================= */

function FLHandleProjectStateChange(event) {
  const projectId = event.detail?.projectId || event.detail?.project?.id;

  if (!projectId) {
    return;
  }

  const index = FLGetProjectIndex(projectId);

  if (index < 0) {
    return;
  }

  FLAnimationState.projects.currentProjectIndex = index;

  FLSetProjectRailProgress(FLGetProjectRailPosition(index));
}

/* =========================================================
   44 — PROJECT EVENTS
   ========================================================= */

function FLInitialiseProjectAnimationEvents() {
  window.addEventListener("flProjectChange", FLHandleProjectStateChange);
}
/* =========================================================
   45 — CONTACT PREPARATION
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

    scene.querySelector(".contact-links"),

    ...scene.querySelectorAll(".contact-link"),

    scene.querySelector("[data-contact-brand]"),

    scene.querySelector(".contact__restart"),

    ...scene.querySelectorAll(".shape"),
  ].filter(Boolean);

  gsap.set(elements, {
    clearProps: "transform,opacity,visibility",
  });
}

/* =========================================================
   46 — REDUCED MOTION CONTACT
   ========================================================= */

function FLBuildReducedContact() {
  FLPrepareContactScene();

  FLAnimationState.contact.timeline = null;

  FLAnimationState.contact.scrollTrigger = null;
}

/* =========================================================
   47 — CONTACT MASTER TIMELINE

   Contact stays comparatively calm.

   The opening and project scenes already carry the larger
   motion moments, so the ending focuses on a clean arrival
   and clear contact information.
   ========================================================= */

function FLBuildContactScene() {
  const scene = FLGetScene("contact");

  if (!scene || !FLHasGSAP() || !FLHasScrollTrigger()) {
    return;
  }

  if (FLIsReducedMotion()) {
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

  /* =====================================================
     INITIAL STATE
     ===================================================== */

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
    y: 18,

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

  /* =====================================================
     MASTER TIMELINE
     ===================================================== */

  const timeline = gsap.timeline({
    defaults: {
      ease: "none",
    },

    scrollTrigger: {
      trigger: scene,

      start: "top top",

      end: () => `+=${window.innerHeight * 1.15}`,

      pin: true,

      pinSpacing: true,

      scrub: 0.2,

      anticipatePin: 1,

      invalidateOnRefresh: true,

      onEnter() {
        FLSetSceneActive("contact");
      },

      onEnterBack() {
        FLSetSceneActive("contact");
      },

      onLeaveBack() {
        FLSetSceneActive("projects");
      },
    },
  });

  /* =====================================================
     CONTACT ARRIVAL
     ===================================================== */

  timeline.addLabel("intro", 0);

  timeline.to(
    indicator,
    {
      x: 0,

      autoAlpha: 1,

      duration: 0.34,

      ease: "power2.out",
    },
    0.03,
  );

  timeline.to(
    eyebrow,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.38,

      ease: "power2.out",
    },
    0.06,
  );

  timeline.to(
    title,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.56,

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
    0.26,
  );

  /* =====================================================
     CONTACT LINKS
     ===================================================== */

  timeline.to(
    links,
    {
      x: 0,

      autoAlpha: 1,

      stagger: 0.075,

      duration: 0.42,

      ease: "power2.out",
    },
    0.4,
  );

  /* =====================================================
     LARGE F.L MARK
     ===================================================== */

  timeline.to(
    brand,
    {
      xPercent: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.68,

      ease: "power3.out",
    },
    0.28,
  );

  /* =====================================================
     DECORATIVE SHAPES
     ===================================================== */

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

      duration: 0.78,

      ease: "power2.out",
    },
    0.1,
  );

  timeline.fromTo(
    shapeTwo,
    {
      xPercent: 22,

      yPercent: 28,

      rotation: 18,

      scale: 0.86,
    },
    {
      xPercent: 0,

      yPercent: 0,

      rotation: 8,

      scale: 1,

      duration: 0.78,

      ease: "power2.out",
    },
    0.12,
  );

  timeline.fromTo(
    shapeThree,
    {
      xPercent: -20,

      yPercent: 18,

      rotation: 14,

      scale: 0.88,
    },
    {
      xPercent: 0,

      yPercent: 0,

      rotation: -8,

      scale: 1,

      duration: 0.8,

      ease: "power2.out",
    },
    0.12,
  );

  /* =====================================================
     RESTING STATE
     ===================================================== */

  timeline.addLabel("ready", 0.94);

  timeline.to(
    restart,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.38,

      ease: "power2.out",
    },
    0.84,
  );

  timeline.to(
    {},
    {
      duration: 0.5,
    },
  );

  timeline.addLabel("complete", 1.46);

  FLAnimationState.contact.timeline = timeline;

  FLAnimationState.contact.scrollTrigger = timeline.scrollTrigger;
}

/* =========================================================
   48 — SCENE ADVANCE ROUTER
   ========================================================= */

function FLAdvanceScene(sceneName) {
  switch (sceneName) {
    case "welcome":
      return FLAdvanceWelcome();

    case "about":
      return FLAdvanceAbout();

    case "services":
      return FLAdvanceServices();

    case "projects":
      return FLAdvanceProjects();

    case "contact":
      return false;

    default:
      return false;
  }
}

/* =========================================================
   49 — WELCOME CONTINUE BUTTON
   ========================================================= */

function FLInitialiseWelcomeContinue() {
  const button = document.querySelector("[data-welcome-continue]");

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    FLAdvanceWelcome();
  });
}

/* =========================================================
   50 — MANUAL INPUT CANCELS AUTOMATIC PLAYBACK

   The visitor always gets control back immediately.

   Wheel, touch or keyboard scrolling interrupts any
   automatic Continue animation.
   ========================================================= */

function FLInitialiseScrollInterruption() {
  window.addEventListener("wheel", FLCancelAutoPlayFromUserInput, {
    passive: true,
  });

  window.addEventListener("touchstart", FLCancelAutoPlayFromUserInput, {
    passive: true,
  });

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

    if (scrollKeys.includes(event.key) && FLAnimationState.autoPlay.active) {
      FLCancelAutoPlayFromUserInput();
    }
  });
}

/* =========================================================
   51 — CUSTOM CURSOR
   ========================================================= */

function FLInitialiseCustomCursor() {
  if (FLAnimationState.cursorInitialised) {
    return;
  }

  FLAnimationState.cursorInitialised = true;

  const cursor = document.querySelector("[data-cursor]");

  const label = document.querySelector("[data-cursor-label]");

  if (!cursor || !FLHasGSAP()) {
    return;
  }

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (!finePointer.matches) {
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

  /* -----------------------------------------------------
     CURSOR POSITION
     ----------------------------------------------------- */

  window.addEventListener(
    "pointermove",
    (event) => {
      moveX(event.clientX);

      moveY(event.clientY);

      gsap.to(cursor, {
        autoAlpha: 1,

        duration: 0.1,

        overwrite: "auto",
      });
    },
    {
      passive: true,
    },
  );

  document.documentElement.addEventListener("mouseleave", () => {
    gsap.to(cursor, {
      autoAlpha: 0,

      duration: 0.15,
    });
  });

  /* -----------------------------------------------------
     INTERACTIVE TARGETS
     ----------------------------------------------------- */

  const interactiveSelector = [
    ".discipline",

    ".project-read-more",

    ".project-progress__marker",

    ".contact-link",

    "[data-welcome-continue]",

    "[data-scene-continue]",

    "[data-project-next]",

    "[data-project-previous]",

    "[data-scene-target]",

    "[data-settings-toggle]",

    "[data-nav-toggle]",
  ].join(",");

  document.addEventListener("pointerover", (event) => {
    const interactive = event.target.closest(interactiveSelector);

    if (!interactive) {
      return;
    }

    let cursorText = "Click";

    if (interactive.matches(".discipline")) {
      cursorText =
        interactive.classList.contains("is-active") ||
        interactive.classList.contains("is-expanded")
          ? "Close"
          : "Open";
    } else if (interactive.matches(".project-read-more")) {
      cursorText = "View";
    } else if (interactive.matches(".project-progress__marker")) {
      cursorText = "View";
    } else if (
      interactive.matches("[data-project-next]") ||
      interactive.matches("[data-project-previous]")
    ) {
      cursorText = "View";
    } else if (
      interactive.matches("[data-welcome-continue]") ||
      interactive.matches("[data-scene-continue]")
    ) {
      cursorText = "Next";
    } else if (interactive.matches("[data-scene-target]")) {
      cursorText = "Go";
    }

    if (label) {
      label.textContent = cursorText;
    }

    gsap.to(cursor, {
      width: "4rem",

      height: "4rem",

      background: "rgba(243, 207, 91, 0.58)",

      borderColor: "rgba(32, 29, 26, 0.45)",

      duration: 0.18,

      ease: "power2.out",

      overwrite: "auto",
    });
  });

  document.addEventListener("pointerout", (event) => {
    const interactive = event.target.closest(interactiveSelector);

    if (!interactive) {
      return;
    }

    if (event.relatedTarget && interactive.contains(event.relatedTarget)) {
      return;
    }

    if (label) {
      label.textContent = "";
    }

    gsap.to(cursor, {
      width: "2.8rem",

      height: "2.8rem",

      background: "rgba(239, 229, 213, 0.12)",

      borderColor: "rgba(32, 29, 26, 0.35)",

      duration: 0.18,

      ease: "power2.out",

      overwrite: "auto",
    });
  });
}

/* =========================================================
   52 — CLEAR ANIMATION SYSTEM
   ========================================================= */

function FLClearAnimations() {
  FLStopScrollTween();

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
    },
  );
}

/* =========================================================
   53 — BUILD ALL ANIMATIONS
   ========================================================= */

function FLBuildAllAnimations() {
  if (!FLHasGSAP()) {
    console.warn(
      "GSAP was not available. Portfolio is using its static fallback.",
    );

    return;
  }

  FLAnimationState.reducedMotion = FLIsReducedMotion();

  FLAnimationState.viewportMode = FLGetViewportMode();

  FLAnimationState.context = gsap.context(() => {
    FLBuildWelcomeScene();

    FLBuildAboutScene();

    FLBuildServicesScene();

    FLBuildProjectsScene();

    FLBuildContactScene();
  }, document.body);

  if (FLHasScrollTrigger()) {
    ScrollTrigger.refresh();
  }
}

/* =========================================================
   54 — CAPTURE CURRENT POSITION

   Used when:
   - font size changes
   - viewport breakpoint changes
   - motion preference changes

   The current meaningful state is remembered before GSAP
   rebuilds its ScrollTriggers.
   ========================================================= */

function FLCaptureCurrentLanding() {
  const scene =
    window.FLSite?.getCurrentScene?.() ||
    FLAnimationState.currentScene ||
    "welcome";

  /* -----------------------------------------------------
     PROJECTS

     Because this uses FLProjectLandingLabels, the active
     project can now be Nada, Pulse or Lega.
     ----------------------------------------------------- */

  if (scene === "projects") {
    const project = window.getActiveFLProject?.();

    return {
      scene,

      landing: FLProjectLandingLabels[project?.id] || "nadaReady",
    };
  }

  /* -----------------------------------------------------
     WELCOME

     Thresholds correspond to the longer Welcome timeline
     introduced in Part 1.
     ----------------------------------------------------- */

  if (scene === "welcome") {
    const progress = FLAnimationState.welcome.scrollTrigger?.progress ?? 0;

    if (progress >= 0.6) {
      return {
        scene,

        landing: "statement",
      };
    }

    if (progress >= 0.22) {
      return {
        scene,

        landing: "specialisms",
      };
    }

    return {
      scene,

      landing: "intro",
    };
  }

  /* -----------------------------------------------------
     ABOUT

     Preserve the completed flight where possible instead of
     throwing someone back to the pre-flight state after a
     responsive rebuild.
     ----------------------------------------------------- */

  if (scene === "about") {
    const progress = FLAnimationState.about.scrollTrigger?.progress ?? 0;

    const arrivalProgress = FLGetLabelProgress("about", "arrivalReady");

    if (arrivalProgress !== null && progress >= arrivalProgress - 0.04) {
      return {
        scene,

        landing: "arrivalReady",
      };
    }

    return {
      scene,

      landing: "ready",
    };
  }

  return {
    scene,

    landing: "ready",
  };
}

/* =========================================================
   55 — REBUILD ANIMATIONS
   ========================================================= */

function FLRebuildAnimations(options = {}) {
  if (FLAnimationState.rebuilding) {
    return;
  }

  FLAnimationState.rebuilding = true;

  const { preserveScene = true } = options;

  const preserved = preserveScene
    ? FLCaptureCurrentLanding()
    : {
        scene: "welcome",

        landing: "intro",
      };

  FLClearAnimations();

  FLBuildAllAnimations();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (FLHasScrollTrigger()) {
        ScrollTrigger.refresh();
      }

      if (preserveScene) {
        FLGoToScene(preserved.scene, {
          landing: preserved.landing,

          immediate: true,
        });
      }

      FLAnimationState.rebuilding = false;
    });
  });
}

/* =========================================================
   56 — LIGHTWEIGHT LAYOUT REFRESH
   ========================================================= */

function FLRefreshLayout() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (FLHasScrollTrigger()) {
        ScrollTrigger.refresh();
      }
    });
  });
}

/* =========================================================
   57 — LANGUAGE CHANGE
   ========================================================= */

function FLHandleLanguageChange() {
  FLRefreshLayout();
}

/* =========================================================
   58 — FONT SIZE CHANGE
   ========================================================= */

function FLHandleFontSizeChange() {
  FLRebuildAnimations({
    preserveScene: true,
  });
}

/* =========================================================
   59 — MOTION PREFERENCE CHANGE
   ========================================================= */

function FLHandleMotionPreferenceChange() {
  FLRebuildAnimations({
    preserveScene: true,
  });
}

/* =========================================================
   60 — RESIZE
   ========================================================= */

function FLHandleAnimationResize() {
  clearTimeout(FLAnimationState.resizeTimer);

  FLAnimationState.resizeTimer = window.setTimeout(() => {
    const mode = FLGetViewportMode();

    /*
     * Crossing a responsive breakpoint requires a full
     * rebuild because ScrollTrigger geometry changes.
     */

    if (mode !== FLAnimationState.viewportMode) {
      FLRebuildAnimations({
        preserveScene: true,
      });

      return;
    }

    /*
     * Ordinary resizing inside the same breakpoint only
     * needs fresh ScrollTrigger measurements.
     */

    FLRefreshLayout();
  }, 180);
}

/* =========================================================
   61 — SITE SCENE CHANGE
   ========================================================= */

function FLHandleSceneChange(event) {
  const scene = event.detail?.scene;

  if (!scene) {
    return;
  }

  FLAnimationState.currentScene = scene;
}

/* =========================================================
   62 — ANIMATION EVENTS
   ========================================================= */

function FLInitialiseAnimationEvents() {
  if (FLAnimationState.eventsInitialised) {
    return;
  }

  FLAnimationState.eventsInitialised = true;

  FLInitialiseScrollInterruption();

  FLInitialiseWelcomeContinue();

  FLInitialiseDisciplineAnimationEvents();

  FLInitialiseProjectAnimationEvents();

  window.addEventListener("flSceneChange", FLHandleSceneChange);

  window.addEventListener("flLanguageChange", FLHandleLanguageChange);

  window.addEventListener("flFontSizeChange", FLHandleFontSizeChange);

  window.addEventListener(
    "flMotionPreferenceChange",
    FLHandleMotionPreferenceChange,
  );

  window.addEventListener("resize", FLHandleAnimationResize, {
    passive: true,
  });

  window.addEventListener(
    "orientationchange",
    () => {
      window.setTimeout(() => {
        FLRebuildAnimations({
          preserveScene: true,
        });
      }, 180);
    },
    {
      passive: true,
    },
  );

  window.addEventListener(
    "load",
    () => {
      FLRefreshLayout();
    },
    {
      once: true,
    },
  );

  document.fonts?.ready
    ?.then(() => {
      FLRefreshLayout();
    })
    .catch(() => {});
}

/* =========================================================
   63 — INITIAL SCENE POSITION
   ========================================================= */

function FLCorrectInitialScenePosition() {
  const scene = window.FLSite?.getCurrentScene?.() || "welcome";

  let landing = scene === "welcome" ? "intro" : "ready";

  /*
   * Projects intentionally begin with Nada when the page is
   * first loaded directly into the Recent Projects scene.
   *
   * Pulse and Lega remain available through the normal
   * project navigation once the scene is active.
   */

  if (scene === "projects") {
    landing = "nadaReady";
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      FLGoToScene(scene, {
        landing,

        immediate: true,
      });
    });
  });
}

/* =========================================================
   64 — INITIALISE
   ========================================================= */

function FLInitialiseAnimations() {
  if (FLAnimationState.ready) {
    FLRebuildAnimations({
      preserveScene: true,
    });

    return;
  }

  FLAnimationState.ready = true;

  FLAnimationState.currentScene =
    window.FLSite?.getCurrentScene?.() || "welcome";

  FLInitialiseAnimationEvents();

  FLInitialiseCustomCursor();

  FLBuildAllAnimations();

  FLCorrectInitialScenePosition();
}

/* =========================================================
   65 — PUBLIC ANIMATION API
   ========================================================= */

window.FLAnimations = {
  goToScene(sceneName, options = {}) {
    return FLGoToScene(sceneName, options);
  },

  advanceScene(sceneName) {
    return FLAdvanceScene(sceneName);
  },

  changeProject(projectId) {
    return FLChangeProject(projectId);
  },

  isAutoPlaying() {
    return FLAnimationState.autoPlay.active;
  },

  cancelAutoPlay() {
    FLStopScrollTween();
  },

  rebuild(options = {}) {
    FLRebuildAnimations(options);
  },

  refresh() {
    FLRefreshLayout();
  },

  getState() {
    return FLAnimationState;
  },
};

/* =========================================================
   66 — RUN

   main.js is loaded before animations.js, so the FLSite API
   is available by the time this initializes.
   ========================================================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", FLInitialiseAnimations, {
    once: true,
  });
} else {
  FLInitialiseAnimations();
}
