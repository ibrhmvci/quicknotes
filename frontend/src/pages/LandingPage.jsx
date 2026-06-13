import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { FileText, Zap, Shield, Globe, ChevronRight } from 'lucide-react';
import styles from './LandingPage.module.css';

const features = [
  {
    icon: <Zap size={28} strokeWidth={1.75} />,
    title: 'Fast & Simple',
    desc: 'Write notes in seconds, no friction.',
  },
  {
    icon: <Shield size={28} strokeWidth={1.75} />,
    title: 'Private & Secure',
    desc: 'Your notes are yours alone — end-to-end auth.',
  },
  {
    icon: <Globe size={28} strokeWidth={1.75} />,
    title: 'Always Accessible',
    desc: 'Works on all devices, synced in real time.',
  },
];

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate('/dashboard', { replace: true });
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <FileText size={20} strokeWidth={1.75} />
            <span>QuickNotes</span>
          </div>
          <nav className={styles.nav}>
            <a href="/sign-in" className={styles.navLink}>Sign In</a>
            <a href="/sign-up" className={styles.navCta}>
              Get Started <ChevronRight size={16} strokeWidth={2} />
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroHeading}>
              Your thoughts,<br />beautifully organized.
            </h1>
            <p className={styles.heroSub}>
              Capture ideas instantly. Access them anywhere.{' '}
              Private, fast, and always yours.
            </p>
            <div className={styles.heroCtas}>
              <a href="/sign-up" className={styles.ctaPrimary}>
                Get Started — it&apos;s free <ChevronRight size={18} strokeWidth={2} />
              </a>
              <a href="/sign-in" className={styles.ctaSecondary}>Sign In</a>
            </div>
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.featuresInner}>
            {features.map(f => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 QuickNotes</p>
        <div className={styles.footerLinks}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </div>
  );
}
