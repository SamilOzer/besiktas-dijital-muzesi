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
 * Fetches map pins.
 */
export const fetchPinsFromDb = async (): Promise<PinLocation[]> => {
  return getLocalMekanlar();
};

/**
 * Saves a pin in local storage.
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
  return pin;
};

/**
 * Deletes a pin from local storage.
 */
export const deletePinFromDb = async (id: string): Promise<void> => {
  const localList = getLocalMekanlar().filter((item) => item.id !== id);
  saveLocalMekanlar(localList);
};

/**
 * Fetches ansiklopedi olaylar.
 */
export const fetchOlaylarFromDb = async (): Promise<HistoricalEvent[]> => {
  return getLocalOlaylar();
};

/**
 * Saves an olay in local storage.
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
  return olay;
};

/**
 * Deletes an olay from local storage.
 */
export const deleteOlayFromDb = async (id: string): Promise<void> => {
  const localList = getLocalOlaylar().filter((item) => item.id !== id);
  saveLocalOlaylar(localList);
};