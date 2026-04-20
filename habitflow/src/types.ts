export type Priority = 'Low' | 'Medium' | 'High';
export type Category = 'Health' | 'Study' | 'Work' | 'Personal' | 'Finance' | 'Social';
export type Frequency = 'daily' | 'weekly';
export type Theme = 'light' | 'dark' | 'emerald' | 'rose' | 'amber' | 'midnight';
export type UserTitle = 'Beginner' | 'Disciplined' | 'Warrior' | 'Monk' | 'Legend';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  goals?: string;
  theme?: Theme;
  coins?: number;
  xp?: number;
  level?: number;
  title?: UserTitle;
  streakFreezes?: number;
  totalFocusTime?: number;
  lastLoginDate?: string;
  loginStreak?: number;
  isPremium?: boolean;
  createdAt: string;
}

export interface FocusSession {
  id?: string;
  userId: string;
  duration: number; // in minutes
  type: 'pomodoro' | 'stopwatch';
  coinsEarned: number;
  xpEarned?: number;
  completedAt: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'theme' | 'streak-freeze' | 'ai-level' | 'analytics';
  value: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  xpReward: number;
  coinReward: number;
  participants: string[];
  type: 'focus' | 'habit' | 'task';
}

export interface Friend {
  uid: string;
  displayName: string;
  photoURL?: string;
  level: number;
  title: UserTitle;
  xp: number;
}


export interface Habit {
  id: string;
  userId: string;
  name: string;
  frequency: Frequency;
  category: Category;
  streak: number;
  longestStreak: number;
  completedDates: string[]; // ISO Date strings (YYYY-MM-DD)
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  priority: Priority;
  deadline?: string;
  category: Category;
  completed: boolean;
  createdAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
