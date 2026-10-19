import { db, commit, nextId, logAction } from './mockDb';
import { createNotifications } from './notificationService';
import { NOT_ALLOWED, isAdmin } from './permissions';
import { getUserById } from './userService';
import { getTodayString, toDateOnly } from '../utils/formatters';

const MAX_TITLE_LENGTH = 120;
const MAX_CONTENT_LENGTH = 2000;
const NOTIFIED_ROLES = ['DOCENTE', 'ESTUDIANTE'];

// DRAFT: not published. EXPIRED: published but its withdrawal date has arrived. ACTIVE: visible.
export function getAnnouncementStatus(announcement, today = getTodayString()) {
  if (!announcement.publicado) return 'DRAFT';
  if (announcement.fechaRetiro && toDateOnly(announcement.fechaRetiro) <= today) return 'EXPIRED';
  return 'ACTIVE';
}

export const isAnnouncementActive = (announcement, today = getTodayString()) =>
  getAnnouncementStatus(announcement, today) === 'ACTIVE';

/* ---------- Students and teachers (read only) ---------- */

export const getActiveAnnouncements = () =>
  db.anuncios
    .filter((announcement) => isAnnouncementActive(announcement))
    .map((announcement) => ({ ...announcement, autor: getUserById(announcement.autorId) }))
    .sort((a, b) => String(b.fechaPublicacion).localeCompare(String(a.fechaPublicacion)));

/* ---------- Administrators ---------- */

export async function listAnnouncementsForAdmin() {
  return db.anuncios
    .map((announcement) => ({
      ...announcement,
      status: getAnnouncementStatus(announcement),
      autor: getUserById(announcement.autorId),
    }))
    .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
}

// Does not commit: the caller commits once after all its changes.
function notifyPublication(announcement) {
  const recipientIds = db.usuarios
    .filter((user) => user.activo && NOTIFIED_ROLES.includes(user.rol))
    .map((user) => user.id);
  createNotifications(recipientIds, 'ANUNCIO', announcement.titulo, 'Hay un nuevo anuncio en el portal.');
}

export function saveAnnouncement(admin, values, announcementId = null) {
  if (!isAdmin(admin)) return { error: NOT_ALLOWED };
  const existing = announcementId ? db.anuncios.find((item) => item.id === announcementId) : null;
  if (announcementId && !existing) return { error: 'No se encontró el anuncio.' };

  const titulo = values.titulo.trim();
  const contenido = values.contenido.trim();
  const fechaRetiro = values.fechaRetiro ? toDateOnly(values.fechaRetiro) : null;
  if (!titulo) return { error: 'Escribe el título del anuncio.' };
  if (!contenido) return { error: 'Escribe el contenido del anuncio.' };
  if (titulo.length > MAX_TITLE_LENGTH) return { error: `El título admite hasta ${MAX_TITLE_LENGTH} caracteres.` };
  if (contenido.length > MAX_CONTENT_LENGTH) return { error: `El contenido admite hasta ${MAX_CONTENT_LENGTH} caracteres.` };

  // The withdrawal date must be in the future when publishing or when it was just changed.
  const dateChanged = fechaRetiro !== (toDateOnly(existing?.fechaRetiro) || null);
  if (fechaRetiro && fechaRetiro <= getTodayString() && (values.publicado || dateChanged)) {
    return { error: 'La fecha de retiro debe ser posterior a hoy.' };
  }

  const now = new Date().toISOString();
  const wasPublished = existing?.publicado ?? false;
  const announcement = existing ?? {
    id: nextId('anuncios'),
    autorId: admin.id,
    fechaCreacion: now,
    fechaPublicacion: null,
  };
  Object.assign(announcement, { titulo, contenido, fechaRetiro, publicado: Boolean(values.publicado) });
  const justPublished = announcement.publicado && !wasPublished;
  if (justPublished) {
    announcement.fechaPublicacion = now;
    notifyPublication(announcement);
  }
  if (!existing) db.anuncios.push(announcement);

  logAction(admin.id, existing ? 'EDITAR' : 'CREAR', 'anuncios', `anuncio: ${titulo}`, announcement.id);
  if (existing && justPublished) logAction(admin.id, 'PUBLICAR', 'anuncios', `anuncio: ${titulo}`, announcement.id);
  commit();
  return { ok: true };
}

export function setAnnouncementPublished(admin, announcementId, publicado) {
  if (!isAdmin(admin)) return { error: NOT_ALLOWED };
  const announcement = db.anuncios.find((item) => item.id === announcementId);
  if (!announcement) return { error: 'No se encontró el anuncio.' };
  if (announcement.publicado === publicado) return { ok: true };
  if (publicado && announcement.fechaRetiro && toDateOnly(announcement.fechaRetiro) <= getTodayString()) {
    return { error: 'La fecha de retiro ya pasó. Edita el anuncio y cambia la fecha antes de publicarlo.' };
  }

  announcement.publicado = publicado;
  if (publicado) {
    announcement.fechaPublicacion = new Date().toISOString();
    notifyPublication(announcement);
  }
  logAction(admin.id, publicado ? 'PUBLICAR' : 'DESPUBLICAR', 'anuncios', `anuncio: ${announcement.titulo}`, announcement.id);
  commit();
  return { ok: true };
}

// Only drafts can be deleted (RF-10 asks to "withdraw", not to delete, published announcements).
export function deleteAnnouncement(admin, announcementId) {
  if (!isAdmin(admin)) return { error: NOT_ALLOWED };
  const announcement = db.anuncios.find((item) => item.id === announcementId);
  if (!announcement) return { error: 'No se encontró el anuncio.' };
  if (announcement.publicado) return { error: 'Retira el anuncio antes de eliminarlo.' };

  db.anuncios = db.anuncios.filter((item) => item.id !== announcementId);
  logAction(admin.id, 'ELIMINAR', 'anuncios', `anuncio: ${announcement.titulo}`, announcementId);
  commit();
  return { ok: true };
}