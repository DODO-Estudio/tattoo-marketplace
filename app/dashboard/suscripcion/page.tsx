'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

type Payment = { id: string; amount: number; currency: string; status: string; createdAt: string };
type Subscription = {
  status: string;
  currentPrice: number;
  startedAt: string;
  renewsAt: string | null;
  canceledAt: string | null;
  payments: Payment[];
};

const STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  active:    { label: 'Activa',          badge: 'badge-green'  },
  trialing:  { label: 'En prueba',       badge: 'badge-blue'   },
  past_due:  { label: 'Pago pendiente',  badge: 'badge-red'    },
  canceled:  { label: 'Cancelada',       badge: 'badge-red'    },
  inactive:  { label: 'Sin suscripción', badge: 'badge-yellow' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function SuscripcionContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const success = params.get('success') === '1';
  const canceled = params.get('canceled') === '1';

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => { if (r.status === 401) { router.push('/login'); return null; } return r.json(); })
      .then(data => { if (!data) return; })
      .catch(() => {});

    fetch('/api/subscription')
      .then(r => r.json())
      .then(data => { setSub(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  async function handleSubscribe() {
    setActionLoading(true);
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { alert(data.error || 'Error al crear sesión de pago'); setActionLoading(false); }
  }

  async function handlePortal() {
    setActionLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { alert(data.error || 'Error al abrir portal'); setActionLoading(false); }
  }

  if (loading) return <div className="text-muted">Cargando...</div>;

  const statusKey = sub?.status ?? 'inactive';
  const statusInfo = STATUS_LABELS[statusKey] ?? STATUS_LABELS.inactive;
  const isActive = sub?.status === 'active' || sub?.status === 'trialing';

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Suscripción</h1>

      {success && (
        <div className="alert alert-success mb-3">
          ✅ ¡Pago exitoso! Tu perfil ya está activo en el marketplace.
        </div>
      )}
      {canceled && (
        <div className="alert alert-info mb-3">
          Cancelaste el proceso de pago. Tu perfil sigue inactivo.
        </div>
      )}

      {/* Estado actual */}
      <div className="card mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 style={{ fontSize: '1rem' }}>Estado actual</h2>
          <span className={`badge ${statusInfo.badge}`}>{statusInfo.label}</span>
        </div>

        {sub ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
            <div>Precio: <strong style={{ color: 'var(--text)' }}>₡{(sub.currentPrice).toLocaleString()}/mes</strong></div>
            <div>Desde: <strong style={{ color: 'var(--text)' }}>{formatDate(sub.startedAt)}</strong></div>
            {sub.renewsAt && (
              <div>
                {isActive ? 'Renueva el' : 'Venció el'}:{' '}
                <strong style={{ color: 'var(--text)' }}>{formatDate(sub.renewsAt)}</strong>
              </div>
            )}
            {sub.canceledAt && (
              <div>Cancelada el: <strong style={{ color: 'var(--danger)' }}>{formatDate(sub.canceledAt)}</strong></div>
            )}
          </div>
        ) : (
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Aún no tienes suscripción. Activa tu perfil para aparecer en el marketplace.
          </p>
        )}

        <div className="divider" />

        {isActive ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={handlePortal} disabled={actionLoading}>
              {actionLoading ? 'Abriendo...' : '⚙️ Gestionar suscripción'}
            </button>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              Desde el portal puedes cancelar, cambiar método de pago o ver facturas.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn btn-primary btn-lg" onClick={handleSubscribe} disabled={actionLoading}>
              {actionLoading ? 'Redirigiendo...' : '💳 Suscribirme ahora'}
            </button>
          </div>
        )}
      </div>

      {/* Planes */}
      {!isActive && (
        <div className="card mb-3">
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Planes disponibles</h2>
          <div className="grid grid-2">
            <div style={{ border: '2px solid var(--primary)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Lanzamiento
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>₡2,500</div>
              <div className="text-muted" style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>/mes · primeros 3 meses</div>
              <div style={{ fontSize: '0.82rem' }}>✓ Perfil en marketplace<br />✓ Galería hasta 20 fotos<br />✓ Botón WhatsApp/Instagram</div>
            </div>
            <div style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: '1rem', textAlign: 'center', opacity: 0.7 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Regular
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>₡5,000</div>
              <div className="text-muted" style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>/mes · después del mes 3</div>
              <div style={{ fontSize: '0.82rem' }}>✓ Todo lo anterior<br />✓ Prioridad en búsqueda<br />✓ Analytics básicos</div>
            </div>
          </div>
        </div>
      )}

      {/* Historial de pagos */}
      {sub?.payments && sub.payments.length > 0 && (
        <div className="card">
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Historial de pagos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sub.payments.map(p => (
              <div
                key={p.id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>₡{p.amount.toLocaleString()}</div>
                  <div className="text-muted">{formatDate(p.createdAt)}</div>
                </div>
                <span className={`badge ${p.status === 'succeeded' ? 'badge-green' : 'badge-red'}`}>
                  {p.status === 'succeeded' ? 'Pagado' : 'Fallido'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuscripcionPage() {
  return (
    <Suspense fallback={<div className="text-muted">Cargando...</div>}>
      <SuscripcionContent />
    </Suspense>
  );
}
