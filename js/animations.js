/* =========================================================
   F.LIYANTO PORTFOLIO
   SCROLL + SCENE ANIMATION SYSTEM
   ========================================================= */

/* =========================================================
   01 — GSAP PLUGINS
   ========================================================= */

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  if (typeof MotionPathPlugin !== "undefined") {
    gsap.registerPlugin(MotionPathPlugin);
  }
}

/* =========================================================
   02 — ANIMATION STATE
   ========================================================= */

const FLAnimationState = {
  ready: false,

  reducedMotion: false,

  isRebuilding: false,

  currentScene: "welcome",

  scrollTween: null,

  autoPlay: {
    active: false,
    scene: null,
  },

  resizeTimer: null,

  viewportMode: null,

  context: null,

  eventsInitialised: false,

  cursorInitialised: false,

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
    isChangingProject: false,
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

/* =========================================================
   04 — ACTIVE SCENE
   ========================================================= */

function FLSetSceneActive(sceneName) {
  if (!sceneName || FLAnimationState.currentScene === sceneName) {
    return;
  }

  FLAnimationState.currentScene = sceneName;

  window.FLSite?.setActiveScene?.(sceneName);
}

/* =========================================================
   05 — KILL AUTOMATED SCROLL

   Any real interaction from the visitor immediately
   cancels autoplay and returns control to manual scrolling.
   ========================================================= */

function FLKillScrollTween() {
  if (FLAnimationState.scrollTween) {
    FLAnimationState.scrollTween.kill();

    FLAnimationState.scrollTween = null;
  }

  FLAnimationState.autoPlay.active = false;

  FLAnimationState.autoPlay.scene = null;
}

/* =========================================================
   06 — FORCE SCROLLTRIGGER TO FOLLOW AUTOPLAY

   Manual scrolling keeps normal numeric scrub smoothing.

   Automated scene playback instead follows our GSAP scroll
   tween exactly. This removes the old "double smoothing"
   feeling where the page moved first and animations lagged
   behind it.
   ========================================================= */

function FLForceTriggerSync(trigger) {
  if (!trigger || !FLHasScrollTrigger()) {
    return;
  }

  ScrollTrigger.update();

  const scrubTween = trigger.getTween?.();

  if (scrubTween) {
    scrubTween.progress(1);
  }

  if (trigger.animation) {
    trigger.animation.progress(trigger.progress);
  }
}

/* =========================================================
   07 — FORCE ALL SCENE TRIGGERS

   Cross-scene autoplay can pass through several pinned
   timelines in one motion.

   Synchronising all of them keeps the hand-off between
   scenes seamless.
   ========================================================= */

function FLForceAllSceneTriggerSync() {
  ["welcome", "about", "services", "projects", "contact"].forEach(
    (sceneName) => {
      FLForceTriggerSync(FLAnimationState[sceneName]?.scrollTrigger);
    },
  );
}

/* =========================================================
   08 — SCROLL TO Y

   One scroll engine is used for:
   - header navigation
   - scene autoplay
   - project navigation
   - restart

   Autoplay can request syncAllTriggers so every timeline
   follows the scroll position frame-for-frame.
   ========================================================= */

function FLScrollToY(targetY, options = {}) {
  if (!FLHasGSAP()) {
    window.scrollTo({
      top: targetY,

      behavior: options.immediate ? "auto" : "smooth",
    });

    return null;
  }

  const {
    duration = 0.78,

    immediate = false,

    syncTrigger = null,

    syncAllTriggers = false,

    ease = "power2.inOut",

    onComplete = null,
  } = options;

  FLKillScrollTween();

  if (immediate || FLIsReducedMotion()) {
    window.scrollTo(0, targetY);

    if (syncAllTriggers) {
      FLForceAllSceneTriggerSync();
    } else if (syncTrigger) {
      FLForceTriggerSync(syncTrigger);
    }

    onComplete?.();

    return null;
  }

  const proxy = {
    y: window.scrollY,
  };

  FLAnimationState.scrollTween = gsap.to(proxy, {
    y: targetY,

    duration,

    ease,

    overwrite: true,

    onUpdate() {
      window.scrollTo(0, proxy.y);

      if (syncAllTriggers) {
        FLForceAllSceneTriggerSync();
      } else if (syncTrigger) {
        FLForceTriggerSync(syncTrigger);
      }
    },

    onComplete() {
      FLAnimationState.scrollTween = null;

      FLAnimationState.autoPlay.active = false;

      FLAnimationState.autoPlay.scene = null;

      if (syncAllTriggers) {
        FLForceAllSceneTriggerSync();
      } else if (syncTrigger) {
        FLForceTriggerSync(syncTrigger);
      }

      onComplete?.();
    },

    onInterrupt() {
      FLAnimationState.scrollTween = null;

      FLAnimationState.autoPlay.active = false;

      FLAnimationState.autoPlay.scene = null;
    },
  });

  return FLAnimationState.scrollTween;
}

/* =========================================================
   09 — SCROLLTRIGGER PROGRESS TO Y
   ========================================================= */

function FLScrollTriggerToProgress(trigger, progress, options = {}) {
  if (!trigger) {
    return false;
  }

  const safeProgress = FLClamp(progress);

  const target = trigger.start + (trigger.end - trigger.start) * safeProgress;

  FLScrollToY(target, {
    ...options,

    syncTrigger: options.syncTrigger ?? trigger,
  });

  return true;
}

/* =========================================================
   10 — LABEL PROGRESS
   ========================================================= */

function FLGetLabelProgress(sceneName, label) {
  const timeline = FLAnimationState[sceneName]?.timeline;

  if (!timeline || !label || timeline.labels[label] === undefined) {
    return null;
  }

  const duration = timeline.duration();

  if (duration <= 0) {
    return 0;
  }

  return FLClamp(timeline.labels[label] / duration);
}

/* =========================================================
   11 — FALLBACK LANDING PROGRESS
   ========================================================= */

function FLGetFallbackLandingProgress(sceneName, landing) {
  if (landing === "intro") {
    return 0.03;
  }

  const defaults = {
    welcome: 0.08,

    about: 0.45,

    services: 0.56,

    projects: 0.12,

    contact: 0.68,
  };

  return defaults[sceneName] ?? 0.1;
}

/* =========================================================
   12 — RESOLVE LANDING PROGRESS
   ========================================================= */

function FLResolveLandingProgress(sceneName, landing) {
  const labelProgress = FLGetLabelProgress(sceneName, landing);

  if (labelProgress !== null) {
    return labelProgress;
  }

  return FLGetFallbackLandingProgress(sceneName, landing);
}

/* =========================================================
   13 — GET SCENE LANDING Y

   Centralised so normal navigation and autoplay calculate
   positions in exactly the same way.
   ========================================================= */

function FLGetSceneLandingY(sceneName, landing) {
  const scene = FLGetScene(sceneName);

  if (!scene) {
    return null;
  }

  const state = FLGetSceneState(sceneName);

  const trigger = state?.scrollTrigger;

  if (trigger) {
    const progress = FLResolveLandingProgress(sceneName, landing);

    return trigger.start + (trigger.end - trigger.start) * progress;
  }

  const rect = scene.getBoundingClientRect();

  return window.scrollY + rect.top;
}

/* =========================================================
   14 — GO TO SCENE

   Used by header navigation.

   Header navigation still goes straight to a useful
   readable "ready" state instead of making visitors watch
   every animation again.
   ========================================================= */

function FLGoToScene(sceneName, options = {}) {
  const scene = FLGetScene(sceneName);

  if (!scene) {
    return false;
  }

  const {
    landing = sceneName === "welcome" ? "intro" : "ready",

    immediate = false,
  } = options;

  const target = FLGetSceneLandingY(sceneName, landing);

  if (target === null) {
    return false;
  }

  FLScrollToY(target, {
    duration: 0.9,

    immediate,

    syncAllTriggers: true,

    ease: "power2.inOut",

    onComplete() {
      FLSetSceneActive(sceneName);
    },
  });

  return true;
}

/* =========================================================
   15 — ONE-CLICK SCENE AUTOPLAY

   THIS IS THE NEW INTERACTION MODEL.

   One click:
   - plays all remaining animation beats
   - preserves their existing order
   - uses the scroll-controlled master timeline
   - gently enters the next scene
   - stops at that scene's useful resting state

   No more clicking every animation checkpoint.
   ========================================================= */

function FLPlaySceneToNext(sceneName, nextScene, options = {}) {
  if (!sceneName || !nextScene) {
    return false;
  }

  /*
       Ignore repeated clicks while a scene is already
       automatically playing.

       Manual wheel/touch/pointer interaction still cancels
       it through FLInitialiseScrollInterruption().
    */

  if (FLAnimationState.autoPlay.active) {
    return false;
  }

  if (FLIsReducedMotion()) {
    return FLGoToScene(nextScene, {
      landing: options.nextLanding ?? "ready",
    });
  }

  const target = FLGetSceneLandingY(nextScene, options.nextLanding ?? "ready");

  if (target === null) {
    return false;
  }

  const currentY = window.scrollY;

  const distance = Math.abs(target - currentY);

  /*
       Duration scales gently with distance.

       The clamps stop a tiny movement feeling sluggish and
       stop long scene sequences from becoming painfully
       slow.

       Scene-specific minimum durations below give each
       sequence room to breathe.
    */

  const distanceDuration = (distance / Math.max(window.innerHeight, 1)) * 1.15;

  const minimumDuration = options.minimumDuration ?? 4;

  const maximumDuration = options.maximumDuration ?? 6;

  const duration = FLClamp(
    Math.max(distanceDuration, minimumDuration),
    minimumDuration,
    maximumDuration,
  );

  FLAnimationState.autoPlay.active = true;

  FLAnimationState.autoPlay.scene = sceneName;

  FLScrollToY(target, {
    duration,

    syncAllTriggers: true,

    /*
               Very soft acceleration/deceleration.

               power1.inOut avoids the old harsh jump while
               still allowing every internal animation beat
               to remain readable.
            */

    ease: "power1.inOut",

    onComplete() {
      FLSetSceneActive(nextScene);
    },
  });

  return true;
}

/* =========================================================
   16 — MANUAL INPUT CANCELS AUTOPLAY
   ========================================================= */

function FLInitialiseScrollInterruption() {
  const cancel = () => {
    if (FLAnimationState.scrollTween) {
      FLKillScrollTween();
    }
  };

  window.addEventListener("wheel", cancel, {
    passive: true,
  });

  window.addEventListener("touchstart", cancel, {
    passive: true,
  });

  window.addEventListener("pointerdown", cancel, {
    passive: true,
  });
}

/* =========================================================
   17 — LEGACY STOP HELPER

   Kept because some internal interactions can still target
   timeline labels directly.

   Scene-wide Continue no longer uses this helper.
   ========================================================= */

function FLAdvanceThroughStops(sceneName, stops, options = {}) {
  const state = FLGetSceneState(sceneName);

  const trigger = state?.scrollTrigger;

  if (!trigger) {
    if (options.nextScene) {
      return FLGoToScene(options.nextScene, {
        landing: options.nextLanding ?? "ready",
      });
    }

    return false;
  }

  const current = trigger.progress;

  const resolved = stops
    .map((stop) => {
      if (typeof stop === "number") {
        return FLClamp(stop);
      }

      return FLResolveLandingProgress(sceneName, stop);
    })
    .filter((value) => value > current + 0.035);

  if (resolved.length) {
    return FLScrollTriggerToProgress(trigger, resolved[0], {
      duration: options.duration ?? 0.75,

      syncAllTriggers: true,

      ease: "power2.inOut",
    });
  }

  if (options.nextScene) {
    return FLGoToScene(options.nextScene, {
      landing: options.nextLanding ?? "ready",
    });
  }

  return false;
}

/* =========================================================
   18 — WELCOME PROGRESS STATE
   ========================================================= */

function FLUpdateWelcomeProgress(progress) {
  const safeProgress = FLClamp(progress);

  FLAnimationState.welcome.progress = safeProgress;

  let step = 0;

  if (safeProgress >= 0.72) {
    step = 3;
  } else if (safeProgress >= 0.46) {
    step = 2;
  } else if (safeProgress >= 0.2) {
    step = 1;
  }

  FLAnimationState.welcome.step = step;
}

/* =========================================================
   19 — WELCOME PREPARATION
   ========================================================= */

function FLPrepareWelcomeScene() {
  const scene = FLGetScene("welcome");

  if (!scene) {
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
  ];

  gsap.set(elements, {
    clearProps: "transform,opacity,visibility",
  });
}

/* =========================================================
   20 — REDUCED-MOTION WELCOME
   ========================================================= */

function FLBuildReducedWelcome() {
  FLPrepareWelcomeScene();

  const scene = FLGetScene("welcome");

  if (!scene) {
    return;
  }

  gsap.set(scene.querySelectorAll(".welcome-specialism"), {
    autoAlpha: 1,
  });

  gsap.set(scene.querySelector(".welcome__statement-text"), {
    autoAlpha: 0,
  });

  FLAnimationState.welcome.timeline = null;

  FLAnimationState.welcome.scrollTrigger = null;
}

/* =========================================================
   21 — WELCOME MASTER TIMELINE
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

  const specialisms = scene.querySelectorAll(".welcome-specialism");

  const statement = scene.querySelector(".welcome__statement-text");

  const progress = scene.querySelector(".scene-progress");

  const shapeOne = scene.querySelector("[data-shape='welcome-one']");

  const shapeTwo = scene.querySelector("[data-shape='welcome-two']");

  const shapeThree = scene.querySelector("[data-shape='welcome-three']");

  const shapeFour = scene.querySelector("[data-shape='welcome-four']");

  /* =====================================================
       INITIAL STATE
    ===================================================== */

  gsap.set([eyebrow, titleSmall, name, progress], {
    autoAlpha: 1,
  });

  gsap.set(specialisms, {
    y: 24,
    scale: 0.92,
    autoAlpha: 0,
  });

  gsap.set(statement, {
    y: 28,
    scale: 0.97,
    autoAlpha: 0,
  });

  /* =====================================================
       TIMELINE
    ===================================================== */

  const timeline = gsap.timeline({
    defaults: {
      ease: "none",
    },

    scrollTrigger: {
      trigger: scene,

      start: "top top",

      end: () => `+=${window.innerHeight * 3.15}`,

      pin: true,

      pinSpacing: true,

      scrub: 0.32,

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
       INTRO
    ===================================================== */

  timeline.addLabel("intro", 0);

  timeline.to(
    {},
    {
      duration: 0.45,
    },
  );

  /* =====================================================
       PORTFOLIO TITLE TRANSITION
    ===================================================== */

  timeline.to(
    [eyebrow, titleSmall],
    {
      y: -20,

      autoAlpha: 0,

      duration: 0.55,

      ease: "power2.inOut",
    },
    0.42,
  );

  timeline.to(
    name,
    {
      scale: 1.1,

      y: -8,

      transformOrigin: "left center",

      duration: 0.55,

      ease: "power2.inOut",
    },
    0.42,
  );

  /* =====================================================
       SPECIALISMS APPEAR

       UI Design → Interaction Design → Front-End

       During autoplay these now play automatically in order.
    ===================================================== */

  timeline.addLabel("specialisms", 1.08);

  timeline.to(
    specialisms,
    {
      y: 0,

      scale: 1,

      autoAlpha: 1,

      stagger: 0.12,

      duration: 0.58,

      ease: "back.out(1.12)",
    },
    0.88,
  );

  timeline.to(
    name,
    {
      scale: 0.86,

      y: 14,

      autoAlpha: 0.36,

      duration: 0.6,

      ease: "power2.inOut",
    },
    1.08,
  );

  timeline.to(
    shapeOne,
    {
      xPercent: -28,
      yPercent: 18,
      rotation: 32,
      scale: 1.06,

      duration: 0.9,

      ease: "power2.inOut",
    },
    0.85,
  );

  timeline.to(
    shapeTwo,
    {
      xPercent: 35,
      yPercent: -28,
      scale: 1.15,

      duration: 0.9,

      ease: "power2.inOut",
    },
    0.85,
  );

  timeline.to(
    shapeThree,
    {
      xPercent: 24,
      yPercent: 32,
      rotation: -20,

      duration: 0.9,

      ease: "power2.inOut",
    },
    0.85,
  );

  timeline.to(
    shapeFour,
    {
      xPercent: -20,
      rotation: 34,

      duration: 0.9,

      ease: "power2.inOut",
    },
    0.85,
  );

  /* =====================================================
       READY / SHORT HOLD
    ===================================================== */

  timeline.addLabel("ready", 1.7);

  timeline.to(
    {},
    {
      duration: 0.42,
    },
  );

  /* =====================================================
       SPECIALISMS FADE
    ===================================================== */

  timeline.to(
    specialisms,
    {
      y: -16,

      scale: 0.96,

      autoAlpha: 0,

      stagger: 0.05,

      duration: 0.46,

      ease: "power2.inOut",
    },
    1.82,
  );

  timeline.to(
    name,
    {
      y: -12,

      autoAlpha: 0,

      duration: 0.46,

      ease: "power2.inOut",
    },
    1.88,
  );

  /* =====================================================
       STATEMENT
    ===================================================== */

  timeline.addLabel("statement", 2.1);

  timeline.to(
    statement,
    {
      y: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.66,

      ease: "power3.out",
    },
    2.06,
  );

  timeline.to(
    {},
    {
      duration: 0.56,
    },
  );

  /* =====================================================
       WELCOME EXIT

       Slow, soft fade into About.
    ===================================================== */

  timeline.addLabel("exit", 3.15);

  timeline.to(
    statement,
    {
      y: -22,

      scale: 0.985,

      autoAlpha: 0,

      duration: 0.6,

      ease: "power2.inOut",
    },
    2.88,
  );

  timeline.to(
    progress,
    {
      y: 12,

      autoAlpha: 0,

      duration: 0.4,

      ease: "power2.inOut",
    },
    3,
  );

  timeline.to(
    [shapeOne, shapeTwo, shapeThree, shapeFour],
    {
      scale: 1.12,

      autoAlpha: 0,

      stagger: 0.04,

      duration: 0.55,

      ease: "power2.inOut",
    },
    3.02,
  );

  timeline.addLabel("complete", 3.72);

  FLAnimationState.welcome.timeline = timeline;

  FLAnimationState.welcome.scrollTrigger = timeline.scrollTrigger;
}

/* =========================================================
   22 — WELCOME CLICK

   ONE CLICK now plays:
   portfolio → specialisms → statement → About

   Scroll remains fully manual if the visitor prefers it.
   ========================================================= */

function FLAdvanceWelcome() {
  return FLPlaySceneToNext("welcome", "about", {
    nextLanding: "ready",

    minimumDuration: 5.2,

    maximumDuration: 6.5,
  });
}

/* =========================================================
   23 — ABOUT PREPARATION
   ========================================================= */

function FLPrepareAboutScene() {
  const scene = FLGetScene("about");

  if (!scene) {
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
  ];

  gsap.set(elements, {
    clearProps: "transform,opacity,visibility,strokeDashoffset,strokeDasharray",
  });
}

/* =========================================================
   24 — REDUCED-MOTION ABOUT
   ========================================================= */

function FLBuildReducedAbout() {
  FLPrepareAboutScene();

  FLAnimationState.about.timeline = null;

  FLAnimationState.about.scrollTrigger = null;
}

/* =========================================================
   25 — ABOUT MASTER TIMELINE
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

  const destinationDot = destination?.querySelector(".travel-location__dot");

  const plane = scene.querySelector("[data-travel-plane]");

  const path = scene.querySelector("[data-travel-path]");

  const shapeOne = scene.querySelector("[data-shape='about-one']");

  const shapeTwo = scene.querySelector("[data-shape='about-two']");

  const shapeThree = scene.querySelector("[data-shape='about-three']");

  /* =====================================================
       INITIAL STATE
    ===================================================== */

  gsap.set([eyebrow, title], {
    autoAlpha: 1,
  });

  gsap.set(paragraphs, {
    y: 14,
    autoAlpha: 0.72,
  });

  gsap.set(travelStory, {
    y: 34,
    scale: 0.975,
    autoAlpha: 0.28,
  });

  gsap.set(destination, {
    autoAlpha: 0.34,
  });

  gsap.set(destinationDot, {
    scale: 0.7,
  });

  gsap.set(plane, {
    autoAlpha: 0,
  });

  if (path) {
    gsap.set(path, {
      strokeDasharray: 120,

      strokeDashoffset: 120,
    });
  }

  /* =====================================================
       TIMELINE
    ===================================================== */

  const timeline = gsap.timeline({
    defaults: {
      ease: "none",
    },

    scrollTrigger: {
      trigger: scene,

      start: "top top",

      end: () => `+=${window.innerHeight * 2.45}`,

      pin: true,

      pinSpacing: true,

      scrub: 0.3,

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
       INTRO
    ===================================================== */

  timeline.addLabel("intro", 0);

  timeline.to(
    paragraphs,
    {
      y: 0,

      autoAlpha: 1,

      stagger: 0.08,

      duration: 0.52,

      ease: "power2.out",
    },
    0.08,
  );

  timeline.to(
    shapeOne,
    {
      xPercent: -15,
      yPercent: 12,
      rotation: 14,

      duration: 0.75,

      ease: "power2.inOut",
    },
    0.05,
  );

  timeline.to(
    shapeTwo,
    {
      xPercent: 18,
      rotation: -8,

      duration: 0.75,

      ease: "power2.inOut",
    },
    0.05,
  );

  /* =====================================================
       TRAVEL CARD
    ===================================================== */

  timeline.addLabel("travel", 0.68);

  timeline.to(
    travelStory,
    {
      y: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.62,

      ease: "power3.out",
    },
    0.54,
  );

  timeline.to(
    origin?.querySelector(".travel-location__dot"),
    {
      scale: 1.08,

      duration: 0.32,

      ease: "back.out(1.8)",
    },
    0.72,
  );

  /* =====================================================
       READY

       Header About navigation lands here.
    ===================================================== */

  timeline.addLabel("ready", 1.06);

  timeline.to(
    {},
    {
      duration: 0.28,
    },
  );

  /* =====================================================
       FLIGHT
    ===================================================== */

  timeline.addLabel("flight", 1.34);

  if (path) {
    timeline.to(
      path,
      {
        strokeDashoffset: 0,

        duration: 1.05,

        ease: "power1.inOut",
      },
      1.27,
    );
  }

  timeline.to(
    plane,
    {
      autoAlpha: 1,

      duration: 0.18,
    },
    1.27,
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

        duration: 1.08,

        ease: "power1.inOut",
      },
      1.32,
    );
  } else {
    timeline.to(
      plane,
      {
        x: () => Math.max(180, travelStory?.clientWidth * 0.42),

        y: -8,

        duration: 1.08,

        ease: "power1.inOut",
      },
      1.32,
    );
  }

  /* =====================================================
       ARRIVAL
    ===================================================== */

  timeline.addLabel("arrival", 2.35);

  timeline.to(
    origin,
    {
      autoAlpha: 0.48,

      duration: 0.38,

      ease: "power2.inOut",
    },
    2.18,
  );

  timeline.to(
    destination,
    {
      autoAlpha: 1,

      duration: 0.46,

      ease: "power2.out",
    },
    2.2,
  );

  timeline.to(
    destinationDot,
    {
      scale: 1.12,

      duration: 0.32,

      ease: "back.out(1.8)",
    },
    2.24,
  );

  timeline.to(
    plane,
    {
      scale: 0.85,

      autoAlpha: 0,

      duration: 0.34,

      ease: "power2.in",
    },
    2.42,
  );

  timeline.to(
    shapeThree,
    {
      xPercent: 22,
      yPercent: -12,
      scale: 1.12,

      duration: 0.54,

      ease: "power2.out",
    },
    2.28,
  );

  /* =====================================================
       ARRIVAL HOLD
    ===================================================== */

  timeline.addLabel("arrivalReady", 2.72);

  timeline.to(
    {},
    {
      duration: 0.42,
    },
  );

  /* =====================================================
       EXIT
    ===================================================== */

  timeline.addLabel("exit", 3.14);

  timeline.to(
    [eyebrow, title, paragraphs],
    {
      y: -16,

      autoAlpha: 0,

      stagger: 0.025,

      duration: 0.46,

      ease: "power2.inOut",
    },
    3.08,
  );

  timeline.to(
    travelStory,
    {
      y: -18,

      scale: 0.985,

      autoAlpha: 0,

      duration: 0.52,

      ease: "power2.inOut",
    },
    3.12,
  );

  timeline.addLabel("complete", 3.75);

  FLAnimationState.about.timeline = timeline;

  FLAnimationState.about.scrollTrigger = timeline.scrollTrigger;
}

/* =========================================================
   26 — ABOUT CLICK

   ONE CLICK now plays:
   About → flight → Melbourne → What I Do

   No extra click needed at the plane or arrival.
   ========================================================= */

function FLAdvanceAbout() {
  return FLPlaySceneToNext("about", "services", {
    nextLanding: "ready",

    minimumDuration: 4.8,

    maximumDuration: 6,
  });
}
/* =========================================================
   27 — SERVICES PREPARATION
   ========================================================= */

function FLPrepareServicesScene() {
  const scene = FLGetScene("services");

  if (!scene) {
    return;
  }

  const elements = [
    scene.querySelector(".services__eyebrow"),

    scene.querySelector(".services__title"),

    scene.querySelector(".services__instruction"),

    scene.querySelector(".scene-indicator"),

    scene.querySelector("[data-scene-continue]"),

    ...scene.querySelectorAll(".discipline"),

    ...scene.querySelectorAll(".discipline__trigger"),

    ...scene.querySelectorAll(".shape"),
  ];

  gsap.set(elements, {
    clearProps: "transform,opacity,visibility,clipPath,filter",
  });
}

/* =========================================================
   28 — REDUCED-MOTION SERVICES
   ========================================================= */

function FLBuildReducedServices() {
  FLPrepareServicesScene();

  FLAnimationState.services.timeline = null;

  FLAnimationState.services.scrollTrigger = null;
}

/* =========================================================
   29 — SERVICES MASTER TIMELINE

   One continuous sequence:

   Intro
   ↓
   UI Design
   ↓
   Interaction Design
   ↓
   Front-End
   ↓
   Web Design
   ↓
   Interactive resting state
   ↓
   Recent Projects

   Manual scrolling still scrubs the exact same sequence.
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

  const ui = scene.querySelector(".discipline--ui");

  const interaction = scene.querySelector(".discipline--interaction");

  const frontend = scene.querySelector(".discipline--frontend");

  const web = scene.querySelector(".discipline--web");

  const disciplines = [ui, interaction, frontend, web];

  const triggers = scene.querySelectorAll(".discipline__trigger");

  const nextButton = scene.querySelector("[data-scene-continue]");

  const shapeOne = scene.querySelector("[data-shape='services-one']");

  const shapeTwo = scene.querySelector("[data-shape='services-two']");

  /* =====================================================
       INITIAL STATE

       Heading is readable immediately.

       Shapes already occupy their final layout, but reveal
       progressively as the timeline moves.
       ===================================================== */

  gsap.set([eyebrow, title, instruction, indicator, nextButton], {
    autoAlpha: 1,
  });

  disciplines.forEach((discipline, index) => {
    if (!discipline) {
      return;
    }

    const initialClipPaths = [
      "inset(0 100% 0 0 round 40px)",

      "circle(0% at 50% 50%)",

      "inset(100% 0 0 0 round 40px)",

      "inset(0 0 0 100% round 70px)",
    ];

    gsap.set(discipline, {
      clipPath: initialClipPaths[index],
    });
  });

  gsap.set(triggers, {
    y: 18,
    autoAlpha: 0,
  });

  /* =====================================================
       TIMELINE
       ===================================================== */

  const timeline = gsap.timeline({
    defaults: {
      ease: "none",
    },

    scrollTrigger: {
      trigger: scene,

      start: "top top",

      end: () => `+=${window.innerHeight * 2.65}`,

      pin: true,

      pinSpacing: true,

      scrub: 0.3,

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
       INTRO HOLD
       ===================================================== */

  timeline.addLabel("intro", 0);

  timeline.to(
    {},
    {
      duration: 0.36,
    },
  );

  /* =====================================================
       TITLE SETTLES UPWARD

       The heading becomes supporting information while the
       actual discipline playground becomes the focus.
       ===================================================== */

  timeline.addLabel("compress", 0.36);

  timeline.to(
    title,
    {
      scale: FLIsMobile() ? 0.96 : 0.88,

      y: FLIsMobile() ? -3 : -8,

      transformOrigin: "left top",

      duration: 0.62,

      ease: "power2.inOut",
    },
    0.36,
  );

  timeline.to(
    eyebrow,
    {
      y: -3,

      autoAlpha: 0.86,

      duration: 0.48,

      ease: "power2.inOut",
    },
    0.4,
  );

  timeline.to(
    instruction,
    {
      y: -3,

      autoAlpha: 0.82,

      duration: 0.48,

      ease: "power2.inOut",
    },
    0.43,
  );

  /* =====================================================
       UI DESIGN
       ===================================================== */

  timeline.addLabel("ui", 0.72);

  timeline.to(
    ui,
    {
      clipPath: "inset(0% 0% 0% 0% round 0px)",

      duration: 0.58,

      ease: "power3.inOut",
    },
    0.66,
  );

  timeline.to(
    ui?.querySelector(".discipline__trigger"),
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.44,

      ease: "power2.out",
    },
    0.82,
  );

  timeline.to(
    {},
    {
      duration: 0.18,
    },
  );

  /* =====================================================
       INTERACTION DESIGN
       ===================================================== */

  timeline.addLabel("interaction", 1.08);

  timeline.to(
    interaction,
    {
      clipPath: "circle(78% at 50% 50%)",

      duration: 0.6,

      ease: "power3.inOut",
    },
    1.02,
  );

  timeline.to(
    interaction?.querySelector(".discipline__trigger"),
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.44,

      ease: "power2.out",
    },
    1.18,
  );

  timeline.to(
    {},
    {
      duration: 0.18,
    },
  );

  /* =====================================================
       FRONT-END
       ===================================================== */

  timeline.addLabel("frontend", 1.45);

  timeline.to(
    frontend,
    {
      clipPath: "inset(0% 0% 0% 0% round 0px)",

      duration: 0.6,

      ease: "power3.inOut",
    },
    1.39,
  );

  timeline.to(
    frontend?.querySelector(".discipline__trigger"),
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.44,

      ease: "power2.out",
    },
    1.55,
  );

  timeline.to(
    {},
    {
      duration: 0.18,
    },
  );

  /* =====================================================
       WEB DESIGN
       ===================================================== */

  timeline.addLabel("web", 1.82);

  timeline.to(
    web,
    {
      clipPath: "inset(0% 0% 0% 0% round 0px)",

      duration: 0.6,

      ease: "power3.inOut",
    },
    1.76,
  );

  timeline.to(
    web?.querySelector(".discipline__trigger"),
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.44,

      ease: "power2.out",
    },
    1.92,
  );

  /* =====================================================
       BACKGROUND SHAPES

       Slow movement underneath the discipline reveal keeps
       the section alive without overpowering the content.
       ===================================================== */

  timeline.to(
    shapeOne,
    {
      xPercent: 48,
      yPercent: 65,
      rotation: 42,
      scale: 1.08,

      duration: 1.7,

      ease: "power1.inOut",
    },
    0.44,
  );

  timeline.to(
    shapeTwo,
    {
      xPercent: -44,
      yPercent: -48,
      rotation: -34,
      scale: 1.05,

      duration: 1.7,

      ease: "power1.inOut",
    },
    0.44,
  );

  /* =====================================================
       READY / INTERACTIVE HOLD

       Header navigation lands here.

       All four disciplines are visible and can be opened.
       ===================================================== */

  timeline.addLabel("ready", 2.42);

  timeline.to(
    {},
    {
      duration: 0.72,
    },
  );

  /* =====================================================
       EXIT

       Exit intentionally begins slowly so autoplay does not
       feel like it suddenly yanks the visitor away.
       ===================================================== */

  timeline.addLabel("exit", 3.14);

  timeline.to(
    instruction,
    {
      y: -8,

      autoAlpha: 0,

      duration: 0.4,

      ease: "power2.inOut",
    },
    3.14,
  );

  timeline.to(
    title,
    {
      y: -16,

      scale: FLIsMobile() ? 0.92 : 0.82,

      autoAlpha: 0,

      duration: 0.58,

      ease: "power2.inOut",
    },
    3.2,
  );

  timeline.to(
    eyebrow,
    {
      y: -10,

      autoAlpha: 0,

      duration: 0.46,

      ease: "power2.inOut",
    },
    3.22,
  );

  timeline.to(
    triggers,
    {
      y: -10,

      autoAlpha: 0,

      stagger: 0.04,

      duration: 0.45,

      ease: "power2.inOut",
    },
    3.23,
  );

  /*
       Clip paths close inward rather than scaling the cards.

       That prevents clashes with the separate discipline
       expansion interaction.
    */

  timeline.to(
    ui,
    {
      clipPath: "inset(12% 45% 12% 45% round 999px)",

      duration: 0.58,

      ease: "power2.inOut",
    },
    3.32,
  );

  timeline.to(
    interaction,
    {
      clipPath: "circle(5% at 50% 50%)",

      duration: 0.58,

      ease: "power2.inOut",
    },
    3.35,
  );

  timeline.to(
    frontend,
    {
      clipPath: "inset(12% 45% 12% 45% round 999px)",

      duration: 0.58,

      ease: "power2.inOut",
    },
    3.38,
  );

  timeline.to(
    web,
    {
      clipPath: "inset(12% 45% 12% 45% round 999px)",

      duration: 0.58,

      ease: "power2.inOut",
    },
    3.41,
  );

  timeline.to(
    shapeOne,
    {
      xPercent: 115,
      scale: 0.7,
      autoAlpha: 0,

      duration: 0.62,

      ease: "power2.inOut",
    },
    3.38,
  );

  timeline.to(
    shapeTwo,
    {
      xPercent: -115,
      scale: 0.7,
      autoAlpha: 0,

      duration: 0.62,

      ease: "power2.inOut",
    },
    3.38,
  );

  timeline.to(
    [indicator, nextButton],
    {
      autoAlpha: 0,

      duration: 0.34,

      ease: "power2.inOut",
    },
    3.68,
  );

  timeline.addLabel("complete", 4.08);

  /* =====================================================
       STORE REFERENCES
       ===================================================== */

  FLAnimationState.services.timeline = timeline;

  FLAnimationState.services.scrollTrigger = timeline.scrollTrigger;
}

/* =========================================================
   30 — SERVICES CLICK

   ONE CLICK plays:

   What I Do
   → UI Design
   → Interaction Design
   → Front-End
   → Web Design
   → Recent Projects

   Individual discipline buttons remain separately usable.
   ========================================================= */

function FLAdvanceServices() {
  /*
       Close an expanded discipline before starting the
       scene-wide autoplay.
    */

  window.FLSite?.closeActiveDiscipline?.();

  return FLPlaySceneToNext("services", "projects", {
    nextLanding: "ready",

    minimumDuration: 5.2,

    maximumDuration: 6.5,
  });
}

/* =========================================================
   31 — DISCIPLINE SUPPORT ANIMATION

   CSS owns the actual card expansion.

   This only quietens the surrounding heading and shapes
   while a visitor explores one discipline.
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

  const title = scene.querySelector(".services__title");

  const eyebrow = scene.querySelector(".services__eyebrow");

  const instruction = scene.querySelector(".services__instruction");

  const shapeOne = scene.querySelector("[data-shape='services-one']");

  const shapeTwo = scene.querySelector("[data-shape='services-two']");

  /* =====================================================
       DISCIPLINE OPEN
       ===================================================== */

  if (disciplineId) {
    gsap.to(title, {
      autoAlpha: 0.2,

      y: -3,

      duration: 0.32,

      ease: "power2.out",

      overwrite: "auto",
    });

    gsap.to([eyebrow, instruction], {
      autoAlpha: 0.18,

      duration: 0.3,

      ease: "power2.out",

      overwrite: "auto",
    });

    gsap.to(shapeOne, {
      scale: 1.24,

      rotation: "+=14",

      duration: 0.55,

      ease: "power3.out",

      overwrite: "auto",
    });

    gsap.to(shapeTwo, {
      scale: 0.84,

      rotation: "-=12",

      duration: 0.55,

      ease: "power3.out",

      overwrite: "auto",
    });

    return;
  }

  /* =====================================================
       DISCIPLINE CLOSE

       After closing, the ScrollTrigger timeline immediately
       regains ownership of the visual state.
       ===================================================== */

  gsap.to([title, eyebrow, instruction], {
    autoAlpha: 1,

    y: 0,

    duration: 0.34,

    ease: "power2.out",

    overwrite: "auto",

    onComplete() {
      FLForceTriggerSync(FLAnimationState.services.scrollTrigger);
    },
  });
}

