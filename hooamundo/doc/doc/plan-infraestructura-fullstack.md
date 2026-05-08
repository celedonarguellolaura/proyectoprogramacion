# 🏗️ Plan de Infraestructura — Fullstack TypeScript + Vercel + JSON Data Layer

> **Arquitecto:** Plan de implementación progresiva  
> **Stack:** Next.js · TypeScript · Vercel · GitHub · JSON como capa de datos  
> **Objetivo inicial:** Home con "Hola Mundo" animado como validación del entorno

---

## 1. Visión General

```
┌─────────────────────────────────────────────────────┐
│                   DEVELOPER                         │
│          (push a GitHub → main branch)              │
└────────────────────┬────────────────────────────────┘
                     │ Git Push
                     ▼
┌─────────────────────────────────────────────────────┐
│                  GITHUB REPO                        │
│  • Source code TypeScript                           │
│  • /data/*.json  (capa de datos)                    │
│  • CI: type-check + lint en cada PR                 │
└────────────────────┬────────────────────────────────┘
                     │ Webhook / Integration
                     ▼
┌─────────────────────────────────────────────────────┐
│               VERCEL (Deploy)                       │
│  • Build automático con cada push                   │
│  • Preview URLs por branch/PR                       │
│  • Production URL en merge a main                   │
└────────────────────┬────────────────────────────────┘
                     │ Sirve
                     ▼
┌─────────────────────────────────────────────────────┐
│            NEXT.JS APP (Runtime)                    │
│  ┌──────────────┐   ┌───────────────────────────┐  │
│  │  Frontend    │   │  API Routes / Server Side  │  │
│  │  React + TS  │◄──│  Lee archivos /data/*.json │  │
│  └──────────────┘   └───────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 2. Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|--------------|
| Framework | **Next.js 14+** (App Router) | SSR/SSG, API Routes, soporte nativo TS |
| Lenguaje | **TypeScript 5+** | Tipado estático, escalabilidad, autocompletado |
| Estilos | **Tailwind CSS** | Utility-first, compatible con animaciones custom |
| Animaciones | **Framer Motion** | Efectos elegantes con control preciso |
| Fuentes | **Google Fonts / next/font** | Tipografía de calidad sin CLS |
| Datos | **Archivos JSON en `/data`** | Sin DB, lectura en server side con `fs` |
| Hosting | **Vercel** | CI/CD automático, edge network, preview URLs |
| Repositorio | **GitHub** | Control de versiones + integración Vercel |
| Linting | **ESLint + Prettier** | Calidad y consistencia del código |

---

## 3. Estructura del Repositorio

```
/
├── .github/
│   └── workflows/
│       └── typecheck.yml          # CI: type-check en PRs
│
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Layout raíz (fuentes, metadata global)
│   ├── page.tsx                   # Home → "Hola Mundo"
│   ├── globals.css                # Variables CSS + reset
│   └── api/
│       └── data/
│           └── route.ts           # Ejemplo: API Route que lee /data
│
├── components/
│   ├── HolaMundo.tsx              # Componente animado principal
│   └── ui/                       # Componentes reutilizables
│
├── data/                          # 📁 Capa de datos (JSON como DB)
│   ├── site.json                  # Config general del sitio
│   └── content.json               # Contenido dinámico
│
├── lib/
│   └── data.ts                    # Helper: funciones para leer JSONs
│
├── types/
│   └── index.ts                   # Interfaces y tipos TypeScript globales
│
├── public/                        # Assets estáticos
│
├── .env.local                     # Variables de entorno (no commitear)
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Capa de Datos — JSON como Base de Datos

### 4.1 Filosofía

Los archivos en `/data` actúan como una base de datos de **solo lectura en runtime** en Vercel. Las escrituras (si se necesitan en el futuro) se hacen mediante commits al repositorio o mediante una API Route que modifique el archivo en desarrollo.

> ⚠️ **Importante:** Vercel tiene un filesystem de **solo lectura en producción**. La capa `/data` funciona perfectamente para lectura. Para escrituras en producción, se deberá usar un servicio externo (ej: GitHub API, PlanetScale, etc.) — esto queda fuera del alcance v1.

### 4.2 Estructura de archivos JSON

**`/data/site.json`**
```json
{
  "name": "Mi App",
  "version": "1.0.0",
  "locale": "es",
  "hero": {
    "title": "Hola Mundo",
    "subtitle": "TypeScript · Next.js · Vercel",
    "animationStyle": "elegant"
  }
}
```

**`/data/content.json`**
```json
{
  "sections": []
}
```

### 4.3 Helper de lectura — `lib/data.ts`

```typescript
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export function readJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}
```

### 4.4 Tipos — `types/index.ts`

```typescript
export interface SiteConfig {
  name: string;
  version: string;
  locale: string;
  hero: {
    title: string;
    subtitle: string;
    animationStyle: "elegant" | "minimal" | "bold";
  };
}
```

---

## 5. Implementación del Home — "Hola Mundo" Elegante

### 5.1 Página principal — `app/page.tsx`

```typescript
import { readJson } from "@/lib/data";
import { SiteConfig } from "@/types";
import HolaMundo from "@/components/HolaMundo";

export default function Home() {
  const config = readJson<SiteConfig>("site");

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <HolaMundo
        title={config.hero.title}
        subtitle={config.hero.subtitle}
      />
    </main>
  );
}
```

### 5.2 Componente animado — `components/HolaMundo.tsx`

