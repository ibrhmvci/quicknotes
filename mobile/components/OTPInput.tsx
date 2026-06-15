import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, typography } from '../constants/theme';

interface Props {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export function OTPInput({ value, onChange, error }: Props) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.split('').concat(Array(6 - value.length).fill(''));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Verification Code</Text>
      <Pressable onPress={() => inputRef.current?.focus()} style={styles.boxRow}>
        {digits.map((char, i) => (
          <View
            key={i}
            style={[
              styles.box,
              i === value.length && styles.boxActive,
              error ? styles.boxError : null,
            ]}
          >
            <Text style={styles.digit}>{char}</Text>
          </View>
        ))}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="one-time-code"
        style={styles.hiddenInput}
        accessibilityLabel="6-digit verification code"
        accessibilityHint="Enter the code sent to your email"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  boxRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  box: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: colors.primary,
  },
  boxError: {
    borderColor: colors.error,
  },
  digit: {
    ...typography.display,
    color: colors.text,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
