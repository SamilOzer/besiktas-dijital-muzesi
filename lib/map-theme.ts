export const MAP_CATEGORY_COLORS: Record<string, string> = {
  heykeller: "#f43f6f",
  saraylar: "#8257e5",
  "tarihi-yapilar": "#238de0",
  spor: "#f2a114",
  "dini-kamusal": "#12a981",
};

export const MAP_TIME_PERIOD_COLORS: Record<string, string> = {
  "1400-1600": "#c6a25c",
  "1600-1800": "#8065a8",
  "1800-1850": "#467ca4",
  "1850-1900": "#4f8b7e",
  "1900-1960": "#b85e48",
  "1960-gunumuz": "#c757a1",
};

export const MAP_CATEGORY_LEGEND = [
  { id: "saraylar", label: "Saraylar" },
  { id: "tarihi-yapilar", label: "Tarihi yapılar" },
  { id: "dini-kamusal", label: "Dini & kamusal" },
  { id: "heykeller", label: "Anıtlar" },
  { id: "spor", label: "Spor" },
] as const;
