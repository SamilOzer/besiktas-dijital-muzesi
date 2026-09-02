import { supabase, isSupabaseConfigured } from './supabase';
import { besiktasPinData, PinLocation } from '@/data/besiktasPinData';
import { ansiklopediData, HistoricalEvent } from '@/data/ansiklopediData';

const LOCAL_STORAGE_KEY = 'besiktas_mekanlar_db';
const LOCAL_STORAGE_OLAYLAR_KEY = 'besiktas_olaylar_db';

// Cache Supabase failures — skip retries for 30 seconds after a failure
let supabaseFailedAt: number | null = null;
const SUPABASE_RETRY_DELAY_MS = 30 * 1000; // 30 seconds

const isSupabaseAvailable = (): boolean => {
  if (!isSupabaseConfigured || !supabase) return false;
  if (supabaseFailedAt && (Date.now() - supabaseFailedAt < SUPABASE_RETRY_DELAY_MS)) {
    return false;
  }
  return true;
};

const markSupabaseFailed = () => {
  supabaseFailedAt = Date.now();
  console.warn('[db-service] Supabase marked as unavailable for 5 minutes');
};

const VALID_CATEGORIES = ["heykeller", "saraylar", "tarihi-yapilar", "spor", "dini-kamusal"];

const CATEGORY_LABELS: Record<string, string> = {
  heykeller: "Heykeller & Anıtlar",
  saraylar: "Saraylar & Kasırlar",
  "tarihi-yapilar": "Tarihi Evler & Yapılar",
  spor: "Stadyum & Spor Tarihi",
  "dini-kamusal": "Dini & Kamusal Yapılar",
};

export const normalizePinData = (pin: PinLocation): PinLocation => {
  let cat = (pin.category || "").toLowerCase().trim();
  if (cat.includes("heykel") || cat.includes("anıt") || cat.includes("anit")) cat = "heykeller";
  else if (cat.includes("saray") || cat.includes("kasır") || cat.includes("kasir")) cat = "saraylar";
  else if (cat.includes("spor") || cat.includes("stadyum") || cat.includes("stad")) cat = "spor";
  else if (cat.includes("dini") || cat.includes("camii") || cat.includes("cami") || cat.includes("kamusal")) cat = "dini-kamusal";
  else if (cat.includes("tarihi") || cat.includes("yapi") || cat.includes("yapı") || cat.includes("ev") || cat.includes("konut") || cat.includes("kültür") || cat.includes("kulturel") || cat.includes("diger") || cat.includes("diğer")) cat = "tarihi-yapilar";
  else if (!VALID_CATEGORIES.includes(cat)) cat = "tarihi-yapilar";

  const VALID_PERIODS = ["1400-1600", "1600-1800", "1800-1850", "1850-1900", "1900-1960", "1960-gunumuz"];
  let period = (pin.timePeriod || "").trim();
  if (!VALID_PERIODS.includes(period)) {
    if (period.includes("osmanlı") || period.includes("klasik")) period = "1400-1600";
    else if (period.includes("orta")) period = "1600-1800";
    else if (period.includes("tanzimat") && !period.includes("hamidiye")) period = "1800-1850";
    else if (period.includes("hamidiye")) period = "1850-1900";
    else if (period.includes("cumhuriyet") || period.includes("meşrutiyet") || period.includes("1900")) period = "1900-1960";
    else if (period.includes("günümüz") || period.includes("gunumuz")) period = "1960-gunumuz";
    else period = "1900-1960";
  }

  return {
    ...pin,
    category: cat as any,
    categoryLabel: CATEGORY_LABELS[cat] || pin.categoryLabel || "Tarihi Evler & Yapılar",
    timePeriod: period as any,
    neighborhood: pin.neighborhood || "Sinanpaşa",
    coordinates: Array.isArray(pin.coordinates) && pin.coordinates.length === 2 && !isNaN(Number(pin.coordinates[0]))
      ? [Number(pin.coordinates[0]), Number(pin.coordinates[1])]
      : [41.0425, 29.0075]
  };
};

// Helper to get local data
const getLocalMekanlar = (): PinLocation[] => {
  if (typeof window === 'undefined') return besiktasPinData.map(normalizePinData);
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) {
      console.log('[db-service] localStorage empty, seeding with', besiktasPinData.length, 'defaults');
      const normalizedDefaults = besiktasPinData.map(normalizePinData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalizedDefaults));
      return normalizedDefaults;
    }
    const parsed = JSON.parse(data);
    const list = Array.isArray(parsed) ? parsed : [];
    const result = list.map(normalizePinData);
    console.log('[db-service] getLocalMekanlar: loaded', result.length, 'pins');
    return result;
  } catch (error) {
    console.error('Failed to parse local storage', error);
    return besiktasPinData.map(normalizePinData);
  }
};

const notifyDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('besiktas_data_updated'));
  }
};

