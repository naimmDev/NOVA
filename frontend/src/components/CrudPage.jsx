import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import EmptyState from './EmptyState';
import EntityFormModal from './EntityFormModal';
import Icon from './Icon';
import PageHeader from './PageHeader';
import SearchBox from './SearchBox';
import { useToast } from './ToastProvider';
import { useAsyncData } from '../hooks/useAsyncData';

const PAGE_SIZE = 15;

/*
  Generic management page: table + tabs + search + pagination + create/edit modal + delete.
  - load(): async function that returns the rows (each with a numeric `id`).
  - columns: [{ label, render(row, { run }) }]. `run(action, successText)` runs a service call,
    shows its message and reloads the table (used by the status toggles).
  - tabs: [{ label, matches(row) }] (optional).
  - getFields(isNew, row) + defaults + getInitialValues(row) + onSave(values, row): the form.
  - canCreate / canEdit: set to false for read-only tables.
  - onDelete(row) + canDelete(row): the delete button (optional).
*/
export default function CrudPage({
  title,
  description,
  singular,
  createLabel,
  createdText,
  deletedText = 'Registro eliminado',
  load,
  columns,
  tabs,
  searchText,
  canCreate = true,
  canEdit = true,
  getFields,
  defaults,
  getInitialValues = (row) => row,
  onSave,
  canDelete,
  onDelete,
  describeRow = (row) => row.titulo ?? row.nombre ?? `#${row.id}`,
}) {
  const showToast = useToast();
  const { data, loading, error, reload } = useAsyncData(load);
  const [tabIndex, setTabIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new, object = edit
  const [deleting, setDeleting] = useState(null);

  const text = query.trim().toLowerCase();
  const rows = (data ?? []).filter(
    (row) => (!tabs || tabs[tabIndex].matches(row)) && (!text || searchText(row).toLowerCase().includes(text)),
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasActions = canEdit || Boolean(onDelete);

  const run = async (action, successText) => {
    const result = await action();
    if (result?.error) {
      showToast(result.error);
    } else {
      if (successText) showToast(successText);
      reload();
    }
    return result;
  };

  const handleSubmit = async (values) => {
    const result = await onSave(values, editing);
    if (result?.error) return result;
    const wasNew = editing === null;
    setEditing(undefined);
    showToast(wasNew ? createdText : 'Cambios guardados');
    reload();
    return result;
  };

  const handleDelete = () => {
    const target = deleting;
    setDeleting(null);
    run(() => onDelete(target), deletedText);
  };

  const selectTab = (index) => {
    setTabIndex(index);
    setPage(1);
  };

  const handleSearch = (value) => {
    setQuery(value);
    setPage(1);
  };

  const renderBody = () => {
    if (error && !data) return <div className="alert composer-alert" role="alert">{error}</div>;
    if (loading && !data) return <EmptyState title="Cargando…" />;
    if (!rows.length) {
      return (
        <EmptyState title={query ? 'Sin resultados' : `Aún no hay ${title.toLowerCase()}`}>
          {query ? 'Prueba con otra búsqueda.' : canCreate ? `Crea el primero con el botón «${createLabel}».` : null}
        </EmptyState>
      );
    }
    return (
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => <th key={column.label}>{column.label}</th>)}
              {hasActions && <th className="r">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => <td key={column.label}>{column.render(row, { run })}</td>)}
                {hasActions && (
                  <td className="r">
                    {canEdit && (
                      <button type="button" className="icon-btn" title="Editar" aria-label={`Editar ${describeRow(row)}`}
                        onClick={() => setEditing(row)}>
                        <Icon name="edit" />
                      </button>
                    )}
                    {onDelete && (!canDelete || canDelete(row)) && (
                      <button type="button" className="icon-btn danger" title="Eliminar" aria-label={`Eliminar ${describeRow(row)}`}
                        onClick={() => setDeleting(row)}>
                        <Icon name="trash" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={canCreate && (
          <button type="button" className="btn primary" onClick={() => setEditing(null)}>
            <Icon name="plus" /> {createLabel}
          </button>
        )}
      />
      <div className="card">
        <div className="toolbar">
          {tabs ? (
            <div className="tabs">
              {tabs.map((tab, index) => (
                <button key={tab.label} type="button" className={index === tabIndex ? 'on' : ''}
                  aria-pressed={index === tabIndex} onClick={() => selectTab(index)}>
                  {tab.label}
                </button>
              ))}
            </div>
          ) : <span />}
          <SearchBox value={query} onChange={handleSearch} placeholder={`Buscar en ${title.toLowerCase()}`} />
        </div>
        {renderBody()}
        <div className={`foot${pageCount > 1 ? ' with-pager' : ''}`}>
          <span>{rows.length} {rows.length === 1 ? 'registro' : 'registros'}</span>
          {pageCount > 1 && (
            <div className="pager">
              <button type="button" className="btn ghost sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</button>
              <span>Página {currentPage} de {pageCount}</span>
              <button type="button" className="btn ghost sm" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Siguiente</button>
            </div>
          )}
        </div>
      </div>

      {editing !== undefined && (
        <EntityFormModal
          title={editing ? `Editar ${singular}` : `Nuevo ${singular}`}
          fields={getFields(editing === null, editing)}
          initialValues={editing ? getInitialValues(editing) : defaults}
          isNew={editing === null}
          submitLabel={editing ? 'Guardar cambios' : 'Crear'}
          onSubmit={handleSubmit}
          onClose={() => setEditing(undefined)}
        />
      )}
      {deleting && (
        <ConfirmModal title={`Eliminar ${singular}`} onConfirm={handleDelete} onClose={() => setDeleting(null)}>
          <p>¿Eliminar <strong>{describeRow(deleting)}</strong>? Esta acción no se puede deshacer.</p>
        </ConfirmModal>
      )}
    </>
  );
}