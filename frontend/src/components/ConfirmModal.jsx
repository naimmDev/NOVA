import Modal from './Modal';

export default function ConfirmModal({ title, children, confirmLabel = 'Eliminar', onConfirm, onClose }) {
  const footer = (
    <>
      <button type="button" className="btn ghost" onClick={onClose}>Cancelar</button>
      <button type="button" className="btn danger" onClick={onConfirm}>{confirmLabel}</button>
    </>
  );
  return <Modal title={title} onClose={onClose} footer={footer}>{children}</Modal>;
}