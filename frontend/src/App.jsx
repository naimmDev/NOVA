import { ToastProvider } from './components/ToastProvider';
import { AuthProvider, useAuth } from './modules/auth/AuthContext';
import LoginPage from './modules/auth/LoginPage';
import PendingRoleView from './modules/auth/PendingRoleView';
import AdminPortal from './modules/home/AdminPortal';
import StudentPortal from './modules/home/StudentPortal';
import SuperAdminPortal from './modules/home/SuperAdminPortal';
import TeacherPortal from './modules/home/TeacherPortal';

const PORTALS = {
  SUPERADMIN: SuperAdminPortal,
  ADMIN: AdminPortal,
  DOCENTE: TeacherPortal,
  ESTUDIANTE: StudentPortal,
};

function AppRoutes() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  const Portal = PORTALS[user.rol] ?? PendingRoleView;
  return <Portal />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}