import { User } from '@/types';

/**
 * Dynamic Class System
 * Character class changes based on activity patterns
 */

export type CharacterClass = 'villager' | 'warrior' | 'monk' | 'assassin';

export interface ActivityStats {
  totalSteps: number;
  totalExerciseMinutes: number;
  totalMeditationMinutes: number;
  averageDailySteps: number;
  averageDailyExercise: number;
  averageDailyMeditation: number;
}

// Thresholds for class determination (per day averages)
const CLASS_THRESHOLDS = {
  warrior: {
    exerciseMinutes: 30, // 30+ min/day exercise
  },
  monk: {
    meditationMinutes: 15, // 15+ min/day meditation
  },
  assassin: {
    steps: 10000, // 10k+ steps/day
  },
};

/**
 * Calculate average daily stats based on total stats and days active
 */
export function calculateActivityStats(user: User): ActivityStats {
  const joinedDate = new Date(user.stats.joinedDate);
  const now = new Date();
  const daysActive = Math.max(1, Math.ceil((now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    totalSteps: user.stats.totalSteps,
    totalExerciseMinutes: user.stats.totalExerciseMinutes,
    totalMeditationMinutes: user.stats.totalMeditationMinutes,
    averageDailySteps: Math.floor(user.stats.totalSteps / daysActive),
    averageDailyExercise: Math.floor(user.stats.totalExerciseMinutes / daysActive),
    averageDailyMeditation: Math.floor(user.stats.totalMeditationMinutes / daysActive),
  };
}

/**
 * Determine character class based on activity patterns
 * Priority: Warrior > Monk > Assassin > Villager
 */
export function determineCharacterClass(user: User): CharacterClass {
  const stats = calculateActivityStats(user);

  // Calculate normalized scores (0-1) for each activity type
  const warriorScore = stats.averageDailyExercise / CLASS_THRESHOLDS.warrior.exerciseMinutes;
  const monkScore = stats.averageDailyMeditation / CLASS_THRESHOLDS.monk.meditationMinutes;
  const assassinScore = stats.averageDailySteps / CLASS_THRESHOLDS.assassin.steps;

  console.log('[DynamicClass] Activity scores:', {
    warrior: warriorScore.toFixed(2),
    monk: monkScore.toFixed(2),
    assassin: assassinScore.toFixed(2),
  });

  // Find the highest scoring class
  const scores = [
    { class: 'warrior' as CharacterClass, score: warriorScore },
    { class: 'monk' as CharacterClass, score: monkScore },
    { class: 'assassin' as CharacterClass, score: assassinScore },
  ];

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // If the top score is >= 1.0, assign that class
  if (scores[0].score >= 1.0) {
    console.log('[DynamicClass] Class determined:', scores[0].class, 'with score', scores[0].score.toFixed(2));
    return scores[0].class;
  }

  // If no activity meets threshold, return villager
  console.log('[DynamicClass] Class determined: villager (low activity)');
  return 'villager';
}

/**
 * Get class description for UI
 */
export function getClassDescription(characterClass: CharacterClass): string {
  switch (characterClass) {
    case 'warrior':
      return 'Masters of strength and endurance through intense training';
    case 'monk':
      return 'Enlightened souls who find power in meditation and mindfulness';
    case 'assassin':
      return 'Swift and agile, covering vast distances with ease';
    case 'villager':
      return 'Beginning their journey towards greatness';
  }
}

/**
 * Get class name for display
 */
export function getClassName(characterClass: CharacterClass): string {
  switch (characterClass) {
    case 'warrior':
      return 'WARRIOR';
    case 'monk':
      return 'MONK';
    case 'assassin':
      return 'ASSASSIN';
    case 'villager':
      return 'VILLAGER';
  }
}

/**
 * Map character class to avatar class number
 * Matches the existing avatar image naming: class_1_1.jpeg, class_2_1.jpeg, etc.
 */
export function getClassAvatarNumber(characterClass: CharacterClass): number {
  switch (characterClass) {
    case 'warrior':
      return 1; // class_1_X.jpeg
    case 'monk':
      return 2; // class_2_X.jpeg
    case 'assassin':
      return 3; // class_3_X.jpeg
    case 'villager':
      return 4; // class_4_X.jpeg (if exists, otherwise use class 1)
  }
}
