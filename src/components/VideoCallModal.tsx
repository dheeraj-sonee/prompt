import React, { useState, useEffect } from 'react';
import { speakText } from '../utils/speech';
import { useA11yModal } from '../utils/useA11yModal';

interface VideoCallModalProps {
  isOpen: boolean;
  contactName: string;
  contactRole: string;
  onClose: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  contactName,
  contactRole,
  onClose,
}) => {
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerBoost, setIsSpeakerBoost] = useState(true);
  const modalRef = useA11yModal(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) {
      setCallStatus('connecting');
      setCallDuration(0);
      return;
    }

    speakText(`Connecting 1-tap video call with ${contactName}...`);
    const timer = setTimeout(() => {
      setCallStatus('connected');
      speakText(`${contactName} has joined the call. High volume audio connected.`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isOpen, contactName]);

  useEffect(() => {
    if (callStatus !== 'connected') return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  if (!isOpen) return null;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleEndCall = () => {
    speakText(`Call with ${contactName} ended.`);
    onClose();
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-call-title"
      className="fixed inset-0 z-50 bg-[#0d1c2f]/85 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-3xl bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#1d4ed8] flex flex-col">
        {/* Call Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#cbd5e1]">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center text-[20px] font-bold">
              {contactName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </span>
            <div>
              <h2 id="video-call-title" className="text-[24px] font-bold text-[#0d1c2f] leading-none">
                {contactName}
              </h2>
              <span className="text-[16px] text-[#45464d] font-semibold mt-1 inline-block">
                {contactRole} • {callStatus === 'connecting' ? 'Calling...' : `Connected (${formatSeconds(callDuration)})`}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#e6eeff] text-[#1d4ed8] text-[15px] font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1d4ed8] animate-ping"></span>
            Encrypted Line
          </span>
        </div>

        {/* Video Canvas Simulation */}
        <div className="my-5 relative rounded-2xl bg-[#131b2e] h-80 sm:h-96 flex flex-col items-center justify-center overflow-hidden border-2 border-[#dde9ff] shadow-inner">
          {callStatus === 'connecting' ? (
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-20 h-20 rounded-full bg-[#1d4ed8]/40 border-4 border-[#60a5fa] flex items-center justify-center animate-pulse mb-4">
                <span className="material-symbols-outlined text-white text-[44px]">video_call</span>
              </div>
              <p className="text-white text-[24px] font-bold">Ringing {contactName}...</p>
              <span className="text-[#bec6e0] text-[17px] mt-1">Speaker volume boosted for crystal clear hearing</span>
            </div>
          ) : (
            <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-[#131b2e] to-[#233144]">
              {/* Remote Contact Video Simulation */}
              <div className="flex flex-col items-center text-center p-4 z-10">
                <div className="w-28 h-28 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-[36px] font-bold mb-3 shadow-xl border-4 border-white/20">
                  {contactName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <h3 className="text-white text-[26px] font-bold">{contactName}</h3>
                <span className="text-emerald-300 text-[18px] font-semibold flex items-center gap-1 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  HD Video & Audio Connected
                </span>
              </div>

              {/* Eleanor's Self-Preview in Corner */}
              <div className="absolute bottom-4 right-4 w-28 h-36 bg-[#0d1c2f] rounded-xl border-2 border-white/40 overflow-hidden shadow-lg flex flex-col items-center justify-center">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuG_YTerxcLx4BAf4Yg-h0Wi14u8BSEJOq9eXm6vxGv8INkiy3ZvIaaIbqqdm1cgMGa6jeulu7WnpNbkQEXjeokFj4gRdxtzRD2VYvnpKsMhwJWjSZUBmHFZUke55LdlY3bKQGX7j_fT7gDBgK6X3AOrRVuuBxhese-Nj8q1-f8TIR-noj3IGaoU2dyh59dyMx3QUiahunCB_P9_yqonD-gWpVQRbSuMFA5SHRLD0QAI_lkiqP8_vn"
                  alt="You"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 bg-black/60 text-white text-[12px] font-bold px-2 py-0.5 rounded">
                  You (Eleanor)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              setIsMuted(!isMuted);
              speakText(!isMuted ? 'Microphone muted' : 'Microphone unmuted');
            }}
            className={`min-h-[56px] px-6 rounded-2xl font-bold text-[18px] flex items-center gap-2 border-2 transition-all ${
              isMuted
                ? 'bg-amber-100 border-amber-400 text-amber-900'
                : 'bg-[#eff4ff] border-[#cbd5e1] text-[#0d1c2f]'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isMuted ? 'mic_off' : 'mic'}
            </span>
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSpeakerBoost(!isSpeakerBoost);
              speakText(!isSpeakerBoost ? 'Speaker boost 150 percent enabled' : 'Speaker normal');
            }}
            className={`min-h-[56px] px-6 rounded-2xl font-bold text-[18px] flex items-center gap-2 border-2 transition-all ${
              isSpeakerBoost
                ? 'bg-[#1d4ed8] border-[#1d4ed8] text-white'
                : 'bg-[#eff4ff] border-[#cbd5e1] text-[#0d1c2f]'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">volume_up</span>
            <span>Speaker {isSpeakerBoost ? 'Boost 150%' : 'Normal'}</span>
          </button>

          <button
            type="button"
            onClick={handleEndCall}
            className="min-h-[56px] px-8 rounded-2xl bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold text-[20px] flex items-center gap-2 shadow-lg transition-all active:scale-98"
          >
            <span className="material-symbols-outlined text-[26px]">call_end</span>
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
