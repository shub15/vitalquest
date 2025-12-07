import { AchievementBadge } from '@/components/game/AchievementBadge';
import { CharacterAvatar } from '@/components/game/CharacterAvatar';
import { gameConfig } from '@/constants/gameConfig';
import { useGameStore } from '@/store/gameStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Retro Dark Palette ---
const PALETTE = {
  bg: '#0f172a',           // Deep Slate (Background)
  surface: '#1e293b',      // Slate 800 (Card Surface)
  surfaceHighlight: '#334155', // Slate 700 (Borders/Inactive)
  slot: '#020617',         // Black (Data Fields)
  text: '#f8fafc',         // White
  textDim: '#94a3b8',      // Gray
  accent: {
    gold: '#fbbf24',
    xp: '#3b82f6',         // Blue
    hp: '#ef4444',         // Red
    neonGreen: '#4ade80',
    neonPurple: '#c084fc',
    cyan: '#22d3ee',
  }
};

const RETRO_BORDER = 2;
const RETRO_DEPTH = 5;

export default function ProfileScreen() {
  const user = useGameStore((state) => state.user);
  const achievements = useGameStore((state) => state.achievements);
  const unlockedAchievements = useGameStore((state) => state.unlockedAchievements);
  
  const [selectedTab, setSelectedTab] = useState<'stats' | 'achievements'>('stats');
  
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PALETTE.accent.cyan} />
        <Text style={styles.loadingText}>LOADING DOSSIER...</Text>
      </View>
    );
  }
  
  // XP Calculations
  const xpForNextLevel = user.character.level < gameConfig.levels.maxLevel
    ? gameConfig.levels.xpThresholds[user.character.level]
    : gameConfig.levels.xpThresholds[gameConfig.levels.maxLevel - 1];
  
  const currentXp = user.character.totalXp - gameConfig.levels.xpThresholds[user.character.level - 1];
  const xpNeeded = xpForNextLevel - gameConfig.levels.xpThresholds[user.character.level - 1];
  const progressToNextLevel = (currentXp / xpNeeded) * 100;
  
  // Achievement Calculations
  const unlockedCount = unlockedAchievements.length;
  const totalAchievements = achievements.length;
  const achievementProgress = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- ID Card Header --- */}
          <View style={styles.idCard}>
            <View style={styles.idHeaderRow}>
              <View style={styles.avatarFrame}>
                <CharacterAvatar level={user.character.level} size={100} />
              </View>
              
              <View style={styles.idInfo}>
                <Text style={styles.idLabel}>OPERATIVE ID</Text>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.joinDate}>
                  RECRUITED: {format(new Date(user.stats.joinedDate), 'yyyy-MM-dd').toUpperCase()}
                </Text>
                
                {/* Level Bar */}
                <View style={styles.levelSection}>
                  <View style={styles.levelRow}>
                    <Text style={styles.levelLabel}>LVL.{user.character.level}</Text>
                    <Text style={styles.levelLabel}>NEXT.{user.character.level + 1}</Text>
                  </View>
                  <View style={styles.retroBarContainer}>
                    <View style={[styles.retroBarFill, { width: `${progressToNextLevel}%` }]} />
                    <View style={styles.retroBarGlare} />
                  </View>
                  <Text style={styles.xpText}>
                    {currentXp} / {xpNeeded} XP
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* --- Retro Tabs --- */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'stats' && styles.tabActive]}
              onPress={() => setSelectedTab('stats')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons 
                name="chart-bar" 
                size={16} 
                color={selectedTab === 'stats' ? PALETTE.slot : PALETTE.textDim} 
                style={{marginRight: 6}}
              />
              <Text style={[styles.tabText, selectedTab === 'stats' && styles.tabTextActive]}>
                STATUS
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'achievements' && styles.tabActive]}
              onPress={() => setSelectedTab('achievements')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons 
                name="trophy" 
                size={16} 
                color={selectedTab === 'achievements' ? PALETTE.slot : PALETTE.textDim} 
                style={{marginRight: 6}}
              />
              <Text style={[styles.tabText, selectedTab === 'achievements' && styles.tabTextActive]}>
                BADGES ({unlockedCount})
              </Text>
            </TouchableOpacity>
          </View>
          
          {selectedTab === 'stats' ? (
            <>
              {/* --- Core Stats Grid --- */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CORE ATTRIBUTES</Text>
                <View style={styles.statsGrid}>
                  
                  <View style={[styles.dataModule, { borderColor: PALETTE.accent.gold }]}>
                    <MaterialCommunityIcons name="crown" size={24} color={PALETTE.accent.gold} />
                    <Text style={[styles.dataValue, { color: PALETTE.accent.gold }]}>{user.character.level}</Text>
                    <Text style={styles.dataLabel}>RANK</Text>
                  </View>

                  <View style={[styles.dataModule, { borderColor: PALETTE.accent.xp }]}>
                    <MaterialCommunityIcons name="star-four-points" size={24} color={PALETTE.accent.xp} />
                    <Text style={[styles.dataValue, { color: PALETTE.accent.xp }]}>
                        {(user.character.totalXp / 1000).toFixed(1)}k
                    </Text>
                    <Text style={styles.dataLabel}>TOTAL XP</Text>
                  </View>

                  <View style={[styles.dataModule, { borderColor: PALETTE.accent.hp }]}>
                    <MaterialCommunityIcons name="heart" size={24} color={PALETTE.accent.hp} />
                    <Text style={[styles.dataValue, { color: PALETTE.accent.hp }]}>{user.character.hp}</Text>
                    <Text style={styles.dataLabel}>MAX HP</Text>
                  </View>

                  <View style={[styles.dataModule, { borderColor: PALETTE.accent.gold }]}>
                    <MaterialCommunityIcons name="hand-coin" size={24} color={PALETTE.accent.gold} />
                    <Text style={[styles.dataValue, { color: PALETTE.accent.gold }]}>
                        {user.character.gold}
                    </Text>
                    <Text style={styles.dataLabel}>CREDITS</Text>
                  </View>
                </View>
              </View>
              
              {/* --- Terminal Logs (Progress) --- */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>MISSION LOG</Text>
                <View style={styles.terminalContainer}>
                  <TerminalRow 
                    label="QUESTS CLEARED" 
                    value={user.stats.totalQuestsCompleted} 
                    icon="checkbox-marked-circle-outline"
                    color={PALETTE.accent.neonGreen}
                  />
                  <TerminalRow 
                    label="BADGES EARNED" 
                    value={user.stats.totalAchievementsUnlocked} 
                    icon="trophy-outline"
                    color={PALETTE.accent.gold}
                  />
                  <TerminalRow 
                    label="CURRENT STREAK" 
                    value={`${user.stats.currentStreak} DAYS`} 
                    icon="fire"
                    color={PALETTE.accent.hp}
                  />
                  <TerminalRow 
                    label="BEST STREAK" 
                    value={`${user.stats.longestStreak} DAYS`} 
                    icon="target"
                    color={PALETTE.accent.cyan}
                  />
                </View>
              </View>
              
              {/* --- Terminal Logs (Health) --- */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>PHYSICAL METRICS</Text>
                <View style={styles.terminalContainer}>
                  <TerminalRow 
                    label="TOTAL STEPS" 
                    value={user.stats.totalSteps.toLocaleString()} 
                    icon="shoe-print"
                  />
                  <TerminalRow 
                    label="TRAINING TIME" 
                    value={`${user.stats.totalExerciseMinutes.toLocaleString()} MIN`} 
                    icon="dumbbell"
                  />
                  <TerminalRow 
                    label="MINDFULNESS" 
                    value={`${user.stats.totalMeditationMinutes.toLocaleString()} MIN`} 
                    icon="meditation"
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              {/* --- Achievement Progress --- */}
              <View style={styles.section}>
                <View style={styles.terminalContainer}>
                  <Text style={styles.achieveTitle}>COLLECTION PROGRESS</Text>
                  <View style={styles.retroBarContainer}>
                    <View style={[styles.retroBarFill, { width: `${achievementProgress}%`, backgroundColor: PALETTE.accent.gold }]} />
                    <View style={styles.retroBarGlare} />
                  </View>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 8}}>
                    <Text style={styles.terminalText}>{unlockedCount}/{totalAchievements} UNLOCKED</Text>
                    <Text style={styles.terminalText}>{achievementProgress.toFixed(0)}%</Text>
                  </View>
                </View>
              </View>
              
              {/* --- Badges Grid --- */}
              <View style={styles.achievementsGrid}>
                {achievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </View>
              
              {achievements.length === 0 && (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="lock-outline" size={48} color={PALETTE.textDim} />
                  <Text style={styles.emptyText}>DATABASE EMPTY</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// --- Helper Components ---

const TerminalRow = ({ label, value, icon, color = PALETTE.text }: any) => (
  <View style={styles.terminalRow}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <MaterialCommunityIcons name={icon} size={16} color={PALETTE.textDim} style={{ marginRight: 10 }} />
      <Text style={styles.terminalLabel}>{label}</Text>
    </View>
    <View style={styles.dashedLine} />
    <Text style={[styles.terminalValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },
  container: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PALETTE.bg,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: PALETTE.accent.cyan,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // --- ID Card ---
  idCard: {
    backgroundColor: PALETTE.surface,
    borderWidth: RETRO_BORDER,
    borderColor: PALETTE.surfaceHighlight,
    borderBottomWidth: RETRO_DEPTH,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  idHeaderRow: {
    flexDirection: 'row',
  },
  avatarFrame: {
    borderWidth: 2,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 8,
    padding: 4,
    backgroundColor: PALETTE.slot,
    marginRight: 16,
  },
  idInfo: {
    flex: 1,
  },
  idLabel: {
    fontSize: 10,
    color: PALETTE.accent.cyan,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  username: {
    fontSize: 22,
    fontWeight: '800',
    color: PALETTE.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 10,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  
  // Level Section inside ID Card
  levelSection: {
    backgroundColor: PALETTE.slot,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: PALETTE.accent.xp,
  },
  retroBarContainer: {
    height: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: PALETTE.textDim,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 4,
  },
  retroBarFill: {
    height: '100%',
    backgroundColor: PALETTE.accent.xp,
  },
  retroBarGlare: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  xpText: {
    fontSize: 9,
    color: PALETTE.textDim,
    textAlign: 'right',
    fontFamily: 'monospace',
  },

  // --- Tabs ---
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderBottomWidth: 4, // 3D Button feel
  },
  tabActive: {
    backgroundColor: PALETTE.accent.cyan,
    borderColor: PALETTE.accent.cyan,
    borderBottomWidth: 4,
    borderBottomColor: '#0891b2', // Darker Cyan
  },
  tabText: {
    fontSize: 12,
    fontWeight: '900',
    color: PALETTE.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: PALETTE.slot, // Dark text on bright button
  },

  // --- Stats Grid ---
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: PALETTE.textDim,
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dataModule: {
    width: '48%',
    backgroundColor: PALETTE.slot,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderBottomWidth: 3,
    alignItems: 'center',
  },
  dataValue: {
    fontSize: 20,
    fontWeight: '800',
    color: PALETTE.text,
    marginVertical: 4,
    fontFamily: 'monospace',
  },
  dataLabel: {
    fontSize: 10,
    color: PALETTE.textDim,
    fontWeight: '900',
  },

  // --- Terminal Logs ---
  terminalContainer: {
    backgroundColor: PALETTE.slot,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 4,
    padding: 16,
  },
  terminalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  terminalLabel: {
    fontSize: 11,
    color: PALETTE.textDim,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    backgroundColor: PALETTE.surfaceHighlight,
    marginHorizontal: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight, 
  },
  terminalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PALETTE.text,
    fontFamily: 'monospace',
  },
  
  // --- Achievements ---
  achieveTitle: {
    fontSize: 10,
    color: PALETTE.textDim,
    marginBottom: 8,
    fontWeight: '900',
  },
  terminalText: {
    fontSize: 10,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center', // Center badges if odd number
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 12,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
  },
});