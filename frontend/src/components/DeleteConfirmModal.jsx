import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import styles from './DeleteConfirmModal.module.css';

export default function DeleteConfirmModal({ note, onConfirm, onClose, isDeleting }) {
  return (
    <Modal title="Delete Note" onClose={onClose} maxWidth="420px">
      <div className={styles.content}>
        <div className={styles.icon}>
          <AlertTriangle size={32} strokeWidth={1.75} />
        </div>
        <p className={styles.message}>
          Are you sure you want to delete{' '}
          {note?.title ? <strong>&ldquo;{note.title}&rdquo;</strong> : 'this note'}?
          {' '}This action cannot be undone.
        </p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={isDeleting}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
