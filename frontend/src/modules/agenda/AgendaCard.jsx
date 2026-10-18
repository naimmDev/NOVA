import { getAgendaTiming } from '../../services/agendaService';
import { PERIOD_LABELS, formatDate, getFullName } from '../../utils/formatters';

const TIMING_BADGES = {
  CURRENT: { label: 'Vigente', className: 'ok' },
  UPCOMING: { label: 'Próxima', className: 'info' },
  PAST: { label: 'Finalizada', className: 'off' },
};

export default function AgendaCard({ agenda, showTeacher = false, showStatus = false, actions }) {
  const timing = TIMING_BADGES[getAgendaTiming(agenda)];
  return (
    <article className="agenda-card">
      <header>
        <span className="chip">{agenda.asignatura?.nombre ?? 'Asignatura'}</span>
        <span className="badge info">{PERIOD_LABELS[agenda.periodo]}</span>
        <span className={`badge ${timing.className}`}>{timing.label}</span>
        {showStatus && (
          <span className={`badge ${agenda.publicada ? 'ok' : 'off'}`}>
            {agenda.publicada ? 'Publicada' : 'Borrador'}
          </span>
        )}
      </header>
      <p className="dates">
        {formatDate(agenda.fechaInicio)} – {formatDate(agenda.fechaFin)}
        {showTeacher && ` · ${getFullName(agenda.docente)}`}
      </p>
      <p className="text">{agenda.actividades}</p>
      {agenda.observaciones && <p className="notes">{agenda.observaciones}</p>}
      {actions && <footer>{actions}</footer>}
    </article>
  );
}