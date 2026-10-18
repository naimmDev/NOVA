import { db, commit, nextId } from './mockDb';
import {
  getGroupIdsForUser,
  getStudentsInGroups,
  getTeachersInGroups,
  getUserById,
} from './userService';

const MAX_MESSAGE_LENGTH = 2000;

const isParticipant = (conversationId, userId) =>
  db.conversacionesUsuarios.some((row) => row.conversacionId === conversationId && row.usuarioId === userId);

const getConversationMessageIds = (conversationId) =>
  new Set(db.mensajes.filter((message) => message.conversacionId === conversationId).map((message) => message.id));

/*
  "Authorized users" rule (RF-12), pending team confirmation:
  - students can write to the teachers of their groups;
  - teachers can write to the students and the teachers of their groups.
  Changing the rule only requires editing this function.
*/
export function getAllowedContacts(user) {
  const groupIds = getGroupIdsForUser(user);
  const candidates =
    user.rol === 'ESTUDIANTE'
      ? getTeachersInGroups(groupIds)
      : user.rol === 'DOCENTE'
        ? [...getStudentsInGroups(groupIds), ...getTeachersInGroups(groupIds)]
        : [];
  const uniqueContacts = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  uniqueContacts.delete(user.id);
  return [...uniqueContacts.values()];
}

export function getConversationsForUser(userId) {
  const conversationIds = db.conversacionesUsuarios
    .filter((row) => row.usuarioId === userId)
    .map((row) => row.conversacionId);

  return db.conversaciones
    .filter((conversation) => conversationIds.includes(conversation.id))
    .map((conversation) => {
      const otherId = db.conversacionesUsuarios.find(
        (row) => row.conversacionId === conversation.id && row.usuarioId !== userId,
      )?.usuarioId;
      const messageIds = getConversationMessageIds(conversation.id);
      const messages = db.mensajes.filter((message) => message.conversacionId === conversation.id);
      const unreadCount = db.mensajesLectura.filter(
        (row) => row.usuarioId === userId && !row.leidoAt && messageIds.has(row.mensajeId),
      ).length;
      return {
        id: conversation.id,
        participant: getUserById(otherId),
        lastMessage: messages.at(-1) ?? null,
        unreadCount,
        updatedAt: conversation.updatedAt,
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getMessages(conversationId, userId) {
  if (!isParticipant(conversationId, userId)) return [];
  return db.mensajes
    .filter((message) => message.conversacionId === conversationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function sendMessage({ conversationId, senderId, contenido }) {
  const text = String(contenido ?? '').trim();
  if (!text) return { error: 'Escribe un mensaje antes de enviarlo.' };
  if (text.length > MAX_MESSAGE_LENGTH) return { error: `El mensaje admite hasta ${MAX_MESSAGE_LENGTH} caracteres.` };
  if (!isParticipant(conversationId, senderId)) return { error: 'No participas en esta conversación.' };

  const now = new Date().toISOString();
  const message = { id: nextId('mensajes'), conversacionId: conversationId, remitenteId: senderId, contenido: text, createdAt: now };
  db.mensajes.push(message);
  db.conversacionesUsuarios
    .filter((row) => row.conversacionId === conversationId && row.usuarioId !== senderId)
    .forEach((row) => db.mensajesLectura.push({ mensajeId: message.id, usuarioId: row.usuarioId, leidoAt: null }));
  db.conversaciones.find((conversation) => conversation.id === conversationId).updatedAt = now;
  commit();
  return { ok: true };
}

export function markConversationRead(conversationId, userId) {
  const messageIds = getConversationMessageIds(conversationId);
  const readAt = new Date().toISOString();
  let changed = false;
  db.mensajesLectura.forEach((row) => {
    if (row.usuarioId === userId && !row.leidoAt && messageIds.has(row.mensajeId)) {
      row.leidoAt = readAt;
      changed = true;
    }
  });
  if (changed) commit();
}

export function findOrCreateConversation(user, contactId) {
  if (!getAllowedContacts(user).some((contact) => contact.id === contactId)) {
    return { error: 'No puedes escribirle a este usuario.' };
  }
  const existing = db.conversaciones.find(
    (conversation) => isParticipant(conversation.id, user.id) && isParticipant(conversation.id, contactId),
  );
  if (existing) return { conversationId: existing.id };

  const now = new Date().toISOString();
  const conversation = { id: nextId('conversaciones'), createdAt: now, updatedAt: now };
  db.conversaciones.push(conversation);
  db.conversacionesUsuarios.push(
    { conversacionId: conversation.id, usuarioId: user.id },
    { conversacionId: conversation.id, usuarioId: contactId },
  );
  commit();
  return { conversationId: conversation.id };
}

export const getUnreadMessageCount = (userId) =>
  db.mensajesLectura.filter((row) => row.usuarioId === userId && !row.leidoAt).length;