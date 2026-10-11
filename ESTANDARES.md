# Estándares de trabajo — NOVA

Guía de convenciones para que los 6 integrantes trabajen de forma consistente, sin importar quién escriba cada parte del código.

## 1. Idioma

- **Código** (variables, funciones, nombres de archivos, comentarios): **inglés**.
  ```js
  // Bien
  function getUserById(id) { }
  const isActive = true;

  // Evitar
  function obtenerUsuarioPorId(id) { }
  const estaActivo = true;
  ```
- **Base de datos** (tablas, columnas en `schema.prisma`): **español**, tal como fue aprobado en la propuesta de base de datos con la profesora (`usuarios`, `nombre`, `docenteId`, etc.). No renombrar sin discutirlo en equipo primero, ya que afecta migraciones existentes.
- **Documentación del proyecto** (README, manuales, esta guía): español, ya que es lo que se entrega al colegio y a la profesora.

## 2. Convenciones de nombres en el código

| Elemento | Convención | Ejemplo |
|---|---|---|
| Variables y funciones | camelCase | `getAgendaById`, `isPublished` |
| Componentes React | PascalCase | `AgendaCard.jsx`, `LoginForm.jsx` |
| Archivos no-componentes (controllers, services) | camelCase | `authController.js` |
| Constantes fijas | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| Carpetas de módulos | minúsculas | `modules/auth`, `modules/agenda` |

## 3. Git — ramas y commits

- **Rama principal:** `main` — solo código probado y funcional. Nadie hace push directo aquí.
- **Ramas de trabajo:** una por tarea/feature, con prefijo según el tipo:
  - `feature/nombre-corto` (ej. `feature/login-backend`)
  - `fix/nombre-corto` (corrección de errores)
  - `docs/nombre-corto` (documentación)
- **Commits:** mensajes cortos y descriptivos, en español, en modo imperativo:
  ```
  Agregar endpoint de login
  Corregir validación de email en registro
  ```
- **Antes de hacer push:** `git pull origin main` primero, para evitar conflictos innecesarios.
- **Pull Requests:** toda rama se integra a `main` mediante Pull Request, revisado por al menos un compañero antes de aprobar el merge (idealmente alguien del mismo lado backend/frontend).

## 4. Variables de entorno y datos sensibles

- Nunca subir `.env` al repositorio (ya está en `.gitignore`).
- Si agregas una variable de entorno nueva, actualiza `.env.example` (sin valores reales) y avisa al equipo en el grupo/chat del proyecto.
- Ninguna contraseña, token o credencial va escrita directamente en el código.

## 5. Prisma / base de datos

- Solo una persona aplica cambios al `schema.prisma` a la vez, para evitar migraciones duplicadas o conflictivas.
- Si modificas el schema: corre `npx prisma migrate dev --name <descripcion>` y sube tanto el `schema.prisma` como la carpeta nueva generada en `prisma/migrations/`.
- Avisa en el chat del equipo cuando subas una migración nueva, para que los demás corran `npx prisma migrate dev` y actualicen su base local.

## 6. Organización por módulos

Cada funcionalidad (auth, agenda, anuncios, mensajería) vive en su propia carpeta tanto en backend como en frontend. Evitar mezclar lógica de un módulo dentro de otro — si una función de "agenda" necesita datos de "usuarios", se importa desde el módulo correspondiente, no se duplica el código.

## 7. Comunicación de cambios

- Cambios que afecten a todo el equipo (nueva dependencia, cambio en la estructura de carpetas, cambio en el schema) se avisan antes o inmediatamente después de subirlos, no se asume que todos lo verán en GitHub.
- Dudas de diseño o alcance (¿esto debería ir en este módulo?, ¿agregamos este campo?) se discuten en equipo antes de implementar, igual que se hizo con el diseño de la base de datos.

## 8. División de responsabilidades

- **Backend (3 integrantes):** API, lógica de negocio, conexión a PostgreSQL vía Prisma, autenticación, WebSockets.
- **Frontend (3 integrantes):** interfaces en React, consumo de la API, experiencia de usuario por rol (SuperAdmin, Admin, Docente, Estudiante).
- La asignación específica de módulos dentro de cada lado se definirá aparte, pero ambos equipos deben coordinarse en los "contratos" de la API (qué rutas existen, qué datos reciben/devuelven) antes de empezar a programar en paralelo.
