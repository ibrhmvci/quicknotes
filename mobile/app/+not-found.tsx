import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, typography } from '../constants/theme';

export default function NotFound() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();

  const handleGoHome = () => {
    if (isSignedIn) {
      router.replace('/(app)');
    } else {
      router.replace('/(auth)/landing');
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.md },
      ]}
    >
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={64}
        color={colors.textMuted}
      />
      <Text style={styles.code}>404</Text>
      <Text style={styles.heading}>Page not found</Text>
      <Text style={styles.body}>The page you're looking for doesn't exist.</Text>
      <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl }}>
        <PrimaryButton
          label="Go to Home"
          onPress={handleGoHome}
          fullWidth={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  code: {
    ...typography.display,
    color: colors.primary,
    marginTop: spacing.lg,
  },
  heading: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
