# AGENTS.md

## Directrices de UI para el desarrollo de AutoCar

### Referencia de componentes y patrones UI
Usa **NameThatUI** (https://namethatui.com/) como referencia de vocabulario y
patrones de interfaz antes de construir o nombrar componentes nuevos.

Qué aporta el sitio:
- El **nombre correcto** de cada elemento UI (web y macOS) y su API/símbolo.
- **Prompts listos** para describir un componente a un agente.
- Anatomía (partes nombradas) de patrones comunes.

Cómo usarlo:
1. Al crear una interfaz nueva, describe el elemento en términos de NameThatUI
   (ej: "split view", "segmented control", "dropdown menu", "badge vs chip").
2. Antes de inventar un nombre propio, buscá el término estándar en el sitio.
3. Reutilizá los patrones ya aplicados en este proyecto:
   - Split View estilo macOS (sidebar + divider arrastrable + collapse):
     `frontend/src/app/admin/page.tsx` y clases `.admin-*` en `globals.css`.
   - Time Machine Gallery (stack 3D estilo Apple): `frontend/src/components/TimeMachineGallery.tsx`.
   - Tour guiado con Driver.js: `frontend/src/components/FuelLoadGuide.tsx`.
   - Skeleton con boneyard: `frontend/src/components/DashboardSkeleton.tsx`.

### Convenciones técnicas del proyecto
- Backend: Express + Prisma/PostgreSQL en `backend/`, puerto 4000 (`npm run dev`).
- Frontend: Next.js 13 (App Router) en `frontend/`, puerto 3000 (`npm run dev`).
- **NO usar Tailwind**: el CSS vive en `frontend/src/app/globals.css` con clases
  propias. Antes de usar una clase, verificar que exista o agregarla ahí.
- Restart de servicios: `powershell -ExecutionPolicy Bypass -File .\restart.ps1`.
- Api base: `http://localhost:4000/api`. Admin: `admin@example.com` / `AdminPass123`.
- Matrícula: solo alfanumérica + guiones (3-10 chars).
- Permisos de menús por usuario: `MenuPermission` + endpoints `/api/permissions`.
