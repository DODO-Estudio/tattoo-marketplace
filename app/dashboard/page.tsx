'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Profile = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  locationProvince: string;
  locationCanton: string | null;
  whatsapp: string | null;
  instagram: string | null;
  bio: string | null;
  basePrice: number | null;
  photos: { id: string }[];
};

type User = { id: string; email: string; profile: Profile | null };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null; }
        return r.json();
      })
      .then(data => { if (data) setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="text-muted">Cargando...</div>;
  if (!user) return null;

  const profile = user.profile;
  const completionItems = [
    { label: 'Nombre', done: !!profile?.name },
    { label: 'Provincia', done: !!profile?.locationProvince },
    { label: 'Bio / descripción', done: !!profile?.bio },
    { label: 'WhatsApp o Instagram', done: !!(profile?.whatsapp || profile?.instagram) },
    { label: 'Precio base', done: !!profile?.basePrice },
    { label: 'Al menos 1 foto', done: (profile?.photos?.length ?? 0) > 0 },
  ];
  const completionPct = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Hola, {profile?.name || user.email} 👋</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>{user.email}</p>
        </div>
        {profile && (
          <a
            href={`/tatuador/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            Ver mi página pública →
          </a>
        )}
      </div>

      {/* Status banner */}
      <div className={`alert ${profile?.isActive ? 'alert-success' : 'alert-info'} mb-3`}>
        {profile?.isActive
          ? '✅ Tu perfil está activo y visible en el marketplace.'
          : '⏳ Tu perfil está pendiente de activación. Completa tu perfil y activa tu suscripción.'}
      </div>

      {/* Stats */}
      <div className="grid grid-3 mb-3">
        <div className="card stat-card">
          <div className="stat-number">{profile?.photos?.length ?? 0}</div>
          <div className="stat-label">Fotos en galería</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number">{completionPct}%</div>
          <div className="stat-label">Perfil completo</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number">{profile?.isActive ? '🟢' : '🔴'}</div>
          <div className="stat-label">{profile?.isActive ? 'Activo' : 'Inactivo'}</div>
        </div>
      </div>

      {/* Completion checklist */}
      {completionPct < 100 && (
        <div className="card mb-3">
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Completa tu perfil</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {completionItems.map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                <span>{item.done ? '✅' : '⬜'}</span>
                <span style={{ color: item.done ? 'var(--muted)' : 'var(--text)', textDecoration: item.done ? 'line-through' : 'none' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/dashboard/perfil" className="btn btn-primary btn-sm">Editar perfil</Link>
            <Link href="/dashboard/fotos" className="btn btn-secondary btn-sm">Subir fotos</Link>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-2">
        <Link href="/dashboard/perfil" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✏️</div>
            <h3 style={{ marginBottom: '0.25rem' }}>Editar perfil</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Nombre, bio, contactos, precio, color</p>
          </div>
        </Link>
        <Link href="/dashboard/fotos" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📸</div>
            <h3 style={{ marginBottom: '0.25rem' }}>Galería de fotos</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Sube y gestiona tus trabajos</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
