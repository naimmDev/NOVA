import BarList from '../../components/BarList';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getAdminOverview } from '../../services/statsService';
import { formatLocalDate } from '../../utils/formatters';

const describeAnnouncement = (announcement) => {
  if (announcement.status === 'DRAFT') return 'Borrador';
  if (announcement.status === 'EXPIRED') return 'Vencido';
  return `Publicado el ${formatLocalDate(announcement.fechaPublicacion)}`;
};

export default function AdminDashboard() {
  const { data, loading, error } = useAsyncData(getAdminOverview);
  if (error && !data) return <div className="alert" role="alert">{error}</div>;
  if (loading && !data) return <EmptyState title="Cargando…" />;

  return (
    <>
      <PageHeader title="Panel de la escuela" description="El estado actual de docentes, estudiantes, grupos y anuncios." />
      <div className="stats">
        <StatCard icon="book" label="Docentes activos" value={data.teachers.active} hint={`${data.teachers.total} registrados`} />
        <StatCard icon="cap" label="Estudiantes activos" value={data.students.active} hint={`${data.students.total} registrados`} />
        <StatCard icon="layers" label="Grupos" value={data.activeGroups} hint="activos este período" />
        <StatCard icon="bell" label="Anuncios publicados" value={data.publishedCount} hint={`${data.draftCount} en borrador`} />
      </div>
      <div className="two">
        <div className="card pad">
          <h3>Estudiantes por grupo</h3>
          <BarList items={data.studentsByGroup} emptyText="Todavía no hay grupos activos." />
        </div>
        <div className="card pad">
          <h3>Anuncios recientes</h3>
          {data.recentAnnouncements.length ? (
            <ul className="feed">
              {data.recentAnnouncements.map((announcement) => (
                <li key={announcement.id}>
                  <span className="dot" />
                  <div>
                    <p>{announcement.titulo}</p>
                    <small>{describeAnnouncement(announcement)}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="muted">Todavía no hay anuncios.</p>}
        </div>
      </div>
    </>
  );
}