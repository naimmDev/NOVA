import { db } from './mockDb';
import { getAnnouncementStatus } from './announcementService';
import { getRecentActivity } from './auditService';

const MAX_RECENT_ANNOUNCEMENTS = 4;
const RECENT_ACTIVITY_LIMIT = 6;

function countByRole(role) {
  const users = db.usuarios.filter((user) => user.rol === role);
  return { active: users.filter((user) => user.activo).length, total: users.length };
}

export async function getAdminOverview() {
  const announcements = db.anuncios.map((announcement) => ({
    ...announcement,
    status: getAnnouncementStatus(announcement),
  }));
  const activeStudentIds = new Set(
    db.usuarios.filter((user) => user.rol === 'ESTUDIANTE' && user.activo).map((user) => user.id),
  );

  return {
    teachers: countByRole('DOCENTE'),
    students: countByRole('ESTUDIANTE'),
    activeGroups: db.grupos.filter((group) => group.activo).length,
    publishedCount: announcements.filter((item) => item.status === 'ACTIVE').length,
    draftCount: announcements.filter((item) => item.status === 'DRAFT').length,
    studentsByGroup: db.grupos
      .filter((group) => group.activo)
      .map((group) => ({
        label: group.nombre,
        value: db.estudiantesGrupos.filter(
          (row) => row.grupoId === group.id && activeStudentIds.has(row.estudianteId),
        ).length,
      })),
    recentAnnouncements: [...announcements]
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
      .slice(0, MAX_RECENT_ANNOUNCEMENTS),
  };
}

export async function getSuperAdminOverview() {
  return {
    totalAccounts: db.usuarios.length,
    inactiveAccounts: db.usuarios.filter((user) => !user.activo).length,
    admins: countByRole('ADMIN').total,
    teachers: countByRole('DOCENTE').total,
    students: countByRole('ESTUDIANTE').total,
    recentActivity: await getRecentActivity(RECENT_ACTIVITY_LIMIT),
  };
}