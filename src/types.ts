export type NavigationTab = 
  | 'daily-overview'
  | 'medication-schedule'
  | 'care-circle'
  | 'health-wellness'
  | 'companion-chat'
  | 'accessibility-settings';

export type VisualTheme = 'standard' | 'high-contrast' | 'yellow-black';

export type FontScale = 100 | 115 | 130;

export interface Medication {
  id: string;
  time: string;
  name: string;
  dosage: string;
  timingCategory: 'morning' | 'afternoon' | 'evening' | 'bedtime';
  statusBadge: string;
  description: string;
  instructions: string;
  appearance: string;
  isTaken: boolean;
  takenTime?: string;
  audioText: string;
}

export interface RoutineActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  status: 'Upcoming' | 'Confirmed' | 'Planned' | 'Completed';
  category: 'exercise' | 'delivery' | 'medical' | 'social';
  hasPreviewLink?: boolean;
  actionText?: string;
}

export interface CareContact {
  id: string;
  initials: string;
  name: string;
  relation: string;
  statusText: string;
  statusColor?: string;
  phone: string;
  isAvailableNow?: boolean;
  hasVoiceNote?: boolean;
  voiceNoteDuration?: string;
  voiceNoteTranscript?: string;
  role: 'primary' | 'physician' | 'family' | 'nurse';
}

export interface CompanionMessage {
  id: string;
  sender: 'eleanor' | 'companion' | 'user' | 'assistant';
  text: string;
  timestamp: string;
  isAudioPlaying?: boolean;
  audioSpoken?: boolean;
}

export interface ScannedDocument {
  id: string;
  title: string;
  dateScanned: string;
  originalText: string;
  easySummary: string;
  keyAction?: string;
}

export interface AccessibilitySettings {
  theme: VisualTheme;
  fontScale: FontScale;
  speechSpeed: number;
  audioBoost: boolean;
  liveCaptions: boolean;
}
