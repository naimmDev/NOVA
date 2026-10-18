export const ROLE_LABELS = {
  SUPERADMIN: 'SuperAdmin',
  ADMIN: 'Administrador',
  DOCENTE: 'Docente',
  ESTUDIANTE: 'Estudiante',
};

export const PERIOD_LABELS = { SEMANAL: 'Semanal', QUINCENAL: 'Quincenal' };

const DATE_ONLY_LENGTH = 10;
const pad = (value) => String(value).padStart(2, '0');

// Local "YYYY-MM-DD" string, the same format used by <input type="date">.
export function toDateString(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const getTodayString = () => toDateString();

// Dates may arrive as "YYYY-MM-DD" or as a full ISO string; keep only the day.
export const toDateOnly = (value) => String(value ?? '').slice(0, DATE_ONLY_LENGTH);

// For CALENDAR-DAY fields without a time (fechaInicio, fechaFin, fechaRetiro).
// Uses the day as stored and ignores the timezone, so "2026-10-20T00:00:00.000Z"
// is not shown as October 19 in Panama (UTC-5).
export function formatDate(value) {
  if (!value) return '—';
  return new Date(`${toDateOnly(value)}T12:00:00`).toLocaleDateString('es-PA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// For real TIMESTAMPS (fechaPublicacion, createdAt): the day depends on the local timezone.
export function formatLocalDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-PA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value) {
  return new Date(value).toLocaleString('es-PA', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(value) {
  return new Date(value).toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(value) {
  const minutes = Math.round((Date.now() - new Date(value)) / 60000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `hace ${hours} h` : `hace ${Math.round(hours / 24)} d`;
}

export const getFullName = (user) => (user ? `${user.nombre} ${user.apellido}` : 'Sistema');

export const getInitials = (user) =>
  ((user?.nombre?.[0] ?? '') + (user?.apellido?.[0] ?? '')).toUpperCase();