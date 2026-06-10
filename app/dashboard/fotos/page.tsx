'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Photo = { id: string; imageUrl: string; order: number };

export default function FotosPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => { if (r.status === 401) { router.push('/login'); return null; } return r.json(); })
      .then(data => {
        if (data?.profile?.photos) setPhotos(data.profile.photos);
        setLoading(false);
      });
  }, [router]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > 20) {
      setMsg({ type: 'error', text: `Solo puedes tener 20 fotos. Actualmente tienes ${photos.length}.` });
      return;
    }

    setUploading(true);
    setMsg(null);

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 8 * 1024 * 1024) {
        setMsg({ type: 'error', text: `"${file.name}" supera el tamaño máximo de 8MB.` });
        continue;
      }

      const dataUri = await fileToDataUri(file);
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUri }),
      });

      if (res.ok) {
        const photo = await res.json();
        setPhotos(prev => [...prev, photo]);
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.error || 'Error al subir imagen' });
      }
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    setMsg(prev => prev?.type === 'error' ? prev : { type: 'success', text: 'Fotos subidas correctamente.' });
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta foto?')) return;

    const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPhotos(prev => prev.filter(p => p.id !== id));
      setMsg({ type: 'success', text: 'Foto eliminada.' });
    } else {
      setMsg({ type: 'error', text: 'Error al eliminar la foto.' });
    }
  }

  if (loading) return <div className="text-muted">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Galería de fotos</h1>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>{photos.length}/20 fotos</p>
        </div>
        {photos.length < 20 && (
          <button
            className="btn btn-primary"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Subiendo...' : '+ Subir fotos'}
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {msg && <div className={`alert alert-${msg.type} mb-2`}>{msg.text}</div>}

      {photos.length === 0 ? (
        <div
          className="upload-area"
          onClick={() => fileRef.current?.click()}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📸</div>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Sube tus trabajos</p>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>JPG, PNG o WebP — máximo 8MB por foto — hasta 20 fotos</p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map(photo => (
            <div key={photo.id} className="photo-thumb">
              <Image
                src={photo.imageUrl}
                alt="Tatuaje"
                fill
                style={{ objectFit: 'cover' }}
                sizes="200px"
              />
              <button
                className="photo-thumb-del"
                onClick={() => handleDelete(photo.id)}
                title="Eliminar foto"
              >
                ×
              </button>
            </div>
          ))}
          {uploading && (
            <div className="photo-thumb flex-center" style={{ background: '#f0f2ff' }}>
              <span style={{ fontSize: '1.5rem' }}>⏳</span>
            </div>
          )}
        </div>
      )}

      {photos.length > 0 && photos.length < 20 && (
        <div
          className="upload-area mt-3"
          onClick={() => fileRef.current?.click()}
          style={{ padding: '1.2rem' }}
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            + Agregar más fotos ({20 - photos.length} disponibles)
          </p>
        </div>
      )}
    </div>
  );
}

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
