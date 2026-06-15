import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../constants/theme';

export const SkeletonCard = React.memo(function SkeletonCard() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={[styles.bar, styles.titleBar]} />
      <View style={[styles.bar, styles.contentBar1]} />
      <View style={[styles.bar, styles.contentBar2]} />
      <View style={[styles.bar, styles.dateBar]} />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
    elevation: 4,
  },
  bar: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  titleBar: {
    height: 20,
    width: '60%',
  },
  contentBar1: {
    height: 14,
    width: '100%',
  },
  contentBar2: {
    height: 14,
    width: '80%',
  },
  dateBar: {
    height: 12,
    width: '35%',
    marginBottom: 0,
  },
});
