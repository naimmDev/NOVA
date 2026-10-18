import { db, commit, nextId, logAction } from './mockDb';
import { NOT_ALLOWED, isAdmin } from './permissions';
import { getFullName } from '../utils/formatters';

const MAX_SUBJECT_NAME_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 200;
const byName = (a, b) => a.nombre.localeCompare(b.nombre, 'es');

export async function listSubjects() {
  return db.asignaturas
    .map((subject) => {
      const teacherIds = db.docentesAsignaturas.filter((row) => row.asignaturaId === subject.id).map((row) => row.docenteId);
      const agendaCount = db.agendas.filter((agenda) => agenda.asignaturaId === subject.id).length;
      return {
        ...subject,
        teacherNames: db.usuarios.filter((user) => teacherIds.includes(user.id)).map((user) => getFullName(user)),
        // A subject in use cannot be deleted: it can only be deactivated.
        isInUse: teacherIds.length + agendaCount > 0,
      };
    })
    .sort(byName);
}

export function saveSubject(admin, values, subjectId = null) {
  if (!isAdmin(admin)) return { error: NOT_ALLOWED };
  const existing = subjectId ? db.asignaturas.find((subject) => subject.id === subjectId) : null;
  if (subjectId && !existing) return { error: 'No se encontró la asignatura.' };

  const nombre = values.nombre.trim();
  const descripcion = values.descripcion.trim();
  if (!nombre) return { error: 'Escribe el nombre de la asignatura.' };
  if (nombre.length > MAX_SUBJECT_NAME_LENGTH) return { error: `El nombre admite hasta ${MAX_SUBJECT_NAME_LENGTH} caracteres.` };
  if (descripcion.length > MAX_DESCRIPTION_LENGTH) return { error: `La descripción admite hasta ${MAX_DESCRIPTION_LENGTH} caracteres.` };
  if (db.asignaturas.some((subject) => subject.nombre.toLowerCase() === nombre.toLowerCase() && subject.id !== existing?.id)) {
    return { error: 'Ya existe una asignatura con ese nombre.' };
  }

  const subject = existing ?? { id: nextId('asignaturas') };
  Object.assign(subject, { nombre, descripcion: descripcion || null, activo: Boolean(values.activo) });
  if (!existing) db.asignaturas.push(subject);
  logAction(admin.id, existing ? 'EDITAR' : 'CREAR', 'asignaturas', `asignatura: ${nombre}`, subject.id);
  commit();
  return { ok: true };
}

export function setSubjectActive(admin, subjectId, activo) {
  if (!isAdmin(admin)) return { error: NOT_ALLOWED };
  const subject = db.asignaturas.find((item) => item.id === subjectId);
  if (!subject) return { error: 'No se encontró la asignatura.' };
  if (subject.activo === activo) return { ok: true };
  subject.activo = activo;
  logAction(admin.id, activo ? 'ACTIVAR' : 'DESACTIVAR', 'asignaturas', `asignatura: ${subject.nombre}`, subject.id);
  commit();
  return { ok: true };
}

export function deleteSubject(admin, subjectId) {
  if (!isAdmin(admin)) return { error: NOT_ALLOWED };
  const subject = db.asignaturas.find((item) => item.id === subjectId);
  if (!subject) return { error: 'No se encontró la asignatura.' };
  const inUse =
    db.docentesAsignaturas.some((row) => row.asignaturaId === subjectId) ||
    db.agendas.some((agenda) => agenda.asignaturaId === subjectId);
  if (inUse) return { error: 'La asignatura tiene docentes o agendas asociados. Desactívala en su lugar.' };

  db.asignaturas = db.asignaturas.filter((item) => item.id !== subjectId);
  logAction(admin.id, 'ELIMINAR', 'asignaturas', `asignatura: ${subject.nombre}`, subjectId);
  commit();
  return { ok: true };
}