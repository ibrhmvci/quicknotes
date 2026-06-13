import { Pencil, Trash2 } from 'lucide-react';
import styles from './NoteCard.module.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: '2-digit',
  });
}

function truncate(text, max = 120) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export default function NoteCard({ note, onEdit, onDelete }) {
  return (
    <article className={styles.card}>
      <div className={styles.body} onClick={() => onEdit(note)} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onEdit(note)}>
        <h3 className={styles.title}>{note.title}</h3>
        <p className={styles.preview}>{truncate(note.content)}</p>
      </div>
      <div className={styles.footer}>
        <time className={styles.date} dateTime={note.updatedAt}>
          {formatDate(note.updatedAt)}
        </time>
        <div className={styles.actions}>
          <button
            className={styles.iconBtn}
            onClick={e => { e.stopPropagation(); onEdit(note); }}
            title="Edit note"
            aria-label="Edit note"
          >
            <Pencil size={16} strokeWidth={1.75} />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.danger}`}
            onClick={e => { e.stopPropagation(); onDelete(note); }}
            title="Delete note"
            aria-label="Delete note"
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </article>
  );
}
