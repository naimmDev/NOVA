import { useState } from 'react';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import SearchBox from '../../components/SearchBox';
import { useDbVersion } from '../../hooks/useDbVersion';
import { getActiveAnnouncements } from '../../services/announcementService';
import { formatDate, formatLocalDate, getFullName } from '../../utils/formatters';

// Read-only for students and teachers: only administrators create announcements (RF-10).
export default function AnnouncementsPage() {
  useDbVersion();
  const [query, setQuery] = useState('');
  const text = query.trim().toLowerCase();
  const announcements = getActiveAnnouncements().filter(
    (announcement) => !text || `${announcement.titulo} ${announcement.contenido}`.toLowerCase().includes(text),
  );

  return (
    <>
      <PageHeader title="Anuncios" description="Comunicados y avisos vigentes de la escuela." />
      <div className="card">
        <div className="toolbar">
          <span />
          <SearchBox value={query} onChange={setQuery} placeholder="Buscar en anuncios" />
        </div>
        {announcements.length ? (
          <div className="posts">
            {announcements.map((announcement) => (
              <article key={announcement.id} className="post">
                <h3>{announcement.titulo}</h3>
                <p className="meta">
                  Publicado el {formatLocalDate(announcement.fechaPublicacion)} · {getFullName(announcement.autor)}
                  {announcement.fechaRetiro && ` · Vigente hasta el ${formatDate(announcement.fechaRetiro)}`}
                </p>
                <p className="body">{announcement.contenido}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title={query ? 'Sin resultados' : 'No hay anuncios vigentes'}>
            {query ? 'Prueba con otra búsqueda.' : 'Cuando la administración publique uno, lo verás aquí.'}
          </EmptyState>
        )}
        <div className="foot">{announcements.length} {announcements.length === 1 ? 'anuncio' : 'anuncios'}</div>
      </div>
    </>
  );
}