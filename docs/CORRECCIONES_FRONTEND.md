# Correcciones pendientes — Frontend (PR #1, rama `feature/frontend-vistas`)

Resultado de la revisión del PR #1 (services, modules, components, hooks, utils, `vite.config.js` y `style.css`). El frontend funciona y la base es buena; este documento lista lo que hay que ajustar para integrarlo a `main` y dejarlo listo para conectar con el backend.

## Cómo trabajar estas correcciones

- Trabajar en la misma rama `feature/frontend-vistas`, para que el PR #1 se actualice solo.
- Un commit por bloque o tema, en español e imperativo (ej. `Corregir pérdida de datos al editar agendas`).
- Marcar cada casilla al terminar. Al final, probar a mano los 4 roles con `npm run dev` y avisar para aprobar el PR.
- Los bloques **A** son para esta rama. Los **B** pueden ir aquí o en un PR siguiente (acordarlo en equipo). Los **D** necesitan decisión del grupo antes de programar. Los **E** son reglas que debe implementar el backend.

---

## A. Corregir antes de integrar a `main`

### Datos y formularios
- [ ] **A-01** `AgendaFormModal`: al editar, `buildInitialValues` descarta grupos y estudiantes que ya no están disponibles, y `getSubjectsForTeacher` oculta asignaturas inactivas. Guardar borra esas relaciones sin aviso, o falla con un error genérico. Conservar lo ya elegido como hace `buildOptions` en `UsersPage` (marcándolo "(inactivo)").
- [ ] **A-02** `EntityFormModal.handleSubmit` y `CrudPage.run`: sin `try/catch/finally`. Si el servicio lanza un error, `saving` queda en `true` (botón bloqueado) o la acción falla en silencio. Mostrar un mensaje genérico y restablecer el estado.
- [ ] **A-03** `useAsyncData` + `CrudPage`: si una recarga falla y ya hay datos, el error no se muestra (solo se muestra cuando no hay datos). Avisar con un toast.
- [ ] **A-04** `StatusBadge`: activar, desactivar o retirar con un solo clic. Pedir confirmación con `ConfirmModal` al **desactivar usuarios, grupos y asignaturas** y al **retirar anuncios**.
- [ ] **A-05** `Chips`: `key={item}` repite claves si dos nombres coinciden (docentes homónimos), y falla si `items` es `undefined`. Usar ids como clave y `items = []` por defecto.
- [ ] **A-06** `NotificationsPage`: `TYPE_CONFIG[notification.tipo]` sin respaldo; un tipo desconocido rompe la pantalla. Agregar un valor por defecto.
- [ ] **A-07** `TeacherAgendaPage`: el modal de eliminar duplica `ConfirmModal`; reutilizarlo.

### Lógica y consistencia
- [ ] **A-08** `messageService` / `MessagesPage`: `getConversationsForUser` se llama dos veces por render. Calcular una vez y derivar `selected` de ese resultado.
- [ ] **A-09** `getAllowedContacts`: devolver los contactos ordenados por nombre.
- [ ] **A-10** Bitácora inconsistente: un anuncio **creado ya publicado** registra solo `CREAR`; uno editado y publicado registra `CREAR/EDITAR` y `PUBLICAR`. En agendas pasa algo similar (`saveAgenda` no registra `PUBLICAR`). Unificar el criterio en `announcementService` y `agendaService`.
- [ ] **A-11** `TeacherDashboard`: "Mis agendas recientes" ordena por fecha de inicio y muestra primero las futuras. Ordenar por creación o renombrar la tarjeta.
- [ ] **A-12** `RolePortal`: calcula contadores de mensajes y notificaciones para Admin y SuperAdmin, que no tienen esas secciones. Calcularlos solo para los roles que los usan.

