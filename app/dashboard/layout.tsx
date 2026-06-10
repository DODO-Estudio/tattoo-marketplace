'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Resumen', icon: '🏠' },
  { href: '/dashboard/perfil', label: 'Editar perfil', icon: '✏️' },
  { href: '/dashboard/fotos', label: 'Galería', icon: '📸' },
  { href: '/dashboard/suscripcion', label: 'Suscripción', icon: '💳' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top nav */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">TattooFind CR</Link>
          <div className="nav-links">
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>Panel de artista</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? 'Saliendo...' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      </nav>

      <div className="dash-layout">
        {/* Sidebar */}
        <aside className="dash-sidebar">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`dash-sidebar-link${pathname === item.href ? ' active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </aside>

        {/* Main content */}
        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}
