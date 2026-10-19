import Chips from '../../components/Chips';
import CrudPage from '../../components/CrudPage';
import { ActiveStatusBadge } from '../../components/StatusBadge';
import { deleteGroup, listGroups, saveGroup, setGroupActive } from '../../services/groupService';
import { useAuth } from '../auth/AuthContext';

const FIELDS = [
  { key: 'nombre', label: 'Nombre del grupo', required: true, wide: true, maxLength: 30, hint: 'Por ejemplo 10°A o 11°B.' },
  { key: 'activo', label: 'Estado', type: 'checkbox', text: 'Grupo activo', wide: true },
];

export default function GroupsPage() {
  const { user } = useAuth();

  const columns = [
    { label: 'Grupo', render: (row) => <b>{row.nombre}</b> },
    { label: 'Docentes', render: (row) => <Chips items={row.teacherNames} /> },
    { label: 'Estudiantes', render: (row) => row.studentCount },
    {
      label: 'Estado',
      render: (row, { run }) => (
        <ActiveStatusBadge
          active={row.activo}
          onToggle={() => run(() => setGroupActive(user, row.id, !row.activo), 'Estado actualizado')}
        />
      ),
    },
  ];

  return (
    <CrudPage
      title="Grupos"
      description="Organiza los grupos de la escuela, por ejemplo 10°A o 11°B."
      singular="grupo"
      createLabel="Nuevo grupo"
      createdText="Grupo creado"
      deletedText="Grupo eliminado"
      load={listGroups}
      columns={columns}
      searchText={(row) => `${row.nombre} ${row.teacherNames.join(' ')}`}
      getFields={() => FIELDS}
      defaults={{ nombre: '', activo: true }}
      getInitialValues={(row) => ({ nombre: row.nombre, activo: row.activo })}
      onSave={(values, row) => saveGroup(user, values, row?.id ?? null)}
      canDelete={(row) => !row.isInUse}
      onDelete={(row) => deleteGroup(user, row.id)}
    />
  );
}