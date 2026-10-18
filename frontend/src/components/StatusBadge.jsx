// tone: 'ok' | 'off' | 'warn' | 'info'. With `onToggle` it becomes a button that changes the state.
export default function StatusBadge({ label, tone, onToggle, actionLabel = 'Clic para cambiar el estado' }) {
  const className = `badge ${tone}`;
  if (!onToggle) return <span className={className}>{label}</span>;
  return (
    <button
      type="button"
      className={`${className} tgl`}
      onClick={onToggle}
      title={actionLabel}
      aria-label={`${label}. ${actionLabel}`}
    >
      {label}
    </button>
  );
}

export function ActiveStatusBadge({ active, onToggle }) {
  return (
    <StatusBadge
      tone={active ? 'ok' : 'off'}
      label={active ? 'Activo' : 'Inactivo'}
      actionLabel={active ? 'Clic para desactivar' : 'Clic para activar'}
      onToggle={onToggle}
    />
  );
}