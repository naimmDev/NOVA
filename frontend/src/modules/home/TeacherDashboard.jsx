import Chips from '../../components/Chips';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { useDbVersion } from '../../hooks/useDbVersion';
import { getAgendasForTeacher } from '../../services/agendaService';
import { getActiveAnnouncements } from '../../services/announcementService';
import { getUnreadMessageCount } from '../../services/messageService';
import { getGroupsForUser } from '../../services/userService';
import { PERIOD_LABELS, formatDate, formatLocalDate } from '../../utils/formatters';
import { useAuth } from '../auth/AuthContext';

const MAX_RECENT_ITEMS = 4;

export default function TeacherDashboard() {
  useDbVersion();
  const { user } = useAuth();
  const groups = getGroupsForUser(user).map((group) => group.nombre);
  const agendas = getAgendasForTeacher(user.id);
  const published = agendas.filter((agenda) => agenda.publicada).length;
  const announcements = getActiveAnnouncements();

  return (
    <>
      <PageHeader title={`Hola, ${user.nombre}`} description="El estado de tus agendas y las novedades de la escuela." />
      <div className="stats">
        <StatCard icon="calendar" label="Agendas publicadas" value={published} hint="visibles para estudiantes" />
        <StatCard icon="edit" label="Borradores" value={agendas.length - published} hint="sin publicar" />
        <StatCard icon="layers" label="Grupos que atiendes" value={groups.length} hint="activos este período" />
        <StatCard icon="message" label="Mensajes sin leer" value={getUnreadMessageCount(user.id)} hint="en tus conversaciones" />
      </div>
      <div className="two">
        <div className="card pad">
          <h3>Mis agendas recientes</h3>
          {agendas.length ? (
            <ul className="feed">
              {agendas.slice(0, MAX_RECENT_ITEMS).map((agenda) => (
                <li key={agenda.id}>
                  <span className="dot" />
                  <div>
                    <p>{agenda.asignatura?.nombre} · {PERIOD_LABELS[agenda.periodo]}</p>
                    <small>{formatDate(agenda.fechaInicio)} – {formatDate(agenda.fechaFin)} · {agenda.publicada ? 'Publicada' : 'Borrador'}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="muted">Todavía no has creado agendas.</p>}
          <p className="card-foot"><a className="link" href="#agenda">Gestionar mis agendas</a></p>
        </div>
        <div className="card pad">
          <h3>Mis grupos</h3>
          <Chips items={groups} />
          <h3 className="section-gap">Anuncios recientes</h3>
          {announcements.length ? (
            <ul className="feed">
              {announcements.slice(0, MAX_RECENT_ITEMS).map((announcement) => (
                <li key={announcement.id}>
                  <span className="dot" />
                  <div>
                    <p>{announcement.titulo}</p>
                    <small>Publicado el {formatLocalDate(announcement.fechaPublicacion)}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="muted">No hay anuncios vigentes.</p>}
        </div>
      </div>
    </>
  );
}