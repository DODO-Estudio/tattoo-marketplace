'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Error al iniciar sesión');
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="auth-page" style={{ background: 'var(--bg)' }}>
      <div className="auth-card">
        <div className="auth-logo">
          <h1>TattooFind CR</h1>
          <p className="text-muted mt-1" style={{ fontSize: '0.9rem' }}>Ingresa a tu panel de tatuador</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label className="label">Contraseña</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center text-muted" style={{ fontSize: '0.9rem' }}>
          ¿No tienes cuenta?{' '}
          <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
