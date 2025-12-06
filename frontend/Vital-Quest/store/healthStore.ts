import { DailySummary, HealthActivity } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, startOfDay } from 'date-fns';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface HealthState {
  // Health Activities
  activities: HealthActivity[];
  dailySummaries: DailySummary[];
  
  // Today's Data
  todaySteps: number;
  todayExerciseMinutes: number;
  todayMeditationMinutes: number;
  todayWaterGlasses: number;
  todayMealsLogged: number;
  todaySleepHours: number;
  
  // Sync Status
  lastSyncDate: Date | null;
  isSyncing: boolean;
  
  // Actions
  addActivity: (activity: Omit<HealthActivity, 'id'>) => void;
  updateActivity: (activityId: string, updates: Partial<HealthActivity>) => void;
  deleteActivity: (activityId: string) => void;
  
  // Daily Summary
  updateDailySummary: (date: Date) => void;
  getDailySummary: (date: Date) => DailySummary | undefined;
  
  // Today's Quick Actions
  addSteps: (steps: number) => void;
  addExerciseMinutes: (minutes: number) => void;
  addMeditationMinutes: (minutes: number) => void;
  addWaterGlass: () => void;
  addMeal: () => void;
  logSleep: (hours: number) => void;
  
  // Sync
  setSyncStatus: (isSyncing: boolean) => void;
  updateLastSync: () => void;
  
  // Bulk Import (from Health Connect)
  importHealthData: (activities: Omit<HealthActivity, 'id'>[]) => void;
  
  // Utility
  getTodayActivities: () => HealthActivity[];
  getActivitiesByDateRange: (startDate: Date, endDate: Date) => HealthActivity[];
  reset: () => void;
}

