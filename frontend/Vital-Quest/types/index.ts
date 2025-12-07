// Core Type Definitions for Vital Quest

export type QuestType = 'daily' | 'weekly' | 'custom';
export type QuestCategory = 'fitness' | 'nutrition' | 'mindfulness' | 'sleep' | 'hydration' | 'custom';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'epic';
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ActivityType = 'steps' | 'exercise' | 'meditation' | 'meal' | 'water' | 'sleep';
export type CharacterClass = 'warrior' | 'assassin' | 'monk' | 'villager';

// User Profile & Character
export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
  characterClass: CharacterClass; // Character class selection
  fcmToken?: string; // Firebase Cloud Messaging token for push notifications
  character: Character;
  stats: UserStats;
  settings: UserSettings;
}

export interface Character {
  name: string;
  level: number;
  currentXp: number;
  totalXp: number;
  hp: number;
  maxHp: number;
  gold: number;
  avatar: {
    skin: string;
    hair: string;
    outfit: string;
    accessories: string[];
  };
}

export interface UserStats {
  totalQuestsCompleted: number;
  totalAchievementsUnlocked: number;
  currentStreak: number;
  longestStreak: number;
  totalSteps: number;
  totalExerciseMinutes: number;
  totalMeditationMinutes: number;
  joinedDate: Date;
  lastActiveDate: Date;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  healthConnectEnabled: boolean;
  notificationTimes: {
    morning: number;
    midday: number;
    evening: number;
    streakAlert: number;
  };
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
}

// Quest System
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  xpReward: number;
  goldReward: number;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  dueDate?: Date;
  streak: number;
  icon: string;
  subtasks?: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

// Achievement System
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: QuestCategory;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  target: number;
  xpReward: number;
  goldReward: number;
  hidden: boolean; // Secret achievements
}

// Health Activity Tracking
export interface HealthActivity {
  id: string;
  type: ActivityType;
  date: Date;
  value: number;
  unit: string;
  source: 'health_connect' | 'manual';
  metadata?: {
    duration?: number;
    calories?: number;
    heartRate?: number;
    quality?: 'poor' | 'fair' | 'good' | 'excellent';
    notes?: string;
  };
}

// Daily Summary
export interface DailySummary {
  date: Date;
  steps: number;
  exerciseMinutes: number;
  meditationMinutes: number;
  waterGlasses: number;
  mealsLogged: number;
  sleepHours: number;
  questsCompleted: number;
  xpEarned: number;
  goldEarned: number;
  streakMaintained: boolean;
}

// Streak System
export interface Streak {
  type: 'overall' | 'quest' | 'activity';
  referenceId?: string; // Quest ID or activity type
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date;
  freezesAvailable: number;
}

// Notification
export interface GameNotification {
  id: string;
  type: 'achievement' | 'level_up' | 'quest_complete' | 'streak_alert' | 'reminder' | 'challenge';
  title: string;
  message: string;
  icon?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
}

// Inventory & Rewards
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'consumable' | 'equipment' | 'cosmetic';
  rarity: AchievementRarity;
  icon: string;
  quantity: number;
  effect?: {
    type: 'hp_restore' | 'xp_boost' | 'gold_boost' | 'streak_freeze';
    value: number;
    duration?: number; // minutes
  };
}

// Social Features (prepared for backend)
export interface Party {
  id: string;
  name: string;
  description: string;
  members: PartyMember[];
  currentQuest?: PartyQuest;
  createdAt: Date;
  maxMembers: number;
}

export interface PartyMember {
  userId: string;
  username: string;
  level: number;
  avatar: Character['avatar'];
  role: 'leader' | 'member';
  joinedAt: Date;
}

export interface PartyQuest {
  questId: string;
  title: string;
  description: string;
  totalProgress: number;
  targetProgress: number;
  startedAt: Date;
  endsAt: Date;
  rewards: {
    xp: number;
    gold: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  level: number;
  totalXp: number;
  avatar: Character['avatar'];
  change: number; // Position change from last period
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'solo' | 'party' | 'global';
  category: QuestCategory;
  startDate: Date;
  endDate: Date;
  participants: number;
  rewards: {
    xp: number;
    gold: number;
    items?: string[];
  };
  progress?: number;
  target?: number;
}

// AI Coach
export interface CoachMessage {
  id: string;
  message: string;
  type: 'motivation' | 'tip' | 'insight' | 'recommendation';
  timestamp: Date;
  category?: QuestCategory;
  priority: 'low' | 'medium' | 'high';
}

export interface ProgressInsight {
  period: 'daily' | 'weekly' | 'monthly';
  metric: string;
  value: number;
  change: number; // Percentage change
  trend: 'up' | 'down' | 'stable';
  message: string;
}

// App State
export interface AppState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
}
