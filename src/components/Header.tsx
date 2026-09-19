import React, { useState, useEffect } from 'react';
import { AccessibilitySettings, NavigationTab } from '../types';
import { speakText } from '../utils/speech';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  onTriggerSOS: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  settings,
  onUpdateSettings,
  onTriggerSOS,
}) => {
  const [currentTime, setCurrentTime] = useState('10:15 AM');
  const [currentDate, setCurrentDate] = useState('Thursday, Oct 24');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleFontDecrease = () => {
    let newScale = 100;
    if (settings.fontScale === 130) newScale = 115;
    else if (settings.fontScale === 115) newScale = 100;
    onUpdateSettings({ fontScale: newScale as any });
    speakText(`Text size set to ${newScale} percent`);
  };

  const handleFontIncrease = () => {
    let newScale = 130;
    if (settings.fontScale === 100) newScale = 115;
    else if (settings.fontScale === 115) newScale = 130;
    onUpdateSettings({ fontScale: newScale as any });
    speakText(`Text size increased to ${newScale} percent`);
  };

  const handleToggleContrast = () => {
    let nextTheme: AccessibilitySettings['theme'] = 'high-contrast';
    if (settings.theme === 'standard') nextTheme = 'high-contrast';
    else if (settings.theme === 'high-contrast') nextTheme = 'yellow-black';
    else nextTheme = 'standard';
    onUpdateSettings({ theme: nextTheme });
    speakText(`Visual theme set to ${nextTheme.replace('-', ' ')}`);
  };

  const handleToggleAudioBoost = () => {
    const newBoost = !settings.audioBoost;
    onUpdateSettings({ audioBoost: newBoost });
    speakText(newBoost ? 'Audio boost 150 percent activated with hearing aid amplification.' : 'Audio boost normal.');
  };

  const handleToggleVoiceSpeed = () => {
    let nextSpeed = 1.0;
    if (settings.speechSpeed === 1.0) nextSpeed = 1.25;
    else if (settings.speechSpeed === 1.25) nextSpeed = 0.75;
    else nextSpeed = 1.0;
    onUpdateSettings({ speechSpeed: nextSpeed });
    speakText(`Voice reading speed set to ${nextSpeed}x`);
  };

  const handleToggleCaptions = () => {
    const nextCaptions = !settings.liveCaptions;
    onUpdateSettings({ liveCaptions: nextCaptions });
    speakText(nextCaptions ? 'Live captions turned on' : 'Live captions turned off');
  };

  const navItems: { id: NavigationTab; label: string }[] = [
    { id: 'daily-overview', label: 'Daily Overview' },
    { id: 'medication-schedule', label: 'Medications' },
    { id: 'care-circle', label: 'Care Circle' },
    { id: 'health-wellness', label: 'Health & Wellness' },
    { id: 'companion-chat', label: 'AI Companion' },
    { id: 'accessibility-settings', label: 'Preferences' },
  ];

  return (
    <header className="fixed top-0 w-full z-40 bg-white border-b border-[#cbd5e1] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-22 flex items-center justify-between gap-3">
        {/* Brand & Active Badge */}
        <div 
          className="flex items-center gap-3 cursor-pointer py-1"
          onClick={() => onSelectTab('daily-overview')}
          role="button"
          tabIndex={0}
          aria-label="CompanionCare AI Home"
        >
          <img
            src="https://lh3.googleusercontent.com/aida/AEtjO1Vp4-QHGofSGpRr4efWE9egtE3Yk3pPW_jgBkkXOH8TxvBQh5XpVQSgGE_G2Lsoij3Jn7V9t_I8_epIOZux3vhopwbgfodV1DhXLRJ4E630IQgYq9dsYoyG5IkaL5oufP4XGA4S3LSKxwWBAsrlKL_b9xaKQPdgPcL3p2TUen7av6OWtT9djrdGeXcX8fOj_6ZSM3FW4dwhs9yIqLoCrBzCDgoJePObZNVkSVus0yjHz-mvXP3sb-fenU0"
            alt="CompanionCare AI Logo"
            className="h-10 w-auto object-contain rounded-lg"
          />
          <div className="flex flex-col">
            <span className="text-[22px] font-bold text-[#0d1c2f] leading-none tracking-tight">
              CompanionCare AI
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full bg-[#e6eeff] text-[#1d4ed8] text-[13px] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1d4ed8] animate-pulse"></span>
              Voice Companion Active
            </span>
          </div>
        </div>

        {/* Sensory Controls (Desktop & Tablet) */}
        <div className="hidden xl:flex items-center gap-2 bg-[#eff4ff] p-1.5 rounded-xl border border-[#dde9ff]">
          {/* Font Scaling */}
          <div className="flex items-center bg-white px-1.5 py-1 rounded-lg border border-[#c6c6cd] shadow-xs">
            <button
              type="button"
              onClick={handleFontDecrease}
              aria-label="Decrease Font Size"
              className="min-h-[44px] min-w-[40px] px-2 text-[18px] font-bold text-[#0d1c2f] hover:bg-[#eff4ff] rounded transition-colors"
            >
              A-
            </button>
            <span className="px-2 text-[16px] font-bold text-[#0d1c2f] select-none border-x border-[#dde9ff]">
              {settings.fontScale}%
            </span>
            <button
              type="button"
              onClick={handleFontIncrease}
              aria-label="Increase Font Size"
              className="min-h-[44px] min-w-[40px] px-2 text-[18px] font-bold text-[#0d1c2f] hover:bg-[#eff4ff] rounded transition-colors"
            >
              A+
            </button>
          </div>

          {/* Contrast */}
          <button
            type="button"
            onClick={handleToggleContrast}
            aria-label="Toggle Contrast Mode"
            className={`min-h-[44px] px-3.5 flex items-center gap-2 rounded-lg font-bold text-[16px] transition-colors border shadow-xs ${
              settings.theme !== 'standard'
                ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                : 'bg-white text-[#0d1c2f] border-[#c6c6cd] hover:bg-[#eff4ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">contrast</span>
            <span>Contrast</span>
          </button>

          {/* Audio Boost 150% */}
          <button
            type="button"
            onClick={handleToggleAudioBoost}
            aria-label="Toggle Audio Boost 150%"
            className={`min-h-[44px] px-3.5 flex items-center gap-2 rounded-lg font-bold text-[16px] transition-colors border shadow-xs ${
              settings.audioBoost
                ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                : 'bg-white text-[#0d1c2f] border-[#c6c6cd] hover:bg-[#eff4ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">hearing</span>
            <span>Audio {settings.audioBoost ? '150%' : 'Normal'}</span>
          </button>

          {/* Voice Speed */}
          <button
            type="button"
            onClick={handleToggleVoiceSpeed}
            aria-label="Toggle Voice Reading Speed"
            className="min-h-[44px] px-3.5 flex items-center gap-2 bg-white text-[#0d1c2f] border border-[#c6c6cd] hover:bg-[#eff4ff] rounded-lg font-bold text-[16px] shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[#1d4ed8] text-[20px]">speed</span>
            <span>Voice {settings.speechSpeed}x</span>
          </button>

          {/* Captions */}
          <button
            type="button"
            onClick={handleToggleCaptions}
            aria-label="Toggle Live Captions"
            className={`min-h-[44px] px-3.5 flex items-center gap-2 rounded-lg font-bold text-[16px] transition-colors border shadow-xs ${
              settings.liveCaptions
                ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                : 'bg-white text-[#0d1c2f] border-[#c6c6cd] hover:bg-[#eff4ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">subtitles</span>
            <span>Captions {settings.liveCaptions ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* User Info & Big Emergency SOS */}
        <div className="flex items-center gap-3">
          {/* Time and Date */}
          <div className="hidden md:flex flex-col text-right pr-2">
            <span className="text-[19px] font-bold text-[#0d1c2f] leading-none">
              {currentTime}
            </span>
            <span className="text-[14px] text-[#45464d] font-semibold mt-1">
              {currentDate}
            </span>
          </div>

          {/* Eleanor Vance Profile */}
          <div className="flex items-center gap-2 pl-1 border-l border-[#dde9ff]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuG_YTerxcLx4BAf4Yg-h0Wi14u8BSEJOq9eXm6vxGv8INkiy3ZvIaaIbqqdm1cgMGa6jeulu7WnpNbkQEXjeokFj4gRdxtzRD2VYvnpKsMhwJWjSZUBmHFZUke55LdlY3bKQGX7j_fT7gDBgK6X3AOrRVuuBxhese-Nj8q1-f8TIR-noj3IGaoU2dyh59dyMx3QUiahunCB_P9_yqonD-gWpVQRbSuMFA5SHRLD0QAI_lkiqP8_vn"
              alt="Eleanor Vance Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-[#1d4ed8] shadow-sm"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[16px] font-bold text-[#0d1c2f] leading-none">
                Eleanor Vance
              </span>
              <span className="text-[13px] text-[#45464d] font-semibold mt-0.5">
                Age 74
              </span>
            </div>
          </div>

          {/* Red EMERGENCY SOS Button */}
          <button
            type="button"
            onClick={onTriggerSOS}
            aria-label="Urgent Emergency SOS Help Trigger"
            className="min-h-[52px] sm:min-h-[56px] px-4 sm:px-6 bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold text-[18px] sm:text-[20px] rounded-xl flex items-center gap-2 shadow-md border-2 border-red-400 active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[28px] animate-pulse">sos</span>
            <span className="tracking-wide">EMERGENCY SOS</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Bar */}
      <div className="w-full bg-[#eff4ff] border-t border-[#dde9ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-1.5">
          <nav className="flex items-center gap-2 py-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    speakText(`Opened ${item.label}`);
                  }}
                  className={`min-h-[48px] px-4 sm:px-5 flex items-center rounded-lg text-[18px] font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#131b2e] text-white shadow-sm'
                      : 'text-[#45464d] hover:text-[#0d1c2f] hover:bg-[#dde9ff]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Prompt Assist Tip */}
          <div className="hidden lg:flex items-center gap-2 pl-4 shrink-0">
            <span className="text-[16px] text-[#1d4ed8] font-bold">Need Help? Say:</span>
            <button
              type="button"
              onClick={() => {
                onSelectTab('companion-chat');
                speakText('Hey Companion, reading your schedule now.');
              }}
              className="text-[15px] text-[#0d1c2f] italic font-semibold bg-white px-3 py-1.5 rounded-lg border border-[#cbd5e1] hover:border-[#1d4ed8] shadow-xs cursor-pointer"
            >
              "Hey Companion, read my schedule"
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
