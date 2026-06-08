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
