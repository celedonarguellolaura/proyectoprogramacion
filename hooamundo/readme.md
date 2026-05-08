# Mi App TypeScript — Fullstack Next.js + Vercel

Sistema fullstack en TypeScript con despliegue continuo GitHub → Vercel y persistencia basada en archivos JSON.

## Stack

- **Next.js 14** (App Router)
- **TypeScript 5** (strict mode)
- **Tailwind CSS + Framer Motion**
- **Zod** para validación de datos
- **Vercel** para hosting y CI/CD

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Validar TypeScript
npm run typecheck

# 3. Desarrollo local
npm run dev
# → http://localhost:3000
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run typecheck` | Validación TypeScript sin emitir |
| `npm run lint` | ESLint |
| `npm run validate` | typecheck + lint |

## Estructura

```
├── app/                  # Next.js App Router
│   ├── api/data/         # GET /api/data → home.json
│   ├── api/config/       # GET /api/config → config.json
│   ├── layout.tsx        # Layout raíz con fuentes
│   ├── page.tsx          # Home → Hola Mundo
│   └── globals.css       # Estilos globales
├── components/
│   ├── AnimatedText.tsx  # Animación letra por letra
│   └── HolaMundo.tsx     # Componente principal
├── data/                 # JSON como base de datos
│   ├── config.json
│   └── home.json
└── lib/
    ├── types.ts          # Interfaces TypeScript
    ├── validators.ts     # Schemas Zod
    └── dataService.ts    # Lectura de archivos JSON
```

## Despliegue en Vercel

1. Hacer push a GitHub
2. En [vercel.com/new](https://vercel.com/new) importar el repositorio
3. Vercel detecta Next.js automáticamente → **Deploy**

Cada `push` a `main` dispara un redeploy automático.

## Agregar contenido

Para añadir una nueva sección/página:
1. Crear `data/mi-entidad.json`
2. Agregar interfaz en `lib/types.ts`
3. Agregar schema en `lib/validators.ts`
4. Agregar función en `lib/dataService.ts`
5. Crear ruta en `app/`
