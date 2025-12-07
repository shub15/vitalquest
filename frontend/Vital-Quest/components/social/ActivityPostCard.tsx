import { useGameStore } from '@/store/gameStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PALETTE = {
  bg: '#0f172a',
  surface: '#1e293b',
  surfaceHighlight: '#334155',
  slot: '#020617',
  text: '#f8fafc',
  textDim: '#64748b',
  accent: {
    gold: '#fbbf24',
    green: '#4ade80',
    red: '#f87171',
    cyan: '#22d3ee',
    purple: '#c084fc',
  },
};

interface ActivityPost {
  id: string;
  userId: string;
  username: string;
  userLevel: number;
  avatarColor: string;
  timestamp: Date;
  message?: string;
  stats: {
    steps?: number;
    exerciseMinutes?: number;
    waterGlasses?: number;
    achievementUnlocked?: string;
    streakDays?: number;
  };
  likes: number;
  likedByUser?: boolean;
}

interface Props {
  post: ActivityPost;
  onLike: (postId: string) => void;
}

export function ActivityPostCard({ post, onLike }: Props) {
  const user = useGameStore((state) => state.user);
  const isOwnPost = user?.id === post.userId;

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'JUST_NOW';
    if (hours < 24) return `${hours}h AGO`;
    if (days === 1) return 'YESTERDAY';
    return `${days}d AGO`;
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { borderColor: post.avatarColor }]}>
          <Text style={[styles.avatarText, { color: post.avatarColor }]}>
            {post.username.substring(0, 2).toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.level}>LVL.{post.userLevel}</Text>
          </View>
          <Text style={styles.timestamp}>{formatTimestamp(post.timestamp)}</Text>
        </View>
      </View>

      {/* Message */}
      {post.message && <Text style={styles.message}>{post.message}</Text>}

      {/* Activity Stats Grid */}
      {(post.stats.steps || post.stats.exerciseMinutes || post.stats.waterGlasses) && (
        <View style={styles.statsGrid}>
          {post.stats.steps !== undefined && (
            <View style={[styles.statModule, { borderColor: PALETTE.accent.cyan }]}>
              <MaterialCommunityIcons name="shoe-print" size={14} color={PALETTE.accent.cyan} />
              <Text style={styles.statValue}>{post.stats.steps.toLocaleString()}</Text>
              <Text style={styles.statLabel}>STEPS</Text>
            </View>
          )}

          {post.stats.exerciseMinutes !== undefined && (
            <View style={[styles.statModule, { borderColor: PALETTE.accent.purple }]}>
              <MaterialCommunityIcons name="dumbbell" size={14} color={PALETTE.accent.purple} />
              <Text style={styles.statValue}>{post.stats.exerciseMinutes}</Text>
              <Text style={styles.statLabel}>MIN</Text>
            </View>
          )}

          {post.stats.waterGlasses !== undefined && (
            <View style={[styles.statModule, { borderColor: PALETTE.accent.green }]}>
              <MaterialCommunityIcons name="cup-water" size={14} color={PALETTE.accent.green} />
              <Text style={styles.statValue}>{post.stats.waterGlasses}/8</Text>
              <Text style={styles.statLabel}>H2O</Text>
            </View>
          )}
        </View>
      )}

      {/* Achievement Badge */}
      {post.stats.achievementUnlocked && (
        <View style={styles.achievementBadge}>
          <MaterialCommunityIcons name="trophy-variant" size={16} color={PALETTE.accent.gold} />
          <Text style={styles.achievementText}>
            ACHIEVEMENT: {post.stats.achievementUnlocked}
          </Text>
        </View>
      )}

      {/* Streak Info */}
      {post.stats.streakDays !== undefined && post.stats.streakDays > 0 && (
        <View style={styles.streakInfo}>
          <MaterialCommunityIcons name="fire" size={16} color={PALETTE.accent.gold} />
          <Text style={styles.streakText}>{post.stats.streakDays} DAY STREAK</Text>
        </View>
      )}

      {/* Footer - Likes */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.likeButton, post.likedByUser && styles.likeButtonActive]}
          onPress={() => onLike(post.id)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={post.likedByUser ? 'heart' : 'heart-outline'}
            size={18}
            color={post.likedByUser ? PALETTE.accent.red : PALETTE.textDim}
          />
          <Text style={[styles.likeCount, post.likedByUser && styles.likeCountActive]}>
            {post.likes}
          </Text>
        </TouchableOpacity>

        {isOwnPost && (
          <View style={styles.ownPostBadge}>
            <Text style={styles.ownPostText}>YOUR_POST</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    borderBottomWidth: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: PALETTE.slot,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '900',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PALETTE.text,
    fontFamily: 'monospace',
  },
  level: {
    fontSize: 10,
    color: PALETTE.accent.cyan,
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: 9,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  message: {
    fontSize: 13,
    color: PALETTE.text,
    lineHeight: 18,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statModule: {
    flex: 1,
    backgroundColor: PALETTE.slot,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: PALETTE.text,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 8,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.slot,
    borderWidth: 1,
    borderColor: PALETTE.accent.gold,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    gap: 6,
  },
  achievementText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PALETTE.accent.gold,
    fontFamily: 'monospace',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  streakText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PALETTE.accent.gold,
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: PALETTE.surfaceHighlight,
    paddingTop: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  likeButtonActive: {
    // Active state handled by icon color
  },
  likeCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PALETTE.textDim,
    fontFamily: 'monospace',
  },
  likeCountActive: {
    color: PALETTE.accent.red,
  },
  ownPostBadge: {
    backgroundColor: PALETTE.slot,
    borderWidth: 1,
    borderColor: PALETTE.accent.cyan,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ownPostText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: PALETTE.accent.cyan,
    fontFamily: 'monospace',
  },
});
