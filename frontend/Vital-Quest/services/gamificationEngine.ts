import { gameConfig } from '@/constants/gameConfig';
import { useGameStore } from '@/store/gameStore';
import { useHealthStore } from '@/store/healthStore';
import { Quest } from '@/types';

/**
 * Gamification Engine
 * Converts health activities into game rewards (XP, gold, achievements)
 */

// Calculate XP from steps
export const calculateStepsXp = (steps: number): number => {
  let xp = 0;
  
  // Incremental rewards
  if (steps >= 10000) {
    xp += gameConfig.xpRewards.steps10000;
  } else if (steps >= 5000) {
    xp += gameConfig.xpRewards.steps5000;
  } else if (steps >= 1000) {
    xp += gameConfig.xpRewards.steps1000;
  }
  
  // Base XP per 100 steps
  xp += Math.floor(steps / 100) * gameConfig.xpRewards.steps100;
  
  return xp;
};

// Calculate XP from exercise
export const calculateExerciseXp = (minutes: number): number => {
  const baseXp = minutes * gameConfig.xpRewards.exerciseMinute;
  const sessionBonus = minutes >= 30 ? gameConfig.xpRewards.exerciseSession : 0;
  return baseXp + sessionBonus;
};

// Calculate XP from meditation
export const calculateMeditationXp = (minutes: number): number => {
  const baseXp = minutes * gameConfig.xpRewards.meditationMinute;
  const sessionBonus = minutes >= 10 ? gameConfig.xpRewards.meditationSession : 0;
  return baseXp + sessionBonus;
};

// Calculate XP from sleep
export const calculateSleepXp = (hours: number): number => {
  const baseXp = hours * gameConfig.xpRewards.sleepHour;
  const perfectSleepBonus = hours >= 7 && hours <= 9 ? gameConfig.xpRewards.perfectSleep : 0;
  return baseXp + perfectSleepBonus;
};

// Calculate XP from water intake
export const calculateWaterXp = (glasses: number): number => {
  return glasses * gameConfig.xpRewards.waterGlass;
};

// Calculate XP from meal logging
export const calculateMealXp = (isHealthy: boolean = false): number => {
  return isHealthy ? gameConfig.xpRewards.healthyMeal : gameConfig.xpRewards.logMeal;
};

/**
 * Unified XP calculation for any activity type
 * Used by Health Connect sync and manual logging
 */
export const calculateXpForActivity = (activityType: string, value: number): number => {
  switch (activityType) {
    case 'steps':
      return calculateStepsXp(value);
    case 'exercise':
      return calculateExerciseXp(value);
    case 'meditation':
      return calculateMeditationXp(value);
    case 'sleep':
      return calculateSleepXp(value);
    case 'water':
      return calculateWaterXp(value);
    case 'meal':
      return gameConfig.xpRewards.logMeal;
    default:
      return 0;
  }
};


// Process daily activities and award XP
export const processDailyActivities = () => {
  const healthStore = useHealthStore.getState();
  const gameStore = useGameStore.getState();
  
  const todaySummary = healthStore.getDailySummary(new Date());
  if (!todaySummary) return;
  
  let totalXp = 0;
  
  // Steps XP
  if (todaySummary.steps > 0) {
    const stepsXp = calculateStepsXp(todaySummary.steps);
    totalXp += stepsXp;
  }
  
  // Exercise XP
  if (todaySummary.exerciseMinutes > 0) {
    const exerciseXp = calculateExerciseXp(todaySummary.exerciseMinutes);
    totalXp += exerciseXp;
  }
  
  // Meditation XP
  if (todaySummary.meditationMinutes > 0) {
    const meditationXp = calculateMeditationXp(todaySummary.meditationMinutes);
    totalXp += meditationXp;
  }
  
  // Sleep XP
  if (todaySummary.sleepHours > 0) {
    const sleepXp = calculateSleepXp(todaySummary.sleepHours);
    totalXp += sleepXp;
  }
  
  // Water XP
  if (todaySummary.waterGlasses > 0) {
    const waterXp = calculateWaterXp(todaySummary.waterGlasses);
    totalXp += waterXp;
  }
  
  // Meal XP
  if (todaySummary.mealsLogged > 0) {
    const mealXp = todaySummary.mealsLogged * gameConfig.xpRewards.logMeal;
    totalXp += mealXp;
  }
  
  return totalXp;
};

