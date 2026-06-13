import { SignUp } from '@clerk/clerk-react';
import { FileText } from 'lucide-react';
import styles from './AuthPage.module.css';

export default function SignUpPage() {
  return (
    <div className={styles.page}>
      <div className={styles.brand}>
        <div className={styles.brandLogo}>
          <FileText size={40} strokeWidth={1.5} />
        </div>
        <h2 className={styles.brandTagline}>Start capturing ideas<br />in seconds.</h2>
      </div>
      <div className={styles.form}>
        <p className={styles.formSub}>Create your QuickNotes account</p>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </div>
  );
}
