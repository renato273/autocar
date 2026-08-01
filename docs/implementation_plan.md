# Implementación de Administrador de Marcas

Para cumplir con el requerimiento de listar las marcas, administrar marcas y traer un listado predeterminado con las marcas más populares, realizaremos los siguientes cambios arquitectónicos.

## User Review Required

> [!WARNING]
> **Cambio de Esquema en Base de Datos**: Vamos a modificar la tabla `Vehicle`. El campo actual `brand` (String) será reemplazado por una relación `brandId` hacia la nueva tabla `Brand`. Dado que esto cambia la estructura, los vehículos actualmente registrados (si existe alguno) podrían ser eliminados o requerirán recrearse tras aplicar los cambios a la base de datos.

## Proposed Changes

### Prisma Schema (Base de Datos)
- **Modificar `backend/prisma/schema.prisma`:**
  - `[NEW]` Modelo `Brand` con campos `id` y `name` único.
  - `[MODIFY]` Modelo `Vehicle`: reemplazar `brand String` por `brandId Int` con relación a `Brand`.

### Backend
- **Migración y Semillas:**
  - `[NEW]` Script de "seeding" `backend/prisma/seedBrands.ts` para inyectar ~20 marcas populares (Toyota, Honda, Ford, Chevrolet, etc.).
- **Controladores y Rutas:**
  - `[NEW]` `backend/src/controllers/brandController.ts` (Listar, Crear, Eliminar marcas).
  - `[NEW]` `backend/src/routes/brandRoutes.ts`.
  - `[MODIFY]` `backend/src/routes/index.ts` para registrar las rutas de marcas.
  - `[MODIFY]` `backend/src/controllers/vehicleController.ts` para incluir `include: { brand: true }` y aceptar `brandId` en la creación en lugar de `brand`.

### Frontend
- **Tipos y Servicios:**
  - `[MODIFY]` `frontend/src/types/index.ts` para reflejar `brand: Brand` en `Vehicle` y crear la interfaz `Brand`.
- **Vistas:**
  - `[MODIFY]` `frontend/src/app/admin/page.tsx`: Añadir una sección "Gestor de Marcas" para que el administrador pueda ver la lista, añadir nuevas o eliminar existentes.
  - `[MODIFY]` `frontend/src/app/vehicles/new/page.tsx`: Cargar las marcas desde el API y cambiar el campo de texto de marca por un `<select>` desplegable.
  - `[MODIFY]` `frontend/src/components/VehicleCard.tsx` y `frontend/src/app/vehicles/[id]/page.tsx` para mostrar `vehicle.brand.name` en lugar del antiguo string.

## Verification Plan
1. Se aplicarán los cambios en el modelo Prisma (`npx prisma migrate dev`).
2. Se ejecutará el script de semillas para asegurar que existan las marcas.
3. Se verificará que el dashboard del Admin permita crear y borrar marcas.
4. Se intentará crear un vehículo nuevo usando la lista desplegable de marcas importada desde el backend.
