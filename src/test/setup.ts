import '@testing-library/jest-dom';

// Polyfill SpeechSynthesis for test environment
if (typeof window !== 'undefined') {
  if (!('speechSynthesis' in window)) {
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: () => {},
        cancel: () => {},
        pause: () => {},
        resume: () => {},
        getVoices: () => [],
      },
      writable: true,
    });
  }

  if (!('SpeechSynthesisUtterance' in window)) {
    // @ts-expect-error Mock utterance constructor
    window.SpeechSynthesisUtterance = class {
      text: string;
      rate: number = 1.0;
      pitch: number = 1.0;
      volume: number = 1.0;
      voice: any = null;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    };
  }

  // Mock Audio
  if (!('Audio' in window)) {
    // @ts-expect-error Mock Audio
    window.Audio = class {
      play() {
        return Promise.resolve();
      }
      pause() {}
    };
  }
}
