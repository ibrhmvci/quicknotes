import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '../constants/theme';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ContextBottomSheet({
  visible,
  onDismiss,
  onEdit,
  onDelete,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        stiffness: 300,
        damping: 30,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + spacing.md },
              { transform: [{ translateY }] },
            ]}
          >
            {/* Drag handle */}
            <View style={styles.handle} />

            <Text style={styles.title}>Note options</Text>

            <Pressable
              onPress={onEdit}
              android_ripple={{ color: colors.surfaceHigh }}
              style={styles.option}
              accessibilityRole="button"
              accessibilityLabel="Edit note"
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={24}
                color={colors.text}
              />
              <Text style={styles.optionText}>Edit note</Text>
            </Pressable>

            <Pressable
              onPress={onDelete}
              android_ripple={{ color: colors.surfaceHigh }}
              style={styles.option}
              accessibilityRole="button"
              accessibilityLabel="Delete note"
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color={colors.error}
              />
              <Text style={[styles.optionText, styles.deleteText]}>
                Delete note
              </Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
  },
  handle: {
    width: 32,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  optionText: {
    ...typography.body,
    color: colors.text,
  },
  deleteText: {
    color: colors.error,
  },
});
