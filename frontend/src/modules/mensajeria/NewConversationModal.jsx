import { useState } from 'react';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import SearchBox from '../../components/SearchBox';
import { getAllowedContacts } from '../../services/messageService';
import { ROLE_LABELS, getFullName, getInitials } from '../../utils/formatters';

export default function NewConversationModal({ user, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const text = query.trim().toLowerCase();
  const contacts = getAllowedContacts(user).filter(
    (contact) => !text || `${getFullName(contact)} ${contact.email}`.toLowerCase().includes(text),
  );

  return (
    <Modal title="Nuevo mensaje" onClose={onClose}>
      <SearchBox value={query} onChange={setQuery} placeholder="Buscar a una persona" />
      <div className="contact-list">
        {contacts.length ? contacts.map((contact) => (
          <button key={contact.id} type="button" className="convo" onClick={() => onSelect(contact.id)}>
            <span className="avatar sm">{getInitials(contact)}</span>
            <span className="info">
              <b>{getFullName(contact)}</b>
              <small>{ROLE_LABELS[contact.rol]} · {contact.email}</small>
            </span>
          </button>
        )) : <EmptyState title="Sin resultados">No hay personas con ese nombre a quienes puedas escribir.</EmptyState>}
      </div>
    </Modal>
  );
}