/* =========================================================
   32 — DISCIPLINE EVENTS
   ========================================================= */

function FLInitialiseDisciplineAnimationEvents() {
  window.addEventListener("flDisciplineChange", FLHandleDisciplineChange);
}

/* =========================================================
   33 — PROJECT CONSTANTS
   ========================================================= */

const FLProjectIds = ["nada-nusantara", "pulse-diary", "lega"];

const FLProjectLandingLabels = {
  "nada-nusantara": "nadaReady",

  "pulse-diary": "pulseReady",

  lega: "legaReady",
};

/* =========================================================
   34 — PROJECT HELPERS
   ========================================================= */

function FLGetProjectIdByIndex(index) {
  return window.FLProjectOrder?.[index] || FLProjectIds[index] || null;
}

function FLGetProjectIndex(projectId) {
  const order = window.FLProjectOrder || FLProjectIds;

  return order.indexOf(projectId);
}

/* =========================================================
   35 — PROJECT RAIL PROGRESS
   ========================================================= */

function FLSetProjectRailProgress(progress) {
  const fill = document.querySelector("[data-project-progress-fill]");

  if (!fill) {
    return;
  }

  const safeProgress = FLClamp(progress);

  const visualProgress = 0.08 + safeProgress * 0.92;

  const percentage = `${visualProgress * 100}%`;

  if (FLIsMobile()) {
    fill.style.width = percentage;

    fill.style.height = "100%";
  } else {
    fill.style.width = "100%";

    fill.style.height = percentage;
  }
}

