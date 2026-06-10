'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const PROVINCES = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];
const THEME_COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#f5576c',
  '#4facfe', '#43e97b', '#fa709a', '#fee140',
  '#1a1a2e', '#0f3460',
];

type Profile = {
  name: string;
  bio: string;
  locationProvince: string;
  locationCanton: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  basePrice: string;
  themeColor: string;
  slug: string;
};

export default function EditPerfilPage() {
  const router = useRouter();
  const [form, setForm] = useState<Profile>({
    name: '', bio: '', locationProvince: 'San José', locationCanton: '',
    phone: '', whatsapp: '', instagram: '', basePrice: '', themeColor: '#667eea', slug: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => { if (r.status === 401) { router.push('/login'); return null; } return r.json(); })
      .then(data => {
        if (data?.profile) {
          const p = data.profile;
          setForm({
            name: p.name || '',
            bio: p.bio || '',
            locationProvince: p.locationProvince || 'San José',
            locationCanton: p.locationCanton || '',
            phone: p.phone || '',
            whatsapp: p.whatsapp || '',
            instagram: p.instagram || '',
            basePrice: p.basePrice ? String(p.basePrice) : '',
            themeColor: p.themeColor || '#667eea',
            slug: p.slug || '',
          });
        }
        setLoading(false);
      });
  }, [router]);

  function set(field: keyof Profile, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMsg({ type: 'error', text: data.error || 'Error al guardar' });
    } else {
      setMsg({ type: 'success', text: '¡Perfil actualizado correctamente!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (loading) return <div className="text-muted">Cargando...</div>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Editar perfil</h1>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card mb-3">
          <h2 style={{ fontSize: '1rem', marginBottom: '1.2rem', color: 'var(--primary)' }}>Información básica</h2>

          <div className="form-group">
            <label className="label">Nombre artístico *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="label">Bio / descripción</label>
            <textarea
              className="input textarea"
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              placeholder="Cuéntale a los clientes sobre tu estilo, experiencia y especialidades..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Provincia *</label>
              <select className="input select" value={form.locationProvince} onChange={e => set('locationProvince', e.target.value)} required>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Cantón</label>
              <input className="input" value={form.locationCanton} onChange={e => set('locationCanton', e.target.value)} placeholder="Ej: Alajuela centro" />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Precio base (₡)</label>
            <input
              className="input" type="number" value={form.basePrice}
              onChange={e => set('basePrice', e.target.value)}
              placeholder="Ej: 30000" min={0}
            />
          </div>
        </div>

        <div className="card mb-3">
          <h2 style={{ fontSize: '1rem', marginBottom: '1.2rem', color: 'var(--primary)' }}>Contacto</h2>

          <div className="form-group">
            <label className="label">WhatsApp</label>
            <input
              className="input" value={form.whatsapp}
              onChange={e => set('whatsapp', e.target.value)}
              placeholder="Ej: 50688889999 (con código de país)"
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Incluye código de país: 506 + número</span>
          </div>

          <div className="form-group">
            <label className="label">Instagram</label>
            <input
              className="input" value={form.instagram}
              onChange={e => set('instagram', e.target.value)}
              placeholder="@tuusuario (sin @)"
            />
          </div>

          <div className="form-group">
            <label className="label">Teléfono</label>
            <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="8888-9999" />
          </div>
        </div>

        <div className="card mb-3">
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Color de tema</h2>
          <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Este color personaliza tu página pública.</p>
          <div className="color-options">
            {THEME_COLORS.map(color => (
              <div
                key={color}
                className={`color-swatch${form.themeColor === color ? ' selected' : ''}`}
                style={{ background: color }}
                onClick={() => set('themeColor', color)}
                title={color}
              />
            ))}
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: 8, background: form.themeColor, color: '#fff', fontSize: '0.85rem', textAlign: 'center' }}>
            Vista previa del color
          </div>
        </div>

        {form.slug && (
          <div className="card mb-3" style={{ background: '#f8f9fa' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Tu URL pública: <strong style={{ color: 'var(--primary)' }}>/tatuador/{form.slug}</strong>
            </p>
          </div>
        )}

        <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={saving}>
          {saving ? 'Guardando...' : '💾 Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