### Textos y comentarios
- [ ] **A-13** `mockDb.js`: el nombre de la escuela es `C.E.B.G Aminta Martínez`; debe ser `C.E.B.G. Aminta Martínez` (con punto), como en la propuesta.
- [ ] **A-14** Palabras fuera del alcance (la matrícula no está en la propuesta): "Matricula a los estudiantes" (`UsersPage`) y "matriculados" (`SuperAdminDashboard`). Usar "Registra" y "registrados".
- [ ] **A-15** `AllUsersPage`: dice que "la edición se hace desde cada rol", pero el SuperAdmin solo edita administradores. Reescribir el texto.
- [ ] **A-16** Comentarios desactualizados: `RolePortal` ("student and teacher portals", lo usan los cuatro), `PendingRoleView` y el encabezado de `style.css` ("prototipo de SuperAdmin y Admin").

### Formato del repositorio
- [ ] **A-17** `style.css` y otros archivos tienen finales de línea **CRLF**, y hay estilos mezclados (los archivos originales usan tabs y sin punto y coma; el PR usa espacios y punto y coma). Agregar en la raíz `.gitattributes` (`* text=auto eol=lf`), `.editorconfig` y una configuración de Prettier, y formatear todo en un commit aparte para no ensuciar los diffs.
- [ ] **A-18** Documentar `VITE_PROXY_TARGET` en un `frontend/.env.example` y en `INSTALACION.md` (el proxy de `vite.config.js` apunta por defecto a `http://localhost:3000`).
- [ ] **A-19** Añadir a `ESTANDARES.md`: (a) los objetos que reflejan una tabla usan los nombres de columna en español; todo lo demás va en inglés (hoy hay `asignaturaId` junto a `groupIds`), (b) `modules/home` como módulo compartido de portales, (c) PRs pequeños, idealmente uno por módulo.

---

## B. Preparar para conectar el backend

- [ ] **B-01** **Todos los services en `async`** (hoy mezclan sync y async). Los componentes que los llaman sin `await` (agenda, mensajería, notificaciones, dashboards de docente y estudiante) deben pasar a `useAsyncData`, con estados de carga y error.
- [ ] **B-02** Formularios con `saving`: `AgendaFormModal` y el envío de mensajes necesitan `await` y botón bloqueado mientras envían (`EntityFormModal` ya lo hace).
- [ ] **B-03** **Contrato de `CrudPage`:** hoy `load()` trae todas las filas y filtra y pagina en el cliente. Con ~650 usuarios y la bitácora no escala. Definir `load({ page, query, tab })` que devuelva `{ rows, total }`, con búsqueda con retardo al escribir.
- [ ] **B-04** **Dashboards:** `StudentDashboard` y `TeacherDashboard` hacen 4 o 5 llamadas por pantalla. Usar un endpoint de resumen por rol (como `getAdminOverview`) y `useAsyncData`.
- [ ] **B-05** **`AuthContext`:** agregar estado `loading` para restaurar la sesión (evita el parpadeo de `LoginPage`); `signIn` pasa a `async`. Reemplazar `sessionStorage` por cookie `httpOnly` o token.
- [ ] **B-06** **Nombre de la escuela:** `AppShell` y `LoginPage` lo leen del mock. Pasarlo por props o por variable de entorno (`VITE_SCHOOL_NAME`); el login lo necesita antes de autenticar.
- [ ] **B-07** **Mensajería en tiempo real (diciembre):** un mensaje que llega con la conversación abierta queda como no leído; marcarlo al recibirlo si esa conversación está visible. En `vite.config.js`, el proxy `/api` probablemente necesite `ws: true` para WebSockets (verificar en la documentación de Vite).
- [ ] **B-08** **Antes de desplegar:** eliminar `mockDb.js`, el login simulado (`loginAsDemo`, que acepta cualquier contraseña) y los usuarios de ejemplo. **No desplegar nunca un build con el mock activo.**

---

## C. Mejoras menores (cuando haya tiempo)

