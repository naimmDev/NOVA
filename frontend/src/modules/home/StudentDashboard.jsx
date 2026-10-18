import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { useDbVersion } from '../../hooks/useDbVersion';
import { getAgendaTiming, getAgendasForStudent } from '../../services/agendaService';
import { getActiveAnnouncements } from '../../services/announcementService';
import { getUnreadMessageCount } from '../../services/messageService';
import { getUnreadNotificationCount } from '../../services/notificationService';
import { getGroupsForUser } from '../../services/userService';
import { formatDate, formatLocalDate, getFullName } from '../../utils/formatters';
import { useAuth } from '../auth/AuthContext';

const MAX_RECENT_ANNOUNCEMENTS = 3;

export default function StudentDashboard() {
  useDbVersion();
  const { user } = useAuth();
  const groups = getGroupsForUser(user).map((group) => group.nombre);
  const currentAgendas = getAgendasForStudent(user).filter((agenda) => getAgendaTiming(agenda) === 'CURRENT');
  const announcements = getActiveAnnouncements();

  return (
    <>
      <PageHeader
        title={`Hola, ${user.nombre}`}
        description={groups.length ? `Grupo ${groups.join(', ')}` : 'Aún no tienes un grupo asignado.'}
      />
      <div className="stats">
        <StatCard icon="calendar" label="Agendas vigentes" value={currentAgendas.length} hint="en curso hoy" />
        <StatCard icon="bell" label="Anuncios vigentes" value={announcements.length} hint="de la escuela" />
        <StatCard icon="message" label="Mensajes sin leer" value={getUnreadMessageCount(user.id)} hint="en tus conversaciones" />
        <StatCard icon="inbox" label="Notificaciones nuevas" value={getUnreadNotificationCount(user.id)} hint="por revisar" />
      </div>
      <div className="two">
        <div className="card pad">
          <h3>Agendas vigentes</h3>
          {currentAgendas.length ? (
            <ul className="feed">
              {currentAgendas.map((agenda) => (
                <li key={agenda.id}>
                  <span className="dot" />
                  <div>
                    <p>{agenda.asignatura?.nombre} · {getFullName(agenda.docente)}</p>
                    <small>{formatDate(agenda.fechaInicio)} – {formatDate(agenda.fechaFin)}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="muted">No tienes agendas vigentes.</p>}
          <p className="card-foot"><a className="link" href="#agenda">Ver toda mi agenda</a></p>
        </div>
        <div className="card pad">
          <h3>Anuncios recientes</h3>
          {announcements.length ? (
            <ul className="feed">
              {announcements.slice(0, MAX_RECENT_ANNOUNCEMENTS).map((announcement) => (
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
          <p className="card-foot"><a className="link" href="#announcements">Ver todos los anuncios</a></p>
        </div>
      </div>
    </>
  );
}