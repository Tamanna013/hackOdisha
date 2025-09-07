import { useState, useCallback, useRef, useEffect } from 'react';
import { useMemory } from './useMemory';
import type { Message } from '../types/message';
import { GeminiService } from '../services/gemini';
import type { ChatContext } from '../types/chat-context';
import { extractTopics } from '../utils/topicExtraction';

// Extend the Window interface to include webkitSpeechRecognition for broader browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useChat = (userId: string) => {
  const { memory, updateEmotionalState, addRecentTopic, updateUserPreferences } = useMemory(userId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state and ref for voice functionality
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  // Initialize Gemini service instance
  const geminiService = new GeminiService();

  // Check for Speech Recognition API support on component mount
  useEffect(() => {
    setIsSpeechSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  const sendMessage = useCallback(async (content: string): Promise<string> => {
    if (!content.trim()) {
      setError('Message cannot be empty');
      return '';
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create user message with unique ID
      const userMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content: content.trim(),
        timestamp: Date.now()
      };

      // Add message to chat immediately
      setMessages(prev => [...prev, userMessage]);

      // Analyze emotion and update state
      const emotion = await geminiService.analyzeEmotion(content);
      updateEmotionalState(emotion);

      // Extract and add topics
      const topics = extractTopics(content);
      topics.forEach(topic => addRecentTopic(topic));

      // Get response from Gemini
      const context: ChatContext = {
        currentMessage: content,
        messageHistory: messages,
        memory
      };

      const response = await geminiService.sendMessage(content, context);

      // Create bot message with unique ID
      const botMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      // Add bot response to messages
      setMessages(prev => [...prev, botMessage]);

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);

      // Create error message
      const errorResponse: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorResponse]);
      return '';
    } finally {
      setIsLoading(false);
    }
  }, [messages, memory, updateEmotionalState, addRecentTopic]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const retryLastMessage = useCallback(async () => {
    if (messages.length === 0) return;

    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
    if (lastUserMessage) {
      return await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  // New voice input functions
  const startListening = () => {
    if (!isSpeechSupported) {
      console.error("Speech Recognition API is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Listen for a single phrase
    recognition.interimResults = false; // Only return final results
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setError("Speech recognition failed. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return {
    userId,
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    memory,
    updateUserPreferences,
    isListening,
    isSpeechSupported,
    startListening,
    stopListening, 
    clearChat: clearMessages
  };
};