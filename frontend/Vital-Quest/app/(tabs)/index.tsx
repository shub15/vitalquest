import { CharacterAvatar } from '@/components/game/CharacterAvatar';
import { QuestCard } from '@/components/game/QuestCard';
import { StatsPanel } from '@/components/game/StatsPanel';
import { QuickLogModal } from '@/components/health/QuickLogModal';
import { gameConfig } from '@/constants/gameConfig';
import { theme } from '@/constants/theme';
import { useHealthConnectSync } from '@/hooks/useHealthConnectSync';
import { checkAchievements, initializeGame, updateQuestProgress } from '@/services/gamificationEngine';
import { initialAchievements } from '@/services/mockData';
import { useGameStore } from '@/store/gameStore';
import { useHealthStore } from '@/store/healthStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Cyberpunk / Retro Palette ---
const PALETTE = {
  bg: '#0f172a',           // Deepest Slate (Screen Background)
  surface: '#1e293b',      // Slate 800 (Panels)
  surfaceHighlight: '#334155', // Slate 700 (Button Hover/Borders)
  slot: '#020617',         // Black/Void (Data inputs)
  text: '#f8fafc',         // White-ish
  textDim: '#64748b',      // Dimmed text
  accent: {
    cyan: '#22d3ee',
    green: '#4ade80',
    purple: '#c084fc',
    gold: '#fbbf24',
    red: '#f87171'
  }
};

const RETRO_RADIUS = 4;
const RETRO_BORDER_WIDTH = 2;

