export const MAP_CATEGORY_COLORS: Record<string, string> = {
  heykeller: "#c94f65",
  saraylar: "#7652a5",
  "tarihi-yapilar": "#2876a8",
  spor: "#d28a2f",
  "dini-kamusal": "#21857d",
};

export const MAP_CATEGORY_LEGEND = [
  { id: "saraylar", label: "Saraylar" },
  { id: "tarihi-yapilar", label: "Tarihi yapılar" },
  { id: "dini-kamusal", label: "Dini & kamusal" },
  { id: "heykeller", label: "Anıtlar" },
  { id: "spor", label: "Spor" },
] as const;
