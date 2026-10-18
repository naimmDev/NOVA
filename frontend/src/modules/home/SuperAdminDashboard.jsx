import ActivityFeed from '../../components/ActivityFeed';
import BarList from '../../components/BarList';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getSuperAdminOverview } from '../../services/statsService';

export default function SuperAdminDashboard() {
  const { data, loading, error } = useAsyncData(getSuperAdminOverview);
  if (error && !data) return <div className="alert" role="alert">{error}</div>;
  if (loading && !data) return <EmptyState title="Cargando…" />;

  const inactive = data.inactiveAccounts;
  return (
    <>
      <PageHeader title="Panel general" description="Un vistazo a todas las cuentas de NOVA y a lo que se ha hecho últimamente." />
      <div className="stats">
        <StatCard icon="users" label="Cuentas en total" value={data.totalAccounts} hint={`${inactive} ${inactive === 1 ? 'inactiva' : 'inactivas'}`} />
        <StatCard icon="shield" label="Administradores" value={data.admins} hint="gestionan la institución" />
        <StatCard icon="book" label="Docentes" value={data.teachers} hint="imparten asignaturas" />
        <StatCard icon="cap" label="Estudiantes" value={data.students} hint="matriculados" />
      </div>
      <div className="two">
        <div className="card pad">
          <h3>Cuentas por rol</h3>
          <BarList
            items={[
              { label: 'Administradores', value: data.admins },
              { label: 'Docentes', value: data.teachers },
              { label: 'Estudiantes', value: data.students },
            ]}
          />
        </div>
        <div className="card pad">
          <h3>Actividad reciente</h3>
          <ActivityFeed items={data.recentActivity} />
        </div>
      </div>
    </>
  );
}