import { db, commit, nextId, logAction } from './mockDb';
import { createNotifications } from './notificationService';
import {
  getGroupIdsForUser,
  getStudentsInGroups,
  getSubjectsForTeacher,
  getUserById,
} from './userService';
import {
  PERIOD_LABELS,
  formatDate,
  getFullName,
  getTodayString,
  toDateOnly,
} from '../utils/formatters';

const PERIODS = Object.keys(PERIOD_LABELS);
const byStartDateDesc = (a, b) => toDateOnly(b.fechaInicio).localeCompare(toDateOnly(a.fechaInicio));

// Adds the related data the screens need (the real API will return it already nested).
const toView = (agenda) => ({
  ...agenda,
  asignatura: db.asignaturas.find((subject) => subject.id === agenda.asignaturaId) ?? null,
  docente: getUserById(agenda.docenteId),
  groupIds: db.agendasGrupos.filter((row) => row.agendaId === agenda.id).map((row) => row.grupoId),
  studentIds: db.agendasEstudiantes.filter((row) => row.agendaId === agenda.id).map((row) => row.estudianteId),
});

export function getAgendaTiming(agenda, today = getTodayString()) {
  if (toDateOnly(agenda.fechaFin) < today) return 'PAST';
  if (toDateOnly(agenda.fechaInicio) > today) return 'UPCOMING';
  return 'CURRENT';
}

// Students only see published agendas addressed to one of their groups or to them directly.
export function getAgendasForStudent(student) {
  const groupIds = getGroupIdsForUser(student);
  return db.agendas
    .filter((agenda) => agenda.publicada)
    .map(toView)
    .filter((agenda) => agenda.studentIds.includes(student.id) || agenda.groupIds.some((id) => groupIds.includes(id)))
    .sort(byStartDateDesc);
}

export const getAgendasForTeacher = (teacherId) =>
  db.agendas.filter((agenda) => agenda.docenteId === teacherId).map(toView).sort(byStartDateDesc);

function getRecipientStudentIds(agendaId) {
  const groupIds = db.agendasGrupos.filter((row) => row.agendaId === agendaId).map((row) => row.grupoId);
  const directIds = db.agendasEstudiantes.filter((row) => row.agendaId === agendaId).map((row) => row.estudianteId);
  return [...new Set([...getStudentsInGroups(groupIds).map((student) => student.id), ...directIds])];
}

function notifyPublication(agenda, teacher) {
  const subject = db.asignaturas.find((item) => item.id === agenda.asignaturaId);
  createNotifications(
    getRecipientStudentIds(agenda.id),
    'AGENDA',
    `Nueva agenda de ${subject?.nombre ?? 'una asignatura'}`,
    `${getFullName(teacher)} publicó una agenda ${PERIOD_LABELS[agenda.periodo].toLowerCase()} del ${formatDate(agenda.fechaInicio)} al ${formatDate(agenda.fechaFin)}.`,
  );
}

function validateValues(teacher, values) {
  if (!values.asignaturaId) return 'Selecciona la asignatura.';
  if (!PERIODS.includes(values.periodo)) return 'Selecciona el período de la agenda.';
  if (!values.fechaInicio || !values.fechaFin) return 'Indica la fecha de inicio y la de fin.';
  if (values.fechaFin < values.fechaInicio) return 'La fecha de fin no puede ser anterior a la de inicio.';
  if (!values.actividades.trim()) return 'Describe las actividades de la agenda.';
  if (!values.groupIds.length && !values.studentIds.length) return 'Elige al menos un grupo o un estudiante destinatario.';

  // Confidentiality: a teacher can only use their own subjects, groups and students.
  const allowedGroupIds = getGroupIdsForUser(teacher);
  const allowedSubjectIds = getSubjectsForTeacher(teacher.id).map((subject) => subject.id);
  const allowedStudentIds = getStudentsInGroups(allowedGroupIds).map((student) => student.id);
  const isAllowed =
    allowedSubjectIds.includes(values.asignaturaId) &&
    values.groupIds.every((id) => allowedGroupIds.includes(id)) &&
    values.studentIds.every((id) => allowedStudentIds.includes(id));
  return isAllowed ? '' : 'No tienes permiso para usar alguna de las opciones elegidas.';
}

export function saveAgenda(teacher, values, agendaId = null) {
  const error = validateValues(teacher, values);
  if (error) return { error };

  const existing = agendaId ? db.agendas.find((agenda) => agenda.id === agendaId && agenda.docenteId === teacher.id) : null;
  if (agendaId && !existing) return { error: 'No se encontró la agenda o no te pertenece.' };

  const now = new Date().toISOString();
  const fields = {
    asignaturaId: values.asignaturaId,
    periodo: values.periodo,
    actividades: values.actividades.trim(),
    fechaInicio: values.fechaInicio,
    fechaFin: values.fechaFin,
    observaciones: values.observaciones.trim() || null,
    publicada: values.publicada,
  };
  const wasPublished = existing?.publicada ?? false;
  const agenda = existing ?? { id: nextId('agendas'), docenteId: teacher.id, createdAt: now };
  Object.assign(agenda, fields, { updatedAt: now });
  if (!existing) db.agendas.push(agenda);

  db.agendasGrupos = db.agendasGrupos.filter((row) => row.agendaId !== agenda.id);
  db.agendasEstudiantes = db.agendasEstudiantes.filter((row) => row.agendaId !== agenda.id);
  values.groupIds.forEach((grupoId) => db.agendasGrupos.push({ agendaId: agenda.id, grupoId }));
  values.studentIds.forEach((estudianteId) => db.agendasEstudiantes.push({ agendaId: agenda.id, estudianteId }));

  if (agenda.publicada && !wasPublished) notifyPublication(agenda, teacher);
  logAction(teacher.id, existing ? 'EDITAR' : 'CREAR', 'agendas', `agenda: ${PERIOD_LABELS[agenda.periodo]} del ${formatDate(agenda.fechaInicio)}`, agenda.id);
  commit();
  return { ok: true, isNew: !existing };
}

export function setAgendaPublished(teacher, agendaId, publicada) {
  const agenda = db.agendas.find((item) => item.id === agendaId && item.docenteId === teacher.id);
  if (!agenda) return { error: 'No se encontró la agenda o no te pertenece.' };
  if (agenda.publicada === publicada) return { ok: true };
  agenda.publicada = publicada;
  agenda.updatedAt = new Date().toISOString();
  if (publicada) notifyPublication(agenda, teacher);
  logAction(teacher.id, publicada ? 'PUBLICAR' : 'DESPUBLICAR', 'agendas', `agenda del ${formatDate(agenda.fechaInicio)}`, agenda.id);
  commit();
  return { ok: true };
}

export function deleteAgenda(teacher, agendaId) {
  const agenda = db.agendas.find((item) => item.id === agendaId && item.docenteId === teacher.id);
  if (!agenda) return { error: 'No se encontró la agenda o no te pertenece.' };
  db.agendas = db.agendas.filter((item) => item.id !== agendaId);
  db.agendasGrupos = db.agendasGrupos.filter((row) => row.agendaId !== agendaId);
  db.agendasEstudiantes = db.agendasEstudiantes.filter((row) => row.agendaId !== agendaId);
  logAction(teacher.id, 'ELIMINAR', 'agendas', `agenda del ${formatDate(agenda.fechaInicio)}`, agendaId);
  commit();
  return { ok: true };
}