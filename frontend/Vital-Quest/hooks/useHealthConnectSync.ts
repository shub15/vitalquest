import { calculateXpForActivity } from '@/services/gamificationEngine';
import {
    initializeHealthConnect,
    isHealthConnectAvailable,
    syncTodayHealthData,
} from '@/services/healthConnect';
import { useGameStore } from '@/store/gameStore';
import { useHealthStore } from '@/store/healthStore';
import { HealthActivity } from '@/types';
import { useEffect, useState } from 'react';

/**
 * Custom hook to manage Health Connect integration
 */
export function useHealthConnectSync() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { importHealthData, setSyncStatus, isSyncing } = useHealthStore();
  const { addXp, user } = useGameStore();

  // Check availability on mount
  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await isHealthConnectAvailable();
      setIsAvailable(available);
    } catch (err) {
      console.error('Error checking Health Connect availability:', err);
      setError('Failed to check Health Connect availability');
    }
  };

  const initialize = async (): Promise<boolean> => {
    try {
      setError(null);
      const success = await initializeHealthConnect();
      setIsInitialized(success);
      
      if (!success) {
        setError('Failed to initialize Health Connect. Please check permissions.');
      }
      
      return success;
    } catch (err) {
      console.error('Error initializing Health Connect:', err);
      setError('Failed to initialize Health Connect');
      return false;
    }
  };

  const syncData = async (): Promise<boolean> => {
    if (!isInitialized) {
      const initialized = await initialize();
      if (!initialized) {
        return false;
      }
    }

    try {
      setSyncStatus(true);
      setError(null);

      // Fetch today's health data
      const healthData = await syncTodayHealthData();

      // Convert Health Connect data to our HealthActivity format
      const activities: Omit<HealthActivity, 'id'>[] = [];

      // Add steps
      if (healthData.steps > 0) {
        activities.push({
          type: 'steps',
          date: new Date(),
          value: healthData.steps,
          unit: 'steps',
          source: 'health_connect',
        });
      }

      // Add exercises
      healthData.exercises.forEach((exercise) => {
        activities.push({
          type: 'exercise',
          date: exercise.date,
          value: exercise.duration || 0,
          unit: 'minutes',
          source: 'health_connect',
          metadata: {
            duration: exercise.duration,
            category: exercise.category,
            intensity: exercise.intensity,
            caloriesBurned: exercise.caloriesBurned,
          },
        });
      });

      // Add sleep
      healthData.sleep.forEach((sleep) => {
        const sleepHours = (sleep.duration || 0) / 60; // Convert minutes to hours
        activities.push({
          type: 'sleep',
          date: sleep.date,
          value: sleepHours,
          unit: 'hours',
          source: 'health_connect',
          metadata: {
            duration: sleep.duration,
            quality: sleep.quality,
          },
        });
      });

      // Import all activities into health store
      if (activities.length > 0) {
        importHealthData(activities);

        // Award XP for synced activities
        if (user) {
          let totalXp = 0;

          // Calculate XP for steps
          if (healthData.steps > 0) {
            totalXp += calculateXpForActivity('steps', healthData.steps);
          }

          // Calculate XP for exercises
          healthData.exercises.forEach((exercise) => {
            totalXp += calculateXpForActivity('exercise', exercise.duration || 0);
          });

          // Calculate XP for sleep
          healthData.sleep.forEach((sleep) => {
            const sleepHours = (sleep.duration || 0) / 60;
            totalXp += calculateXpForActivity('sleep', sleepHours);
          });

          if (totalXp > 0) {
            addXp(totalXp);
          }
        }
      }

      setSyncStatus(false);
      return true;
    } catch (err) {
      console.error('Error syncing Health Connect data:', err);
      setError('Failed to sync health data');
      setSyncStatus(false);
      return false;
    }
  };

  return {
    isAvailable,
    isInitialized,
    isSyncing,
    error,
    initialize,
    syncData,
  };
}
