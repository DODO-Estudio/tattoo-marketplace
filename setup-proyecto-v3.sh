#!/bin/bash

# Script para setup completo y FUNCIONAL del proyecto TattooMarketplace
# Uso: bash setup-proyecto-v3.sh

echo "📦 Configurando TattooMarketplace - Versión Final..."

# ============ PACKAGE.JSON ============
echo "✓ Creando package.json..."
cat > package.json << 'EOF'
{
  "name": "tattoo-marketplace",
  "version": "0.1.0",
  "description": "Plataforma de marketplace para tatuadores en Costa Rica",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@prisma/client": "5.7.1",
    "bcryptjs": "2.4.3",
    "dotenv": "16.3.1",
    "dotenv-cli": "^7.0.0",
    "axios": "1.6.5"
  },
  "devDependencies": {
    "typescript": "5.3.3",
    "@types/node": "20.10.6",
    "@types/react": "18.2.46",
    "@types/react-dom": "18.2.18",
    "prisma": "5.7.1"
  }
}
EOF

# ============ .ENV.LOCAL ============
echo "✓ Creando .env.local (IMPORTANTE: actualiza con tu DATABASE_URL)..."
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://neondb_owner:npg_IUy1eRLQn7Nh@ep-dry-poetry-apwcesv6-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="tu-secreto-super-secreto-aqui-cambiar-en-produccion"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
EOF

# ============ TSCONFIG.JSON ============
echo "✓ Creando tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "ignoreDeprecations": "6.0",
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": false,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "jsx": "preserve",
    "moduleResolution": "bundler"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# ============ NEXT.CONFIG.JS ============
echo "✓ Creando next.config.js..."
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

module.exports = nextConfig;
EOF

# ============ .GITIGNORE ============
echo "✓ Creando .gitignore..."
cat > .gitignore << 'EOF'
# Node
node_modules/
package-lock.json
yarn.lock
.pnpm-lock.yaml

# Next.js
.next/
out/
build/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Prisma
prisma/dev.db
prisma/dev.db-journal

# OS
Thumbs.db
.DS_Store
EOF

# ============ CARPETAS ============
echo "✓ Creando estructura de carpetas..."
mkdir -p app
mkdir -p prisma
mkdir -p lib
mkdir -p scripts

# ============ APP/PAGE.TSX ============
echo "✓ Creando app/page.tsx..."
cat > app/page.tsx << 'EOF'
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
EOF

# ============ APP/LAYOUT.TSX ============
echo "✓ Creando app/layout.tsx..."
cat > app/layout.tsx << 'EOF'
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
EOF

# ============ PRISMA/SCHEMA.PRISMA ============
echo "✓ Creando prisma/schema.prisma..."
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String   @id @default(cuid())
  email                 String   @unique
  password              String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  tattooProfile         TattooProfile?
  subscription          Subscription?
  photos                Photo[]

  @@map("users")
}

model TattooProfile {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name                  String
  bio                   String?  @db.Text
  slug                  String   @unique

  locationProvince      String
  locationCanton        String?

  phone                 String?
  whatsapp              String?
  instagram             String?
  
  basePrice             Int?

  themeColor            String   @default("#667eea")
  
  isActive              Boolean  @default(false)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  photos                Photo[]
  pageViews             PageView[]
  contactClicks         ContactClick[]

  @@map("tattoo_profiles")
  @@index([locationProvince])
  @@index([isActive])
}

model Photo {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  tattooProfileId       String
  tattooProfile         TattooProfile @relation(fields: [tattooProfileId], references: [id], onDelete: Cascade)

  imageUrl              String
  publicId              String

  order                 Int      @default(0)

  createdAt             DateTime @default(now())

  @@map("photos")
  @@index([tattooProfileId])
  @@index([userId])
}

