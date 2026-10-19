import Chips from '../../components/Chips';
import CrudPage from '../../components/CrudPage';
import PersonCell from '../../components/PersonCell';
import { ActiveStatusBadge } from '../../components/StatusBadge';
import { useAsyncData } from '../../hooks/useAsyncData';
import { canToggleUser } from '../../services/permissions';
import {
  MIN_PASSWORD_LENGTH,
  getAssignmentCatalog,
  listUsers,
  saveUser,
  setUserActive,
} from '../../services/userAdminService';
import { formatLocalDate, getFullName } from '../../utils/formatters';
import { useAuth } from '../auth/AuthContext';

const ROLE_CONFIG = {
  DOCENTE: {
    title: 'Docentes',
    singular: 'docente',
    personLabel: 'Docente',
    createdText: 'Docente creado',
    description: 'Registra a los docentes y asígnales los grupos y asignaturas que atienden.',
    groupLabel: 'Grupos que atiende',
    subjectLabel: 'Asignaturas que imparte',
    extraColumns: [
      { label: 'Grupos', render: (row) => <Chips items={row.groupNames} /> },
      { label: 'Asignaturas', render: (row) => <Chips items={row.subjectNames} /> },
    ],
  },
  ESTUDIANTE: {
    title: 'Estudiantes',
    singular: 'estudiante',
    personLabel: 'Estudiante',
    createdText: 'Estudiante creado',
    description: 'Matricula a los estudiantes y colócalos en su grupo.',
    groupLabel: 'Grupo',
    groupHint: 'Normalmente un estudiante pertenece a un solo grupo.',
    extraColumns: [{ label: 'Grupo', render: (row) => <Chips items={row.groupNames} /> }],
  },
  ADMIN: {
    title: 'Administradores',
    singular: 'administrador',
    personLabel: 'Administrador',
    createdText: 'Administrador creado',
    description: 'Crea y controla las cuentas del personal administrativo de la escuela.',
    extraColumns: [{ label: 'Creado', render: (row) => formatLocalDate(row.createdAt) }],
  },
};

const DEFAULT_VALUES = {
  nombre: '', apellido: '', email: '', password: '', groupIds: [], subjectIds: [], activo: true,
};

const toFormValues = (row) => ({
  nombre: row.nombre,
  apellido: row.apellido,
  email: row.email,
  password: '',
  groupIds: row.groupIds,
  subjectIds: row.subjectIds,
  activo: row.activo,
});

// Active items, plus the ones already selected (so an inactive group is not silently dropped on edit).
const buildOptions = (items = [], selectedIds = []) =>
  items
    .filter((item) => item.activo || selectedIds.includes(item.id))
    .map((item) => ({ value: item.id, label: item.activo ? item.nombre : `${item.nombre} (inactivo)` }));

function UsersPage({ role }) {
  const config = ROLE_CONFIG[role];
  const { user: actor } = useAuth();
  const { data: catalog } = useAsyncData(getAssignmentCatalog);

  const getFields = (isNew) => [
    { key: 'nombre', label: 'Nombre', required: true, maxLength: 60 },
    { key: 'apellido', label: 'Apellido', required: true, maxLength: 60 },
    { key: 'email', label: 'Correo electrónico', type: 'email', required: true, wide: true },
    {
      key: 'password',
      label: 'Contraseña',
      type: 'password',
      required: 'create',
      wide: true,
      hint: isNew
        ? `Contraseña inicial, mínimo ${MIN_PASSWORD_LENGTH} caracteres.`
        : 'Déjala vacía para conservar la actual.',
    },
    ...(config.groupLabel ? [{
      key: 'groupIds',
      label: config.groupLabel,
      type: 'multi',
      wide: true,
      hint: config.groupHint,
      options: (values) => buildOptions(catalog?.groups, values.groupIds),
    }] : []),
    ...(config.subjectLabel ? [{
      key: 'subjectIds',
      label: config.subjectLabel,
      type: 'multi',
      wide: true,
      options: (values) => buildOptions(catalog?.subjects, values.subjectIds),
    }] : []),
    { key: 'activo', label: 'Estado', type: 'checkbox', text: 'Cuenta activa', wide: true },
  ];

  const columns = [
    { label: 'Código', render: (row) => <code>{row.codigo}</code> },
    { label: config.personLabel, render: (row) => <PersonCell user={row} /> },
    ...config.extraColumns,
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
      title={config.title}
      description={config.description}
      singular={config.singular}
      createLabel={`Nuevo ${config.singular}`}
      createdText={config.createdText}
      load={() => listUsers([role])}
      columns={columns}
      searchText={(row) => `${getFullName(row)} ${row.email} ${row.codigo}`}
      getFields={getFields}
      defaults={DEFAULT_VALUES}
      getInitialValues={toFormValues}
      onSave={(values, row) => saveUser(actor, role, values, row?.id ?? null)}
      describeRow={getFullName}
    />
  );
}

export const TeachersPage = () => <UsersPage role="DOCENTE" />;
export const StudentsPage = () => <UsersPage role="ESTUDIANTE" />;
export const AdminsPage = () => <UsersPage role="ADMIN" />;