// In-memory store — resets on page refresh (demo only)
// In production: replace with DB calls (Prisma, Drizzle, Supabase, etc.)

import { besiktasPinData, PinLocation } from "@/data/besiktasPinData";
import { ansiklopediData, HistoricalEvent } from "@/data/ansiklopediData";
import { savePinToDb, deletePinFromDb, saveOlayToDb, deleteOlayFromDb, fetchOlaylarFromDb, fetchPinsFromDb, normalizePinData } from "./db-service";

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "editor" | "viewer";
export type UserStatus = "active" | "inactive";

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  avatar: string;
}

// ─── Mock Users ───────────────────────────────────────────────────────────────
let users: AdminUserRecord[] = [
  { id: "u1", name: "Admin Kullanıcı",    email: "admin@besiktas.bel.tr",   role: "admin",  status: "active",   joinedAt: "2024-01-15", avatar: "AK" },
  { id: "u2", name: "Mehmet Yılmaz",      email: "m.yilmaz@besiktas.bel.tr", role: "editor", status: "active",   joinedAt: "2024-03-20", avatar: "MY" },
  { id: "u3", name: "Ayşe Kaya",          email: "a.kaya@besiktas.bel.tr",   role: "editor", status: "active",   joinedAt: "2024-05-10", avatar: "AK" },
  { id: "u4", name: "Can Demir",          email: "c.demir@besiktas.bel.tr",  role: "viewer", status: "inactive", joinedAt: "2024-07-01", avatar: "CD" },
  { id: "u5", name: "Zeynep Arslan",      email: "z.arslan@besiktas.bel.tr", role: "viewer", status: "active",   joinedAt: "2024-08-22", avatar: "ZA" },
];

// ─── Mock Mekanlar (pins) ─────────────────────────────────────────────────────
const getInitialMekanlar = (): PinLocation[] => {
  if (typeof window === "undefined") return [...besiktasPinData];
  try {
    const data = localStorage.getItem("besiktas_mekanlar_db");
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(e);
  }
  return [...besiktasPinData];
};

let mekanlar: PinLocation[] = getInitialMekanlar();

// ─── Mock Ansiklopedi ─────────────────────────────────────────────────────────
const getInitialOlaylar = (): HistoricalEvent[] => {
  if (typeof window === "undefined") return [...ansiklopediData];
  try {
    const data = localStorage.getItem("besiktas_olaylar_db");
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load initial olaylar from localStorage:", e);
  }
  return [...ansiklopediData];
};

let olaylar: HistoricalEvent[] = getInitialOlaylar();

const notifyDataUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("besiktas_data_updated"));
  }
};

// ─── Mock Stats ───────────────────────────────────────────────────────────────
export const monthlyVisits = [
  { month: "Oca", visits: 8420, events: 3 },
  { month: "Şub", visits: 9100, events: 5 },
  { month: "Mar", visits: 11200, events: 7 },
  { month: "Nis", visits: 10500, events: 4 },
  { month: "May", visits: 13800, events: 8 },
  { month: "Haz", visits: 15200, events: 6 },
  { month: "Tem", visits: 14100, events: 9 },
  { month: "Ağu", visits: 12840, events: 5 },
];

export const categoryStats = [
  { name: "Saraylar",       count: 0 },
  { name: "Heykeller",      count: 0 },
  { name: "Dini & Kamusal", count: 0 },
  { name: "Tarihi Yapılar", count: 0 },
  { name: "Spor",           count: 0 },
];

export const updateCategoryStats = () => {
  categoryStats[0].count = mekanlar.filter(m => m.category === "saraylar").length;
  categoryStats[1].count = mekanlar.filter(m => m.category === "heykeller").length;
  categoryStats[2].count = mekanlar.filter(m => m.category === "dini-kamusal").length;
  categoryStats[3].count = mekanlar.filter(m => m.category === "tarihi-yapilar").length;
  categoryStats[4].count = mekanlar.filter(m => m.category === "spor").length;
};

// Initialize category stats
updateCategoryStats();

// ─── Direct localStorage helpers (synchronous, guaranteed) ────────────────────
const MEKANLAR_KEY = "besiktas_mekanlar_db";

const directSaveToLocalStorage = (items: PinLocation[]) => {
  if (typeof window === "undefined") return;
  const normalized = items.map(normalizePinData);
  try {
    localStorage.setItem(MEKANLAR_KEY, JSON.stringify(normalized));
    console.log(`[admin-store] ✅ Saved ${normalized.length} mekanlar to localStorage`);
  } catch (err) {
    console.warn("[admin-store] localStorage quota warning, compressing:", err);
    const slimmed = normalized.map(p => ({ ...p, images: p.images?.slice(0, 1) || [] }));
    try {
      localStorage.setItem(MEKANLAR_KEY, JSON.stringify(slimmed));
    } catch (e2) {
      console.error("[admin-store] Failed to save even after compression", e2);
    }
  }
};

// ─── Mekan CRUD ───────────────────────────────────────────────────────────────
export const getMekanlar = (): PinLocation[] => {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(MEKANLAR_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          mekanlar = parsed.map(normalizePinData);
        }
      }
    } catch (e) {
      console.error("Error reading mekanlar from localStorage:", e);
    }
  }
  return [...mekanlar];
};

