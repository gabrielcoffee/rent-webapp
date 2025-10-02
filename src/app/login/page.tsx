'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError('Email ou senha incorretos');
      setLoading(false);
    } else {
      // Login bem-sucedido, redirecionar para admin
      router.push('/admin');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <span className={styles.title}>Rent Brasil Admin</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="seu@email.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="Sua senha"
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.buttonContainer}> 
            <button 
                type="submit" 
                disabled={loading}
                className="btn"
            >
                {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <div className={styles.footer}>
          <p>
            Não tem uma conta? Chora bb.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="btn btn-outline"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
