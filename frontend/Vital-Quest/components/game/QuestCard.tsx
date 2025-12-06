import { theme } from '@/constants/theme';
import { Quest } from '@/types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { ProgressBar } from './ProgressBar';

// Helper to map legacy emojis/invalid names to valid MaterialCommunityIcons
const getIconName = (iconName: string): any => {
  const map: Record<string, string> = {
    '👣': 'shoe-print',
    '💪': 'dumbbell',
    '💧': 'water',
    '🧘': 'meditation',
    '🍽️': 'food-apple',
    '🏃': 'run',
    '⚡': 'flash',
    '🕉️': 'flower-tulip',
    '😴': 'bed',
    '🌙': 'moon-waning-crescent',
    '🔥': 'fire',
    '⭐': 'star',
    '💰': 'hand-coin',
    '🎉': 'party-popper',
    '🏆': 'trophy',
    '✨': 'star-four-points',
    '🎯': 'target',
    'coins': 'hand-coin',
  };
  
  return map[iconName] || iconName;
};

interface QuestCardProps {
  quest: Quest;
  onPress?: () => void;
  onComplete?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onPress, onComplete }) => {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(0);
  const [localCompleted, setLocalCompleted] = React.useState(quest.completed);
  
  const progress = quest.progress / quest.target;
  const isComplete = progress >= 1 || localCompleted;
  
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));
  
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    
    if (onPress) {
      setTimeout(() => onPress(), 100);
    }
  };
  
  const handleComplete = () => {
    if (isComplete) return;
    
    setLocalCompleted(true);
    checkScale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
    
    if (onComplete) {
      setTimeout(() => onComplete(), 300);
    }
  };
  
  const getDifficultyColor = () => {
    switch (quest.difficulty) {
      case 'easy':
        return theme.colors.status.success;
      case 'medium':
        return theme.colors.status.info;
      case 'hard':
        return theme.colors.status.warning;
      case 'epic':
        return theme.colors.accent.legendary;
      default:
        return theme.colors.text.secondary;
    }
  };
  
  const getTypeColor = () => {
    switch (quest.type) {
      case 'daily':
        return theme.colors.quest.daily;
      case 'weekly':
        return theme.colors.quest.weekly;
      case 'custom':
        return theme.colors.quest.custom;
      default:
        return theme.colors.primary.main;
    }
  };
  
  return (
    <AnimatedTouchable
      style={[styles.container, cardAnimatedStyle, isComplete && styles.completedContainer]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={isComplete ? [theme.colors.quest.completed, theme.colors.status.success] : theme.colors.gradients.card}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name={getIconName(quest.icon)} size={28} color={theme.colors.text.primary} />
            </View>
            
            <View style={styles.headerInfo}>
              <View style={styles.badges}>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
                  <Text style={styles.badgeText}>{quest.type.toUpperCase()}</Text>
                </View>
                <View style={[styles.difficultyBadge, { borderColor: getDifficultyColor() }]}>
                  <Text style={[styles.badgeText, { color: getDifficultyColor() }]}>
                    {quest.difficulty.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.title} numberOfLines={1}>
                {quest.title}
              </Text>
            </View>
            
            {/* Checkbox */}
            <Pressable
              style={[styles.checkbox, isComplete && styles.checkboxCompleted]}
              onPress={handleComplete}
              disabled={isComplete}
            >
              {isComplete && (
                <Animated.View style={[checkAnimatedStyle]}>
                  <MaterialCommunityIcons name="check" size={20} color={theme.colors.text.primary} />
                </Animated.View>
              )}
            </Pressable>
          </View>
          
          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {quest.description}
          </Text>
          
          {/* Progress */}
          {!isComplete && (
            <ProgressBar
              current={quest.progress}
              max={quest.target}
              color={[getTypeColor(), theme.colors.primary.light]}
              height={12}
              showLabel={false}
              style={styles.progressBar}
            />
          )}
          
          {/* Rewards */}
          <View style={styles.rewards}>
            <View style={styles.reward}>
              <MaterialCommunityIcons name="star" size={14} color={theme.colors.text.secondary} style={{ marginRight: 4 }} />
              <Text style={styles.rewardText}>+{quest.xpReward} XP</Text>
            </View>
            <View style={styles.reward}>
              <MaterialCommunityIcons name="hand-coin" size={14} color={theme.colors.text.secondary} style={{ marginRight: 4 }} />
              <Text style={styles.rewardText}>+{quest.goldReward} Gold</Text>
            </View>
            {quest.streak > 0 && (
              <View style={styles.reward}>
                <MaterialCommunityIcons name="fire" size={14} color={theme.colors.text.secondary} style={{ marginRight: 4 }} />
                <Text style={styles.rewardText}>{quest.streak} streak</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  completedContainer: {
    opacity: 0.8,
  },
  gradient: {
    borderWidth: 2,
    borderColor: theme.colors.primary.dark,
    borderRadius: theme.borderRadius.xl,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary.dark,
  },
  icon: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.text.tertiary, // Fallback if getDifficultyColor logic is skipped in styling array
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.text.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.status.success,
    borderColor: theme.colors.status.success,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 18,
  },
  progressBar: {
    marginBottom: theme.spacing.sm,
  },
  rewards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  rewardText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
});
