import { useState, useEffect } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, LogOut } from 'lucide-react';
import styles from './TopNav.module.css';

export default function TopNav() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = () => signOut(() => navigate('/'));

  const initials = user
    ? (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')
    : '';

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/dashboard" className={styles.logo}>
          <FileText size={20} strokeWidth={1.75} />
          <span>QuickNotes</span>
        </Link>
        <div className={styles.actions}>
          {initials && (
            <div className={styles.avatar} title={user?.fullName ?? ''}>
              {initials.toUpperCase()}
            </div>
          )}
          <button className={styles.signOut} onClick={handleSignOut} title="Sign out">
            <LogOut size={18} strokeWidth={1.75} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
