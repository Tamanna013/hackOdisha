import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Mic, Square, MicOff } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { useChat } from '../../hooks/useChat';

export const ChatInterface = () => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    messages, 
    isLoading, 
    isListening, 
    isSpeechSupported,
    sendMessage, 
    startListening, 
    stopListening, 
    clearChat 
  } = useChat("demo-user");;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleVoiceButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">AI Companion</h2>
        <button
          onClick={clearChat}
          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
          title="Clear conversation"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Start a conversation with your AI companion!</p>
            <p className="text-sm mt-2">They'll remember your preferences and adapt to your style.</p>
            {!isSpeechSupported && (
              <p className="text-xs mt-2 text-orange-600">
                Voice input is not supported in your browser
              </p>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || isListening}
          />
          
          {isSpeechSupported ? (
            <button
              type="button"
              onClick={handleVoiceButtonClick}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <Square size={20} /> : <Mic size={20} />}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
              title="Voice input not supported"
            >
              <MicOff size={20} />
            </button>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isListening}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        
        {isListening && (
          <div className="mt-2 text-sm text-blue-500 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            Listening... Speak now
          </div>
        )}
        
        {!isSpeechSupported && (
          <div className="mt-2 text-xs text-orange-600">
            Voice input requires Chrome, Edge, or Safari
          </div>
        )}
      </form>
    </div>
  );
};