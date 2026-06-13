import { FileText } from 'lucide-react';
import Button from './Button.jsx';
import styles from './EmptyState.module.css';

export default function EmptyState({ onCreateNote }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>
        <FileText size={64} strokeWidth={1.5} />
      </div>
      <h2 className={styles.heading}>No notes yet</h2>
      <p className={styles.sub}>Create your first note to get started.</p>
      <Button size="lg" onClick={onCreateNote}>+ Create your first note</Button>
    </div>
  );
}
