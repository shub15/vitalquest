import { useGameStore } from '@/store/gameStore';
import { useHealthStore } from '@/store/healthStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

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

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreatePost: (message: string) => void;
}

export function CreatePostModal({ visible, onClose, onCreatePost }: Props) {
  const [message, setMessage] = useState('');
  const user = useGameStore((state) => state.user);
  const todaySteps = useHealthStore((state) => state.todaySteps);
  const todayExerciseMinutes = useHealthStore((state) => state.todayExerciseMinutes);
  const todayWaterGlasses = useHealthStore((state) => state.todayWaterGlasses);

  const handleShare = () => {
    if (message.trim().length > 0) {
      onCreatePost(message.trim());
      setMessage('');
      onClose();
    }
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="book-open-variant" size={24} color={PALETTE.accent.purple} />
              <Text style={styles.headerTitle}>CHRONICLE_NEW_TALE</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={PALETTE.textDim} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user?.username.substring(0, 2).toUpperCase() || 'ME'}
                </Text>
              </View>
              <View>
                <Text style={styles.username}>{user?.username || 'You'}</Text>
                <Text style={styles.userLevel}>LVL.{user?.character.level || 1}</Text>
              </View>
            </View>

            {/* Message Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>YOUR_MESSAGE</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Share your journey... (e.g., 'Crushed today's workout! 💪')"
                placeholderTextColor={PALETTE.textDim}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{message.length}/200</Text>
            </View>

            {/* Today's Stats Preview */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionLabel}>TODAY'S_STATS_PREVIEW</Text>
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { borderColor: PALETTE.accent.cyan }]}>
                  <MaterialCommunityIcons name="shoe-print" size={16} color={PALETTE.accent.cyan} />
                  <Text style={styles.statValue}>{todaySteps.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>STEPS</Text>
                </View>

                <View style={[styles.statCard, { borderColor: PALETTE.accent.purple }]}>
                  <MaterialCommunityIcons name="dumbbell" size={16} color={PALETTE.accent.purple} />
                  <Text style={styles.statValue}>{todayExerciseMinutes}</Text>
                  <Text style={styles.statLabel}>MIN</Text>
                </View>

                <View style={[styles.statCard, { borderColor: PALETTE.accent.green }]}>
                  <MaterialCommunityIcons name="cup-water" size={16} color={PALETTE.accent.green} />
                  <Text style={styles.statValue}>{todayWaterGlasses}/8</Text>
                  <Text style={styles.statLabel}>H2O</Text>
                </View>
              </View>

              {user && user.stats.currentStreak > 0 && (
                <View style={styles.streakPreview}>
                  <MaterialCommunityIcons name="fire" size={16} color={PALETTE.accent.gold} />
                  <Text style={styles.streakText}>{user.stats.currentStreak} DAY STREAK</Text>
                </View>
              )}
            </View>

            {/* Tips */}
            <View style={styles.tipsSection}>
              <Text style={styles.tipTitle}>// CHRONICLE_TIPS</Text>
              <Text style={styles.tipText}>• Share your victories and inspire others</Text>
              <Text style={styles.tipText}>• Your stats will be automatically attached</Text>
              <Text style={styles.tipText}>• Keep it positive and motivating!</Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, !message.trim() && styles.shareButtonDisabled]}
              onPress={handleShare}
              disabled={!message.trim()}
            >
              <MaterialCommunityIcons
                name="send"
                size={18}
                color={message.trim() ? PALETTE.text : PALETTE.textDim}
              />
              <Text style={[styles.shareButtonText, !message.trim() && styles.shareButtonTextDisabled]}>
                SHARE_TALE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: PALETTE.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 2,
    borderTopColor: PALETTE.accent.purple,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.surfaceHighlight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PALETTE.accent.purple,
    fontFamily: 'monospace',
  },
  closeButton: {
    padding: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PALETTE.slot,
    borderWidth: 2,
    borderColor: PALETTE.accent.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PALETTE.accent.purple,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PALETTE.text,
    fontFamily: 'monospace',
  },
  userLevel: {
    fontSize: 12,
    color: PALETTE.accent.cyan,
    fontFamily: 'monospace',
  },
  inputSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 8,
    padding: 12,
    color: PALETTE.text,
    fontSize: 14,
    minHeight: 100,
    maxHeight: 150,
  },
  charCount: {
    fontSize: 10,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    textAlign: 'right',
    marginTop: 4,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: PALETTE.slot,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PALETTE.text,
    fontFamily: 'monospace',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 9,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  streakPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  streakText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PALETTE.accent.gold,
    fontFamily: 'monospace',
  },
  tipsSection: {
    paddingHorizontal: 16,
    padding: 12,
    backgroundColor: PALETTE.surface,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
  },
  tipTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: PALETTE.accent.cyan,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 11,
    color: PALETTE.textDim,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: PALETTE.surfaceHighlight,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: PALETTE.textDim,
    fontFamily: 'monospace',
  },
  shareButton: {
    flex: 2,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    backgroundColor: PALETTE.accent.purple,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#a855f7',
  },
  shareButtonDisabled: {
    backgroundColor: PALETTE.surface,
    borderBottomColor: PALETTE.surfaceHighlight,
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: PALETTE.text,
    fontFamily: 'monospace',
  },
  shareButtonTextDisabled: {
    color: PALETTE.textDim,
  },
});