/* =========================================================
   36 — GET PROJECT INDEX FROM TIMELINE PROGRESS
   ========================================================= */

function FLGetProjectIndexFromProgress(progress) {
  const safeProgress = FLClamp(progress);

  const nada = FLResolveLandingProgress("projects", "nadaReady");

  const pulse = FLResolveLandingProgress("projects", "pulseReady");

  const lega = FLResolveLandingProgress("projects", "legaReady");

  const nadaPulseMidpoint = (nada + pulse) / 2;

  const pulseLegaMidpoint = (pulse + lega) / 2;

  if (safeProgress < nadaPulseMidpoint) {
    return 0;
  }

  if (safeProgress < pulseLegaMidpoint) {
    return 1;
  }

  return 2;
}

/* =========================================================
   37 — SYNCHRONISE ACTIVE PROJECT
   ========================================================= */

function FLSynchroniseProjectState(index) {
  const safeIndex = Math.max(0, Math.min(index, FLProjectIds.length - 1));

  const projectId = FLGetProjectIdByIndex(safeIndex);

  if (!projectId) {
    return;
  }

  if (FLAnimationState.projects.currentProjectIndex === safeIndex) {
    return;
  }

  FLAnimationState.projects.currentProjectIndex = safeIndex;

  const current = window.getActiveFLProject?.();

  if (current?.id === projectId) {
    return;
  }

  window.setActiveFLProject?.(projectId);
}

