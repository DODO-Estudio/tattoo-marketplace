'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PROVINCES = ['', 'San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];

type Profile = {
  id: string;
  name: string;
  slug: string;
  locationProvince: string;
  locationCanton: string | null;
  basePrice: number | null;
  bio: string | null;
  themeColor: string;
  photos: { imageUrl: string }[];
};

export default function HomePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (province) params.set('province', province);
    if (debouncedSearch) params.set('search', debouncedSearch);
    const res = await fetch(`/api/marketplace?${params}`);
    const data = await res.json();
    setProfiles(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [province, debouncedSearch]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  return (
    <div className="page">
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <span className="nav-logo">TattooFind CR</span>
          <div className="nav-links">
            <Link href="/login" className="btn btn-secondary btn-sm">Iniciar sesión</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Registrarme</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <h1>Encuentra tu tatuador perfecto</h1>
        <p>Descubre artistas del tatuaje en Costa Rica. Compara estilos, precios y contáctalos directamente.</p>

        <div className="search-bar">
          <input
            className="input"
            placeholder="Buscar por nombre o cantón..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="input select"
            value={province}
            onChange={e => setProvince(e.target.value)}
            style={{ maxWidth: 200 }}
          >
            {PROVINCES.map(p => (
              <option key={p} value={p}>{p || 'Todas las provincias'}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Listing */}
      <div className="container" style={{ paddingTop: '2.5rem' }}>
        {loading ? (
          <div className="text-center text-muted mt-4">Cargando tatuadores...</div>
        ) : profiles.length === 0 ? (
          <div className="text-center mt-4">
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>No se encontraron tatuadores con esos filtros.</p>
            {(search || province) && (
              <button className="btn btn-secondary mt-2" onClick={() => { setSearch(''); setProvince(''); }}>
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
              {profiles.length} tatuador{profiles.length !== 1 ? 'es' : ''} encontrado{profiles.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-3">
              {profiles.map(profile => (
                <Link key={profile.id} href={`/tatuador/${profile.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="artist-card">
                    {profile.photos[0] ? (
                      <Image
                        src={profile.photos[0].imageUrl}
                        alt={profile.name}
                        width={400}
                        height={200}
                        className="artist-card-img"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="artist-card-img flex-center"
                        style={{ background: profile.themeColor + '22' }}
                      >
                        <span style={{ fontSize: '3rem' }}>🎨</span>
                      </div>
                    )}
                    <div className="artist-card-body">
                      <div className="artist-card-name">{profile.name}</div>
                      <div className="artist-card-location">
                        📍 {profile.locationProvince}{profile.locationCanton ? `, ${profile.locationCanton}` : ''}
                      </div>
                      {profile.basePrice && (
                        <div className="artist-card-price">
                          Desde ₡{profile.basePrice.toLocaleString()}
                        </div>
                      )}
                      {profile.bio && (
                        <p style={{ fontSize: '0.82rem', color: '#6c757d', marginTop: '0.5rem', lineHeight: 1.4 }}>
                          {profile.bio.length > 80 ? profile.bio.slice(0, 80) + '...' : profile.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA para tatuadores */}
      <div className="container mt-4">
        <div className="card text-center" style={{ marginTop: '3rem', padding: '2.5rem' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>¿Eres tatuador?</h2>
          <p className="text-muted mb-3">
            Crea tu página profesional desde solo ₡2,500/mes y aparece en este marketplace.
          </p>
          <Link href="/register" className="btn btn-primary btn-lg">
            Crear mi página gratis
          </Link>
        </div>
      </div>
    </div>
  );
}
