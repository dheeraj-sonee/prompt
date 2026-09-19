/**
 * Senior-safe persistence utility for CompanionCare AI
 * Keeps user settings, taken medications, and accessibility preferences synced across device reloads
 */
import { AccessibilitySettings, Medication } from '../types';

const SETTINGS_KEY = 'companioncare_settings_v1';
const MEDS_KEY = 'companioncare_meds_v1';

export function loadStoredSettings(defaultSettings: AccessibilitySettings): AccessibilitySettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return {
      fontScale: parsed.fontScale ?? defaultSettings.fontScale,
      theme: parsed.theme ?? defaultSettings.theme,
      speechSpeed: parsed.speechSpeed ?? defaultSettings.speechSpeed,
      audioBoost: parsed.audioBoost ?? defaultSettings.audioBoost,
      liveCaptions: parsed.liveCaptions ?? defaultSettings.liveCaptions,
    };
  } catch {
    return defaultSettings;
  }
}

export function saveStoredSettings(settings: AccessibilitySettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Gracefully handle private browsing storage quota
  }
}

export function loadStoredMedications(defaultMeds: Medication[]): Medication[] {
  if (typeof window === 'undefined') return defaultMeds;
  try {
    const raw = localStorage.getItem(MEDS_KEY);
    if (!raw) return defaultMeds;
    const parsed: { id: string; isTaken: boolean }[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultMeds;

    // Merge taken status with default list
    const takenMap = new Map(parsed.map((item) => [item.id, item.isTaken]));
    return defaultMeds.map((med) => ({
      ...med,
      isTaken: takenMap.get(med.id) ?? med.isTaken,
    }));
  } catch {
    return defaultMeds;
  }
}

export function saveStoredMedications(meds: Medication[]): void {
  if (typeof window === 'undefined') return;
  try {
    const snapshot = meds.map((m) => ({ id: m.id, isTaken: m.isTaken }));
    localStorage.setItem(MEDS_KEY, JSON.stringify(snapshot));
  } catch {
    // Gracefully handle storage limitations
  }
}
