import { useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import styles from './Toast.module.css';

export default function Toast({ message, type = 'success', onDismiss }) {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; }, [onDismiss]);

  useEffect(() => {
    const t = setTimeout(() => onDismissRef.current(), 4000);
    return () => clearTimeout(t);
  }, []); // runs once on mount — timer never resets on parent re-render

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      {type === 'success'
        ? <CheckCircle2 size={18} strokeWidth={1.75} />
        : <AlertTriangle size={18} strokeWidth={1.75} />}
      <span>{message}</span>
    </div>
  );
}
