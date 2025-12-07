import { theme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

// --- Retro Palette ---
const PALETTE = {
  bg: '#0f172a',
  slot: '#020617',         // Deep Black (Empty part of bar)
  border: '#334155',       // Slate 700
  text: '#94a3b8',         // Slate 400
  textHighlight: '#f8fafc',
};

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
  color = ['#3b82f6', '#2563eb'], // Default Blue
  height = 18,
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
        damping: 12,
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
        <View style={styles.labelRow}>
          <Text style={styles.label}>
             {label ? label.split('/')[0] : 'STATUS'}
          </Text>
          <Text style={styles.value}>
             {label ? label.split('/').pop()?.trim() : `${Math.floor(progress * 100)}%`}
          </Text>
        </View>
      )}
      
      <View style={[styles.track, { height }]}>
        {/* Background Grid Lines (Texture) */}
        <View style={styles.gridLines} />

        <Animated.View style={[styles.fill, animatedStyle, { height }]}>
          <LinearGradient
            colors={color}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Inner Light Glow to separate fill from bg */}
          <View style={styles.fillHighlight} />
        </Animated.View>

        {/* Glass Glare Effect (Top half) */}
        <View style={styles.glare} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: PALETTE.text,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PALETTE.textHighlight,
    fontFamily: 'monospace',
  },
  track: {
    width: '100%',
    backgroundColor: PALETTE.slot,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: PALETTE.border,
    position: 'relative',
    // "Recessed" look: thicker top/left borders conceptually, 
    // but uniform borders usually look cleaner on mobile.
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 1, // Slight rounding to fit inside track
  },
  fillHighlight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.4)', // The leading edge glow
  },
  glare: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%', // Top 40% is lighter
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex: 10,
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
    // Simulate vertical ticks using a dashed border or just opacity
    backgroundColor: 'transparent',
    opacity: 0.1,
    // Optional: add a repeated image or just leave as dark void
  },
});