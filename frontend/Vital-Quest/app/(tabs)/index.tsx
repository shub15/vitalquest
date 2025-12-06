import { CharacterAvatar } from '@/components/game/CharacterAvatar';
import { QuestCard } from '@/components/game/QuestCard';
import { StatsPanel } from '@/components/game/StatsPanel';
import { gameConfig } from '@/constants/gameConfig';
import { theme } from '@/constants/theme';
import { checkAchievements, initializeGame, updateQuestProgress } from '@/services/gamificationEngine';
import { initialAchievements, motivationalMessages } from '@/services/mockData';
import { useGameStore } from '@/store/gameStore';
import { useHealthStore } from '@/store/healthStore';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const user = useGameStore((state) => state.user);
  const activeQuests = useGameStore((state) => state.activeQuests);
  const achievements = useGameStore((state) => state.achievements);
  const initializeUser = useGameStore((state) => state.initializeUser);
  const completeQuest = useGameStore((state) => state.completeQuest);
  
  const todaySteps = useHealthStore((state) => state.todaySteps);
  const todayExerciseMinutes = useHealthStore((state) => state.todayExerciseMinutes);
  const todayWaterGlasses = useHealthStore((state) => state.todayWaterGlasses);
  
  // Initialize user if not exists
  useEffect(() => {
    if (!user) {
      initializeUser('HealthHero');
      
      // Initialize achievements
      const gameStore = useGameStore.getState();
      initialAchievements.forEach((achievement) => {
        if (!gameStore.achievements.find((a) => a.id === achievement.id)) {
          gameStore.achievements.push(achievement);
        }
      });
      
      // Initialize quests
      initializeGame();
    }
  }, [user, initializeUser]);
  
  // Update quest progress when health data changes
  useEffect(() => {
    if (user) {
      updateQuestProgress();
      checkAchievements();
    }
  }, [todaySteps, todayExerciseMinutes, todayWaterGlasses, user]);
  
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing your adventure...</Text>
      </View>
    );
  }
  
  const xpForNextLevel = user.character.level < gameConfig.levels.maxLevel
    ? gameConfig.levels.xpThresholds[user.character.level]
    : gameConfig.levels.xpThresholds[gameConfig.levels.maxLevel - 1];
  
  const currentXp = user.character.totalXp - gameConfig.levels.xpThresholds[user.character.level - 1];
  const xpNeeded = xpForNextLevel - gameConfig.levels.xpThresholds[user.character.level - 1];
  
  const dailyQuests = activeQuests.filter((q) => q.type === 'daily').slice(0, 3);
  const randomMotivation = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  
  const handleQuestComplete = (questId: string) => {
    completeQuest(questId);
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[theme.colors.background.primary, theme.colors.background.secondary]}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{user.username}!</Text>
          </View>
          <CharacterAvatar level={user.character.level} size={80} />
        </View>
        
        {/* Stats Panel */}
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
        
        {/* AI Coach Tip */}
        <View style={styles.coachCard}>
          <LinearGradient
            colors={[theme.colors.primary.dark, theme.colors.primary.main]}
            style={styles.coachGradient}
          >
            <Text style={styles.coachIcon}>🤖</Text>
            <View style={styles.coachContent}>
              <Text style={styles.coachTitle}>Coach's Tip</Text>
              <Text style={styles.coachMessage}>{randomMotivation}</Text>
            </View>
          </LinearGradient>
        </View>
        
        {/* Today's Health Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.healthGrid}>
            <View style={styles.healthCard}>
              <Text style={styles.healthIcon}>👣</Text>
              <Text style={styles.healthValue}>{todaySteps.toLocaleString()}</Text>
              <Text style={styles.healthLabel}>Steps</Text>
            </View>
            <View style={styles.healthCard}>
              <Text style={styles.healthIcon}>💪</Text>
              <Text style={styles.healthValue}>{todayExerciseMinutes}</Text>
              <Text style={styles.healthLabel}>Exercise (min)</Text>
            </View>
            <View style={styles.healthCard}>
              <Text style={styles.healthIcon}>💧</Text>
              <Text style={styles.healthValue}>{todayWaterGlasses}/8</Text>
              <Text style={styles.healthLabel}>Water</Text>
            </View>
          </View>
        </View>
        
        {/* Daily Quests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Quests</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All →</Text>
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
            <Text style={styles.emptyText}>No active quests. Great job! 🎉</Text>
          )}
        </View>
        
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={theme.colors.gradients.primary}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>➕</Text>
                <Text style={styles.actionText}>Log Activity</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={[theme.colors.quest.custom, theme.colors.primary.light]}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>📜</Text>
                <Text style={styles.actionText}>New Quest</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary,
  },
  coachCard: {
    marginVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  coachGradient: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary.light,
    borderRadius: theme.borderRadius.xl,
  },
  coachIcon: {
    fontSize: 40,
    marginRight: theme.spacing.md,
  },
  coachContent: {
    flex: 1,
  },
  coachTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  coachMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  seeAll: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.light,
  },
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthCard: {
    flex: 1,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.primary.dark,
  },
  healthIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  healthValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  healthLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    padding: theme.spacing.xl,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  actionGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary.dark,
    borderRadius: theme.borderRadius.lg,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
});
