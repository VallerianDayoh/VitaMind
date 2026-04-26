import { create } from 'zustand';
import { MoodLog, SleepLog } from '../types';

export interface DataState {
  moodLogs: MoodLog[];
  sleepLogs: SleepLog[];
  addMoodLog: (moodLog: MoodLog) => void;
  addSleepLog: (sleepLog: SleepLog) => void;
}

export const useDataStore = create<DataState>((set) => ({
  moodLogs: [],
  sleepLogs: [],
  addMoodLog: (moodLog) => set((state) => ({ moodLogs: [moodLog, ...state.moodLogs] })),
  addSleepLog: (sleepLog) => set((state) => ({ sleepLogs: [sleepLog, ...state.sleepLogs] })),
}));
