import { supabase, isSupabaseConfigured } from './supabase';
import { besiktasPinData, PinLocation } from '@/data/besiktasPinData';
import { ansiklopediData, HistoricalEvent } from '@/data/ansiklopediData';

const LOCAL_STORAGE_KEY = 'besiktas_mekanlar_db';
const LOCAL_STORAGE_OLAYLAR_KEY = 'besiktas_olaylar_db';

// Cache Supabase failures — skip retries for 5 minutes after a failure
let supabaseFailedAt: number | null = null;
const SUPABASE_RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes

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

export const normalizePinData = (pin: PinLocation): PinLocation => {
  let cat = (pin.category || "").toLowerCase().trim();
  if (cat.includes("heykel") || cat.includes("anıt")) cat = "heykeller";
  else if (cat.includes("saray") || cat.includes("kasır")) cat = "saraylar";
  else if (cat.includes("spor") || cat.includes("stadyum")) cat = "spor";
  else if (cat.includes("dini") || cat.includes("camii") || cat.includes("kamusal")) cat = "dini-kamusal";
  else if (!VALID_CATEGORIES.includes(cat)) cat = "tarihi-yapilar";

  let period = (pin.timePeriod || "").trim();
  if (period.includes("osmanlı") || period.includes("klasik")) period = "1400-1600";
  else if (period.includes("orta")) period = "1600-1800";
  else if (period.includes("tanzimat") && !period.includes("hamidiye")) period = "1800-1850";
  else if (period.includes("hamidiye")) period = "1850-1900";
  else if (period.includes("cumhuriyet") || period.includes("meşrutiyet")) period = "1900-1960";
  else if (!["1400-1600","1600-1800","1800-1850","1850-1900","1900-1960"].includes(period)) period = "1900-1960";

  return {
    ...pin,
    category: cat as any,
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
    const result = (Array.isArray(parsed) ? parsed : besiktasPinData).map(normalizePinData);
    console.log('[db-service] getLocalMekanlar: loaded', result.length, 'pins from localStorage');
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
const saveLocalMekanlar = (items: PinLocation[]) => {
  if (typeof window === 'undefined') return;
  const normalized = items.map(normalizePinData);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
    notifyDataChanged();
  } catch (error) {
    console.warn('LocalStorage quota warning, compressing image data:', error);
    const slimmed = normalized.map((p) => ({ ...p, images: p.images?.slice(0, 1) || [] }));
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(slimmed));
      notifyDataChanged();
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

// Helper to save local olaylar
const saveLocalOlaylar = (items: HistoricalEvent[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_OLAYLAR_KEY, JSON.stringify(items));
    notifyDataChanged();
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
          coordinates: Array.isArray(item.coordinates) 
            ? [Number(item.coordinates[0]), Number(item.coordinates[1])] 
            : [41.043, 29.005],
          images: Array.isArray(item.images) ? item.images : []
        })) as PinLocation[];
        
        // Merge dbPins and localList without duplicating IDs
        const mergedList = [...dbPins];
        let localOnlyCount = 0;
        localList.forEach((lp) => {
          if (!mergedList.some((dp) => dp.id === lp.id)) {
            mergedList.push(lp);
            localOnlyCount++;
          }
        });
        console.log('[db-service] Merged list:', mergedList.length, 'pins (', localOnlyCount, 'local-only)');

        saveLocalMekanlar(mergedList);
        return mergedList.map(normalizePinData);
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
      const { error } = await supabase!
        .from('mekanlar')
        .upsert({
          id: normalizedPin.id,
          title: normalizedPin.title,
          category: normalizedPin.category,
          categoryLabel: normalizedPin.categoryLabel,
          coordinates: normalizedPin.coordinates,
          summary: normalizedPin.summary,
          fullHistory: normalizedPin.fullHistory,
          images: normalizedPin.images,
          era: normalizedPin.era || null,
          address: normalizedPin.address || null,
          description: normalizedPin.description || null,
          timePeriod: normalizedPin.timePeriod,
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

        const mergedList = [...dbOlaylar];
        localList.forEach((lo) => {
          if (!mergedList.some((doItem) => doItem.id === lo.id)) {
            mergedList.push(lo);
          }
        });
        
        saveLocalOlaylar(mergedList);
        return mergedList;
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