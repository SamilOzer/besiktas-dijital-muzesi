/**
 * sceneReady.ts
 * Manages scroll-lock coordination between the 3D canvas scene
 * and the scrollytelling sections on the homepage.
 */

let sceneLoaded = false;
let scrollLocked = false;

/**
 * Mark the R3F scene as loaded and release any pending scroll lock.
 */
export function markSceneReady() {
  sceneLoaded = true;
  if (scrollLocked) {
    unlockScroll();
  }
}

/**
 * Lock the document scroll (called while 3D scene initializes).
 */
export function lockScroll() {
  if (typeof document === "undefined") return;
  scrollLocked = true;
  document.body.style.overflow = "hidden";
}

/**
 * Unlock document scroll.
 */
export function unlockScroll() {
  if (typeof document === "undefined") return;
  scrollLocked = false;
  document.body.style.overflow = "";
}

/**
 * Returns whether the scene is fully loaded.
 */
export function isSceneReady() {
  return sceneLoaded;
}
