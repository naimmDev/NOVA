import { db } from './mockDb';
import { getUserById } from './userService';

const byDateDesc = (a, b) => b.fecha.localeCompare(a.fecha);
const toAuditRow = (entry) => ({ ...entry, usuario: getUserById(entry.usuarioId) });

export async function listAuditLog() {
  return [...db.bitacora].sort(byDateDesc).map(toAuditRow);
}

export async function getRecentActivity(limit = 6) {
  return [...db.bitacora].sort(byDateDesc).slice(0, limit).map(toAuditRow);
}