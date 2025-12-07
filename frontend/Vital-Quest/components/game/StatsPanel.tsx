import { theme } from '@/constants/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  interpolateColor,
  useDerivedValue
} from 'react-native-reanimated';

// --- Retro Dark Configuration ---
const RETRO_BORDER_WIDTH = 2;
const RETRO_DEPTH = 5;
const RETRO_RADIUS = 4;

const PALETTE = {
  panelBg: '#1e293b',      // Slate 800
  panelBorder: '#0f172a',  // Slate 900
  slotBg: '#020617',       // Deep Black
  slotBorder: '#334155',   // Slate 700
  text: '#f1f5f9',
  textDim: '#64748b',
  neon: {
    hpHigh: '#4ade80',     // Green
    hpMid: '#facc15',      // Yellow
    hpLow: '#ef4444',      // Red
    xp: '#3b82f6',         // Blue
    xpGlow: '#60a5fa',     // Light Blue
    gold: '#fbbf24',
    streak: '#f97316',     // Orange
  }
};

// --- Retro Bar Component ---
const RetroStatBar = ({ 
  current, 
  max, 
  color, 
  height = 18,
  label 
}: { 
  current: number; 
  max: number; 
  color: string;
  height?: number;
  label?: string;
}) => {
  const percent = Math.min(Math.max(current / max, 0), 1) * 100;
  
  return (
    <View style={[styles.retroBarContainer, { height, borderColor: PALETTE.slotBorder }]}>
      {/* Background Grid */}
      <View style={styles.gridTexture} />
      
      {/* Fill */}
      <View style={[styles.retroBarFill, { width: `${percent}%`, backgroundColor: color }]} />
      
      {/* Text Label Overlay */}
      <View style={styles.barOverlay}>
        <Text style={styles.barText}>{label}</Text>
      </View>

      {/* Glass Glare Effect */}
      <View style={styles.retroBarGlare} />
    </View>
  );
};

interface StatsPanelProps {
  level: number;
  currentXp: number;
  totalXp: number;
  xpForNextLevel: number;
  hp: number;
  maxHp: number;
  gold: number;
  streak: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  level,
  currentXp,
  totalXp,
  xpForNextLevel,
  hp,
  maxHp,
  gold,
  streak,
}) => {
  const scale = useSharedValue(1);
  const streakScale = useSharedValue(1);
  
  // HP Logic
  const hpPercentage = hp / maxHp;
  const getHpColor = () => {
    if (hpPercentage > 0.5) return PALETTE.neon.hpHigh;
    if (hpPercentage > 0.25) return PALETTE.neon.hpMid;
    return PALETTE.neon.hpLow;
  };

  // Pulse animation for low HP
  React.useEffect(() => {
    if (hpPercentage < 0.3) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 200 }),
          withTiming(1, { duration: 200 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [hpPercentage]);
  
  // Pulse animation for streak
  React.useEffect(() => {
    if (streak > 0) {
      streakScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [streak]);
  
  const hpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const streakAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));
  
  return (
    <View style={styles.container}>
      {/* Left Column: Level Badge */}
      <View style={styles.levelColumn}>
        <View style={styles.levelPlate}>
          <Text style={styles.levelLabel}>LVL</Text>
          <Text style={styles.levelNumber}>{level}</Text>
          <View style={styles.bolts}>
            <View style={styles.bolt} />
            <View style={styles.bolt} />
          </View>
        </View>
      </View>
      
      {/* Right Column: Stats */}
      <View style={styles.statsColumn}>
        
        {/* HP Bar */}
        <Animated.View style={[styles.statRow, hpAnimatedStyle]}>
          <View style={styles.labelContainer}>
             <Text style={[styles.statLabel, { color: getHpColor() }]}>HP</Text>
          </View>
          <View style={{ flex: 1 }}>
            <RetroStatBar
              current={hp}
              max={maxHp}
              color={getHpColor()}
              height={20}
              label={`${hp}/${maxHp}`}
            />
          </View>
        </Animated.View>
        
        {/* XP Bar */}
        <View style={styles.statRow}>
          <View style={styles.labelContainer}>
            <Text style={[styles.statLabel, { color: PALETTE.neon.xp }]}>XP</Text>
          </View>
          <View style={{ flex: 1 }}>
            <RetroStatBar
              current={currentXp}
              max={xpForNextLevel}
              color={PALETTE.neon.xp}
              height={20}
              label={`${currentXp}/${xpForNextLevel}`}
            />
          </View>
        </View>
        
        {/* Divider */}
        <View style={styles.divider} />

        {/* Bottom Row: Gold & Streak */}
        <View style={styles.bottomRow}>
          {/* Gold */}
          <View style={[styles.readoutBox, { borderColor: PALETTE.neon.gold }]}>
            <MaterialCommunityIcons name="currency-usd" size={16} color={PALETTE.neon.gold} />
            <Text style={[styles.readoutText, { color: PALETTE.neon.gold }]}>
              {gold.toLocaleString()}
            </Text>
          </View>
          
          {/* Streak */}
          {streak > 0 && (
            <Animated.View style={[styles.readoutBox, { borderColor: PALETTE.neon.streak }, streakAnimatedStyle]}>
              <MaterialCommunityIcons name="fire" size={16} color={PALETTE.neon.streak} />
              <Text style={[styles.readoutText, { color: PALETTE.neon.streak }]}>
                {streak} DAY{streak !== 1 ? 'S' : ''}
              </Text>
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: PALETTE.panelBg,
    borderRadius: RETRO_RADIUS,
    borderWidth: RETRO_BORDER_WIDTH,
    borderColor: PALETTE.panelBorder,
    borderBottomWidth: RETRO_DEPTH, // 3D effect
    marginBottom: 20,
    overflow: 'hidden',
  },
  levelColumn: {
    width: 80,
    padding: 12,
    borderRightWidth: 2,
    borderRightColor: PALETTE.panelBorder,
    backgroundColor: '#161e2b', // Slightly darker than panel
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelPlate: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#475569',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  levelLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '900',
    letterSpacing: 1,
  },
  levelNumber: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '800',
    lineHeight: 32,
  },
  bolts: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bolt: {
    width: 3,
    height: 3,
    backgroundColor: '#475569',
    borderRadius: 1.5,
  },
  statsColumn: {
    flex: 1,
    padding: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelContainer: {
    width: 30,
    marginRight: 8,
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  
  // Retro Bar Styles
  retroBarContainer: {
    backgroundColor: PALETTE.slotBg,
    borderWidth: 2,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  retroBarFill: {
    height: '100%',
  },
  retroBarGlare: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  gridTexture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    backgroundColor: '#334155', // Placeholder for scanline texture
  },
  barOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  barText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,1)',
    textShadowRadius: 2,
  },

  // Bottom Row
  divider: {
    height: 2,
    backgroundColor: PALETTE.slotBorder,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: PALETTE.panelBorder,
    marginVertical: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readoutBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.slotBg,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
    // Bottom border thicker for mini-3D effect
    borderBottomWidth: 3, 
  },
  readoutText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace', // Falls back to sans-serif if not available
  },
});