import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Snackbar } from '../../../components/Snackbar';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { colors, spacing, radius, typography } from '../../../constants/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      showSnackbar('Sign out failed. Please try again.', 'error');
      setSigningOut(false);
    }
  };

  const displayName =
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    'User';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.card}>
        <MaterialCommunityIcons
          name="account-circle-outline"
          size={64}
          color={colors.textMuted}
          accessibilityElementsHidden
        />
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.divider} />

      <Pressable
        onPress={handleSignOut}
        disabled={signingOut}
        android_ripple={{ color: colors.surfaceHigh }}
        style={styles.signOutRow}
        accessibilityRole="button"
        accessibilityLabel="Sign out of QuickNotes"
      >
        {signingOut ? (
          <ActivityIndicator size="small" color={colors.error} />
        ) : (
          <MaterialCommunityIcons name="logout" size={24} color={colors.error} />
        )}
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

      <Snackbar
        {...snackbar}
        onDismiss={hideSnackbar}
        bottomOffset={64 + insets.bottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heading: {
    ...typography.headline,
    color: colors.text,
    marginTop: spacing.lg,
    marginLeft: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  name: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  email: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  signOutText: {
    ...typography.body,
    color: colors.error,
  },
});
