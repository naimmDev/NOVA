import { db, commit, nextId, logAction } from './mockDb';
import { NOT_ALLOWED, isAdmin } from './permissions';
import { getFullName } from '../utils/formatters';

const MAX_GROUP_NAME_LENGTH = 30;
const byName = (a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true });

export async function listGroups() {
  return db.grupos
    .map((group) => {
      const teacherIds = db.docentesGrupos.filter((row) => row.grupoId === group.id).map((row) => row.docenteId);
      const studentIds = db.estudiantesGrupos.filter((row) => row.grupoId === group.id).map((row) => row.estudianteId);
      const agendaCount = db.agendasGrupos.filter((row) => row.grupoId === group.id).length;
      return {
        ...group,
        teacherNames: db.usuarios.filter((user) => teacherIds.includes(user.id)).map((user) => getFullName(user)),
        studentCount: db.usuarios.filter((user) => user.activo && studentIds.includes(user.id)).length,
        // A group in use cannot be deleted: it can only be deactivated.
        isInUse: teacherIds.length + studentIds.length + agendaCount > 0,
      };
    })
    .sort(byName);
}

export function saveGroup(admin, values, groupId = null) {
  if (!isAdmin(admin)) return { error: NOT_ALLOWED };
  const existing = groupId ? db.grupos.find((group) => group.id === groupId) : null;
  if (groupId && !existing) return { error: 'No se encontró el grupo.' };

  const nombre = values.nombre.trim();
  if (!nombre) return { error: 'Escribe el nombre del grupo.' };
  if (nombre.length > MAX_GROUP_NAME_LENGTH) return { error: `El nombre admite hasta ${MAX_GROUP_NAME_LENGTH} caracteres.` };
  if (db.grupos.some((group) => group.nombre.toLowerCase() === nombre.toLowerCase() && group.id !== existing?.id)) {
    return { error: 'Ya existe un grupo con ese nombre.' };
  }

  const group = existing ?? { id: nextId('grupos') };
  Object.assign(group, { nombre, activo: Boolean(values.activo) });
  if (!existing) db.grupos.push(group);
  logAction(admin.id, existing ? 'EDITAR' : 'CREAR', 'grupos', `grupo: ${nombre}`, group.id);
  commit();
  return { ok: true };
}

export function setGroupActive(admin, groupId, activo) {
  if (!isAdmin(admin)) return { error: NOT_ALLOWED };
  const group = db.grupos.find((item) => item.id === groupId);
  if (!group) return { error: 'No se encontró el grupo.' };
  if (group.activo === activo) return { ok: true };
  group.activo = activo;
  logAction(admin.id, activo ? 'ACTIVAR' : 'DESACTIVAR', 'grupos', `grupo: ${group.nombre}`, group.id);
  commit();
  return { ok: true };
}

export function deleteGroup(admin, groupId) {
  if (!isAdmin(admin)) return { error: NOT_ALLOWED };
  const group = db.grupos.find((item) => item.id === groupId);
  if (!group) return { error: 'No se encontró el grupo.' };
  const inUse =
    db.docentesGrupos.some((row) => row.grupoId === groupId) ||
    db.estudiantesGrupos.some((row) => row.grupoId === groupId) ||
    db.agendasGrupos.some((row) => row.grupoId === groupId);
  if (inUse) return { error: 'El grupo tiene docentes, estudiantes o agendas asociados. Desactívalo en su lugar.' };

  db.grupos = db.grupos.filter((item) => item.id !== groupId);
  logAction(admin.id, 'ELIMINAR', 'grupos', `grupo: ${group.nombre}`, groupId);
  commit();
  return { ok: true };
}