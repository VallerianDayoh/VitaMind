import { create } from 'zustand';

interface MoodState {
  currentMood: string | null;
  lastCheckIn: string | null;
  sleepHours: number;
  waterGrams: number;
  // Actions
  setMood: (mood: string) => void;
  setSleep: (hours: number) => void;
  addWater: (amount: number) => void;
  resetWater: () => void;
}

export const useMoodStore = create<MoodState>((set) => ({
  currentMood: null,
  lastCheckIn: null,
  sleepHours: 0,
  waterGrams: 0,
  
  setMood: (mood) => set({ 
    currentMood: mood, 
    lastCheckIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
  }),
  
  setSleep: (hours) => set({ sleepHours: hours }),
  
  addWater: (amount) => set((state) => ({ 
    waterGrams: state.waterGrams + amount 
  })),
  
  resetWater: () => set({ waterGrams: 0 }),
}));