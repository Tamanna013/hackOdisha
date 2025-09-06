export interface EmotionalState {
  current: string;
  history: Array<{
    emotion: string;
    timestamp: number;
    intensity: number;
  }>;
}