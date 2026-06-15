import React, { createContext, useContext } from 'react';
import { useNotes } from '../hooks/useNotes';
import type { Note } from '../lib/api';

interface NotesContextValue {
  notes: Note[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  fetchNotes: () => Promise<void>;
  refresh: () => Promise<void>;
  createNote: (title: string, content: string) => Promise<Note>;
  updateNote: (id: string, title: string, content: string) => Promise<Note>;
  deleteNoteOptimistic: (id: string) => () => void;
  deleteNoteImmediate: (id: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const notes = useNotes();
  return (
    <NotesContext.Provider value={notes}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotesContext(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return ctx;
}
