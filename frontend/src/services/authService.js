import { db, commit, logAction } from './mockDb';

const SESSION_KEY = 'nova_mock_session';
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
// Only administrative sign-ins are audited (RF-17); logging 600+ students would bury the useful entries.
const AUDITED_ROLES = ['ADMIN', 'SUPERADMIN'];

export function getSessionUserId() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY))?.userId ?? null;
  } catch {
    return null;
  }
}

function startSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
  if (AUDITED_ROLES.includes(user.rol)) {
    logAction(user.id, 'LOGIN', 'usuarios', 'Inicio de sesión', user.id);
  }
  commit();
  return { userId: user.id };
}

function findLoginUser(email) {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) {
    return { error: 'Escribe un correo válido, por ejemplo nombre@nova.edu.' };
  }
  const user = db.usuarios.find((candidate) => candidate.email.toLowerCase() === normalized);
  if (!user) return { error: 'El correo o la contraseña no coinciden. Revísalos e intenta de nuevo.' };
  if (!user.activo) return { error: 'Esta cuenta está inactiva. Pide a un administrador que la active.' };
  return { user };
}

// MOCK: the real backend verifies the password against its hash. Here it is only required to be non-empty.
export function login({ email, password }) {
  if (!password) return { error: 'Escribe tu contraseña.' };
  const found = findLoginUser(email);
  return found.error ? found : startSession(found.user);
}

// MOCK: shortcut for the demo buttons on the login page.
export function loginAsDemo(email) {
  const found = findLoginUser(email);
  return found.error ? found : startSession(found.user);
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}