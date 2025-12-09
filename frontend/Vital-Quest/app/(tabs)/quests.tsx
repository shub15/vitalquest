import { QuestCard } from '@/components/game/QuestCard';
import { useGameStore } from '@/store/gameStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Retro Dark Palette ---
const PALETTE = {
  bg: '#0f172a',           // Deep Slate
  surface: '#1e293b',      // Slate 800
  surfaceHighlight: '#334155', 
  text: '#f8fafc',
  textDim: '#64748b',
  accent: {
    cyan: '#22d3ee',
    green: '#4ade80',
    purple: '#c084fc',
    gold: '#fbbf24',
    red: '#f87171',
  }
};

const RETRO_BORDER = 2;
const RETRO_DEPTH = 4;

export default function QuestsScreen() {
  const activeQuests = useGameStore((state) => state.activeQuests);
  const completedQuests = useGameStore((state) => state.completedQuests);
  const completeQuest = useGameStore((state) => state.completeQuest);
  const addQuest = useGameStore((state) => state.addQuest);
  
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  
  const dailyQuests = activeQuests.filter((q) => q.type === 'daily');
  const weeklyQuests = activeQuests.filter((q) => q.type === 'weekly');
  const customQuests = activeQuests.filter((q) => q.type === 'custom');
  
  const recentCompleted = completedQuests.slice(0, 10);
  
  const handleQuestComplete = (questId: string) => {
    console.log('[quests.tsx] handleQuestComplete called with questId:', questId);
    console.log('[quests.tsx] Calling completeQuest from store');
    completeQuest(questId);
    console.log('[quests.tsx] completeQuest call finished');
  };
  
  const handleCreateQuest = () => {
    const mockQuests = [
      {
        title: 'Hydration Master',
        description: 'Drink 12 glasses of water today',
        category: 'hydration' as const,
        target: 12,
        xpReward: 150,
        goldReward: 75,
        icon: 'cup-water',
      },
      {
        title: 'Power Walk',
        description: 'Walk 15,000 steps',
        category: 'fitness' as const,
        target: 15000,
        xpReward: 200,
        goldReward: 100,
        icon: 'walk',
      },
      {
        title: 'Zen Master',
        description: 'Meditate for 20 minutes',
        category: 'mindfulness' as const,
        target: 20,
        xpReward: 180,
        goldReward: 90,
        icon: 'meditation',
      },
      {
        title: 'Iron Warrior',
        description: 'Exercise for 45 minutes',
        category: 'fitness' as const,
        target: 45,
        xpReward: 250,
        goldReward: 120,
        icon: 'weight-lifter',
      },
      {
        title: 'Sleep Champion',
        description: 'Get 8 hours of quality sleep',
        category: 'sleep' as const,
        target: 8, 
        xpReward: 100,
        goldReward: 50,
        icon: 'sleep',
      },
    ];

    const randomQuest = mockQuests[Math.floor(Math.random() * mockQuests.length)];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    addQuest({
      id: `custom_${Date.now()}`,
      title: randomQuest.title,
      description: randomQuest.description,
      type: 'custom',
      category: randomQuest.category,
      difficulty: 'medium',
      xpReward: randomQuest.xpReward,
      goldReward: randomQuest.goldReward,
      progress: 0,
      target: randomQuest.target,
      completed: false,
      createdAt: today,
      dueDate: tomorrow,
      streak: 0,
      icon: randomQuest.icon,
    });

    Alert.alert(
      'QUEST CREATED',
      `New quest "${randomQuest.title}" added to your mission board!`,
      [{ text: 'OK', style: 'default' }]
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- Header --- */}
          <View style={styles.header}>
            <View style={styles.headerIconBox}>
              <MaterialCommunityIcons name="radar" size={24} color={PALETTE.accent.green} />
            </View>
            <View>
              <Text style={styles.title}>MISSION BOARD</Text>
              <Text style={styles.subtitle}>SELECT OBJECTIVE &gt;&gt; EXECUTE</Text>
            </View>
          </View>
          
          {/* --- Retro Switch Tabs --- */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab, 
                selectedTab === 'active' && styles.tabActive
              ]}
              onPress={() => setSelectedTab('active')}
              activeOpacity={0.9}
            >
              <View style={[styles.ledIndicator, selectedTab === 'active' && { backgroundColor: PALETTE.accent.green }]} />
              <Text style={[styles.tabText, selectedTab === 'active' && styles.tabTextActive]}>
                ACTIVE [{activeQuests.length}]
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab, 
                selectedTab === 'completed' && styles.tabActive
              ]}
              onPress={() => setSelectedTab('completed')}
              activeOpacity={0.9}
            >
              <View style={[styles.ledIndicator, selectedTab === 'completed' && { backgroundColor: PALETTE.accent.green }]} />
              <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
                LOGS [{completedQuests.length}]
              </Text>
            </TouchableOpacity>
          </View>
          
          {selectedTab === 'active' ? (
            <>
              {/* Daily Quests */}
              {dailyQuests.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="DAILY_PROTOCOLS" count={dailyQuests.length} color={PALETTE.accent.cyan} />
                  {dailyQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onComplete={() => handleQuestComplete(quest.id)}
                    />
                  ))}
                </View>
              )}
              
              {/* Weekly Quests */}
              {weeklyQuests.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="WEEKLY_OPS" count={weeklyQuests.length} color={PALETTE.accent.purple} />
                  {weeklyQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onComplete={() => handleQuestComplete(quest.id)}
                    />
                  ))}
                </View>
              )}
              
              {/* Custom Quests */}
              {customQuests.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="CUSTOM_GOALS" count={customQuests.length} color={PALETTE.accent.gold} />
                  {customQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onComplete={() => handleQuestComplete(quest.id)}
                    />
                  ))}
                </View>
              )}
              
              {activeQuests.length === 0 && (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="check-all" size={64} color={PALETTE.surfaceHighlight} style={{ marginBottom: 16 }} />
                  <Text style={styles.emptyTitle}>SYSTEM IDLE</Text>
                  <Text style={styles.emptyText}>
                    ALL OBJECTIVES CLEARED.{"\n"}AWAITING NEW ORDERS...
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              {/* Completed Quests */}
              <View style={styles.section}>
                <SectionHeader title="MISSION_ARCHIVE" color={PALETTE.textDim} />
                {recentCompleted.length > 0 ? (
                  recentCompleted.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} />
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="folder-remove-outline" size={64} color={PALETTE.surfaceHighlight} style={{ marginBottom: 16 }} />
                    <Text style={styles.emptyTitle}>ARCHIVE EMPTY</Text>
                    <Text style={styles.emptyText}>
                      NO COMPLETED MISSIONS FOUND.
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
          
          {/* --- Retro Create Button --- */}
          <TouchableOpacity 
            style={styles.createButton} 
            activeOpacity={0.8}
            onPress={handleCreateQuest}
          >
            <View style={styles.createBtnContent}>
              <MaterialCommunityIcons name="plus-thick" size={20} color={PALETTE.bg} style={{ marginRight: 8 }} />
              <Text style={styles.createText}>INITIATE NEW QUEST</Text>
            </View>
          </TouchableOpacity>
          
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Helper for Headers
const SectionHeader = ({ title, count, color = PALETTE.text }: any) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, { color }]}>// {title}</Text>
    {count !== undefined && (
      <View style={[styles.badge, { borderColor: color }]}>
        <Text style={[styles.badgeText, { color }]}>{count < 10 ? `0${count}` : count}</Text>
      </View>
    )}
    <View style={[styles.headerLine, { backgroundColor: color, opacity: 0.3 }]} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Space for create button
  },
  
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.surfaceHighlight,
    paddingBottom: 16,
    borderStyle: 'dashed',
  },
  headerIconBox: {
    width: 48,
    height: 48,
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: 1,
    fontFamily: 'monospace', // Or system monospace
  },
  subtitle: {
    fontSize: 10,
    color: PALETTE.accent.green,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // --- Tabs ---
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // 3D effect
    borderBottomWidth: 4,
  },
  tabActive: {
    borderColor: PALETTE.accent.green,
    backgroundColor: '#064e3b', // Dark green bg
    borderBottomColor: '#064e3b',
    borderBottomWidth: 1,
    marginTop: 3, // Push down effect
  },
  ledIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#334155', // Off state
    marginRight: 8,
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PALETTE.textDim,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: PALETTE.accent.green,
  },

  // --- Sections ---
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginRight: 8,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerLine: {
    flex: 1,
    height: 1,
  },

  // --- Empty States ---
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    borderWidth: 2,
    borderColor: PALETTE.surfaceHighlight,
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: PALETTE.textDim,
    marginBottom: 8,
    letterSpacing: 2,
  },
  emptyText: {
    fontSize: 12,
    color: PALETTE.surfaceHighlight,
    textAlign: 'center',
    fontFamily: 'monospace',
    lineHeight: 18,
  },

  // --- Create Button ---
  createButton: {
    marginTop: 12,
    backgroundColor: PALETTE.accent.green,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#bbf7d0', // Lighter green border
    // 3D Pop
    borderBottomWidth: 6,
    borderBottomColor: '#15803d', // Dark green shadow
    marginBottom: 20,
  },
  createBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  createText: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.bg, // Dark text on bright button
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});