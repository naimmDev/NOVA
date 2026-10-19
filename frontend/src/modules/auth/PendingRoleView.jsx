import { useAuth } from './AuthContext';
import { ROLE_LABELS } from '../../utils/formatters';

// Shown to roles that do not have a portal yet. Admin and SuperAdmin now have one,
// so this only appears if a user arrives with an unknown role.
export default function PendingRoleView() {
  const { user, signOut } = useAuth();
  return (
    <main className="pending">
      <div className="card pad">
        <h2>Vista en migración</h2>
        <p className="muted">
          Las pantallas del rol {ROLE_LABELS[user.rol] ?? user.rol} todavía no están disponibles.
        </p>
        <button type="button" className="btn primary" onClick={signOut}>Cerrar sesión</button>
      </div>
    </main>
  );
}