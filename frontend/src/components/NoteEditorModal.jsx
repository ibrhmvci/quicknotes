import { useState } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import styles from './NoteEditorModal.module.css';

export default function NoteEditorModal({ note, onSave, onClose, isSaving }) {
  const isEdit = Boolean(note);
  const [title, setTitle]     = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [titleError, setTitleError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError('');
    onSave({ title: title.trim(), content: content.trim() });
  };

  const charCount = content.length;
  const charWarn  = charCount > 9000;

  return (
    <Modal title={isEdit ? 'Edit Note' : 'New Note'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="note-title">
            Title <span className={styles.required}>*</span>
          </label>
          <input
            id="note-title"
            className={`${styles.input} ${titleError ? styles.inputError : ''}`}
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); if (titleError) setTitleError(''); }}
            placeholder="Enter a title..."
            maxLength={100}
            autoFocus
          />
          {titleError && <p className={styles.error}>{titleError}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="note-content">Content</label>
          <div className={styles.textareaWrap}>
            <textarea
              id="note-content"
              className={styles.textarea}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your note here..."
              maxLength={10000}
            />
            <span className={`${styles.charCount} ${charWarn ? styles.charWarn : ''}`}>
              {charCount} / 10,000
            </span>
          </div>
        </div>

        <div className={styles.footer}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" loading={isSaving}>
            {isEdit ? 'Save Changes' : 'Save Note'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
