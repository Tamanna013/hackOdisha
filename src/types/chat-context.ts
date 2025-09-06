import type { Message } from './message';
import type { ConversationMemory } from './memory';

export interface ChatContext {
  currentMessage: string;
  messageHistory: Message[];
  memory: ConversationMemory;
}