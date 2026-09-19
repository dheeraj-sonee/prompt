import React, { useState } from 'react';
import { CareContact } from '../types';
import { speakText } from '../utils/speech';

interface CareCircleViewProps {
  contacts: CareContact[];
  onStartVideoCall: (contact: CareContact) => void;
  onPlayVoiceNote: (contact: CareContact) => void;
}

export const CareCircleView: React.FC<CareCircleViewProps> = ({
  contacts,
  onStartVideoCall,
  onPlayVoiceNote,
}) => {
  const [checkInSent, setCheckInSent] = useState(false);
  const [playingVoiceNoteId, setPlayingVoiceNoteId] = useState<string | null>(null);

  const handleSendCheckIn = () => {
    setCheckInSent(true);
    speakText(
      "Instant 'I am doing wonderful!' check-in note with your location and medication status has been sent to daughter Sarah and son Robert."
    );
    setTimeout(() => setCheckInSent(false), 8000);
  };

  const handlePlayVoice = (contact: CareContact) => {
    setPlayingVoiceNoteId(contact.id);
    onPlayVoiceNote(contact);
    setTimeout(() => setPlayingVoiceNoteId(null), 5000);
  };

  return (
    <div className="flex flex-col w-full text-[#0d1c2f] pb-36">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#cbd5e1] shadow-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-14 h-14 rounded-2xl bg-[#1d4ed8] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[34px]">diversity_1</span>
            </span>
            <div>
              <h1 className="text-[32px] sm:text-[38px] font-extrabold text-[#0d1c2f] leading-none">
                Family & Care Circle
              </h1>
              <span className="text-[17px] text-[#45464d] font-semibold mt-1 inline-block">
                Stay connected with 1-tap calls, voice messages, and safety check-ins
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="px-4 py-1.5 rounded-full bg-[#e6eeff] text-[#1d4ed8] text-[15px] font-bold border border-[#dde9ff] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              Private 256-Bit Encrypted Circle
            </span>
          </div>
        </div>

        {/* 1-Tap 'I'm Doing Great' Broadcast Check-in Button */}
        <button
          type="button"
          onClick={handleSendCheckIn}
          className={`min-h-[60px] px-7 rounded-2xl font-bold text-[20px] flex items-center gap-3 shadow-md transition-all active:scale-98 ${
            checkInSent
              ? 'bg-[#059669] text-white'
              : 'bg-[#1d4ed8] hover:bg-[#1e40af] text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">
            {checkInSent ? 'mark_chat_read' : 'send'}
          </span>
          <span>
            {checkInSent ? '✓ Sent to Sarah & Robert' : "Send 1-Tap 'I'm OK' Check-in"}
          </span>
        </button>
      </div>

      {/* Contacts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-[#cbd5e1] shadow-md flex flex-col justify-between"
          >
            <div>
              {/* Profile Bar */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-[#dce1ff] text-[#1d4ed8] flex items-center justify-center text-[24px] font-extrabold shadow-xs">
                      {contact.initials}
                    </div>
                    {contact.isAvailableNow && (
                      <span
                        className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#1d4ed8] border-2 border-white"
                        title="Available now"
                      ></span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[24px] font-extrabold text-[#0d1c2f] leading-tight">
                      {contact.name}
                    </h3>
                    <span className="text-[17px] font-bold text-[#1d4ed8] block">
                      {contact.relation}
                    </span>
                    <span className="text-[15px] text-[#45464d] font-semibold block mt-0.5">
                      {contact.phone}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[13px] font-bold ${
                    contact.role === 'primary'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#eff4ff] text-[#45464d] border border-[#cbd5e1]'
                  }`}
                >
                  {contact.role === 'primary' ? 'Primary Contact' : contact.role.toUpperCase()}
                </span>
              </div>

              {/* Status Note */}
              <div className="bg-[#eff4ff] p-3.5 rounded-2xl border border-[#dde9ff] mb-4">
                <span className="text-[16px] text-[#0d1c2f] font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1d4ed8] text-[20px]">
                    notifications_active
                  </span>
                  {contact.statusText}
                </span>

                {/* If voice note is attached */}
                {contact.hasVoiceNote && (
                  <div className="mt-2 pt-2 border-t border-[#cbd5e1]/60">
                    <span className="text-[14px] font-bold text-[#1d4ed8] block mb-1">
                      Voice Note: "{contact.voiceNoteTranscript?.slice(0, 75)}..."
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => onStartVideoCall(contact)}
                className="flex-1 min-h-[52px] px-4 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-[17px] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-[24px]">video_call</span>
                <span>1-Tap Video</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  speakText(`Calling ${contact.name} at ${contact.phone}.`);
                }}
                className="flex-1 min-h-[52px] px-4 rounded-xl bg-white hover:bg-[#eff4ff] text-[#0d1c2f] font-bold text-[17px] flex items-center justify-center gap-2 border border-[#cbd5e1] shadow-xs"
              >
                <span className="material-symbols-outlined text-[24px] text-[#1d4ed8]">call</span>
                <span>Phone Call</span>
              </button>

              {contact.hasVoiceNote && (
                <button
                  type="button"
                  onClick={() => handlePlayVoice(contact)}
                  className={`w-full min-h-[50px] px-4 rounded-xl font-bold text-[17px] flex items-center justify-center gap-2 border transition-all ${
                    playingVoiceNoteId === contact.id
                      ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                      : 'bg-[#eff4ff] hover:bg-[#dde9ff] text-[#0d1c2f] border-[#cbd5e1]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {playingVoiceNoteId === contact.id ? 'pause' : 'play_arrow'}
                  </span>
                  <span>Play Voice Note ({contact.voiceNoteDuration})</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Care Circle Activity Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#cbd5e1] shadow-md">
        <h3 className="text-[22px] font-bold text-[#0d1c2f] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1d4ed8]">history</span>
          Recent Circle Activity & Safety Check-ins
        </h3>

        <div className="space-y-3">
          <div className="p-3.5 bg-[#eff4ff] rounded-2xl flex items-center justify-between border border-[#dde9ff]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#059669] text-[24px]">check_circle</span>
              <span className="text-[17px] font-bold text-[#0d1c2f]">
                Morning Medication Notice delivered to Sarah Vance
              </span>
            </div>
            <span className="text-[15px] text-[#45464d] font-semibold">8:16 AM</span>
          </div>

          <div className="p-3.5 bg-[#eff4ff] rounded-2xl flex items-center justify-between border border-[#dde9ff]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#1d4ed8] text-[24px]">voicemail</span>
              <span className="text-[17px] font-bold text-[#0d1c2f]">
                Sarah Vance left voice note: "Checking in before afternoon meetings"
              </span>
            </div>
            <span className="text-[15px] text-[#45464d] font-semibold">7:55 AM</span>
          </div>

          <div className="p-3.5 bg-[#eff4ff] rounded-2xl flex items-center justify-between border border-[#dde9ff]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#1d4ed8] text-[24px]">event_available</span>
              <span className="text-[17px] font-bold text-[#0d1c2f]">
                Dr. Harrison clinic confirmed telehealth check-in for 4:30 PM
              </span>
            </div>
            <span className="text-[15px] text-[#45464d] font-semibold">Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
};
