import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Snackbar } from '../../components/Snackbar';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useNotesContext } from '../../context/NotesContext';
import { colors, spacing, radius, typography } from '../../constants/theme';

type Mode = 'create' | 'edit';

export default function EditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    mode: Mode;
    noteId?: string;
    title?: string;
    content?: string;
  }>();

  const mode: Mode = params.mode === 'edit' ? 'edit' : 'create';
  const originalTitle = params.title ?? '';
  const originalContent = params.content ?? '';

  const [title, setTitle] = useState(originalTitle);
  const [content, setContent] = useState(originalContent);
  const [titleError, setTitleError] = useState('');
  const [saving, setSaving] = useState(false);

  const { createNote, updateNote } = useNotesContext();
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const hasChanges = title !== originalTitle || content !== originalContent;

  const confirmDiscard = useCallback(() => {
    Alert.alert('Discard changes?', undefined, [
      { text: 'Keep editing', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => router.back(),
      },
    ]);
  }, [router]);

  const handleBack = useCallback(() => {
    if (hasChanges) {
      confirmDiscard();
    } else {
      router.back();
    }
  }, [hasChanges, confirmDiscard, router]);

  // Android hardware back intercept
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [handleBack]);

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError('');
    setSaving(true);
    try {
      if (mode === 'create') {
        await createNote(title.trim(), content.trim());
        showSnackbar('Note created.', 'success');
      } else {
        await updateNote(params.noteId!, title.trim(), content.trim());
        showSnackbar('Note saved.', 'success');
      }
      // Small delay so snackbar is briefly visible before navigation
      setTimeout(() => router.back(), 300);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 403) {
        showSnackbar("You don't have permission to edit this note.", 'error');
      } else {
        showSnackbar('Failed to save note. Try again.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const saveLabel = mode === 'create' ? 'Save Note' : 'Save Changes';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.cancelButton}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={[styles.cancelText, saving && styles.disabledText]}>
            Cancel
          </Text>
        </Pressable>
        <View style={styles.headerSpacer} />
        <Pressable
          onPress={handleSave}
          style={styles.saveButton}
          disabled={saving}
          android_ripple={{ color: colors.primaryDark }}
          accessibilityRole="button"
          accessibilityLabel={saveLabel}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveText, saving && styles.disabledText]}>
              {saveLabel}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Body */}
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.body,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.fieldLabel}>Title *</Text>
          <TextInput
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (t.trim()) setTitleError('');
            }}
            placeholder="Enter a title..."
            placeholderTextColor={colors.textMuted}
            style={[styles.titleInput, titleError ? styles.inputError : null]}
            maxLength={100}
            returnKeyType="next"
            autoFocus={mode === 'create'}
            editable={!saving}
            accessibilityLabel="Note title"
          />
          {titleError ? (
            <Text style={styles.errorText}>{titleError}</Text>
          ) : null}

          <Text style={[styles.fieldLabel, styles.contentLabel]}>Content</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Write your note here..."
            placeholderTextColor={colors.textMuted}
            style={styles.contentInput}
            maxLength={10000}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
            returnKeyType="default"
            editable={!saving}
            accessibilityLabel="Note content"
          />

          <Text
            style={[
              styles.charCounter,
              content.length > 9000 && styles.charCounterWarn,
            ]}
          >
            {content.length} / 10,000
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        {...snackbar}
        onDismiss={hideSnackbar}
        bottomOffset={insets.bottom + spacing.md}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelButton: {
    height: 48,
    justifyContent: 'center',
    paddingRight: spacing.md,
  },
  cancelText: {
    ...typography.body,
    color: colors.textMuted,
  },
  headerSpacer: {
    flex: 1,
  },
  saveButton: {
    height: 48,
    justifyContent: 'center',
    paddingLeft: spacing.md,
    minWidth: 48,
    alignItems: 'center',
  },
  saveText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
  },
  disabledText: {
    opacity: 0.4,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  contentLabel: {
    marginTop: spacing.lg,
  },
  titleInput: {
    height: 52,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  contentInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text,
    minHeight: 180,
  },
  charCounter: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  charCounterWarn: {
    color: colors.error,
  },
});
