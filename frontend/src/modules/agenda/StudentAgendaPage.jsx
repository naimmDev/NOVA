import { useState } from 'react';
import AgendaCard from './AgendaCard';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import SearchBox from '../../components/SearchBox';
import FormField from '../../components/FormField';
import { useDbVersion } from '../../hooks/useDbVersion';
import { getAgendaTiming, getAgendasForStudent } from '../../services/agendaService';
import { PERIOD_LABELS, toDateOnly } from '../../utils/formatters';
import { useAuth } from '../auth/AuthContext';

const TABS = [
  { id: 'ALL', label: 'Todas' },
  { id: 'CURRENT', label: 'Vigentes' },
  { id: 'UPCOMING', label: 'Próximas' },
  { id: 'PAST', label: 'Anteriores' },
];

export default function StudentAgendaPage() {
  useDbVersion();
  const { user } = useAuth();
  const [tab, setTab] = useState('ALL');
  const [query, setQuery] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [period, setPeriod] = useState('');
  const [day, setDay] = useState('');

  const agendas = getAgendasForStudent(user);
  const subjects = [...new Map(agendas.map((agenda) => [agenda.asignatura?.id, agenda.asignatura])).values()]
    .filter(Boolean);
  const text = query.trim().toLowerCase();

  const visible = agendas.filter((agenda) => {
    if (tab !== 'ALL' && getAgendaTiming(agenda) !== tab) return false;
    if (subjectId && agenda.asignaturaId !== Number(subjectId)) return false;
    if (period && agenda.periodo !== period) return false;
    if (day && !(toDateOnly(agenda.fechaInicio) <= day && day <= toDateOnly(agenda.fechaFin))) return false;
    return !text || `${agenda.actividades} ${agenda.observaciones ?? ''} ${agenda.asignatura?.nombre ?? ''}`.toLowerCase().includes(text);
  });

  return (
    <>
      <PageHeader title="Mi agenda" description="Las actividades que tus docentes publicaron para ti, por período y fecha." />
      <div className="card">
        <div className="toolbar">
          <div className="tabs">
            {TABS.map((item) => (
              <button key={item.id} type="button" className={item.id === tab ? 'on' : ''} onClick={() => setTab(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          <SearchBox value={query} onChange={setQuery} placeholder="Buscar en mi agenda" />
        </div>
        <div className="filters">
          <FormField label="Asignatura" htmlFor="filter-subject">
            <select id="filter-subject" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
              <option value="">Todas</option>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.nombre}</option>)}
            </select>
          </FormField>
          <FormField label="Período" htmlFor="filter-period">
            <select id="filter-period" value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="">Todos</option>
              {Object.entries(PERIOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </FormField>
          <FormField label="Ver un día" htmlFor="filter-day">
            <input id="filter-day" type="date" value={day} onChange={(event) => setDay(event.target.value)} />
          </FormField>
          {day && <button type="button" className="btn ghost sm" onClick={() => setDay('')}>Quitar fecha</button>}
        </div>
        {visible.length ? (
          <div className="agenda-grid">
            {visible.map((agenda) => <AgendaCard key={agenda.id} agenda={agenda} showTeacher />)}
          </div>
        ) : (
          <EmptyState title={agendas.length ? 'Sin resultados' : 'Aún no tienes agendas'}>
            {agendas.length ? 'Prueba con otros filtros.' : 'Cuando un docente publique una agenda para ti, aparecerá aquí.'}
          </EmptyState>
        )}
        <div className="foot">{visible.length} {visible.length === 1 ? 'agenda' : 'agendas'}</div>
      </div>
    </>
  );
}