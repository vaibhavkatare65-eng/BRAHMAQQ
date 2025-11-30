export interface UserProfile {
  id?: string; // Supabase User ID
  name?: string;
  age?: number;
  reason?: string;
  email?: string;
  isAuthenticated: boolean;
  hasPaid: boolean;
  startDate: number | null; // Timestamp
  lastCompletedDay: number;
  lastCompletionTime: number | null; // Timestamp
  videoSubmittedToday: boolean;
  addictions?: string[];
}

export interface DayContent {
  day: number;
  quote: string;
  teachingTitle: string;
  teachingContent: string;
  task: string;
  gitaVerse: string;
  gitaTranslation: string;
}

export interface JournalEntry {
  day: number;
  date: number;
  answers: {
    prompt: string;
    answer: string;
  }[];
}

export enum AppState {
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  COMMITMENT = 'COMMITMENT',
  AUTH = 'AUTH',
  PAYMENT = 'PAYMENT',
  DASHBOARD = 'DASHBOARD'
}

export interface Milestone {
  day: number;
  title: string;
  description: string;
  icon: 'shield' | 'crown' | 'award' | 'trophy';
}