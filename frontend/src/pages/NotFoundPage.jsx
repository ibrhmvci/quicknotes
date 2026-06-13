import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Button from '../components/Button.jsx';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <FileText size={20} strokeWidth={1.75} />
          <span>QuickNotes</span>
        </div>
      </nav>
      <main className={styles.main}>
        <p className={styles.code}>404</p>
        <h1 className={styles.heading}>Page not found</h1>
        <p className={styles.sub}>The page you&apos;re looking for doesn&apos;t exist.</p>
        <Button size="lg" onClick={() => navigate('/')}>← Go to Home</Button>
      </main>
    </div>
  );
}
