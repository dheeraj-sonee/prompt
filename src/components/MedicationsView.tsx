import React, { useState } from 'react';
import { Medication } from '../types';
import { speakText } from '../utils/speech';

interface MedicationsViewProps {
  medications: Medication[];
  onMarkTaken: (id: string) => void;
  onOpenBottleScanner: () => void;
  onAddMedication: (newMed: Medication) => void;
}

export const MedicationsView: React.FC<MedicationsViewProps> = ({
  medications,
  onMarkTaken,
  onOpenBottleScanner,
  onAddMedication,
}) => {
  const [filter, setFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'bedtime'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newTime, setNewTime] = useState('12:00 PM');
  const [newTiming, setNewTiming] = useState<'morning' | 'afternoon' | 'evening' | 'bedtime'>('afternoon');
  const [newInstructions, setNewInstructions] = useState('');

  const filteredMeds = filter === 'all' ? medications : medications.filter((m) => m.timingCategory === filter);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const med: Medication = {
      id: `med-${Date.now()}`,
      name: newName.trim(),
      dosage: newDosage.trim() || '1 tablet',
      time: newTime,
      timingCategory: newTiming,
      statusBadge: newTiming === 'morning' ? 'Due Morning' : 'Scheduled',
      description: `${newDosage} • ${newInstructions || 'Take with water'}`,
      instructions: newInstructions || 'Take as directed with a full glass of water.',
      appearance: 'Prescribed tablet',
      isTaken: false,
      audioText: `${newName} ${newDosage}. ${newInstructions || 'Take with water.'}`,
    };

    onAddMedication(med);
    speakText(`Added ${newName} to your medication schedule.`);
    setShowAddForm(false);
    setNewName('');
    setNewDosage('');
    setNewInstructions('');
  };

  const takenCount = medications.filter((m) => m.isTaken).length;

  return (
    <div className="flex flex-col w-full text-[#0d1c2f] pb-36">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#cbd5e1] shadow-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-14 h-14 rounded-2xl bg-[#1d4ed8] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[34px]">medication</span>
            </span>
            <div>
              <h1 className="text-[32px] sm:text-[38px] font-extrabold text-[#0d1c2f] leading-none">
                Medication Manager
              </h1>
              <span className="text-[17px] text-[#45464d] font-semibold mt-1 inline-block">
                Clear schedule, visual pill descriptions, and audio instructions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[16px] font-bold border border-emerald-300">
              {takenCount} of {medications.length} Doses Taken Today
            </span>
            <button
              type="button"
              onClick={() => {
                speakText(
                  `You have taken ${takenCount} of your ${medications.length} daily medications today. Keep up the great health routine Eleanor!`
                );
              }}
              className="text-[#1d4ed8] text-[16px] font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
              <span>Read Summary</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenBottleScanner}
            className="min-h-[56px] px-6 rounded-2xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-[19px] flex items-center gap-2.5 shadow-md active:scale-98"
          >
            <span className="material-symbols-outlined text-[28px]">photo_camera</span>
            <span>Verify Bottle Scanner</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="min-h-[56px] px-6 rounded-2xl bg-[#eff4ff] hover:bg-[#dde9ff] text-[#0d1c2f] font-bold text-[19px] flex items-center gap-2 border border-[#cbd5e1] shadow-xs"
          >
            <span className="material-symbols-outlined text-[26px] text-[#1d4ed8]">
              {showAddForm ? 'close' : 'add'}
            </span>
            <span>{showAddForm ? 'Close Form' : 'Add Medication'}</span>
          </button>
        </div>
      </div>

      {/* Add Medication Simplified Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#1d4ed8] shadow-lg mb-8"
        >
          <h2 className="text-[24px] font-bold text-[#0d1c2f] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1d4ed8]">note_add</span>
            Add New Medication to Schedule
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[17px] font-bold text-[#0d1c2f] mb-1">
                Medicine Name:
              </label>
              <input
                type="text"
                placeholder="e.g. Lisinopril or Calcium"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full min-h-[54px] px-4 rounded-xl border-2 border-[#cbd5e1] focus:border-[#1d4ed8] text-[18px] text-[#0d1c2f]"
              />
            </div>

            <div>
              <label className="block text-[17px] font-bold text-[#0d1c2f] mb-1">
                Dosage & Strength:
              </label>
              <input
                type="text"
                placeholder="e.g. 10mg or 1 tablet"
                value={newDosage}
                onChange={(e) => setNewDosage(e.target.value)}
                className="w-full min-h-[54px] px-4 rounded-xl border-2 border-[#cbd5e1] focus:border-[#1d4ed8] text-[18px] text-[#0d1c2f]"
              />
            </div>

            <div>
              <label className="block text-[17px] font-bold text-[#0d1c2f] mb-1">
                Scheduled Time:
              </label>
              <input
                type="text"
                placeholder="e.g. 8:00 AM or 7:00 PM"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full min-h-[54px] px-4 rounded-xl border-2 border-[#cbd5e1] focus:border-[#1d4ed8] text-[18px] text-[#0d1c2f]"
              />
            </div>

            <div>
              <label className="block text-[17px] font-bold text-[#0d1c2f] mb-1">
                Time of Day:
              </label>
              <select
                value={newTiming}
                onChange={(e) => setNewTiming(e.target.value as any)}
                className="w-full min-h-[54px] px-4 rounded-xl border-2 border-[#cbd5e1] focus:border-[#1d4ed8] text-[18px] text-[#0d1c2f] bg-white"
              >
                <option value="morning">Morning (Breakfast)</option>
                <option value="afternoon">Afternoon (Lunch)</option>
                <option value="evening">Evening (Dinner)</option>
                <option value="bedtime">Bedtime (Before Sleep)</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[17px] font-bold text-[#0d1c2f] mb-1">
              Instructions (e.g. with water or with meal):
            </label>
            <input
              type="text"
              placeholder="e.g. Take with a full glass of water and light food."
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              className="w-full min-h-[54px] px-4 rounded-xl border-2 border-[#cbd5e1] focus:border-[#1d4ed8] text-[18px] text-[#0d1c2f]"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="min-h-[56px] px-8 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-[19px] shadow-md"
            >
              Save Medication
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="min-h-[56px] px-6 rounded-xl bg-[#eff4ff] text-[#0d1c2f] font-bold text-[18px]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-[17px] font-bold text-[#45464d] mr-2">Filter by Time:</span>
        {(['all', 'morning', 'afternoon', 'evening', 'bedtime'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setFilter(t);
              speakText(`Showing ${t} medications`);
            }}
            className={`min-h-[48px] px-5 rounded-xl font-bold text-[17px] capitalize transition-all ${
              filter === t
                ? 'bg-[#131b2e] text-white shadow-sm'
                : 'bg-white text-[#0d1c2f] hover:bg-[#eff4ff] border border-[#cbd5e1]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Medication Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMeds.map((med) => (
          <div
            key={med.id}
            className={`bg-white rounded-3xl p-6 sm:p-7 border-2 shadow-md flex flex-col justify-between transition-all ${
              med.isTaken ? 'border-emerald-400 bg-emerald-50/30' : 'border-[#cbd5e1]'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#e6eeff] text-[#1d4ed8] flex items-center justify-center shrink-0 border border-[#dde9ff]">
                    <span className="material-symbols-outlined text-[32px]">
                      {med.timingCategory === 'morning'
                        ? 'wb_sunny'
                        : med.timingCategory === 'afternoon'
                        ? 'light_mode'
                        : med.timingCategory === 'evening'
                        ? 'dark_mode'
                        : 'bedtime'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[24px] font-extrabold text-[#0d1c2f]">
                        {med.name}
                      </h3>
                      <span className="text-[20px] font-bold text-[#1d4ed8]">
                        {med.dosage}
                      </span>
                    </div>
                    <span className="text-[17px] font-bold text-[#45464d] block mt-0.5">
                      {med.time} • Scheduled {med.timingCategory}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3.5 py-1 rounded-full text-[14px] font-bold ${
                    med.isTaken
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                      : 'bg-[#eff4ff] text-[#1d4ed8] border border-[#dde9ff]'
                  }`}
                >
                  {med.isTaken ? '✓ Taken' : med.statusBadge}
                </span>
              </div>

              {/* Instructions Box */}
              <div className="bg-[#eff4ff] p-4 rounded-2xl border border-[#dde9ff] mb-4">
                <span className="text-[14px] font-bold text-[#1d4ed8] uppercase tracking-wide block mb-1">
                  How to Take:
                </span>
                <p className="text-[18px] text-[#0d1c2f] font-medium leading-relaxed">
                  {med.instructions}
                </p>
                <span className="text-[15px] text-[#45464d] block mt-2 pt-2 border-t border-[#cbd5e1]/60">
                  Appearance: {med.appearance}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onMarkTaken(med.id);
                  speakText(`Marked ${med.name} as taken.`);
                }}
                className={`flex-1 min-h-[52px] px-4 rounded-xl font-bold text-[18px] flex items-center justify-center gap-2 shadow-xs transition-all ${
                  med.isTaken
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-[#000000] hover:bg-[#233144] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">check_circle</span>
                <span>{med.isTaken ? 'Taken (Tap to Undo)' : 'Mark as Taken'}</span>
              </button>

              <button
                type="button"
                onClick={() => speakText(med.audioText)}
                className="min-h-[52px] px-4 rounded-xl bg-white hover:bg-[#eff4ff] text-[#1d4ed8] font-bold text-[17px] flex items-center gap-1.5 border border-[#1d4ed8] shadow-xs"
              >
                <span className="material-symbols-outlined text-[24px]">volume_up</span>
                <span>Read Aloud</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
