import AppShell from '../../components/AppShell';
import { useDbVersion } from '../../hooks/useDbVersion';
import { useHashSection } from '../../hooks/useHashSection';
import { getUnreadMessageCount } from '../../services/messageService';
import { getUnreadNotificationCount } from '../../services/notificationService';
import { useAuth } from '../auth/AuthContext';

// Layout shared by the student and teacher portals: sidebar + the page of the active section.
export default function RolePortal({ roleLabel, sections, pages }) {
  useDbVersion();
  const { user, signOut } = useAuth();
  const activeId = useHashSection(sections);
  const Page = pages[activeId];
  const badges = {
    messages: getUnreadMessageCount(user.id),
    notifications: getUnreadNotificationCount(user.id),
  };

  return (
    <AppShell user={user} roleLabel={roleLabel} sections={sections} activeId={activeId} badges={badges} onSignOut={signOut}>
      <Page />
    </AppShell>
  );
}