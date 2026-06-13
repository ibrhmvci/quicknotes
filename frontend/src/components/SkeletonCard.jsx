import styles from './SkeletonCard.module.css';

export default function SkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={`${styles.bar} ${styles.title} shimmer`} />
      <div className={`${styles.bar} ${styles.line1} shimmer`} />
      <div className={`${styles.bar} ${styles.line2} shimmer`} />
      <div className={styles.footer}>
        <div className={`${styles.bar} ${styles.date} shimmer`} />
      </div>
    </div>
  );
}
