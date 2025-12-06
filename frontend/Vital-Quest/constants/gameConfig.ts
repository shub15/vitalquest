// Game Configuration & Balance
export const gameConfig = {
  // XP Rewards for Activities
  xpRewards: {
    // Steps (per 100 steps)
    steps100: 1,
    steps1000: 12,
    steps5000: 75,
    steps10000: 200,
    
    // Exercise (per minute)
    exerciseMinute: 2,
    exerciseSession: 50, // Bonus for completing a session
    
    // Meditation (per minute)
    meditationMinute: 3,
    meditationSession: 40,
    
    // Nutrition
    logMeal: 10,
    healthyMeal: 25,
    
    // Sleep (per hour of quality sleep)
    sleepHour: 5,
    perfectSleep: 50, // 7-9 hours
    
    // Water (per glass)
    waterGlass: 5,
    
    // Habits
    habitComplete: 20,
    habitStreak7: 100,
    habitStreak30: 500,
    
    // Quests
    dailyQuestComplete: 50,
    weeklyQuestComplete: 200,
    customQuestComplete: 100,
  },
  
  // Gold Rewards
  goldRewards: {
    questDaily: 25,
    questWeekly: 100,
    achievementUnlock: 50,
    levelUp: 100,
    streakMilestone: 75,
  },
  
  // Level System
  levels: {
    // XP required for each level (cumulative)
    xpThresholds: [
      0,      // Level 1
      100,    // Level 2
      250,    // Level 3
      500,    // Level 4
      850,    // Level 5
      1300,   // Level 6
      1850,   // Level 7
      2500,   // Level 8
      3250,   // Level 9
      4100,   // Level 10
      5050,   // Level 11
      6100,   // Level 12
      7250,   // Level 13
      8500,   // Level 14
      9850,   // Level 15
      11300,  // Level 16
      12850,  // Level 17
      14500,  // Level 18
      16250,  // Level 19
      18100,  // Level 20
      20050,  // Level 21
      22100,  // Level 22
      24250,  // Level 23
      26500,  // Level 24
      28850,  // Level 25
      31300,  // Level 26
      33850,  // Level 27
      36500,  // Level 28
      39250,  // Level 29
      42100,  // Level 30
    ],
    
    maxLevel: 30,
    
    // Stat increases per level
    statsPerLevel: {
      maxHp: 10,
      goldBonus: 5,
    },
  },
  
  // HP System
  hp: {
    baseMaxHp: 100,
    damagePerMissedHabit: 10,
    damagePerMissedDaily: 15,
    healPerHabitComplete: 5,
    fullHealOnLevelUp: true,
  },
  
  // Streak System
  streaks: {
    milestones: [3, 7, 14, 30, 60, 90, 180, 365],
    freezeCost: 50, // Gold cost for streak freeze
    freezeDuration: 1, // Days protected
  },
  
  // Achievement Tiers
  achievements: {
    tiers: {
      bronze: { threshold: 1, multiplier: 1 },
      silver: { threshold: 10, multiplier: 1.5 },
      gold: { threshold: 50, multiplier: 2 },
      legendary: { threshold: 100, multiplier: 3 },
    },
  },
  
  // Quest Difficulty Multipliers
  questDifficulty: {
    easy: { xpMultiplier: 1, goldMultiplier: 1 },
    medium: { xpMultiplier: 1.5, goldMultiplier: 1.5 },
    hard: { xpMultiplier: 2, goldMultiplier: 2 },
    epic: { xpMultiplier: 3, goldMultiplier: 3 },
  },
  
  // Notification Schedule (hours in 24h format)
  notifications: {
    morning: 8,      // Morning motivation
    midday: 12,      // Midday check-in
    evening: 18,     // Evening reminder
    streakAlert: 21, // Streak protection (9 PM)
  },
  
  // Health Connect Sync
  healthSync: {
    intervalMinutes: 30, // Sync every 30 minutes
    retryAttempts: 3,
  },
};

export type GameConfig = typeof gameConfig;
