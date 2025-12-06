import { theme } from '@/constants/theme';
import { calculateXpForActivity } from '@/services/gamificationEngine';
import { useGameStore } from '@/store/gameStore';
import { useHealthStore } from '@/store/healthStore';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface QuickLogModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'steps' | 'water' | 'meal' | 'exercise' | 'meditation' | 'sleep';
}

const activityConfig = {
  steps: {
    title: 'Log Steps',
    icon: '👣',
    placeholder: 'Enter steps...',
    unit: 'steps',
    inputType: 'numeric' as const,
  },
  water: {
    title: 'Log Water',
    icon: '💧',
    placeholder: 'Number of glasses...',
    unit: 'glasses',
    inputType: 'numeric' as const,
  },
  meal: {
    title: 'Log Meal',
    icon: '🍽️',
    placeholder: 'Meal name (optional)...',
    unit: 'meal',
    inputType: 'default' as const,
  },
  exercise: {
    title: 'Log Exercise',
    icon: '💪',
    placeholder: 'Minutes exercised...',
    unit: 'minutes',
    inputType: 'numeric' as const,
  },
  meditation: {
    title: 'Log Meditation',
    icon: '🧘',
    placeholder: 'Minutes meditated...',
    unit: 'minutes',
    inputType: 'numeric' as const,
  },
  sleep: {
    title: 'Log Sleep',
    icon: '😴',
    placeholder: 'Hours slept...',
    unit: 'hours',
    inputType: 'numeric' as const,
  },
};

export function QuickLogModal({ visible, onClose, type }: QuickLogModalProps) {
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addSteps, addWaterGlass, addMeal, addExerciseMinutes, addMeditationMinutes, logSleep } = useHealthStore();
  const { addXp } = useGameStore();

  const config = activityConfig[type];

  const handleSubmit = () => {
    if (!value && type !== 'meal') return;

    setIsLoading(true);

    try {
      const numValue = parseFloat(value) || 0;

      // Log activity
      switch (type) {
        case 'steps':
          addSteps(numValue);
          break;
        case 'water':
          for (let i = 0; i < numValue; i++) {
            addWaterGlass();
          }
          break;
        case 'meal':
          addMeal();
          break;
        case 'exercise':
          addExerciseMinutes(numValue);
          break;
        case 'meditation':
          addMeditationMinutes(numValue);
          break;
        case 'sleep':
          logSleep(numValue);
          break;
      }

      // Award XP
      const xp = calculateXpForActivity(type, type === 'meal' ? 1 : numValue);
      if (xp > 0) {
        addXp(xp);
      }

      // Reset and close
      setValue('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error logging activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={theme.colors.gradients.card}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.icon}>{config.icon}</Text>
              <Text style={styles.title}>{config.title}</Text>
            </View>

            {/* Input */}
            {type !== 'meal' && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={config.placeholder}
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={value}
                  onChangeText={setValue}
                  keyboardType={config.inputType}
                  autoFocus
                />
                <Text style={styles.unit}>{config.unit}</Text>
              </View>
            )}

            {/* Notes (optional) */}
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add notes (optional)..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading || (!value && type !== 'meal')}
              >
                <LinearGradient
                  colors={theme.colors.gradients.primary}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>
                    {isLoading ? 'Logging...' : 'Log Activity'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  modalContent: {
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary.dark,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  input: {
    flex: 1,
    padding: theme.spacing.lg,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
  },
  unit: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.tertiary,
    marginLeft: theme.spacing.sm,
  },
  notesInput: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary.dark,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: theme.spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary.dark,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  submitButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  submitGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  submitText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
});
