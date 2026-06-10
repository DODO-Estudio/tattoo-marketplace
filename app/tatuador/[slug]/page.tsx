import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContactButtons from './ContactButtons';

type Photo = { id: string; imageUrl: string };
type Profile = {
  id: string;
  name: string;
  bio: string | null;
  locationProvince: string;
  locationCanton: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  basePrice: number | null;
  themeColor: string;
  photos: Photo[];
  isActive: boolean;
};

async function getProfile(slug: string): Promise<Profile | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/tatuador/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function TatuadorPage({ params }: { params: { slug: string } }) {
  const profile = await getProfile(params.slug);
  if (!profile) notFound();

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">TattooFind CR</Link>
          <Link href="/" className="btn btn-secondary btn-sm">← Ver todos</Link>
        </div>
      </nav>

      {/* Header with theme color */}
      <div style={{ background: `linear-gradient(135deg, ${profile.themeColor}dd, ${profile.themeColor}88)`, padding: '3rem 1.25rem', color: '#fff', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
          {profile.name}
        </h1>
        <p style={{ opacity: 0.9, fontSize: '1rem' }}>
          📍 {profile.locationProvince}{profile.locationCanton ? `, ${profile.locationCanton}` : ''}
        </p>
        {profile.basePrice && (
          <p style={{ marginTop: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
            Desde ₡{profile.basePrice.toLocaleString()}
          </p>
        )}
      </div>

      <div className="container" style={{ paddingTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: 800, margin: '0 auto' }}>

          {/* Bio */}
          {profile.bio && (
            <div className="card">
              <h2 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>Sobre mí</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{profile.bio}</p>
            </div>
          )}

          {/* Contact */}
          <div className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Contactar</h2>
            <ContactButtons profile={profile} />
          </div>

          {/* Gallery */}
          {profile.photos.length > 0 && (
            <div className="card">
              <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Galería ({profile.photos.length})</h2>
              <div className="photo-grid">
                {profile.photos.map(photo => (
                  <div key={photo.id} className="photo-thumb">
                    <Image
                      src={photo.imageUrl}
                      alt={`Tatuaje de ${profile.name}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 50vw, 200px"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