// Check and update achievement progress
export const checkAchievements = () => {
  const gameStore = useGameStore.getState();
  const healthStore = useHealthStore.getState();
  const user = gameStore.user;
  
  if (!user) return;
  
  const todaySummary = healthStore.getDailySummary(new Date());
  
  // Steps achievements
  if (todaySummary && todaySummary.steps >= 1000) {
    gameStore.updateAchievementProgress('ach_first_steps', todaySummary.steps);
  }
  if (todaySummary && todaySummary.steps >= 10000) {
    gameStore.updateAchievementProgress('ach_walker', todaySummary.steps);
  }
  
  // Total steps achievement
  const totalSteps = user.stats.totalSteps;
  gameStore.updateAchievementProgress('ach_marathon', totalSteps);
  
  // Exercise achievements
  if (todaySummary && todaySummary.exerciseMinutes >= 30) {
    gameStore.updateAchievementProgress('ach_workout_warrior', todaySummary.exerciseMinutes);
  }
  
  // Meditation achievements
  if (todaySummary && todaySummary.meditationMinutes >= 5) {
    gameStore.updateAchievementProgress('ach_zen_beginner', todaySummary.meditationMinutes);
  }
  
  const totalMeditationMinutes = user.stats.totalMeditationMinutes;
  gameStore.updateAchievementProgress('ach_mindful_master', totalMeditationMinutes);
  
  // Meal logging achievements
  gameStore.updateAchievementProgress('ach_meal_logger', 1);
  // Note: Track total meals in user stats for ach_nutrition_tracker
  
  // Water achievement
  if (todaySummary && todaySummary.waterGlasses >= 8) {
    gameStore.updateAchievementProgress('ach_hydration_hero', todaySummary.waterGlasses);
  }
  
  // Sleep achievements
  if (todaySummary && todaySummary.sleepHours >= 7 && todaySummary.sleepHours <= 9) {
    gameStore.updateAchievementProgress('ach_good_sleep', 1);
    // Track consecutive good sleep days for ach_sleep_champion
  }
  
  // Streak achievements
  const currentStreak = user.stats.currentStreak;
  if (currentStreak >= 3) {
    gameStore.updateAchievementProgress('ach_streak_3', currentStreak);
  }
  if (currentStreak >= 7) {
    gameStore.updateAchievementProgress('ach_streak_7', currentStreak);
  }
  if (currentStreak >= 30) {
    gameStore.updateAchievementProgress('ach_streak_30', currentStreak);
  }
  if (currentStreak >= 100) {
    gameStore.updateAchievementProgress('ach_streak_100', currentStreak);
  }
  
  // Quest achievements
  const totalQuests = user.stats.totalQuestsCompleted;
  if (totalQuests >= 1) {
    gameStore.updateAchievementProgress('ach_first_quest', totalQuests);
  }
  if (totalQuests >= 50) {
    gameStore.updateAchievementProgress('ach_quest_master', totalQuests);
  }
  if (totalQuests >= 200) {
    gameStore.updateAchievementProgress('ach_quest_legend', totalQuests);
  }
  
  // Level achievements
  const level = user.character.level;
  if (level >= 5) {
    gameStore.updateAchievementProgress('ach_level_5', level);
  }
  if (level >= 10) {
    gameStore.updateAchievementProgress('ach_level_10', level);
  }
  if (level >= 20) {
    gameStore.updateAchievementProgress('ach_level_20', level);
  }
  if (level >= 30) {
    gameStore.updateAchievementProgress('ach_level_30', level);
  }
};

// Generate default daily quests
export const generateDailyQuests = (): Quest[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return [
    {
      id: `daily_steps_${today.getTime()}`,
      title: 'Daily Steps Goal',
      description: 'Walk 10,000 steps today',
      type: 'daily',
      category: 'fitness',
      difficulty: 'medium',
      xpReward: 100,
      goldReward: 50,
      progress: 0,
      target: 10000,
      completed: false,
      createdAt: today,
      dueDate: tomorrow,
      streak: 0,
      icon: 'shoe-print',
    },
    {
      id: `daily_exercise_${today.getTime()}`,
      title: 'Exercise Session',
      description: 'Complete 30 minutes of exercise',
      type: 'daily',
      category: 'fitness',
      difficulty: 'medium',
      xpReward: 120,
      goldReward: 60,
      progress: 0,
      target: 30,
      completed: false,
      createdAt: today,
      dueDate: tomorrow,
      streak: 0,
      icon: 'dumbbell',
    },
    {
      id: `daily_water_${today.getTime()}`,
      title: 'Stay Hydrated',
      description: 'Drink 8 glasses of water',
      type: 'daily',
      category: 'hydration',
      difficulty: 'easy',
      xpReward: 60,
      goldReward: 30,
      progress: 0,
      target: 8,
      completed: false,
      createdAt: today,
      dueDate: tomorrow,
      streak: 0,
      icon: 'water',
    },
    {
      id: `daily_meditation_${today.getTime()}`,
      title: 'Mindful Moment',
      description: 'Meditate for 10 minutes',
      type: 'daily',
      category: 'mindfulness',
      difficulty: 'easy',
      xpReward: 80,
      goldReward: 40,
      progress: 0,
      target: 10,
      completed: false,
      createdAt: today,
      dueDate: tomorrow,
      streak: 0,
      icon: 'meditation',
    },
    {
      id: `daily_meals_${today.getTime()}`,
      title: 'Nutrition Tracking',
      description: 'Log 3 meals today',
      type: 'daily',
      category: 'nutrition',
      difficulty: 'easy',
      xpReward: 50,
      goldReward: 25,
      progress: 0,
      target: 3,
      completed: false,
      createdAt: today,
      dueDate: tomorrow,
      streak: 0,
      icon: 'food-apple',
    },
  ];
};

