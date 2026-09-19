import React, { useState } from 'react';
import { speakText } from '../utils/speech';

export const HealthWellnessView: React.FC = () => {
  const [waterGlasses, setWaterGlasses] = useState(4); // 4 of 6 logged
  const [bloodPressure, setBloodPressure] = useState({ sys: 118, dia: 76 });
  const [showLogBP, setShowLogBP] = useState(false);
  const [inputSys, setInputSys] = useState('118');
  const [inputDia, setInputDia] = useState('76');

  // Chair Yoga interactive guided state
  const [isYogaActive, setIsYogaActive] = useState(false);
  const [yogaSeconds, setYogaSeconds] = useState(300); // 5 minute routine
  const [yogaStep, setYogaStep] = useState(1);

  const handleWaterTap = (index: number) => {
    const newGlasses = index < waterGlasses ? index : index + 1;
    setWaterGlasses(newGlasses);
    speakText(
      `Logged ${newGlasses} of 6 glasses of water. Great hydration Eleanor! Your body and heart thank you.`
    );
  };

  const handleSaveBP = (e: React.FormEvent) => {
    e.preventDefault();
    const sys = parseInt(inputSys, 10) || 120;
    const dia = parseInt(inputDia, 10) || 80;
    setBloodPressure({ sys, dia });
    setShowLogBP(false);
    speakText(
      `Blood pressure recorded: ${sys} over ${dia}. Readings are within Doctor Harrison's healthy target zone.`
    );
  };

  const toggleYoga = () => {
    if (!isYogaActive) {
      setIsYogaActive(true);
      speakText(
        'Starting 5-minute gentle chair yoga. Sit upright comfortably in your chair with feet flat on the floor. Take a deep, gentle breath in through your nose.'
      );
    } else {
      setIsYogaActive(false);
      speakText('Chair yoga paused. Take all the time you need to rest.');
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col w-full text-[#0d1c2f] pb-36">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#cbd5e1] shadow-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-14 h-14 rounded-2xl bg-[#1d4ed8] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[34px]">favorite</span>
            </span>
            <div>
              <h1 className="text-[32px] sm:text-[38px] font-extrabold text-[#0d1c2f] leading-none">
                Health & Daily Wellness
              </h1>
              <span className="text-[17px] text-[#45464d] font-semibold mt-1 inline-block">
                Gentle vitals tracking, hydration, and chair movement
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            speakText(
              `Health Summary for Eleanor. Blood pressure is optimal at ${bloodPressure.sys} over ${bloodPressure.dia}. Hydration: ${waterGlasses} of 6 glasses logged. Steps: 2,840 gentle steps today.`
            );
          }}
          className="min-h-[56px] px-6 rounded-2xl bg-[#eff4ff] hover:bg-[#dde9ff] text-[#1d4ed8] font-bold text-[19px] flex items-center gap-2 border border-[#dde9ff] shadow-xs"
        >
          <span className="material-symbols-outlined text-[26px]">record_voice_over</span>
          <span>Read Health Summary</span>
        </button>
      </div>

      {/* Grid: Vitals & Hydration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Blood Pressure & Heart Rate */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#cbd5e1] shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[24px] font-bold text-[#0d1c2f] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1d4ed8] text-[28px]">
                  vital_signs
                </span>
                Blood Pressure
              </span>
              <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[15px] font-bold border border-emerald-300">
                Optimal Zone
              </span>
            </div>

            <div className="bg-[#eff4ff] p-6 rounded-2xl border border-[#dde9ff] mb-4 text-center">
              <span className="text-[52px] font-extrabold text-[#0d1c2f] leading-none">
                {bloodPressure.sys} / {bloodPressure.dia}
              </span>
              <span className="text-[18px] text-[#45464d] font-bold block mt-1">
                mmHg • Measured Today 8:10 AM
              </span>
              <p className="text-[16px] text-[#059669] font-bold mt-2">
                ✓ Within Dr. Harrison's target range (below 130/80)
              </p>
            </div>

            {showLogBP && (
              <form onSubmit={handleSaveBP} className="bg-white p-4 rounded-xl border border-[#cbd5e1] mb-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[14px] font-bold block mb-1">Systolic (Top):</label>
                    <input
                      type="number"
                      value={inputSys}
                      onChange={(e) => setInputSys(e.target.value)}
                      className="w-full p-2.5 border rounded-lg text-[18px]"
                    />
                  </div>
                  <div>
                    <label className="text-[14px] font-bold block mb-1">Diastolic (Bottom):</label>
                    <input
                      type="number"
                      value={inputDia}
                      onChange={(e) => setInputDia(e.target.value)}
                      className="w-full p-2.5 border rounded-lg text-[18px]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full min-h-[48px] bg-[#059669] text-white font-bold rounded-xl text-[17px]"
                >
                  Save New Reading
                </button>
              </form>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowLogBP(!showLogBP)}
            className="w-full min-h-[52px] px-4 rounded-xl bg-white hover:bg-[#eff4ff] text-[#0d1c2f] font-bold text-[18px] border border-[#cbd5e1] shadow-xs"
          >
            {showLogBP ? 'Cancel' : 'Log New Blood Pressure Reading'}
          </button>
        </div>

        {/* Daily Hydration Water Tracker */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#cbd5e1] shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[24px] font-bold text-[#0d1c2f] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1d4ed8] text-[28px]">
                  water_drop
                </span>
                Hydration Tracker
              </span>
              <span className="text-[18px] font-bold text-[#1d4ed8]">
                {waterGlasses} of 6 Glasses
              </span>
            </div>

            <p className="text-[17px] text-[#45464d] mb-4">
              Tap a cup each time you enjoy a glass of water or herbal tea:
            </p>

            {/* 6 Large Interactive Water Cups */}
            <div className="grid grid-cols-6 gap-2 sm:gap-3 my-4">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const isFilled = idx < waterGlasses;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleWaterTap(idx)}
                    aria-label={`Glass ${idx + 1} of 6 ${isFilled ? 'Drank' : 'Empty'}`}
                    className={`min-h-[84px] rounded-2xl flex flex-col items-center justify-center p-2 border-2 transition-all cursor-pointer ${
                      isFilled
                        ? 'bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-sm scale-102'
                        : 'bg-[#eff4ff] text-[#45464d] border-[#cbd5e1] hover:border-[#1d4ed8]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[32px]">
                      {isFilled ? 'water_full' : 'water_loss'}
                    </span>
                    <span className="text-[14px] font-bold mt-1">#{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#eff4ff] p-3.5 rounded-2xl border border-[#dde9ff] flex items-center gap-3">
            <span className="material-symbols-outlined text-[#1d4ed8] text-[24px]">info</span>
            <span className="text-[16px] text-[#0d1c2f] font-semibold">
              Proper hydration reduces dizziness and helps medication absorb gently.
            </span>
          </div>
        </div>
      </div>

      {/* Guided Chair Yoga Session */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#cbd5e1] shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-[#e6eeff] text-[#1d4ed8] flex items-center justify-center">
              <span className="material-symbols-outlined text-[30px]">self_improvement</span>
            </span>
            <div>
              <h2 className="text-[26px] font-bold text-[#0d1c2f] leading-tight">
                Gentle Chair Yoga (10:30 AM)
              </h2>
              <span className="text-[17px] text-[#45464d]">
                Seated stretches for joint comfort, shoulder relaxation, and circulation
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleYoga}
            className={`min-h-[56px] px-8 rounded-2xl font-bold text-[19px] flex items-center gap-2.5 shadow-md transition-all active:scale-98 ${
              isYogaActive
                ? 'bg-[#ba1a1a] text-white'
                : 'bg-[#1d4ed8] hover:bg-[#1e40af] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[28px]">
              {isYogaActive ? 'pause' : 'play_arrow'}
            </span>
            <span>{isYogaActive ? 'Pause Session' : 'Start 5-Min Guided Session'}</span>
          </button>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-5 rounded-2xl border-2 transition-all ${yogaStep === 1 && isYogaActive ? 'border-[#1d4ed8] bg-[#eff4ff]' : 'border-[#cbd5e1] bg-white'}`}>
            <span className="text-[14px] font-bold text-[#1d4ed8] uppercase tracking-wide">
              Step 1 • 2 Minutes
            </span>
            <h3 className="text-[20px] font-bold text-[#0d1c2f] mt-1 mb-2">
              Seated Deep Breathing
            </h3>
            <p className="text-[16px] text-[#45464d] leading-relaxed">
              Sit back tall. Place hands on knees. Inhale through your nose for 4 counts, feel your chest expand, then exhale slowly.
            </p>
          </div>

          <div className={`p-5 rounded-2xl border-2 transition-all ${yogaStep === 2 && isYogaActive ? 'border-[#1d4ed8] bg-[#eff4ff]' : 'border-[#cbd5e1] bg-white'}`}>
            <span className="text-[14px] font-bold text-[#1d4ed8] uppercase tracking-wide">
              Step 2 • 2 Minutes
            </span>
            <h3 className="text-[20px] font-bold text-[#0d1c2f] mt-1 mb-2">
              Gentle Shoulder Rolls
            </h3>
            <p className="text-[16px] text-[#45464d] leading-relaxed">
              Lift shoulders up toward your ears, gently roll them backwards and down. Releases tension in the neck and upper back.
            </p>
          </div>

          <div className={`p-5 rounded-2xl border-2 transition-all ${yogaStep === 3 && isYogaActive ? 'border-[#1d4ed8] bg-[#eff4ff]' : 'border-[#cbd5e1] bg-white'}`}>
            <span className="text-[14px] font-bold text-[#1d4ed8] uppercase tracking-wide">
              Step 3 • 1 Minute
            </span>
            <h3 className="text-[20px] font-bold text-[#0d1c2f] mt-1 mb-2">
              Ankle & Wrist Circles
            </h3>
            <p className="text-[16px] text-[#45464d] leading-relaxed">
              Lift one foot slightly and draw gentle circles with your toes. Switch to wrists. Promotes blood flow to hands and feet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