export const fetchMekanlar = async (): Promise<PinLocation[]> => {
  try {
    const dbMekanlar = await fetchPinsFromDb();
    if (dbMekanlar && dbMekanlar.length > 0) {
      mekanlar = dbMekanlar;
    }
  } catch (err) {
    console.error("Error fetching mekanlar from database:", err);
  }
  return getMekanlar();
};

export const addMekan = (item: PinLocation) => {
  const normalized = normalizePinData(item);
  console.log("[admin-store] addMekan called:", normalized.id, normalized.title, normalized.category, normalized.coordinates);
  
  // 1. Read current list from localStorage
  const current = getMekanlar();
  
  // 2. Build updated list with new item
  const updated = [...current.filter(m => m.id !== normalized.id), normalized];
  
  // 3. Update in-memory store
  mekanlar = updated;
  updateCategoryStats();
  
  // 4. CRITICAL: Save ENTIRE updated list to localStorage SYNCHRONOUSLY
  directSaveToLocalStorage(updated);
  
  // 5. Async Supabase sync (fire-and-forget, localStorage is already safe)
  savePinToDb(normalized).catch((err: any) => console.error("Error saving pin to Supabase:", err));
  
  // 6. Notify other components/tabs
  notifyDataUpdated();
  
  console.log("[admin-store] addMekan complete. Total mekanlar:", updated.length);
  return normalized;
};

export const updateMekan = (id: string, updates: Partial<PinLocation>) => {
  const current = getMekanlar();
  const updatedList = current.map((m) => (m.id === id ? normalizePinData({ ...m, ...updates }) : m));
  mekanlar = updatedList;
  updateCategoryStats();
  
  // CRITICAL: Save ENTIRE updated list to localStorage SYNCHRONOUSLY
  directSaveToLocalStorage(updatedList);
  
  const updatedItem = mekanlar.find((m) => m.id === id) ?? null;
  if (updatedItem) {
    savePinToDb(updatedItem).catch((err: any) => console.error("Error updating pin in Supabase:", err));
  }
  notifyDataUpdated();
  return updatedItem;
};

export const deleteMekan = (id: string) => {
  const current = getMekanlar();
  const filtered = current.filter((m) => m.id !== id);
  mekanlar = filtered;
  updateCategoryStats();
  
  // CRITICAL: Save ENTIRE updated list to localStorage SYNCHRONOUSLY
  directSaveToLocalStorage(filtered);
  
  deletePinFromDb(id).catch((err: any) => console.error("Error deleting pin from Supabase:", err));
  notifyDataUpdated();
};

// ─── Ansiklopedi CRUD ─────────────────────────────────────────────────────────
export const getOlaylar = (): HistoricalEvent[] => {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem("besiktas_olaylar_db");
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          olaylar = parsed;
        }
      }
    } catch (e) {
      console.error("Error reading olaylar from localStorage:", e);
    }
  }
  return [...olaylar];
};

export const fetchOlaylar = async (): Promise<HistoricalEvent[]> => {
  try {
    const dbOlaylar = await fetchOlaylarFromDb();
    if (dbOlaylar && dbOlaylar.length > 0) {
      olaylar = dbOlaylar;
    }
  } catch (err) {
    console.error("Error fetching olaylar from database:", err);
  }
  return [...olaylar];
};

export const addOlay = (item: HistoricalEvent) => {
  olaylar = [...olaylar, item];
  notifyDataUpdated();
  // Async background sync with Supabase
  saveOlayToDb(item).catch((err: any) => console.error("Error saving olay to database:", err));
  return item;
};

export const updateOlay = (id: string, updates: Partial<HistoricalEvent>) => {
  olaylar = olaylar.map((o) => (o.id === id ? { ...o, ...updates } : o));
  notifyDataUpdated();
  const updated = olaylar.find((o) => o.id === id) ?? null;
  if (updated) {
    saveOlayToDb(updated).catch((err: any) => console.error("Error updating olay in database:", err));
  }
  return updated;
};

export const deleteOlay = (id: string) => {
  olaylar = olaylar.filter((o) => o.id !== id);
  notifyDataUpdated();
  deleteOlayFromDb(id).catch((err: any) => console.error("Error deleting olay from database:", err));
};

// ─── User CRUD ────────────────────────────────────────────────────────────────
export const getUsers = () => [...users];

export const addUser = (item: AdminUserRecord) => {
  users = [...users, item];
  return item;
};

export const updateUser = (id: string, updates: Partial<AdminUserRecord>) => {
  users = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
  return users.find((u) => u.id === id) ?? null;
};

export const deleteUser = (id: string) => {
  users = users.filter((u) => u.id !== id);
};

// ─── KPI Summaries ────────────────────────────────────────────────────────────
export const getKpiStats = () => ({
  totalMekanlar:  mekanlar.length,
  totalOlaylar:   olaylar.length,
  totalUsers:     users.length,
  activeUsers:    users.filter((u) => u.status === "active").length,
  thisMonthVisits: monthlyVisits[monthlyVisits.length - 1].visits,
  lastMonthVisits: monthlyVisits[monthlyVisits.length - 2].visits,
});
