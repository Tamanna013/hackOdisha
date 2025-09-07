import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatContext } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export class GeminiService {
  static sendMessage(content: string, context: ChatContext) {
    throw new Error('Method not implemented.');
  }
  static analyzeEmotion(content: string) {
    throw new Error('Method not implemented.');
  }
  private model: any;
  private chat: any;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.8, 
        topP: 0.9,
        topK: 40,
      },
    });
    
    this.chat = this.model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.8,
      },
    });
  }

// Removed duplicate analyzeEmotion implementation

  async sendMessage(message: string, context: ChatContext): Promise<string> {
  try {
    const prompt = this.buildEnhancedPrompt(message, context);
    const result = await this.chat.sendMessage(prompt);
    const response = await result.response;
    
    return this.cleanResponse(response.text());
  } catch (error: any) {
    console.error('Gemini API Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText
    });
    
    // Check if it's an authentication error
    if (error?.status === 404) {
      return "I'm having trouble connecting to my knowledge base. Please check if my API configuration is correct.";
    }
    
    return this.getFallbackResponse(context.memory.userPreferences.name);
  }
}   

  private buildEnhancedPrompt(message: string, context: ChatContext): string {
    const { memory, messageHistory } = context;
    const recentMessages = messageHistory.slice(-6); // Last 3 exchanges

    return `
# ROLE: You are Aurora, a compassionate AI companion designed to provide engaging, personalized conversation.
# STYLE: ${this.getStyleGuidelines(memory.userPreferences.conversationStyle)}
# CONTEXT: 
- User's name: ${memory.userPreferences.name}
- User's interests: ${memory.userPreferences.interests.join(', ')}
- Recent topics: ${memory.recentTopics.slice(-3).join(', ') || 'No recent topics'}
- Current emotional context: ${memory.emotionalState.current}

# RECENT CONVERSATION:
${recentMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

# CURRENT MESSAGE: ${message}

# RESPONSE GUIDELINES:
1. Be natural and conversational - like a thoughtful friend
2. Incorporate context from recent topics when relevant
3. Match the user's preferred style: ${memory.userPreferences.conversationStyle}
4. Show empathy and emotional intelligence
5. Ask thoughtful questions to continue the conversation
6. Keep responses concise but meaningful (2-4 sentences usually)
7. Use the user's name occasionally: ${memory.userPreferences.name}
8. ${this.getStyleSpecificGuidance(memory.userPreferences.conversationStyle)}

# RESPONSE:
    `.trim();
  }

  private getStyleGuidelines(style: string): string {
    const styles = {
      friendly: "Warm, supportive, and approachable. Use casual language with occasional emojis in thoughts. Be encouraging and show genuine interest.",
      professional: "Polite, articulate, and knowledgeable. Maintain appropriate boundaries while being helpful. Focus on clarity and value.",
      humorous: "Witty, playful, and lighthearted. Use appropriate humor and light teasing. Include occasional jokes or funny observations."
    };
    return styles[style as keyof typeof styles] || styles.friendly;
  }

  private getStyleSpecificGuidance(style: string): string {
    const guidance = {
      friendly: "Use contractions and casual language. Show warmth with phrases like 'I appreciate that' or 'That's really interesting!'",
      professional: "Maintain professional tone. Use complete sentences and avoid slang. Focus on being helpful and informative.",
      humorous: "Include light humor when appropriate. Use playful language and occasional witty remarks. Don't force jokes - keep it natural."
    };
    return guidance[style as keyof typeof guidance] || guidance.friendly;
  }

  private cleanResponse(response: string): string {
    // Remove any markdown formatting or unwanted prefixes
    return response
      .replace(/^#+\s*/gm, '') // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italics
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .trim();
  }

  private getFallbackResponse(userName: string): string {
    const fallbacks = [
      `I'm having trouble connecting right now, ${userName}. Could we try that again?`,
      `It seems I'm having a moment, ${userName}. Would you mind repeating that?`,
      `I apologize, ${userName}, I'm having some technical difficulties. Could you rephrase that?`,
      `Let me try that again, ${userName}. Could you repeat what you just said?`
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  async analyzeEmotion(message: string): Promise<string> {
    try {
      const prompt = `
        Analyze the emotional tone of this message and respond with ONLY one word from this list: 
        happy, sad, angry, excited, curious, anxious, relaxed, confused, grateful, neutral.
        
        Message: "${message}"
        
        Consider: 
        - Word choice and phrasing
        - Punctuation and capitalization
        - Overall sentiment
        - Contextual clues
        
        Respond with just the emotion word, nothing else.
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const emotion = response.text().toLowerCase().trim();
      
      // Validate the emotion is from our allowed list
      const validEmotions = ['happy', 'sad', 'angry', 'excited', 'curious', 'anxious', 'relaxed', 'confused', 'grateful', 'neutral'];
      return validEmotions.includes(emotion) ? emotion : 'neutral';
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      return 'neutral';
    }
  }

  // Additional method for generating contextual follow-up questions
  async generateFollowUpQuestion(context: ChatContext): Promise<string> {
    try {
      const prompt = `
        Based on this conversation context, generate a natural follow-up question to keep the conversation engaging.
        
        Recent conversation: ${context.messageHistory.slice(-4).map(m => m.content).join(' | ')}
        User interests: ${context.memory.userPreferences.interests.join(', ')}
        Current mood: ${context.memory.emotionalState.current}
        
        Guidelines:
        - Make it open-ended and thoughtful
        - Relate to user's interests when possible
        - Match the conversation style: ${context.memory.userPreferences.conversationStyle}
        - Keep it concise (1 sentence)
        - Sound natural and curious
        
        Respond with just the question, no other text.
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.cleanResponse(response.text());
    } catch (error) {
      console.error('Error generating follow-up question:', error);
      return "What are your thoughts on that?";
    }
  }
}