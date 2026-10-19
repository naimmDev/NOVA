import CrudPage from '../../components/CrudPage';
import PersonCell from '../../components/PersonCell';
import RoleBadge from '../../components/RoleBadge';
import { ActiveStatusBadge } from '../../components/StatusBadge';
import { canToggleUser } from '../../services/permissions';
import { listUsers, setUserActive } from '../../services/userAdminService';
import { ROLE_LABELS, getFullName } from '../../utils/formatters';
import { useAuth } from '../auth/AuthContext';

const ALL_ROLES = Object.keys(ROLE_LABELS);

const TABS = [
  { label: 'Todos', matches: () => true },
  { label: 'Administradores', matches: (row) => row.rol === 'ADMIN' },
  { label: 'Docentes', matches: (row) => row.rol === 'DOCENTE' },
  { label: 'Estudiantes', matches: (row) => row.rol === 'ESTUDIANTE' },
];

// SuperAdmin view: every account in the system. Read only, except for activating/deactivating.
export default function AllUsersPage() {
  const { user: actor } = useAuth();

  const columns = [
    { label: 'Código', render: (row) => <code>{row.codigo}</code> },
    { label: 'Usuario', render: (row) => <PersonCell user={row} /> },
    { label: 'Rol', render: (row) => <RoleBadge role={row.rol} /> },
    {
      label: 'Estado',
      render: (row, { run }) => (
        <ActiveStatusBadge
          active={row.activo}
          onToggle={canToggleUser(actor, row)
            ? () => run(() => setUserActive(actor, row.id, !row.activo), 'Estado actualizado')
            : undefined}
        />
      ),
    },
  ];

  return (
    <CrudPage
      title="Usuarios"
      description="Consulta todas las cuentas del sistema. Aquí puedes activar o desactivar cuentas; la edición se hace desde cada rol."
      singular="usuario"
      load={() => listUsers(ALL_ROLES)}
      columns={columns}
      tabs={TABS}
      searchText={(row) => `${getFullName(row)} ${row.email} ${row.codigo}`}
      canCreate={false}
      canEdit={false}
    />
  );
}