/**
 * scrollStates.ts
 * Shared constants for scroll-driven animation states on the homepage.
 * These define which 3D camera position / scene state corresponds
 * to each of the five scrollytelling sections.
 */

export const SCROLL_SECTIONS = [
  {
    id: "hero",
    label: "Hero",
    cameraZ: 6,
    cameraY: 0,
    rotationY: 0,
    progress: 0,
  },
  {
    id: "katmanlar",
    label: "Katmanlar",
    cameraZ: 4,
    cameraY: 0.5,
    rotationY: Math.PI * 0.15,
    progress: 0.25,
  },
  {
    id: "miras",
    label: "Miras",
    cameraZ: 3,
    cameraY: 1,
    rotationY: Math.PI * 0.3,
    progress: 0.5,
  },
  {
    id: "vakif",
    label: "Vakıf & Belediye",
    cameraZ: 3.5,
    cameraY: 0.5,
    rotationY: Math.PI * 0.6,
    progress: 0.75,
  },
  {
    id: "cta",
    label: "CTA",
    cameraZ: 5,
    cameraY: 0,
    rotationY: Math.PI * 2,
    progress: 1,
  },
] as const;

export type ScrollSectionId = (typeof SCROLL_SECTIONS)[number]["id"];
