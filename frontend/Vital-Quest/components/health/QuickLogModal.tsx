import { calculateXpForActivity } from '@/services/gamificationEngine';
import { useGameStore } from '@/store/gameStore';
import { useHealthStore } from '@/store/healthStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

// --- Retro Dark Palette ---
const PALETTE = {
  overlay: 'rgba(15, 23, 42, 0.9)', // Dark Slate Fade
  windowBg: '#1e293b',             // Slate 800
  windowBorder: '#334155',         // Slate 700
  slot: '#020617',                 // Black Console
  text: '#f8fafc',
  textDim: '#64748b',
  accent: {
    cyan: '#22d3ee',
    green: '#4ade80',
    blue: '#60a5fa',
    gold: '#fbbf24',
    purple: '#c084fc',
    red: '#f87171',
  }
};

const RETRO_BORDER = 2;

interface QuickLogModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'steps' | 'water' | 'meal' | 'exercise' | 'meditation' | 'sleep';
}

// Config updated with Icons and Colors
const activityConfig = {
  steps: {
    title: 'PEDOMETER_LOG',
    icon: 'shoe-print',
    color: PALETTE.accent.cyan,
    placeholder: 'ENTER STEP COUNT...',
    unit: 'STEPS',
    inputType: 'numeric' as const,
  },
  water: {
    title: 'HYDRATION_INPUT',
    icon: 'cup-water',
    color: PALETTE.accent.blue,
    placeholder: 'QUANTITY...',
    unit: 'GLASSES',
    inputType: 'numeric' as const,
  },
  meal: {
    title: 'RATION_LOG',
    icon: 'food-apple',
    color: PALETTE.accent.green,
    placeholder: 'ITEM NAME...',
    unit: 'ITEM',
    inputType: 'default' as const,
  },
  exercise: {
    title: 'PHYSICAL_TRAINING',
    icon: 'dumbbell',
    color: PALETTE.accent.red,
    placeholder: 'DURATION...',
    unit: 'MIN',
    inputType: 'numeric' as const,
  },
  meditation: {
    title: 'NEURAL_RESET',
    icon: 'brain', // Sci-fi vibe
    color: PALETTE.accent.purple,
    placeholder: 'DURATION...',
    unit: 'MIN',
    inputType: 'numeric' as const,
  },
  sleep: {
    title: 'STASIS_MODE',
    icon: 'power-sleep',
    color: PALETTE.accent.gold,
    placeholder: 'DURATION...',
    unit: 'HRS',
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

      switch (type) {
        case 'steps': addSteps(numValue); break;
        case 'water': for (let i = 0; i < numValue; i++) addWaterGlass(); break;
        case 'meal': addMeal(); break;
        case 'exercise': addExerciseMinutes(numValue); break;
        case 'meditation': addMeditationMinutes(numValue); break;
        case 'sleep': logSleep(numValue); break;
      }

      const xp = calculateXpForActivity(type, type === 'meal' ? 1 : numValue);
      if (xp > 0) addXp(xp);

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
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.windowFrame}>
          
          {/* --- Terminal Header --- */}
          <View style={styles.windowHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <MaterialCommunityIcons name="console-line" size={16} color={config.color} style={{marginRight: 8}} />
               <Text style={[styles.windowTitle, { color: config.color }]}>
                  // {config.title}
               </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={20} color={PALETTE.textDim} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            
            {/* --- Icon Display --- */}
            <View style={[styles.iconBox, { borderColor: config.color }]}>
              <MaterialCommunityIcons name={config.icon as any} size={32} color={config.color} />
            </View>

            {/* --- Numeric Input --- */}
            {type !== 'meal' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>VALUE_INPUT &gt;</Text>
                <View style={styles.terminalInputContainer}>
                  <TextInput
                    style={[styles.terminalInput, { color: config.color }]}
                    placeholder={config.placeholder}
                    placeholderTextColor={PALETTE.textDim}
                    value={value}
                    onChangeText={setValue}
                    keyboardType={config.inputType}
                    autoFocus
                    selectionColor={config.color}
                  />
                  <Text style={styles.unitText}>{config.unit}</Text>
                </View>
              </View>
            )}

            {/* --- Notes Input --- */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>META_DATA &gt;</Text>
              <View style={styles.terminalInputContainer}>
                <TextInput
                  style={[styles.terminalInput, styles.notesArea]}
                  placeholder="ADDITIONAL_NOTES..."
                  placeholderTextColor={PALETTE.textDim}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={2}
                  selectionColor={config.color}
                />
              </View>
            </View>

            {/* --- Action Keys --- */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.retroButton, styles.cancelButton]}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelText}>ABORT</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.retroButton, styles.confirmButton, { borderColor: config.color }]}
                onPress={handleSubmit}
                disabled={isLoading || (!value && type !== 'meal')}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={PALETTE.slot} />
                ) : (
                  <Text style={[styles.confirmText, { color: config.color }]}>EXECUTE</Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: PALETTE.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  windowFrame: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: PALETTE.windowBg,
    borderRadius: 4,
    borderWidth: RETRO_BORDER,
    borderColor: PALETTE.windowBorder,
    // Retro depth shadow
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 10,
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.windowBorder,
    backgroundColor: '#0f172a',
  },
  windowTitle: {
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  content: {
    padding: 20,
  },
  
  // Icon
  iconBox: {
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 4,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: PALETTE.slot,
  },

  // Inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  terminalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.slot,
    borderWidth: 1,
    borderColor: PALETTE.windowBorder,
    borderRadius: 2,
    paddingHorizontal: 12,
  },
  terminalInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: PALETTE.text,
  },
  notesArea: {
    minHeight: 60,
    textAlignVertical: 'top',
    fontSize: 12,
  },
  unitText: {
    fontSize: 10,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    marginLeft: 8,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  retroButton: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 2,
    borderBottomWidth: 4, // 3D Click feel
  },
  cancelButton: {
    backgroundColor: PALETTE.windowBg,
    borderColor: PALETTE.windowBorder,
    borderBottomColor: '#0f172a',
  },
  cancelText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: PALETTE.textDim,
    fontSize: 12,
  },
  confirmButton: {
    backgroundColor: '#0f172a', // Dark interior
    // Border color set dynamically
  },
  confirmText: {
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
});