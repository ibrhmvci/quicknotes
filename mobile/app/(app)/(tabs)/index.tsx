import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NoteCard } from '../../../components/NoteCard';
import { SkeletonCard } from '../../../components/SkeletonCard';
import { EmptyState } from '../../../components/EmptyState';
import { FAB } from '../../../components/FAB';
import { Snackbar } from '../../../components/Snackbar';
import { ContextBottomSheet } from '../../../components/ContextBottomSheet';
import { useNotesContext } from '../../../context/NotesContext';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { colors, spacing, typography } from '../../../constants/theme';
import type { Note } from '../../../lib/api';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    notes,
    loading,
    error,
    refreshing,
    fetchNotes,
    refresh,
    deleteNoteOptimistic,
    deleteNoteImmediate,
  } = useNotesContext();
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [fetchNotes])
  );

  const handlePress = useCallback(
    (note: Note) => {
      router.push({
        pathname: '/(app)/editor',
        params: { mode: 'edit', noteId: note.id, title: note.title, content: note.content },
      });
    },
    [router]
  );

  const handleLongPress = useCallback((note: Note) => {
    setSelectedNote(note);
    setSheetVisible(true);
  }, []);

  const handleSwipeDelete = useCallback(
    (note: Note) => {
      const undo = deleteNoteOptimistic(note.id);
      showSnackbar('Note deleted.', 'neutral', {
        label: 'UNDO',
        onPress: undo,
      });
    },
    [deleteNoteOptimistic, showSnackbar]
  );

  const handleSheetEdit = useCallback(() => {
    if (!selectedNote) return;
    router.push({
      pathname: '/(app)/editor',
      params: {
        mode: 'edit',
        noteId: selectedNote.id,
        title: selectedNote.title,
        content: selectedNote.content,
      },
    });
    setSelectedNote(null);
  }, [selectedNote, router]);

  const handleSheetDelete = useCallback(() => {
    if (!selectedNote) return;
    const note = selectedNote;
    setSelectedNote(null);
    setSheetVisible(false);

    Alert.alert(
      'Delete Note?',
      'Are you sure you want to delete this note? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNoteImmediate(note.id);
              showSnackbar('Note deleted.', 'neutral');
            } catch {
              showSnackbar('Failed to delete note. Try again.', 'error');
            }
          },
        },
      ]
    );
  }, [selectedNote, deleteNoteImmediate, showSnackbar]);

  const handleRefresh = useCallback(async () => {
    try {
      await refresh();
    } catch {
      showSnackbar('Failed to refresh notes.', 'error');
    }
  }, [refresh, showSnackbar]);

  const renderItem = useCallback(
    ({ item, index }: { item: Note; index: number }) => (
      <NoteCard
        note={item}
        index={index}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onSwipeDelete={handleSwipeDelete}
      />
    ),
    [handlePress, handleLongPress, handleSwipeDelete]
  );

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={fetchNotes}
            style={styles.retryButton}
            android_ripple={{ color: colors.primaryDark }}
            accessibilityRole="button"
            accessibilityLabel="Retry loading notes"
          >
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          notes.length === 0 && styles.emptyContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        {notes.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{notes.length}</Text>
          </View>
        )}
      </View>

      {renderBody()}

      <FAB
        onPress={() =>
          router.push({
            pathname: '/(app)/editor',
            params: { mode: 'create' },
          })
        }
        bottomOffset={64 + insets.bottom + spacing.md}
      />

      <Snackbar
        {...snackbar}
        onDismiss={hideSnackbar}
        bottomOffset={64 + insets.bottom}
      />

      <ContextBottomSheet
        visible={sheetVisible}
        onDismiss={() => {
          setSheetVisible(false);
          setSelectedNote(null);
        }}
        onEdit={handleSheetEdit}
        onDelete={handleSheetDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.headline,
    color: colors.text,
  },
  countBadge: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 80 + spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