/* =========================================================
   38 — PROJECT SCENE PREPARATION
   ========================================================= */

function FLPrepareProjectsScene() {
  const scene = FLGetScene("projects");

  if (!scene) {
    return;
  }

  const elements = [
    scene.querySelector(".projects__heading"),

    scene.querySelector(".projects__eyebrow"),

    scene.querySelector(".projects__title"),

    scene.querySelector("[data-project-stage]"),

    scene.querySelector(".project-progress"),

    scene.querySelector(".project-controls"),

    scene.querySelector(".projects__interaction-hint"),

    scene.querySelector(".scene-indicator"),

    scene.querySelector(".scene-next--contact"),

    ...scene.querySelectorAll(".shape"),
  ];

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
   39 — PREPARE DESKTOP PROJECT PANELS
   ========================================================= */

function FLPrepareDesktopProjectPanels() {
  const scene = FLGetScene("projects");

  if (!scene) {
    return;
  }

  const nada = scene.querySelector("[data-project-panel='nada-nusantara']");

  const pulse = scene.querySelector("[data-project-panel='pulse-diary']");

  const lega = scene.querySelector("[data-project-panel='lega']");

  [nada, pulse, lega].forEach((panel) => {
    if (!panel) {
      return;
    }

    gsap.set(panel, {
      position: "absolute",

      inset: 0,

      display: "flex",

      transition: "none",

      pointerEvents: "none",
    });
  });

  gsap.set(nada, {
    yPercent: 6,
    scale: 0.985,
    autoAlpha: 0.18,
  });

  gsap.set(pulse, {
    yPercent: 18,
    scale: 0.95,
    rotation: 1,
    autoAlpha: 0,
  });

  gsap.set(lega, {
    yPercent: 18,
    scale: 0.95,
    rotation: -1,
    autoAlpha: 0,
  });
}

/* =========================================================
   40 — REDUCED-MOTION PROJECTS
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
   41 — MOBILE PROJECT SCENE

   Mobile uses discrete project changes while the page
   scroll still controls progress through the scene.
   ========================================================= */

function FLBuildMobileProjectsScene() {
  const scene = FLGetScene("projects");

  if (!scene || !FLHasScrollTrigger()) {
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

      if (self.progress >= 0.68) {
        index = 2;
      } else if (self.progress >= 0.35) {
        index = 1;
      }

      FLSynchroniseProjectState(index);

      FLSetProjectRailProgress(self.progress);
    },
  });

  FLAnimationState.projects.timeline = null;

  FLAnimationState.projects.scrollTrigger = trigger;
}