const createDailySummary = (date: Date, activities: HealthActivity[]): DailySummary => {
  const dayStart = startOfDay(date);
  const dayActivities = activities.filter(
    (a) => startOfDay(new Date(a.date)).getTime() === dayStart.getTime()
  );
  
  const steps = dayActivities
    .filter((a) => a.type === 'steps')
    .reduce((sum, a) => sum + a.value, 0);
  
  const exerciseMinutes = dayActivities
    .filter((a) => a.type === 'exercise')
    .reduce((sum, a) => sum + (a.metadata?.duration || a.value), 0);
  
  const meditationMinutes = dayActivities
    .filter((a) => a.type === 'meditation')
    .reduce((sum, a) => sum + (a.metadata?.duration || a.value), 0);
  
  const waterGlasses = dayActivities
    .filter((a) => a.type === 'water')
    .reduce((sum, a) => sum + a.value, 0);
  
  const mealsLogged = dayActivities
    .filter((a) => a.type === 'meal')
    .length;
  
  const sleepHours = dayActivities
    .filter((a) => a.type === 'sleep')
    .reduce((sum, a) => sum + a.value, 0);
  
  return {
    date: dayStart,
    steps,
    exerciseMinutes,
    meditationMinutes,
    waterGlasses,
    mealsLogged,
    sleepHours,
    questsCompleted: 0, // This will be updated from game store
    xpEarned: 0, // This will be updated from game store
    goldEarned: 0, // This will be updated from game store
    streakMaintained: false, // This will be updated from game store
  };
};

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      activities: [],
      dailySummaries: [],
      todaySteps: 0,
      todayExerciseMinutes: 0,
      todayMeditationMinutes: 0,
      todayWaterGlasses: 0,
      todayMealsLogged: 0,
      todaySleepHours: 0,
      lastSyncDate: null,
      isSyncing: false,

      addActivity: (activity: Omit<HealthActivity, 'id'>) => {
        const newActivity: HealthActivity = {
          ...activity,
          id: Date.now().toString() + Math.random(),
        };
        
        set((state) => ({
          activities: [...state.activities, newActivity],
        }));
        
        // Update today's totals if activity is from today
        const today = startOfDay(new Date());
        const activityDay = startOfDay(new Date(activity.date));
        
        if (today.getTime() === activityDay.getTime()) {
          switch (activity.type) {
            case 'steps':
              set((state) => ({ todaySteps: state.todaySteps + activity.value }));
              break;
            case 'exercise':
              set((state) => ({
                todayExerciseMinutes: state.todayExerciseMinutes + (activity.metadata?.duration || activity.value),
              }));
              break;
            case 'meditation':
              set((state) => ({
                todayMeditationMinutes: state.todayMeditationMinutes + (activity.metadata?.duration || activity.value),
              }));
              break;
            case 'water':
              set((state) => ({ todayWaterGlasses: state.todayWaterGlasses + activity.value }));
              break;
            case 'meal':
              set((state) => ({ todayMealsLogged: state.todayMealsLogged + 1 }));
              break;
            case 'sleep':
              set((state) => ({ todaySleepHours: activity.value }));
              break;
          }
        }
        
        // Update daily summary
        get().updateDailySummary(new Date(activity.date));
      },

      updateActivity: (activityId: string, updates: Partial<HealthActivity>) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === activityId ? { ...a, ...updates } : a
          ),
        }));
      },

      deleteActivity: (activityId: string) => {
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== activityId),
        }));
      },

      updateDailySummary: (date: Date) => {
        const summary = createDailySummary(date, get().activities);
        
        set((state) => {
          const existingIndex = state.dailySummaries.findIndex(
            (s) => startOfDay(new Date(s.date)).getTime() === startOfDay(date).getTime()
          );
          
          if (existingIndex >= 0) {
            const newSummaries = [...state.dailySummaries];
            newSummaries[existingIndex] = summary;
            return { dailySummaries: newSummaries };
          }
          
          return {
            dailySummaries: [...state.dailySummaries, summary],
          };
        });
      },

      getDailySummary: (date: Date) => {
        const dayStart = startOfDay(date);
        return get().dailySummaries.find(
          (s) => startOfDay(new Date(s.date)).getTime() === dayStart.getTime()
        );
      },

      addSteps: (steps: number) => {
        get().addActivity({
          type: 'steps',
          date: new Date(),
          value: steps,
          unit: 'steps',
          source: 'manual',
        });
      },

      addExerciseMinutes: (minutes: number) => {
        get().addActivity({
          type: 'exercise',
          date: new Date(),
          value: minutes,
          unit: 'minutes',
          source: 'manual',
          metadata: {
            duration: minutes,
          },
        });
      },

      addMeditationMinutes: (minutes: number) => {
        get().addActivity({
          type: 'meditation',
          date: new Date(),
          value: minutes,
          unit: 'minutes',
          source: 'manual',
          metadata: {
            duration: minutes,
          },
        });
      },

      addWaterGlass: () => {
        get().addActivity({
          type: 'water',
          date: new Date(),
          value: 1,
          unit: 'glasses',
          source: 'manual',
        });
      },

      addMeal: () => {
        get().addActivity({
          type: 'meal',
          date: new Date(),
          value: 1,
          unit: 'meals',
          source: 'manual',
        });
      },

      logSleep: (hours: number) => {
        get().addActivity({
          type: 'sleep',
          date: new Date(),
          value: hours,
          unit: 'hours',
          source: 'manual',
        });
      },

      setSyncStatus: (isSyncing: boolean) => {
        set({ isSyncing });
      },

      updateLastSync: () => {
        set({ lastSyncDate: new Date() });
      },

      importHealthData: (activities: Omit<HealthActivity, 'id'>[]) => {
        const newActivities: HealthActivity[] = activities.map((a) => ({
          ...a,
          id: Date.now().toString() + Math.random(),
        }));
        
        set((state) => ({
          activities: [...state.activities, ...newActivities],
        }));
        
        // Update daily summaries for affected dates
        const uniqueDates = new Set(
          newActivities.map((a) => format(startOfDay(new Date(a.date)), 'yyyy-MM-dd'))
        );
        
        uniqueDates.forEach((dateStr) => {
          get().updateDailySummary(new Date(dateStr));
        });
        
        // Update today's totals
        const today = startOfDay(new Date());
        const todayActivities = newActivities.filter(
          (a) => startOfDay(new Date(a.date)).getTime() === today.getTime()
        );
        
        todayActivities.forEach((activity) => {
          switch (activity.type) {
            case 'steps':
              set((state) => ({ todaySteps: state.todaySteps + activity.value }));
              break;
            case 'exercise':
              set((state) => ({
                todayExerciseMinutes: state.todayExerciseMinutes + (activity.metadata?.duration || activity.value),
              }));
              break;
            case 'meditation':
              set((state) => ({
                todayMeditationMinutes: state.todayMeditationMinutes + (activity.metadata?.duration || activity.value),
              }));
              break;
            case 'water':
              set((state) => ({ todayWaterGlasses: state.todayWaterGlasses + activity.value }));
              break;
            case 'meal':
              set((state) => ({ todayMealsLogged: state.todayMealsLogged + 1 }));
              break;
            case 'sleep':
              set((state) => ({ todaySleepHours: activity.value }));
              break;
          }
        });
        
        get().updateLastSync();
      },

      getTodayActivities: () => {
        const today = startOfDay(new Date());
        return get().activities.filter(
          (a) => startOfDay(new Date(a.date)).getTime() === today.getTime()
        );
      },

      getActivitiesByDateRange: (startDate: Date, endDate: Date) => {
        const start = startOfDay(startDate).getTime();
        const end = startOfDay(endDate).getTime();
        
        return get().activities.filter((a) => {
          const activityDate = startOfDay(new Date(a.date)).getTime();
          return activityDate >= start && activityDate <= end;
        });
      },

      reset: () => {
        set({
          activities: [],
          dailySummaries: [],
          todaySteps: 0,
          todayExerciseMinutes: 0,
          todayMeditationMinutes: 0,
          todayWaterGlasses: 0,
          todayMealsLogged: 0,
          todaySleepHours: 0,
          lastSyncDate: null,
          isSyncing: false,
        });
      },
    }),
    {
      name: 'vital-quest-health-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
