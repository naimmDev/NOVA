import RolePortal from './RolePortal';
import AdminDashboard from './AdminDashboard';
import AnnouncementsAdminPage from '../anuncios/AnnouncementsAdminPage';
import SubjectsPage from '../asignaturas/SubjectsPage';
import GroupsPage from '../grupos/GroupsPage';
import { StudentsPage, TeachersPage } from '../usuarios/UsersPage';

const SECTIONS = [
  { id: 'home', label: 'Panel', icon: 'home' },
  { id: 'teachers', label: 'Docentes', icon: 'users' },
  { id: 'students', label: 'Estudiantes', icon: 'cap' },
  { id: 'groups', label: 'Grupos', icon: 'layers' },
  { id: 'subjects', label: 'Asignaturas', icon: 'book' },
  { id: 'announcements', label: 'Anuncios', icon: 'bell' },
];

const PAGES = {
  home: AdminDashboard,
  teachers: TeachersPage,
  students: StudentsPage,
  groups: GroupsPage,
  subjects: SubjectsPage,
  announcements: AnnouncementsAdminPage,
};

export default function AdminPortal() {
  return <RolePortal roleLabel="Administración" sections={SECTIONS} pages={PAGES} />;
}