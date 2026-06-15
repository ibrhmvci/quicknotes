import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../constants/theme';
import type { SnackbarState } from '../hooks/useSnackbar';

interface Props extends SnackbarState {
  onDismiss: () => void;
  bottomOffset?: number;
}

const variantIcon: Record<string, 'check-circle-outline' | 'alert-circle-outline' | undefined> = {
  success: 'check-circle-outline',
  error: 'alert-circle-outline',
  neutral: undefined,
};

const variantIconColor: Record<string, string> = {
  success: colors.success,
  error: colors.error,
  neutral: colors.textMuted,
};

export function Snackbar({
  visible,
  message,
  variant,
  action,
  onDismiss,
  bottomOffset = 80,
}: Props) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        translateY.setValue(20);
      });
    }
  }, [visible, translateY, opacity]);

  const iconName = variantIcon[variant];

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: bottomOffset + spacing.sm },
        { transform: [{ translateY }], opacity },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityLiveRegion="polite"
    >
      {iconName && (
        <MaterialCommunityIcons
          name={iconName}
          size={16}
          color={variantIconColor[variant]}
          style={styles.icon}
        />
      )}
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
      {action && (
        <Pressable
          onPress={() => {
            action.onPress();
            onDismiss();
          }}
          style={styles.actionButton}
          android_ripple={{ color: colors.primary }}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <Text style={styles.actionLabel}>{action.label.toUpperCase()}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.sm + 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    elevation: 6,
  },
  icon: {
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  message: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  actionButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
