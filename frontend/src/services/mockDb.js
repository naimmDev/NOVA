/*
  TEMPORARY MOCK. Mirrors the tables of prisma/schema.prisma (same names, in camelCase)
  and keeps the data in localStorage. When the backend API exists, the files in
  /services are replaced by real HTTP calls and this file is deleted.
  Passwords are NOT stored here: the real API never returns passwordHash.
*/
import { toDateString } from '../utils/formatters';

const STORAGE_KEY = 'nova_mock_db_v3';
const MAX_LOG_ENTRIES = 200;
const MINUTES_PER_DAY = 1440;

const minutesFromNow = (minutes) => new Date(Date.now() + minutes * 60000).toISOString();
const daysFromNow = (days) => minutesFromNow(days * MINUTES_PER_DAY);
const dateFromToday = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateString(date);
};

function buildSeed() {
  const user = (id, codigo, nombre, apellido, email, rol, activo = true) => ({
    id, codigo, nombre, apellido, email, rol, activo, createdAt: daysFromNow(-40 + id),
  });
  const agenda = (id, docenteId, asignaturaId, periodo, actividades, start, end, observaciones, publicada) => ({
    id, docenteId, asignaturaId, periodo, actividades, observaciones, publicada,
    fechaInicio: dateFromToday(start),
    fechaFin: dateFromToday(end),
    createdAt: daysFromNow(-5),
    updatedAt: daysFromNow(-5),
  });
  const auditEntry = (id, usuarioId, accion, tablaAfectada, descripcion, days) => ({
    id, usuarioId, accion, tablaAfectada, registroId: null, descripcion, fecha: daysFromNow(-days),
  });

  return {
    config: { escuela: 'C.E.B.G Aminta Martínez' },
    usuarios: [
      user(1, 'SA-001', 'Laura', 'Mendoza', 'superadmin@nova.edu', 'SUPERADMIN'),
      user(2, 'ADM-001', 'Carlos', 'Rojas', 'admin@nova.edu', 'ADMIN'),
      user(3, 'ADM-002', 'Marta', 'Quintero', 'marta.quintero@nova.edu', 'ADMIN'),
      user(4, 'DOC-001', 'Andrés', 'Villarreal', 'andres.villarreal@nova.edu', 'DOCENTE'),
      user(5, 'DOC-002', 'Sofía', 'Castillo', 'sofia.castillo@nova.edu', 'DOCENTE'),
      user(6, 'DOC-003', 'Ricardo', 'Batista', 'ricardo.batista@nova.edu', 'DOCENTE'),
      user(7, 'EST-001', 'Valentina', 'Pérez', 'valentina.perez@nova.edu', 'ESTUDIANTE'),
      user(8, 'EST-002', 'Mateo', 'Gómez', 'mateo.gomez@nova.edu', 'ESTUDIANTE'),
      user(9, 'EST-003', 'Isabella', 'Chen', 'isabella.chen@nova.edu', 'ESTUDIANTE'),
      user(10, 'EST-004', 'Daniel', 'Herrera', 'daniel.herrera@nova.edu', 'ESTUDIANTE'),
      user(11, 'EST-005', 'Camila', 'Araúz', 'camila.arauz@nova.edu', 'ESTUDIANTE'),
      user(12, 'EST-006', 'Gabriel', 'Ortiz', 'gabriel.ortiz@nova.edu', 'ESTUDIANTE', false),
    ],
    grupos: [
      { id: 1, nombre: '10°A', activo: true },
      { id: 2, nombre: '10°B', activo: true },
      { id: 3, nombre: '11°A', activo: true },
    ],
    asignaturas: [
      { id: 1, nombre: 'Matemáticas', descripcion: 'Álgebra, geometría y trigonometría', activo: true },
      { id: 2, nombre: 'Español', descripcion: 'Lengua y literatura', activo: true },
      { id: 3, nombre: 'Ciencias naturales', descripcion: 'Biología, química y física', activo: true },
      { id: 4, nombre: 'Inglés', descripcion: 'Comunicación en segundo idioma', activo: true },
      { id: 5, nombre: 'Historia', descripcion: 'Historia de Panamá y universal', activo: false },
    ],
    docentesGrupos: [
      { docenteId: 4, grupoId: 1 }, { docenteId: 4, grupoId: 2 },
      { docenteId: 5, grupoId: 2 }, { docenteId: 5, grupoId: 3 },
      { docenteId: 6, grupoId: 1 }, { docenteId: 6, grupoId: 3 },
    ],
    docentesAsignaturas: [
      { docenteId: 4, asignaturaId: 1 },
      { docenteId: 5, asignaturaId: 2 }, { docenteId: 5, asignaturaId: 3 },
      { docenteId: 6, asignaturaId: 4 },
    ],
    estudiantesGrupos: [
      { estudianteId: 7, grupoId: 1 }, { estudianteId: 8, grupoId: 1 },
      { estudianteId: 9, grupoId: 2 }, { estudianteId: 10, grupoId: 2 },
      { estudianteId: 11, grupoId: 3 }, { estudianteId: 12, grupoId: 3 },
    ],
    agendas: [
      agenda(1, 4, 1, 'SEMANAL', 'Lunes: repaso de ecuaciones lineales.\nMiércoles: taller en parejas.\nViernes: quiz corto de 20 minutos.', -1, 5, 'Traer calculadora y cuaderno cuadriculado.', true),
      agenda(2, 5, 2, 'QUINCENAL', 'Lectura del cuento asignado y resumen de una página.\nDebate en clase sobre el final.', -3, 11, null, true),
      agenda(3, 4, 1, 'SEMANAL', 'Introducción a funciones.', 6, 12, 'Borrador pendiente de revisar.', false),
      agenda(4, 6, 4, 'SEMANAL', 'Práctica oral: presentación personal de 2 minutos.', 0, 4, 'Dirigida a estudiantes que necesitan refuerzo.', true),
      agenda(5, 5, 3, 'QUINCENAL', 'Informe del laboratorio de la quincena anterior.', -20, -6, null, true),
      agenda(6, 6, 4, 'SEMANAL', 'Vocabulario de la unidad 3 y ejercicios del libro.', -14, -8, null, true),
      agenda(7, 4, 1, 'SEMANAL', 'Repaso general para la evaluación.', 8, 12, 'Se confirmará la fecha exacta en clase.', true),
    ],
    agendasGrupos: [
      { agendaId: 1, grupoId: 1 }, { agendaId: 2, grupoId: 2 }, { agendaId: 2, grupoId: 3 },
      { agendaId: 3, grupoId: 2 }, { agendaId: 5, grupoId: 3 }, { agendaId: 6, grupoId: 1 },
      { agendaId: 7, grupoId: 1 },
    ],
    agendasEstudiantes: [{ agendaId: 4, estudianteId: 7 }],
    anuncios: [
      { id: 1, autorId: 2, titulo: 'Reunión de padres de familia', contenido: 'La reunión del segundo trimestre será el viernes a las 6:00 p. m. en el auditorio.', publicado: true, fechaCreacion: daysFromNow(-4), fechaPublicacion: daysFromNow(-4), fechaRetiro: null },
      { id: 2, autorId: 2, titulo: 'Feria de ciencias', contenido: 'Las inscripciones de proyectos abren la próxima semana.', publicado: false, fechaCreacion: daysFromNow(-1), fechaPublicacion: null, fechaRetiro: null },
      { id: 3, autorId: 3, titulo: 'Jornada de limpieza', contenido: 'La jornada ya se realizó. Gracias a todos por participar.', publicado: true, fechaCreacion: daysFromNow(-10), fechaPublicacion: daysFromNow(-10), fechaRetiro: dateFromToday(-2) },
      { id: 4, autorId: 2, titulo: 'Uniforme de educación física', contenido: 'A partir del lunes se usará el uniforme completo en las clases de educación física.\nGracias por su colaboración.', publicado: true, fechaCreacion: daysFromNow(-1), fechaPublicacion: daysFromNow(-1), fechaRetiro: dateFromToday(10) },
    ],
    conversaciones: [
      { id: 1, createdAt: minutesFromNow(-180), updatedAt: minutesFromNow(-149) },
      { id: 2, createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1) },
    ],
    conversacionesUsuarios: [
      { conversacionId: 1, usuarioId: 4 }, { conversacionId: 1, usuarioId: 7 },
      { conversacionId: 2, usuarioId: 4 }, { conversacionId: 2, usuarioId: 5 },
    ],
    mensajes: [
      { id: 1, conversacionId: 1, remitenteId: 7, contenido: 'Profesor Villarreal, ¿el quiz del viernes incluye el tema de hoy?', createdAt: minutesFromNow(-180) },
      { id: 2, conversacionId: 1, remitenteId: 4, contenido: 'Hola Valentina. No, el quiz cubre solo ecuaciones lineales.', createdAt: minutesFromNow(-150) },
      { id: 3, conversacionId: 1, remitenteId: 4, contenido: 'Revisa también los ejercicios del 5 al 10 de la guía.', createdAt: minutesFromNow(-149) },
      { id: 4, conversacionId: 2, remitenteId: 5, contenido: 'Andrés, ¿coordinamos la feria de ciencias con 10°B?', createdAt: daysFromNow(-1) },
    ],
    mensajesLectura: [
      { mensajeId: 1, usuarioId: 4, leidoAt: minutesFromNow(-170) },
      { mensajeId: 2, usuarioId: 7, leidoAt: minutesFromNow(-140) },
      { mensajeId: 3, usuarioId: 7, leidoAt: null },
      { mensajeId: 4, usuarioId: 4, leidoAt: null },
    ],
    notificaciones: [
      { id: 1, usuarioId: 7, tipo: 'AGENDA', titulo: 'Nueva agenda de Matemáticas', mensaje: 'Andrés Villarreal publicó una agenda semanal.', leida: false, createdAt: daysFromNow(-1) },
      { id: 2, usuarioId: 7, tipo: 'ANUNCIO', titulo: 'Reunión de padres de familia', mensaje: 'Hay un nuevo anuncio en el portal.', leida: true, createdAt: daysFromNow(-4) },
      { id: 3, usuarioId: 7, tipo: 'ANUNCIO', titulo: 'Uniforme de educación física', mensaje: 'Hay un nuevo anuncio en el portal.', leida: false, createdAt: daysFromNow(-1) },
      { id: 4, usuarioId: 4, tipo: 'ANUNCIO', titulo: 'Uniforme de educación física', mensaje: 'Hay un nuevo anuncio en el portal.', leida: false, createdAt: daysFromNow(-1) },
    ],
    // Newest first, like the entries added by logAction.
    bitacora: [
      auditEntry(5, 2, 'CREAR', 'anuncios', 'anuncio: Feria de ciencias', 1),
      auditEntry(4, 2, 'DESACTIVAR', 'usuarios', 'estudiante: Gabriel Ortiz', 1.5),
      auditEntry(3, 1, 'CREAR', 'usuarios', 'administrador: Marta Quintero', 2),
      auditEntry(2, 2, 'EDITAR', 'usuarios', 'docente: Sofía Castillo', 3),
      auditEntry(1, 2, 'CREAR', 'anuncios', 'anuncio: Reunión de padres de familia', 4),
    ],
  };
}

function loadDb() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.usuarios && stored?.mensajesLectura) return stored;
  } catch {
    /* no previous data, or storage unavailable */
  }
  return buildSeed();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage unavailable: the data lives only in memory */
  }
}

export const db = loadDb();

// Tiny store so React components re-render after every change (see hooks/useDbVersion.js).
const listeners = new Set();
let version = 0;

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getVersion = () => version;

export function commit() {
  persist();
  version += 1;
  listeners.forEach((listener) => listener());
}

export const nextId = (table) => Math.max(0, ...db[table].map((row) => row.id)) + 1;

// Does not commit: the caller commits once after all its changes.
export function logAction(userId, accion, tablaAfectada, descripcion, registroId = null) {
  db.bitacora.unshift({
    id: nextId('bitacora'), usuarioId: userId, accion, tablaAfectada, registroId, descripcion,
    fecha: new Date().toISOString(),
  });
  db.bitacora.splice(MAX_LOG_ENTRIES);
}

export function resetDb() {
  Object.keys(db).forEach((key) => delete db[key]);
  Object.assign(db, buildSeed());
  commit();
}