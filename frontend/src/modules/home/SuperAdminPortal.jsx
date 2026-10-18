import RolePortal from './RolePortal';
import SuperAdminDashboard from './SuperAdminDashboard';
import AuditLogPage from '../bitacora/AuditLogPage';
import AllUsersPage from '../usuarios/AllUsersPage';
import { AdminsPage } from '../usuarios/UsersPage';

const SECTIONS = [
  { id: 'home', label: 'Panel general', icon: 'home' },
  { id: 'admins', label: 'Administradores', icon: 'shield' },
  { id: 'users', label: 'Todos los usuarios', icon: 'users' },
  { id: 'audit', label: 'Bitácora', icon: 'clipboard' },
];

const PAGES = {
  home: SuperAdminDashboard,
  admins: AdminsPage,
  users: AllUsersPage,
  audit: AuditLogPage,
};

export default function SuperAdminPortal() {
  return <RolePortal roleLabel="SuperAdmin" sections={SECTIONS} pages={PAGES} />;
}