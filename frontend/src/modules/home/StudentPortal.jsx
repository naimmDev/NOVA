import RolePortal from './RolePortal';
import StudentDashboard from './StudentDashboard';
import StudentAgendaPage from '../agenda/StudentAgendaPage';
import AnnouncementsPage from '../anuncios/AnnouncementsPage';
import MessagesPage from '../mensajeria/MessagesPage';
import NotificationsPage from '../notificaciones/NotificationsPage';
import ProfilePage from '../perfil/ProfilePage';

const SECTIONS = [
  { id: 'home', label: 'Inicio', icon: 'home' },
  { id: 'agenda', label: 'Mi agenda', icon: 'calendar' },
  { id: 'announcements', label: 'Anuncios', icon: 'bell' },
  { id: 'messages', label: 'Mensajes', icon: 'message' },
  { id: 'notifications', label: 'Notificaciones', icon: 'inbox' },
  { id: 'profile', label: 'Mi perfil', icon: 'user' },
];

const PAGES = {
  home: StudentDashboard,
  agenda: StudentAgendaPage,
  announcements: AnnouncementsPage,
  messages: MessagesPage,
  notifications: NotificationsPage,
  profile: ProfilePage,
};

export default function StudentPortal() {
  return <RolePortal roleLabel="Estudiante" sections={SECTIONS} pages={PAGES} />;
}