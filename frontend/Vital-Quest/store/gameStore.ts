import { gameConfig } from '@/constants/gameConfig';
import { Achievement, Character, GameNotification, InventoryItem, Quest, Streak, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface GameState {
  // User & Character
  user: User | null;
  
  // Quests
  activeQuests: Quest[];
  completedQuests: Quest[];
  
  // Achievements
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  
  // Inventory
  inventory: InventoryItem[];
  
  // Notifications
  notifications: GameNotification[];
  unreadCount: number;
  
  // Streaks
  streaks: Streak[];
  
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  
  // Actions
  initializeUser: (username: string) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  addXp: (amount: number) => void;
  addGold: (amount: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  
  // Quest Actions
  addQuest: (quest: Quest) => void;
  updateQuest: (questId: string, updates: Partial<Quest>) => void;
  completeQuest: (questId: string) => void;
  deleteQuest: (questId: string) => void;
  
  // Achievement Actions
  unlockAchievement: (achievementId: string) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  
  // Inventory Actions
  addItem: (item: InventoryItem) => void;
  useItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  
  // Notification Actions
  addNotification: (notification: Omit<GameNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Streak Actions
  updateStreak: (type: Streak['type'], referenceId?: string) => void;
  breakStreak: (type: Streak['type'], referenceId?: string) => void;
  
  // FCM Token Actions
  updateFCMToken: (token: string) => void;
  
  // Utility
  reset: () => void;
}

const createDefaultUser = (username: string): User => ({
  id: Date.now().toString(),
  username,
  createdAt: new Date(),
  characterClass: 'villager', // Default class
  character: {
    name: username,
    level: 1,
    currentXp: 0,
    totalXp: 0,
    hp: gameConfig.hp.baseMaxHp,
    maxHp: gameConfig.hp.baseMaxHp,
    gold: 0,
    avatar: {
      skin: 'default',
      hair: 'default',
      outfit: 'default',
      accessories: [],
    },
  },
  stats: {
    totalQuestsCompleted: 0,
    totalAchievementsUnlocked: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalSteps: 0,
    totalExerciseMinutes: 0,
    totalMeditationMinutes: 0,
    joinedDate: new Date(),
    lastActiveDate: new Date(),
  },
  settings: {
    notificationsEnabled: true,
    healthConnectEnabled: false,
    notificationTimes: {
      morning: gameConfig.notifications.morning,
      midday: gameConfig.notifications.midday,
      evening: gameConfig.notifications.evening,
      streakAlert: gameConfig.notifications.streakAlert,
    },
    theme: 'dark',
    soundEnabled: true,
  },
});

const calculateLevel = (totalXp: number): number => {
  const thresholds = gameConfig.levels.xpThresholds;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalXp >= thresholds[i]) {
      return i + 1;
    }
  }
  return 1;
};

const getXpForNextLevel = (currentLevel: number): number => {
  if (currentLevel >= gameConfig.levels.maxLevel) {
    return gameConfig.levels.xpThresholds[gameConfig.levels.maxLevel - 1];
  }
  return gameConfig.levels.xpThresholds[currentLevel];
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      user: null,
      activeQuests: [],
      completedQuests: [],
      achievements: [],
      unlockedAchievements: [],
      inventory: [],
      notifications: [],
      unreadCount: 0,
      streaks: [],
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      initializeUser: (username: string) => {
        const newUser = createDefaultUser(username);
        set({ user: newUser });
      },

      updateCharacter: (updates: Partial<Character>) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              character: {
                ...state.user.character,
                ...updates,
              },
            },
          };
        });
      },

      addXp: (amount: number) => {
        console.log('[addXp] Called with amount:', amount);
        set((state) => {
          if (!state.user) {
            console.log('[addXp] No user found, returning state');
            return state;
          }
          
          console.log('[addXp] Current totalXp:', state.user.character.totalXp);
          
          const newTotalXp = state.user.character.totalXp + amount;
          const newLevel = calculateLevel(newTotalXp);
          const oldLevel = state.user.character.level;
          const xpForNextLevel = getXpForNextLevel(newLevel);
          const currentXp = newTotalXp - gameConfig.levels.xpThresholds[newLevel - 1];
          
          console.log('[addXp] New totalXp:', newTotalXp, '| Old level:', oldLevel, '| New level:', newLevel);
          
          // Level up logic
          let updates: Partial<Character> = {
            totalXp: newTotalXp,
            currentXp,
            level: newLevel,
          };
          
          if (newLevel > oldLevel) {
            console.log('[addXp] LEVEL UP! From', oldLevel, 'to', newLevel);
            // Level up rewards
            const goldReward = gameConfig.goldRewards.levelUp * (newLevel - oldLevel);
            updates.gold = state.user.character.gold + goldReward;
            
            // Heal to full HP on level up
            if (gameConfig.hp.fullHealOnLevelUp) {
              const newMaxHp = gameConfig.hp.baseMaxHp + (newLevel * gameConfig.levels.statsPerLevel.maxHp);
              updates.maxHp = newMaxHp;
              updates.hp = newMaxHp;
            }
            
            // Add level up notification
            get().addNotification({
              type: 'level_up',
              title: '🎉 Level Up!',
              message: `Congratulations! You reached level ${newLevel}!`,
            });
          }
          
          console.log('[addXp] Updating character with:', updates);
          
          return {
            user: {
              ...state.user,
              character: {
                ...state.user.character,
                ...updates,
              },
            },
          };
        });
        console.log('[addXp] State update complete');
      },

      addGold: (amount: number) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              character: {
                ...state.user.character,
                gold: state.user.character.gold + amount,
              },
            },
          };
        });
      },

      takeDamage: (amount: number) => {
        set((state) => {
          if (!state.user) return state;
          const newHp = Math.max(0, state.user.character.hp - amount);
          return {
            user: {
              ...state.user,
              character: {
                ...state.user.character,
                hp: newHp,
              },
            },
          };
        });
      },

      heal: (amount: number) => {
        set((state) => {
          if (!state.user) return state;
          const newHp = Math.min(state.user.character.maxHp, state.user.character.hp + amount);
          return {
            user: {
              ...state.user,
              character: {
                ...state.user.character,
                hp: newHp,
              },
            },
          };
        });
      },

      addQuest: (quest: Quest) => {
        set((state) => ({
          activeQuests: [...state.activeQuests, quest],
        }));
      },

      updateQuest: (questId: string, updates: Partial<Quest>) => {
        set((state) => ({
          activeQuests: state.activeQuests.map((q) =>
            q.id === questId ? { ...q, ...updates } : q
          ),
        }));
      },

      completeQuest: (questId: string) => {
        console.log('[completeQuest] Function called with questId:', questId);
        set((state) => {
          const quest = state.activeQuests.find((q) => q.id === questId);
          if (!quest) {
            console.log('[completeQuest] Quest not found in activeQuests');
            return state;
          }
          
          if (!state.user) {
            console.log('[completeQuest] No user found');
            return state;
          }
          
          console.log('[completeQuest] Found quest:', quest.title, '| XP:', quest.xpReward, '| Gold:', quest.goldReward);
          
          // Prevent duplicate XP - check if already completed
          if (quest.completed) {
            console.log('[Quest] Quest already completed, skipping rewards:', quest.title);
            return state;
          }
          
          // Calculate new XP and level
          const newTotalXp = state.user.character.totalXp + quest.xpReward;
          const newLevel = calculateLevel(newTotalXp);
          const oldLevel = state.user.character.level;
          const currentXp = newTotalXp - gameConfig.levels.xpThresholds[newLevel - 1];
          
          // Calculate new gold
          let newGold = state.user.character.gold + quest.goldReward;
          
          // Calculate new HP (heal)
          const healAmount = gameConfig.hp.healPerHabitComplete;
          let newHp = Math.min(state.user.character.maxHp, state.user.character.hp + healAmount);
          let newMaxHp = state.user.character.maxHp;
          
          // Level up bonuses
          if (newLevel > oldLevel) {
            console.log('[completeQuest] LEVEL UP! From', oldLevel, 'to', newLevel);
            const goldReward = gameConfig.goldRewards.levelUp * (newLevel - oldLevel);
            newGold += goldReward;
            
            // Heal to full HP on level up
            if (gameConfig.hp.fullHealOnLevelUp) {
              newMaxHp = gameConfig.hp.baseMaxHp + (newLevel * gameConfig.levels.statsPerLevel.maxHp);
              newHp = newMaxHp;
            }
          }
          
          console.log('[completeQuest] New XP:', newTotalXp, '| New Gold:', newGold, '| New Level:', newLevel);
          
          // Update quest
          const completedQuest = {
            ...quest,
            completed: true,
            completedAt: new Date(),
            progress: quest.target,
          };
          
          console.log('[completeQuest] Updating all state in single set()');
          
          // Update ALL state in a SINGLE atomic operation
          return {
            activeQuests: state.activeQuests.filter((q) => q.id !== questId),
            completedQuests: [...state.completedQuests, completedQuest],
            notifications: [
              {
                id: Date.now().toString(),
                type: 'quest_complete' as const,
                title: '✅ Quest Complete!',
                message: `You completed "${quest.title}" and earned ${quest.xpReward} XP!`,
                timestamp: new Date(),
                read: false,
              },
              ...(newLevel > oldLevel ? [{
                id: (Date.now() + 1).toString(),
                type: 'level_up' as const,
                title: '🎉 Level Up!',
                message: `Congratulations! You reached level ${newLevel}!`,
                timestamp: new Date(),
                read: false,
              }] : []),
              ...state.notifications,
            ],
            unreadCount: state.unreadCount + (newLevel > oldLevel ? 2 : 1),
            user: {
              ...state.user,
              character: {
                ...state.user.character,
                totalXp: newTotalXp,
                currentXp,
                level: newLevel,
                gold: newGold,
                hp: newHp,
                maxHp: newMaxHp,
              },
              stats: {
                ...state.user.stats,
                totalQuestsCompleted: state.user.stats.totalQuestsCompleted + 1,
              },
            },
          };
        });
        console.log('[completeQuest] State update complete');
      },

      deleteQuest: (questId: string) => {
        set((state) => ({
          activeQuests: state.activeQuests.filter((q) => q.id !== questId),
        }));
      },

      unlockAchievement: (achievementId: string) => {
        set((state) => {
          const achievement = state.achievements.find((a) => a.id === achievementId);
          if (!achievement || achievement.unlocked) return state;
          
          const unlockedAchievement = {
            ...achievement,
            unlocked: true,
            unlockedAt: new Date(),
          };
          
          // Award rewards
          get().addXp(achievement.xpReward);
          get().addGold(achievement.goldReward);
          
          // Add notification
          get().addNotification({
            type: 'achievement',
            title: '🏆 Achievement Unlocked!',
            message: `You unlocked "${achievement.title}"!`,
            icon: achievement.icon,
          });
          
          // Update stats
          if (state.user) {
            set({
              user: {
                ...state.user,
                stats: {
                  ...state.user.stats,
                  totalAchievementsUnlocked: state.user.stats.totalAchievementsUnlocked + 1,
                },
              },
            });
          }
          
          return {
            achievements: state.achievements.map((a) =>
              a.id === achievementId ? unlockedAchievement : a
            ),
            unlockedAchievements: [...state.unlockedAchievements, unlockedAchievement],
          };
        });
      },

      updateAchievementProgress: (achievementId: string, progress: number) => {
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === achievementId ? { ...a, progress } : a
          ),
        }));
        
        // Check if achievement should be unlocked
        const achievement = get().achievements.find((a) => a.id === achievementId);
        if (achievement && progress >= achievement.target && !achievement.unlocked) {
          get().unlockAchievement(achievementId);
        }
      },

      addItem: (item: InventoryItem) => {
        set((state) => {
          const existingItem = state.inventory.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              inventory: state.inventory.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return {
            inventory: [...state.inventory, item],
          };
        });
      },

      useItem: (itemId: string) => {
        set((state) => {
          const item = state.inventory.find((i) => i.id === itemId);
          if (!item || item.quantity <= 0) return state;
          
          // Apply item effect
          if (item.effect) {
            switch (item.effect.type) {
              case 'hp_restore':
                get().heal(item.effect.value);
                break;
              case 'xp_boost':
                // TODO: Implement XP boost
                break;
              case 'gold_boost':
                // TODO: Implement gold boost
                break;
              case 'streak_freeze':
                // TODO: Implement streak freeze
                break;
            }
          }
          
          // Decrease quantity
          const newQuantity = item.quantity - 1;
          if (newQuantity <= 0) {
            return {
              inventory: state.inventory.filter((i) => i.id !== itemId),
            };
          }
          
          return {
            inventory: state.inventory.map((i) =>
              i.id === itemId ? { ...i, quantity: newQuantity } : i
            ),
          };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => ({
          inventory: state.inventory.filter((i) => i.id !== itemId),
        }));
      },

      addNotification: (notification: Omit<GameNotification, 'id' | 'timestamp' | 'read'>) => {
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: Date.now().toString(),
              timestamp: new Date(),
              read: false,
            },
            ...state.notifications,
          ],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markNotificationRead: (notificationId: string) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === notificationId);
          if (!notification || notification.read) return state;
          
          return {
            notifications: state.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      updateStreak: (type: Streak['type'], referenceId?: string) => {
        set((state) => {
          const existingStreak = state.streaks.find(
            (s) => s.type === type && s.referenceId === referenceId
          );
          
          if (existingStreak) {
            const newStreak = existingStreak.currentStreak + 1;
            const newLongest = Math.max(existingStreak.longestStreak, newStreak);
            
            return {
              streaks: state.streaks.map((s) =>
                s.type === type && s.referenceId === referenceId
                  ? {
                      ...s,
                      currentStreak: newStreak,
                      longestStreak: newLongest,
                      lastCompletedDate: new Date(),
                    }
                  : s
              ),
            };
          }
          
          // Create new streak
          return {
            streaks: [
              ...state.streaks,
              {
                type,
                referenceId,
                currentStreak: 1,
                longestStreak: 1,
                lastCompletedDate: new Date(),
                freezesAvailable: 0,
              },
            ],
          };
        });
        
        // Update user stats for overall streak
        if (type === 'overall') {
          const streak = get().streaks.find((s) => s.type === 'overall');
          if (streak && get().user) {
            set((state) => ({
              user: state.user ? {
                ...state.user,
                stats: {
                  ...state.user.stats,
                  currentStreak: streak.currentStreak,
                  longestStreak: Math.max(state.user.stats.longestStreak, streak.currentStreak),
                },
              } : null,
            }));
          }
        }
      },

      breakStreak: (type: Streak['type'], referenceId?: string) => {
        set((state) => ({
          streaks: state.streaks.map((s) =>
            s.type === type && s.referenceId === referenceId
              ? { ...s, currentStreak: 0 }
              : s
          ),
        }));
        
        // Update user stats for overall streak
        if (type === 'overall' && get().user) {
          set((state) => ({
            user: state.user ? {
              ...state.user,
              stats: {
                ...state.user.stats,
                currentStreak: 0,
              },
            } : null,
          }));
        }
      },

      // FCM Token Actions
      updateFCMToken: (token: string) => {
        console.log('[GameStore] Updating FCM token');
        set((state) => ({
          user: state.user ? {
            ...state.user,
            fcmToken: token,
          } : null,
        }));
      },

      reset: () => {
        set({
          user: null,
          activeQuests: [],
          completedQuests: [],
          achievements: [],
          unlockedAchievements: [],
          inventory: [],
          notifications: [],
          unreadCount: 0,
          streaks: [],
        });
      },
    }),
    {
      name: 'vital-quest-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to hydrate store:', error);
        } else {
          console.log('Store hydration complete');
        }
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