/* =========================================================
   42 — DESKTOP PROJECT MASTER TIMELINE

   One continuous journey:

   Nada Nusantara
   ↓
   Pulse Diary
   ↓
   Lega
   ↓
   Contact
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

  const nada = scene.querySelector("[data-project-panel='nada-nusantara']");

  const pulse = scene.querySelector("[data-project-panel='pulse-diary']");

  const lega = scene.querySelector("[data-project-panel='lega']");

  const nadaVisual = nada?.querySelector(".project-visual--rhythm");

  const pulseVisual = pulse?.querySelector(".project-visual--pulse");

  const legaVisual = lega?.querySelector(".project-visual--sliders");

  const shapeOne = scene.querySelector("[data-shape='projects-one']");

  const shapeTwo = scene.querySelector("[data-shape='projects-two']");

  /* =====================================================
       INITIAL STATE
    ===================================================== */

  gsap.set([indicator, eyebrow, title], {
    autoAlpha: 1,
  });

  gsap.set(stage, {
    y: 28,
    scale: 0.98,
    autoAlpha: 0.2,
  });

  gsap.set(controls, {
    y: 10,
    autoAlpha: 0,
  });

  gsap.set(hint, {
    autoAlpha: 0,
  });

  gsap.set(nextButton, {
    y: 10,
    autoAlpha: 0,
  });

  /* =====================================================
       TIMELINE
    ===================================================== */

  const timeline = gsap.timeline({
    defaults: {
      ease: "none",
    },

    scrollTrigger: {
      trigger: scene,

      start: "top top",

      end: () => `+=${window.innerHeight * 3.35}`,

      pin: true,

      pinSpacing: true,

      scrub: 0.3,

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

        FLSetProjectRailProgress(self.progress);
      },
    },
  });

  /* =====================================================
       INTRO
    ===================================================== */

  timeline.addLabel("intro", 0);

  timeline.to(
    {},
    {
      duration: 0.3,
    },
  );

  /* =====================================================
       HEADING COMPRESSES
    ===================================================== */

  timeline.to(
    title,
    {
      scale: FLIsTablet() ? 0.92 : 0.84,

      y: FLIsTablet() ? -3 : -8,

      transformOrigin: "left top",

      duration: 0.6,

      ease: "power2.inOut",
    },
    0.28,
  );

  timeline.to(
    eyebrow,
    {
      y: -3,

      autoAlpha: 0.85,

      duration: 0.46,

      ease: "power2.inOut",
    },
    0.32,
  );

  /* =====================================================
       PROJECT STAGE ARRIVES
    ===================================================== */

  timeline.to(
    stage,
    {
      y: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.68,

      ease: "power3.out",
    },
    0.38,
  );

  timeline.to(
    controls,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.42,

      ease: "power2.out",
    },
    0.62,
  );

  timeline.to(
    hint,
    {
      autoAlpha: 1,

      duration: 0.34,
    },
    0.7,
  );

  /* =====================================================
       NADA NUSANTARA
    ===================================================== */

  timeline.to(
    nada,
    {
      yPercent: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.64,

      ease: "power3.out",
    },
    0.42,
  );

  timeline.set(
    nada,
    {
      pointerEvents: "auto",
    },
    0.9,
  );

  timeline.to(
    nadaVisual,
    {
      xPercent: 0,

      scale: 1,

      duration: 0.65,

      ease: "power2.out",
    },
    0.46,
  );

  timeline.to(
    shapeOne,
    {
      xPercent: -16,
      yPercent: 18,
      rotation: 22,

      duration: 0.85,

      ease: "power2.inOut",
    },
    0.34,
  );

  timeline.to(
    shapeTwo,
    {
      xPercent: 20,
      yPercent: -16,
      rotation: -18,

      duration: 0.85,

      ease: "power2.inOut",
    },
    0.34,
  );

  /* =====================================================
       NADA READY

       Header Recent Projects navigation lands here.
    ===================================================== */

  timeline.addLabel("ready", 1.12);

  timeline.addLabel("nadaReady", 1.12);

  timeline.to(
    {},
    {
      duration: 0.66,
    },
  );

  /* =====================================================
       NADA → PULSE

       Nada leaves sideways like a waveform moving onward.
    ===================================================== */

  timeline.addLabel("toPulse", 1.78);

  timeline.to(
    nadaVisual,
    {
      xPercent: 18,

      scaleY: 1.16,

      rotation: 4,

      duration: 0.62,

      ease: "power2.inOut",
    },
    1.7,
  );

  timeline.to(
    nada,
    {
      yPercent: -8,

      scale: 0.975,

      autoAlpha: 0,

      duration: 0.72,

      ease: "power2.inOut",
    },
    1.76,
  );

  timeline.to(
    pulse,
    {
      yPercent: 0,

      scale: 1,

      rotation: 0,

      autoAlpha: 1,

      duration: 0.76,

      ease: "power3.inOut",
    },
    1.82,
  );

  timeline.to(
    pulseVisual,
    {
      scale: 1,

      rotation: 0,

      duration: 0.72,

      ease: "power3.out",
    },
    1.84,
  );

  timeline.set(
    nada,
    {
      pointerEvents: "none",
    },
    2.12,
  );

  timeline.set(
    pulse,
    {
      pointerEvents: "auto",
    },
    2.12,
  );

  /* =====================================================
       PULSE READY
    ===================================================== */

  timeline.addLabel("pulseReady", 2.58);

  timeline.to(
    {},
    {
      duration: 0.7,
    },
  );

  /* =====================================================
       PULSE → LEGA
    ===================================================== */

  timeline.addLabel("toLega", 3.28);

  timeline.to(
    pulseVisual,
    {
      scale: 1.32,

      rotation: 5,

      duration: 0.66,

      ease: "power2.inOut",
    },
    3.18,
  );

  timeline.to(
    pulse,
    {
      yPercent: -8,

      scale: 1.02,

      autoAlpha: 0,

      duration: 0.74,

      ease: "power2.inOut",
    },
    3.24,
  );

  timeline.to(
    lega,
    {
      yPercent: 0,

      scale: 1,

      rotation: 0,

      autoAlpha: 1,

      duration: 0.78,

      ease: "power3.inOut",
    },
    3.3,
  );

  timeline.to(
    legaVisual,
    {
      xPercent: 0,

      scale: 1,

      duration: 0.72,

      ease: "power3.out",
    },
    3.34,
  );

  timeline.set(
    pulse,
    {
      pointerEvents: "none",
    },
    3.64,
  );

  timeline.set(
    lega,
    {
      pointerEvents: "auto",
    },
    3.64,
  );

  /* =====================================================
       LEGA READY
    ===================================================== */

  timeline.addLabel("legaReady", 4.12);

  timeline.to(
    nextButton,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.4,

      ease: "power2.out",
    },
    4.02,
  );

  timeline.to(
    {},
    {
      duration: 0.74,
    },
  );

  /* =====================================================
       EXIT TO CONTACT
    ===================================================== */

  timeline.addLabel("exit", 4.86);

  timeline.to(
    lega,
    {
      yPercent: -7,

      scale: 0.98,

      autoAlpha: 0,

      duration: 0.64,

      ease: "power2.inOut",
    },
    4.86,
  );

  timeline.to(
    stage,
    {
      y: -10,

      scale: 0.985,

      autoAlpha: 0,

      duration: 0.68,

      ease: "power2.inOut",
    },
    4.92,
  );

  timeline.to(
    title,
    {
      y: -18,

      autoAlpha: 0,

      duration: 0.52,

      ease: "power2.inOut",
    },
    4.94,
  );

  timeline.to(
    eyebrow,
    {
      y: -10,

      autoAlpha: 0,

      duration: 0.44,

      ease: "power2.inOut",
    },
    4.96,
  );

  timeline.to(
    [controls, hint],
    {
      y: -10,

      autoAlpha: 0,

      duration: 0.44,

      ease: "power2.inOut",
    },
    4.98,
  );

  timeline.to(
    projectProgress,
    {
      autoAlpha: 0,

      duration: 0.42,

      ease: "power2.inOut",
    },
    5.02,
  );

  timeline.to(
    shapeOne,
    {
      xPercent: 65,
      yPercent: -50,
      scale: 1.16,
      autoAlpha: 0,

      duration: 0.62,

      ease: "power2.inOut",
    },
    4.98,
  );

  timeline.to(
    shapeTwo,
    {
      xPercent: -65,
      yPercent: 48,
      scale: 1.16,
      autoAlpha: 0,

      duration: 0.62,

      ease: "power2.inOut",
    },
    4.98,
  );

  timeline.to(
    [indicator, nextButton],
    {
      autoAlpha: 0,

      duration: 0.34,
    },
    5.22,
  );

  timeline.addLabel("complete", 5.56);

  /* =====================================================
       STORE REFERENCES
    ===================================================== */

  FLAnimationState.projects.timeline = timeline;

  FLAnimationState.projects.scrollTrigger = timeline.scrollTrigger;
}

