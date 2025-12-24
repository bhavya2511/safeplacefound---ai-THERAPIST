
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
}

export interface MoodData {
  date: string;
  value: number; // 1-5 scale
}

export enum Page {
  Home = 'home',
  Chat = 'chat',
  Journal = 'journal'
}
