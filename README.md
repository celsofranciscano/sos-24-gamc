This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## .env

API_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"

# Base de datos (Supabase Postgres). Sacar ambas cadenas del dashboard de
# Supabase: Project Settings → Database → Connection string.
# DATABASE_URL: conexión con pooling (Supavisor, modo "Transaction", puerto
# 6543) — la usa la app en runtime/serverless. Agregar "?pgbouncer=true" al
# final si aparecen errores de "prepared statement already exists".
# DIRECT_URL: conexión directa (puerto 5432) — la usa `prisma migrate` para
# poder ejecutar DDL, que el modo transaction del pooler no soporta.
DATABASE_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-xxxx.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-xxxx.pooler.supabase.com:5432/postgres"
BETTER_AUTH_SECRET=f9db5e01c49c9c0ade78026ba0ab8728ecae84a2620573de36719a031eecedf5

AUTH_SECRET=AElzbwqSZ0ms4JCOJ5Cs4HLWsGCKGfDIC+KC6CkLDW8=

# Requerida por /api/citizen/gemini/live-token (reporte por voz de la app
# móvil): la llave real de Gemini vive solo acá, nunca en el cliente.
GEMINI_API_KEY=

# Requeridas por /api/citizen/emergencies/[PK_emergency]/evidence (subida de
# fotos/videos de evidencia): la app móvil sube el archivo a este backend, y
# es este backend el que sube a Cloudinary (carpeta "arconte") usando estas
# credenciales — el API Secret nunca llega al cliente. Sacar los tres valores
# del dashboard de Cloudinary: Account Details → API Keys.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