// Generate weekly quests
export const generateWeeklyQuests = (): Quest[] => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return [
    {
      id: `weekly_steps_${today.getTime()}`,
      title: 'Weekly Step Challenge',
      description: 'Walk 50,000 steps this week',
      type: 'weekly',
      category: 'fitness',
      difficulty: 'hard',
      xpReward: 500,
      goldReward: 250,
      progress: 0,
      target: 50000,
      completed: false,
      createdAt: today,
      dueDate: nextWeek,
      streak: 0,
      icon: 'run',
    },
    {
      id: `weekly_exercise_${today.getTime()}`,
      title: 'Weekly Workout Goal',
      description: 'Exercise for 150 minutes this week',
      type: 'weekly',
      category: 'fitness',
      difficulty: 'hard',
      xpReward: 600,
      goldReward: 300,
      progress: 0,
      target: 150,
      completed: false,
      createdAt: today,
      dueDate: nextWeek,
      streak: 0,
      icon: 'flash',
    },
    {
      id: `weekly_meditation_${today.getTime()}`,
      title: 'Weekly Mindfulness',
      description: 'Meditate for 70 minutes this week',
      type: 'weekly',
      category: 'mindfulness',
      difficulty: 'medium',
      xpReward: 400,
      goldReward: 200,
      progress: 0,
      target: 70,
      completed: false,
      createdAt: today,
      dueDate: nextWeek,
      streak: 0,
      icon: 'flower-tulip',
    },
  ];
};

// Update quest progress based on health activities
export const updateQuestProgress = () => {
  const gameStore = useGameStore.getState();
  const healthStore = useHealthStore.getState();
  const todaySummary = healthStore.getDailySummary(new Date());
  
  if (!todaySummary) return;
  
  gameStore.activeQuests.forEach((quest) => {
    if (quest.completed) return;
    
    let newProgress = quest.progress;
    
    switch (quest.category) {
      case 'fitness':
        if (quest.title.includes('Steps') || quest.title.includes('steps')) {
          newProgress = todaySummary.steps;
        } else if (quest.title.includes('Exercise') || quest.title.includes('exercise')) {
          newProgress = todaySummary.exerciseMinutes;
        }
        break;
      case 'hydration':
        newProgress = todaySummary.waterGlasses;
        break;
      case 'mindfulness':
        newProgress = todaySummary.meditationMinutes;
        break;
      case 'nutrition':
        newProgress = todaySummary.mealsLogged;
        break;
      case 'sleep':
        newProgress = todaySummary.sleepHours;
        break;
    }
    
    // Update quest progress
    if (newProgress !== quest.progress) {
      gameStore.updateQuest(quest.id, { progress: newProgress });
      
      // Auto-complete if target reached
      if (newProgress >= quest.target) {
        gameStore.completeQuest(quest.id);
      }
    }
  });
};

// Check for missed daily quests and apply damage
export const checkMissedQuests = () => {
  const gameStore = useGameStore.getState();
  const now = new Date();
  
  gameStore.activeQuests.forEach((quest) => {
    if (quest.type === 'daily' && quest.dueDate && new Date(quest.dueDate) < now && !quest.completed) {
      // Apply damage for missed daily quest
      gameStore.takeDamage(gameConfig.hp.damagePerMissedDaily);
      
      // Remove expired quest
      gameStore.deleteQuest(quest.id);
      
      // Add notification
      gameStore.addNotification({
        type: 'reminder',
        title: '⚠️ Quest Expired',
        message: `You missed "${quest.title}" and lost ${gameConfig.hp.damagePerMissedDaily} HP!`,
      });
    }
  });
};

// Initialize game with default quests and achievements
export const initializeGame = () => {
  const gameStore = useGameStore.getState();
  
  // Add daily quests
  const dailyQuests = generateDailyQuests();
  dailyQuests.forEach((quest) => gameStore.addQuest(quest));
  
  // Add weekly quests
  const weeklyQuests = generateWeeklyQuests();
  weeklyQuests.forEach((quest) => gameStore.addQuest(quest));
};