model Subscription {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  stripeSubscriptionId  String?  @unique
  stripeCustomerId      String?

  status                String   @default("active")
  
  currentPrice          Int

  startedAt             DateTime @default(now())
  renewsAt              DateTime?
  canceledAt            DateTime?
  trialEndsAt           DateTime?

  payments              Payment[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@map("subscriptions")
  @@index([userId])
  @@index([status])
}

model AuditLog {
  id                    String   @id @default(cuid())
  userId                String?

  action                String
  description           String?  @db.Text
  ipAddress             String?
  userAgent             String?

  createdAt             DateTime @default(now())

  @@map("audit_logs")
  @@index([userId])
  @@index([createdAt])
}

model Payment {
  id                    String   @id @default(cuid())
  subscriptionId        String
  subscription          Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  stripePaymentId       String   @unique
  
  amount                Int
  currency              String   @default("CRC")

  status                String

  description           String?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@map("payments")
  @@index([subscriptionId])
  @@index([status])
}

model PageView {
  id                    String   @id @default(cuid())
  tattooProfileId       String
  tattooProfile         TattooProfile @relation(fields: [tattooProfileId], references: [id], onDelete: Cascade)

  ipAddress             String?
  userAgent             String?
  referer               String?

  createdAt             DateTime @default(now())

  @@map("page_views")
  @@index([tattooProfileId])
  @@index([createdAt])
}

model ContactClick {
  id                    String   @id @default(cuid())
  tattooProfileId       String
  tattooProfile         TattooProfile @relation(fields: [tattooProfileId], references: [id], onDelete: Cascade)

  contactMethod         String
  ipAddress             String?
  userAgent             String?

  createdAt             DateTime @default(now())

  @@map("contact_clicks")
  @@index([tattooProfileId])
  @@index([createdAt])
}
EOF

# ============ LIB/DB.TS ============
echo "✓ Creando lib/db.ts..."
cat > lib/db.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
EOF

# ============ LIB/AUTH.TS ============
echo "✓ Creando lib/auth.ts..."
cat > lib/auth.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice(7);
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}

export function successResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}
EOF

# ============ README.MD ============
echo "✓ Creando README.md..."
cat > README.md << 'EOF'
# 🔥 TattooMarketplace

Plataforma de marketplace para tatuadores en Costa Rica.

## Stack

- **Frontend**: Next.js 14 + React 18
- **Backend**: Node.js
- **BD**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: JWT + bcrypt

## Setup Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Conectar BD (si no está conectada)
npx dotenv -e .env.local -- npx prisma db push

# 3. Ver datos (opcional)
npx prisma studio

# 4. Ejecutar servidor
npm run dev
```

Abre: http://localhost:3000

## Estructura

```
app/              # Next.js páginas y APIs
prisma/           # Schema de BD
lib/              # Utilities (auth, db, etc)
scripts/          # Scripts útiles
.env.local        # Variables de entorno (NO commitear)
```

## Variables de Entorno

Copia `.env.example` a `.env.local` y configura:

```env
DATABASE_URL="tu-url-postgresql"
JWT_SECRET="tu-secreto"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## Desarrollo

```bash
npm run dev        # Servidor en desarrollo
npm run build      # Build para producción
npm start          # Ejecutar build
npm run lint       # Linter
```

## BD

```bash
npx prisma db push           # Empujar schema a BD
npx prisma studio           # Ver datos en UI
npx prisma generate         # Generar cliente Prisma
```

## Git

```bash
git add .
git commit -m "tu mensaje"
git push
```

**IMPORTANTE**: `.env.local` está en `.gitignore` (no se commitea secretos).

---

**¡Listo para desarrollar!** 🚀
EOF

echo ""
echo "✅ ¡¡¡ SETUP v3 COMPLETADO!!!"
echo ""
echo "Ahora ejecuta en orden:"
echo ""
echo "1️⃣  npm install"
echo "2️⃣  npx dotenv -e .env.local -- npx prisma db push"
echo "3️⃣  npm run dev"
echo ""
echo "Luego abre: http://localhost:3000"
echo ""
echo "Después haz commit:"
echo "  git add ."
echo "  git commit -m 'Setup inicial funcional'"
echo "  git push"
echo ""
