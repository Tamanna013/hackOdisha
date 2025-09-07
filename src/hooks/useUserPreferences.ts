// src/hooks/useUserPreferences.ts
import { useState, useEffect } from 'react';

// Define locally if the import isn't working
interface UserPreferences {
  name: string;
  conversationStyle: 'friendly' | 'professional' | 'humorous';
  interests: string[];
}

export const useUserPreferences = (initialUserId: string) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    name: 'friend',
    conversationStyle: 'friendly',
    interests: ['technology', 'music', 'travel'],
  });

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`userPrefs-${initialUserId}`);
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, [initialUserId]);

  // Save preferences to localStorage
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, ...updates };
      localStorage.setItem(`userPrefs-${initialUserId}`, JSON.stringify(newPrefs));
      return newPrefs;
    });
  };

  return { preferences, updatePreferences };
};