```typescript
"use client";

import { motion } from "framer-motion";

interface Props {
  title: string;
  subtitle: string;
}

export default function HolaMundo({ title, subtitle }: Props) {
  return (
    <div className="text-center">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="text-6xl font-light tracking-widest text-white"
      >
        {title}
      </motion.h1>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
        className="h-px bg-white/30 my-6 origin-left"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="text-sm tracking-[0.3em] text-white uppercase"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
```

---

## 6. Configuración de TypeScript

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "moduleResolution": "bundler",
    "module": "esnext",
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

## 7. CI/CD — GitHub + Vercel

### 7.1 Integración Vercel ↔ GitHub

1. Conectar repositorio en [vercel.com/new](https://vercel.com/new)
2. Vercel detecta Next.js automáticamente
3. Configurar:
   - **Branch de producción:** `main`
   - **Build command:** `npm run build`
   - **Output directory:** `.next` (auto-detectado)
   - **Root directory:** `/` (raíz del repo)

### 7.2 Flujo de despliegue

```
Feature branch → PR → Preview URL automática en Vercel
       ↓
    Review + aprobación
       ↓
  Merge a main → Deploy a producción automático
```

### 7.3 GitHub Actions — Type Check en PRs

**`.github/workflows/typecheck.yml`**
```yaml
name: Type Check

on:
  pull_request:
    branches: [main]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
```

**Scripts en `package.json`:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "type-check": "tsc --noEmit",
    "lint": "next lint"
  }
}
```

---

## 8. Variables de Entorno

```bash
# .env.local (desarrollo)
NEXT_PUBLIC_APP_NAME=Mi App
NEXT_PUBLIC_APP_ENV=development
```

En Vercel: Settings → Environment Variables → agregar para cada entorno (Production / Preview / Development).

---

## 9. Plan de Ejecución por Fases

### ✅ Fase 0 — Setup (Día 1)
- [ ] Crear repositorio en GitHub
- [ ] Inicializar proyecto: `npx create-next-app@latest --typescript --tailwind --app`
- [ ] Configurar ESLint + Prettier
- [ ] Conectar repositorio con Vercel
- [ ] Verificar primer deploy exitoso

### ✅ Fase 1 — Capa de Datos (Día 1-2)
- [ ] Crear carpeta `/data`
- [ ] Crear `site.json` y `content.json`
- [ ] Implementar `lib/data.ts` con helper `readJson`
- [ ] Definir tipos en `types/index.ts`
- [ ] Validar lectura en `page.tsx` con Server Component

### ✅ Fase 2 — Home "Hola Mundo" (Día 2)
- [ ] Instalar Framer Motion: `npm install framer-motion`
- [ ] Crear componente `HolaMundo.tsx`
- [ ] Configurar fuentes elegantes con `next/font`
- [ ] Integrar datos del JSON en el Home
- [ ] Validar animación en local y en Preview URL de Vercel

### ✅ Fase 3 — Validación TypeScript (Día 2-3)
- [ ] Ejecutar `npm run type-check` sin errores
- [ ] Configurar GitHub Action de type-check
- [ ] Hacer PR de prueba y verificar checks verdes
- [ ] Merge a main → verificar deploy a producción

### 🔮 Fase 4 — Expansión futura (post v1)
- [ ] API Routes para exponer datos del `/data`
- [ ] Nuevas secciones alimentadas por JSON
- [ ] Sistema de tipos más robusto con Zod para validar JSONs

---

## 10. Dependencias del Proyecto

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "framer-motion": "^11.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "eslint": "^8.x",
    "eslint-config-next": "^14.x",
    "prettier": "^3.x",
    "prettier-plugin-tailwindcss": "^0.5.x"
  }
}
```

---

## 11. Criterios de Éxito — Fase 1

| Criterio | Verificación |
|----------|-------------|
| ✅ TypeScript sin errores | `npm run type-check` → 0 errores |
| ✅ Build exitoso | `npm run build` → sin warnings críticos |
| ✅ Datos leídos del JSON | "Hola Mundo" viene de `site.json`, no hardcodeado |
| ✅ Animación elegante | Efecto visible en producción |
| ✅ Deploy automático | Push a main → Vercel actualiza en < 2 min |
| ✅ Preview URLs funcionando | PR abre URL de preview independiente |

---

## 12. Consideraciones y Limitaciones

### Filesystem en Vercel (Producción)
Vercel ejecuta funciones en un entorno serverless con filesystem **de solo lectura**. Esto significa:
- ✅ **Lectura de `/data/*.json`:** Funciona perfectamente (los archivos se incluyen en el bundle de build)
- ❌ **Escritura en `/data/*.json` en producción:** No permitida — requiere solución alternativa si se necesita en el futuro

### Escalabilidad de la capa JSON
Para proyectos pequeños/medianos este enfoque es ideal. Al crecer:
- Considerar migrar a **Supabase** (PostgreSQL + API REST) manteniendo la misma interfaz de `readJson`
- O usar **GitHub API** para leer/escribir JSONs directamente desde el repo

### Seguridad
- Los archivos en `/data` son **parte del bundle público** de Next.js — no almacenar información sensible
- Variables de entorno sensibles → siempre en `.env.local` / Variables de Vercel, nunca en `/data`

---

*Plan generado para implementación TypeScript Fullstack · Next.js · Vercel · JSON Data Layer*  
*Versión 1.0 · Listo para ejecutar*