// Helper to save local data
const saveLocalMekanlar = (items: PinLocation[], shouldNotify = true) => {
  if (typeof window === 'undefined') return;
  const normalized = items.map(normalizePinData);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
    if (shouldNotify) notifyDataChanged();
  } catch (error) {
    console.warn('LocalStorage quota warning, compressing image data:', error);
    const slimmed = normalized.map((p) => ({ ...p, images: p.images?.slice(0, 1) || [] }));
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(slimmed));
      if (shouldNotify) notifyDataChanged();
    } catch (e) {
      console.error('Failed to save to local storage even after compression', e);
    }
  }
};

// Helper to get local olaylar
const getLocalOlaylar = (): HistoricalEvent[] => {
  if (typeof window === 'undefined') return [...ansiklopediData];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_OLAYLAR_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_OLAYLAR_KEY, JSON.stringify(ansiklopediData));
      return [...ansiklopediData];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse local storage olaylar', error);
    return [...ansiklopediData];
  }
};

/**
 * Returns encyclopedia content synchronously so the page never waits on the
 * network before showing useful information.
 */
export const getCachedOlaylar = (): HistoricalEvent[] => getLocalOlaylar();

// Helper to save local olaylar
const saveLocalOlaylar = (items: HistoricalEvent[], shouldNotify = true) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_OLAYLAR_KEY, JSON.stringify(items));
    if (shouldNotify) notifyDataChanged();
  } catch (error) {
    console.error('Failed to save to local storage olaylar', error);
  }
};

/**
 * Fetches all map pins (mekanlar) from Supabase if configured.
 * Always merges local pins so newly added pins are never lost.
 */
export const fetchPinsFromDb = async (): Promise<PinLocation[]> => {
  const localList = getLocalMekanlar();
  console.log('[db-service] fetchPinsFromDb: localList has', localList.length, 'pins. Supabase available:', isSupabaseAvailable());

  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase!
        .from('mekanlar')
        .select('*')
        .order('title', { ascending: true });

      if (error) {
        console.warn('[db-service] Supabase query error:', error.message);
        markSupabaseFailed();
      }

      if (!error && data && data.length > 0) {
        console.log('[db-service] Supabase returned', data.length, 'pins');
        const dbPins = data.map((item: any) => ({
          ...item,
          // Supabase lowercases unquoted camelCase cols — map them explicitly
          categoryLabel: item.categoryLabel || item.categorylabel || '',
          fullHistory: item.fullHistory || item.fullhistory || item.description || '',
          timePeriod: item.timePeriod || item.timeperiod || '1900-1960',
          // Ensure description is always available for the edit form
          description: item.description || item.fullHistory || item.fullhistory || '',
          coordinates: Array.isArray(item.coordinates)
            ? [Number(item.coordinates[0]), Number(item.coordinates[1])]
            : [41.043, 29.005],
          images: Array.isArray(item.images) ? item.images : []
        })) as PinLocation[];
        
        // Auto-sync any locally created pins that didn't reach Supabase yet
        const localOnlyPins = localList.filter((lp) => !dbPins.some((dp) => dp.id === lp.id));
        if (localOnlyPins.length > 0) {
          console.log('[db-service] Found', localOnlyPins.length, 'local-only pins. Auto-syncing to Supabase...');
          localOnlyPins.forEach((lp) => {
            savePinToDb(lp).catch((err) => console.warn('[db-service] Failed to auto-sync local pin:', err));
          });
          const combined = [...dbPins, ...localOnlyPins];
          saveLocalMekanlar(combined, false);
          return combined.map(normalizePinData);
        }

        console.log('[db-service] Returning', dbPins.length, 'pins directly from Supabase');
        saveLocalMekanlar(dbPins, false);
        return dbPins.map(normalizePinData);
      } else {
        console.log('[db-service] Supabase returned 0 pins, using localStorage');
      }
    } catch (e) {
      console.warn('[db-service] Network error, falling back to local storage:', e);
      markSupabaseFailed();
    }
  }
  console.log('[db-service] Returning', localList.length, 'pins from localStorage');
  return localList.map(normalizePinData);
};

/**
 * Saves (inserts or updates) a pin in Supabase if configured.
 * Also persists changes in local storage.
 */
