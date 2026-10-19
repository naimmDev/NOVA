import CrudPage from '../../components/CrudPage';
import { listAuditLog } from '../../services/auditService';
import { formatDateTime, getFullName } from '../../utils/formatters';

const STATE_ACTIONS = ['ACTIVAR', 'DESACTIVAR', 'PUBLICAR', 'DESPUBLICAR'];

const TABS = [
  { label: 'Todo', matches: () => true },
  { label: 'Accesos', matches: (row) => row.accion === 'LOGIN' },
  { label: 'Creaciones', matches: (row) => row.accion === 'CREAR' },
  { label: 'Ediciones', matches: (row) => row.accion === 'EDITAR' },
  { label: 'Cambios de estado', matches: (row) => STATE_ACTIONS.includes(row.accion) },
  { label: 'Eliminaciones', matches: (row) => row.accion === 'ELIMINAR' },
];

const formatAction = (action) => action.charAt(0) + action.slice(1).toLowerCase();

const COLUMNS = [
  { label: 'Fecha', render: (row) => formatDateTime(row.fecha) },
  { label: 'Usuario', render: (row) => getFullName(row.usuario) },
  { label: 'Acción', render: (row) => <span className={`badge act-${row.accion}`}>{formatAction(row.accion)}</span> },
  { label: 'Módulo', render: (row) => row.tablaAfectada },
  { label: 'Detalle', render: (row) => row.descripcion || '—' },
];

export default function AuditLogPage() {
  return (
    <CrudPage
      title="Bitácora"
      description="Historial de quién hizo qué y cuándo, en todo el sistema."
      singular="registro"
      load={listAuditLog}
      columns={COLUMNS}
      tabs={TABS}
      searchText={(row) => `${row.accion} ${row.tablaAfectada} ${row.descripcion ?? ''} ${getFullName(row.usuario)}`}
      canCreate={false}
      canEdit={false}
    />
  );
}