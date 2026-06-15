import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { api, type Note } from '../lib/api';

export function useNotes() {
  const { getToken } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks pending optimistic deletes keyed by note ID so rapid swipe-deletes
  // don't overwrite each other.
  const pendingDeletesRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const fetchNotes = useCallback(async () => {
    setError(null);
    try {
      const token = await getToken();
      if (!token) return;
      const data = await api.notes.list(token);
      setNotes(data);
    } catch {
      setError('Failed to load notes. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(
    async (title: string, content: string): Promise<Note> => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const note = await api.notes.create(token, { title, content });
      setNotes((prev) => [note, ...prev]);
      return note;
    },
    [getToken]
  );

  const updateNote = useCallback(
    async (id: string, title: string, content: string): Promise<Note> => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const updated = await api.notes.update(token, id, { title, content });
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? updated : n))
      );
      return updated;
    },
    [getToken]
  );

  // Optimistic delete: removes card immediately, schedules real API call after 4s.
  // Returns an undo function that cancels the pending delete.
  // Supports multiple concurrent deletes via a Map keyed by note ID.
  const deleteNoteOptimistic = useCallback(
    (id: string): (() => void) => {
      const note = notes.find((n) => n.id === id);

      setNotes((prev) => prev.filter((n) => n.id !== id));

      const undo = () => {
        const timer = pendingDeletesRef.current.get(id);
        if (timer) {
          clearTimeout(timer);
          pendingDeletesRef.current.delete(id);
        }
        if (note) {
          setNotes((prev) => [note, ...prev.filter((n) => n.id !== id)]);
        }
      };

      const timer = setTimeout(async () => {
        pendingDeletesRef.current.delete(id);
        try {
          const token = await getToken();
          if (token) {
            await api.notes.delete(token, id);
          }
        } catch {
          // Restore note on failure
          if (note) {
            setNotes((prev) => [note, ...prev.filter((n) => n.id !== id)]);
          }
        }
      }, 4000);

      pendingDeletesRef.current.set(id, timer);

      return undo;
    },
    [notes, getToken]
  );

  // Immediate delete (from dialog confirm) — no undo
  const deleteNoteImmediate = useCallback(
    async (id: string): Promise<void> => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      setNotes((prev) => prev.filter((n) => n.id !== id));
      try {
        await api.notes.delete(token, id);
      } catch (err) {
        // Refetch to restore accurate state on failure
        const freshToken = await getToken();
        if (freshToken) {
          const data = await api.notes.list(freshToken);
          setNotes(data);
        }
        throw err;
      }
    },
    [getToken]
  );

  return {
    notes,
    loading,
    error,
    refreshing,
    fetchNotes,
    refresh,
    createNote,
    updateNote,
    deleteNoteOptimistic,
    deleteNoteImmediate,
  };
}
