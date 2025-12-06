import { theme } from '@/constants/theme';
import { Achievement } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface AchievementBadgeProps {
  achievement: Achievement;
  onPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement, onPress }) => {
  const scale = useSharedValue(1);
  const shine = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const shineStyle = useAnimatedStyle(() => ({
    opacity: shine.value,
  }));
  
  React.useEffect(() => {
    if (achievement.unlocked) {
      shine.value = withSequence(
        withTiming(0.8, { duration: 500 }),
        withTiming(0, { duration: 500 })
      );
    }
  }, [achievement.unlocked]);
  
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    
    if (onPress) {
      setTimeout(() => onPress(), 100);
    }
  };
  
  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'common':
        return theme.colors.rarity.common;
      case 'uncommon':
        return theme.colors.rarity.uncommon;
      case 'rare':
        return theme.colors.rarity.rare;
      case 'epic':
        return theme.colors.rarity.epic;
      case 'legendary':
        return theme.colors.rarity.legendary;
      default:
        return theme.colors.text.tertiary;
    }
  };
  
  const getRarityGradient = (): readonly string[] => {
    switch (achievement.rarity) {
      case 'legendary':
        return theme.colors.gradients.legendary;
      case 'epic':
        return theme.colors.gradients.primary;
      case 'rare':
        return ['#3B82F6', '#60A5FA'] as const;
      case 'uncommon':
        return theme.colors.gradients.xp;
      default:
        return ['#6B7280', '#9CA3AF'] as const;
    }
  };
  
  const progress = achievement.target > 0 ? (achievement.progress / achievement.target) * 100 : 0;
  
  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle, !achievement.unlocked && styles.locked]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={achievement.unlocked ? getRarityGradient() : ['#1E1538', '#2D1B4E'] as const}
        style={styles.gradient}
      >
        {/* Shine Effect */}
        {achievement.unlocked && (
          <Animated.View style={[styles.shine, shineStyle]} />
        )}
        
        {/* Icon */}
        <View style={[styles.iconContainer, { borderColor: getRarityColor() }]}>
          <Text style={[styles.icon, !achievement.unlocked && styles.iconLocked]}>
            {achievement.unlocked ? achievement.icon : '🔒'}
          </Text>
        </View>
        
        {/* Title */}
        <Text
          style={[styles.title, !achievement.unlocked && styles.textLocked]}
          numberOfLines={2}
        >
          {achievement.hidden && !achievement.unlocked ? '???' : achievement.title}
        </Text>
        
        {/* Progress or Unlocked Status */}
        {achievement.unlocked ? (
          <View style={styles.unlockedBadge}>
            <Text style={styles.unlockedText}>✓ UNLOCKED</Text>
          </View>
        ) : (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress} / {achievement.target}
            </Text>
          </View>
        )}
        
        {/* Rarity Badge */}
        <View style={[styles.rarityBadge, { backgroundColor: getRarityColor() }]}>
          <Text style={styles.rarityText}>{achievement.rarity.toUpperCase()}</Text>
        </View>
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    aspectRatio: 0.85,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  locked: {
    opacity: 0.6,
  },
  gradient: {
    flex: 1,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary.dark,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: theme.spacing.sm,
  },
  icon: {
    fontSize: 32,
  },
  iconLocked: {
    fontSize: 24,
  },
  title: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    minHeight: 32,
  },
  textLocked: {
    color: theme.colors.text.tertiary,
  },
  unlockedBadge: {
    backgroundColor: theme.colors.status.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  unlockedText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.light,
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  rarityBadge: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  rarityText: {
    fontSize: 8,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.background.primary,
  },
});
