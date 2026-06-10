import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TattooFind CR – Encuentra tu tatuador en Costa Rica',
  description: 'Descubre, compara y contacta tatuadores profesionales en Costa Rica. Filtra por ubicación, estilo y precio.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
