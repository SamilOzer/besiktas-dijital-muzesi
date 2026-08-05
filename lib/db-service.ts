import { supabase, isSupabaseConfigured } from './supabase';
import { besiktasPinData, PinLocation } from '@/data/besiktasPinData';
import { ansiklopediData, HistoricalEvent } from '@/data/ansiklopediData';

const LOCAL_STORAGE_KEY = 'besiktas_mekanlar_db';
const LOCAL_STORAGE_OLAYLAR_KEY = 'besiktas_olaylar_db';

// Helper to get local data
const getLocalMekanlar = (): PinLocation[] => {
  if (typeof window === 'undefined') return besiktasPinData;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      // Initialize local storage with default data
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(besiktasPinData));
      return besiktasPinData;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse local storage', error);
    return besiktasPinData;
  }
};

// Helper to save local data
const saveLocalMekanlar = (items: PinLocation[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save to local storage', error);
  }
};

// Helper to get local olaylar
const getLocalOlaylar = (): HistoricalEvent[] => {
  if (typeof window === 'undefined') return [...ansiklopediData];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_OLAYLAR_KEY);
    if (!data) return [...ansiklopediData];
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
  } catch (error) {
    console.error('Failed to save to local storage olaylar', error);
  }
};

/**
 * Fetches all map pins (mekanlar) from Supabase if configured.
 * Otherwise, falls back to browser localStorage (and ultimately default data).
 */
export const fetchPinsFromDb = async (): Promise<PinLocation[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('mekanlar')
        .select('*')
        .order('title', { ascending: true });

      if (error) {
        console.warn('Supabase fetch error, falling back to local storage:', error.message);
        return getLocalMekanlar();
      }

      if (data && data.length > 0) {
        const pins = data.map((item: any) => ({
          ...item,
          coordinates: Array.isArray(item.coordinates) 
            ? [Number(item.coordinates[0]), Number(item.coordinates[1])] 
            : [41.043, 29.005],
          images: Array.isArray(item.images) ? item.images : []
        })) as PinLocation[];
        
        saveLocalMekanlar(pins);
        return pins;
      } else {
        console.log('Supabase mekanlar table is empty, seeding with default pins...');
        const initialPins = getLocalMekanlar();
        supabase.from('mekanlar').upsert(initialPins).then(({ error }) => {
          if (error) console.warn('Supabase seed error:', error.message);
        });
        return initialPins;
      }
    } catch (e) {
      console.warn('Network error, falling back to local storage:', e);
      return getLocalMekanlar();
    }
  }
  return getLocalMekanlar();
};

/**
 * Saves (inserts or updates) a pin in Supabase if configured.
 * Also persists changes in local storage.
 */
export const savePinToDb = async (pin: PinLocation): Promise<PinLocation> => {
  const localList = getLocalMekanlar();
  const index = localList.findIndex((item) => item.id === pin.id);
  if (index !== -1) {
    localList[index] = pin;
  } else {
    localList.push(pin);
  }
  saveLocalMekanlar(localList);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('mekanlar')
        .upsert({
          id: pin.id,
          title: pin.title,
          category: pin.category,
          categoryLabel: pin.categoryLabel,
          coordinates: pin.coordinates,
          summary: pin.summary,
          fullHistory: pin.fullHistory,
          images: pin.images,
          era: pin.era || null,
          address: pin.address || null,
          description: pin.description || null,
          timePeriod: pin.timePeriod,
          neighborhood: pin.neighborhood
        });

      if (error) {
        console.error('Supabase upsert error:', error.message);
      }
    } catch (e) {
      console.error('Network error during Supabase upsert:', e);
    }
  }

  return pin;
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
 * Otherwise, falls back to browser localStorage.
 */
export const fetchOlaylarFromDb = async (): Promise<HistoricalEvent[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('olaylar')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.warn('Supabase fetch olaylar error, falling back to local storage:', error.message);
        return getLocalOlaylar();
      }

      if (data && data.length > 0) {
        const olaylar = data.map((item: any) => ({
          ...item,
          tags: Array.isArray(item.tags) ? item.tags : [],
          images: Array.isArray(item.images) ? item.images : [],
        })) as HistoricalEvent[];
        
        saveLocalOlaylar(olaylar);
        return olaylar;
      } else {
        console.log('Supabase olaylar table is empty, seeding with default events...');
        const initialEvents = getLocalOlaylar();
        supabase.from('olaylar').upsert(initialEvents).then(({ error }) => {
          if (error) console.warn('Supabase olaylar seed error:', error.message);
        });
        return initialEvents;
      }
    } catch (e) {
      console.warn('Network error fetching olaylar, falling back to local storage:', e);
      return getLocalOlaylar();
    }
  }
  return getLocalOlaylar();
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