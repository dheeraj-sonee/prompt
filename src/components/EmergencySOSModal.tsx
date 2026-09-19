import React, { useState, useEffect } from 'react';
import { speakText, stopSpeaking } from '../utils/speech';
import { useA11yModal } from '../utils/useA11yModal';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ isOpen, onClose }) => {
  const [countdown, setCountdown] = useState(5);
  const [isTriggered, setIsTriggered] = useState(false);
  const modalRef = useA11yModal(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setIsTriggered(false);
      return;
    }

    speakText('Emergency SOS initiated. Calling emergency services in 5 seconds. Tap cancel if this is accidental.');
    setCountdown(5);
    setIsTriggered(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTriggered(true);
          speakText('Connecting to 911 dispatch now. Daughter Sarah Vance and Doctor Harrison clinic have been alerted with your live location. Please remain calm.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImmediateConnect = () => {
    setCountdown(0);
    setIsTriggered(true);
    speakText('Connecting to emergency dispatcher right now. Help is on the way.');
  };

  const handleCancel = () => {
    stopSpeaking();
    speakText('Emergency alarm canceled. All emergency contacts notified that you are safe.');
    onClose();
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
      aria-describedby="sos-modal-desc"
      className="fixed inset-0 z-50 bg-[#0d1c2f]/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-[#ba1a1a] flex flex-col items-center text-center">
        {/* Urgent Icon */}
        <div className="w-24 h-24 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center mb-4 shadow-lg animate-bounce">
          <span className="material-symbols-outlined text-[64px]">emergency</span>
        </div>

        <span className="px-4 py-1.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[18px] font-bold tracking-wide uppercase mb-3">
          Emergency Alert Triggered
        </span>

        <h2 id="sos-modal-title" className="text-[34px] sm:text-[42px] font-bold text-[#0d1c2f] leading-tight mb-2">
          {!isTriggered ? (
            <>
              Contacting Help in{' '}
              <span className="text-[#ba1a1a] font-extrabold text-[48px] sm:text-[56px]">
                {countdown}
              </span>
              s
            </>
          ) : (
            <span className="text-[#ba1a1a]">Dispatching Help Now</span>
          )}
        </h2>

        <p id="sos-modal-desc" className="text-[20px] sm:text-[22px] text-[#45464d] max-w-md mb-8 leading-relaxed">
          {!isTriggered
            ? "Notifying 911 dispatch, Dr. Harrison's clinic, and your daughter Sarah Vance with your location."
            : 'Line is live. 911 operator connected. Sarah has received the instant alert on her phone.'}
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-4">
          {!isTriggered && (
            <button
              id="sos-connect-immediately-btn"
              type="button"
              onClick={handleImmediateConnect}
              className="w-full min-h-[64px] rounded-2xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[22px] font-bold shadow-lg transition-all flex items-center justify-center gap-3 border-2 border-red-300 active:scale-98"
            >
              <span className="material-symbols-outlined text-[32px]">sos</span>
              <span>Connect Call Immediately</span>
            </button>
          )}

          <button
            id="sos-cancel-alarm-btn"
            type="button"
            onClick={handleCancel}
            className="w-full min-h-[56px] rounded-2xl bg-[#e6eeff] hover:bg-[#dde9ff] text-[#0d1c2f] text-[20px] font-bold transition-all shadow-sm border-2 border-[#cbd5e1] active:scale-98"
          >
            <span>I'm Okay (Cancel Alarm)</span>
          </button>
        </div>

        <span className="text-[17px] text-[#45464d] font-semibold mt-6 bg-[#f8f9ff] px-4 py-2 rounded-xl border border-[#dde9ff]">
          False alarms are completely okay. You can cancel anytime.
        </span>
      </div>
    </div>
  );
};
