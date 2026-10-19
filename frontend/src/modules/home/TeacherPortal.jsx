import RolePortal from './RolePortal';
import TeacherDashboard from './TeacherDashboard';
import TeacherAgendaPage from '../agenda/TeacherAgendaPage';
import AnnouncementsPage from '../anuncios/AnnouncementsPage';
import MessagesPage from '../mensajeria/MessagesPage';
import NotificationsPage from '../notificaciones/NotificationsPage';
import ProfilePage from '../perfil/ProfilePage';

const SECTIONS = [
  { id: 'home', label: 'Inicio', icon: 'home' },
  { id: 'agenda', label: 'Mis agendas', icon: 'calendar' },
  { id: 'announcements', label: 'Anuncios', icon: 'bell' },
  { id: 'messages', label: 'Mensajes', icon: 'message' },
  { id: 'notifications', label: 'Notificaciones', icon: 'inbox' },
  { id: 'profile', label: 'Mi perfil', icon: 'user' },
];

const PAGES = {
  home: TeacherDashboard,
  agenda: TeacherAgendaPage,
  announcements: AnnouncementsPage,
  messages: MessagesPage,
  notifications: NotificationsPage,
  profile: ProfilePage,
};

export default function TeacherPortal() {
  return <RolePortal roleLabel="Docente" sections={SECTIONS} pages={PAGES} />;
}