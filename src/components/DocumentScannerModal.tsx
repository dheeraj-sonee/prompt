import React, { useState } from 'react';
import { speakText } from '../utils/speech';
import { useA11yModal } from '../utils/useA11yModal';

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDocument: (doc: { title: string; originalText: string; easySummary: string }) => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose,
  onSaveDocument,
}) => {
  const [docType, setDocType] = useState<'cardiology' | 'insurance' | 'prescription'>('cardiology');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analyzedDoc, setAnalyzedDoc] = useState<{
    title: string;
    original: string;
    summary: string;
  } | null>(null);
  const modalRef = useA11yModal(isOpen, onClose);

  if (!isOpen) return null;

  const handleScanPreset = (type: 'cardiology' | 'insurance' | 'prescription') => {
    setDocType(type);
    setIsProcessing(true);
    speakText('Scanning document page. AI is creating a simplified large print summary.');

    setTimeout(() => {
      setIsProcessing(false);
      if (type === 'cardiology') {
        const doc = {
          title: 'Dr. Harrison Cardiology Notice',
          original: 'Notice from Dr. Harrison: Follow-up cardiology appointment confirmed for Tuesday at 10:30 AM. No fasting required. Bring current medication list.',
          summary: 'Your heart doctor visit is next Tuesday at 10:30 AM. You can eat breakfast normally beforehand.',
        };
        setAnalyzedDoc(doc);
        speakText(doc.summary);
      } else if (type === 'insurance') {
        const doc = {
          title: 'Medicare Coverage Confirmation',
          original: 'Explanation of Benefits: Comprehensive physical exam and quarterly blood panel on Oct 12 were covered at 100%. Patient copay balance is $0.00.',
          summary: 'Your recent checkup and blood tests are completely paid by Medicare. You owe zero dollars.',
        };
        setAnalyzedDoc(doc);
        speakText(doc.summary);
      } else {
        const doc = {
          title: 'Valley Pharmacy Auto-Refill Alert',
          original: 'Valley Rx #99482: Blood pressure tablet Lisinopril 10mg refilled and dispatched via free door-to-door courier today at 2:30 PM.',
          summary: 'Your blood pressure pills are on the way. The courier will deliver them directly to your front door this afternoon at 2:30 PM.',
        };
        setAnalyzedDoc(doc);
        speakText(doc.summary);
      }
    }, 1500);
  };

  const handleSave = () => {
    if (analyzedDoc) {
      onSaveDocument({
        title: analyzedDoc.title,
        originalText: analyzedDoc.original,
        easySummary: analyzedDoc.summary,
      });
      speakText('Saved document into your records and sent notification to daughter Sarah.');
      onClose();
    }
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-scanner-title"
      className="fixed inset-0 z-50 bg-[#0d1c2f]/80 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#1d4ed8] flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#cbd5e1]">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-[#e6eeff] text-[#1d4ed8] flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">document_scanner</span>
            </span>
            <div>
              <h2 id="doc-scanner-title" className="text-[24px] font-bold text-[#0d1c2f]">
                Scan Document or Letter
              </h2>
              <p className="text-[17px] text-[#45464d]">
                Instant simplified reading with no small print
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close document scanner"
            className="min-h-[48px] min-w-[48px] rounded-xl bg-[#eff4ff] text-[#0d1c2f] hover:bg-[#dde9ff] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>

        {/* Camera / Scan Selector */}
        <div className="my-5">
          <span className="block text-[17px] font-bold text-[#0d1c2f] mb-2">
            Select or point camera at a document:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleScanPreset('cardiology')}
              className={`p-3 rounded-xl text-left border-2 transition-all ${
                docType === 'cardiology'
                  ? 'border-[#1d4ed8] bg-[#eff4ff]'
                  : 'border-[#cbd5e1] hover:bg-[#f8f9ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[#1d4ed8] text-[26px] block mb-1">
                local_hospital
              </span>
              <span className="text-[17px] font-bold text-[#0d1c2f] block leading-tight">
                Doctor Letter
              </span>
              <span className="text-[13px] text-[#45464d]">Cardiology follow-up</span>
            </button>

            <button
              type="button"
              onClick={() => handleScanPreset('insurance')}
              className={`p-3 rounded-xl text-left border-2 transition-all ${
                docType === 'insurance'
                  ? 'border-[#1d4ed8] bg-[#eff4ff]'
                  : 'border-[#cbd5e1] hover:bg-[#f8f9ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[#1d4ed8] text-[26px] block mb-1">
                policy
              </span>
              <span className="text-[17px] font-bold text-[#0d1c2f] block leading-tight">
                Medicare / Bill
              </span>
              <span className="text-[13px] text-[#45464d]">Coverage notice ($0)</span>
            </button>

            <button
              type="button"
              onClick={() => handleScanPreset('prescription')}
              className={`p-3 rounded-xl text-left border-2 transition-all ${
                docType === 'prescription'
                  ? 'border-[#1d4ed8] bg-[#eff4ff]'
                  : 'border-[#cbd5e1] hover:bg-[#f8f9ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[#1d4ed8] text-[26px] block mb-1">
                medication
              </span>
              <span className="text-[17px] font-bold text-[#0d1c2f] block leading-tight">
                Pharmacy Delivery
              </span>
              <span className="text-[13px] text-[#45464d]">Courier status</span>
            </button>
          </div>
        </div>

        {/* Processing Spinner or Result */}
        {isProcessing && (
          <div className="my-6 p-8 bg-[#eff4ff] rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-[20px] font-bold text-[#0d1c2f]">
              Translating Fine Print into Plain English...
            </p>
          </div>
        )}

        {analyzedDoc && !isProcessing && (
          <div className="my-4 space-y-4">
            {/* Scanned Original Text Box */}
            <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#cbd5e1]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-[#1d4ed8] text-[20px]">
                  description
                </span>
                <span className="text-[16px] font-bold text-[#1d4ed8]">
                  Scanned Original: {analyzedDoc.title}
                </span>
              </div>
              <p className="text-[17px] text-[#45464d] italic leading-relaxed">
                "{analyzedDoc.original}"
              </p>
            </div>

            {/* 2-Sentence Easy AI Summary */}
            <div className="bg-[#d5e3fd] p-5 rounded-2xl border-2 border-[#1d4ed8]">
              <span className="text-[18px] font-extrabold text-[#000000] block mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#1d4ed8] text-[24px]">auto_awesome</span>
                ✨ 2-Sentence AI Easy Summary:
              </span>
              <p className="text-[22px] font-bold text-[#0d1c2f] leading-snug">
                {analyzedDoc.summary}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-[#cbd5e1]">
          {analyzedDoc && (
            <button
              type="button"
              onClick={() => speakText(analyzedDoc.summary)}
              className="flex-1 min-h-[56px] rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-[19px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <span className="material-symbols-outlined text-[26px]">volume_up</span>
              <span>Read Summary Aloud</span>
            </button>
          )}
          {analyzedDoc && (
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 min-h-[56px] rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-[19px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <span className="material-symbols-outlined text-[26px]">send</span>
              <span>Send Copy to Daughter Sarah</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
