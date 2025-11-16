import { create } from 'zustand';

export type AnimationState = 'idle' | 'wave' | 'listen' | 'responding';

interface DrChickState {
  animationState: AnimationState;
  moodText: string;
  showMoodBubble: boolean;
  setAnimationState: (state: AnimationState) => void;
  setMood: (text: string, show: boolean) => void;
  resetToIdle: () => void;
}

export const useDrChickStore = create<DrChickState>((set) => ({
  animationState: 'wave', // Start with wave on first load
  moodText: '',
  showMoodBubble: false,
  
  setAnimationState: (state) => set({ animationState: state }),
  
  setMood: (text, show) => set({ moodText: text, showMoodBubble: show }),
  
  resetToIdle: () => set({ animationState: 'idle', moodText: '', showMoodBubble: false }),
}));
