export const metadata = {
  title: 'TattooMarketplace',
  description: 'Encuentra tu tatuador perfecto en Costa Rica',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
