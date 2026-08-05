import { supabase, isSupabaseConfigured } from './supabase';
import { besiktasPinData, PinLocation } from '@/data/besiktasPinData';

const LOCAL_STORAGE_KEY = 'besiktas_mekanlar_db';

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
        // Table exists but is empty. Pre-populate it with the default values.
        console.log('Supabase table is empty, pre-populating with default pins...');
        const initialPins = getLocalMekanlar();
        for (const pin of initialPins) {
          await supabase.from('mekanlar').insert(pin);
        }
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
