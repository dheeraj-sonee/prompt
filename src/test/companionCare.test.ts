import { describe, it, expect, beforeEach, vi } from 'vitest';
import { INITIAL_MEDICATIONS, INITIAL_ROUTINE, INITIAL_CONTACTS } from '../data/initialData';
import { setSpeechOptions, speakText, stopSpeaking, announceToScreenReader } from '../utils/speech';
import { loadStoredSettings, saveStoredSettings, loadStoredMedications, saveStoredMedications } from '../utils/storage';
import { AccessibilitySettings, Medication } from '../types';

describe('Accessibility & Settings Management', () => {
  const defaultSettings: AccessibilitySettings = {
    fontScale: 100,
    theme: 'standard',
    speechSpeed: 1.0,
    audioBoost: false,
    liveCaptions: true,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('correctly loads default settings when local storage is empty', () => {
    const loaded = loadStoredSettings(defaultSettings);
    expect(loaded.fontScale).toBe(100);
    expect(loaded.theme).toBe('standard');
    expect(loaded.speechSpeed).toBe(1.0);
    expect(loaded.audioBoost).toBe(false);
    expect(loaded.liveCaptions).toBe(true);
  });

  it('persists and restores custom accessibility settings', () => {
    const updated: AccessibilitySettings = {
      fontScale: 130,
      theme: 'yellow-black',
      speechSpeed: 0.75,
      audioBoost: true,
      liveCaptions: true,
    };
    saveStoredSettings(updated);

    const reloaded = loadStoredSettings(defaultSettings);
    expect(reloaded.fontScale).toBe(130);
    expect(reloaded.theme).toBe('yellow-black');
    expect(reloaded.speechSpeed).toBe(0.75);
    expect(reloaded.audioBoost).toBe(true);
  });
});

describe('Medication Schedule & Dosage State', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads initial medication list with correct dosage and timings', () => {
    expect(INITIAL_MEDICATIONS.length).toBeGreaterThanOrEqual(4);
    const morningMed = INITIAL_MEDICATIONS.find((m) => m.timingCategory === 'morning');
    expect(morningMed).toBeDefined();
    expect(morningMed?.name).toContain('Aspirin');
    expect(morningMed?.dosage).toBe('81mg');
  });

  it('persists medication taken status without losing medication properties', () => {
    const meds: Medication[] = [...INITIAL_MEDICATIONS];
    meds[0] = { ...meds[0], isTaken: true };
    saveStoredMedications(meds);

    const reloaded = loadStoredMedications(INITIAL_MEDICATIONS);
    expect(reloaded[0].isTaken).toBe(true);
    expect(reloaded[0].name).toBe(INITIAL_MEDICATIONS[0].name);
    expect(reloaded[1].isTaken).toBe(false);
  });
});

describe('Emergency SOS & Care Safety Contacts', () => {
  it('verifies primary emergency contact is established with valid phone number', () => {
    const primaryContact = INITIAL_CONTACTS.find((c) => c.role === 'primary');
    expect(primaryContact).toBeDefined();
    expect(primaryContact?.name).toBe('Sarah Vance');
    expect(primaryContact?.phone).toBe('(555) 234-8910');
  });

  it('ensures cardiologist contact is available for telehealth dispatch', () => {
    const doctor = INITIAL_CONTACTS.find((c) => c.role === 'physician');
    expect(doctor).toBeDefined();
    expect(doctor?.name).toContain('Dr. Harrison');
  });
});

describe('Speech Synthesis & Screen Reader Announcements', () => {
  it('updates speech speed and audio boost configuration without error', () => {
    expect(() => setSpeechOptions(1.25, true)).not.toThrow();
  });

  it('calls stopSpeaking safely when window.speechSynthesis is available', () => {
    expect(() => stopSpeaking()).not.toThrow();
  });

  it('announces messages to screen reader live regions', () => {
    document.body.innerHTML = '<div id="sr-announcements" aria-live="polite"></div>';
    announceToScreenReader('Taking medication Aspirin');
    const el = document.getElementById('sr-announcements');
    expect(el?.textContent).toBe('Taking medication Aspirin');
  });
});
