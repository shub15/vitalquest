import { gameConfig } from '@/constants/gameConfig';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationSchedule {
  id: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }
    
    // Set up notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B5CF6',
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule daily reminder notifications
 */
export async function scheduleDailyReminders(): Promise<void> {
  try {
    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    const reminders: NotificationSchedule[] = [
      {
        id: 'morning-reminder',
        title: '🌅 Good Morning, Adventurer!',
        body: 'Start your day strong! Check your daily quests and earn XP.',
        hour: gameConfig.notifications.morning,
        minute: 0,
      },
      {
        id: 'midday-reminder',
        title: '💪 Midday Check-in',
        body: "How's your progress? Complete activities to level up!",
        hour: gameConfig.notifications.midday,
        minute: 0,
      },
      {
        id: 'evening-reminder',
        title: '🌙 Evening Quest Review',
        body: 'Finish your daily quests before midnight to maintain your streak!',
        hour: gameConfig.notifications.evening,
        minute: 0,
      },
      {
        id: 'streak-alert',
        title: '🔥 Streak Protection Alert',
        body: "Don't break your streak! Complete at least one quest today.",
        hour: gameConfig.notifications.streakAlert,
        minute: 0,
      },
    ];
    
    for (const reminder of reminders) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: 'daily-reminder', id: reminder.id },
        },
        trigger: {
          hour: reminder.hour,
          minute: reminder.minute,
          repeats: true,
        },
      });
    }
    
    console.log('Daily reminders scheduled successfully');
  } catch (error) {
    console.error('Error scheduling daily reminders:', error);
  }
}

/**
 * Send immediate notification for achievement unlock
 */
export async function sendAchievementNotification(
  achievementTitle: string,
  achievementIcon: string,
  rarity: string
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🏆 Achievement Unlocked!`,
        body: `${achievementIcon} ${achievementTitle} (${rarity})`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'achievement', title: achievementTitle },
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending achievement notification:', error);
  }
}

/**
 * Send level up notification
 */
export async function sendLevelUpNotification(newLevel: number): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⭐ Level Up!',
        body: `Congratulations! You've reached Level ${newLevel}! 🎉`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'level-up', level: newLevel },
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending level up notification:', error);
  }
}

/**
 * Send quest completion notification
 */
export async function sendQuestCompleteNotification(
  questTitle: string,
  xpReward: number,
  goldReward: number
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Quest Completed!',
        body: `${questTitle} - Earned ${xpReward} XP and ${goldReward} gold!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
        data: { type: 'quest-complete', title: questTitle },
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending quest complete notification:', error);
  }
}

/**
 * Send streak milestone notification
 */
export async function sendStreakMilestoneNotification(streakDays: number): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Streak Milestone!',
        body: `Amazing! You've maintained a ${streakDays}-day streak! Keep it going!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'streak-milestone', days: streakDays },
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending streak milestone notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Initialize notification service
 */
export async function initializeNotifications(): Promise<boolean> {
  const hasPermission = await requestNotificationPermissions();
  
  if (hasPermission) {
    await scheduleDailyReminders();
    return true;
  }
  
  return false;
}
