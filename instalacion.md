# Guía de instalación — NOVA

Esta guía explica cómo descargar el proyecto y dejarlo funcionando en tu máquina local, incluyendo la base de datos con Prisma.

## 1. Requisitos previos

Instala lo siguiente antes de continuar:

- **Git** — https://git-scm.com/downloads
- **Node.js** (versión LTS) — https://nodejs.org
  Verifica la instalación con:
  ```
  node -v
  npm -v
  ```
- **PostgreSQL** — https://www.postgresql.org/download/
  Durante la instalación te pedirá una contraseña para el usuario `postgres`. Guárdala, la usarás en el `.env`.
  PostgreSQL queda corriendo como servicio en segundo plano. Para confirmar que está activo (Windows):
  ```
  Get-Service -Name postgresql*
  ```
- **Editor de código** (recomendado: VS Code) — https://code.visualstudio.com

## 2. Clonar el repositorio

```
git clone https://github.com/naimmDev/NOVA.git
cd NOVA
```

## 3. Configurar el backend

```
cd backend
npm install
```

> Prisma usa un CLI que cambia bastante entre versiones. Confirma que quedó en la versión 6 (no la 8, que trae otro CLI incompatible con los pasos de abajo):
> ```
> npx prisma --version
> ```
> Si no marca `6.x.x`, corre `npm uninstall prisma && npm install prisma@6 --save-dev && npm install @prisma/client@6`.

Crea un archivo `.env` dentro de `backend/` (puedes copiar `.env.example` si existe) con tus datos de conexión a PostgreSQL:

```
PORT=3000
DATABASE_URL="postgresql://postgres:tu_contraseña@localhost:5432/nova_db"
```

> El archivo `.env` nunca se sube a GitHub (está en `.gitignore`). Cada quien crea el suyo localmente con sus propias credenciales. No hace falta crear `nova_db` manualmente, Prisma la crea si no existe.

## 4. Aplicar la base de datos con Prisma

El esquema (`prisma/schema.prisma`) y las migraciones ya están en el repositorio, así que no se crean desde cero: solo se aplican.

```
npx prisma migrate dev
```

Esto crea `nova_db` (si no existe) y las 16 tablas definidas en el esquema.

Para verificar visualmente que las tablas se crearon:

```
npx prisma studio
```

Se abre en `http://localhost:5555`. Hay que volver a correr este comando cada vez que quieras ver esa interfaz; no queda abierta como una app instalada.

## 5. Iniciar el backend

```
npm run dev
```

> Si el proyecto aún no tiene el script `dev` configurado en `package.json` (con nodemon u otro), avisa al equipo antes de este paso.

Si todo está bien configurado, debería levantar el servidor en `http://localhost:3000` (o el puerto definido en `.env`).

## 6. Configurar y ejecutar el frontend

En otra terminal, desde la raíz del proyecto:

```
cd frontend
npm install
npm run dev
```

Esto levanta la aplicación React, normalmente en `http://localhost:5173`.

## 7. Verificación final

- Backend corriendo sin errores en su puerto.
- Frontend accesible desde el navegador.
- `npx prisma studio` muestra las 16 tablas (vacías está bien, el objetivo es confirmar la estructura).

## Notas para el equipo

- No subir nunca `.env` ni `node_modules/` al repositorio.
- Antes de hacer `git pull`, guarda o comitea tus cambios locales para evitar conflictos.
- Si alguien modifica `prisma/schema.prisma` (nueva tabla, campo, relación), debe correr `npx prisma migrate dev --name <descripción_del_cambio>` y subir tanto el `schema.prisma` como la nueva carpeta generada en `prisma/migrations/`. El resto del equipo, al hacer `git pull`, solo necesita correr `npx prisma migrate dev` de nuevo para aplicar ese cambio en su base local.
- Si agregas una dependencia nueva (`npm install algo`), avisa al equipo o déjalo indicado en el commit; cada quien debe correr `npm install` tras el pull para que `package.json` se refleje en su `node_modules`.