/* =========================================================
   43 — GET PROJECT SCROLL PROGRESS
   ========================================================= */

function FLGetProjectProgress(projectId) {
  if (FLIsMobile() || !FLAnimationState.projects.timeline) {
    const mobileStops = {
      "nada-nusantara": 0.12,

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
   44 — SCROLL DIRECTLY TO PROJECT
   ========================================================= */

function FLScrollToProject(projectId, options = {}) {
  const trigger = FLAnimationState.projects.scrollTrigger;

  const progress = FLGetProjectProgress(projectId);

  if (progress === null || progress === undefined) {
    return false;
  }

  if (FLIsReducedMotion() || !trigger) {
    window.setActiveFLProject?.(projectId);

    return true;
  }

  FLKillScrollTween();

  return FLScrollTriggerToProgress(trigger, progress, {
    duration: options.duration ?? 0.82,

    immediate: options.immediate ?? false,

    syncAllTriggers: true,

    ease: "power2.inOut",
  });
}

/* =========================================================
   45 — PROJECT CHANGE API

   Project timeline marker / Previous / Next buttons use
   this function.

   These remain manual even though background Continue now
   plays the complete project sequence.
   ========================================================= */

function FLChangeProject(projectId) {
  const validProject = window.getFLProject?.(projectId);

  if (!validProject) {
    return false;
  }

  return FLScrollToProject(projectId, {
    duration: 0.82,
  });
}

/* =========================================================
   46 — PROJECT SCENE CLICK

   ONE CLICK now plays:

   current project
   → remaining projects
   → Contact

   Example from Nada:
   Nada → Pulse → Lega → Contact

   If the visitor is already on Pulse:
   Pulse → Lega → Contact
   ========================================================= */

function FLAdvanceProjects() {
  return FLPlaySceneToNext("projects", "contact", {
    nextLanding: "ready",

    minimumDuration: 5.8,

    maximumDuration: 7.2,
  });
}

/* =========================================================
   47 — PROJECT STATE EVENT
   ========================================================= */

function FLHandleProjectStateChange(event) {
  const projectId = event.detail?.projectId || event.detail?.project?.id;

  if (!projectId) {
    return;
  }

  const index = FLGetProjectIndex(projectId);

  if (index >= 0) {
    FLAnimationState.projects.currentProjectIndex = index;
  }
}

/* =========================================================
   48 — PROJECT EVENTS
   ========================================================= */

function FLInitialiseProjectAnimationEvents() {
  window.addEventListener("flProjectChange", FLHandleProjectStateChange);
}

/* =========================================================
   49 — AUTOPLAY STATE CORRECTION

   FLScrollToY() clears any previous automated movement
   before creating a new tween.

   Because of that, scene autoplay marks itself as active
   AFTER the new tween has been created.

   This replaces the earlier FLPlaySceneToNext definition.
   ========================================================= */

FLPlaySceneToNext = function (sceneName, nextScene, options = {}) {
  if (!sceneName || !nextScene) {
    return false;
  }

  if (FLAnimationState.autoPlay.active) {
    return false;
  }

  if (FLIsReducedMotion()) {
    return FLGoToScene(nextScene, {
      landing: options.nextLanding ?? "ready",
    });
  }

  const target = FLGetSceneLandingY(nextScene, options.nextLanding ?? "ready");

  if (target === null) {
    return false;
  }

  const currentY = window.scrollY;

  const distance = Math.abs(target - currentY);

  const distanceDuration = (distance / Math.max(window.innerHeight, 1)) * 1.15;

  const minimumDuration = options.minimumDuration ?? 4;

  const maximumDuration = options.maximumDuration ?? 6;

  const duration = FLClamp(
    Math.max(distanceDuration, minimumDuration),
    minimumDuration,
    maximumDuration,
  );

  const tween = FLScrollToY(target, {
    duration,

    syncAllTriggers: true,

    ease: "power1.inOut",

    onComplete() {
      FLSetSceneActive(nextScene);
    },
  });

  if (tween) {
    FLAnimationState.autoPlay.active = true;

    FLAnimationState.autoPlay.scene = sceneName;
  }

  return true;
};

/* =========================================================
   50 — CONTACT PREPARATION
   ========================================================= */

function FLPrepareContactScene() {
  const scene = FLGetScene("contact");

  if (!scene) {
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
  ];

  gsap.set(elements, {
    clearProps: "transform,opacity,visibility",
  });
}

/* =========================================================
   51 — REDUCED-MOTION CONTACT
   ========================================================= */

function FLBuildReducedContact() {
  FLPrepareContactScene();

  FLAnimationState.contact.timeline = null;

  FLAnimationState.contact.scrollTrigger = null;
}

/* =========================================================
   52 — CONTACT MASTER TIMELINE

   Contact is deliberately calmer than the earlier scenes.

   This should feel like the experience has properly landed,
   not like another section demanding more interaction.
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

       Some content is faintly visible before the Contact
       animation fully lands.

       This prevents an empty flash between projects and the
       ending scene.
       ===================================================== */

  gsap.set(indicator, {
    x: -10,
    autoAlpha: 0.5,
  });

  gsap.set(eyebrow, {
    y: 10,
    autoAlpha: 0.5,
  });

  gsap.set(title, {
    y: 30,
    autoAlpha: 0.38,
  });

  gsap.set(description, {
    y: 18,
    autoAlpha: 0.2,
  });

  gsap.set(links, {
    x: -16,
    autoAlpha: 0,
  });

  gsap.set(brand, {
    xPercent: 10,
    scale: 0.94,
    autoAlpha: 0,
  });

  gsap.set(restart, {
    y: 10,
    autoAlpha: 0,
  });

  /* =====================================================
       TIMELINE
       ===================================================== */

  const timeline = gsap.timeline({
    defaults: {
      ease: "none",
    },

    scrollTrigger: {
      trigger: scene,

      start: "top top",

      end: () => `+=${window.innerHeight * 1.25}`,

      pin: true,

      pinSpacing: true,

      scrub: 0.28,

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

      duration: 0.32,

      ease: "power2.out",
    },
    0.03,
  );

  timeline.to(
    eyebrow,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.36,

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
    0.08,
  );

  timeline.to(
    description,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.46,

      ease: "power2.out",
    },
    0.3,
  );

  /* =====================================================
       LINKS
       ===================================================== */

  timeline.to(
    links,
    {
      x: 0,

      autoAlpha: 1,

      stagger: 0.08,

      duration: 0.42,

      ease: "power2.out",
    },
    0.48,
  );

  /* =====================================================
       GIANT F.L ENDING MARK
       ===================================================== */

  timeline.to(
    brand,
    {
      xPercent: 0,

      scale: 1,

      autoAlpha: 1,

      duration: 0.76,

      ease: "power3.out",
    },
    0.3,
  );

  /* =====================================================
       DECORATIVE SHAPES
       ===================================================== */

  timeline.fromTo(
    shapeOne,
    {
      xPercent: 30,
      yPercent: -18,
      rotation: -18,
      scale: 0.84,
    },
    {
      xPercent: 0,
      yPercent: 0,
      rotation: 0,
      scale: 1,

      duration: 0.82,

      ease: "power2.out",
    },
    0.08,
  );

  timeline.fromTo(
    shapeTwo,
    {
      xPercent: 38,
      yPercent: 54,
      rotation: 30,
      scale: 0.74,
    },
    {
      xPercent: 0,
      yPercent: 0,
      rotation: 12,
      scale: 1,

      duration: 0.8,

      ease: "power2.out",
    },
    0.12,
  );

  timeline.fromTo(
    shapeThree,
    {
      xPercent: -38,
      yPercent: 28,
      rotation: 20,
      scale: 0.78,
    },
    {
      xPercent: 0,
      yPercent: 0,
      rotation: -14,
      scale: 1,

      duration: 0.82,

      ease: "power2.out",
    },
    0.12,
  );

  /* =====================================================
       READY

       Contact navigation lands here.
       ===================================================== */

  timeline.addLabel("ready", 0.94);

  timeline.to(
    restart,
    {
      y: 0,

      autoAlpha: 1,

      duration: 0.36,

      ease: "power2.out",
    },
    0.84,
  );

  timeline.to(
    {},
    {
      duration: 0.58,
    },
  );

  timeline.addLabel("complete", 1.52);

  FLAnimationState.contact.timeline = timeline;

  FLAnimationState.contact.scrollTrigger = timeline.scrollTrigger;
}

/* =========================================================
   53 — SCENE ADVANCE ROUTER
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
   54 — CUSTOM CURSOR
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

  /* =====================================================
       CURSOR POSITION
       ===================================================== */

  const moveX = gsap.quickTo(cursor, "x", {
    duration: 0.14,

    ease: "power3.out",
  });

  const moveY = gsap.quickTo(cursor, "y", {
    duration: 0.14,

    ease: "power3.out",
  });

  window.addEventListener(
    "pointermove",
    (event) => {
      moveX(event.clientX);

      moveY(event.clientY);

      gsap.to(cursor, {
        autoAlpha: 1,

        duration: 0.12,

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

      duration: 0.16,
    });
  });

  /* =====================================================
       INTERACTIVE CURSOR TARGETS
       ===================================================== */

  const interactiveSelector = [
    ".discipline",

    ".project-read-more",

    ".project-progress__marker",

    ".contact-link",

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

    let text = "Click";

    if (interactive.matches(".discipline")) {
      text = interactive.classList.contains("is-active") ? "Close" : "Open";
    } else if (interactive.matches(".project-read-more")) {
      text = "View";
    } else if (interactive.matches("[data-scene-target]")) {
      text = "Go";
    } else if (interactive.matches("[data-scene-continue]")) {
      text = "Play";
    }

    if (label) {
      label.textContent = text;
    }

    gsap.to(cursor, {
      width: "4rem",

      height: "4rem",

      background: "rgba(243, 207, 91, 0.58)",

      borderColor: "rgba(32, 29, 26, 0.45)",

      duration: 0.2,

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

      duration: 0.2,

      ease: "power2.out",

      overwrite: "auto",
    });
  });
}

