import { useState, useEffect } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface EmotionalState {
  current: string;
  history: Array<{
    emotion: string;
    timestamp: number;
    intensity: number;
  }>;
}

interface UserPreferences {
  name: string;
  conversationStyle: 'friendly' | 'professional' | 'humorous';
  interests: string[];
}

interface Memory {
  emotionalState: EmotionalState;
  recentTopics: string[];
  userPreferences: UserPreferences;
}

export interface ChatContext {
  currentMessage: string;
  messageHistory: Message[];
  memory: Memory;
}

export const useMemory = (userId: string) => {
  const [memory, setMemory] = useState<Memory>({
    emotionalState: {
      current: 'neutral',
      history: []
    },
    recentTopics: [],
    userPreferences: {
      name: 'Friend',
      conversationStyle: 'friendly',
      interests: []
    }
  });

  // Load memory from storage
  useEffect(() => {
    const saved = localStorage.getItem(`memory-${userId}`);
    if (saved) {
      setMemory(JSON.parse(saved));
    }
  }, [userId]);

  // Update emotional state
  const updateEmotionalState = (emotion: string) => {
    setMemory(prev => {
      const newMemory = {
        ...prev,
        emotionalState: {
          current: emotion,
          history: [...prev.emotionalState.history, {
            emotion,
            timestamp: Date.now(),
            intensity: 0.8
          }].slice(-20) // Keep last 20 entries
        }
      };
      localStorage.setItem(`memory-${userId}`, JSON.stringify(newMemory));
      return newMemory;
    });
  };

  // Add recent topic
  const addRecentTopic = (topic: string) => {
    setMemory(prev => {
      const newTopics = [...new Set([topic, ...prev.recentTopics])].slice(0, 5);
      const newMemory = {
        ...prev,
        recentTopics: newTopics
      };
      localStorage.setItem(`memory-${userId}`, JSON.stringify(newMemory));
      return newMemory;
    });
  };

  // Update user preferences
  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    setMemory(prev => {
      const newMemory = {
        ...prev,
        userPreferences: { ...prev.userPreferences, ...preferences }
      };
      localStorage.setItem(`memory-${userId}`, JSON.stringify(newMemory));
      return newMemory;
    });
  };

  return {
    memory,
    updateEmotionalState,
    addRecentTopic,
    updateUserPreferences
  };
};