- [ ] **C-01** Paginación en las listas de agendas, mensajes y notificaciones.
- [ ] **C-02** `AgendaCard`: mostrar los grupos destinatarios. En el formulario, filtrar la lista de estudiantes por los grupos marcados.
- [ ] **C-03** `StudentAgendaPage`: pestaña inicial "Vigentes".
- [ ] **C-04** `PendingRoleView`: convertirla en pantalla de "acceso no autorizado".
- [ ] **C-05** `AuthContext`: memoizar `value` con `useMemo`.
- [ ] **C-06** `Modal`: confirmar antes de cerrar por clic exterior si el formulario tiene cambios; bloquear el scroll del fondo.
- [ ] **C-07** `ToastProvider`: errores con `role="alert"` y mayor duración; `useToast` debe lanzar error fuera del provider (como `useAuth`).
- [ ] **C-08** Accesibilidad:
  - pestañas de `TeacherAgendaPage` y `StudentAgendaPage` con `aria-pressed`;
  - `fieldset`/`legend` en las casillas de `AgendaFormModal`;
  - `aria-describedby` y `aria-required` en `FormField`;
  - `aria-expanded` y cierre con Escape en el menú móvil;
  - `caption` y `scope` en las tablas;
  - el hilo de mensajes con `role="log"`.
- [ ] **C-09** `AgendaFormModal` repite la lógica de casillas múltiples que ya existe en `EntityFormModal`; reutilizarla.
- [ ] **C-10** `MessagesPage`: ignorar Enter durante la composición de texto (`event.nativeEvent.isComposing`).
- [ ] **C-11** Limpiezas: parámetro `role` sin usar en `validateUser`; `createNotifications` debe usar `nextId`; `RoleBadge` ante un rol desconocido; el dominio `@nova.edu` repetido en mensajes de error.
- [ ] **C-12** `formatDateTime`, `formatTime` y `timeAgo` no tienen protección ante valores nulos (como sí tiene `formatDate`).
- [ ] **C-13** `AppShell` importa un service; recibir `schoolName` por props.
- [ ] **C-14** Google Fonts en `index.html` tiene tipografías de respaldo y la página sigue funcionando sin internet; si el colegio restringe la red, considerar autoalojar las fuentes.

---

## D. Decisiones del equipo (acordar antes de programar)

- [ ] **D-01** **Permisos del SuperAdmin:** hoy puede desactivar cualquier cuenta (menos otro SuperAdmin) pero solo crear y editar administradores, y no gestiona grupos, asignaturas ni anuncios (`isAdmin` solo acepta `ADMIN`). ¿Es intencional? Si el Admin queda inactivo, nadie los gestiona.
- [ ] **D-02** **Contraseñas:** el usuario no puede cambiarla; Admin y SuperAdmin ni tienen perfil. Definir cambio propio, restablecimiento por el administrador y si se exige cambiarla en el primer inicio (esto último implica un campo nuevo en `usuarios`, o sea, una migración).
- [ ] **D-03** **Quién puede escribirle a quién** (RF-12): el código lo marca "pendiente de confirmación". Definir si se revalida en cada envío (docente desactivado, estudiante cambiado de grupo).
- [ ] **D-04** **Notificaciones:** (a) ¿se notifica otra vez si se retira y se vuelve a publicar una agenda o anuncio?, (b) ¿se crean de tipo `MENSAJE`? (existe en el schema pero no se usa), (c) ¿enlazan al elemento concreto? (requeriría un campo de referencia nuevo en `notificaciones`), (d) política de limpieza.
- [ ] **D-05** **Eliminar agendas:** RF-09 pide "modificar o retirar". Propuesta: retirar primero y eliminar solo borradores (como los anuncios).
- [ ] **D-06** **Bitácora:** definir qué se registra. Hoy se registran los inicios de sesión de administradores, pero no los de estudiantes; los cambios de perfil sí quedan registrados para todos.
- [ ] **D-07** **Carga inicial de ~600 estudiantes:** crearlos uno por uno no es realista. Hablarlo con la profesora (importación desde CSV, paso de grupo al cambiar de año). Está fuera de los RF actuales.
- [ ] **D-08** ¿Puede el estudiante editar su propio nombre y apellido?
- [ ] **D-09** **Navegación:** por ahora `#hash` (sin enlaces directos al detalle). ¿Se agrega `react-router` más adelante?
- [ ] **D-10** **Fechas de calendario** (`fechaInicio`, `fechaFin`, `fechaRetiro`): el frontend ya las maneja sin zona horaria. En el schema son `DateTime`; se puede mantener (sin convertir zonas en el servidor) o cambiar a `@db.Date` con una migración.

