import React, { useState } from 'react';
import { CareContact, Medication, RoutineActivity, ScannedDocument, VisualTheme } from '../types';
import { speakText, setSpeechOptions } from '../utils/speech';

interface DailyOverviewProps {
  medications: Medication[];
  routine: RoutineActivity[];
  contacts: CareContact[];
  documents: ScannedDocument[];
  visualTheme: VisualTheme;
  speechSpeed: number;
  audioBoost: boolean;
  onSetTheme: (theme: VisualTheme) => void;
  onSetSpeechSpeed: (speed: number) => void;
  onToggleAudioBoost: () => void;
  onMarkMedTaken: (id: string) => void;
  onOpenBottleScanner: () => void;
  onOpenDocScanner: () => void;
  onStartVideoCall: (contact: CareContact) => void;
  onPlayVoiceNote: (contact: CareContact) => void;
  onOpenAICompanion: (initialPrompt?: string) => void;
}

export const DailyOverview: React.FC<DailyOverviewProps> = ({
  medications,
  routine,
  contacts,
  documents,
  visualTheme,
  speechSpeed,
  audioBoost,
  onSetTheme,
  onSetSpeechSpeed,
  onToggleAudioBoost,
  onMarkMedTaken,
  onOpenBottleScanner,
  onOpenDocScanner,
  onStartVideoCall,
  onPlayVoiceNote,
  onOpenAICompanion,
}) => {
  // Synchronized word-by-word readout state for banner
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number | null>(null);
  const [isReadingBanner, setIsReadingBanner] = useState(false);
  const [bannerMedTaken, setBannerMedTaken] = useState(false);

  // Floating dock transcript bubble state
  const [showTranscript, setShowTranscript] = useState(true);
  const [transcriptQuestion, setTranscriptQuestion] = useState('What time does the pharmacy close today?');
  const [transcriptAnswer, setTranscriptAnswer] = useState(
    'AI: The Valley Pharmacy on 4th Street closes at 6:00 PM today. Would you like me to call them for a refill?'
  );
  const [isListeningMic, setIsListeningMic] = useState(false);

  const bannerWords = [
    'Your',
    'morning',
    'medication',
    '(Aspirin',
    '81mg',
    '&',
    'Blood',
    'Pressure',
    'Tablet)',
    'is',
    'due',
    'with',
    'a',
    'full',
    'glass',
    'of',
    'water.',
  ];

  const handleSimulateReadAloud = () => {
    setIsReadingBanner(true);
    setSpeechOptions(speechSpeed, audioBoost);

    const fullSentence =
      'Your morning medication Aspirin 81mg and Blood Pressure Tablet is due with a full glass of water.';

    let currentIndex = 0;
    const intervalMs = Math.max(180, Math.floor(320 / speechSpeed));

    speakText(fullSentence, {
      speed: speechSpeed,
      boost: audioBoost,
      onEnd: () => {
        setIsReadingBanner(false);
        setHighlightedWordIndex(null);
      },
    });

    const interval = setInterval(() => {
      if (currentIndex < bannerWords.length) {
        setHighlightedWordIndex(currentIndex);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsReadingBanner(false);
          setHighlightedWordIndex(null);
        }, 600);
      }
    }, intervalMs);
  };

  const handleMarkMorningTaken = () => {
    setBannerMedTaken(true);
    const morningMed = medications.find((m) => m.timingCategory === 'morning');
    if (morningMed) {
      onMarkMedTaken(morningMed.id);
    }
    speakText('Great job Eleanor! Marked your morning medication as taken.');
  };

  const handleSnoozeMed = () => {
    speakText('Snoozed for 10 minutes. I will remind you again at 8:25 AM.');
  };

  const handleAskExplain = () => {
    speakText(
      'Your morning Aspirin 81 milligrams helps your heart circulation. The blood pressure pill keeps your readings in the normal target. Remember to take them with a full glass of water.'
    );
  };

  const handleQuickCommand = (cmd: string) => {
    setShowTranscript(true);
    setTranscriptQuestion(cmd);

    if (cmd.includes('Pill') || cmd.includes('Medication')) {
      const reply = 'AI: Your Aspirin 81mg is due now. Have you taken it with water yet?';
      setTranscriptAnswer(reply);
      speakText('Your Aspirin 81 milligrams is due now. Have you taken it with water yet?');
    } else if (cmd.includes('Sarah')) {
      const sarah = contacts.find((c) => c.name.includes('Sarah'));
      if (sarah) {
        onStartVideoCall(sarah);
      }
    } else if (cmd.includes('Next')) {
      const reply = 'AI: Next on your schedule is gentle chair yoga in the living room at 10:30 AM.';
      setTranscriptAnswer(reply);
      speakText('Next up is gentle chair yoga in the living room at 10:30 AM.');
    } else {
      onOpenAICompanion(cmd);
    }
  };

  const toggleMicListening = () => {
    if (!isListeningMic) {
      setIsListeningMic(true);
      setShowTranscript(true);
      setTranscriptQuestion('Listening to Eleanor...');
      setTranscriptAnswer('AI: Go ahead Eleanor, I am listening.');
      speakText('I am listening, Eleanor.');

      // Try browser SpeechRecognition if supported
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        try {
          const rec = new SpeechRec();
          rec.continuous = false;
          rec.interimResults = false;
          rec.lang = 'en-US';
          rec.onresult = (e: any) => {
            const spoken = e.results[0][0].transcript;
            setIsListeningMic(false);
            handleQuickCommand(spoken);
          };
          rec.onerror = () => setIsListeningMic(false);
          rec.onend = () => setIsListeningMic(false);
          rec.start();
        } catch {
          setTimeout(() => setIsListeningMic(false), 4000);
        }
      } else {
        setTimeout(() => setIsListeningMic(false), 3000);
      }
    } else {
      setIsListeningMic(false);
      speakText('Voice listening paused.');
    }
  };

  const activeDoc = documents[0];

  return (
    <div className="flex flex-col w-full text-[#0d1c2f] pb-36">
      {/* 0. Sensory Preferences Quick Control Bar */}
      <section
        aria-label="Quick Accessibility and Sensory Adjustments"
        className="w-full bg-[#e6eeff] rounded-2xl p-4 sm:p-5 mb-6 border border-[#dde9ff] shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="material-symbols-outlined text-[#1d4ed8] text-[36px]">
              tune
            </span>
            <div>
              <span className="text-[20px] font-bold block leading-tight text-[#0d1c2f]">
                Sensory Preferences
              </span>
              <span className="text-[16px] text-[#45464d] block mt-0.5">
                Quickly customize text size, speech pitch, and display contrast for easiest viewing.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Visual theme selector */}
            <div
              aria-label="Visual Theme and Contrast Mode"
              className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#cbd5e1] shadow-xs"
              role="group"
            >
              <button
                type="button"
                onClick={() => {
                  onSetTheme('standard');
                  speakText('Standard comfort mode activated.');
                }}
                className={`min-h-[48px] px-3.5 rounded-lg text-[16px] font-bold flex items-center gap-1.5 transition-all ${
                  visualTheme === 'standard'
                    ? 'bg-[#1d4ed8] text-white shadow-xs'
                    : 'text-[#0d1c2f] hover:bg-[#eff4ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">light_mode</span>
                <span>Comfort</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSetTheme('high-contrast');
                  speakText('Sharp high contrast mode enabled.');
                }}
                className={`min-h-[48px] px-3.5 rounded-lg text-[16px] font-bold flex items-center gap-1.5 transition-all ${
                  visualTheme === 'high-contrast'
                    ? 'bg-[#1d4ed8] text-white shadow-xs'
                    : 'text-[#0d1c2f] hover:bg-[#eff4ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">contrast</span>
                <span>Sharp Contrast</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSetTheme('yellow-black');
                  speakText('Cataract yellow on black contrast enabled.');
                }}
                className={`min-h-[48px] px-3.5 rounded-lg text-[16px] font-bold flex items-center gap-1.5 transition-all ${
                  visualTheme === 'yellow-black'
                    ? 'bg-[#1d4ed8] text-white shadow-xs'
                    : 'text-[#0d1c2f] hover:bg-[#eff4ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                <span>Cataract Yellow</span>
              </button>
            </div>

            {/* Volume boost toggle */}
            <button
              type="button"
              onClick={onToggleAudioBoost}
              className={`min-h-[48px] px-4 rounded-xl text-[16px] font-bold flex items-center gap-2 border transition-all shadow-xs ${
                audioBoost
                  ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                  : 'bg-white text-[#0d1c2f] border-[#cbd5e1] hover:bg-[#eff4ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {audioBoost ? 'volume_up' : 'volume_down'}
              </span>
              <span>Audio Boost: {audioBoost ? '150% Active' : 'Off'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 1. TOP PROACTIVE GREETING & DAILY ASSISTANT BANNER */}
      <section
        aria-label="Daily Assistant and Medication Due Now"
        className="w-full bg-white rounded-3xl p-6 sm:p-8 mb-8 border border-[#cbd5e1] shadow-md relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 w-72 h-72 bg-[#dce1ff] rounded-full opacity-40 pointer-events-none"
        ></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Eleanor Vance Portrait & Greeting */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuG_YTerxcLx4BAf4Yg-h0Wi14u8BSEJOq9eXm6vxGv8INkiy3ZvIaaIbqqdm1cgMGa6jeulu7WnpNbkQEXjeokFj4gRdxtzRD2VYvnpKsMhwJWjSZUBmHFZUke55LdlY3bKQGX7j_fT7gDBgK6X3AOrRVuuBxhese-Nj8q1-f8TIR-noj3IGaoU2dyh59dyMx3QUiahunCB_P9_yqonD-gWpVQRbSuMFA5SHRLD0QAI_lkiqP8_vn"
                alt="Portrait of Eleanor Vance"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-md border-3 border-[#1d4ed8]"
              />
              <span
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center text-xs shadow-md border-2 border-white"
                title="Care Monitoring Active"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-3.5 py-1 bg-[#e6eeff] text-[#1d4ed8] rounded-full text-[15px] font-extrabold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1d4ed8] animate-pulse"></span>
                  Live Proactive Care
                </span>
                <span className="text-[17px] text-[#45464d] font-semibold">
                  Thursday Morning Routine
                </span>
              </div>
              <h1 className="text-[32px] sm:text-[40px] font-extrabold text-[#0d1c2f] leading-tight tracking-tight">
                Good Morning, Eleanor! ☀️
              </h1>
            </div>
          </div>

          {/* Voice Speed Selector */}
          <div
            aria-label="Voice reading speed"
            className="flex flex-wrap items-center gap-1.5 bg-[#eff4ff] p-1.5 rounded-2xl border border-[#dde9ff]"
            role="group"
          >
            <span className="text-[16px] font-bold px-2 text-[#45464d] flex items-center gap-1">
              <span className="material-symbols-outlined text-[#1d4ed8] text-[20px]">speed</span>
              Voice Speed:
            </span>
            <button
              type="button"
              onClick={() => {
                onSetSpeechSpeed(0.75);
                speakText('Voice reading speed set to 0.75x gentle.');
              }}
              className={`min-h-[48px] px-4 rounded-xl text-[16px] font-bold transition-all ${
                speechSpeed === 0.75
                  ? 'bg-[#1d4ed8] text-white shadow-xs'
                  : 'bg-white text-[#0d1c2f] hover:bg-[#e6eeff]'
              }`}
            >
              0.75x Gentle
            </button>
            <button
              type="button"
              onClick={() => {
                onSetSpeechSpeed(1.0);
                speakText('Voice reading speed normal 1.0x.');
              }}
              className={`min-h-[48px] px-4 rounded-xl text-[16px] font-bold transition-all ${
                speechSpeed === 1.0
                  ? 'bg-[#1d4ed8] text-white shadow-xs'
                  : 'bg-white text-[#0d1c2f] hover:bg-[#e6eeff]'
              }`}
            >
              1.0x Normal
            </button>
            <button
              type="button"
              onClick={() => {
                onSetSpeechSpeed(1.25);
                speakText('Voice reading speed set to 1.25x fast.');
              }}
              className={`min-h-[48px] px-4 rounded-xl text-[16px] font-bold transition-all ${
                speechSpeed === 1.25
                  ? 'bg-[#1d4ed8] text-white shadow-xs'
                  : 'bg-white text-[#0d1c2f] hover:bg-[#e6eeff]'
              }`}
            >
              1.25x Fast
            </button>
          </div>
        </div>

        {/* Live Urgent Medication Due Prompt Callout Box */}
        <div className="mt-6 p-5 sm:p-6 bg-[#e6eeff] rounded-2xl border-2 border-[#dde9ff] shadow-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1d4ed8] text-white flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[34px]">medication</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[22px] sm:text-[24px] font-bold text-[#0d1c2f]">
                    Time For Morning Medication
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-[15px] font-extrabold">
                    {bannerMedTaken ? '✓ Taken' : 'Due in 15 Minutes'}
                  </span>
                </div>

                {/* Word-by-Word Synchronized Transcript Container */}
                <p
                  aria-live="polite"
                  className="text-[20px] sm:text-[22px] text-[#0d1c2f] mt-2 leading-relaxed font-medium"
                >
                  {bannerWords.map((word, idx) => (
                    <span
                      key={idx}
                      className={`inline-block mr-1.5 transition-colors rounded px-1 ${
                        highlightedWordIndex === idx
                          ? 'bg-[#1d4ed8] text-white font-bold scale-105'
                          : 'bg-transparent'
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            {/* Read Out Loud Trigger Button */}
            <button
              type="button"
              onClick={handleSimulateReadAloud}
              className={`min-h-[56px] px-6 rounded-2xl font-bold text-[20px] flex items-center justify-center gap-3 shrink-0 shadow-sm border transition-all active:scale-98 ${
                isReadingBanner
                  ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                  : 'bg-white text-[#1d4ed8] border-[#cbd5e1] hover:bg-[#eff4ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                {isReadingBanner ? 'volume_up' : 'campaign'}
              </span>
              <span>{isReadingBanner ? 'Reading Aloud...' : 'Read Out Loud'}</span>
              <span aria-hidden="true" className="flex items-center gap-1 ml-1">
                <span className={`w-1.5 bg-current rounded-full ${isReadingBanner ? 'h-5 animate-pulse' : 'h-3'}`}></span>
                <span className={`w-1.5 bg-current rounded-full ${isReadingBanner ? 'h-7 animate-pulse delay-100' : 'h-5'}`}></span>
                <span className={`w-1.5 bg-current rounded-full ${isReadingBanner ? 'h-4 animate-pulse delay-200' : 'h-2'}`}></span>
              </span>
            </button>
          </div>

          {/* Quick Action Pills with large touch targets */}
          <div className="mt-5 pt-3 flex flex-wrap items-center gap-3 border-t border-[#cbd5e1]/60">
            <button
              type="button"
              onClick={handleMarkMorningTaken}
              className={`min-h-[56px] px-6 rounded-xl font-bold text-[19px] flex items-center gap-2 shadow-sm transition-all active:scale-98 ${
                bannerMedTaken
                  ? 'bg-[#059669] text-white'
                  : 'bg-[#000000] hover:bg-[#233144] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">check_circle</span>
              <span>{bannerMedTaken ? '✓ Taken at 8:15 AM' : 'Mark as Taken'}</span>
            </button>

            <button
              type="button"
              onClick={handleSnoozeMed}
              className="min-h-[56px] px-6 rounded-xl bg-white text-[#0d1c2f] hover:bg-[#eff4ff] font-bold text-[19px] flex items-center gap-2 shadow-xs border border-[#cbd5e1] transition-all"
            >
              <span className="material-symbols-outlined text-[24px] text-[#45464d]">snooze</span>
              <span>Snooze 10 Minutes</span>
            </button>

            <button
              type="button"
              onClick={handleAskExplain}
              className="min-h-[56px] px-6 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-[19px] flex items-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">chat</span>
              <span>Ask Companion to Explain</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. CORE FUNCTIONALITY 2x2 MODULAR LARGE CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* CARD A: MEDICATION & HEALTH TRACK */}
        <article
          aria-labelledby="heading-med-tracker"
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cbd5e1] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-[#e6eeff] text-[#1d4ed8] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">medication_liquid</span>
                </span>
                <div>
                  <h2 id="heading-med-tracker" className="text-[26px] font-bold text-[#0d1c2f] leading-tight">
                    Medication Schedule
                  </h2>
                  <span className="text-[17px] text-[#45464d]">
                    Today: {medications.length} Total Daily Doses Planned
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  speakText(
                    'Medication Schedule for today. Eight AM: Aspirin 81 milligrams, due now. One PM: Vitamin D3 after lunch. Seven thirty PM: Metformin 500 milligrams with dinner.'
                  )
                }
                className="min-h-[48px] px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dde9ff] text-[#1d4ed8] font-bold text-[16px] flex items-center gap-1.5 border border-[#dde9ff]"
              >
                <span className="material-symbols-outlined text-[22px]">record_voice_over</span>
                <span>Listen</span>
              </button>
            </div>

            {/* Dose Items List */}
            <div className="space-y-3">
              {medications.slice(0, 3).map((med, i) => (
                <div
                  key={med.id}
                  className="p-4 bg-[#eff4ff] rounded-2xl flex items-center justify-between gap-3 border border-[#dde9ff] shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#d5e3fd] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[28px] text-[#1d4ed8]">
                        {i === 0 ? 'radio_button_checked' : i === 1 ? 'schedule' : 'bedtime'}
                      </span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[19px] font-bold text-[#0d1c2f]">
                          {med.time} • {med.name} {med.dosage}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[13px] font-bold ${
                            med.isTaken
                              ? 'bg-emerald-100 text-emerald-800'
                              : i === 0
                              ? 'bg-[#1d4ed8] text-white'
                              : 'bg-white text-[#45464d] border border-[#cbd5e1]'
                          }`}
                        >
                          {med.isTaken ? '✓ Taken' : med.statusBadge}
                        </span>
                      </div>
                      <p className="text-[16px] text-[#45464d] mt-0.5">{med.description}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakText(med.audioText)}
                    aria-label={`Audio guide for ${med.name}`}
                    className="min-h-[48px] min-w-[48px] rounded-xl bg-white text-[#1d4ed8] hover:bg-[#e6eeff] flex items-center justify-center border border-[#cbd5e1] shadow-xs shrink-0"
                  >
                    <span className="material-symbols-outlined text-[24px]">volume_up</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action: Pill Bottle Scanner */}
          <div className="mt-6 pt-2">
            <button
              type="button"
              onClick={onOpenBottleScanner}
              className="w-full min-h-[56px] px-6 rounded-2xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-[20px] flex items-center justify-center gap-3 transition-colors shadow-md active:scale-98"
            >
              <span className="material-symbols-outlined text-[30px]">photo_camera</span>
              <span>Verify Bottle with Camera / Scanner</span>
            </button>
          </div>
        </article>

        {/* CARD B: SIMPLIFIED ASSISTANT & OCR DOCUMENT READER */}
        <article
          aria-labelledby="heading-doc-reader"
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cbd5e1] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-[#e6eeff] text-[#1d4ed8] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">document_scanner</span>
                </span>
                <div>
                  <h2 id="heading-doc-reader" className="text-[26px] font-bold text-[#0d1c2f] leading-tight">
                    Document & Letter Reader
                  </h2>
                  <span className="text-[17px] text-[#45464d]">
                    Point camera at mail, medicine boxes, or medical notes
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#e6eeff] text-[#1d4ed8] text-[15px] font-bold rounded-full">
                Smart OCR
              </span>
            </div>

            {/* Snap / Upload Zone */}
            <button
              type="button"
              onClick={onOpenDocScanner}
              className="w-full min-h-[72px] p-4 bg-[#eff4ff] hover:bg-[#dde9ff] rounded-2xl flex items-center gap-4 transition-colors mb-4 border border-[#dde9ff] text-left shadow-xs cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[26px]">add_a_photo</span>
              </div>
              <div>
                <span className="text-[20px] font-bold text-[#0d1c2f] block leading-tight">
                  📷 Scan New Document or Prescription
                </span>
                <span className="text-[16px] text-[#45464d] block mt-0.5">
                  Instant simplified reading with no small print
                </span>
              </div>
            </button>

            {/* Live Sample Preview Box */}
            <div className="bg-[#eff4ff] rounded-2xl p-4 border border-[#dde9ff]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[16px] font-bold text-[#1d4ed8] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
                  Scanned Letter: Dr. Harrison Cardiology
                </span>
                <span className="text-[15px] text-[#45464d] font-semibold">Scanned Today</span>
              </div>

              <blockquote className="text-[18px] text-[#0d1c2f] italic bg-white p-3.5 rounded-xl border border-[#cbd5e1] leading-relaxed shadow-xs">
                "{activeDoc?.originalText || 'Notice from Dr. Harrison: Follow-up cardiology appointment confirmed for Tuesday at 10:30 AM. No fasting required.'}"
              </blockquote>

              {/* 2-Sentence Easy Summary */}
              <div className="mt-3 p-4 bg-[#d5e3fd] rounded-xl border border-[#1d4ed8]">
                <span className="text-[17px] font-bold text-[#000000] block mb-1">
                  ✨ 2-Sentence AI Easy Summary:
                </span>
                <p className="text-[21px] font-bold text-[#0d1c2f] leading-snug">
                  {activeDoc?.easySummary || 'Your heart doctor visit is next Tuesday at 10:30 AM. You can eat breakfast normally beforehand.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons for Document */}
          <div className="mt-6 pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                speakText(
                  activeDoc?.easySummary ||
                    'Your heart doctor visit is next Tuesday at 10:30 AM. You can eat breakfast normally beforehand.'
                )
              }
              className="flex-1 min-h-[56px] px-4 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-[18px] flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <span className="material-symbols-outlined text-[24px]">volume_up</span>
              <span>Read Full Letter Aloud</span>
            </button>

            <button
              type="button"
              onClick={() =>
                speakText(
                  "Doctor Harrison's appointment confirmation has been securely sent to daughter Sarah's phone."
                )
              }
              className="min-h-[56px] px-5 rounded-xl bg-[#eff4ff] hover:bg-[#dde9ff] text-[#0d1c2f] font-bold text-[18px] flex items-center justify-center gap-2 transition-colors border border-[#cbd5e1]"
            >
              <span className="material-symbols-outlined text-[24px] text-[#1d4ed8]">send</span>
              <span>Send Copy to Daughter Sarah</span>
            </button>
          </div>
        </article>

        {/* CARD C: DAILY ROUTINE & CALENDAR */}
        <article
          aria-labelledby="heading-daily-routine"
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cbd5e1] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-[#e6eeff] text-[#1d4ed8] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">calendar_today</span>
                </span>
                <div>
                  <h2 id="heading-daily-routine" className="text-[26px] font-bold text-[#0d1c2f] leading-tight">
                    Daily Routine & Schedule
                  </h2>
                  <span className="text-[17px] text-[#45464d]">
                    4 gentle activities planned for your wellness
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  speakText(
                    "Today's Agenda: 10:30 AM Chair Yoga in living room. 2:00 PM Grocery Delivery. 4:30 PM Video check-in with Doctor Harrison. 6:00 PM Evening walk with Martha."
                  )
                }
                className="min-h-[48px] px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dde9ff] text-[#1d4ed8] font-bold text-[16px] flex items-center gap-1.5 border border-[#dde9ff]"
              >
                <span className="material-symbols-outlined text-[22px]">record_voice_over</span>
                <span>Listen</span>
              </button>
            </div>

            {/* Routine Chronological Timeline Items */}
            <div className="space-y-3">
              {routine.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 bg-[#eff4ff] rounded-2xl flex items-center justify-between gap-3 border border-[#dde9ff] shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white text-[#1d4ed8] border border-[#cbd5e1] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[26px]">
                        {act.category === 'exercise'
                          ? 'self_improvement'
                          : act.category === 'delivery'
                          ? 'local_shipping'
                          : act.category === 'medical'
                          ? 'video_camera_front'
                          : 'directions_walk'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[19px] font-bold text-[#0d1c2f] block leading-tight">
                        {act.time} • {act.title}
                      </span>
                      <span className="text-[16px] text-[#45464d] block mt-0.5">
                        {act.description}
                      </span>
                    </div>
                  </div>

                  {act.hasPreviewLink ? (
                    <button
                      type="button"
                      onClick={() =>
                        speakText(
                          'Telehealth video link for Doctor Harrison is pre-configured and will connect automatically at 4:25 PM.'
                        )
                      }
                      className="min-h-[44px] px-3.5 rounded-xl bg-[#1d4ed8] text-white hover:bg-[#1e40af] text-[15px] font-bold flex items-center gap-1 shadow-xs shrink-0"
                    >
                      <span>Preview Link</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-white text-[#45464d] text-[14px] font-bold border border-[#cbd5e1] shrink-0">
                      {act.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Reminder Voice Button */}
          <div className="mt-6 pt-2">
            <button
              type="button"
              onClick={() => {
                speakText('Companion is listening for your reminder. Say what you would like to remember.');
                toggleMicListening();
              }}
              className="w-full min-h-[56px] px-6 rounded-2xl bg-[#eff4ff] hover:bg-[#dde9ff] text-[#0d1c2f] font-bold text-[20px] flex items-center justify-center gap-3 transition-colors border border-[#cbd5e1] shadow-xs active:scale-98"
            >
              <span className="material-symbols-outlined text-[30px] text-[#1d4ed8]">mic</span>
              <span>Add Quick Reminder via Voice</span>
            </button>
          </div>
        </article>

        {/* CARD D: FAMILY & TRUST CIRCLE */}
        <article
          aria-labelledby="heading-trust-circle"
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cbd5e1] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-[#e6eeff] text-[#1d4ed8] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">favorite</span>
                </span>
                <div>
                  <h2 id="heading-trust-circle" className="text-[26px] font-bold text-[#0d1c2f] leading-tight">
                    Family & Trust Circle
                  </h2>
                  <span className="text-[17px] text-[#45464d]">
                    Instant 1-tap connection to your loved ones
                  </span>
                </div>
              </div>
              <span className="flex items-center gap-1.5 px-3.5 py-1 bg-[#eff4ff] text-[#1d4ed8] rounded-full text-[14px] font-bold border border-[#dde9ff]">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                Private Circle
              </span>
            </div>

            <div className="space-y-4">
              {/* Member 1: Sarah Vance */}
              {contacts.filter((c) => c.role === 'primary').map((contact) => (
                <div key={contact.id} className="p-4 bg-[#eff4ff] rounded-2xl border border-[#dde9ff] shadow-xs">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-[#dce1ff] text-[#1d4ed8] flex items-center justify-center text-[22px] font-bold shadow-xs">
                          {contact.initials}
                        </div>
                        <span
                          className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#1d4ed8] border-2 border-white"
                          title="Available now"
                        ></span>
                      </div>
                      <div>
                        <span className="text-[20px] font-bold text-[#0d1c2f] block leading-tight">
                          {contact.name} ({contact.relation})
                        </span>
                        <span className="text-[15px] text-[#1d4ed8] font-bold block mt-0.5">
                          {contact.statusText}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onStartVideoCall(contact)}
                      className="flex-1 min-h-[52px] px-4 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-[17px] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
                    >
                      <span className="material-symbols-outlined text-[24px]">video_call</span>
                      <span>1-Tap Video Call</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onPlayVoiceNote(contact)}
                      className="flex-1 min-h-[52px] px-4 rounded-xl bg-white hover:bg-[#dde9ff] text-[#0d1c2f] font-bold text-[17px] flex items-center justify-center gap-2 border border-[#cbd5e1] shadow-xs transition-all"
                    >
                      <span className="material-symbols-outlined text-[24px] text-[#1d4ed8]">play_arrow</span>
                      <span>Play Voice Note (0:45)</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Member 2: Dr. Harrison */}
              {contacts.filter((c) => c.role === 'physician').map((contact) => (
                <div
                  key={contact.id}
                  className="p-3.5 bg-[#eff4ff] rounded-2xl flex items-center justify-between gap-3 border border-[#dde9ff] shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#d5e3fd] text-[#1d4ed8] flex items-center justify-center text-[18px] font-bold shrink-0">
                      {contact.initials}
                    </div>
                    <div>
                      <span className="text-[19px] font-bold text-[#0d1c2f] block leading-tight">
                        {contact.name} ({contact.relation})
                      </span>
                      <span className="text-[15px] text-[#45464d] block mt-0.5">
                        {contact.statusText}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      speakText(`Calling ${contact.name} office at ${contact.phone}. Connecting.`);
                    }}
                    className="min-h-[48px] px-4 rounded-xl bg-white text-[#1d4ed8] hover:bg-[#dde9ff] font-bold text-[16px] flex items-center gap-1.5 border border-[#cbd5e1] shadow-xs shrink-0"
                  >
                    <span className="material-symbols-outlined text-[22px]">call</span>
                    <span>Call Office</span>
                  </button>
                </div>
              ))}

              {/* Member 3: Robert Vance */}
              {contacts.filter((c) => c.role === 'family').map((contact) => (
                <div
                  key={contact.id}
                  className="p-3.5 bg-[#eff4ff] rounded-2xl flex items-center justify-between gap-3 border border-[#dde9ff] shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#d5e3fd] text-[#1d4ed8] flex items-center justify-center text-[18px] font-bold shrink-0">
                      {contact.initials}
                    </div>
                    <div>
                      <span className="text-[19px] font-bold text-[#0d1c2f] block leading-tight">
                        {contact.name} ({contact.relation})
                      </span>
                      <span className="text-[15px] text-[#45464d] block mt-0.5">
                        {contact.statusText}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      speakText(`Speed dialing son Robert Vance at ${contact.phone}.`);
                    }}
                    className="min-h-[48px] px-4 rounded-xl bg-white text-[#1d4ed8] hover:bg-[#dde9ff] font-bold text-[16px] flex items-center gap-1.5 border border-[#cbd5e1] shadow-xs shrink-0"
                  >
                    <span className="material-symbols-outlined text-[22px]">phone_in_talk</span>
                    <span>Speed Dial</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Assurance Footnote */}
          <div className="mt-6 pt-3 border-t border-[#dde9ff] flex items-center gap-2 text-[#45464d] text-[16px]">
            <span className="material-symbols-outlined text-[#1d4ed8] text-[22px] shrink-0">
              verified_user
            </span>
            <span>256-bit encrypted health data circle with HIPAA-compliant emergency routing.</span>
          </div>
        </article>
      </div>

      {/* 3. MULTI-MODAL FLOATING VOICE BAR DOCK (Fixed Bottom Anchor) */}
      <aside
        aria-label="Interactive AI Voice Companion Assistant"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4 pointer-events-auto"
      >
        {/* Live Speech Transcript display panel above mic */}
        {showTranscript && (
          <div className="mb-3 bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-[#1d4ed8] flex items-start gap-4 transition-all animate-fadeIn">
            <div className="w-11 h-11 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">smart_toy</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-bold text-[#1d4ed8] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1d4ed8] animate-ping"></span>
                  Companion Listening & Ready
                </span>
                <button
                  type="button"
                  onClick={() => setShowTranscript(false)}
                  aria-label="Dismiss transcript preview"
                  className="text-[#45464d] hover:text-[#0d1c2f] p-1 rounded-lg"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <p className="text-[19px] font-bold text-[#0d1c2f] mt-1">
                "{transcriptQuestion}"
              </p>
              <p className="text-[17px] text-[#45464d] mt-0.5 leading-snug">
                {transcriptAnswer}
              </p>
            </div>
          </div>
        )}

        {/* Pulsating microphone dock bar */}
        <div className="bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.14)] p-2.5 border-2 border-[#dde9ff] flex flex-wrap lg:flex-nowrap items-center justify-between gap-3">
          {/* Primary Big Mic Button */}
          <div className="flex items-center gap-3 pl-2">
            <button
              type="button"
              onClick={toggleMicListening}
              aria-label="Activate voice assistant: Tap or speak Hey Companion"
              className={`min-h-[56px] min-w-[56px] rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
                isListeningMic
                  ? 'bg-[#ba1a1a] text-white animate-pulse'
                  : 'bg-[#1d4ed8] hover:bg-[#1e40af] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[32px]">
                {isListeningMic ? 'mic' : 'mic'}
              </span>
            </button>
            <div className="flex flex-col pr-2">
              <span className="text-[19px] font-bold text-[#0d1c2f] leading-tight">
                {isListeningMic ? 'Listening to Eleanor...' : 'Tap or Say "Hey Companion"'}
              </span>
              <span className="text-[15px] text-[#45464d] leading-tight">
                Ask medication questions, schedule reminders, or family dials.
              </span>
            </div>
          </div>

          {/* Quick Voice Command Shortcut Chips */}
          <div className="flex flex-wrap items-center gap-2 pr-2">
            <button
              type="button"
              onClick={() => handleQuickCommand('Read My Pills')}
              className="min-h-[46px] px-4 rounded-full bg-[#eff4ff] hover:bg-[#dde9ff] text-[#0d1c2f] font-bold text-[16px] border border-[#cbd5e1] transition-all shadow-xs"
            >
              "Read My Pills"
            </button>
            <button
              type="button"
              onClick={() => handleQuickCommand('Call Sarah')}
              className="min-h-[46px] px-4 rounded-full bg-[#eff4ff] hover:bg-[#dde9ff] text-[#0d1c2f] font-bold text-[16px] border border-[#cbd5e1] transition-all shadow-xs"
            >
              "Call Sarah"
            </button>
            <button
              type="button"
              onClick={() => handleQuickCommand("What's Next Today?")}
              className="min-h-[46px] px-4 rounded-full bg-[#eff4ff] hover:bg-[#dde9ff] text-[#0d1c2f] font-bold text-[16px] border border-[#cbd5e1] transition-all shadow-xs"
            >
              "What's Next?"
            </button>
            <button
              type="button"
              onClick={() => {
                speakText(
                  'On your screen right now: Good morning Eleanor! Aspirin 81 milligrams is due with water. You also have chair yoga at 10:30 AM and grocery delivery at 2:00 PM.'
                );
              }}
              className="min-h-[46px] px-4 rounded-full bg-white hover:bg-[#eff4ff] text-[#1d4ed8] font-bold text-[16px] border border-[#1d4ed8] transition-all shadow-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
              <span>Read Screen</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
