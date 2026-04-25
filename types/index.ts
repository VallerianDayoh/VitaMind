export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: number;
}

export type MoodType = 'rad' | 'good' | 'meh' | 'bad' | 'awful';

export interface MoodLog {
  _id?: string;
  userId: string;
  mood: MoodType;
  note?: string;
  timestamp: number;
}

export interface SleepLog {
  _id?: string;
  userId: string;
  durationInHours: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  bedTime?: string;
  wakeTime?: string;
  date: string;
}

// Keeping these so existing Zustand stores don't break during transition
export interface MentalHealthMetric {
  id: string;
  moodLevel: number;
  notes?: string;
  date: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export interface DataState {
  metrics: MentalHealthMetric[];
  addMetric: (metric: MentalHealthMetric) => void;
}
