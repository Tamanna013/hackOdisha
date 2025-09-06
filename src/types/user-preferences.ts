export interface UserPreferences {
  name: string;
  conversationStyle: 'friendly' | 'professional' | 'humorous';
  interests: string[];
}