---

## E. Para el equipo de backend (reglas que hoy están solo en el mock)

El frontend solo mejora la interfaz; **la barrera real es el servidor** (RNF-02).

- [ ] **E-01** Verificar el rol del usuario autenticado en cada endpoint. Los endpoints de perfil, notificaciones y mensajes toman el usuario de la **sesión**, nunca del id que envía el cliente.
- [ ] **E-02** Login: verificar primero la contraseña y recién después informar de una cuenta inactiva (hoy se revela qué correos existen). Limitar los intentos fallidos. Hashear con bcrypt (RNF-01).
- [ ] **E-03** Un docente solo puede usar **sus** grupos, asignaturas y estudiantes al crear agendas (`agendaService.validateValues`).
- [ ] **E-04** Regla de contactos permitidos para mensajería (`messageService.getAllowedContacts`) y revalidarla al enviar si el equipo lo decide (D-03).
- [ ] **E-05** Reglas de anuncios: la fecha de retiro debe ser posterior a hoy al publicar; solo se eliminan borradores.
- [ ] **E-06** **No borrar en cascada** grupos ni asignaturas: si están en uso, solo desactivar (las tablas intermedias tienen `onDelete: Cascade` y borrarían las relaciones en silencio). Usuarios: solo `activo`, nunca eliminar.
- [ ] **E-07** Los ids y el `codigo` de usuario los genera el servidor (transacción para el correlativo `DOC-001`, etc.). Normalizar el correo a minúsculas (`email @unique` distingue mayúsculas en PostgreSQL).
- [ ] **E-08** Bitácora sin truncar (el mock la corta a 200 registros, RNF-13) y con paginación en el servidor.
- [ ] **E-09** Bloqueo optimista con `updatedAt` en usuarios, agendas y anuncios, para que dos administradores no se pisen al editar.
- [ ] **E-10** Mensajería: el mock es 1 a 1 (un solo "otro" participante), pero el schema admite conversaciones grupales. Notificaciones de agenda y anuncio creadas en el servidor.
- [ ] **E-11** Fechas de calendario: no convertir zonas horarias al guardar ni al responder (ver D-10).

---

## Verificado y correcto (no hace falta tocarlo)

- `useAsyncData`: no entra en bucle aunque `load` sea una función nueva en cada render; ignora respuestas obsoletas.
- `useHashSection`: un id inválido cae en la primera sección.
- `formatters.js`: las fechas de calendario ignoran la zona horaria (no se corren un día en Panamá, UTC-5); `getFullName(null)` devuelve "Sistema".
- `EntityFormModal`: campo de contraseña con `autoComplete="new-password"` y sin recortar; `required: 'create'` funciona.
- `LoginPage`: los accesos de demostración se eliminan con `vite build` (`import.meta.env.DEV`).
- Bitácora de solo lectura; grupos y asignaturas en uso no se pueden eliminar; no hay eliminación de usuarios.
- Contraseñas: no se guardan en el mock ni en `sessionStorage` (solo el `userId`).
- Todas las clases y variables CSS usadas en los componentes existen en `style.css`; hay `prefers-reduced-motion` y foco visible.
