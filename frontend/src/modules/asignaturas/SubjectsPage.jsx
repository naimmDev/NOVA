import Chips from '../../components/Chips';
import CrudPage from '../../components/CrudPage';
import { ActiveStatusBadge } from '../../components/StatusBadge';
import { deleteSubject, listSubjects, saveSubject, setSubjectActive } from '../../services/subjectService';
import { useAuth } from '../auth/AuthContext';

const FIELDS = [
  { key: 'nombre', label: 'Nombre de la asignatura', required: true, wide: true, maxLength: 60 },
  { key: 'descripcion', label: 'Descripción', type: 'textarea', rows: 3, wide: true, maxLength: 200 },
  { key: 'activo', label: 'Estado', type: 'checkbox', text: 'Asignatura activa', wide: true },
];

export default function SubjectsPage() {
  const { user } = useAuth();

  const columns = [
    { label: 'Asignatura', render: (row) => <b>{row.nombre}</b> },
    { label: 'Descripción', render: (row) => row.descripcion || '—' },
    { label: 'Docentes', render: (row) => <Chips items={row.teacherNames} /> },
    {
      label: 'Estado',
      render: (row, { run }) => (
        <ActiveStatusBadge
          active={row.activo}
          onToggle={() => run(() => setSubjectActive(user, row.id, !row.activo), 'Estado actualizado')}
        />
      ),
    },
  ];

  return (
    <CrudPage
      title="Asignaturas"
      description="Define las materias que se dictan en la escuela."
      singular="asignatura"
      createLabel="Nueva asignatura"
      createdText="Asignatura creada"
      deletedText="Asignatura eliminada"
      load={listSubjects}
      columns={columns}
      searchText={(row) => `${row.nombre} ${row.descripcion ?? ''} ${row.teacherNames.join(' ')}`}
      getFields={() => FIELDS}
      defaults={{ nombre: '', descripcion: '', activo: true }}
      getInitialValues={(row) => ({ nombre: row.nombre, descripcion: row.descripcion ?? '', activo: row.activo })}
      onSave={(values, row) => saveSubject(user, values, row?.id ?? null)}
      canDelete={(row) => !row.isInUse}
      onDelete={(row) => deleteSubject(user, row.id)}
    />
  );
}