export default function DashboardScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'steps' | 'water' | 'meal' | 'exercise' | 'meditation' | 'sleep'>('steps');

  const user = useGameStore((state) => state.user);
  const activeQuests = useGameStore((state) => state.activeQuests);
  const initializeUser = useGameStore((state) => state.initializeUser);
  const completeQuest = useGameStore((state) => state.completeQuest);

  const todaySteps = useHealthStore((state) => state.todaySteps);
  const todayExerciseMinutes = useHealthStore((state) => state.todayExerciseMinutes);
  const todayWaterGlasses = useHealthStore((state) => state.todayWaterGlasses);

  const { syncData, syncDataRange, isSyncing } = useHealthConnectSync();

  const handleSync = async () => {
    const success = await syncData();
    if (success) {
      Alert.alert('SYSTEM SYNC', 'Bio-metrics updated successfully.');
    } else {
      Alert.alert('SYNC ERROR', 'Connection to health mainframe failed.');
    }
  };

  const handleSyncLastWeek = async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const success = await syncDataRange(startDate, endDate);
    if (success) Alert.alert('ARCHIVE SYNC', 'Historical data retrieved.');
    else Alert.alert('SYNC ERROR', 'Archive retrieval failed.');
  };

  useEffect(() => {
    if (!user) {
      initializeUser('HealthHero');
      const gameStore = useGameStore.getState();
      initialAchievements.forEach((achievement) => {
        if (!gameStore.achievements.find((a) => a.id === achievement.id)) {
          gameStore.achievements.push(achievement);
        }
      });
      initializeGame();
    }
  }, [user, initializeUser]);

  useEffect(() => {
    if (user) {
      updateQuestProgress();
      checkAchievements();
    }
  }, [todaySteps, todayExerciseMinutes, todayWaterGlasses, user]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PALETTE.accent.cyan} />
        <Text style={styles.loadingText}>INITIALIZING SYSTEM...</Text>
      </View>
    );
  }

  const xpForNextLevel = user.character.level < gameConfig.levels.maxLevel
    ? gameConfig.levels.xpThresholds[user.character.level]
    : gameConfig.levels.xpThresholds[gameConfig.levels.maxLevel - 1];

  const currentXp = user.character.totalXp - gameConfig.levels.xpThresholds[user.character.level - 1];
  const xpNeeded = xpForNextLevel - gameConfig.levels.xpThresholds[user.character.level - 1];
  const dailyQuests = activeQuests.filter((q) => q.type === 'daily').slice(0, 3);

  const handleQuestComplete = (questId: string) => completeQuest(questId);

  const openQuickLog = (type: typeof modalType) => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- Header / Identity Card --- */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>SYSTEM ONLINE</Text>
              <Text style={styles.username}>{user.username}</Text>
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>CONNECTED</Text>
              </View>
            </View>
            <View style={styles.avatarContainer}>
              <CharacterAvatar level={user.character.level} size={70} />
            </View>
          </View>

          {/* --- Main Stats Panel --- */}
          <StatsPanel
            level={user.character.level}
            currentXp={currentXp}
            totalXp={user.character.totalXp}
            xpForNextLevel={xpNeeded}
            hp={user.character.hp}
            maxHp={user.character.maxHp}
            gold={user.character.gold}
            streak={user.stats.currentStreak}
          />

          {/* --- Data Modules (Health) --- */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>BIO-METRICS</Text>
              
              {/* Retro Sync Buttons */}
              <View style={styles.syncButtons}>
                <TouchableOpacity
                  style={[styles.retroButton, styles.retroButtonSmall]}
                  onPress={handleSyncLastWeek}
                  disabled={isSyncing}
                >
                  <MaterialCommunityIcons name="history" size={14} color={PALETTE.textDim} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.retroButton}
                  onPress={handleSync}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <ActivityIndicator size="small" color={PALETTE.accent.cyan} />
                  ) : (
                    <View style={styles.btnContent}>
                      <MaterialCommunityIcons name="refresh" size={14} color={PALETTE.accent.cyan} />
                      <Text style={styles.btnText}>SYNC</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.healthGrid}>
              {/* Steps Module */}
              <View style={[styles.dataModule, { borderColor: PALETTE.accent.cyan }]}>
                <View style={styles.moduleHeader}>
                  <MaterialCommunityIcons name="shoe-print" size={16} color={PALETTE.accent.cyan} />
                  <Text style={[styles.moduleLabel, { color: PALETTE.accent.cyan }]}>STEPS</Text>
                </View>
                <Text style={styles.moduleValue}>{todaySteps.toLocaleString()}</Text>
              </View>

              {/* Exercise Module */}
              <View style={[styles.dataModule, { borderColor: PALETTE.accent.purple }]}>
                <View style={styles.moduleHeader}>
                  <MaterialCommunityIcons name="dumbbell" size={16} color={PALETTE.accent.purple} />
                  <Text style={[styles.moduleLabel, { color: PALETTE.accent.purple }]}>ACT</Text>
                </View>
                <Text style={styles.moduleValue}>{todayExerciseMinutes}<Text style={styles.unit}>m</Text></Text>
              </View>

              {/* Water Module */}
              <View style={[styles.dataModule, { borderColor: PALETTE.accent.green }]}>
                <View style={styles.moduleHeader}>
                  <MaterialCommunityIcons name="cup-water" size={16} color={PALETTE.accent.green} />
                  <Text style={[styles.moduleLabel, { color: PALETTE.accent.green }]}>H2O</Text>
                </View>
                <Text style={styles.moduleValue}>{todayWaterGlasses}<Text style={styles.unit}>/8</Text></Text>
              </View>
            </View>
          </View>

          {/* --- Active Missions --- */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ACTIVE MISSIONS</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>VIEW ALL &gt;</Text>
              </TouchableOpacity>
            </View>
            
            {dailyQuests.length > 0 ? (
              dailyQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onComplete={() => handleQuestComplete(quest.id)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>ALL OBJECTIVES CLEARED</Text>
              </View>
            )}
          </View>

          {/* --- Control Panel (Quick Actions) --- */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>CONTROL PANEL</Text>
            <View style={styles.actionGrid}>
              <QuickActionButton icon="shoe-print" label="STEPS" color={PALETTE.accent.cyan} onPress={() => openQuickLog('steps')} />
              <QuickActionButton icon="water" label="WATER" color={PALETTE.accent.green} onPress={() => openQuickLog('water')} />
              <QuickActionButton icon="food-apple" label="RATIONS" color={PALETTE.accent.gold} onPress={() => openQuickLog('meal')} />
              <QuickActionButton icon="dumbbell" label="TRAIN" color={PALETTE.accent.purple} onPress={() => openQuickLog('exercise')} />
              <QuickActionButton icon="meditation" label="MIND" color={PALETTE.accent.cyan} onPress={() => openQuickLog('meditation')} />
              <QuickActionButton icon="bed" label="REST" color={PALETTE.text} onPress={() => openQuickLog('sleep')} />
            </View>
          </View>

        </ScrollView>

        <QuickLogModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          type={modalType}
        />
      </View>
    </SafeAreaView>
  );
}

// Helper for the grid buttons
const QuickActionButton = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity style={styles.controlKey} onPress={onPress}>
    <View style={styles.keyInner}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={[styles.keyLabel, { color: color }]}>{label}</Text>
    </View>
  </TouchableOpacity>
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
    backgroundColor: PALETTE.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
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
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 10,
    color: PALETTE.accent.green,
    letterSpacing: 1.5,
    fontWeight: '900',
    marginBottom: 4,
  },
  username: {
    fontSize: 28,
    fontWeight: '800',
    color: PALETTE.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETTE.accent.green,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 10,
    color: PALETTE.textDim,
    fontWeight: '700',
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 8,
    padding: 4,
    backgroundColor: PALETTE.slot,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.textDim,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  seeAll: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PALETTE.accent.cyan,
  },

  // Buttons
  syncButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  retroButton: {
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 4,
    borderBottomWidth: 3, // 3D clicky feel
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retroButtonSmall: {
    paddingHorizontal: 8,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btnText: {
    fontSize: 10,
    fontWeight: '900',
    color: PALETTE.accent.cyan,
  },

  // Data Modules
  healthGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  dataModule: {
    flex: 1,
    backgroundColor: PALETTE.slot,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    borderBottomWidth: 3, // Retro depth
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  moduleLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  moduleValue: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.text,
    fontFamily: 'monospace',
  },
  unit: {
    fontSize: 12,
    color: PALETTE.textDim,
  },

  // Quest Empty State
  emptyState: {
    padding: 20,
    backgroundColor: PALETTE.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyText: {
    color: PALETTE.textDim,
    fontFamily: 'monospace',
  },

  // Control Panel Keys
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  controlKey: {
    width: '31%', // roughly 3 per row
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 6,
    borderBottomWidth: 4, // Deep keycap look
    marginBottom: 4,
  },
  keyInner: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  keyLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});