/* =========================================================
   55 — CLEAR ANIMATION SYSTEM
   ========================================================= */

function FLClearAnimations() {
  FLKillScrollTween();

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
   56 — VIEWPORT MODE
   ========================================================= */

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
   57 — BUILD ALL SCENES
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
   58 — CAPTURE CURRENT POSITION

   Resize / font-size changes should preserve where the
   visitor currently is instead of restarting the site.
   ========================================================= */

function FLCaptureCurrentLanding() {
  const scene =
    window.FLSite?.getCurrentScene?.() ||
    FLAnimationState.currentScene ||
    "welcome";

  /* -----------------------------------------------------
       PROJECT
    ----------------------------------------------------- */

  if (scene === "projects") {
    const project = window.getActiveFLProject?.();

    return {
      scene,

      landing: FLProjectLandingLabels[project?.id] || "ready",
    };
  }

  /* -----------------------------------------------------
       WELCOME
    ----------------------------------------------------- */

  if (scene === "welcome") {
    const progress = FLAnimationState.welcome.scrollTrigger?.progress ?? 0;

    if (progress > 0.58) {
      return {
        scene,

        landing: "statement",
      };
    }

    if (progress > 0.2) {
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
       EVERYTHING ELSE
    ----------------------------------------------------- */

  return {
    scene,

    landing: "ready",
  };
}

/* =========================================================
   59 — REBUILD ANIMATIONS
   ========================================================= */

function FLRebuildAnimations(options = {}) {
  if (FLAnimationState.isRebuilding) {
    return;
  }

  FLAnimationState.isRebuilding = true;

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

      FLAnimationState.isRebuilding = false;
    });
  });
}

