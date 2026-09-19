import React, { useState } from 'react';
import { CompanionMessage } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface AICompanionViewProps {
  initialPrompt?: string;
}

export const AICompanionView: React.FC<AICompanionViewProps> = ({ initialPrompt }) => {
  const [messages, setMessages] = useState<CompanionMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Good morning Eleanor! I am your CompanionCare assistant. How can I brighten your day, help with your medications, or connect you with family?',
      timestamp: '10:15 AM',
      audioSpoken: true,
    },
  ]);

  const [inputVal, setInputVal] = useState(initialPrompt || '');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const predefinedPrompts = [
    'Explain my medicines',
    "What's on my schedule today?",
    "Call my daughter Sarah",
    'Tips for better sleep tonight',
    'Tell me an uplifting story',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    const userMsg: CompanionMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      // Attempt backend call to /api/chat if available
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.reply || getLocalFallbackReply(query);
        addAssistantReply(replyText);
      } else {
        addAssistantReply(getLocalFallbackReply(query));
      }
    } catch {
      addAssistantReply(getLocalFallbackReply(query));
    } finally {
      setIsLoading(false);
    }
  };

  const addAssistantReply = (text: string) => {
    const aiMsg: CompanionMessage = {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      audioSpoken: false,
    };
    setMessages((prev) => [...prev, aiMsg]);
    speakText(text);
  };

  const getLocalFallbackReply = (query: string): string => {
    const lower = query.toLowerCase();
    if (lower.includes('medicine') || lower.includes('medication') || lower.includes('pill') || lower.includes('aspirin')) {
      return 'You have 4 medications today Eleanor: Aspirin 81mg due now with water, Vitamin D3 after lunch, Metformin with evening dinner, and Magnesium before bedtime.';
    }
    if (lower.includes('schedule') || lower.includes('today') || lower.includes('routine')) {
      return 'Your schedule today: 10:30 AM Chair Yoga in the living room, 2:00 PM grocery delivery, 4:30 PM video check-in with Dr. Harrison, and a 6:00 PM evening walk with Martha.';
    }
    if (lower.includes('sarah') || lower.includes('daughter') || lower.includes('call')) {
      return 'Sarah sent you a sweet voice note 20 minutes ago. You can tap the "1-Tap Video Call" button on the Care Circle tab anytime to see her face-to-face.';
    }
    if (lower.includes('sleep') || lower.includes('bed')) {
      return 'For restful sleep tonight: keep your bedroom pleasantly cool, take your Magnesium Glycinate 30 minutes before bed with a small sip of water, and enjoy a warm chamomile tea.';
    }
    if (lower.includes('story') || lower.includes('uplift')) {
      return 'Here is a gentle thought: Every morning brings new sunshine and quiet joy. Your garden flowers are blooming today, and you are surrounded by family who love and cherish you deeply.';
    }
    return `I heard you ask: "${query}". I am right here by your side Eleanor. Everything on your routine is calm, safe, and up to date!`;
  };

  const toggleVoiceInput = () => {
    if (!isListening) {
      setIsListening(true);
      speakText('I am listening Eleanor, please speak.');

      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        try {
          const rec = new SpeechRec();
          rec.continuous = false;
          rec.interimResults = false;
          rec.lang = 'en-US';
          rec.onresult = (e: any) => {
            const spoken = e.results[0][0].transcript;
            setIsListening(false);
            handleSend(spoken);
          };
          rec.onerror = () => setIsListening(false);
          rec.onend = () => setIsListening(false);
          rec.start();
        } catch {
          setTimeout(() => setIsListening(false), 4000);
        }
      } else {
        setTimeout(() => setIsListening(false), 3000);
      }
    } else {
      setIsListening(false);
      stopSpeaking();
    }
  };

  return (
    <div className="flex flex-col w-full text-[#0d1c2f] pb-36">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#cbd5e1] shadow-md mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-14 h-14 rounded-2xl bg-[#1d4ed8] text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[34px]">smart_toy</span>
          </span>
          <div>
            <h1 className="text-[32px] sm:text-[38px] font-extrabold text-[#0d1c2f] leading-none">
              AI Voice Companion
            </h1>
            <span className="text-[17px] text-[#45464d] font-semibold mt-1 inline-block">
              Patient, warm, and ready to answer any question anytime
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            speakText(
              'Hello Eleanor! You can speak into your microphone or tap any suggested question below. I am always listening.'
            );
          }}
          className="min-h-[52px] px-5 rounded-2xl bg-[#eff4ff] hover:bg-[#dde9ff] text-[#1d4ed8] font-bold text-[18px] flex items-center gap-2 border border-[#dde9ff]"
        >
          <span className="material-symbols-outlined text-[24px]">help</span>
          <span>How to Use Voice</span>
        </button>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="flex flex-wrap items-center gap-2.5 mb-6">
        <span className="text-[17px] font-bold text-[#45464d] mr-1">Ask Companion:</span>
        {predefinedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSend(prompt)}
            className="min-h-[48px] px-4 rounded-xl bg-white hover:bg-[#eff4ff] text-[#0d1c2f] font-bold text-[16px] border border-[#cbd5e1] shadow-xs transition-all"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#cbd5e1] shadow-md min-h-[420px] flex flex-col justify-between mb-6">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((msg) => {
            const isAI = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-12 h-12 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[26px]">smart_toy</span>
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-5 shadow-xs border ${
                    isAI
                      ? 'bg-[#eff4ff] border-[#dde9ff] text-[#0d1c2f]'
                      : 'bg-[#131b2e] border-[#131b2e] text-white'
                  }`}
                >
                  <p className="text-[20px] font-medium leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/10">
                    <span className={`text-[14px] font-semibold ${isAI ? 'text-[#45464d]' : 'text-gray-300'}`}>
                      {msg.timestamp}
                    </span>
                    {isAI && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.text)}
                        className="text-[#1d4ed8] font-bold text-[15px] flex items-center gap-1 hover:underline"
                      >
                        <span className="material-symbols-outlined text-[20px]">volume_up</span>
                        <span>Read Aloud</span>
                      </button>
                    )}
                  </div>
                </div>

                {!isAI && (
                  <div className="w-12 h-12 rounded-full bg-[#3b82f6] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[26px]">person</span>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3.5 items-center">
              <div className="w-12 h-12 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-[26px]">smart_toy</span>
              </div>
              <div className="bg-[#eff4ff] p-4 rounded-2xl border border-[#dde9ff] flex items-center gap-2">
                <span className="text-[18px] font-bold text-[#0d1c2f]">
                  Companion is preparing answer...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input & Microphone Bar */}
        <div className="mt-6 pt-4 border-t border-[#cbd5e1]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              aria-label="Speak using microphone"
              className={`min-h-[58px] min-w-[58px] rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 ${
                isListening
                  ? 'bg-[#ba1a1a] text-white animate-pulse'
                  : 'bg-[#1d4ed8] hover:bg-[#1e40af] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[32px]">
                {isListening ? 'mic' : 'mic'}
              </span>
            </button>

            <input
              type="text"
              placeholder="Ask a question or type a message..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 min-h-[58px] px-5 rounded-2xl border-2 border-[#cbd5e1] focus:border-[#1d4ed8] text-[20px] text-[#0d1c2f] bg-white"
            />

            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="min-h-[58px] px-7 rounded-2xl bg-[#000000] hover:bg-[#233144] disabled:opacity-40 text-white font-bold text-[19px] flex items-center gap-2 shadow-md transition-all active:scale-98"
            >
              <span>Send</span>
              <span className="material-symbols-outlined text-[24px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
