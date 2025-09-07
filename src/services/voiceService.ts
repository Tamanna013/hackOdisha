export class VoiceService {
  private synthesis: SpeechSynthesis;
  private recognition: any;
  private isListening: boolean;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    
    // Initialize voices
    this.initializeVoices();
    
    // Initialize speech recognition
    this.initializeRecognition();
  }

  private initializeVoices(): void {
    // Load available voices immediately
    this.voices = this.synthesis.getVoices();
    
    if (this.voices.length > 0) {
      this.voicesLoaded = true;
      console.log('Voices already available:', this.voices.length);
      return;
    }

    // Wait for voices to load
    this.synthesis.onvoiceschanged = () => {
      this.voices = this.synthesis.getVoices();
      this.voicesLoaded = true;
      console.log('Voices loaded via event:', this.voices.length);
      this.synthesis.onvoiceschanged = null;
    };
  }

  private initializeRecognition(): void {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onend = () => {
        this.isListening = false;
        console.log('Speech recognition ended');
      };
      
      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        console.error('Speech recognition error:', event.error);
      };

      this.recognition.onstart = () => {
        console.log('Speech recognition started');
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('Microphone permission granted');
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  async speak(text: string, onEnd?: () => void): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Ensure voices are loaded
        if (!this.voicesLoaded || this.voices.length === 0) {
          await this.waitForVoices();
        }

        // Cancel any ongoing speech
        if (this.synthesis.speaking) {
          this.synthesis.cancel();
          // Give time for cancellation to complete
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;

        // Select a voice
        if (this.voices.length > 0) {
          const englishVoice = this.voices.find(voice => 
            voice.lang.startsWith('en') && voice.localService === false
          ) || this.voices.find(voice => voice.lang.startsWith('en')) || this.voices[0];
          
          utterance.voice = englishVoice;
        }

        // Set up event handlers
        utterance.onend = () => {
          if (onEnd) onEnd();
          resolve();
        };

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          reject(new Error(`Speech synthesis failed: ${event.error}`));
        };

        // Speak the text
        this.synthesis.speak(utterance);

      } catch (error) {
        reject(error);
      }
    });
  }

  stopSpeaking(): void {
    if (this.synthesis.speaking || this.synthesis.pending) {
      this.synthesis.cancel();
      console.log('Speech stopped');
    }
  }

  async startListening(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      // Request permission
      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) {
        reject(new Error('Microphone permission denied'));
        return;
      }

      this.recognition.onresult = (event: any) => {
        this.isListening = false;
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        let errorMessage = 'Speech recognition failed';
        if (event.error === 'not-allowed') {
          errorMessage = 'Microphone access denied';
        } else if (event.error === 'no-speech') {
          errorMessage = 'No speech detected';
        } else if (event.error === 'audio-capture') {
          errorMessage = 'No microphone found';
        }
        reject(new Error(errorMessage));
      };

      this.recognition.onnomatch = () => {
        this.isListening = false;
        reject(new Error('No speech recognized'));
      };

      try {
        this.isListening = true;
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isSpeechSupported(): boolean {
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    const hasRecognition = 'webkitSpeechRecognition' in window;
    const hasSynthesis = 'speechSynthesis' in window;
    
    return isSecure && hasRecognition && hasSynthesis;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  async waitForVoices(): Promise<void> {
    if (this.voicesLoaded && this.voices.length > 0) {
      return;
    }

    return new Promise((resolve) => {
      const checkVoices = () => {
        const voices = this.synthesis.getVoices();
        if (voices.length > 0) {
          this.voices = voices;
          this.voicesLoaded = true;
          resolve();
        } else {
          setTimeout(checkVoices, 100);
        }
      };
      checkVoices();
    });
  }

  async testSpeech(): Promise<boolean> {
    try {
      await this.waitForVoices();
      await this.speak('Hello, speech synthesis is working!');
      return true;
    } catch (error) {
      console.error('Speech test failed:', error);
      return false;
    }
  }

  getSupportInfo() {
    return {
      isSupported: this.isSpeechSupported(),
      isSecure: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      voicesAvailable: this.voices.length,
      voices: this.voices.map(v => ({ name: v.name, lang: v.lang }))
    };
  }

  // Debug method to check current state
  getDebugInfo() {
    return {
      synthesis: {
        speaking: this.synthesis.speaking,
        pending: this.synthesis.pending,
        paused: this.synthesis.paused
      },
      recognition: {
        available: !!this.recognition,
        listening: this.isListening
      },
      voices: {
        loaded: this.voicesLoaded,
        count: this.voices.length,
        list: this.voices.map(v => `${v.name} (${v.lang})`)
      }
    };
  }
}

export default VoiceService;