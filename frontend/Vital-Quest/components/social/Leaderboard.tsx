import { LeaderboardEntry } from '@/store/socialStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// --- Retro Palette ---
const PALETTE = {
  bg: '#0f172a',
  surface: '#1e293b',      // Slate 800
  surfaceHighlight: '#334155', 
  text: '#f8fafc',
  textDim: '#64748b',
  accent: {
    gold: '#fbbf24',    // Rank 1
    silver: '#94a3b8',  // Rank 2
    bronze: '#d97706',  // Rank 3
    cyan: '#22d3ee',    // User Highlight
    xp: '#c084fc',      // XP Purple
  }
};

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  period: 'weekly' | 'monthly' | 'alltime';
}

export function Leaderboard({ entries, period }: LeaderboardProps) {
  const getXpForPeriod = (entry: LeaderboardEntry) => {
    switch (period) {
      case 'weekly': return entry.weeklyXp;
      case 'monthly': return entry.monthlyXp;
      default: return entry.totalXp;
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return PALETTE.accent.gold;
    if (rank === 2) return PALETTE.accent.silver;
    if (rank === 3) return PALETTE.accent.bronze;
    return PALETTE.textDim;
  };

  const renderRankIcon = (rank: number) => {
    if (rank <= 3) {
      return (
        <MaterialCommunityIcons 
          name="trophy" 
          size={20} 
          color={getRankColor(rank)} 
        />
      );
    }
    return <Text style={styles.rankText}>#{rank}</Text>;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {entries.map((entry) => {
        const isUser = entry.isCurrentUser;
        const xpValue = getXpForPeriod(entry);
        
        return (
          <View 
            key={entry.userId} 
            style={[
              styles.entryRow,
              isUser && styles.currentUserRow
            ]}
          >
            {/* Rank Column */}
            <View style={styles.rankCol}>
              {renderRankIcon(entry.rank)}
            </View>

            {/* Avatar Column */}
            <View style={[styles.avatarFrame, { borderColor: entry.avatarColor }]}>
              <Text style={[styles.avatarText, { color: entry.avatarColor }]}>
                {entry.username.substring(0, 2).toUpperCase()}
              </Text>
            </View>

            {/* Info Column */}
            <View style={styles.infoCol}>
              <Text 
                style={[
                  styles.username, 
                  isUser && { color: PALETTE.accent.cyan }
                ]} 
                numberOfLines={1}
              >
                {entry.username}
              </Text>
              <Text style={styles.levelText}>LVL.{entry.level}</Text>
            </View>

            {/* XP Column */}
            <View style={styles.xpCol}>
              <Text style={[styles.xpValue, isUser && { color: PALETTE.accent.cyan }]}>
                {xpValue.toLocaleString()}
              </Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>

            {/* Scanning Line Effect for current user */}
            {isUser && <View style={styles.scanline} />}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderLeftWidth: 4,
    borderLeftColor: PALETTE.surfaceHighlight,
    position: 'relative',
    overflow: 'hidden',
  },
  currentUserRow: {
    backgroundColor: '#162e45', // Slightly blue tint
    borderColor: PALETTE.accent.cyan,
    borderLeftColor: PALETTE.accent.cyan,
    borderLeftWidth: 4,
  },
  
  // Columns
  rankCol: {
    width: 32,
    alignItems: 'center',
    marginRight: 8,
  },
  rankText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: PALETTE.textDim,
    fontSize: 12,
  },
  
  avatarFrame: {
    width: 36,
    height: 36,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#020617', // Dark slot
  },
  avatarText: {
    fontWeight: '900',
    fontSize: 12,
  },
  
  infoCol: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PALETTE.text,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  levelText: {
    fontSize: 10,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
  },
  
  xpCol: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  xpValue: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.accent.xp,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  xpLabel: {
    fontSize: 9,
    color: PALETTE.textDim,
    fontWeight: 'bold',
  },

  // Effects
  scanline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(34, 211, 238, 0.3)', // Cyan glow
  }
});