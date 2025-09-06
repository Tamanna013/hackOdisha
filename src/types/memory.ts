export interface EmotionalState {
  current: string;
  history: Array<{
    emotion: string; 
    intensity: number;
    timestamp: number;
  }>;
}

export interface UserPreferences {
  name: string;
  interests: string[];
  conversationStyle: 'friendly' | 'professional' | 'humorous';
}

export interface ConversationMemory {
  recentTopics: string[];
  userPreferences: UserPreferences;
  emotionalState: EmotionalState;
}