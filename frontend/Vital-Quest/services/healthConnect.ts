import { HealthActivity } from '@/types';
import { Platform } from 'react-native';
import { initialize, readRecords, requestPermission, SdkAvailabilityStatus } from 'react-native-health-connect';

// Health Connect record types
export enum HealthConnectPermission {
  STEPS = 'Steps',
  DISTANCE = 'Distance',
  ACTIVE_CALORIES_BURNED = 'ActiveCaloriesBurned',
  HEART_RATE = 'HeartRate',
  SLEEP_SESSION = 'SleepSession',
  EXERCISE_SESSION = 'ExerciseSession',
}

/**
 * Check if Health Connect is available on the device
 */
export async function isHealthConnectAvailable(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    console.warn('Health Connect is only available on Android');
    return false;
  }

  try {
    const status = await initialize();
    return status === SdkAvailabilityStatus.SDK_AVAILABLE;
  } catch (error) {
    console.error('Error checking Health Connect availability:', error);
    return false;
  }
}

/**
 * Request Health Connect permissions
 */
export async function requestHealthConnectPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const permissions = [
      { accessType: 'read', recordType: HealthConnectPermission.STEPS },
      { accessType: 'read', recordType: HealthConnectPermission.DISTANCE },
      { accessType: 'read', recordType: HealthConnectPermission.ACTIVE_CALORIES_BURNED },
      { accessType: 'read', recordType: HealthConnectPermission.HEART_RATE },
      { accessType: 'read', recordType: HealthConnectPermission.SLEEP_SESSION },
      { accessType: 'read', recordType: HealthConnectPermission.EXERCISE_SESSION },
    ];

    const granted = await requestPermission(permissions);
    return granted;
  } catch (error) {
    console.error('Error requesting Health Connect permissions:', error);
    return false;
  }
}

/**
 * Get steps data for a date range
 */
export async function getStepsData(startDate: Date, endDate: Date): Promise<number> {
  try {
    const result = await readRecords(HealthConnectPermission.STEPS, {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    let totalSteps = 0;
    if (result.records) {
      result.records.forEach((record: any) => {
        totalSteps += record.count || 0;
      });
    }

    return totalSteps;
  } catch (error) {
    console.error('Error fetching steps data:', error);
    return 0;
  }
}

/**
 * Get exercise sessions for a date range
 */
export async function getExerciseSessions(startDate: Date, endDate: Date): Promise<HealthActivity[]> {
  try {
    const result = await readRecords(HealthConnectPermission.EXERCISE_SESSION, {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    const activities: HealthActivity[] = [];
    
    if (result.records) {
      result.records.forEach((record: any) => {
        const startTime = new Date(record.startTime);
        const endTime = new Date(record.endTime);
        const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

        activities.push({
          id: record.metadata?.id || `exercise-${Date.now()}`,
          type: 'exercise',
          category: mapExerciseType(record.exerciseType),
          duration: durationMinutes,
          intensity: 'moderate', // Default, can be enhanced
          caloriesBurned: 0, // Would need to fetch from calories burned records
          date: startTime,
          source: 'health_connect',
        });
      });
    }

    return activities;
  } catch (error) {
    console.error('Error fetching exercise sessions:', error);
    return [];
  }
}

/**
 * Get sleep data for a date range
 */
export async function getSleepData(startDate: Date, endDate: Date): Promise<HealthActivity[]> {
  try {
    const result = await readRecords(HealthConnectPermission.SLEEP_SESSION, {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    const sleepActivities: HealthActivity[] = [];
    
    if (result.records) {
      result.records.forEach((record: any) => {
        const startTime = new Date(record.startTime);
        const endTime = new Date(record.endTime);
        const durationHours = (endTime.getTime() - startTime.getTime()) / 3600000;

        sleepActivities.push({
          id: record.metadata?.id || `sleep-${Date.now()}`,
          type: 'sleep',
          category: 'sleep',
          duration: Math.floor(durationHours * 60), // Convert to minutes
          quality: determineSleepQuality(durationHours),
          date: startTime,
          source: 'health_connect',
        });
      });
    }

    return sleepActivities;
  } catch (error) {
    console.error('Error fetching sleep data:', error);
    return [];
  }
}

/**
 * Get heart rate data for a date range
 */
export async function getHeartRateData(startDate: Date, endDate: Date): Promise<number> {
  try {
    const result = await readRecords(HealthConnectPermission.HEART_RATE, {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    let totalBpm = 0;
    let count = 0;

    if (result.records) {
      result.records.forEach((record: any) => {
        if (record.samples) {
          record.samples.forEach((sample: any) => {
            totalBpm += sample.beatsPerMinute || 0;
            count++;
          });
        }
      });
    }

    return count > 0 ? Math.round(totalBpm / count) : 0;
  } catch (error) {
    console.error('Error fetching heart rate data:', error);
    return 0;
  }
}

/**
 * Sync all health data for today
 */
export async function syncTodayHealthData(): Promise<{
  steps: number;
  exercises: HealthActivity[];
  sleep: HealthActivity[];
  avgHeartRate: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [steps, exercises, sleep, avgHeartRate] = await Promise.all([
    getStepsData(today, tomorrow),
    getExerciseSessions(today, tomorrow),
    getSleepData(today, tomorrow),
    getHeartRateData(today, tomorrow),
  ]);

  return {
    steps,
    exercises,
    sleep,
    avgHeartRate,
  };
}

/**
 * Sync health data for a specific date range
 */
export async function syncHealthDataRange(startDate: Date, endDate: Date): Promise<{
  steps: number;
  exercises: HealthActivity[];
  sleep: HealthActivity[];
  avgHeartRate: number;
}> {
  const [steps, exercises, sleep, avgHeartRate] = await Promise.all([
    getStepsData(startDate, endDate),
    getExerciseSessions(startDate, endDate),
    getSleepData(startDate, endDate),
    getHeartRateData(startDate, endDate),
  ]);

  return {
    steps,
    exercises,
    sleep,
    avgHeartRate,
  };
}

/**
 * Helper: Map Health Connect exercise types to our categories
 */
function mapExerciseType(exerciseType: number): string {
  // Health Connect exercise type codes
  const typeMap: { [key: number]: string } = {
    1: 'walking',
    2: 'running',
    3: 'cycling',
    4: 'swimming',
    5: 'yoga',
    6: 'strength_training',
    7: 'cardio',
    // Add more mappings as needed
  };

  return typeMap[exerciseType] || 'other';
}

/**
 * Helper: Determine sleep quality based on duration
 */
function determineSleepQuality(durationHours: number): 'poor' | 'fair' | 'good' | 'excellent' {
  if (durationHours < 5) return 'poor';
  if (durationHours < 6.5) return 'fair';
  if (durationHours < 9) return 'good';
  return 'excellent';
}

/**
 * Initialize Health Connect and request permissions
 */
export async function initializeHealthConnect(): Promise<boolean> {
  const isAvailable = await isHealthConnectAvailable();
  
  if (!isAvailable) {
    console.warn('Health Connect is not available on this device');
    return false;
  }

  const hasPermissions = await requestHealthConnectPermissions();
  
  if (!hasPermissions) {
    console.warn('Health Connect permissions not granted');
    return false;
  }

  console.log('Health Connect initialized successfully');
  return true;
}
