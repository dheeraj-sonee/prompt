import React, { useState } from 'react';
import { speakText } from '../utils/speech';
import { useA11yModal } from '../utils/useA11yModal';

interface PillScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (medName: string) => void;
}

export const PillScannerModal: React.FC<PillScannerModalProps> = ({
  isOpen,
  onClose,
  onVerified,
}) => {
  const [scanState, setScanState] = useState<'viewfinder' | 'scanning' | 'matched'>('viewfinder');
  const [selectedSample, setSelectedSample] = useState<'aspirin' | 'vitamind' | 'metformin'>('aspirin');
  const modalRef = useA11yModal(isOpen, onClose);

  if (!isOpen) return null;

  const handleStartScan = () => {
    setScanState('scanning');
    speakText('Analyzing bottle label and barcode. Hold steady.');
    setTimeout(() => {
      setScanState('matched');
      if (selectedSample === 'aspirin') {
        speakText('Bottle Verified: Aspirin 81 milligrams. This is your morning heart medication. Match confirmed!');
      } else if (selectedSample === 'vitamind') {
        speakText('Bottle Verified: Vitamin D3 1000 IU. Scheduled for after lunch.');
      } else {
        speakText('Bottle Verified: Metformin 500 milligrams. Scheduled for evening dinner.');
      }
    }, 1800);
  };

  const handleConfirmDose = () => {
    const medName = selectedSample === 'aspirin' ? 'Aspirin' : selectedSample === 'vitamind' ? 'Vitamin D3' : 'Metformin';
    onVerified(medName);
    onClose();
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pill-scanner-title"
      className="fixed inset-0 z-50 bg-[#0d1c2f]/80 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#1d4ed8] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#cbd5e1]">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-[#e6eeff] text-[#1d4ed8] flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">photo_camera</span>
            </span>
            <div>
              <h2 id="pill-scanner-title" className="text-[24px] font-bold text-[#0d1c2f]">
                Verify Bottle with Scanner
              </h2>
              <p className="text-[17px] text-[#45464d]">
                Hold your pill bottle or prescription box up to the camera
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Scanner"
            className="min-h-[48px] min-w-[48px] rounded-xl bg-[#eff4ff] text-[#0d1c2f] hover:bg-[#dde9ff] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>

        {/* Viewfinder simulation */}
        <div className="my-6 relative rounded-2xl bg-[#131b2e] h-72 flex flex-col items-center justify-center overflow-hidden border-4 border-[#1d4ed8]/40 shadow-inner">
          {scanState === 'viewfinder' && (
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-48 h-40 border-2 border-dashed border-[#60a5fa] rounded-2xl flex items-center justify-center mb-3 relative">
                <span className="material-symbols-outlined text-[#60a5fa] text-[56px] opacity-70">
                  qr_code_scanner
                </span>
                <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white"></span>
                <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white"></span>
                <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white"></span>
                <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white"></span>
              </div>
              <p className="text-white text-[19px] font-bold">
                Position prescription label inside the guidelines
              </p>
              <span className="text-[#bec6e0] text-[15px] mt-1">
                Camera auto-focuses on barcode and drug name
              </span>
            </div>
          )}

          {scanState === 'scanning' && (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 border-4 border-[#60a5fa] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white text-[22px] font-bold">Scanning Label...</p>
              <span className="text-[#bec6e0] text-[16px] mt-1">Verifying dosage with Doctor Harrison's orders</span>
            </div>
          )}

          {scanState === 'matched' && (
            <div className="flex flex-col items-center text-center p-4 bg-[#131b2e]/95 w-full h-full justify-center animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-[#059669] text-white flex items-center justify-center mb-2 shadow-lg">
                <span className="material-symbols-outlined text-[40px]">verified</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 text-[16px] font-bold mb-1">
                ✓ 100% Prescription Match
              </span>
              <h3 className="text-white text-[24px] font-extrabold">
                {selectedSample === 'aspirin' ? 'Aspirin 81mg (Enteric Coated)' : selectedSample === 'vitamind' ? 'Vitamin D3 1000 IU' : 'Metformin 500mg'}
              </h3>
              <p className="text-[#dde9ff] text-[18px] mt-1 max-w-md">
                {selectedSample === 'aspirin'
                  ? 'Due right now with breakfast. 1 yellow oval tablet.'
                  : 'Due after lunch. 1 small clear softgel.'}
              </p>
            </div>
          )}
        </div>

        {/* Sample selection pills for quick testing */}
        <div className="bg-[#eff4ff] p-3 rounded-2xl mb-6">
          <span className="block text-[15px] font-bold text-[#45464d] mb-2">
            Try Sample Bottle Prescriptions:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setSelectedSample('aspirin'); setScanState('viewfinder'); }}
              className={`px-4 py-2 rounded-xl text-[16px] font-bold transition-colors ${
                selectedSample === 'aspirin'
                  ? 'bg-[#1d4ed8] text-white'
                  : 'bg-white text-[#0d1c2f] border border-[#cbd5e1]'
              }`}
            >
              Aspirin 81mg (Morning Due)
            </button>
            <button
              type="button"
              onClick={() => { setSelectedSample('vitamind'); setScanState('viewfinder'); }}
              className={`px-4 py-2 rounded-xl text-[16px] font-bold transition-colors ${
                selectedSample === 'vitamind'
                  ? 'bg-[#1d4ed8] text-white'
                  : 'bg-white text-[#0d1c2f] border border-[#cbd5e1]'
              }`}
            >
              Vitamin D3 (After Lunch)
            </button>
            <button
              type="button"
              onClick={() => { setSelectedSample('metformin'); setScanState('viewfinder'); }}
              className={`px-4 py-2 rounded-xl text-[16px] font-bold transition-colors ${
                selectedSample === 'metformin'
                  ? 'bg-[#1d4ed8] text-white'
                  : 'bg-white text-[#0d1c2f] border border-[#cbd5e1]'
              }`}
            >
              Metformin 500mg (Dinner)
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {scanState !== 'matched' ? (
            <button
              type="button"
              onClick={handleStartScan}
              className="flex-1 min-h-[56px] rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-[20px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <span className="material-symbols-outlined text-[28px]">center_focus_strong</span>
              <span>Tap to Snap & Verify Bottle</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmDose}
              className="flex-1 min-h-[56px] rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-[20px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
              <span>Mark This Bottle as Taken</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="min-h-[56px] px-6 rounded-xl bg-[#e6eeff] hover:bg-[#dde9ff] text-[#0d1c2f] text-[18px] font-bold border border-[#cbd5e1]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
