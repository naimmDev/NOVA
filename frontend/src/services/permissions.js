export const NOT_ALLOWED = 'No tienes permiso para realizar esta acción.';

// Which account roles each role can create and edit.
const MANAGED_ROLES = {
  ADMIN: ['DOCENTE', 'ESTUDIANTE'],
  SUPERADMIN: ['ADMIN'],
};

export const isAdmin = (actor) => actor?.rol === 'ADMIN';

export const canManageRole = (actor, role) => (MANAGED_ROLES[actor?.rol] ?? []).includes(role);

// Activating/deactivating: the SuperAdmin can do it for anyone but themselves and other SuperAdmins.
export function canToggleUser(actor, target) {
  if (!actor || actor.id === target.id) return false;
  if (actor.rol === 'SUPERADMIN') return target.rol !== 'SUPERADMIN';
  return canManageRole(actor, target.rol);
}

// REMINDER: these checks only improve the UI. The real barrier is the backend,
// which must verify the role of the logged-in user on every endpoint (RNF-02).