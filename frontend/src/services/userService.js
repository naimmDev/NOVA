import { db, commit, logAction } from './mockDb';

const MAX_NAME_LENGTH = 60;

export const getSchoolName = () => db.config.escuela;

export const getUserById = (id) => db.usuarios.find((user) => user.id === id) ?? null;

export function getGroupIdsForUser(user) {
  if (user.rol === 'DOCENTE') {
    return db.docentesGrupos.filter((row) => row.docenteId === user.id).map((row) => row.grupoId);
  }
  if (user.rol === 'ESTUDIANTE') {
    return db.estudiantesGrupos.filter((row) => row.estudianteId === user.id).map((row) => row.grupoId);
  }
  return [];
}

export function getGroupsForUser(user) {
  const groupIds = getGroupIdsForUser(user);
  return db.grupos.filter((group) => group.activo && groupIds.includes(group.id));
}

export function getSubjectsForTeacher(teacherId) {
  const subjectIds = db.docentesAsignaturas
    .filter((row) => row.docenteId === teacherId)
    .map((row) => row.asignaturaId);
  return db.asignaturas.filter((subject) => subject.activo && subjectIds.includes(subject.id));
}

export function getStudentsInGroups(groupIds) {
  const studentIds = db.estudiantesGrupos
    .filter((row) => groupIds.includes(row.grupoId))
    .map((row) => row.estudianteId);
  return db.usuarios.filter((user) => user.activo && studentIds.includes(user.id));
}

export function getTeachersInGroups(groupIds) {
  const teacherIds = db.docentesGrupos
    .filter((row) => groupIds.includes(row.grupoId))
    .map((row) => row.docenteId);
  return db.usuarios.filter((user) => user.activo && teacherIds.includes(user.id));
}

export function updateOwnProfile(userId, { nombre, apellido }) {
  const user = getUserById(userId);
  const newName = nombre.trim();
  const newLastName = apellido.trim();
  if (!user) return { error: 'No se encontró tu cuenta.' };
  if (!newName || !newLastName) return { error: 'Completa tu nombre y tu apellido.' };
  if (newName.length > MAX_NAME_LENGTH || newLastName.length > MAX_NAME_LENGTH) {
    return { error: `El nombre y el apellido admiten hasta ${MAX_NAME_LENGTH} caracteres.` };
  }
  user.nombre = newName;
  user.apellido = newLastName;
  logAction(user.id, 'EDITAR', 'usuarios', 'Actualizó su perfil', user.id);
  commit();
  return { ok: true };
}