export const savePinToDb = async (pin: PinLocation): Promise<PinLocation> => {
  const normalizedPin = normalizePinData(pin);
  const localList = getLocalMekanlar();
  const index = localList.findIndex((item) => item.id === normalizedPin.id);
  if (index !== -1) {
    localList[index] = normalizedPin;
  } else {
    localList.push(normalizedPin);
  }
  saveLocalMekanlar(localList);

  if (isSupabaseAvailable()) {
    try {
      const descriptionText = normalizedPin.description || normalizedPin.fullHistory || normalizedPin.summary || '';
      const { error } = await supabase!
        .from('mekanlar')
        .upsert({
          id: normalizedPin.id,
          title: normalizedPin.title,
          category: normalizedPin.category,
          // Use quoted names to preserve camelCase in PostgreSQL
          'categoryLabel': normalizedPin.categoryLabel,
          coordinates: normalizedPin.coordinates,
          summary: normalizedPin.summary || descriptionText.slice(0, 200),
          // Store in BOTH fullHistory and description so any reader finds the text
          'fullHistory': descriptionText,
          description: descriptionText,
          images: normalizedPin.images || [],
          era: normalizedPin.era || null,
          address: normalizedPin.address || null,
          'timePeriod': normalizedPin.timePeriod,
          neighborhood: normalizedPin.neighborhood
        });

      if (error) {
        console.error('Supabase upsert error:', error.message);
        markSupabaseFailed();
      }
    } catch (e) {
      console.error('Network error during Supabase upsert:', e);
      markSupabaseFailed();
    }
  }

  return normalizedPin;
};

/**
 * Deletes a pin from Supabase if configured.
 * Also removes from local storage.
 */
export const deletePinFromDb = async (id: string): Promise<void> => {
  const localList = getLocalMekanlar().filter((item) => item.id !== id);
  saveLocalMekanlar(localList);

  if (isSupabaseAvailable()) {
    try {
      const { error } = await supabase!
        .from('mekanlar')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error.message);
        markSupabaseFailed();
      }
    } catch (e) {
      console.error('Network error during Supabase delete:', e);
      markSupabaseFailed();
    }
  }
};

/**
 * Fetches all ansiklopedi olaylar from Supabase if configured.
 * Always merges local events so newly added events are never lost.
 */
export const fetchOlaylarFromDb = async (): Promise<HistoricalEvent[]> => {
  const localList = getLocalOlaylar();

  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase!
        .from('olaylar')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        markSupabaseFailed();
      }

      if (!error && data && data.length > 0) {
        const dbOlaylar = data.map((item: any) => ({
          ...item,
          tags: Array.isArray(item.tags) ? item.tags : [],
          images: Array.isArray(item.images) ? item.images : [],
        })) as HistoricalEvent[];

        const localOnlyOlaylar = localList.filter((lo) => !dbOlaylar.some((doItem) => doItem.id === lo.id));
        if (localOnlyOlaylar.length > 0) {
          console.log('[db-service] Found', localOnlyOlaylar.length, 'local-only olaylar. Auto-syncing to Supabase...');
          localOnlyOlaylar.forEach((lo) => {
            saveOlayToDb(lo).catch((err) => console.warn('[db-service] Failed to auto-sync local olay:', err));
          });
          const combined = [...dbOlaylar, ...localOnlyOlaylar];
          saveLocalOlaylar(combined, false);
          return combined;
        }

        saveLocalOlaylar(dbOlaylar, false);
        return dbOlaylar;
      }
    } catch (e) {
      console.warn('Network error fetching olaylar, falling back to local storage:', e);
      markSupabaseFailed();
    }
  }
  return localList;
};

/**
 * Saves (inserts or updates) an olay in Supabase if configured.
 * Also persists changes in local storage.
 */
export const saveOlayToDb = async (olay: HistoricalEvent): Promise<HistoricalEvent> => {
  const localList = getLocalOlaylar();
  const index = localList.findIndex((item) => item.id === olay.id);
  if (index !== -1) {
    localList[index] = olay;
  } else {
    localList.push(olay);
  }
  saveLocalOlaylar(localList);

  if (isSupabaseAvailable()) {
    try {
      const { error } = await supabase!
        .from('olaylar')
        .upsert({
          id: olay.id,
          title: olay.title,
          date: olay.date,
          era: olay.era,
          category: olay.category,
          categoryLabel: olay.categoryLabel,
          summary: olay.summary,
          fullText: olay.fullText || null,
          description: olay.description || null,
          location: olay.location || null,
          image: olay.image || null,
          images: olay.images || [],
          tags: olay.tags || []
        });

      if (error) {
        console.error('Supabase upsert olay error:', error.message);
        markSupabaseFailed();
      }
    } catch (e) {
      console.error('Network error during Supabase upsert olay:', e);
      markSupabaseFailed();
    }
  }

  return olay;
};

/**
 * Deletes an olay from Supabase if configured.
 * Also removes from local storage.
 */
export const deleteOlayFromDb = async (id: string): Promise<void> => {
  const localList = getLocalOlaylar().filter((item) => item.id !== id);
  saveLocalOlaylar(localList);

  if (isSupabaseAvailable()) {
    try {
      const { error } = await supabase!
        .from('olaylar')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete olay error:', error.message);
        markSupabaseFailed();
      }
    } catch (e) {
      console.error('Network error during Supabase delete olay:', e);
      markSupabaseFailed();
    }
  }
};
