import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { ZoomIn, FadeInUp } from 'react-native-reanimated';
import { colors, spacing, typography } from '../constants/theme';

export function EmptyState() {
  return (
    <Animated.View
      entering={FadeInUp.delay(100).springify().damping(18)}
      style={styles.container}
      accessibilityLiveRegion="polite"
    >
      <Animated.View entering={ZoomIn.delay(0).springify().damping(12)}>
        <MaterialCommunityIcons
          name="note-text-outline"
          size={72}
          color={colors.textMuted}
          accessibilityElementsHidden
        />
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(180).springify().damping(18)}>
        <Text style={styles.heading}>No notes yet</Text>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(280).springify().damping(18)}>
        <Text style={styles.body}>Tap + to create your first note.</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  heading: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
