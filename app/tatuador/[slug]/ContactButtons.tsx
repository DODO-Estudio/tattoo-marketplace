'use client';

type Profile = {
  id: string;
  whatsapp: string | null;
  instagram: string | null;
  phone: string | null;
};

async function trackClick(profileId: string, method: string) {
  fetch('/api/contact-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, contactMethod: method }),
  }).catch(() => {});
}

export default function ContactButtons({ profile }: { profile: Profile }) {
  const hasContact = profile.whatsapp || profile.instagram || profile.phone;

  if (!hasContact) {
    return <p style={{ color: 'var(--muted)' }}>Este tatuador aún no ha añadido medios de contacto.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {profile.whatsapp && (
        <a
          href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-lg"
          onClick={() => trackClick(profile.id, 'whatsapp')}
          style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
        >
          💬 Consultar por WhatsApp
        </a>
      )}
      {profile.instagram && (
        <a
          href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-lg"
          onClick={() => trackClick(profile.id, 'instagram')}
          style={{ background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)' }}
        >
          📸 Ver Instagram
        </a>
      )}
      {profile.phone && (
        <a
          href={`tel:${profile.phone}`}
          className="btn btn-secondary btn-lg"
          onClick={() => trackClick(profile.id, 'phone')}
        >
          📞 Llamar: {profile.phone}
        </a>
      )}
    </div>
  );
}
