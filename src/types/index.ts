// src/types/index.ts
// export type { UserPreferences } from './user-preferences';
// export type { EmotionalState } from './emotional-state';
// export type { Message } from './message';
// export type { Memory } from './memory';
// export type { ChatContext } from './chat-context';
export interface EmotionalState {
  current: string;
  history: Array<{
    emotion: string;
    timestamp: number;
    intensity: number;
  }>;
}

export interface UserPreferences {
  name: string;
  conversationStyle: 'friendly' | 'professional' | 'humorous';
  interests: string[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Memory {
  emotionalState: EmotionalState;
  recentTopics: string[];
  userPreferences: UserPreferences;
}

export interface ChatContext {
  currentMessage: string;
  messageHistory: Message[];
  memory: Memory;
}