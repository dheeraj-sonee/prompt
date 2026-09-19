/**
 * Speech synthesis utility for CompanionCare AI
 * Supports custom speech speed, audio boost, and screen-reader announcements
 */

let isAudioBoosted = false;
let currentSpeechSpeed = 1.0;

export function setSpeechOptions(speed: number, boost: boolean) {
  currentSpeechSpeed = speed;
  isAudioBoosted = boost;
}

export function speakText(
  text: string, 
  options?: { 
    speed?: number; 
    boost?: boolean; 
    onEnd?: () => void; 
    onStart?: () => void;
  }
) {
  if (typeof window === 'undefined') return;

  const speed = options?.speed ?? currentSpeechSpeed;
  const boost = options?.boost ?? isAudioBoosted;

  // Screen reader assertive announcement
  announceToScreenReader(text);

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.pitch = 1.0;
    utterance.volume = boost ? 1.0 : 0.9;

    // Pick warm natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen')) && v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    if (options?.onStart) {
      utterance.onstart = options.onStart;
    }
    if (options?.onEnd) {
      utterance.onend = options.onEnd;
      utterance.onerror = options.onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } else {
    if (options?.onEnd) {
      setTimeout(options.onEnd, 1500);
    }
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function announceToScreenReader(message: string) {
  if (typeof document === 'undefined') return;
  const announcer = document.getElementById('sr-announcements');
  if (announcer) {
    announcer.textContent = message;
  }
}
