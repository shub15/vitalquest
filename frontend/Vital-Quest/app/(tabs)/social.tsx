import { Leaderboard } from '@/components/social/Leaderboard';
import { generateMockLeaderboard, mockFriends, mockPendingRequests } from '@/services/mockSocialData';
import { useGameStore } from '@/store/gameStore';
import { useSocialStore } from '@/store/socialStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Retro Network Palette ---
const PALETTE = {
  bg: '#0f172a',           // Deep Slate (Screen Background)
  surface: '#1e293b',      // Slate 800 (Card Surface)
  surfaceHighlight: '#334155', 
  slot: '#020617',         // Black/Void
  text: '#f8fafc',
  textDim: '#64748b',
  accent: {
    gold: '#fbbf24',
    green: '#4ade80',     // Online / Accept
    red: '#f87171',       // Reject / Offline
    cyan: '#22d3ee',      // XP / Data
    purple: '#c084fc'
  }
};

const RETRO_BORDER = 2;

export default function SocialScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const [selectedTab, setSelectedTab] = useState<'leaderboard' | 'friends'>('leaderboard');

  const user = useGameStore((state) => state.user);
  const { friends, leaderboard, updateLeaderboard, addFriend, pendingRequests } = useSocialStore();

  useEffect(() => {
    // Initialize mock data
    if (user && leaderboard.length === 0) {
      const mockLeaderboard = generateMockLeaderboard(
        user.id,
        user.character.totalXp,
        user.character.level
      );
      updateLeaderboard(mockLeaderboard);
    }

    // Initialize friends if empty
    if (friends.length === 0) {
      mockFriends.forEach(friend => addFriend(friend));
    }
  }, [user]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PALETTE.accent.gold} />
        <Text style={styles.loadingText}>CONNECTING TO NETWORK...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        
        {/* --- Network Header --- */}
        <View style={styles.header}>
          <View style={styles.headerIconBox}>
            <MaterialCommunityIcons name="earth" size={24} color={PALETTE.accent.cyan} />
          </View>
          <View>
            <Text style={styles.title}>GLOBAL_NET</Text>
            <Text style={styles.subtitle}>UPLINK ESTABLISHED. USER: {user.username.toUpperCase()}</Text>
          </View>
        </View>

        {/* --- Main Switch Tabs --- */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'leaderboard' && styles.tabActive]}
            onPress={() => setSelectedTab('leaderboard')}
            activeOpacity={0.9}
          >
             <MaterialCommunityIcons 
                name="trophy-variant" 
                size={16} 
                color={selectedTab === 'leaderboard' ? PALETTE.bg : PALETTE.textDim} 
                style={{marginRight: 6}}
             />
            <Text style={[styles.tabText, selectedTab === 'leaderboard' && styles.tabTextActive]}>
              RANKINGS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'friends' && styles.tabActive]}
            onPress={() => setSelectedTab('friends')}
            activeOpacity={0.9}
          >
             <MaterialCommunityIcons 
                name="account-group" 
                size={16} 
                color={selectedTab === 'friends' ? PALETTE.bg : PALETTE.textDim} 
                style={{marginRight: 6}}
             />
            <Text style={[styles.tabText, selectedTab === 'friends' && styles.tabTextActive]}>
              ALLIES ({friends.length})
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'leaderboard' ? (
          <>
            {/* --- Time Period Selector --- */}
            <View style={styles.periodContainer}>
              <PeriodButton 
                label="WEEKLY" 
                active={selectedPeriod === 'weekly'} 
                onPress={() => setSelectedPeriod('weekly')} 
              />
              <PeriodButton 
                label="MONTHLY" 
                active={selectedPeriod === 'monthly'} 
                onPress={() => setSelectedPeriod('monthly')} 
              />
              <PeriodButton 
                label="ALL-TIME" 
                active={selectedPeriod === 'alltime'} 
                onPress={() => setSelectedPeriod('alltime')} 
              />
            </View>

            {/* --- Leaderboard Data Feed --- */}
            <View style={styles.leaderboardFrame}>
              <Leaderboard entries={leaderboard} period={selectedPeriod} />
            </View>
          </>
        ) : (
          <ScrollView style={styles.friendsContainer} showsVerticalScrollIndicator={false}>
            
            {/* --- Pending Requests --- */}
            {mockPendingRequests.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="INCOMING_REQUESTS" count={mockPendingRequests.length} color={PALETTE.accent.gold} />
                
                {mockPendingRequests.map(request => (
                  <View key={request.id} style={[styles.friendCard, { borderColor: PALETTE.accent.gold }]}>
                    <View style={[styles.avatarFrame, { borderColor: request.avatarColor }]}>
                      <Text style={[styles.avatarText, { color: request.avatarColor }]}>
                        {request.username.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{request.username}</Text>
                      <Text style={styles.friendStats}>LVL.{request.level} // {request.totalXp} XP</Text>
                    </View>
                    
                    <View style={styles.requestButtons}>
                      <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]}>
                        <MaterialCommunityIcons name="check" size={16} color={PALETTE.bg} />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]}>
                        <MaterialCommunityIcons name="close" size={16} color={PALETTE.bg} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* --- Friends List --- */}
            <View style={styles.section}>
              <SectionHeader title="ALLIED_OPERATIVES" count={friends.length} color={PALETTE.accent.cyan} />
              
              {friends.map(friend => (
                <View key={friend.id} style={styles.friendCard}>
                  <View style={[styles.avatarFrame, { borderColor: friend.avatarColor }]}>
                    <Text style={[styles.avatarText, { color: friend.avatarColor }]}>
                      {friend.username.substring(0, 2).toUpperCase()}
                    </Text>
                    {/* Status Dot */}
                    <View style={[
                      styles.statusDot, 
                      { backgroundColor: friend.status === 'online' ? PALETTE.accent.green : PALETTE.textDim }
                    ]} />
                  </View>
                  
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.username}</Text>
                    <View style={styles.statsRow}>
                      <Text style={styles.friendStats}>LVL.{friend.level} • {friend.currentStreak}</Text>
                      <MaterialCommunityIcons name="fire" size={12} color={PALETTE.accent.gold} />
                    </View>
                  </View>
                  
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>DATA</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* --- System Footer --- */}
            <View style={styles.demoNotice}>
              <Text style={styles.demoText}>// SYSTEM_NOTICE: SIMULATION_MODE_ACTIVE</Text>
              <Text style={styles.demoSubText}>Social feeds are currently using mock data protocol.</Text>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// --- Helper Components ---

const PeriodButton = ({ label, active, onPress }: any) => (
  <TouchableOpacity
    style={[styles.periodButton, active && styles.activePeriod]}
    onPress={onPress}
  >
    <Text style={[styles.periodText, active && styles.activePeriodText]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const SectionHeader = ({ title, count, color = PALETTE.text }: any) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, { color }]}>&gt; {title}</Text>
    <View style={styles.headerLine} />
    <Text style={[styles.sectionCount, { color }]}>[{count}]</Text>
  </View>
);


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PALETTE.bg,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    color: PALETTE.accent.gold,
    letterSpacing: 1,
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.surfaceHighlight,
    borderStyle: 'dashed',
  },
  headerIconBox: {
    width: 44,
    height: 44,
    backgroundColor: PALETTE.slot,
    borderWidth: 1,
    borderColor: PALETTE.accent.cyan,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 9,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    marginTop: 2,
  },

  // --- Tabs ---
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: PALETTE.slot,
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  tabActive: {
    backgroundColor: PALETTE.accent.gold,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '900',
    color: PALETTE.textDim,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: PALETTE.bg, // Dark text on bright tab
  },

  // --- Period Selector ---
  periodContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 2,
  },
  activePeriod: {
    backgroundColor: PALETTE.surfaceHighlight,
    borderColor: PALETTE.accent.cyan,
  },
  periodText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PALETTE.textDim,
  },
  activePeriodText: {
    color: PALETTE.accent.cyan,
  },

  // --- Leaderboard Frame ---
  leaderboardFrame: {
    flex: 1,
    backgroundColor: PALETTE.slot,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 4,
    // Note: The internal Leaderboard component would ideally also need
    // refactoring to match this theme, but this frame helps integrate it.
  },

  // --- Friends List ---
  friendsContainer: {
    flex: 1,
  },
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
    fontFamily: 'monospace',
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: PALETTE.surfaceHighlight,
    marginHorizontal: 8,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },

  // --- Friend Card ---
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
    padding: 10,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderLeftWidth: 4, // Accent stripe on left
    borderLeftColor: PALETTE.surfaceHighlight, // Default, overridden if online logic used
    marginBottom: 8,
  },
  avatarFrame: {
    width: 42,
    height: 42,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: PALETTE.slot,
    position: 'relative',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '900',
  },
  statusDot: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PALETTE.text,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  friendStats: {
    fontSize: 10,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
  },
  
  // --- Actions ---
  requestButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  acceptBtn: {
    backgroundColor: PALETTE.accent.green,
  },
  rejectBtn: {
    backgroundColor: PALETTE.accent.red,
  },
  viewButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: PALETTE.textDim,
    borderRadius: 2,
  },
  viewButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PALETTE.textDim,
  },

  // --- Footer ---
  demoNotice: {
    marginTop: 20,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: PALETTE.surfaceHighlight,
    borderStyle: 'dashed',
    alignItems: 'center',
    opacity: 0.6,
  },
  demoText: {
    fontSize: 10,
    color: PALETTE.accent.gold,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  demoSubText: {
    fontSize: 10,
    color: PALETTE.textDim,
  },
});