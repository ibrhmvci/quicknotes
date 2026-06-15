import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  type PressableProps,
} from 'react-native';
import { colors, spacing, radius, typography } from '../constants/theme';

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  provider: 'google' | 'github';
  loading?: boolean;
}

const providerLabel: Record<string, string> = {
  google: 'Google',
  github: 'GitHub',
};

// Simple SVG-free text placeholders for provider logos
// Real assets would be SVGs, but for compatibility with RN we use text icons
const providerInitial: Record<string, string> = {
  google: 'G',
  github: 'GH',
};

export const OAuthButton = React.memo(function OAuthButton({
  provider,
  loading = false,
  disabled,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      android_ripple={{ color: colors.surfaceHigh }}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Sign in with ${providerLabel[provider]}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>{providerInitial[provider]}</Text>
          </View>
          <Text style={styles.label}>{providerLabel[provider]}</Text>
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.surfaceHigh,
  },
  disabled: {
    opacity: 0.4,
  },
  logoBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    ...typography.body,
    color: colors.text,
  },
});
