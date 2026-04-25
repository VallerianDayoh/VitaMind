import { create } from 'zustand';
import { MoodLog, SleepLog } from '../types';

export interface DataState {
  moodLogs: MoodLog[];
  sleepLogs: SleepLog[];
  addMoodLog: (moodLog: MoodLog) => void;
  addSleepLog: (sleepLog: SleepLog) => void;
}

const mockMoodLogs: MoodLog[] = [
  {
    _id: 'mock-mood-1',
    userId: 'mock-user-1',
    mood: 'good',
    note: 'Merasa cukup produktif hari ini.',
    timestamp: Date.now(),
  }
];

const mockSleepLogs: SleepLog[] = [
  {
    _id: 'mock-sleep-1',
    userId: 'mock-user-1',
    durationInHours: 7.5,
    quality: 'good',
    bedTime: '22:30',
    wakeTime: '06:00',
    date: new Date().toISOString().split('T')[0],
  }
];

export const useDataStore = create<DataState>((set) => ({
  moodLogs: mockMoodLogs,
  sleepLogs: mockSleepLogs,
  addMoodLog: (moodLog) => set((state) => ({ moodLogs: [moodLog, ...state.moodLogs] })),
  addSleepLog: (sleepLog) => set((state) => ({ sleepLogs: [sleepLog, ...state.sleepLogs] })),
}));
