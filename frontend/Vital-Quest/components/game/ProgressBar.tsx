import { theme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

interface ProgressBarProps {
  current: number;
  max: number;
  color?: readonly string[];
  height?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  color = theme.colors.gradients.xp,
  height = 20,
  showLabel = true,
  label,
  animated = true,
  style,
}) => {
  const progress = Math.min(Math.max(current / max, 0), 1);
  const progressWidth = useSharedValue(0);
  
  React.useEffect(() => {
    if (animated) {
      progressWidth.value = withSpring(progress * 100, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      progressWidth.value = progress * 100;
    }
  }, [progress, animated]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));
  
  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label || `${current.toLocaleString()} / ${max.toLocaleString()}`}
          </Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.fill, animatedStyle, { height }]}>
          <LinearGradient
            colors={color}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  track: {
    width: '100%',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.primary.dark,
  },
  fill: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
});
