import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { colors, spacing, typography } from '../../constants/theme';

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.md,
        },
      ]}
      bounces={false}
    >
      <Animated.View entering={ZoomIn.delay(0).springify().damping(14)} style={styles.logoRow}>
        <MaterialCommunityIcons
          name="note-text-outline"
          size={64}
          color={colors.primary}
          accessibilityRole="image"
          accessibilityLabel="QuickNotes logo"
        />
        <Animated.View entering={FadeInDown.delay(150).springify().damping(16)}>
          <Text style={styles.appName}>QuickNotes</Text>
        </Animated.View>
      </Animated.View>

      <View style={styles.hero}>
        <Animated.View entering={FadeInDown.delay(280).springify().damping(16)}>
          <Text style={styles.heroHeadline}>Your thoughts,{'\n'}organized.</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).springify().damping(18)}>
          <Text style={styles.heroSubtitle}>
            Capture ideas in seconds.{'\n'}Private, fast, always yours.
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(520).springify().damping(18)} style={styles.buttons}>
        <PrimaryButton
          label="Get Started"
          onPress={() => router.push('/(auth)/sign-up')}
        />
        <SecondaryButton
          label="Sign In"
          onPress={() => router.push('/(auth)/sign-in')}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(650).duration(400)} style={styles.footer}>
        <Text style={styles.copyright}>© 2026 QuickNotes</Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  logoRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: spacing.xl,
  },
  appName: {
    ...typography.headline,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  hero: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  heroHeadline: {
    ...typography.display,
    color: colors.text,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  buttons: {
    gap: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  copyright: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
