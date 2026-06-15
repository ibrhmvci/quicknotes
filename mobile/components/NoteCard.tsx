import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated as RNAnimated,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../constants/theme';
import type { Note } from '../lib/api';

const ACCENT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const SPRING_PRESS = { damping: 20, stiffness: 400 };
const SPRING_ENTER = { damping: 18 };

interface Props {
  note: Note;
  onPress: (note: Note) => void;
  onLongPress: (note: Note) => void;
  onSwipeDelete: (note: Note) => void;
  index?: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const NoteCard = React.memo(function NoteCard({
  note,
  onPress,
  onLongPress,
  onSwipeDelete,
  index = 0,
}: Props) {
  const swipeableRef = useRef<Swipeable>(null);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

  const handleSwipeDelete = () => {
    swipeableRef.current?.close();
    onSwipeDelete(note);
  };

  const renderRightActions = (
    _progress: RNAnimated.AnimatedInterpolation<number>,
    dragX: RNAnimated.AnimatedInterpolation<number>
  ) => {
    const iconScale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <Pressable
        onPress={handleSwipeDelete}
        style={styles.deleteAction}
        accessibilityRole="button"
        accessibilityLabel="Delete note"
      >
        <RNAnimated.View style={{ transform: [{ scale: iconScale }] }}>
          <MaterialCommunityIcons
            name="delete-outline"
            size={28}
            color={colors.onPrimary}
          />
        </RNAnimated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={80}
      onSwipeableOpen={handleSwipeDelete}
      friction={2}
    >
      <Animated.View
        entering={FadeInDown.delay(Math.min(index * 55, 280)).springify().damping(SPRING_ENTER.damping)}
      >
        <Animated.View style={animatedStyle}>
        <Pressable
          onPress={() => onPress(note)}
          onLongPress={() => onLongPress(note)}
          onPressIn={() => { scale.value = withSpring(0.97, SPRING_PRESS); }}
          onPressOut={() => { scale.value = withSpring(1, SPRING_PRESS); }}
          android_ripple={{ color: colors.surfaceHigh }}
          style={({ pressed }) => [
            styles.card,
            { borderLeftColor: accentColor },
            pressed && styles.cardPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${note.title}, last updated ${formatDate(note.updatedAt)}`}
          accessibilityHint="Long press for options"
        >
          <Text style={styles.title} numberOfLines={1}>
            {note.title}
          </Text>
          <Text style={styles.preview} numberOfLines={2}>
            {note.content || ' '}
          </Text>
          <Text style={styles.date}>{formatDate(note.updatedAt)}</Text>
        </Pressable>
        </Animated.View>
      </Animated.View>
    </Swipeable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    padding: spacing.md,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
    elevation: 4,
  },
  cardPressed: {
    backgroundColor: colors.surfaceHigh,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  preview: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
  },
  deleteAction: {
    backgroundColor: colors.error,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
});
