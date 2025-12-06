import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Friend {
  id: string;
  username: string;
  level: number;
  totalXp: number;
  currentStreak: number;
  avatarColor: string;
  status: 'online' | 'offline';
  lastActive: Date;
}

export interface Party {
  id: string;
  name: string;
  members: Friend[];
  totalXp: number;
  activeQuests: number;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  level: number;
  totalXp: number;
  weeklyXp: number;
  monthlyXp: number;
  avatarColor: string;
  isCurrentUser?: boolean;
}

interface SocialState {
  friends: Friend[];
  party: Party | null;
  leaderboard: LeaderboardEntry[];
  pendingRequests: Friend[];
  
  // Actions
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  acceptFriendRequest: (friendId: string) => void;
  rejectFriendRequest: (friendId: string) => void;
  createParty: (name: string) => void;
  joinParty: (party: Party) => void;
  leaveParty: () => void;
  updateLeaderboard: (entries: LeaderboardEntry[]) => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set) => ({
      friends: [],
      party: null,
      leaderboard: [],
      pendingRequests: [],

      addFriend: (friend) =>
        set((state) => ({
          friends: [...state.friends, friend],
        })),

      removeFriend: (friendId) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== friendId),
        })),

      acceptFriendRequest: (friendId) =>
        set((state) => {
          const request = state.pendingRequests.find((r) => r.id === friendId);
          if (!request) return state;

          return {
            friends: [...state.friends, request],
            pendingRequests: state.pendingRequests.filter((r) => r.id !== friendId),
          };
        }),

      rejectFriendRequest: (friendId) =>
        set((state) => ({
          pendingRequests: state.pendingRequests.filter((r) => r.id !== friendId),
        })),

      createParty: (name) =>
        set(() => ({
          party: {
            id: `party-${Date.now()}`,
            name,
            members: [],
            totalXp: 0,
            activeQuests: 0,
            createdAt: new Date(),
          },
        })),

      joinParty: (party) =>
        set(() => ({
          party,
        })),

      leaveParty: () =>
        set(() => ({
          party: null,
        })),

      updateLeaderboard: (entries) =>
        set(() => ({
          leaderboard: entries,
        })),
    }),
    {
      name: 'social-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
