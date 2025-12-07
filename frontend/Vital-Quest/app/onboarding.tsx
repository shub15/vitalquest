import { CharacterAvatar } from '@/components/game/CharacterAvatar';
import { useHealthConnectSync } from '@/hooks/useHealthConnectSync';
import { generateDailyQuests } from '@/services/gamificationEngine';
import { initialAchievements } from '@/services/mockData';
import { initializeNotifications } from '@/services/notifications';
import { useGameStore } from '@/store/gameStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Retro Palette ---
const PALETTE = {
  bg: '#0f172a',           // Deep Slate
  surface: '#1e293b',      // Slate 800
  surfaceHighlight: '#334155',
  slot: '#020617',         // Black/Void (Input fields)
  text: '#f8fafc',
  textDim: '#64748b',
  accent: {
    cyan: '#22d3ee',
    green: '#4ade80',
    gold: '#fbbf24',
    purple: '#c084fc',
    red: '#ef4444',
  }
};

const RETRO_BORDER = 2;

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { initializeUser, addQuest, achievements } = useGameStore();
  const { initialize: initHealthConnect, isAvailable } = useHealthConnectSync();

  const handleNext = () => {
    if (step === 1) {
      if (!username.trim()) {
        Alert.alert('INPUT_ERROR', 'USERNAME_REQUIRED');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      initializeUser(username.trim());
      
      if (achievements.length === 0) {
        initialAchievements.forEach((achievement) => {
          useGameStore.setState((state) => ({
            achievements: [...state.achievements, achievement],
          }));
        });
      }

      const dailyQuests = generateDailyQuests();
      dailyQuests.forEach((quest) => addQuest(quest));
      
      await initializeNotifications();
      if (isAvailable) await initHealthConnect();

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('SYSTEM_FAILURE', 'INITIALIZATION_FAILED');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 1: Character Creation ---
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerBlock}>
        <Text style={styles.stepTitle}>&gt; NEW_GAME</Text>
        <Text style={styles.stepDescription}>
          INITIALIZE CHARACTER PROFILE. ENTER CREDENTIALS TO BEGIN SIMULATION.
        </Text>
      </View>

      <View style={styles.avatarSection}>
        <CharacterAvatar level={1} size={120} />
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>OPERATIVE_ID</Text>
        <View style={styles.terminalInputContainer}>
          <Text style={styles.terminalPrompt}>&gt;</Text>
          <TextInput
            style={styles.terminalInput}
            placeholder="ENTER_NAME..."
            placeholderTextColor={PALETTE.textDim}
            value={username}
            onChangeText={setUsername}
            maxLength={20}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.featureList}>
        <FeatureItem icon="star-four-points" text="EARN XP & LEVEL UP" color={PALETTE.accent.cyan} />
        <FeatureItem icon="target" text="COMPLETE DAILY OPS" color={PALETTE.accent.red} />
        <FeatureItem icon="trophy" text="UNLOCK BADGES" color={PALETTE.accent.gold} />
        <FeatureItem icon="fire" text="MAINTAIN STREAK" color={PALETTE.accent.purple} />
      </View>
    </View>
  );

  // --- Step 2: System Integration ---
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerBlock}>
        <Text style={styles.stepTitle}>&gt; SYSTEM_LINK</Text>
        <Text style={styles.stepDescription}>
          CONNECTING BIOMETRIC SENSORS. SELECT MODULES TO TRACK.
        </Text>
      </View>

      <View style={styles.healthGrid}>
        <HealthModule icon="shoe-print" title="STEPS" desc="PEDOMETER" color={PALETTE.accent.cyan} />
        <HealthModule icon="dumbbell" title="TRAINING" desc="ACTIVITY LOG" color={PALETTE.accent.red} />
        <HealthModule icon="meditation" title="MIND" desc="NEURAL SYNC" color={PALETTE.accent.purple} />
        <HealthModule icon="cup-water" title="HYDRATION" desc="FLUID LEVELS" color={PALETTE.accent.cyan} />
        <HealthModule icon="food-apple" title="NUTRITION" desc="FUEL INTAKE" color={PALETTE.accent.green} />
        <HealthModule icon="power-sleep" title="STASIS" desc="SLEEP CYCLE" color={PALETTE.accent.gold} />
      </View>

      {isAvailable && (
        <View style={styles.banner}>
          <MaterialCommunityIcons name="connection" size={24} color={PALETTE.accent.green} style={{marginRight: 10}} />
          <View>
            <Text style={[styles.bannerTitle, { color: PALETTE.accent.green }]}>HARDWARE DETECTED</Text>
            <Text style={styles.bannerText}>HEALTH_CONNECT module ready for sync.</Text>
          </View>
        </View>
      )}
    </View>
  );

  // --- Step 3: Launch ---
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerBlock}>
        <Text style={styles.stepTitle}>&gt; READY_TO_LAUNCH</Text>
        <Text style={styles.stepDescription}>
          SYSTEM CHECK COMPLETE. PREPARING STARTING INVENTORY.
        </Text>
      </View>

      <View style={styles.idCard}>
        <CharacterAvatar level={1} size={100} />
        <View style={styles.idInfo}>
          <Text style={styles.idLabel}>ID CARD</Text>
          <Text style={styles.idName}>{username}</Text>
          <Text style={styles.idLevel}>LVL.1 ROOKIE</Text>
        </View>
      </View>

      <View style={styles.inventoryContainer}>
        <Text style={styles.inventoryTitle}>// STARTER_PACK</Text>
        <BonusItem icon="heart" text="100 HP" color={PALETTE.accent.red} />
        <BonusItem icon="hand-coin" text="0 CREDITS" color={PALETTE.accent.gold} />
        <BonusItem icon="scroll-text" text="5 MISSIONS" color={PALETTE.accent.cyan} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressSegment, step >= 1 && styles.progressActive]} />
            <View style={[styles.progressSegment, step >= 2 && styles.progressActive]} />
            <View style={[styles.progressSegment, step >= 3 && styles.progressActive]} />
          </View>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        {/* Navigation Footer */}
        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>&lt; BACK</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextButton, step === 1 && { flex: 1 }]}
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={PALETTE.bg} />
            ) : (
              <Text style={styles.nextButtonText}>
                {step === 3 ? 'INITIALIZE >>' : 'CONTINUE >'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Helper Components ---

const FeatureItem = ({ icon, text, color }: any) => (
  <View style={[styles.featureRow, { borderColor: color }]}>
    <View style={[styles.iconBox, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={16} color={PALETTE.bg} />
    </View>
    <Text style={[styles.featureText, { color }]}>{text}</Text>
  </View>
);

const HealthModule = ({ icon, title, desc, color }: any) => (
  <View style={styles.moduleCard}>
    <MaterialCommunityIcons name={icon} size={28} color={color} style={{ marginBottom: 8 }} />
    <Text style={[styles.moduleTitle, { color }]}>{title}</Text>
    <Text style={styles.moduleDesc}>{desc}</Text>
  </View>
);

const BonusItem = ({ icon, text, color }: any) => (
  <View style={styles.bonusRow}>
    <MaterialCommunityIcons name={icon} size={16} color={color} style={{ marginRight: 12 }} />
    <Text style={styles.bonusText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  
  // Header
  headerBlock: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: PALETTE.accent.cyan,
    fontFamily: 'monospace',
    marginBottom: 8,
    letterSpacing: 1,
  },
  stepDescription: {
    fontSize: 12,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    lineHeight: 18,
  },

  // Progress Bar
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    backgroundColor: PALETTE.surfaceHighlight,
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: PALETTE.accent.cyan,
    shadowColor: PALETTE.accent.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },

  // Step 1 Styles
  stepContainer: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: PALETTE.accent.cyan,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  terminalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.slot,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  terminalPrompt: {
    color: PALETTE.accent.green,
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 18,
  },
  terminalInput: {
    flex: 1,
    color: PALETTE.text,
    fontSize: 18,
    fontFamily: 'monospace',
    paddingVertical: 16,
    fontWeight: 'bold',
  },
  featureList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  iconBox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginRight: 12,
  },
  featureText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Step 2 Styles
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  moduleCard: {
    width: '48%', // Approx 2 columns
    backgroundColor: PALETTE.slot,
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    alignItems: 'center',
    borderBottomWidth: 3,
  },
  moduleTitle: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginTop: 4,
    marginBottom: 2,
  },
  moduleDesc: {
    fontSize: 8,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1,
    borderColor: PALETTE.accent.green,
    padding: 16,
    borderRadius: 4,
    borderStyle: 'dashed',
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  bannerText: {
    fontSize: 10,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
  },

  // Step 3 Styles
  idCard: {
    flexDirection: 'row',
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 4,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  idInfo: {
    marginLeft: 16,
    flex: 1,
  },
  idLabel: {
    fontSize: 10,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  idName: {
    fontSize: 20,
    fontWeight: '900',
    color: PALETTE.text,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  idLevel: {
    fontSize: 12,
    color: PALETTE.accent.cyan,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  inventoryContainer: {
    backgroundColor: PALETTE.slot,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 4,
    padding: 16,
  },
  inventoryTitle: {
    fontSize: 12,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.surfaceHighlight,
  },
  bonusText: {
    color: PALETTE.text,
    fontFamily: 'monospace',
    fontSize: 14,
  },

  // Footer / Buttons
  footer: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  backButton: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
    borderRadius: 4,
  },
  backButtonText: {
    color: PALETTE.textDim,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  nextButton: {
    flex: 2,
    backgroundColor: PALETTE.accent.cyan,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderBottomWidth: 4,
    borderBottomColor: '#0891b2', // Darker cyan
  },
  nextButtonText: {
    color: PALETTE.bg,
    fontWeight: '900',
    fontFamily: 'monospace',
    fontSize: 14,
  },
});