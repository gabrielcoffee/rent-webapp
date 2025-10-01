import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Rent Brasil</h1>
        <p className={styles.subtitle}>
          Sistema de aluguel de itens entre pessoas
        </p>
        <div className={styles.actions}>
          <Link href="/itens-publicados" className="btn btn-primary">
            Ver Itens Disponíveis
          </Link>
        </div>
      </div>
    </div>
  );
}
