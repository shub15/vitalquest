import { useGameStore } from '@/store/gameStore';
import { useHealthStore } from '@/store/healthStore';

export interface Recommendation {
  id: string;
  type: 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'motivation';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  icon: string;
}

/**
 * AI Coach - Rule-based recommendation engine
 * Analyzes user patterns and provides personalized suggestions
 */
export class AICoach {
  /**
   * Generate personalized recommendations based on user data
   */
  static getRecommendations(): Recommendation[] {
    const user = useGameStore.getState().user;
    const healthStore = useHealthStore.getState();
    
    if (!user) return [];

    const recommendations: Recommendation[] = [];
    const { todaySteps, todayExerciseMinutes, todayWaterGlasses, activities } = healthStore;

    // Step recommendations
    if (todaySteps < 5000) {
      recommendations.push({
        id: 'steps-low',
        type: 'workout',
        title: 'Boost Your Steps',
        message: `You're at ${todaySteps.toLocaleString()} steps today. Try a 15-minute walk to reach 7,500 steps!`,
        priority: 'high',
        icon: 'shoe-print',
      });
    } else if (todaySteps >= 10000) {
      recommendations.push({
        id: 'steps-excellent',
        type: 'motivation',
        title: 'Step Goal Crushed!',
        message: `Amazing! You've hit ${todaySteps.toLocaleString()} steps. Keep this momentum going!`,
        priority: 'low',
        icon: 'party-popper',
      });
    }

    // Exercise recommendations
    if (todayExerciseMinutes < 15) {
      recommendations.push({
        id: 'exercise-needed',
        type: 'workout',
        title: 'Time to Move',
        message: 'You haven\'t exercised much today. A quick 20-minute workout can boost your energy!',
        priority: 'high',
        icon: 'dumbbell',
      });
    } else if (todayExerciseMinutes >= 30) {
      recommendations.push({
        id: 'exercise-great',
        type: 'motivation',
        title: 'Workout Warrior!',
        message: `${todayExerciseMinutes} minutes of exercise today! Your consistency is paying off.`,
        priority: 'low',
        icon: 'trophy',
      });
    }

    // Hydration recommendations
    if (todayWaterGlasses < 4) {
      recommendations.push({
        id: 'hydration-low',
        type: 'hydration',
        title: 'Stay Hydrated',
        message: `You've only had ${todayWaterGlasses} glasses of water. Aim for 8 glasses daily for optimal health.`,
        priority: 'medium',
        icon: 'water',
      });
    } else if (todayWaterGlasses >= 8) {
      recommendations.push({
        id: 'hydration-perfect',
        type: 'motivation',
        title: 'Hydration Hero!',
        message: 'Perfect hydration today! Your body thanks you.',
        priority: 'low',
        icon: 'star-four-points',
      });
    }

    // Sleep analysis (check last 3 days)
    const recentSleep = activities
      .filter(a => a.type === 'sleep')
      .slice(-3);
    
    if (recentSleep.length > 0) {
      const avgSleep = recentSleep.reduce((sum, a) => sum + (a.value || 0), 0) / recentSleep.length;
      
      if (avgSleep < 6) {
        recommendations.push({
          id: 'sleep-low',
          type: 'sleep',
          title: 'Prioritize Sleep',
          message: `Your average sleep is ${avgSleep.toFixed(1)} hours. Aim for 7-9 hours for better recovery.`,
          priority: 'high',
          icon: 'bed',
        });
      } else if (avgSleep >= 7 && avgSleep <= 9) {
        recommendations.push({
          id: 'sleep-optimal',
          type: 'motivation',
          title: 'Sleep Champion!',
          message: `Great sleep pattern! ${avgSleep.toFixed(1)} hours is in the optimal range.`,
          priority: 'low',
          icon: 'moon-waning-crescent',
        });
      }
    }

    // Streak motivation
    if (user.stats.currentStreak >= 7) {
      recommendations.push({
        id: 'streak-milestone',
        type: 'motivation',
        title: 'Streak Master!',
        message: `${user.stats.currentStreak} day streak! You're building incredible habits.`,
        priority: 'low',
        icon: 'fire',
      });
    } else if (user.stats.currentStreak === 0) {
      recommendations.push({
        id: 'streak-start',
        type: 'motivation',
        title: 'Start Your Streak',
        message: 'Complete a quest today to start building your streak!',
        priority: 'medium',
        icon: 'star',
      });
    }

    // Nutrition recommendations (based on meal logging)
    const todayMeals = activities.filter(
      a => a.type === 'meal' && 
      new Date(a.date).toDateString() === new Date().toDateString()
    );

    if (todayMeals.length < 2) {
      recommendations.push({
        id: 'nutrition-track',
        type: 'nutrition',
        title: 'Track Your Meals',
        message: 'Log your meals to get personalized nutrition insights!',
        priority: 'medium',
        icon: 'food-apple',
      });
    }

    // Level-based recommendations
    if (user.character.level < 5) {
      recommendations.push({
        id: 'beginner-tip',
        type: 'motivation',
        title: 'Welcome, Adventurer!',
        message: 'Focus on completing daily quests to level up quickly. Small consistent actions lead to big results!',
        priority: 'medium',
        icon: 'target',
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Get a single motivational tip
   */
  static getMotivationalTip(): string {
    const tips = [
      "Every step counts towards your health journey!",
      "Consistency beats perfection. Keep showing up!",
      "Your future self will thank you for today's effort.",
      "Small daily improvements lead to stunning results.",
      "You're stronger than you think. Keep pushing!",
      "Health is wealth. Invest in yourself daily.",
      "Progress, not perfection, is the goal.",
      "Your body can do amazing things. Believe in it!",
      "Make today count. You've got this!",
      "Celebrate every victory, no matter how small.",
    ];

    return tips[Math.floor(Math.random() * tips.length)];
  }

  /**
   * Analyze activity patterns and provide insights
   */
  static getActivityInsights(): {
    strengths: string[];
    improvements: string[];
    predictions: string[];
  } {
    const healthStore = useHealthStore.getState();
    const user = useGameStore.getState().user;
    
    const strengths: string[] = [];
    const improvements: string[] = [];
    const predictions: string[] = [];

    if (!user) return { strengths, improvements, predictions };

    // Analyze strengths
    if (healthStore.todaySteps >= 10000) {
      strengths.push('Excellent step count - you\'re very active!');
    }
    if (healthStore.todayExerciseMinutes >= 30) {
      strengths.push('Meeting daily exercise goals consistently');
    }
    if (healthStore.todayWaterGlasses >= 8) {
      strengths.push('Great hydration habits');
    }
    if (user.stats.currentStreak >= 7) {
      strengths.push('Strong consistency with your health routine');
    }

    // Analyze improvements
    if (healthStore.todaySteps < 5000) {
      improvements.push('Increase daily steps - aim for 7,500+');
    }
    if (healthStore.todayExerciseMinutes < 20) {
      improvements.push('Add more structured exercise to your routine');
    }
    if (healthStore.todayWaterGlasses < 6) {
      improvements.push('Drink more water throughout the day');
    }

    // Predictions
    const xpToNextLevel = user.character.level * 100;
    const daysToNextLevel = Math.ceil(xpToNextLevel / 50); // Assuming avg 50 XP/day
    predictions.push(`You could reach level ${user.character.level + 1} in ${daysToNextLevel} days at your current pace`);
    
    if (user.stats.currentStreak > 0) {
      predictions.push(`Keep your ${user.stats.currentStreak}-day streak going to unlock streak achievements`);
    }

    return { strengths, improvements, predictions };
  }
}

export default AICoach;
