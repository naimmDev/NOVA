import { useState } from 'react';
import AgendaCard from './AgendaCard';
import AgendaFormModal from './AgendaFormModal';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import SearchBox from '../../components/SearchBox';
import { useToast } from '../../components/ToastProvider';
import { useDbVersion } from '../../hooks/useDbVersion';
import { deleteAgenda, getAgendasForTeacher, setAgendaPublished } from '../../services/agendaService';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../auth/AuthContext';

const TABS = [
  { id: 'ALL', label: 'Todas', matches: () => true },
  { id: 'PUBLISHED', label: 'Publicadas', matches: (agenda) => agenda.publicada },
  { id: 'DRAFT', label: 'Borradores', matches: (agenda) => !agenda.publicada },
];

export default function TeacherAgendaPage() {
  useDbVersion();
  const { user } = useAuth();
  const showToast = useToast();
  const [tab, setTab] = useState('ALL');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new, object = edit
  const [deleting, setDeleting] = useState(null);

  const agendas = getAgendasForTeacher(user.id);
  const text = query.trim().toLowerCase();
  const activeTab = TABS.find((item) => item.id === tab);
  const visible = agendas.filter(
    (agenda) =>
      activeTab.matches(agenda) &&
      (!text || `${agenda.actividades} ${agenda.observaciones ?? ''} ${agenda.asignatura?.nombre ?? ''}`.toLowerCase().includes(text)),
  );

  const handleSaved = (isNew) => {
    setEditing(undefined);
    showToast(isNew ? 'Agenda creada' : 'Cambios guardados');
  };

  const handleTogglePublished = (agenda) => {
    const result = setAgendaPublished(user, agenda.id, !agenda.publicada);
    showToast(result.error ?? (agenda.publicada ? 'Agenda retirada' : 'Agenda publicada'));
  };

  const handleDelete = () => {
    const result = deleteAgenda(user, deleting.id);
    setDeleting(null);
    showToast(result.error ?? 'Agenda eliminada');
  };

  return (
    <>
      <PageHeader
        title="Mis agendas"
        description="Crea agendas semanales o quincenales y publícalas para tus grupos o estudiantes."
        action={<button type="button" className="btn primary" onClick={() => setEditing(null)}><Icon name="plus" /> Nueva agenda</button>}
      />
      <div className="card">
        <div className="toolbar">
          <div className="tabs">
            {TABS.map((item) => (
              <button key={item.id} type="button" className={item.id === tab ? 'on' : ''} onClick={() => setTab(item.id)}>{item.label}</button>
            ))}
          </div>
          <SearchBox value={query} onChange={setQuery} placeholder="Buscar en mis agendas" />
        </div>
        {visible.length ? (
          <div className="agenda-grid">
            {visible.map((agenda) => (
              <AgendaCard
                key={agenda.id}
                agenda={agenda}
                showStatus
                actions={
                  <>
                    <button type="button" className="btn ghost sm" onClick={() => handleTogglePublished(agenda)}>
                      {agenda.publicada ? 'Retirar' : 'Publicar'}
                    </button>
                    <span className="grow" />
                    <button type="button" className="icon-btn" title="Editar" aria-label="Editar" onClick={() => setEditing(agenda)}><Icon name="edit" /></button>
                    <button type="button" className="icon-btn danger" title="Eliminar" aria-label="Eliminar" onClick={() => setDeleting(agenda)}><Icon name="trash" /></button>
                  </>
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState title={query ? 'Sin resultados' : 'Aún no hay agendas'}>
            {query ? 'Prueba con otra búsqueda.' : 'Crea la primera con el botón «Nueva agenda».'}
          </EmptyState>
        )}
        <div className="foot">{visible.length} {visible.length === 1 ? 'agenda' : 'agendas'}</div>
      </div>

      {editing !== undefined && (
        <AgendaFormModal teacher={user} agenda={editing} onClose={() => setEditing(undefined)} onSaved={handleSaved} />
      )}
      {deleting && (
        <Modal
          title="Eliminar agenda"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <button type="button" className="btn ghost" onClick={() => setDeleting(null)}>Cancelar</button>
              <button type="button" className="btn danger" onClick={handleDelete}>Eliminar</button>
            </>
          }
        >
          <p>¿Eliminar la agenda del <strong>{formatDate(deleting.fechaInicio)}</strong>? Los estudiantes dejarán de verla y no se puede deshacer.</p>
        </Modal>
      )}
    </>
  );
}