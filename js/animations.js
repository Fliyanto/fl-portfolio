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
const FLAnimationState = {
  ready: false,
  rebuilding: false,
  eventsInitialised: false,
  cursorInitialised: false,
  progressLoopStarted: false,
  currentScene: "welcome",
  viewportMode: null,
  reducedMotion: false,
  context: null,
  resizeTimer: null,
  refreshTimer: null,
  scrollTween: null,
  sceneAwareness: [],
  autoPlay: {
    active: false,
    scene: null,
    token: 0,
    timer: null,
    startedAt: 0,
  },
  welcome: {
    timeline: null,
    scrollTrigger: null,
    progress: 0,
    step: 0,
    reducedStep: 0,
    bridgeTimeline: null,
    sequenceActive: false,
  },
  about: {
    timeline: null,
    scrollTrigger: null,
    progress: 0,
    introPlayed: false,
    flightTimeline: null,
    flightComplete: false,
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
const FLWelcomeTiming = {
  introHold: 180,
  toSpecialisms: 1.05,
  specialismsHold: 1850,
  toStatement: 1.12,
  statementHold: 2800,
  toAbout: 1.02,
};
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
function FLIsContrastTheme() {
  return document.documentElement.dataset.theme === "contrast";
}
function FLCanUseSoftBlur() {
  return !FLIsReducedMotion() && !FLIsContrastTheme();
}
function FLIsMobile() {
  return window.innerWidth <= 720;
}
function FLIsTablet() {
  return window.innerWidth <= 960;
}
function FLIsDesktop() {
  return window.innerWidth > 960;
}
function FLIsFinePointer() {
  return Boolean(
    window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches,
  );
}
function FLClamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}
function FLGetViewportMode() {
  if (FLIsMobile()) {
    return "mobile";
  }
  if (FLIsTablet()) {
    return "tablet";
  }
  return "desktop";
}
function FLGetScene(sceneName) {
  if (!sceneName) {
    return null;
  }
  return document.querySelector(`[data-scene="${sceneName}"]`);
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
function FLSetWelcomeSequenceRunning(active) {
  const running = Boolean(active);
  FLAnimationState.welcome.sequenceActive = running;
  const scene = FLGetScene("welcome");
  if (scene) {
    scene.dataset.welcomeRunning = String(running);
  }
}
function FLCompleteWelcomeSequence() {
  window.clearTimeout(FLAnimationState.autoPlay.timer);
  FLAnimationState.autoPlay.timer = null;
  FLAnimationState.autoPlay.active = false;
  FLAnimationState.autoPlay.scene = null;
  FLAnimationState.autoPlay.startedAt = 0;
  FLSetWelcomeSequenceRunning(false);
}
function FLDelay(duration, callback, token = null) {
  window.clearTimeout(FLAnimationState.autoPlay.timer);
  FLAnimationState.autoPlay.timer = window.setTimeout(
    () => {
      FLAnimationState.autoPlay.timer = null;
      if (token !== null && token !== FLAnimationState.autoPlay.token) {
        return;
      }
      callback?.();
    },
    Math.max(0, Number(duration) || 0),
  );
}
function FLGetWelcomeElements() {
  const scene = FLGetScene("welcome");
  if (!scene) {
    return null;
  }
  return {
    scene,
    intro: scene.querySelector('[data-welcome-state="intro"]'),
    name: scene.querySelector("[data-welcome-name]"),
    explore: scene.querySelector(".welcome__explore"),
    specialisms: scene.querySelector('[data-welcome-state="specialisms"]'),
    ui: scene.querySelector(".welcome-specialism--ui"),
    interaction: scene.querySelector(".welcome-specialism--interaction"),
    frontend: scene.querySelector(".welcome-specialism--frontend"),
    bubbleWords: Array.from(scene.querySelectorAll("[data-bubble-word]")),
    statementContainer: scene.querySelector('[data-welcome-state="statement"]'),
    statement: scene.querySelector(".welcome__statement-text"),
    statementBefore: scene.querySelector(".welcome__statement-before"),
    alive: scene.querySelector(".welcome__statement-alive"),
    statementAfter: scene.querySelector(".welcome__statement-after"),
    progress: scene.querySelector(".scene-progress"),
    shapeOne: scene.querySelector("[data-shape='welcome-one']"),
    shapeTwo: scene.querySelector("[data-shape='welcome-two']"),
    shapeThree: scene.querySelector("[data-shape='welcome-three']"),
    shapeFour: scene.querySelector("[data-shape='welcome-four']"),
  };
}
function FLResetWelcomeBridgeVisuals() {
  if (!FLHasGSAP()) {
    return;
  }
  const elements = FLGetWelcomeElements();
  if (!elements) {
    return;
  }
  FLAnimationState.welcome.bridgeTimeline?.kill?.();
  FLAnimationState.welcome.bridgeTimeline = null;
  if (elements.statementContainer) {
    gsap.set(elements.statementContainer, {
      clearProps: "transform,opacity,visibility,filter",
    });
  }
  if (elements.progress) {
    gsap.set(elements.progress, {
      clearProps: "transform,opacity,visibility,filter",
    });
  }
}
function FLKillScrollTween() {
  if (!FLAnimationState.scrollTween) {
    return;
  }
  FLAnimationState.scrollTween.kill?.();
  FLAnimationState.scrollTween = null;
}
function FLStopAutoPlay(options = {}) {
  const { killScroll = true, resetBridge = true } = options;
  window.clearTimeout(FLAnimationState.autoPlay.timer);
  FLAnimationState.autoPlay.timer = null;
  FLAnimationState.autoPlay.token += 1;
  FLAnimationState.autoPlay.active = false;
  FLAnimationState.autoPlay.scene = null;
  FLAnimationState.autoPlay.startedAt = 0;
  FLSetWelcomeSequenceRunning(false);
  if (killScroll) {
    FLKillScrollTween();
  }
  if (resetBridge) {
    FLResetWelcomeBridgeVisuals();
  }
}
function FLScrollToY(targetY, options = {}) {
  const {
    duration = 0.85,
    ease = "power3.inOut",
    immediate = false,
    preserveAutoPlay = false,
    onComplete = null,
    onInterrupt = null,
  } = options;
  const safeTarget = Math.max(0, Number(targetY) || 0);
  FLKillScrollTween();
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
  const restore = () => {
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
      restore();
      FLAnimationState.scrollTween = null;
      if (!preserveAutoPlay) {
        FLAnimationState.autoPlay.active = false;
        FLAnimationState.autoPlay.scene = null;
      }
      FLHasScrollTrigger() && ScrollTrigger.update();
      onComplete?.();
    },
    onInterrupt() {
      restore();
      FLAnimationState.scrollTween = null;
      if (!preserveAutoPlay) {
        FLAnimationState.autoPlay.active = false;
        FLAnimationState.autoPlay.scene = null;
      }
      onInterrupt?.();
    },
  });
  FLAnimationState.scrollTween = tween;
  return tween;
}
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
function FLSetWelcomeStep(step) {
  const safeStep = Math.max(0, Math.min(2, Number(step) || 0));
  FLAnimationState.welcome.step = safeStep;
  document
    .querySelectorAll("[data-welcome-progress] > span")
    .forEach((item, index) => {
      item.classList.toggle("is-active", index === safeStep);
    });
  if (safeStep > 0) {
    FLHideCustomCursor();
  }
}
function FLUpdateWelcomeProgress(progress) {
  const safeProgress = FLClamp(progress);
  FLAnimationState.welcome.progress = safeProgress;
  const timeline = FLAnimationState.welcome.timeline;
  if (!timeline || !timeline.duration()) {
    return;
  }
  const duration = timeline.duration();
  const specialismProgress =
    timeline.labels.specialismsReady !== undefined
      ? timeline.labels.specialismsReady / duration
      : 0.32;
  const statementProgress =
    timeline.labels.statement !== undefined
      ? timeline.labels.statement / duration
      : 0.7;
  if (safeProgress >= statementProgress - 0.02) {
    FLSetWelcomeStep(2);
    return;
  }
  if (safeProgress >= specialismProgress - 0.02) {
    FLSetWelcomeStep(1);
    return;
  }
  FLSetWelcomeStep(0);
}
function FLPrepareWelcomeScene() {
  if (!FLHasGSAP()) {
    return;
  }
  const elements = FLGetWelcomeElements();
  if (!elements) {
    return;
  }
  FLResetWelcomeBridgeVisuals();
  const {
    name,
    explore,
    intro,
    specialisms,
    ui,
    interaction,
    frontend,
    statementContainer,
    statement,
    statementBefore,
    alive,
    statementAfter,
    progress,
    shapeOne,
    shapeTwo,
    shapeThree,
    shapeFour,
  } = elements;
  const targets = [
    name,
    explore,
    intro,
    specialisms,
    ui,
    interaction,
    frontend,
    statementContainer,
    statement,
    statementBefore,
    alive,
    statementAfter,
    progress,
    shapeOne,
    shapeTwo,
    shapeThree,
    shapeFour,
  ].filter(Boolean);
  gsap.killTweensOf(targets);
  gsap.set(targets, {
    clearProps: "transform,opacity,visibility,filter",
  });
}
function FLSetReducedWelcomeStep(step) {
  const elements = FLGetWelcomeElements();
  if (!elements || !FLHasGSAP()) {
    return false;
  }
  const safeStep = Math.max(0, Math.min(2, Number(step) || 0));
  FLAnimationState.welcome.reducedStep = safeStep;
  FLAnimationState.welcome.step = safeStep;
  FLAnimationState.welcome.progress =
    safeStep === 0 ? 0 : safeStep === 1 ? 0.5 : 0.9;
  gsap.set(elements.intro, {
    autoAlpha: safeStep === 0 ? 1 : 0,
    pointerEvents: safeStep === 0 ? "auto" : "none",
  });
  gsap.set(elements.specialisms, {
    autoAlpha: safeStep === 1 ? 1 : 0,
    pointerEvents: safeStep === 1 ? "auto" : "none",
  });
  gsap.set(elements.statementContainer, {
    autoAlpha: safeStep === 2 ? 1 : 0,
    pointerEvents: safeStep === 2 ? "auto" : "none",
  });
  gsap.set(
    [
      elements.ui,
      elements.interaction,
      elements.frontend,
      elements.statement,
      elements.alive,
    ].filter(Boolean),
    {
      x: 0,
      y: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      autoAlpha: 1,
      filter: "none",
    },
  );
  gsap.set(elements.progress, {
    autoAlpha: 1,
  });
  FLSetWelcomeStep(safeStep);
  return true;
}
function FLBuildReducedWelcome() {
  FLPrepareWelcomeScene();
  const elements = FLGetWelcomeElements();
  if (!elements || !FLHasGSAP()) {
    return;
  }
  FLAnimationState.welcome.timeline = null;
  FLAnimationState.welcome.scrollTrigger = null;
  FLSetReducedWelcomeStep(0);
}
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
    explore,
    specialisms,
    ui,
    interaction,
    frontend,
    statementContainer,
    statement,
    alive,
    progress,
    shapeOne,
    shapeTwo,
    shapeThree,
    shapeFour,
  } = elements;

  gsap.set(intro, {
    autoAlpha: 1,
    filter: "none",
    pointerEvents: "auto",
  });
  gsap.set([name, explore].filter(Boolean), {
    x: 0,
    y: 0,
    scale: 1,
    autoAlpha: 1,
    filter: "none",
  });

  gsap.set(specialisms, {
    autoAlpha: 1,
    pointerEvents: "none",
  });
  gsap.set(ui, {
    x: FLIsMobile() ? 8 : 14,
    y: -4,
    scale: 0.992,
    autoAlpha: 0,
    filter: "none",
  });
  gsap.set(interaction, {
    x: 0,
    y: FLIsMobile() ? 7 : 9,
    scale: 0.992,
    autoAlpha: 0,
    filter: "none",
  });
  gsap.set(frontend, {
    x: FLIsMobile() ? -8 : -14,
    y: 5,
    scale: 0.992,
    autoAlpha: 0,
    filter: "none",
  });

  gsap.set(statementContainer, {
    autoAlpha: 1,
    filter: "none",
    pointerEvents: "none",
  });
  gsap.set(statement, {
    y: FLIsMobile() ? 6 : 8,
    scale: 0.995,
    autoAlpha: 0,
    filter: "none",
  });
  gsap.set(alive, {
    scaleX: 0.98,
    scaleY: 0.97,
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
        const multiplier = FLIsMobile() ? 2.15 : FLIsTablet() ? 2.22 : 2.35;
        return `+=${window.innerHeight * multiplier}`;
      },
      pin: true,
      pinSpacing: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter() {
        FLSetSceneActive("welcome");
      },
      onEnterBack() {
        FLSetSceneActive("welcome");
        FLResetWelcomeBridgeVisuals();
      },
      onLeave() {
        FLHideCustomCursor();
      },
      onUpdate(self) {
        FLUpdateWelcomeProgress(self.progress);
      },
    },
  });

  timeline.addLabel("intro", 0);
  timeline.addLabel("landingOneToTwo", 0);

  timeline.to(
    name,
    {
      y: FLIsMobile() ? -3 : -4,
      scale: 0.998,
      autoAlpha: 0,
      duration: 0.96,
      ease: "sine.inOut",
    },
    "landingOneToTwo",
  );
  timeline.to(
    explore,
    {
      y: -2,
      autoAlpha: 0,
      duration: 0.86,
      ease: "sine.inOut",
    },
    "landingOneToTwo+=0.03",
  );
  timeline.to(
    intro,
    {
      autoAlpha: 0,
      pointerEvents: "none",
      duration: 1.02,
      ease: "sine.inOut",
    },
    "landingOneToTwo+=0.02",
  );

  timeline.to(
    ui,
    {
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: 0.96,
      ease: "sine.out",
    },
    "landingOneToTwo+=0.16",
  );
  timeline.to(
    interaction,
    {
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: 0.98,
      ease: "sine.out",
    },
    "landingOneToTwo+=0.22",
  );
  timeline.to(
    frontend,
    {
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: 0.96,
      ease: "sine.out",
    },
    "landingOneToTwo+=0.28",
  );
  timeline.set(
    specialisms,
    {
      pointerEvents: "auto",
    },
    "landingOneToTwo+=0.74",
  );
  timeline.addLabel("specialismsReady", "landingOneToTwo+=1.18");

  timeline.addLabel("landingTwoToThree", "specialismsReady+=0.08");

  timeline.to(
    ui,
    {
      x: FLIsMobile() ? 2 : 4,
      y: -3,
      scale: 0.997,
      autoAlpha: 0,
      duration: 1.08,
      ease: "sine.inOut",
    },
    "landingTwoToThree",
  );
  timeline.to(
    interaction,
    {
      y: FLIsMobile() ? 2 : 3,
      scale: 0.997,
      autoAlpha: 0,
      duration: 1.08,
      ease: "sine.inOut",
    },
    "landingTwoToThree+=0.02",
  );
  timeline.to(
    frontend,
    {
      x: FLIsMobile() ? -2 : -4,
      y: 2,
      scale: 0.997,
      autoAlpha: 0,
      duration: 1.08,
      ease: "sine.inOut",
    },
    "landingTwoToThree+=0.04",
  );
  timeline.set(
    specialisms,
    {
      pointerEvents: "none",
    },
    "landingTwoToThree+=0.08",
  );

  timeline.to(
    statement,
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: 1.12,
      ease: "sine.out",
    },
    "landingTwoToThree+=0.24",
  );
  timeline.set(
    statementContainer,
    {
      pointerEvents: "auto",
    },
    "landingTwoToThree+=0.66",
  );

  timeline.to(
    alive,
    {
      scaleX: 1.025,
      scaleY: 0.985,
      duration: 0.22,
      ease: "sine.out",
    },
    "landingTwoToThree+=0.94",
  );
  timeline.to(alive, {
    scaleX: 0.997,
    scaleY: 1.008,
    duration: 0.16,
    ease: "sine.inOut",
  });
  timeline.to(alive, {
    scaleX: 1,
    scaleY: 1,
    duration: 0.2,
    ease: "sine.out",
  });

  timeline.addLabel("statement", "landingTwoToThree+=1.36");
  timeline.addLabel("ready", "statement");

  const visualDuration = timeline.duration();
  timeline.fromTo(
    shapeOne,
    {
      xPercent: 2,
      yPercent: -2,
      rotation: 15,
    },
    {
      xPercent: -3,
      yPercent: 3,
      rotation: 20,
      duration: visualDuration,
      ease: "sine.inOut",
    },
    0,
  );
  timeline.fromTo(
    shapeTwo,
    {
      xPercent: -2,
      yPercent: 2,
      scale: 0.985,
    },
    {
      xPercent: 3,
      yPercent: -2,
      scale: 1.018,
      duration: visualDuration,
      ease: "sine.inOut",
    },
    0,
  );
  timeline.fromTo(
    shapeThree,
    {
      xPercent: -2,
      yPercent: 2,
      rotation: -2,
    },
    {
      xPercent: 3,
      yPercent: -2,
      rotation: 2,
      duration: visualDuration,
      ease: "sine.inOut",
    },
    0,
  );
  timeline.fromTo(
    shapeFour,
    {
      xPercent: 2,
      yPercent: 2,
      rotation: 18,
    },
    {
      xPercent: -3,
      yPercent: -2,
      rotation: 22,
      duration: visualDuration,
      ease: "sine.inOut",
    },
    0,
  );

  FLAnimationState.welcome.timeline = timeline;
  FLAnimationState.welcome.scrollTrigger = timeline.scrollTrigger;
  FLAnimationState.welcome.progress = 0;
  FLSetWelcomeStep(0);
}
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
  const {
    duration = 0.76,
    ease = "sine.inOut",
    preserveAutoPlay = false,
    onComplete = null,
  } = options;
  FLScrollToY(targetY, {
    duration,
    ease,
    preserveAutoPlay,
    onComplete() {
      FLSetSceneActive("welcome");
      FLUpdateWelcomeProgress(progress);
      onComplete?.();
    },
  });
  return true;
}
function FLTransitionWelcomeToAbout(options = {}) {
  const {
    duration = FLWelcomeTiming.toAbout,
    preserveAutoPlay = false,
    onComplete = null,
  } = options;
  const finish = () => {
    if (FLAnimationState.welcome.sequenceActive) {
      FLCompleteWelcomeSequence();
    } else if (!preserveAutoPlay) {
      FLAnimationState.autoPlay.active = false;
      FLAnimationState.autoPlay.scene = null;
    }
    onComplete?.();
  };
  if (FLIsReducedMotion() || !FLHasGSAP()) {
    if (typeof FLSetAboutReadyState === "function") {
      FLSetAboutReadyState();
    }
    return FLScrollToScene("about", {
      duration: 0,
      immediate: true,
      preserveAutoPlay,
      onComplete: finish,
    });
  }
  if (FLAnimationState.welcome.bridgeTimeline?.isActive?.()) {
    return true;
  }
  const elements = FLGetWelcomeElements();
  if (!elements) {
    return FLScrollToScene("about", {
      duration,
      preserveAutoPlay,
      onComplete: finish,
    });
  }
  const {
    statementContainer,
    progress,
    shapeOne,
    shapeTwo,
    shapeThree,
    shapeFour,
  } = elements;
  const exitFilter = FLCanUseSoftBlur() ? "blur(2px)" : "none";
  const bridge = gsap.timeline({
    onComplete() {
      FLAnimationState.welcome.bridgeTimeline = null;
    },
  });
  FLAnimationState.welcome.bridgeTimeline = bridge;
  bridge.to(
    statementContainer,
    {
      y: FLIsMobile() ? -10 : -15,
      scale: 0.99,
      autoAlpha: 0,
      filter: exitFilter,
      duration: 0.68,
      ease: "power3.inOut",
    },
    0,
  );
  bridge.to(
    progress,
    {
      y: 5,
      autoAlpha: 0,
      duration: 0.42,
      ease: "power2.inOut",
    },
    0.02,
  );
  bridge.to(
    [shapeOne, shapeTwo, shapeThree, shapeFour].filter(Boolean),
    {
      yPercent: -2,
      autoAlpha: 0.5,
      duration: 0.76,
      stagger: 0.02,
      ease: "sine.inOut",
    },
    0,
  );
  const moved = FLScrollToScene("about", {
    duration,
    preserveAutoPlay: true,
    onComplete() {
      if (statementContainer) {
        gsap.set(statementContainer, {
          clearProps: "transform,opacity,visibility,filter",
        });
      }
      if (progress) {
        gsap.set(progress, {
          clearProps: "transform,opacity,visibility,filter",
        });
      }
      FLAnimationState.welcome.bridgeTimeline?.kill?.();
      FLAnimationState.welcome.bridgeTimeline = null;
      finish();
    },
  });
  bridge.call(
    () => {
      if (typeof FLPlayAboutEntranceFromBridge === "function") {
        FLPlayAboutEntranceFromBridge();
      }
    },
    null,
    Math.min(0.42, duration * 0.45),
  );
  return moved;
}
function FLPlayReducedWelcomeSequence() {
  if (FLAnimationState.welcome.sequenceActive) {
    return true;
  }
  FLStopAutoPlay({
    killScroll: false,
  });
  const token = FLAnimationState.autoPlay.token;
  FLAnimationState.autoPlay.active = true;
  FLAnimationState.autoPlay.scene = "welcome";
  FLAnimationState.autoPlay.startedAt = performance.now();
  FLSetWelcomeSequenceRunning(true);
  const startStep = FLAnimationState.welcome.reducedStep;
  const goToAbout = () => {
    if (token !== FLAnimationState.autoPlay.token) {
      return;
    }
    FLTransitionWelcomeToAbout({
      duration: 0,
      preserveAutoPlay: true,
    });
  };
  const showStatement = () => {
    if (token !== FLAnimationState.autoPlay.token) {
      return;
    }
    FLSetReducedWelcomeStep(2);
    FLDelay(FLWelcomeTiming.statementHold, goToAbout, token);
  };
  const showSpecialisms = () => {
    if (token !== FLAnimationState.autoPlay.token) {
      return;
    }
    FLSetReducedWelcomeStep(1);
    FLDelay(FLWelcomeTiming.specialismsHold, showStatement, token);
  };
  if (startStep <= 0) {
    FLSetReducedWelcomeStep(0);
    FLDelay(FLWelcomeTiming.introHold, showSpecialisms, token);
  } else if (startStep === 1) {
    FLDelay(220, showStatement, token);
  } else {
    FLDelay(320, goToAbout, token);
  }
  return true;
}
function FLPlayWelcomeSequence() {
  if (FLAnimationState.welcome.sequenceActive) {
    return true;
  }
  if (FLIsReducedMotion()) {
    return FLPlayReducedWelcomeSequence();
  }
  if (!FLAnimationState.welcome.scrollTrigger) {
    return false;
  }
  FLStopAutoPlay();
  const token = FLAnimationState.autoPlay.token;
  FLAnimationState.autoPlay.active = true;
  FLAnimationState.autoPlay.scene = "welcome";
  FLAnimationState.autoPlay.startedAt = performance.now();
  FLSetWelcomeSequenceRunning(true);
  const currentStep = FLAnimationState.welcome.step;
  const goToAbout = () => {
    if (token !== FLAnimationState.autoPlay.token) {
      return;
    }
    FLTransitionWelcomeToAbout({
      duration: FLWelcomeTiming.toAbout,
      preserveAutoPlay: true,
    });
  };
  const showStatement = () => {
    if (token !== FLAnimationState.autoPlay.token) {
      return;
    }
    FLScrollWelcomeToLabel("statement", {
      duration: FLWelcomeTiming.toStatement,
      ease: "sine.inOut",
      preserveAutoPlay: true,
      onComplete() {
        if (token !== FLAnimationState.autoPlay.token) {
          return;
        }
        FLDelay(FLWelcomeTiming.statementHold, goToAbout, token);
      },
    });
  };
  const showSpecialisms = () => {
    if (token !== FLAnimationState.autoPlay.token) {
      return;
    }
    FLScrollWelcomeToLabel("specialismsReady", {
      duration: FLWelcomeTiming.toSpecialisms,
      ease: "sine.inOut",
      preserveAutoPlay: true,
      onComplete() {
        if (token !== FLAnimationState.autoPlay.token) {
          return;
        }
        FLDelay(FLWelcomeTiming.specialismsHold, showStatement, token);
      },
    });
  };
  if (currentStep <= 0) {
    FLScrollWelcomeToLabel("intro", {
      duration: 0.16,
      ease: "sine.inOut",
      preserveAutoPlay: true,
      onComplete() {
        if (token !== FLAnimationState.autoPlay.token) {
          return;
        }
        FLDelay(FLWelcomeTiming.introHold, showSpecialisms, token);
      },
    });
  } else if (currentStep === 1) {
    FLDelay(220, showStatement, token);
  } else {
    FLDelay(320, goToAbout, token);
  }
  return true;
}
function FLAdvanceWelcome() {
  if (FLAnimationState.welcome.sequenceActive) {
    return true;
  }
  if (FLAnimationState.scrollTween) {
    return false;
  }
  if (FLAnimationState.welcome.bridgeTimeline?.isActive?.()) {
    return false;
  }
  return FLPlayWelcomeSequence();
}
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
function FLScrollToScene(sceneName, options = {}) {
  const {
    landing = sceneName === "welcome" ? "intro" : "ready",
    immediate = false,
    duration = 0.9,
    preserveAutoPlay = false,
    onComplete = null,
  } = options;
  const targetY = FLGetSceneLandingY(sceneName, landing);
  if (targetY === null) {
    return false;
  }
  FLScrollToY(targetY, {
    duration,
    immediate,
    preserveAutoPlay,
    ease: "power3.inOut",
    onComplete() {
      FLSetSceneActive(sceneName);
      onComplete?.();
    },
  });
  return true;
}
function FLGoToScene(sceneName, options = {}) {
  const scene = FLGetScene(sceneName);
  if (!scene) {
    return false;
  }
  const {
    landing = sceneName === "welcome" ? "intro" : "ready",
    immediate = false,
    duration = 0.9,
    preserveAutoPlay = false,
    skipWelcomeTransition = false,
    skipAboutTransition = false,
    onComplete = null,
  } = options;
  if (
    FLAnimationState.autoPlay.active &&
    (sceneName !== "welcome" || landing === "intro")
  ) {
    FLStopAutoPlay({
      killScroll: true,
      resetBridge: sceneName !== "about",
    });
  }
  if (
    sceneName === "about" &&
    FLAnimationState.currentScene === "welcome" &&
    !skipWelcomeTransition &&
    !immediate
  ) {
    return FLTransitionWelcomeToAbout({
      duration,
      preserveAutoPlay,
      onComplete,
    });
  }
  if (
    sceneName === "services" &&
    FLAnimationState.currentScene === "about" &&
    !skipAboutTransition &&
    !immediate &&
    !FLIsReducedMotion() &&
    typeof FLTransitionAboutToServices === "function"
  ) {
    return FLTransitionAboutToServices({
      duration,
      onComplete,
    });
  }
  return FLScrollToScene(sceneName, {
    landing,
    immediate,
    duration,
    preserveAutoPlay,
    onComplete,
  });
}
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
function FLCancelAutoPlayFromUserInput() {
  if (!FLAnimationState.autoPlay.active) {
    return;
  }
  FLStopAutoPlay();
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
function FLInitialiseWelcomeContinue() {
  const button = document.querySelector("[data-welcome-continue]");
  if (!button || button.dataset.flWelcomeReady === "true") {
    return;
  }
  button.dataset.flWelcomeReady = "true";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    FLAdvanceWelcome();
  });
}
function FLGetAboutElements() {
  const scene = FLGetScene("about");
  if (!scene) {
    return null;
  }
  const paragraphs = Array.from(scene.querySelectorAll(".about__story p"));
  const travelStory = scene.querySelector("[data-travel-story]");
  const origin = scene.querySelector("[data-travel-origin]");
  const destination = scene.querySelector("[data-travel-destination]");
  return {
    scene,
    indicator: scene.querySelector(".scene-indicator"),
    eyebrow: scene.querySelector(".about__eyebrow"),
    title: scene.querySelector(".about__title"),
    paragraphs,
    travelStory,
    origin,
    destination,
    originDot: origin?.querySelector(".travel-location__dot") || null,
    destinationDot: destination?.querySelector(".travel-location__dot") || null,
    plane: scene.querySelector("[data-travel-plane]"),
    path: scene.querySelector("[data-travel-path]"),
    next:
      scene.querySelector(".scene-next[data-scene-target='services']") ||
      scene.querySelector(".scene-next"),
    shapeOne: scene.querySelector("[data-shape='about-one']"),
    shapeTwo: scene.querySelector("[data-shape='about-two']"),
    shapeThree: scene.querySelector("[data-shape='about-three']"),
  };
}
function FLPrepareAboutScene() {
  const elements = FLGetAboutElements();
  if (!elements || !FLHasGSAP()) {
    return;
  }
  const {
    indicator,
    eyebrow,
    title,
    paragraphs,
    travelStory,
    origin,
    destination,
    originDot,
    destinationDot,
    plane,
    path,
    next,
    shapeOne,
    shapeTwo,
    shapeThree,
  } = elements;
  const targets = [
    indicator,
    eyebrow,
    title,
    ...paragraphs,
    travelStory,
    origin,
    destination,
    originDot,
    destinationDot,
    plane,
    next,
    shapeOne,
    shapeTwo,
    shapeThree,
  ].filter(Boolean);
  gsap.killTweensOf(targets);
  gsap.set(targets, {
    clearProps: "transform,opacity,visibility,filter",
  });
  if (path) {
    gsap.killTweensOf(path);
    gsap.set(path, {
      clearProps: "strokeDasharray,strokeDashoffset",
    });
  }
  FLAnimationState.about.flightTimeline?.kill?.();
  FLAnimationState.about.flightTimeline = null;
  FLAnimationState.about.flightComplete = false;
  FLAnimationState.about.introPlayed = false;
}
function FLPlaceAboutPlaneAtStart(elements = FLGetAboutElements()) {
  if (!elements || !FLHasGSAP()) {
    return false;
  }
  const { plane, path } = elements;
  if (!plane) {
    return false;
  }
  gsap.killTweensOf(plane);
  if (path && FLHasMotionPath()) {
    gsap.set(plane, {
      motionPath: {
        path,
        align: path,
        alignOrigin: [0.5, 0.5],
        autoRotate: true,
        start: 0,
        end: 0,
      },
      scale: 1,
      autoAlpha: 1,
    });
    return true;
  }
  gsap.set(plane, {
    x: 0,
    y: 0,
    rotation: 20,
    scale: 1,
    autoAlpha: 1,
  });
  return true;
}
function FLSetAboutReadyState() {
  const elements = FLGetAboutElements();
  if (!elements || !FLHasGSAP()) {
    return false;
  }
  const {
    indicator,
    eyebrow,
    title,
    paragraphs,
    travelStory,
    origin,
    destination,
    originDot,
    destinationDot,
    path,
    next,
    shapeOne,
    shapeTwo,
    shapeThree,
  } = elements;
  FLAnimationState.about.timeline?.pause?.();
  gsap.set(
    [
      indicator,
      eyebrow,
      title,
      ...paragraphs,
      travelStory,
      origin,
      destination,
      originDot,
      destinationDot,
      next,
      shapeOne,
      shapeTwo,
      shapeThree,
    ].filter(Boolean),
    {
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      autoAlpha: 1,
      filter: "none",
    },
  );
  if (path) {
    gsap.set(path, {
      strokeDasharray: "none",
      strokeDashoffset: 0,
      autoAlpha: 1,
    });
  }
  FLPlaceAboutPlaneAtStart(elements);
  FLAnimationState.about.progress = 1;
  FLAnimationState.about.introPlayed = true;
  FLAnimationState.about.flightComplete = false;
  return true;
}
function FLBuildReducedAbout() {
  FLPrepareAboutScene();
  FLSetAboutReadyState();
  FLAnimationState.about.timeline = null;
  FLAnimationState.about.scrollTrigger = null;
  FLAnimationState.about.progress = 1;
}
function FLPrepareAboutEntranceState(elements) {
  if (!elements || !FLHasGSAP()) {
    return;
  }
  const {
    indicator,
    eyebrow,
    title,
    paragraphs,
    travelStory,
    origin,
    destination,
    originDot,
    destinationDot,
    plane,
    path,
    next,
    shapeOne,
    shapeTwo,
    shapeThree,
  } = elements;
  const enterBlur = FLCanUseSoftBlur() ? "blur(2px)" : "none";
  if (path) {
    gsap.set(path, {
      strokeDasharray: "none",
      strokeDashoffset: 0,
      autoAlpha: 1,
    });
  }
  FLPlaceAboutPlaneAtStart(elements);
  gsap.set(indicator, {
    x: -10,
    autoAlpha: 0,
  });
  gsap.set(eyebrow, {
    y: 9,
    autoAlpha: 0,
  });
  gsap.set(title, {
    y: FLIsMobile() ? 16 : 22,
    scale: 0.992,
    autoAlpha: 0,
    filter: enterBlur,
  });
  gsap.set(paragraphs, {
    y: FLIsMobile() ? 10 : 14,
    autoAlpha: 0,
    filter: enterBlur,
  });
  gsap.set(travelStory, {
    x: FLIsMobile() ? 0 : 20,
    y: FLIsMobile() ? 12 : 0,
    scale: 0.992,
    autoAlpha: 0,
    filter: enterBlur,
  });
  gsap.set(origin, {
    x: -8,
    autoAlpha: 0,
  });
  gsap.set(destination, {
    x: 8,
    autoAlpha: 0,
  });
  gsap.set([originDot, destinationDot].filter(Boolean), {
    scale: 0.82,
  });
  gsap.set(plane, {
    autoAlpha: 0,
  });
  gsap.set(next, {
    y: 8,
    autoAlpha: 0,
  });
  gsap.set(shapeOne, {
    xPercent: 4,
    yPercent: -3,
    autoAlpha: 0,
  });
  gsap.set(shapeTwo, {
    xPercent: -4,
    yPercent: 3,
    autoAlpha: 0,
  });
  gsap.set(shapeThree, {
    yPercent: 4,
    autoAlpha: 0,
  });
}
function FLCreateAboutEntranceTimeline(elements) {
  if (!elements || !FLHasGSAP()) {
    return null;
  }
  const {
    indicator,
    eyebrow,
    title,
    paragraphs,
    travelStory,
    origin,
    destination,
    originDot,
    destinationDot,
    plane,
    next,
    shapeOne,
    shapeTwo,
    shapeThree,
  } = elements;
  const timeline = gsap.timeline({
    paused: true,
    defaults: {
      ease: "power3.out",
    },
    onStart() {
      FLAnimationState.about.introPlayed = true;
    },
    onComplete() {
      FLAnimationState.about.progress = 1;
    },
  });
  timeline.to(
    indicator,
    {
      x: 0,
      autoAlpha: 1,
      duration: 0.38,
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
    0.03,
  );
  timeline.to(
    title,
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,
      filter: "none",
      duration: FLIsMobile() ? 0.6 : 0.68,
      ease: "power3.out",
    },
    0.06,
  );
  timeline.to(
    paragraphs,
    {
      y: 0,
      autoAlpha: 1,
      filter: "none",
      duration: 0.52,
      stagger: FLIsMobile() ? 0.055 : 0.07,
      ease: "power2.out",
    },
    0.22,
  );
  timeline.to(
    travelStory,
    {
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,
      filter: "none",
      duration: FLIsMobile() ? 0.6 : 0.68,
      ease: "power3.out",
    },
    0.2,
  );
  timeline.to(
    [origin, destination].filter(Boolean),
    {
      x: 0,
      autoAlpha: 1,
      duration: 0.42,
      stagger: 0.06,
      ease: "power2.out",
    },
    0.38,
  );
  timeline.to(
    [originDot, destinationDot].filter(Boolean),
    {
      scale: 1,
      duration: 0.3,
      stagger: 0.05,
      ease: "back.out(1.35)",
    },
    0.44,
  );
  timeline.to(
    plane,
    {
      autoAlpha: 1,
      duration: 0.34,
      ease: "power2.out",
    },
    0.47,
  );
  timeline.to(
    next,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.38,
      ease: "power2.out",
    },
    0.58,
  );
  timeline.to(
    shapeOne,
    {
      xPercent: 0,
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.82,
      ease: "sine.out",
    },
    0.05,
  );
  timeline.to(
    shapeTwo,
    {
      xPercent: 0,
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.82,
      ease: "sine.out",
    },
    0.07,
  );
  timeline.to(
    shapeThree,
    {
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.82,
      ease: "sine.out",
    },
    0.09,
  );
  return timeline;
}
function FLPlayAboutEntranceFromBridge() {
  if (FLIsReducedMotion()) {
    return FLSetAboutReadyState();
  }
  const timeline = FLAnimationState.about.timeline;
  if (!timeline) {
    return false;
  }
  if (FLAnimationState.about.introPlayed) {
    return true;
  }
  FLAnimationState.about.introPlayed = true;
  timeline.play(0);
  return true;
}
function FLBuildAboutScene() {
  const elements = FLGetAboutElements();
  if (!elements || !FLHasGSAP()) {
    return;
  }
  if (FLIsReducedMotion() || !FLHasScrollTrigger()) {
    FLBuildReducedAbout();
    return;
  }
  FLPrepareAboutScene();
  FLPrepareAboutEntranceState(elements);
  const timeline = FLCreateAboutEntranceTimeline(elements);
  const trigger = ScrollTrigger.create({
    trigger: elements.scene,
    start: "top 76%",
    once: true,
    onEnter() {
      FLSetSceneActive("about");
      FLPlayAboutEntranceFromBridge();
    },
  });
  FLAnimationState.about.timeline = timeline;
  FLAnimationState.about.scrollTrigger = trigger;
  FLAnimationState.about.progress = 0;
  FLAnimationState.about.introPlayed = false;
}
function FLReactToMelbourne(elements, timeline, position) {
  if (!elements || !timeline) {
    return;
  }
  const { destination, destinationDot } = elements;
  timeline.to(
    destination,
    {
      x: -3,
      autoAlpha: 1,
      duration: 0.22,
      ease: "power2.out",
    },
    position,
  );
  timeline.to(
    destinationDot,
    {
      scale: 1.34,
      duration: 0.22,
      ease: "back.out(1.7)",
    },
    position,
  );
  timeline.to(destinationDot, {
    scale: 1,
    duration: 0.28,
    ease: "power2.out",
  });
  timeline.to(
    destination,
    {
      x: 0,
      duration: 0.25,
      ease: "power2.out",
    },
    "<",
  );
}
function FLTransitionAboutToServices(options = {}) {
  const elements = FLGetAboutElements();
  if (!elements) {
    return FLScrollToScene("services", {
      duration: options.duration ?? 0.85,
      onComplete: options.onComplete,
    });
  }
  if (FLIsReducedMotion() || !FLHasGSAP()) {
    FLAnimationState.about.flightComplete = true;
    return FLScrollToScene("services", {
      duration: 0,
      immediate: true,
      onComplete: options.onComplete,
    });
  }
  if (FLAnimationState.about.flightTimeline?.isActive?.()) {
    return true;
  }
  const {
    plane,
    path,
    origin,
    originDot,
    destination,
    destinationDot,
    travelStory,
    next,
  } = elements;
  if (!FLAnimationState.about.introPlayed) {
    FLSetAboutReadyState();
  }
  FLPlaceAboutPlaneAtStart(elements);
  FLAnimationState.about.flightComplete = false;
  const flightDuration = FLIsMobile() ? 1.05 : FLIsTablet() ? 1.15 : 1.25;
  const arrivalPosition = FLIsMobile() ? 1.05 : 1.22;
  const timeline = gsap.timeline({
    defaults: {
      ease: "power2.inOut",
    },
    onComplete() {
      FLAnimationState.about.flightTimeline = null;
      FLAnimationState.about.flightComplete = true;
      FLScrollToScene("services", {
        duration: options.duration ?? 0.82,
        onComplete: options.onComplete,
      });
    },
  });
  FLAnimationState.about.flightTimeline = timeline;
  timeline.to(
    next,
    {
      scale: 0.975,
      duration: 0.11,
      ease: "power2.in",
    },
    0,
  );
  timeline.to(next, {
    scale: 1,
    duration: 0.18,
    ease: "power2.out",
  });
  timeline.to(
    origin,
    {
      autoAlpha: 0.58,
      duration: 0.34,
    },
    0.08,
  );
  timeline.to(
    originDot,
    {
      scale: 0.82,
      duration: 0.3,
      ease: "power2.out",
    },
    0.08,
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
          start: 0,
          end: 1,
        },
        scale: 1.04,
        duration: flightDuration,
        ease: "power1.inOut",
      },
      0.16,
    );
  } else if (plane) {
    const fallbackX = FLIsMobile()
      ? Math.max(80, travelStory?.clientWidth * 0.18 || 100)
      : Math.max(150, travelStory?.clientWidth * 0.4 || 180);
    timeline.to(
      plane,
      {
        x: fallbackX,
        y: FLIsMobile() ? 110 : -10,
        rotation: FLIsMobile() ? 88 : 18,
        scale: 1.04,
        duration: flightDuration,
        ease: "power1.inOut",
      },
      0.16,
    );
  }
  timeline.to(
    travelStory,
    {
      scale: 1.006,
      duration: 0.42,
      ease: "sine.out",
    },
    0.28,
  );
  timeline.to(travelStory, {
    scale: 1,
    duration: 0.42,
    ease: "sine.inOut",
  });
  FLReactToMelbourne(
    {
      destination,
      destinationDot,
    },
    timeline,
    arrivalPosition,
  );
  timeline.to(
    plane,
    {
      scale: 0.92,
      duration: 0.23,
      ease: "power2.out",
    },
    arrivalPosition + 0.18,
  );
  return true;
}
function FLGetAboutStoryState() {
  if (FLAnimationState.about.flightTimeline?.isActive?.()) {
    return "journey";
  }
  if (FLAnimationState.about.flightComplete) {
    return "melbourne";
  }
  if (FLAnimationState.about.introPlayed) {
    return "ready";
  }
  return "entering";
}
function FLGetAboutLabelProgress(label) {
  const map = {
    aboutIntro: 0,
    intro: 0,
    ready: 0,
    travel: 0,
    flight: 0.5,
    melbourne: 0.82,
    whatIDoBridge: 1,
    bridge: 1,
  };
  if (Object.prototype.hasOwnProperty.call(map, label)) {
    return map[label];
  }
  return null;
}
function FLScrollAboutToLabel(label, options = {}) {
  if (["flight", "melbourne", "whatIDoBridge", "bridge"].includes(label)) {
    return FLTransitionAboutToServices({
      duration: options.duration ?? 0.85,
      onComplete: options.onComplete,
    });
  }
  return FLGoToScene("about", {
    duration: options.duration ?? 0.75,
    skipWelcomeTransition: true,
    onComplete: options.onComplete,
  });
}
function FLGetServicesElements() {
  const scene = FLGetScene("services");
  if (!scene) {
    return null;
  }
  return {
    scene,
    indicator: scene.querySelector(".scene-indicator"),
    eyebrow: scene.querySelector(".services__eyebrow"),
    title: scene.querySelector(".services__title"),
    instruction: scene.querySelector(".services__instruction"),
    disciplines: Array.from(scene.querySelectorAll(".discipline")),
    desktopNext: scene.querySelector(".scene-next--projects-desktop"),
    mobileNext: scene.querySelector(".scene-next--projects-mobile"),
    nextButtons: Array.from(
      scene.querySelectorAll(".scene-next[data-scene-target='projects']"),
    ),
    shapeOne: scene.querySelector("[data-shape='services-one']"),
    shapeTwo: scene.querySelector("[data-shape='services-two']"),
  };
}
function FLPrepareServicesScene() {
  const elements = FLGetServicesElements();
  if (!elements || !FLHasGSAP()) {
    return;
  }
  const targets = [
    elements.indicator,
    elements.eyebrow,
    elements.title,
    elements.instruction,
    ...elements.disciplines,
    ...elements.nextButtons,
    elements.shapeOne,
    elements.shapeTwo,
  ].filter(Boolean);
  gsap.killTweensOf(targets);
  gsap.set(targets, {
    clearProps: "transform,opacity,visibility,filter",
  });
}
function FLBuildReducedServices() {
  FLPrepareServicesScene();
  const elements = FLGetServicesElements();
  if (!elements || !FLHasGSAP()) {
    return;
  }
  gsap.set(
    [
      elements.indicator,
      elements.eyebrow,
      elements.title,
      elements.instruction,
      ...elements.disciplines,
      ...elements.nextButtons,
      elements.shapeOne,
      elements.shapeTwo,
    ].filter(Boolean),
    {
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      autoAlpha: 1,
      filter: "none",
    },
  );
  FLAnimationState.services.timeline = null;
  FLAnimationState.services.scrollTrigger = null;
}
function FLBuildServicesScene() {
  const elements = FLGetServicesElements();
  if (!elements || !FLHasGSAP()) {
    return;
  }
  if (FLIsReducedMotion() || !FLHasScrollTrigger()) {
    FLBuildReducedServices();
    return;
  }
  FLPrepareServicesScene();
  const {
    scene,
    indicator,
    eyebrow,
    title,
    instruction,
    disciplines,
    nextButtons,
    shapeOne,
    shapeTwo,
  } = elements;
  const enterBlur = FLCanUseSoftBlur() ? "blur(2px)" : "none";
  gsap.set(indicator, {
    x: -10,
    autoAlpha: 0,
  });
  gsap.set(eyebrow, {
    y: 9,
    autoAlpha: 0,
  });
  gsap.set(title, {
    y: FLIsMobile() ? 15 : 20,
    autoAlpha: 0,
    filter: enterBlur,
  });
  gsap.set(instruction, {
    y: 8,
    autoAlpha: 0,
  });
  gsap.set(disciplines, {
    y: FLIsMobile() ? 14 : 20,
    scale: FLIsMobile() ? 0.996 : 0.992,
    autoAlpha: 0,
  });
  gsap.set(nextButtons, {
    y: 8,
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
    0.04,
  );
  timeline.to(
    title,
    {
      y: 0,
      autoAlpha: 1,
      filter: "none",
      duration: FLIsMobile() ? 0.56 : 0.64,
      ease: "power3.out",
    },
    0.08,
  );
  timeline.to(
    instruction,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.4,
      ease: "power2.out",
    },
    0.23,
  );
  timeline.to(
    disciplines,
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: FLIsMobile() ? 0.5 : 0.55,
      stagger: FLIsMobile() ? 0.065 : 0.075,
      ease: "power3.out",
    },
    0.3,
  );
  timeline.to(
    nextButtons,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.4,
      stagger: 0.035,
      ease: "power2.out",
    },
    0.4,
  );
  timeline.fromTo(
    shapeOne,
    {
      xPercent: -6,
      yPercent: -5,
      autoAlpha: 0.45,
    },
    {
      xPercent: 0,
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.84,
      ease: "sine.out",
    },
    0.06,
  );
  timeline.fromTo(
    shapeTwo,
    {
      xPercent: 7,
      yPercent: 5,
      autoAlpha: 0.45,
    },
    {
      xPercent: 0,
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.84,
      ease: "sine.out",
    },
    0.08,
  );

  const trigger = ScrollTrigger.create({
    trigger: scene,
    start: FLIsMobile() ? "top 80%" : "top 72%",
    once: true,
    onEnter() {
      FLSetSceneActive("services");
      timeline.play();
    },
  });

  FLAnimationState.services.timeline = timeline;
  FLAnimationState.services.scrollTrigger = trigger;
}
function FLInitialiseDisciplineHover() {
  if (!FLHasGSAP() || !FLIsFinePointer()) {
    return;
  }
  document.querySelectorAll(".discipline").forEach((discipline) => {
    if (discipline.dataset.flHoverReady === "true") {
      return;
    }
    discipline.dataset.flHoverReady = "true";
    const trigger = discipline.querySelector(".discipline__trigger");
    const symbol = discipline.querySelector(".discipline__symbol");
    if (!trigger) {
      return;
    }
    trigger.addEventListener("mouseenter", () => {
      if (FLIsReducedMotion()) {
        return;
      }
      gsap.to(symbol, {
        scale: 1.055,
        rotation: 6,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
    trigger.addEventListener("mouseleave", () => {
      gsap.to(symbol, {
        scale: 1,
        rotation: 0,
        duration: 0.26,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  });
}
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
  const skills = Array.from(
    modal.querySelectorAll(".discipline-modal__skills li"),
  );
  const description = modal.querySelector(".discipline-modal__description");
  const details = Array.from(
    modal.querySelectorAll(".discipline-modal__detail"),
  );
  const close = modal.querySelector(".discipline-modal__close");
  const targets = [
    surface,
    number,
    title,
    ...skills,
    description,
    ...details,
    close,
  ].filter(Boolean);

  gsap.killTweensOf(targets);
  FLAnimationState.modals.discipline?.kill?.();

  const mobile = FLIsMobile();
  const timeline = gsap.timeline();

  timeline.fromTo(
    surface,
    mobile
      ? {
          yPercent: 4,
          autoAlpha: 0,
        }
      : {
          y: 16,
          scale: 0.986,
          autoAlpha: 0,
        },
    mobile
      ? {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.38,
          ease: "power3.out",
        }
      : {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.4,
          ease: "power3.out",
        },
    0,
  );
  timeline.fromTo(
    number,
    {
      x: mobile ? 0 : -10,
      y: mobile ? 8 : 0,
      autoAlpha: 0,
    },
    {
      x: 0,
      y: 0,
      autoAlpha: 1,
      duration: 0.3,
      ease: "power2.out",
    },
    0.04,
  );
  timeline.fromTo(
    title,
    {
      y: mobile ? 14 : 10,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.38,
      ease: "power3.out",
    },
    0.07,
  );
  timeline.fromTo(
    skills,
    {
      y: 5,
      scale: 0.975,
      autoAlpha: 0,
    },
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: 0.26,
      stagger: 0.035,
      ease: "power2.out",
    },
    0.14,
  );
  timeline.fromTo(
    description,
    {
      y: 8,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.34,
      ease: "power2.out",
    },
    0.19,
  );
  timeline.fromTo(
    details,
    {
      y: 7,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.34,
      stagger: 0.05,
      ease: "power2.out",
    },
    0.24,
  );
  timeline.fromTo(
    close,
    {
      scale: 0.84,
      autoAlpha: 0,
    },
    {
      scale: 1,
      autoAlpha: 1,
      duration: 0.25,
      ease: "back.out(1.4)",
    },
    0.09,
  );

  FLAnimationState.modals.discipline = timeline;
}
function FLHandleDisciplineModalChange(event) {
  const disciplineId = event.detail?.discipline || event.detail?.disciplineId;
  const open = Boolean(event.detail?.open);
  if (!disciplineId || !open) {
    return;
  }
  FLAnimateDisciplineModalOpen(disciplineId);
}
function FLGetProjectElements() {
  const scene = FLGetScene("projects");
  if (!scene) {
    return null;
  }
  return {
    scene,
    indicator: scene.querySelector(".scene-indicator"),
    eyebrow: scene.querySelector(".projects__eyebrow"),
    title: scene.querySelector(".projects__title"),
    projects: Array.from(scene.querySelectorAll(".selected-project")),
    hint: scene.querySelector(".projects__interaction-hint"),
    next: scene.querySelector(".scene-next--contact"),
    shapeOne: scene.querySelector("[data-shape='projects-one']"),
    shapeTwo: scene.querySelector("[data-shape='projects-two']"),
  };
}
function FLPrepareProjectsScene() {
  const elements = FLGetProjectElements();
  if (!elements || !FLHasGSAP()) {
    return;
  }
  const targets = [
    elements.indicator,
    elements.eyebrow,
    elements.title,
    ...elements.projects,
    elements.hint,
    elements.next,
    elements.shapeOne,
    elements.shapeTwo,
  ].filter(Boolean);
  gsap.killTweensOf(targets);
  gsap.set(targets, {
    clearProps: "transform,opacity,visibility,filter",
  });
}
function FLResetProjectVisuals(container = document) {
  if (!FLHasGSAP() || !container) {
    return;
  }
  const visualElements = [
    ...container.querySelectorAll(".rhythm-line"),
    ...container.querySelectorAll(".pulse-ring"),
    ...container.querySelectorAll(".pulse-core"),
    ...container.querySelectorAll(".pulse-marker"),
    ...container.querySelectorAll(".lega-visual__ring"),
    ...container.querySelectorAll(".lega-visual__core"),
    ...container.querySelectorAll(".lega-visual__timeline"),
    ...container.querySelectorAll(".lega-visual__slider"),
    ...container.querySelectorAll(".lega-visual__slider > span"),
    ...container.querySelectorAll(".lega-visual__chips span"),
    ...container.querySelectorAll(".lega-visual__identity"),
  ].filter(Boolean);

  gsap.killTweensOf(visualElements);
  gsap.set(visualElements, {
    clearProps: "transform,opacity,visibility",
  });
}
function FLAnimateProjectVisual(container, projectId, options = {}) {
  if (!container || !FLHasGSAP() || FLIsReducedMotion()) {
    return;
  }
  const { delay = 0 } = options;

  if (projectId === "nada-nusantara") {
    const lines = Array.from(container.querySelectorAll(".rhythm-line"));
    if (!lines.length) {
      return;
    }
    gsap.fromTo(
      lines,
      {
        scaleY: 0.3,
        autoAlpha: 0.16,
        transformOrigin: "center center",
      },
      {
        scaleY: 1,
        autoAlpha: 1,
        duration: FLIsMobile() ? 0.44 : 0.52,
        delay,
        stagger: {
          each: FLIsMobile() ? 0.035 : 0.05,
          from: "center",
        },
        ease: "back.out(1.25)",
        overwrite: "auto",
      },
    );
    return;
  }

  if (projectId === "pulse-diary") {
    const rings = Array.from(container.querySelectorAll(".pulse-ring"));
    const core = container.querySelector(".pulse-core");
    const markers = Array.from(container.querySelectorAll(".pulse-marker"));

    if (rings.length) {
      gsap.fromTo(
        rings,
        {
          scale: 0.82,
          autoAlpha: 0,
        },
        {
          scale: 1,
          autoAlpha: 1,
          duration: FLIsMobile() ? 0.46 : 0.54,
          delay,
          stagger: FLIsMobile() ? 0.05 : 0.065,
          ease: "power3.out",
          overwrite: "auto",
        },
      );
    }
    if (core) {
      gsap.fromTo(
        core,
        {
          scale: 0.72,
          autoAlpha: 0,
        },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.38,
          delay: delay + 0.08,
          ease: "back.out(1.45)",
          overwrite: "auto",
        },
      );
    }
    if (markers.length) {
      gsap.fromTo(
        markers,
        {
          scale: 0.72,
          autoAlpha: 0,
        },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.3,
          delay: delay + 0.14,
          stagger: FLIsMobile() ? 0.035 : 0.045,
          ease: "back.out(1.35)",
          overwrite: "auto",
        },
      );
    }
    return;
  }

  if (projectId === "lega") {
    const identity = container.querySelector(".lega-visual__identity");
    const rings = Array.from(container.querySelectorAll(".lega-visual__ring"));
    const core = container.querySelector(".lega-visual__core");
    const timelineVisual = container.querySelector(".lega-visual__timeline");
    const sliders = Array.from(
      container.querySelectorAll(".lega-visual__slider"),
    );
    const handles = Array.from(
      container.querySelectorAll(".lega-visual__slider > span"),
    );
    const chips = Array.from(
      container.querySelectorAll(".lega-visual__chips span"),
    );

    if (identity) {
      gsap.fromTo(
        identity,
        {
          y: -8,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.38,
          delay,
          ease: "power2.out",
          overwrite: "auto",
        },
      );
    }
    if (rings.length) {
      gsap.fromTo(
        rings,
        {
          scale: 0.78,
          autoAlpha: 0,
        },
        {
          scale: 1,
          autoAlpha: 1,
          duration: FLIsMobile() ? 0.46 : 0.52,
          delay: delay + 0.04,
          stagger: FLIsMobile() ? 0.045 : 0.06,
          ease: "power3.out",
          overwrite: "auto",
        },
      );
    }
    if (core) {
      gsap.fromTo(
        core,
        {
          scale: 0.68,
          autoAlpha: 0,
        },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.36,
          delay: delay + 0.11,
          ease: "back.out(1.45)",
          overwrite: "auto",
        },
      );
    }
    if (timelineVisual) {
      gsap.fromTo(
        timelineVisual,
        {
          scale: 0.9,
          autoAlpha: 0,
        },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.4,
          delay: delay + 0.13,
          ease: "power2.out",
          overwrite: "auto",
        },
      );
    }
    if (sliders.length) {
      gsap.fromTo(
        sliders,
        {
          x: FLIsMobile() ? 8 : 12,
          autoAlpha: 0,
        },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.32,
          delay: delay + 0.13,
          stagger: FLIsMobile() ? 0.03 : 0.04,
          ease: "power2.out",
          overwrite: "auto",
        },
      );
    }
    if (handles.length) {
      gsap.fromTo(
        handles,
        {
          scale: 0.7,
          autoAlpha: 0,
        },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.26,
          delay: delay + 0.2,
          stagger: 0.03,
          ease: "back.out(1.45)",
          overwrite: "auto",
        },
      );
    }
    if (chips.length) {
      gsap.fromTo(
        chips,
        {
          y: 5,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.28,
          delay: delay + 0.25,
          stagger: FLIsMobile() ? 0.03 : 0.04,
          ease: "power2.out",
          overwrite: "auto",
        },
      );
    }
  }
}
function FLBuildReducedProjects() {
  FLPrepareProjectsScene();
  FLResetProjectVisuals();
  const elements = FLGetProjectElements();
  if (!elements || !FLHasGSAP()) {
    return;
  }
  gsap.set(
    [
      elements.indicator,
      elements.eyebrow,
      elements.title,
      ...elements.projects,
      elements.hint,
      elements.next,
      elements.shapeOne,
      elements.shapeTwo,
    ].filter(Boolean),
    {
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      autoAlpha: 1,
      filter: "none",
    },
  );
  FLAnimationState.projects.timeline = null;
  FLAnimationState.projects.scrollTrigger = null;
}
function FLBuildProjectsScene() {
  const elements = FLGetProjectElements();
  if (!elements || !FLHasGSAP()) {
    return;
  }
  if (FLIsReducedMotion() || !FLHasScrollTrigger()) {
    FLBuildReducedProjects();
    return;
  }
  FLPrepareProjectsScene();
  FLResetProjectVisuals();

  const {
    scene,
    indicator,
    eyebrow,
    title,
    projects,
    hint,
    next,
    shapeOne,
    shapeTwo,
  } = elements;
  const enterBlur = FLCanUseSoftBlur() ? "blur(2px)" : "none";

  gsap.set(indicator, {
    x: -10,
    autoAlpha: 0,
  });
  gsap.set(eyebrow, {
    y: 9,
    autoAlpha: 0,
  });
  gsap.set(title, {
    y: FLIsMobile() ? 15 : 20,
    autoAlpha: 0,
    filter: enterBlur,
  });
  gsap.set(projects, {
    y: FLIsMobile() ? 16 : 24,
    scale: FLIsMobile() ? 0.996 : 0.992,
    autoAlpha: 0,
  });
  gsap.set(hint, {
    y: 8,
    autoAlpha: 0,
  });
  gsap.set(next, {
    y: 8,
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
    0.04,
  );
  timeline.to(
    title,
    {
      y: 0,
      autoAlpha: 1,
      filter: "none",
      duration: FLIsMobile() ? 0.56 : 0.64,
      ease: "power3.out",
    },
    0.08,
  );
  timeline.to(
    projects,
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: FLIsMobile() ? 0.52 : 0.6,
      stagger: FLIsMobile() ? 0.075 : 0.1,
      ease: "power3.out",
    },
    0.27,
  );

  timeline.call(
    () => {
      const lega = scene.querySelector('[data-project="lega"]');
      FLAnimateProjectVisual(lega, "lega");
    },
    null,
    FLIsMobile() ? 0.4 : 0.48,
  );
  timeline.call(
    () => {
      const pulse = scene.querySelector('[data-project="pulse-diary"]');
      FLAnimateProjectVisual(pulse, "pulse-diary");
    },
    null,
    FLIsMobile() ? 0.53 : 0.63,
  );
  timeline.call(
    () => {
      const nada = scene.querySelector('[data-project="nada-nusantara"]');
      FLAnimateProjectVisual(nada, "nada-nusantara");
    },
    null,
    FLIsMobile() ? 0.64 : 0.76,
  );

  timeline.to(
    hint,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.36,
      ease: "power2.out",
    },
    FLIsMobile() ? 0.68 : 0.82,
  );
  timeline.to(
    next,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.38,
      ease: "power2.out",
    },
    FLIsMobile() ? 0.72 : 0.87,
  );
  timeline.fromTo(
    shapeOne,
    {
      xPercent: 6,
      yPercent: -4,
      autoAlpha: 0.45,
    },
    {
      xPercent: 0,
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.9,
      ease: "sine.out",
    },
    0.08,
  );
  timeline.fromTo(
    shapeTwo,
    {
      xPercent: -6,
      yPercent: 5,
      autoAlpha: 0.45,
    },
    {
      xPercent: 0,
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.9,
      ease: "sine.out",
    },
    0.1,
  );

  const trigger = ScrollTrigger.create({
    trigger: scene,
    start: FLIsMobile() ? "top 82%" : "top 72%",
    once: true,
    onEnter() {
      FLSetSceneActive("projects");
      timeline.play();
    },
  });

  FLAnimationState.projects.timeline = timeline;
  FLAnimationState.projects.scrollTrigger = trigger;
}
function FLInitialiseProjectHover() {
  if (!FLHasGSAP() || !FLIsFinePointer()) {
    return;
  }
  document.querySelectorAll(".selected-project").forEach((project) => {
    if (project.dataset.flHoverReady === "true") {
      return;
    }
    project.dataset.flHoverReady = "true";
    const trigger = project.querySelector(".selected-project__trigger");
    const year = project.querySelector(".selected-project__year");
    if (!trigger || !year) {
      return;
    }
    trigger.addEventListener("mouseenter", () => {
      if (FLIsReducedMotion()) {
        return;
      }
      gsap.to(year, {
        scale: 1.035,
        y: -2,
        duration: 0.26,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
    trigger.addEventListener("mouseleave", () => {
      gsap.to(year, {
        scale: 1,
        y: 0,
        duration: FLIsReducedMotion() ? 0 : 0.28,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  });
}
function FLAnimateProjectModalOpen(projectId) {
  if (!projectId || !FLHasGSAP()) {
    return;
  }
  const modal = document.querySelector(`[data-project-modal="${projectId}"]`);
  if (!modal) {
    return;
  }

  FLAnimationState.modals.project?.kill?.();
  FLResetProjectVisuals(modal);

  const surface = modal.querySelector(".project-modal__surface");
  const visual = modal.querySelector(".project-modal__visual");
  const meta = modal.querySelector(".project-modal__meta");
  const title = modal.querySelector(".project-modal__title");
  const disciplines = Array.from(
    modal.querySelectorAll(".project-modal__disciplines li"),
  );
  const description = modal.querySelector(".project-modal__description");
  const actions = modal.querySelector(".project-modal__actions");
  const disclaimer = modal.querySelector(".project-disclaimer");
  const close = modal.querySelector(".project-modal__close");
  const targets = [
    surface,
    visual,
    meta,
    title,
    ...disciplines,
    description,
    actions,
    disclaimer,
    close,
  ].filter(Boolean);

  gsap.killTweensOf(targets);

  if (FLIsReducedMotion()) {
    gsap.set(targets, {
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      autoAlpha: 1,
      clearProps: "filter",
    });
    return;
  }

  const mobile = FLIsMobile();
  const timeline = gsap.timeline();

  timeline.fromTo(
    surface,
    mobile
      ? {
          yPercent: 3,
          autoAlpha: 0,
        }
      : {
          y: 16,
          scale: 0.987,
          autoAlpha: 0,
        },
    mobile
      ? {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.38,
          ease: "power3.out",
        }
      : {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.4,
          ease: "power3.out",
        },
    0,
  );
  timeline.fromTo(
    visual,
    mobile
      ? {
          y: -8,
          autoAlpha: 0,
        }
      : {
          x: -10,
          autoAlpha: 0,
        },
    mobile
      ? {
          y: 0,
          autoAlpha: 1,
          duration: 0.4,
          ease: "power3.out",
        }
      : {
          x: 0,
          autoAlpha: 1,
          duration: 0.46,
          ease: "power3.out",
        },
    0.04,
  );
  timeline.call(
    () => {
      FLAnimateProjectVisual(visual, projectId);
    },
    null,
    0.08,
  );
  timeline.fromTo(
    meta,
    {
      y: 5,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.26,
      ease: "power2.out",
    },
    mobile ? 0.16 : 0.1,
  );
  timeline.fromTo(
    title,
    {
      y: mobile ? 10 : 12,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.4,
      ease: "power3.out",
    },
    mobile ? 0.19 : 0.12,
  );
  timeline.fromTo(
    disciplines,
    {
      y: 5,
      scale: 0.975,
      autoAlpha: 0,
    },
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: 0.25,
      stagger: 0.03,
      ease: "power2.out",
    },
    mobile ? 0.25 : 0.18,
  );
  timeline.fromTo(
    description,
    {
      y: 8,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.34,
      ease: "power2.out",
    },
    mobile ? 0.3 : 0.23,
  );
  timeline.fromTo(
    actions,
    {
      y: 7,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.3,
      ease: "power2.out",
    },
    mobile ? 0.35 : 0.28,
  );

  if (disclaimer) {
    timeline.fromTo(
      disclaimer,
      {
        y: 5,
        autoAlpha: 0,
      },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.28,
        ease: "power2.out",
      },
      mobile ? 0.39 : 0.31,
    );
  }

  timeline.fromTo(
    close,
    {
      scale: 0.84,
      autoAlpha: 0,
    },
    {
      scale: 1,
      autoAlpha: 1,
      duration: 0.25,
      ease: "back.out(1.4)",
    },
    0.09,
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
function FLHandleProjectChange(event) {
  const projectId = event.detail?.projectId;
  if (!projectId) {
    return;
  }
  const project = document.querySelector(`[data-project="${projectId}"]`);
  if (!project) {
    return;
  }
  FLAnimateProjectVisual(project, projectId);
}
function FLChangeProject(projectId) {
  if (!projectId) {
    return false;
  }
  if (window.FLSite?.changeProject) {
    return window.FLSite.changeProject(projectId);
  }
  if (window.FLSite?.openProject) {
    return window.FLSite.openProject(projectId);
  }
  return false;
}
function FLSetProjectReadingMode(enabled, projectId = null) {
  if (enabled) {
    if (!projectId) {
      return false;
    }
    return FLChangeProject(projectId);
  }
  const openProject = window.FLSite?.getOpenProjectModal?.();
  if (!openProject) {
    return false;
  }
  return window.FLSite?.closeProject?.(openProject) ?? false;
}
function FLGetContactElements() {
  const scene = FLGetScene("contact");
  if (!scene) {
    return null;
  }
  return {
    scene,
    indicator: scene.querySelector(".scene-indicator"),
    eyebrow: scene.querySelector(".contact__eyebrow"),
    title: scene.querySelector(".contact__title"),
    description: scene.querySelector(".contact__description"),
    links: Array.from(scene.querySelectorAll(".contact-link")),
    restart: scene.querySelector(".contact__restart"),
    brand: scene.querySelector(".contact__brand"),
    shapeOne: scene.querySelector("[data-shape='contact-one']"),
    shapeTwo: scene.querySelector("[data-shape='contact-two']"),
    shapeThree: scene.querySelector("[data-shape='contact-three']"),
  };
}
function FLPrepareContactScene() {
  const elements = FLGetContactElements();
  if (!elements || !FLHasGSAP()) {
    return;
  }
  const targets = [
    elements.indicator,
    elements.eyebrow,
    elements.title,
    elements.description,
    ...elements.links,
    elements.restart,
    elements.brand,
    elements.shapeOne,
    elements.shapeTwo,
    elements.shapeThree,
  ].filter(Boolean);
  gsap.killTweensOf(targets);
  gsap.set(targets, {
    clearProps: "transform,opacity,visibility,filter",
  });
}
function FLBuildReducedContact() {
  FLPrepareContactScene();
  const elements = FLGetContactElements();
  if (!elements || !FLHasGSAP()) {
    return;
  }
  gsap.set(
    [
      elements.indicator,
      elements.eyebrow,
      elements.title,
      elements.description,
      ...elements.links,
      elements.restart,
      elements.brand,
      elements.shapeOne,
      elements.shapeTwo,
      elements.shapeThree,
    ].filter(Boolean),
    {
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      autoAlpha: 1,
      filter: "none",
    },
  );
  FLAnimationState.contact.timeline = null;
  FLAnimationState.contact.scrollTrigger = null;
}
function FLBuildContactScene() {
  const elements = FLGetContactElements();
  if (!elements || !FLHasGSAP()) {
    return;
  }
  if (FLIsReducedMotion() || !FLHasScrollTrigger()) {
    FLBuildReducedContact();
    return;
  }
  FLPrepareContactScene();

  const {
    scene,
    indicator,
    eyebrow,
    title,
    description,
    links,
    restart,
    brand,
    shapeOne,
    shapeTwo,
    shapeThree,
  } = elements;
  const enterBlur = FLCanUseSoftBlur() ? "blur(2px)" : "none";

  gsap.set(indicator, {
    x: -10,
    autoAlpha: 0,
  });
  gsap.set(eyebrow, {
    y: 9,
    autoAlpha: 0,
  });
  gsap.set(title, {
    y: FLIsMobile() ? 16 : 22,
    autoAlpha: 0,
    filter: enterBlur,
  });
  gsap.set(description, {
    y: 10,
    autoAlpha: 0,
  });
  gsap.set(links, {
    x: FLIsMobile() ? 0 : -12,
    y: FLIsMobile() ? 10 : 0,
    autoAlpha: 0,
  });
  gsap.set(restart, {
    y: 7,
    autoAlpha: 0,
  });
  gsap.set(brand, {
    xPercent: FLIsMobile() ? 1 : 3,
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
    0.04,
  );
  timeline.to(
    title,
    {
      y: 0,
      autoAlpha: 1,
      filter: "none",
      duration: FLIsMobile() ? 0.58 : 0.68,
      ease: "power3.out",
    },
    0.08,
  );
  timeline.to(
    description,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.42,
      ease: "power2.out",
    },
    0.27,
  );
  timeline.to(
    links,
    {
      x: 0,
      y: 0,
      autoAlpha: 1,
      duration: 0.4,
      stagger: FLIsMobile() ? 0.06 : 0.075,
      ease: "power3.out",
    },
    0.36,
  );
  timeline.to(
    restart,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.36,
      ease: "power2.out",
    },
    0.56,
  );
  timeline.to(
    brand,
    {
      xPercent: 0,
      autoAlpha: 1,
      duration: 0.78,
      ease: "power3.out",
    },
    0.16,
  );
  timeline.fromTo(
    shapeOne,
    {
      xPercent: 6,
      yPercent: -4,
      autoAlpha: 0.45,
    },
    {
      xPercent: 0,
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.9,
      ease: "sine.out",
    },
    0.06,
  );
  timeline.fromTo(
    shapeTwo,
    {
      xPercent: -5,
      yPercent: 4,
      autoAlpha: 0.45,
    },
    {
      xPercent: 0,
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.9,
      ease: "sine.out",
    },
    0.08,
  );
  timeline.fromTo(
    shapeThree,
    {
      xPercent: -6,
      yPercent: 4,
      autoAlpha: 0.45,
    },
    {
      xPercent: 0,
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.9,
      ease: "sine.out",
    },
    0.1,
  );

  const trigger = ScrollTrigger.create({
    trigger: scene,
    start: FLIsMobile() ? "top 82%" : "top 72%",
    once: true,
    onEnter() {
      FLSetSceneActive("contact");
      timeline.play();
    },
  });

  FLAnimationState.contact.timeline = timeline;
  FLAnimationState.contact.scrollTrigger = trigger;
}
function FLInitialiseContactHover() {
  if (!FLHasGSAP() || !FLIsFinePointer()) {
    return;
  }
  document.querySelectorAll(".contact-link").forEach((link) => {
    if (link.dataset.flHoverReady === "true") {
      return;
    }
    link.dataset.flHoverReady = "true";

    const arrow = link.querySelector(".contact-link__arrow");
    if (!arrow) {
      return;
    }

    link.addEventListener("mouseenter", () => {
      if (FLIsReducedMotion()) {
        return;
      }
      gsap.to(arrow, {
        x: 3,
        y: -3,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    link.addEventListener("mouseleave", () => {
      gsap.to(arrow, {
        x: 0,
        y: 0,
        duration: FLIsReducedMotion() ? 0 : 0.26,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  });
}
function FLGetCustomCursor() {
  const cursor = document.querySelector("[data-cursor]");
  if (!cursor) {
    return null;
  }
  return {
    cursor,
    label: cursor.querySelector("[data-cursor-label]"),
  };
}
function FLGetDefaultCursorLabel() {
  return window.FLSite?.getLanguage?.() === "id" ? "Klik" : "Click";
}
function FLCursorCanDisplay() {
  if (FLIsReducedMotion() || !FLIsFinePointer()) {
    return false;
  }
  if (FLAnimationState.currentScene !== "welcome") {
    return false;
  }
  if (FLAnimationState.welcome.sequenceActive) {
    return false;
  }
  return FLAnimationState.welcome.step === 0;
}
function FLShowCustomCursor() {
  const cursor = FLAnimationState.cursor.element;
  if (!cursor || !FLCursorCanDisplay()) {
    FLHideCustomCursor();
    return;
  }
  cursor.classList.add("is-visible");
}
function FLHideCustomCursor() {
  const cursor = FLAnimationState.cursor.element;
  if (!cursor) {
    return;
  }
  cursor.classList.remove("is-visible", "is-interactive");
}
function FLSetCursorLabel(value = "") {
  const label = FLAnimationState.cursor.label;
  if (!label) {
    return;
  }
  const fallback = FLGetDefaultCursorLabel();
  const safeLabel = String(value || fallback).trim();
  label.textContent = safeLabel || fallback;
}
function FLMoveCustomCursor(event) {
  const cursor = FLAnimationState.cursor.element;
  if (!cursor || !FLCursorCanDisplay()) {
    FLHideCustomCursor();
    return;
  }
  FLShowCustomCursor();

  if (FLAnimationState.cursor.moveX && FLAnimationState.cursor.moveY) {
    FLAnimationState.cursor.moveX(event.clientX);
    FLAnimationState.cursor.moveY(event.clientY);
    return;
  }

  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
}
function FLUpdateCursorInteractiveState(event) {
  const cursor = FLAnimationState.cursor.element;
  if (!cursor || !FLCursorCanDisplay()) {
    return;
  }
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const interactive = target.closest(
    ["a", "button", "[role='button']", "[data-cursor-label]"].join(","),
  );
  cursor.classList.toggle("is-interactive", Boolean(interactive));
  FLSetCursorLabel(
    interactive?.dataset?.cursorLabel || FLGetDefaultCursorLabel(),
  );
}
function FLInitialiseCustomCursor() {
  if (FLAnimationState.cursorInitialised) {
    return;
  }
  const elements = FLGetCustomCursor();
  if (!elements) {
    return;
  }

  const { cursor, label } = elements;
  FLAnimationState.cursor.element = cursor;
  FLAnimationState.cursor.label = label;

  if (FLHasGSAP() && typeof gsap.quickTo === "function") {
    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
    });
    FLAnimationState.cursor.moveX = gsap.quickTo(cursor, "x", {
      duration: 0.16,
      ease: "power3.out",
    });
    FLAnimationState.cursor.moveY = gsap.quickTo(cursor, "y", {
      duration: 0.16,
      ease: "power3.out",
    });
  }

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }
      FLMoveCustomCursor(event);
      FLUpdateCursorInteractiveState(event);
    },
    {
      passive: true,
    },
  );

  document.addEventListener("pointerleave", () => {
    FLAnimationState.cursor.insideWelcome = false;
    FLHideCustomCursor();
  });

  FLAnimationState.cursorInitialised = true;
}
function FLInitialiseWelcomePointerRegion() {
  const welcome = FLGetScene("welcome");
  if (!welcome || welcome.dataset.flPointerReady === "true") {
    return;
  }
  welcome.dataset.flPointerReady = "true";

  welcome.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") {
      return;
    }
    FLAnimationState.cursor.insideWelcome = true;
    FLShowCustomCursor();
  });

  welcome.addEventListener("pointerleave", () => {
    FLAnimationState.cursor.insideWelcome = false;
    FLHideCustomCursor();
  });
}
function FLClearSceneAwareness() {
  FLAnimationState.sceneAwareness.forEach((trigger) => {
    trigger?.kill?.();
  });
  FLAnimationState.sceneAwareness = [];
}
function FLInitialiseSceneAwareness() {
  if (!FLHasScrollTrigger()) {
    return;
  }
  FLClearSceneAwareness();

  document.querySelectorAll("[data-scene]").forEach((scene) => {
    const sceneName = scene.dataset.scene;
    if (!sceneName || sceneName === "welcome") {
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: scene,
      start: FLIsMobile() ? "top 58%" : "top 52%",
      end: FLIsMobile() ? "bottom 42%" : "bottom 48%",
      onEnter() {
        FLSetSceneActive(sceneName);
      },
      onEnterBack() {
        if (
          sceneName === "about" &&
          !FLAnimationState.welcome.sequenceActive &&
          !FLAnimationState.welcome.bridgeTimeline?.isActive?.() &&
          !FLAnimationState.about.flightTimeline?.isActive?.()
        ) {
          FLSetAboutReadyState();
        }
        FLSetSceneActive(sceneName);
      },
    });

    FLAnimationState.sceneAwareness.push(trigger);
  });
}
function FLHandleSceneChange(event) {
  const scene =
    event.detail?.scene || event.detail?.sceneName || event.detail?.id;
  if (!scene) {
    return;
  }
  FLAnimationState.currentScene = scene;
  if (scene !== "welcome") {
    FLHideCustomCursor();
  }
}
function FLUpdateAboutProgressAttribute() {
  const scene = FLGetScene("about");
  if (!scene) {
    return;
  }
  scene.dataset.aboutStep = FLGetAboutStoryState();
}
function FLStartProgressLoop() {
  if (FLAnimationState.progressLoopStarted) {
    return;
  }
  FLAnimationState.progressLoopStarted = true;

  const update = () => {
    if (FLAnimationState.ready) {
      if (FLAnimationState.cursor.insideWelcome && FLCursorCanDisplay()) {
        FLShowCustomCursor();
      } else if (!FLCursorCanDisplay()) {
        FLHideCustomCursor();
      }
      FLUpdateAboutProgressAttribute();
    }
    window.requestAnimationFrame(update);
  };

  window.requestAnimationFrame(update);
}
function FLResolveCurrentScene() {
  return (
    window.FLSite?.getActiveScene?.() ||
    FLAnimationState.currentScene ||
    "welcome"
  );
}
function FLCreateRebuildSnapshot() {
  const scene = FLResolveCurrentScene();
  const sceneElement = FLGetScene(scene);
  const sceneTop = sceneElement ? FLGetAbsoluteTop(sceneElement) : null;

  return {
    scene,
    scrollY: window.scrollY,
    sceneOffset: sceneTop === null ? 0 : window.scrollY - sceneTop,
    welcomeProgress:
      FLAnimationState.welcome.scrollTrigger?.progress ??
      FLAnimationState.welcome.progress ??
      0,
    welcomeStep: FLAnimationState.welcome.step,
    aboutIntroPlayed: FLAnimationState.about.introPlayed,
    aboutFlightComplete: FLAnimationState.about.flightComplete,
  };
}
function FLRestoreRebuildSnapshot(snapshot) {
  if (!snapshot) {
    return;
  }

  const {
    scene,
    scrollY,
    sceneOffset,
    welcomeProgress,
    welcomeStep,
    aboutIntroPlayed,
    aboutFlightComplete,
  } = snapshot;

  if (scene === "welcome") {
    if (FLIsReducedMotion()) {
      FLSetReducedWelcomeStep(welcomeStep ?? 0);
      window.scrollTo(0, 0);
      FLSetSceneActive("welcome");
      return;
    }

    if (FLAnimationState.welcome.scrollTrigger) {
      const trigger = FLAnimationState.welcome.scrollTrigger;
      const target =
        trigger.start +
        (trigger.end - trigger.start) * FLClamp(welcomeProgress);

      window.scrollTo(0, target);
      ScrollTrigger.update();
      FLUpdateWelcomeProgress(welcomeProgress);
      FLSetSceneActive("welcome");
      return;
    }
  }

  const sceneElement = FLGetScene(scene);
  const sceneTop = sceneElement ? FLGetAbsoluteTop(sceneElement) : null;

  if (sceneTop !== null) {
    window.scrollTo(0, Math.max(0, sceneTop + sceneOffset));
  } else {
    window.scrollTo(0, Math.max(0, scrollY));
  }

  if (scene === "about" && aboutIntroPlayed) {
    FLSetAboutReadyState();
    FLAnimationState.about.flightComplete = Boolean(aboutFlightComplete);
  }

  FLSetSceneActive(scene);
  FLHasScrollTrigger() && ScrollTrigger.update();
}
function FLClearAnimations() {
  FLStopAutoPlay({
    killScroll: true,
    resetBridge: false,
  });
  FLKillScrollTween();
  FLHideCustomCursor();
  FLClearSceneAwareness();

  FLAnimationState.welcome.bridgeTimeline?.kill?.();
  FLAnimationState.welcome.bridgeTimeline = null;

  FLAnimationState.about.flightTimeline?.kill?.();
  FLAnimationState.about.flightTimeline = null;

  FLAnimationState.modals.discipline?.kill?.();
  FLAnimationState.modals.project?.kill?.();

  FLAnimationState.context?.revert?.();
  FLAnimationState.context = null;

  FLAnimationState.welcome.timeline = null;
  FLAnimationState.welcome.scrollTrigger = null;
  FLAnimationState.welcome.sequenceActive = false;

  FLAnimationState.about.timeline = null;
  FLAnimationState.about.scrollTrigger = null;

  FLAnimationState.services.timeline = null;
  FLAnimationState.services.scrollTrigger = null;

  FLAnimationState.projects.timeline = null;
  FLAnimationState.projects.scrollTrigger = null;

  FLAnimationState.contact.timeline = null;
  FLAnimationState.contact.scrollTrigger = null;

  FLAnimationState.modals.discipline = null;
  FLAnimationState.modals.project = null;

  FLSetWelcomeSequenceRunning(false);
}
function FLBuildAllAnimations() {
  if (!FLHasGSAP()) {
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

  FLInitialiseSceneAwareness();
  FLRefreshLayout(20);
}
function FLRebuildAnimations(options = {}) {
  if (!FLHasGSAP() || FLAnimationState.rebuilding) {
    return false;
  }

  const { preservePosition = true } = options;
  const snapshot = preservePosition ? FLCreateRebuildSnapshot() : null;

  FLAnimationState.rebuilding = true;
  FLClearAnimations();

  window.requestAnimationFrame(() => {
    FLBuildAllAnimations();

    window.requestAnimationFrame(() => {
      if (FLHasScrollTrigger()) {
        ScrollTrigger.refresh(true);
      }

      window.requestAnimationFrame(() => {
        if (snapshot) {
          FLRestoreRebuildSnapshot(snapshot);
        }
        FLAnimationState.rebuilding = false;
      });
    });
  });

  return true;
}
let FLLastViewportWidth = window.innerWidth;
let FLLastViewportHeight = window.innerHeight;

function FLHandleResize() {
  window.clearTimeout(FLAnimationState.resizeTimer);

  FLAnimationState.resizeTimer = window.setTimeout(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const widthDifference = Math.abs(width - FLLastViewportWidth);
    const heightDifference = Math.abs(height - FLLastViewportHeight);
    const previousMode = FLAnimationState.viewportMode;
    const nextMode = FLGetViewportMode();

    FLLastViewportWidth = width;
    FLLastViewportHeight = height;
    FLAnimationState.viewportMode = nextMode;

    const modeChanged = previousMode !== nextMode;
    const meaningfulWidthChange = widthDifference >= 24;
    const meaningfulHeightChange = FLIsDesktop()
      ? heightDifference >= 24
      : heightDifference >= 140;

    if (!modeChanged && !meaningfulWidthChange && !meaningfulHeightChange) {
      FLRefreshLayout(20);
      return;
    }

    FLRebuildAnimations({
      preservePosition: true,
    });
  }, 180);
}
function FLHandleMotionSettingChange() {
  const nextReduced = FLIsReducedMotion();
  if (nextReduced === FLAnimationState.reducedMotion) {
    return;
  }
  FLAnimationState.reducedMotion = nextReduced;
  FLRebuildAnimations({
    preservePosition: true,
  });
}
function FLHandleFontSizeChange() {
  FLRebuildAnimations({
    preservePosition: true,
  });
}
function FLHandleLanguageChange() {
  FLSetCursorLabel(FLGetDefaultCursorLabel());
  FLRebuildAnimations({
    preservePosition: true,
  });
}
function FLHandleThemeChange() {
  const currentScene = FLResolveCurrentScene();

  if (currentScene === "welcome") {
    FLRebuildAnimations({
      preservePosition: true,
    });
    return;
  }

  FLRefreshLayout(40);
}
function FLInitialiseNativeMotionWatcher() {
  const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (!query) {
    return;
  }

  const handler = () => {
    FLHandleMotionSettingChange();
  };

  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", handler);
    return;
  }

  query.addListener?.(handler);
}
function FLHandleModalClose(event) {
  if (event.detail?.open) {
    return;
  }
  window.requestAnimationFrame(() => {
    FLRefreshLayout(30);
  });
}
function FLHandleVisibilityChange() {
  if (document.hidden) {
    FLHideCustomCursor();
    return;
  }
  FLRefreshLayout(60);
}
function FLHandlePageShow(event) {
  if (event.persisted) {
    FLRebuildAnimations({
      preservePosition: true,
    });
    return;
  }
  FLRefreshLayout(50);
}
function FLInitialiseAnimationEvents() {
  if (FLAnimationState.eventsInitialised) {
    return;
  }

  window.addEventListener("resize", FLHandleResize, {
    passive: true,
  });

  window.addEventListener(
    "orientationchange",
    () => {
      window.setTimeout(() => {
        FLLastViewportWidth = window.innerWidth;
        FLLastViewportHeight = window.innerHeight;
        FLRebuildAnimations({
          preservePosition: true,
        });
      }, 220);
    },
    {
      passive: true,
    },
  );

  window.addEventListener(
    "flMotionPreferenceChange",
    FLHandleMotionSettingChange,
  );
  window.addEventListener("flReducedMotionChange", FLHandleMotionSettingChange);
  window.addEventListener("flMotionChange", FLHandleMotionSettingChange);
  window.addEventListener("flFontSizeChange", FLHandleFontSizeChange);
  window.addEventListener("flLanguageChange", FLHandleLanguageChange);
  window.addEventListener("flThemeChange", FLHandleThemeChange);
  window.addEventListener(
    "flDisciplineModalChange",
    FLHandleDisciplineModalChange,
  );
  window.addEventListener("flDisciplineModalChange", FLHandleModalClose);
  window.addEventListener("flProjectModalChange", FLHandleProjectModalChange);
  window.addEventListener("flProjectModalChange", FLHandleModalClose);
  window.addEventListener("flProjectChange", FLHandleProjectChange);
  window.addEventListener("flSceneChange", FLHandleSceneChange);
  document.addEventListener("visibilitychange", FLHandleVisibilityChange);
  window.addEventListener("pageshow", FLHandlePageShow);

  FLInitialiseScrollInterruption();
  FLInitialiseNativeMotionWatcher();

  FLAnimationState.eventsInitialised = true;
}
function FLResetAboutForRestart() {
  if (!FLHasGSAP()) {
    return;
  }

  FLAnimationState.about.flightTimeline?.kill?.();
  FLAnimationState.about.flightTimeline = null;
  FLAnimationState.about.flightComplete = false;
  FLAnimationState.about.introPlayed = false;

  const elements = FLGetAboutElements();
  if (!elements || FLIsReducedMotion()) {
    return;
  }

  FLPrepareAboutEntranceState(elements);
  FLAnimationState.about.timeline?.pause?.(0);
}
function FLRestartExperience() {
  FLStopAutoPlay();

  FLAnimationState.welcome.bridgeTimeline?.kill?.();
  FLAnimationState.welcome.bridgeTimeline = null;

  FLSetWelcomeSequenceRunning(false);
  FLResetAboutForRestart();

  if (FLIsReducedMotion()) {
    FLSetReducedWelcomeStep(0);
  }

  return FLGoToScene("welcome", {
    landing: "intro",
    duration: 0.88,
    immediate: FLIsReducedMotion(),
    skipWelcomeTransition: true,
    skipAboutTransition: true,
    onComplete() {
      FLSetSceneActive("welcome");
      FLAnimationState.welcome.sequenceActive = false;
      FLAnimationState.welcome.reducedStep = 0;
      FLSetWelcomeSequenceRunning(false);

      if (!FLIsReducedMotion()) {
        FLUpdateWelcomeProgress(0);
      }

      FLShowCustomCursor();
    },
  });
}
function FLRestoreInitialScenePosition() {
  const sceneName = window.FLSite?.getActiveScene?.() || "welcome";

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      FLHasScrollTrigger() && ScrollTrigger.refresh();

      FLGoToScene(sceneName, {
        landing: sceneName === "welcome" ? "intro" : "ready",
        duration: 0,
        immediate: true,
        preserveAutoPlay: true,
        skipWelcomeTransition: true,
        skipAboutTransition: true,
        onComplete() {
          if (sceneName === "about") {
            FLSetAboutReadyState();
          }

          if (sceneName === "welcome") {
            FLSetWelcomeSequenceRunning(false);
          }
        },
      });
    });
  });
}
function FLInitialiseLoadRefresh() {
  if (document.readyState === "complete") {
    FLRefreshLayout(60);
    return;
  }

  window.addEventListener(
    "load",
    () => {
      FLRefreshLayout(60);
    },
    {
      once: true,
    },
  );
}
function FLInitialiseFontRefresh() {
  if (!document.fonts?.ready) {
    return;
  }

  document.fonts.ready
    .then(() => {
      FLRefreshLayout(40);
    })
    .catch(() => {});
}
function FLGetAnimationState() {
  return {
    ready: FLAnimationState.ready,
    rebuilding: FLAnimationState.rebuilding,
    currentScene: FLAnimationState.currentScene,
    viewportMode: FLAnimationState.viewportMode,
    reducedMotion: FLAnimationState.reducedMotion,
    autoPlay: FLAnimationState.autoPlay.active,
    welcomeSequenceActive: FLAnimationState.welcome.sequenceActive,
    welcomeProgress:
      FLAnimationState.welcome.scrollTrigger?.progress ??
      FLAnimationState.welcome.progress ??
      0,
    welcomeStep: FLAnimationState.welcome.step,
    welcomeBridgeActive: Boolean(
      FLAnimationState.welcome.bridgeTimeline?.isActive?.(),
    ),
    aboutProgress: FLAnimationState.about.progress,
    aboutStep: FLGetAboutStoryState(),
    aboutIntroPlayed: FLAnimationState.about.introPlayed,
    aboutFlightComplete: FLAnimationState.about.flightComplete,
  };
}
function FLPublicRefresh() {
  FLRefreshLayout(0);
  return true;
}
function FLPublicRebuild() {
  return FLRebuildAnimations({
    preservePosition: true,
  });
}
function FLExposeAnimationAPI() {
  window.FLAnimations = {
    getState: FLGetAnimationState,
    goToScene: FLGoToScene,
    advanceScene: FLAdvanceScene,
    advanceWelcome: FLAdvanceWelcome,
    playWelcomeSequence: FLPlayWelcomeSequence,
    stopWelcomeSequence: FLStopAutoPlay,
    transitionWelcomeToAbout: FLTransitionWelcomeToAbout,
    transitionAboutToServices: FLTransitionAboutToServices,
    restart: FLRestartExperience,
    refresh: FLPublicRefresh,
    rebuild: FLPublicRebuild,
    scrollWelcomeToLabel: FLScrollWelcomeToLabel,
    scrollAboutToLabel: FLScrollAboutToLabel,
    changeProject: FLChangeProject,
    setProjectReadingMode: FLSetProjectReadingMode,
    showCursor: FLShowCustomCursor,
    hideCursor: FLHideCustomCursor,
  };

  window.FLGoToScene = FLGoToScene;
  window.FLAdvanceScene = FLAdvanceScene;
  window.FLAdvanceWelcome = FLAdvanceWelcome;
  window.FLPlayWelcomeSequence = FLPlayWelcomeSequence;
  window.FLStopWelcomeSequence = FLStopAutoPlay;
  window.FLTransitionWelcomeToAbout = FLTransitionWelcomeToAbout;
  window.FLRestartExperience = FLRestartExperience;
  window.FLRefreshAnimations = FLPublicRefresh;
  window.FLRebuildAnimations = FLPublicRebuild;
  window.FLChangeProject = FLChangeProject;
  window.FLSetProjectReadingMode = FLSetProjectReadingMode;
}
function FLShowStaticExperience() {
  const welcome = FLGetWelcomeElements();
  FLSetWelcomeSequenceRunning(false);

  if (welcome) {
    if (welcome.intro) {
      welcome.intro.style.opacity = "1";
      welcome.intro.style.visibility = "visible";
      welcome.intro.style.transform = "";
    }
    if (welcome.specialisms) {
      welcome.specialisms.style.opacity = "0";
      welcome.specialisms.style.visibility = "hidden";
    }
    if (welcome.statementContainer) {
      welcome.statementContainer.style.opacity = "0";
      welcome.statementContainer.style.visibility = "hidden";
    }
  }

  document
    .querySelectorAll(
      [
        ".scene-indicator",
        ".about__eyebrow",
        ".about__title",
        ".about__story p",
        ".travel-story",
        ".travel-location",
        ".travel-plane",
        ".scene-next",
        ".services__eyebrow",
        ".services__title",
        ".services__instruction",
        ".discipline",
        ".projects__eyebrow",
        ".projects__title",
        ".selected-project",
        ".projects__interaction-hint",
        ".contact__eyebrow",
        ".contact__title",
        ".contact__description",
        ".contact-link",
        ".contact__restart",
        ".contact__brand",
      ].join(","),
    )
    .forEach((element) => {
      element.style.opacity = "1";
      element.style.visibility = "visible";
      element.style.transform = "";
      element.style.filter = "";
    });

  document.querySelectorAll("[data-travel-path]").forEach((path) => {
    path.style.strokeDasharray = "none";
    path.style.strokeDashoffset = "0";
  });
}
function FLInitialiseStaticMode() {
  FLShowStaticExperience();

  FLAnimationState.ready = true;
  FLAnimationState.reducedMotion = true;
  FLAnimationState.viewportMode = FLGetViewportMode();
  FLAnimationState.currentScene =
    window.FLSite?.getActiveScene?.() || "welcome";
  FLAnimationState.welcome.sequenceActive = false;

  FLInitialiseWelcomeContinue();
  FLExposeAnimationAPI();
}
function FLInitialiseAnimations() {
  if (FLAnimationState.ready) {
    return;
  }

  FLSetWelcomeSequenceRunning(false);

  if (!FLHasGSAP()) {
    FLInitialiseStaticMode();
    return;
  }

  FLAnimationState.reducedMotion = FLIsReducedMotion();
  FLAnimationState.viewportMode = FLGetViewportMode();
  FLAnimationState.currentScene =
    window.FLSite?.getActiveScene?.() || "welcome";

  FLLastViewportWidth = window.innerWidth;
  FLLastViewportHeight = window.innerHeight;

  FLInitialiseAnimationEvents();
  FLInitialiseCustomCursor();
  FLInitialiseWelcomePointerRegion();
  FLInitialiseWelcomeContinue();
  FLInitialiseDisciplineHover();
  FLInitialiseProjectHover();
  FLInitialiseContactHover();
  FLInitialiseLoadRefresh();
  FLInitialiseFontRefresh();

  FLBuildAllAnimations();
  FLExposeAnimationAPI();

  FLAnimationState.ready = true;

  FLStartProgressLoop();
  FLRestoreInitialScenePosition();
  FLRefreshLayout(80);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", FLInitialiseAnimations, {
    once: true,
  });
} else {
  FLInitialiseAnimations();
}
