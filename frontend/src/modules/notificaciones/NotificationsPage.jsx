import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import PageHeader from '../../components/PageHeader';
import { useDbVersion } from '../../hooks/useDbVersion';
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notificationService';
import { timeAgo } from '../../utils/formatters';
import { useAuth } from '../auth/AuthContext';

const TYPE_CONFIG = {
  AGENDA: { icon: 'calendar', target: '#agenda' },
  ANUNCIO: { icon: 'bell', target: '#announcements' },
  MENSAJE: { icon: 'message', target: '#messages' },
};

export default function NotificationsPage() {
  useDbVersion();
  const { user } = useAuth();
  const notifications = getNotificationsForUser(user.id);
  const unreadCount = getUnreadNotificationCount(user.id);

  return (
    <>
      <PageHeader
        title="Notificaciones"
        description="Avisos sobre nuevas agendas, anuncios y mensajes."
        action={unreadCount > 0 && (
          <button type="button" className="btn ghost" onClick={() => markAllNotificationsRead(user.id)}>Marcar todas como leídas</button>
        )}
      />
      <div className="card">
        {notifications.length ? (
          <ul className="notif-list">
            {notifications.map((notification) => {
              const config = TYPE_CONFIG[notification.tipo];
              return (
                <li key={notification.id}>
                  <a href={config.target} className={`notif${notification.leida ? '' : ' new'}`} onClick={() => markNotificationRead(notification.id, user.id)}>
                    <span className="ico"><Icon name={config.icon} /></span>
                    <span className="info">
                      <b>{notification.titulo}</b>
                      <span>{notification.mensaje}</span>
                      <small>{timeAgo(notification.createdAt)}</small>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="No tienes notificaciones">Te avisaremos aquí cuando haya novedades.</EmptyState>
        )}
      </div>
    </>
  );
}