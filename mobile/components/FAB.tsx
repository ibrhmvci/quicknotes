import React from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { colors, radius } from '../constants/theme';

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  bottomOffset?: number;
}

export const FAB = React.memo(function FAB({ disabled, bottomOffset = 80, ...rest }: Props) {
  return (
    <Animated.View
      entering={ZoomIn.delay(300).springify().damping(14)}
      style={[styles.wrapper, { bottom: bottomOffset }]}
    >
      <Pressable
        {...rest}
        disabled={disabled}
        android_ripple={{ color: colors.primaryDark, radius: 28 }}
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Create new note"
        testID="fab-create-note"
      >
        <MaterialCommunityIcons name="plus" size={28} color={colors.onPrimary} />
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  pressed: {
    backgroundColor: colors.primaryDark,
  },
  disabled: {
    opacity: 0.5,
  },
});
