import { CharacterAvatar } from '@/components/game/CharacterAvatar';
import { theme } from '@/constants/theme';
import { useHealthConnectSync } from '@/hooks/useHealthConnectSync';
import { generateDailyQuests } from '@/services/gamificationEngine';
import { initialAchievements } from '@/services/mockData';
import { initializeNotifications } from '@/services/notifications';
import { useGameStore } from '@/store/gameStore';
import { LinearGradient } from 'expo-linear-gradient';
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
        Alert.alert('Username Required', 'Please enter a username to continue');
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
      // 1. Initialize user profile
      initializeUser(username.trim());

      // 2. Add initial achievements
      if (achievements.length === 0) {
        initialAchievements.forEach((achievement) => {
          useGameStore.setState((state) => ({
            achievements: [...state.achievements, achievement],
          }));
        });
      }

      // 3. Generate daily quests
      const dailyQuests = generateDailyQuests();
      dailyQuests.forEach((quest) => addQuest(quest));

      // 4. Initialize notifications
      await initializeNotifications();

      // 5. Initialize Health Connect if available
      if (isAvailable) {
        await initHealthConnect();
      }

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Setup Error', 'There was an error setting up your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Welcome, Adventurer!</Text>
      <Text style={styles.stepDescription}>
        Transform your health journey into an epic quest. Earn XP, level up, and unlock achievements by
        completing daily health activities.
      </Text>

      <View style={styles.avatarContainer}>
        <CharacterAvatar level={1} size={120} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Choose Your Hero Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter username..."
          placeholderTextColor={theme.colors.text.tertiary}
          value={username}
          onChangeText={setUsername}
          maxLength={20}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>⭐</Text>
          <Text style={styles.featureText}>Level up by completing health activities</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🎯</Text>
          <Text style={styles.featureText}>Complete daily and weekly quests</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🏆</Text>
          <Text style={styles.featureText}>Unlock achievements and earn rewards</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔥</Text>
          <Text style={styles.featureText}>Build streaks and stay motivated</Text>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Track Your Health</Text>
      <Text style={styles.stepDescription}>
        Vital Quest integrates with your health data to automatically track your progress and reward you
        with XP.
      </Text>

      <View style={styles.healthFeatures}>
        <View style={styles.healthCard}>
          <Text style={styles.healthIcon}>👣</Text>
          <Text style={styles.healthTitle}>Steps</Text>
          <Text style={styles.healthDesc}>Track daily steps and walking</Text>
        </View>

        <View style={styles.healthCard}>
          <Text style={styles.healthIcon}>💪</Text>
          <Text style={styles.healthTitle}>Exercise</Text>
          <Text style={styles.healthDesc}>Log workouts and activities</Text>
        </View>

        <View style={styles.healthCard}>
          <Text style={styles.healthIcon}>🧘</Text>
          <Text style={styles.healthTitle}>Meditation</Text>
          <Text style={styles.healthDesc}>Track mindfulness sessions</Text>
        </View>

        <View style={styles.healthCard}>
          <Text style={styles.healthIcon}>💧</Text>
          <Text style={styles.healthTitle}>Hydration</Text>
          <Text style={styles.healthDesc}>Monitor water intake</Text>
        </View>

        <View style={styles.healthCard}>
          <Text style={styles.healthIcon}>🍽️</Text>
          <Text style={styles.healthTitle}>Nutrition</Text>
          <Text style={styles.healthDesc}>Log meals and eating habits</Text>
        </View>

        <View style={styles.healthCard}>
          <Text style={styles.healthIcon}>😴</Text>
          <Text style={styles.healthTitle}>Sleep</Text>
          <Text style={styles.healthDesc}>Track sleep quality</Text>
        </View>
      </View>

      {isAvailable && (
        <View style={styles.healthConnectBanner}>
          <Text style={styles.bannerIcon}>📱</Text>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Health Connect Available</Text>
            <Text style={styles.bannerText}>
              Automatically sync data from your smartwatch and fitness apps
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Ready to Begin!</Text>
      <Text style={styles.stepDescription}>
        Your adventure starts now. Complete quests, earn XP, and become the healthiest version of yourself!
      </Text>

      <View style={styles.readyContainer}>
        <CharacterAvatar level={1} size={150} />
        <Text style={styles.usernameDisplay}>{username}</Text>
        <Text style={styles.levelDisplay}>Level 1 Adventurer</Text>
      </View>

      <View style={styles.startingBonuses}>
        <Text style={styles.bonusesTitle}>Starting Bonuses:</Text>
        <View style={styles.bonusItem}>
          <Text style={styles.bonusIcon}>❤️</Text>
          <Text style={styles.bonusText}>100 HP</Text>
        </View>
        <View style={styles.bonusItem}>
          <Text style={styles.bonusIcon}>💰</Text>
          <Text style={styles.bonusText}>0 Gold</Text>
        </View>
        <View style={styles.bonusItem}>
          <Text style={styles.bonusIcon}>📜</Text>
          <Text style={styles.bonusText}>5 Daily Quests</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[theme.colors.background.primary, theme.colors.background.secondary]}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              {[1, 2, 3].map((s) => (
                <View
                  key={s}
                  style={[styles.progressDot, s <= step && styles.progressDotActive]}
                />
              ))}
            </View>

            {/* Step Content */}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
                disabled={isLoading}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.nextButton, step === 1 && styles.nextButtonFull]}
              onPress={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.text.primary} />
              ) : (
                <LinearGradient
                  colors={theme.colors.gradients.primary}
                  style={styles.nextGradient}
                >
                  <Text style={styles.nextButtonText}>
                    {step === 3 ? 'Start Adventure!' : 'Next'}
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.background.tertiary,
  },
  progressDotActive: {
    backgroundColor: theme.colors.primary.light,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  stepDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing['2xl'],
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    borderWidth: 2,
    borderColor: theme.colors.primary.dark,
  },
  featureList: {
    gap: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary.dark,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  featureText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  healthFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  healthCard: {
    width: '48%',
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary.dark,
    alignItems: 'center',
  },
  healthIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  healthTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  healthDesc: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  healthConnectBanner: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary.dark,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  bannerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  readyContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  usernameDisplay: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
  },
  levelDisplay: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary.light,
    marginTop: theme.spacing.xs,
  },
  startingBonuses: {
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary.dark,
  },
  bonusesTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  bonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  bonusIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  bonusText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  backButton: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary.dark,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  nextButton: {
    flex: 2,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
});
