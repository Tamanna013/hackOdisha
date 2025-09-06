import { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface/ChatInterface';
import { UserSettingsPanel } from './components/UserSettingsPanel';
import { ThreeScene } from './components/ThreeScene/ThreeScene';
import { useChat } from './hooks/useChat';
import { useMemory } from './hooks/useMemory';
import { useUserPreferences } from './hooks/useUserPreferences';
import { VoiceService } from './services/voiceService';
import { MongoDBService } from './services/mongodbService';
import './App.css';

// Initialize services
const voiceService = new VoiceService();
const mongoDBService = new MongoDBService();

// Generate a unique user ID if not exists
const getOrCreateUserId = (): string => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
};

function App() {
  const userId = getOrCreateUserId();
  const [appLoading, setAppLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [show3DScene, setShow3DScene] = useState(true);

  // Initialize hooks
  const { preferences, updatePreferences } = useUserPreferences(userId);
  const { memory, updateEmotionalState, addRecentTopic, updateUserPreferences } = useMemory(userId);
  const { messages, sendMessage, isLoading } = useChat(userId);

  // Load initial data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setAppLoading(true);

        // Load conversation history from MongoDB
        const savedMessages = await mongoDBService.loadConversation(userId);
        if (savedMessages.length > 0) {
          console.log('Loaded saved conversation:', savedMessages.length, 'messages');
        }

        // Load user preferences
        const savedPreferences = await mongoDBService.loadPreferences(userId);
        if (savedPreferences) {
          updatePreferences(savedPreferences);
          updateUserPreferences(savedPreferences);
        }

        console.log('Voice service ready:', voiceService.isSpeechSupported() ? 'Supported' : 'Not supported');

      } catch (err) {
        console.error('Error initializing app:', err);
        setError('Failed to initialize application. Please refresh the page.');
      } finally {
        setAppLoading(false);
      }
    };

    initializeApp();
  }, [userId, updatePreferences, updateUserPreferences]);

  // Save data when changes occur
  useEffect(() => {
    if (!appLoading && messages.length > 0) {
      mongoDBService.saveConversation(userId, messages);
    }
  }, [messages, userId, appLoading]);

  useEffect(() => {
    if (!appLoading) {
      mongoDBService.savePreferences(userId, preferences);
    }
  }, [preferences, userId, appLoading]);

  // Handle voice recognition
  const handleVoiceInput = async () => {
    try {
      if (!voiceService.isSpeechSupported()) {
        setError('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      const transcript = await voiceService.startListening();
      if (transcript) {
        await sendMessage(transcript);
      }
    } catch (error) {
      console.error('Voice input error:', error);
      setError('Voice input failed. Please check microphone permissions.');
    }
  };

  // Handle theme change
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Toggle 3D scene visibility
  const toggle3DScene = () => {
    setShow3DScene(prev => !prev);
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Initializing Aurora...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => {
          setError(null);
          window.location.reload();
        }}>Refresh Page</button>
      </div>
    );
  }

  return (
    <div className={`app ${theme}`}>
      <header className="app-header">
        <div className="header-content">
          <h1>Aurora AI Companion</h1>
          <div className="header-controls">
            <UserSettingsPanel
              memory={memory}
              onUpdatePreferences={(updates) => {
                updatePreferences(updates);
                updateUserPreferences(updates);
              }}
              onUpdateEmotionalState={updateEmotionalState}
            />
            <button onClick={toggle3DScene} className="scene-toggle" title="Toggle 3D Scene">
              {show3DScene ? '👁️' : '👁️‍🗨️'}
            </button>
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="app-layout">
          {/* 3D Scene Section */}
          {show3DScene && (
            <div className="scene-container">
              <ThreeScene />
            </div>
          )}
          
          {/* Chat Interface Section */}
          <div className="chat-container">
            <ChatInterface
              messages={messages}
              onSendMessage={sendMessage}
              onVoiceInput={handleVoiceInput}
              isProcessing={appLoading} 
              userPreferences={preferences}
              userId={userId}
              currentMood={memory.emotionalState.current}
              recentTopics={memory.recentTopics}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="status-indicators">
          <span className={`status-badge mood-${memory.emotionalState.current}`}>
            Mood: {memory.emotionalState.current}
          </span>
          <span className="status-badge">
            Style: {preferences.conversationStyle}
          </span>
          <span className="status-badge">
            User: {preferences.name}
          </span>
        </div>
        <p className="footer-note">
          Aurora AI Companion • Powered by Gemini AI
        </p>
      </footer>
    </div>
  );
}

export default App;