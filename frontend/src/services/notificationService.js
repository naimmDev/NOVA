import { db, commit } from './mockDb';

// Does not commit: the caller commits once after all its changes.
export function createNotifications(userIds, tipo, titulo, mensaje) {
  const createdAt = new Date().toISOString();
  userIds.forEach((usuarioId) => {
    const id = Math.max(0, ...db.notificaciones.map((row) => row.id)) + 1;
    db.notificaciones.push({ id, usuarioId, tipo, titulo, mensaje, leida: false, createdAt });
  });
}

export const getNotificationsForUser = (userId) =>
  db.notificaciones
    .filter((notification) => notification.usuarioId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const getUnreadNotificationCount = (userId) =>
  db.notificaciones.filter((notification) => notification.usuarioId === userId && !notification.leida).length;

export function markNotificationRead(notificationId, userId) {
  const notification = db.notificaciones.find((row) => row.id === notificationId && row.usuarioId === userId);
  if (!notification || notification.leida) return;
  notification.leida = true;
  commit();
}

export function markAllNotificationsRead(userId) {
  let changed = false;
  db.notificaciones.forEach((notification) => {
    if (notification.usuarioId === userId && !notification.leida) {
      notification.leida = true;
      changed = true;
    }
  });
  if (changed) commit();
}