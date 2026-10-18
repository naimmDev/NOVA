import CrudPage from '../../components/CrudPage';
import StatusBadge from '../../components/StatusBadge';
import {
  deleteAnnouncement,
  listAnnouncementsForAdmin,
  saveAnnouncement,
  setAnnouncementPublished,
} from '../../services/announcementService';
import { formatDate, formatLocalDate, getFullName, toDateOnly } from '../../utils/formatters';
import { useAuth } from '../auth/AuthContext';

const STATUS_VIEW = {
  ACTIVE: { label: 'Publicado', tone: 'ok' },
  DRAFT: { label: 'Borrador', tone: 'off' },
  EXPIRED: { label: 'Vencido', tone: 'warn' },
};

const TABS = [
  { label: 'Todos', matches: () => true },
  { label: 'Publicados', matches: (row) => row.status === 'ACTIVE' },
  { label: 'Borradores', matches: (row) => row.status === 'DRAFT' },
  { label: 'Vencidos', matches: (row) => row.status === 'EXPIRED' },
];

const FIELDS = [
  { key: 'titulo', label: 'Título', required: true, wide: true, maxLength: 120 },
  { key: 'contenido', label: 'Contenido', type: 'textarea', rows: 5, required: true, wide: true, maxLength: 2000 },
  { key: 'fechaRetiro', label: 'Retirar el', type: 'date', hint: 'Opcional. El anuncio deja de mostrarse en esa fecha.' },
  { key: 'publicado', label: 'Estado', type: 'checkbox', text: 'Publicar ahora' },
];

export default function AnnouncementsAdminPage() {
  const { user } = useAuth();

  const columns = [
    {
      label: 'Anuncio',
      render: (row) => (
        <>
          <b>{row.titulo}</b>
          <span className="snippet">{row.contenido}</span>
        </>
      ),
    },
    {
      label: 'Estado',
      render: (row, { run }) => {
        const view = STATUS_VIEW[row.status];
        const withdraw = row.publicado;
        return (
          <StatusBadge
            tone={view.tone}
            label={view.label}
            actionLabel={withdraw ? 'Clic para retirar' : 'Clic para publicar'}
            onToggle={() => run(
              () => setAnnouncementPublished(user, row.id, !row.publicado),
              withdraw ? 'Anuncio retirado' : 'Anuncio publicado',
            )}
          />
        );
      },
    },
    { label: 'Publicación', render: (row) => formatLocalDate(row.fechaPublicacion) },
    { label: 'Retiro', render: (row) => formatDate(row.fechaRetiro) },
    { label: 'Autor', render: (row) => getFullName(row.autor) },
  ];

  return (
    <CrudPage
      title="Anuncios"
      description="Redacta comunicados para la comunidad escolar y decide cuándo publicarlos."
      singular="anuncio"
      createLabel="Nuevo anuncio"
      createdText="Anuncio creado"
      deletedText="Anuncio eliminado"
      load={listAnnouncementsForAdmin}
      columns={columns}
      tabs={TABS}
      searchText={(row) => `${row.titulo} ${row.contenido}`}
      getFields={() => FIELDS}
      defaults={{ titulo: '', contenido: '', fechaRetiro: '', publicado: false }}
      getInitialValues={(row) => ({
        titulo: row.titulo,
        contenido: row.contenido,
        fechaRetiro: toDateOnly(row.fechaRetiro),
        publicado: row.publicado,
      })}
      onSave={(values, row) => saveAnnouncement(user, values, row?.id ?? null)}
      canDelete={(row) => !row.publicado}
      onDelete={(row) => deleteAnnouncement(user, row.id)}
    />
  );
}