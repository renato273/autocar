# AutoCar 🚗⛽

Sistema de gestión vehicular: control de consumo y gastos de combustible, con
marcas, vehículos, cargas por fecha, ingeniería inversa de precios, dashboard
por periodos y roles con permisos de menús por usuario.

Monorepo con dos apps:

| App | Tecnología | Puerto |
|-----|-----------|--------|
| `backend/` | Node.js + Express + Prisma/PostgreSQL | 4000 |
| `frontend/` | Next.js 13 (App Router) + TypeScript | 3000 |

---

## ✨ Funcionalidades

- **Autenticación y roles**: registro, login (JWT), roles `ADMIN` / `USER`.
- **Permisos de menús por usuario**: el admin habilita/deshabilita qué menús ve
  cada usuario (`Dashboard`, `Vehículos`, `Admin`).
- **Gestión de usuarios** (CRUD) desde el panel admin.
- **Vehículos**: marca, modelo, tipo, matrícula (validada), ruedas, puertas y
  capacidad de tanque. N vehículos por usuario. Hasta 3 fotos por vehículo con
  galería estilo "Time Machine" (stack 3D + scrubber).
- **Cargas de combustible**:
  - Fecha de carga (permite registrar cargas atrasadas).
  - Odómetro anterior auto-calculado según la fecha elegida.
  - Ingeniería inversa: completando 2 de 3 campos (total, ₲/litro, litros) se
    calcula el tercero.
  - Cálculo automático de **km/L** y **L/100km**.
  - Foto del odómetro.
- **Dashboard**: gastos y consumo diario / semanal / mensual por vehículo,
  con skeleton loading (boneyard) y tour guiado (Driver.js).
- **Panel admin** con split view estilo macOS: sidebar + divider arrastrable +
  colapsable, con paginado de marcas.

---

## 🚀 Puesta en marcha

### Requisitos

- Node.js 18+ (se desarrolló con Node 22)
- PostgreSQL (local o remoto)

### 1. Backend (`backend/`)

```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# editar .env: DATABASE_URL, JWT_SECRET, PORT

# Crear el esquema en la base de datos
npx prisma db push

# Crear el admin por defecto (opcional)
npm run seed

# Levantar el servidor de desarrollo
npm run dev
```

Credenciales del admin por defecto (de `seed.ts`):

- **Email**: `admin@example.com`
- **Password**: `AdminPass123`

### 2. Frontend (`frontend/`)

```bash
cd frontend
npm install

# Opcional: apuntar a otra API (default http://localhost:4000/api)
# crear archivo .env con NEXT_PUBLIC_API_URL

npm run dev
```

Abrir <http://localhost:3000>.

### 3. Reiniciar servicios (Windows)

El script de la raíz mata los puertos 4000/3000 y relanza ambos:

```powershell
powershell -ExecutionPolicy Bypass -File .\restart.ps1
```

---

## 🗂️ Estructura del proyecto

```
autocar/
├── AGENTS.md                  # Directrices de desarrollo y UI
├── restart.ps1                # Reinicia backend + frontend (Windows)
├── task.md                    # Checklist de marcas
├── implementation_plan.md     # Plan de implementación de marcas
├── pendientes.md              # Tareas pendientes (permisos, matrícula, etc.)
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Modelos: User, Brand, Vehicle, FuelLoad, MenuPermission
│   │   └── seedBrands.ts      # Seed de 21 marcas populares
│   └── src/
│       ├── index.ts           # App Express + error handler global
│       ├── seed.ts            # Seed del admin
│       ├── middlewares/       # auth (JWT) y role
│       ├── controllers/       # auth, brand, vehicle, fuel, user, menu
│       ├── routes/            # /auth, /vehicles, /brands, /fuel, /users, /permissions
│       └── swagger.ts         # Swagger UI (opcional)
│
└── frontend/
    └── src/
        ├── app/               # Rutas (App Router)
        │   ├── login/ register/
        │   ├── dashboard/
        │   ├── vehicles/      # listado, detalle, nuevo, editar, cargas
        │   └── admin/         # split view: usuarios, marcas, permisos
        ├── components/        # NavBar, PageHeader, VehicleCard,
        │                      # TimeMachineGallery, FuelLoadGuide, DashboardSkeleton
        ├── lib/               # store (zustand), format, dashboard-bones
        └── types/             # Tipos compartidos
```

---

## 🔌 API

Base URL: `http://localhost:4000/api`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registro (rol USER) |
| POST | `/auth/login` | Login → JWT + permisos |
| GET | `/auth/me` | Usuario actual + permisos |
| GET/POST | `/brands` | Listar / crear marcas |
| DELETE | `/brands/:id` | Eliminar marca |
| GET/POST/PUT/DELETE | `/vehicles` | CRUD de vehículos (con brand y fotos) |
| POST/DELETE | `/vehicles/:id/images` | Subir / quitar fotos (máx 3) |
| GET/POST | `/fuel` | Listar / crear cargas |
| GET | `/fuel/stats?period=day\|week\|month` | Estadísticas por periodo |
| PUT/DELETE | `/fuel/:id` | Editar / eliminar carga |
| GET/POST/PUT/DELETE | `/users` | CRUD de usuarios (solo ADMIN) |
| GET | `/permissions/me` | Permisos del usuario actual |
| GET/PUT | `/permissions/users/:id` | Permisos de un usuario (solo ADMIN) |

---

## 🧪 Tests

```bash
cd backend
npm test
```

## 🧰 Herramientas de UI usadas

- **NameThatUI** (<https://namethatui.com/>): referencia de vocabulario UI.
- **Driver.js**: tour guiado del formulario de carga.
- **boneyard-js**: skeletons del dashboard.
- **Motion (framer-motion)**: galería Time Machine 3D.
- **lucide-react**: íconos.
- **zustand**: estado global.

---

## 📄 Licencia

MIT
