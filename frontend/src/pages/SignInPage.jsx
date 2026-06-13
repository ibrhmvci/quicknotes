import { SignIn } from '@clerk/clerk-react';
import { FileText } from 'lucide-react';
import styles from './AuthPage.module.css';

export default function SignInPage() {
  return (
    <div className={styles.page}>
      <div className={styles.brand}>
        <div className={styles.brandLogo}>
          <FileText size={40} strokeWidth={1.5} />
        </div>
        <h2 className={styles.brandTagline}>Your notes are<br />waiting for you.</h2>
      </div>
      <div className={styles.form}>
        <p className={styles.formSub}>Welcome back to QuickNotes</p>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
        />
      </div>
    </div>
  );
}
