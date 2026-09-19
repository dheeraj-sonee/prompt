import React, { useState, useEffect } from 'react';
import {
  AccessibilitySettings,
  CareContact,
  Medication,
  NavigationTab,
  RoutineActivity,
  ScannedDocument,
  VisualTheme,
} from './types';
import {
  INITIAL_CONTACTS,
  INITIAL_DOCUMENTS,
  INITIAL_MEDICATIONS,
  INITIAL_ROUTINE,
} from './data/initialData';
import { Header } from './components/Header';
import { DailyOverview } from './components/DailyOverview';
import { MedicationsView } from './components/MedicationsView';
import { CareCircleView } from './components/CareCircleView';
import { HealthWellnessView } from './components/HealthWellnessView';
import { AICompanionView } from './components/AICompanionView';
import { PreferencesView } from './components/PreferencesView';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { PillScannerModal } from './components/PillScannerModal';
import { DocumentScannerModal } from './components/DocumentScannerModal';
import { VideoCallModal } from './components/VideoCallModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { setSpeechOptions, speakText, stopSpeaking } from './utils/speech';
import {
  loadStoredSettings,
  saveStoredSettings,
  loadStoredMedications,
  saveStoredMedications,
} from './utils/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('daily-overview');
  const [companionInitialPrompt, setCompanionInitialPrompt] = useState<string | undefined>(undefined);

  // Initialize with persisted storage if available
  const [settings, setSettings] = useState<AccessibilitySettings>(() =>
    loadStoredSettings({
      fontScale: 100,
      theme: 'standard',
      speechSpeed: 1.0,
      audioBoost: false,
      liveCaptions: true,
    })
  );

  const [medications, setMedications] = useState<Medication[]>(() =>
    loadStoredMedications(INITIAL_MEDICATIONS)
  );
  const [routine, setRoutine] = useState<RoutineActivity[]>(INITIAL_ROUTINE);
  const [contacts, setContacts] = useState<CareContact[]>(INITIAL_CONTACTS);
  const [documents, setDocuments] = useState<ScannedDocument[]>(INITIAL_DOCUMENTS);

  // Modals
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isBottleScannerOpen, setIsBottleScannerOpen] = useState(false);
  const [isDocScannerOpen, setIsDocScannerOpen] = useState(false);
  const [activeVideoContact, setActiveVideoContact] = useState<CareContact | null>(null);

  // Persist settings whenever changed
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Persist medications whenever changed
  useEffect(() => {
    saveStoredMedications(medications);
  }, [medications]);

  // Apply visual theme & font scale classes to document element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-scale-100', 'font-scale-115', 'font-scale-130');
    root.classList.add(`font-scale-${settings.fontScale}`);

    document.body.classList.remove('theme-high-contrast', 'theme-yellow-black');
    if (settings.theme === 'high-contrast') {
      document.body.classList.add('theme-high-contrast');
    } else if (settings.theme === 'yellow-black') {
      document.body.classList.add('theme-yellow-black');
    }

    setSpeechOptions(settings.speechSpeed, settings.audioBoost);
  }, [settings]);

  // Senior-friendly keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Emergency SOS shortcut: Alt + S
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setIsSOSOpen(true);
        return;
      }

      // Quick read current tab: Alt + R
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        const tabNames: Record<NavigationTab, string> = {
          'daily-overview': 'Daily Overview and today’s schedule',
          'medication-schedule': 'Medication Schedule and pill dispenser',
          'care-circle': 'Care Circle family and doctor contacts',
          'health-wellness': 'Health and Wellness vitals dashboard',
          'companion-chat': 'AI Voice Companion assistant',
          'accessibility-settings': 'Accessibility and preferences settings',
        };
        speakText(`Currently viewing ${tabNames[currentTab]}`);
        return;
      }

      // Quick tab switching: Alt + 1 through Alt + 6
      if (e.altKey && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        const tabs: NavigationTab[] = [
          'daily-overview',
          'medication-schedule',
          'care-circle',
          'health-wellness',
          'companion-chat',
          'accessibility-settings',
        ];
        const index = parseInt(e.key, 10) - 1;
        if (tabs[index]) {
          setCurrentTab(tabs[index]);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopSpeaking();
    };
  }, [currentTab]);

  const handleUpdateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleSetTheme = (theme: VisualTheme) => {
    handleUpdateSettings({ theme });
  };

  const handleSetSpeechSpeed = (speechSpeed: number) => {
    handleUpdateSettings({ speechSpeed: speechSpeed as any });
  };

  const handleToggleAudioBoost = () => {
    handleUpdateSettings({ audioBoost: !settings.audioBoost });
  };

  const handleMarkMedTaken = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isTaken: !m.isTaken } : m))
    );
  };

  const handleBottleVerified = (medName: string) => {
    setMedications((prev) =>
      prev.map((m) =>
        m.name.toLowerCase().includes(medName.toLowerCase()) ? { ...m, isTaken: true } : m
      )
    );
    speakText(`Verified and confirmed dose of ${medName} taken.`);
  };

  const handleSaveDocument = (doc: { title: string; originalText: string; easySummary: string }) => {
    const newDoc: ScannedDocument = {
      id: `doc-${Date.now()}`,
      title: doc.title,
      dateScanned: 'Just now',
      originalText: doc.originalText,
      easySummary: doc.easySummary,
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleStartVideoCall = (contact: CareContact) => {
    setActiveVideoContact(contact);
  };

  const handlePlayVoiceNote = (contact: CareContact) => {
    if (contact.voiceNoteTranscript) {
      speakText(`Voice note from ${contact.name}: ${contact.voiceNoteTranscript}`);
    } else {
      speakText(`${contact.name} has no voice message recorded.`);
    }
  };

  const handleOpenAICompanion = (initialPrompt?: string) => {
    setCompanionInitialPrompt(initialPrompt);
    setCurrentTab('companion-chat');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2f] flex flex-col selection:bg-[#dce1ff]">
        {/* Accessible Skip Link for Keyboard & Screen Readers */}
        <a
          href="#main-content"
          className="skip-link px-6 py-3 rounded-2xl bg-[#1d4ed8] text-white font-bold text-[18px] shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-300"
        >
          Skip to Main Content (Alt+1 for Daily Overview)
        </a>

        {/* Accessible Screen Reader Live Announcements Portal */}
        <div
          id="sr-announcements"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        ></div>

        {/* Persistent Accessible Top Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onTriggerSOS={() => setIsSOSOpen(true)}
        />

        {/* Main Content Area with top offset for fixed header */}
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-40 outline-none"
        >
          {currentTab === 'daily-overview' && (
            <DailyOverview
              medications={medications}
              routine={routine}
              contacts={contacts}
              documents={documents}
              visualTheme={settings.theme}
              speechSpeed={settings.speechSpeed}
              audioBoost={settings.audioBoost}
              onSetTheme={handleSetTheme}
              onSetSpeechSpeed={handleSetSpeechSpeed}
              onToggleAudioBoost={handleToggleAudioBoost}
              onMarkMedTaken={handleMarkMedTaken}
              onOpenBottleScanner={() => setIsBottleScannerOpen(true)}
              onOpenDocScanner={() => setIsDocScannerOpen(true)}
              onStartVideoCall={handleStartVideoCall}
              onPlayVoiceNote={handlePlayVoiceNote}
              onOpenAICompanion={handleOpenAICompanion}
            />
          )}

          {currentTab === 'medication-schedule' && (
            <MedicationsView
              medications={medications}
              onMarkTaken={handleMarkMedTaken}
              onOpenBottleScanner={() => setIsBottleScannerOpen(true)}
              onAddMedication={(newMed) => setMedications((prev) => [...prev, newMed])}
            />
          )}

          {currentTab === 'care-circle' && (
            <CareCircleView
              contacts={contacts}
              onStartVideoCall={handleStartVideoCall}
              onPlayVoiceNote={handlePlayVoiceNote}
            />
          )}

          {currentTab === 'health-wellness' && <HealthWellnessView />}

          {currentTab === 'companion-chat' && (
            <AICompanionView initialPrompt={companionInitialPrompt} />
          )}

          {currentTab === 'accessibility-settings' && (
            <PreferencesView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </main>

        {/* Emergency SOS Modal */}
        <EmergencySOSModal
          isOpen={isSOSOpen}
          onClose={() => setIsSOSOpen(false)}
        />

        {/* Pill Bottle Verification Scanner Modal */}
        <PillScannerModal
          isOpen={isBottleScannerOpen}
          onClose={() => setIsBottleScannerOpen(false)}
          onVerified={handleBottleVerified}
        />

        {/* Document OCR & AI Reader Modal */}
        <DocumentScannerModal
          isOpen={isDocScannerOpen}
          onClose={() => setIsDocScannerOpen(false)}
          onSaveDocument={handleSaveDocument}
        />

        {/* 1-Tap Encrypted Video Call Modal */}
        <VideoCallModal
          isOpen={!!activeVideoContact}
          contactName={activeVideoContact?.name || 'Sarah Vance'}
          contactRole={activeVideoContact?.relation || 'Daughter'}
          onClose={() => setActiveVideoContact(null)}
        />
      </div>
    </ErrorBoundary>
  );
}
