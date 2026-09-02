export const MAP_CATEGORY_COLORS: Record<string, string> = {
  heykeller: "#946277",
  saraylar: "#9a7646",
  "tarihi-yapilar": "#4f7182",
  spor: "#6f8058",
  "dini-kamusal": "#52766f",
};

export const MAP_CATEGORY_LEGEND = [
  { id: "saraylar", label: "Saraylar" },
  { id: "tarihi-yapilar", label: "Tarihi yapılar" },
  { id: "dini-kamusal", label: "Dini & kamusal" },
  { id: "heykeller", label: "Anıtlar" },
  { id: "spor", label: "Spor" },
] as const;
