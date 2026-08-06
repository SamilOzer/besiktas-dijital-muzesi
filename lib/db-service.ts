import { supabase, isSupabaseConfigured } from './supabase';
import { besiktasPinData, PinLocation } from '@/data/besiktasPinData';
import { ansiklopediData, HistoricalEvent } from '@/data/ansiklopediData';

const LOCAL_STORAGE_KEY = 'besiktas_mekanlar_db';
const LOCAL_STORAGE_OLAYLAR_KEY = 'besiktas_olaylar_db';

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
      const normalizedDefaults = besiktasPinData.map(normalizePinData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalizedDefaults));
      return normalizedDefaults;
    }
    const parsed = JSON.parse(data);
    return (Array.isArray(parsed) ? parsed : besiktasPinData).map(normalizePinData);
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

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('mekanlar')
        .select('*')
        .order('title', { ascending: true });

      if (!error && data && data.length > 0) {
        const dbPins = data.map((item: any) => ({
          ...item,
          coordinates: Array.isArray(item.coordinates) 
            ? [Number(item.coordinates[0]), Number(item.coordinates[1])] 
            : [41.043, 29.005],
          images: Array.isArray(item.images) ? item.images : []
        })) as PinLocation[];
        
        // Merge dbPins and localList without duplicating IDs
        const mergedList = [...dbPins];
        localList.forEach((lp) => {
          if (!mergedList.some((dp) => dp.id === lp.id)) {
            mergedList.push(lp);
          }
        });

        saveLocalMekanlar(mergedList);
        return mergedList.map(normalizePinData);
      }
    } catch (e) {
      console.warn('Network error, falling back to local storage:', e);
    }
  }
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

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
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
      }
    } catch (e) {
      console.error('Network error during Supabase upsert:', e);
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

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('mekanlar')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error.message);
      }
    } catch (e) {
      console.error('Network error during Supabase delete:', e);
    }
  }
};

/**
 * Fetches all ansiklopedi olaylar from Supabase if configured.
 * Always merges local events so newly added events are never lost.
 */
export const fetchOlaylarFromDb = async (): Promise<HistoricalEvent[]> => {
  const localList = getLocalOlaylar();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('olaylar')
        .select('*')
        .order('date', { ascending: false });

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

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
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
      }
    } catch (e) {
      console.error('Network error during Supabase upsert olay:', e);
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

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('olaylar')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete olay error:', error.message);
      }
    } catch (e) {
      console.error('Network error during Supabase delete olay:', e);
    }
  }
};