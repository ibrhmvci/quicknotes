import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import TopNav from '../components/TopNav.jsx';
import NoteCard from '../components/NoteCard.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import NoteEditorModal from '../components/NoteEditorModal.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import Toast from '../components/Toast.jsx';
import { getNotes, createNote, updateNote, deleteNote } from '../api/notes.js';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [notes, setNotes]           = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [editorNote, setEditorNote] = useState(undefined); // undefined=closed, null=create, obj=edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving]     = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Stable refs so the load effect never re-fires due to reference changes
  const getTokenRef = useRef(getToken);
  const showToastRef = useRef(showToast);
  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);
  useEffect(() => { showToastRef.current = showToast; }, [showToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getTokenRef.current();
        const data  = await getNotes(token);
        if (!cancelled) setNotes(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) showToastRef.current('Failed to load notes. Please refresh.', 'error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []); // runs exactly once on mount

  const handleSave = async ({ title, content }) => {
    setIsSaving(true);
    try {
      const token = await getToken();
      if (editorNote) {
        const updated = await updateNote(token, editorNote.id, { title, content });
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
        showToast('Note updated.');
      } else {
        const created = await createNote(token, { title, content });
        setNotes(prev => [created, ...prev]);
        showToast('Note created.');
      }
      setEditorNote(undefined);
    } catch (err) {
      showToast(err.message || 'Failed to save note.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    // Optimistic removal
    setNotes(prev => prev.filter(n => n.id !== deleteTarget.id));
    try {
      const token = await getToken();
      await deleteNote(token, deleteTarget.id);
      showToast('Note deleted.');
    } catch (err) {
      // Revert on failure
      setNotes(prev => [deleteTarget, ...prev].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      ));
      showToast(err.message || 'Failed to delete note.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.heading}>My Notes</h1>
          <button className={styles.newBtn} onClick={() => setEditorNote(null)}>
            + New Note
          </button>
        </div>

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : notes.length === 0 ? (
          <EmptyState onCreateNote={() => setEditorNote(null)} />
        ) : (
          <div className={styles.grid}>
            {notes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={n => setEditorNote(n)}
                onDelete={n => setDeleteTarget(n)}
              />
            ))}
          </div>
        )}
      </main>

      {editorNote !== undefined && (
        <NoteEditorModal
          note={editorNote}
          onSave={handleSave}
          onClose={() => setEditorNote(undefined)}
          isSaving={isSaving}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          note={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
