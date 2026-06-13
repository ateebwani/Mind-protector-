export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  joinedDate: string;
}

export type FocusModeType = 'Deep Work' | 'Light Flow' | 'Creative' | 'Custom';
export type NoiseType = 'none' | 'white' | 'rain' | 'lofi' | 'synth';

export interface AppLock {
  id: string;
  name: string;
  category: string;
  icon: 'Camera' | 'Video' | 'MessageSquare' | 'Gamepad2' | 'Twitter' | string;
  durationMinutes: number; // Lock duration limit in minutes
  remainingMinutes: number; // Countdown during active lock
  isLocked: boolean;
}

export interface FocusSessionLog {
  id: string;
  date: string; // ISO String
  durationMinutes: number;
  mode: FocusModeType;
  status: 'completed' | 'interrupted';
  category: string;
}

export interface WeeklyData {
  day: string; // 'Mon', 'Tue', etc.
  hours: number;
  sessions: number;
}

export interface CommunityPost {
  id: string;
  username: string;
  userTitle: string;
  avatarUrl: string;
  text: string;
  likes: number;
  likedByUser: boolean;
  repliesCount: number;
  timeAgo: string;
}

export interface SystemConfig {
  deviceOS: 'ios' | 'android';
  themeColor: string; // Electric blue or other variants
  smartNotifications: boolean;
  biometricLockEnabled: boolean;
  cloudSync: boolean;
  lastSynced: string;
}
