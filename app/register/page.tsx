'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PROVINCES = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', name: '', locationProvince: 'San José' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Error al crear la cuenta');
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>TattooFind CR</h1>
          <p className="text-muted mt-1" style={{ fontSize: '0.9rem' }}>Crea tu página de tatuador</p>
        </div>

        <div className="alert alert-info" style={{ fontSize: '0.85rem' }}>
          Primeros 3 meses a <strong>₡2,500/mes</strong>, luego ₡5,000/mes.
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Nombre artístico / nombre</label>
            <input
              className="input"
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
              placeholder="Ej: Carlos Tattoo"
            />
          </div>

          <div className="form-group">
            <label className="label">Provincia</label>
            <select
              className="input select"
              value={form.locationProvince}
              onChange={e => set('locationProvince', e.target.value)}
              required
            >
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label className="label">Contraseña</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear mi cuenta gratis'}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center text-muted" style={{ fontSize: '0.9rem' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
