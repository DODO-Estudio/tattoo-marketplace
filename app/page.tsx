export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔥 TattooMarketplace</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>
        Bienvenido a la plataforma de tatuadores en Costa Rica
      </p>
      
      <div style={{ 
        background: '#f0f0f0', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginTop: '2rem' 
      }}>
        <h2>✅ Estado del Setup</h2>
        <ul>
          <li>✓ Servidor Next.js funcionando</li>
          <li>✓ Base de datos PostgreSQL conectada (Neon)</li>
          <li>✓ Prisma configurado</li>
          <li>✓ TypeScript listo</li>
        </ul>
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginTop: '2rem',
        borderLeft: '4px solid #ffc107'
      }}>
        <h2>📋 Próximos Pasos</h2>
        <ol>
          <li>Crear API de autenticación (signup/login)</li>
          <li>Implementar panel de tatuador</li>
          <li>Upload de fotos</li>
          <li>Landing individual</li>
          <li>Marketplace con búsqueda</li>
          <li>Integración Stripe para pagos</li>
        </ol>
      </div>

      <p style={{ marginTop: '2rem', color: '#999', fontSize: '14px' }}>
        Para ver esta página en http://localhost:3000 ejecuta: <code>npm run dev</code>
      </p>
    </div>
  )
}