/* =========================================================
   60 — LIGHTWEIGHT LAYOUT REFRESH
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
   61 — LANGUAGE CHANGE
   ========================================================= */

function FLHandleLanguageChange() {
  FLRefreshLayout();
}

/* =========================================================
   62 — FONT SIZE CHANGE
   ========================================================= */

function FLHandleFontSizeChange() {
  FLRebuildAnimations({
    preserveScene: true,
  });
}

/* =========================================================
   63 — MOTION SETTING CHANGE
   ========================================================= */

function FLHandleMotionPreferenceChange() {
  FLRebuildAnimations({
    preserveScene: true,
  });
}

/* =========================================================
   64 — RESIZE
   ========================================================= */

function FLHandleAnimationResize() {
  clearTimeout(FLAnimationState.resizeTimer);

  FLAnimationState.resizeTimer = window.setTimeout(() => {
    const mode = FLGetViewportMode();

    /*
                   Crossing a breakpoint changes the actual
                   scene architecture, so rebuild.
                */

    if (mode !== FLAnimationState.viewportMode) {
      FLRebuildAnimations({
        preserveScene: true,
      });

      return;
    }

    /*
                   Same layout family:
                   only recalculate ScrollTrigger geometry.
                */

    FLRefreshLayout();
  }, 180);
}

/* =========================================================
   65 — SITE SCENE CHANGE
   ========================================================= */

function FLHandleSceneChange(event) {
  const scene = event.detail?.scene;

  if (!scene) {
    return;
  }

  FLAnimationState.currentScene = scene;
}

/* =========================================================
   66 — ANIMATION EVENTS
   ========================================================= */

function FLInitialiseAnimationEvents() {
  if (FLAnimationState.eventsInitialised) {
    return;
  }

  FLAnimationState.eventsInitialised = true;

  FLInitialiseScrollInterruption();

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

  /* =====================================================
       FONT LOADING
       ===================================================== */

  document.fonts?.ready
    ?.then(() => {
      FLRefreshLayout();
    })
    .catch(() => {
      /*
                   Font readiness is non-critical.
                */
    });
}

/* =========================================================
   67 — INITIAL SCENE POSITION
   ========================================================= */

function FLCorrectInitialScenePosition() {
  const scene = window.FLSite?.getCurrentScene?.() || "welcome";

  const landing = scene === "welcome" ? "intro" : "ready";

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
   68 — INITIALISE
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
   69 — PUBLIC ANIMATION API
   ========================================================= */

window.FLAnimations = {
  /* -----------------------------------------------------
       SCENE NAVIGATION
    ----------------------------------------------------- */

  goToScene(sceneName, options = {}) {
    return FLGoToScene(sceneName, options);
  },

  advanceScene(sceneName) {
    return FLAdvanceScene(sceneName);
  },

  /* -----------------------------------------------------
       PROJECT NAVIGATION
    ----------------------------------------------------- */

  changeProject(projectId) {
    return FLChangeProject(projectId);
  },

  /* -----------------------------------------------------
       AUTOPLAY STATE
    ----------------------------------------------------- */

  isAutoPlaying() {
    return FLAnimationState.autoPlay.active;
  },

  cancelAutoPlay() {
    FLKillScrollTween();
  },

  /* -----------------------------------------------------
       LIFECYCLE
    ----------------------------------------------------- */

  rebuild(options = {}) {
    FLRebuildAnimations(options);
  },

  refresh() {
    FLRefreshLayout();
  },

  /* -----------------------------------------------------
       DEBUG / STATE
    ----------------------------------------------------- */

  getState() {
    return FLAnimationState;
  },
};

/* =========================================================
   70 — RUN

   main.js loads before animations.js, so window.FLSite is
   already available when this initialises.
   ========================================================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", FLInitialiseAnimations, {
    once: true,
  });
} else {
  FLInitialiseAnimations();
}
