# Tareas Pendientes

Estado de la comparación entre el `prompt inicial.txt` y el código actual (backend + frontend).

> El `task.md` está 100% completo. Lo siguiente es lo que **falta** según el prompt original.

## 1. Permisos de menús por usuario (requerimiento original)

**Prompt:** "tener un sistema de roles que permita habilitar o deshabilitar menús de acceso a un usuario, por defecto generar un admin".

**Estado actual:** Solo existe el enum `Role { ADMIN, USER }` (`backend/prisma/schema.prisma:10`). El `NavBar.tsx:52` oculta el menú "Admin" si el usuario no es ADMIN. No hay permisos configurables por menú ni por usuario.

**Qué falta:**
- [ ] Modelo Prisma para permisos de menús por usuario (ej. `MenuPermission { userId, menu }` o una tabla `menus` con booleans).
- [ ] Endpoints backend para obtener/actualizar permisos (get/set por usuario, solo ADMIN).
- [ ] Frontend: sección en `/admin` para habilitar/deshabilitar qué menús ve cada usuario.
- [ ] `NavBar.tsx`: renderizar menús según los permisos del usuario (no solo por rol).
- [ ] Considerar qué menús son configurables: Dashboard, Vehículos, Admin (y futuros).
- [ ] Seed: admin con todos los menús habilitados por defecto.

## 2. Validación de matrícula alfanumérica (requerimiento original)

**Prompt:** "matrícula (alfanumérica)".

**Estado actual:** No hay validación de formato. Solo unicidad (P2002 → "Esa placa ya está registrada" en `backend/src/controllers/vehicleController.ts`). Se puede guardar cualquier texto.

**Qué falta:**
- [ ] Validación backend: regex alfanumérica (ej. `^[A-Za-z0-9-]{3,10}$`) en `createVehicle` y `updateVehicle` (`vehicleController.ts`).
- [ ] Validación frontend en `vehicles/new/page.tsx` y `vehicles/[id]/edit/page.tsx` (mismo regex + mensaje de error claro).
- [ ] Mantener el `toUpperCase()` al enviar.

## 3. Verificación final (una vez implementado lo anterior)

- [ ] `npx prisma db push` (si se agregaron modelos de permisos).
- [ ] `npx tsc --noEmit` en backend y frontend.
- [ ] Probar flujo completo: admin activa/desactiva menú de un USER → el USER ve/oculta el menú.
- [ ] Probar crear vehículo con matrícula inválida → error; con válida → OK.
