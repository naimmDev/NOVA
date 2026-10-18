import { db, commit, nextId, logAction } from './mockDb';
import { NOT_ALLOWED, canManageRole, canToggleUser } from './permissions';
import { getFullName } from '../utils/formatters';

export const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 60;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const CODE_PREFIXES = { ADMIN: 'ADM', DOCENTE: 'DOC', ESTUDIANTE: 'EST' };
const ROLE_NOUNS = {
  SUPERADMIN: 'superadministrador',
  ADMIN: 'administrador',
  DOCENTE: 'docente',
  ESTUDIANTE: 'estudiante',
};

const unique = (ids) => [...new Set(ids ?? [])];
const namesOf = (items, ids) => items.filter((item) => ids.includes(item.id)).map((item) => item.nombre);

// Groups and subjects live in join tables (like the Prisma schema), not inside the user.
function getAssignments(user) {
  if (user.rol === 'DOCENTE') {
    return {
      groupIds: db.docentesGrupos.filter((row) => row.docenteId === user.id).map((row) => row.grupoId),
      subjectIds: db.docentesAsignaturas.filter((row) => row.docenteId === user.id).map((row) => row.asignaturaId),
    };
  }
  if (user.rol === 'ESTUDIANTE') {
    return {
      groupIds: db.estudiantesGrupos.filter((row) => row.estudianteId === user.id).map((row) => row.grupoId),
      subjectIds: [],
    };
  }
  return { groupIds: [], subjectIds: [] };
}

function toRow(user) {
  const { groupIds, subjectIds } = getAssignments(user);
  return {
    ...user,
    groupIds,
    subjectIds,
    groupNames: namesOf(db.grupos, groupIds),
    subjectNames: namesOf(db.asignaturas, subjectIds),
  };
}

function replaceAssignments(user, groupIds, subjectIds) {
  if (user.rol === 'DOCENTE') {
    db.docentesGrupos = db.docentesGrupos.filter((row) => row.docenteId !== user.id);
    db.docentesAsignaturas = db.docentesAsignaturas.filter((row) => row.docenteId !== user.id);
    groupIds.forEach((grupoId) => db.docentesGrupos.push({ docenteId: user.id, grupoId }));
    subjectIds.forEach((asignaturaId) => db.docentesAsignaturas.push({ docenteId: user.id, asignaturaId }));
  } else if (user.rol === 'ESTUDIANTE') {
    db.estudiantesGrupos = db.estudiantesGrupos.filter((row) => row.estudianteId !== user.id);
    groupIds.forEach((grupoId) => db.estudiantesGrupos.push({ estudianteId: user.id, grupoId }));
  }
}

function nextUserCode(prefix) {
  const numbers = db.usuarios
    .filter((user) => user.codigo.startsWith(`${prefix}-`))
    .map((user) => parseInt(user.codigo.split('-')[1], 10) || 0);
  return `${prefix}-${String(Math.max(0, ...numbers) + 1).padStart(3, '0')}`;
}

// New links must point to active items; links that already existed may stay even if inactive.
const hasInvalidLinks = (items, ids, keptIds) =>
  ids.some((id) => {
    const item = items.find((candidate) => candidate.id === id);
    return !item || (!item.activo && !keptIds.includes(id));
  });

function validateUser(role, values, existing, groupIds, subjectIds) {
  const nombre = values.nombre.trim();
  const apellido = values.apellido.trim();
  const email = values.email.trim().toLowerCase();
  const password = values.password ?? '';

  if (!nombre || !apellido) return 'Completa el nombre y el apellido.';
  if (nombre.length > MAX_NAME_LENGTH || apellido.length > MAX_NAME_LENGTH) {
    return `El nombre y el apellido admiten hasta ${MAX_NAME_LENGTH} caracteres.`;
  }
  if (!EMAIL_PATTERN.test(email)) return 'Escribe un correo válido, por ejemplo nombre@nova.edu.';
  if (db.usuarios.some((user) => user.email.toLowerCase() === email && user.id !== existing?.id)) {
    return 'Ya existe un usuario con ese correo.';
  }
  if (!existing && !password) return 'Escribe una contraseña inicial.';
  if (password && password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  const kept = existing ? getAssignments(existing) : { groupIds: [], subjectIds: [] };
  if (hasInvalidLinks(db.grupos, groupIds, kept.groupIds) || hasInvalidLinks(db.asignaturas, subjectIds, kept.subjectIds)) {
    return 'Alguno de los grupos o asignaturas elegidos no está disponible.';
  }
  return '';
}

export async function listUsers(roles) {
  return db.usuarios
    .filter((user) => roles.includes(user.rol))
    .map(toRow)
    .sort((a, b) => a.codigo.localeCompare(b.codigo));
}

// Options for the "groups" and "subjects" fields of the user forms.
export async function getAssignmentCatalog() {
  return {
    groups: db.grupos.map((group) => ({ ...group })),
    subjects: db.asignaturas.map((subject) => ({ ...subject })),
  };
}

export function saveUser(actor, role, values, userId = null) {
  if (!canManageRole(actor, role)) return { error: NOT_ALLOWED };
  const existing = userId ? db.usuarios.find((user) => user.id === userId && user.rol === role) : null;
  if (userId && !existing) return { error: 'No se encontró la cuenta.' };

  const groupIds = role === 'ADMIN' ? [] : unique(values.groupIds);
  const subjectIds = role === 'DOCENTE' ? unique(values.subjectIds) : [];
  const error = validateUser(role, values, existing, groupIds, subjectIds);
  if (error) return { error };

  const now = new Date().toISOString();
  const user = existing ?? {
    id: nextId('usuarios'),
    codigo: nextUserCode(CODE_PREFIXES[role]),
    rol: role,
    createdAt: now,
  };
  Object.assign(user, {
    nombre: values.nombre.trim(),
    apellido: values.apellido.trim(),
    email: values.email.trim().toLowerCase(),
    activo: Boolean(values.activo),
    updatedAt: now,
  });
  // MOCK: values.password is discarded. The real API hashes it and stores passwordHash (RNF-01).
  if (!existing) db.usuarios.push(user);
  replaceAssignments(user, groupIds, subjectIds);

  logAction(actor.id, existing ? 'EDITAR' : 'CREAR', 'usuarios', `${ROLE_NOUNS[role]}: ${getFullName(user)}`, user.id);
  commit();
  return { ok: true };
}

export function setUserActive(actor, userId, activo) {
  const target = db.usuarios.find((user) => user.id === userId);
  if (!target) return { error: 'No se encontró la cuenta.' };
  if (!canToggleUser(actor, target)) return { error: NOT_ALLOWED };
  if (target.activo === activo) return { ok: true };

  target.activo = activo;
  target.updatedAt = new Date().toISOString();
  logAction(actor.id, activo ? 'ACTIVAR' : 'DESACTIVAR', 'usuarios', `${ROLE_NOUNS[target.rol]}: ${getFullName(target)}`, target.id);
  commit();
  return { ok: true };
}