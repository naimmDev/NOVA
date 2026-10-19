import { useEffect, useRef, useState } from 'react';
import NewConversationModal from './NewConversationModal';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import PageHeader from '../../components/PageHeader';
import SearchBox from '../../components/SearchBox';
import { useDbVersion } from '../../hooks/useDbVersion';
import {
  findOrCreateConversation,
  getConversationsForUser,
  getMessages,
  markConversationRead,
  sendMessage,
} from '../../services/messageService';
import { ROLE_LABELS, formatTime, getFullName, getInitials, timeAgo } from '../../utils/formatters';
import { useAuth } from '../auth/AuthContext';

export default function MessagesPage() {
  useDbVersion();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const threadRef = useRef(null);

  const text = query.trim().toLowerCase();
  const conversations = getConversationsForUser(user.id).filter(
    (conversation) => !text || getFullName(conversation.participant).toLowerCase().includes(text),
  );
  const selected = getConversationsForUser(user.id).find((conversation) => conversation.id === selectedId) ?? null;
  const messages = selected ? getMessages(selected.id, user.id) : [];

  // Opening a conversation marks its messages as read (RF-13).
  useEffect(() => {
    if (selectedId) markConversationRead(selectedId, user.id);
  }, [selectedId, user.id]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [selectedId, messages.length]);

  const selectConversation = (id) => {
    setSelectedId(id);
    setError('');
    setDraft('');
  };

  const handleSend = () => {
    const result = sendMessage({ conversationId: selected.id, senderId: user.id, contenido: draft });
    if (result.error) setError(result.error);
    else {
      setDraft('');
      setError('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSelectContact = (contactId) => {
    const result = findOrCreateConversation(user, contactId);
    setNewOpen(false);
    if (result.conversationId) selectConversation(result.conversationId);
  };

  return (
    <>
      <PageHeader title="Mensajes" description="Conversa con las personas con las que puedes comunicarte en la escuela." />
      <div className={`card msg-layout${selected ? ' open' : ''}`}>
        <div className="convo-pane">
          <div className="convo-head">
            <button type="button" className="btn primary sm" onClick={() => setNewOpen(true)}><Icon name="plus" /> Nuevo mensaje</button>
            <SearchBox value={query} onChange={setQuery} placeholder="Buscar conversaciones" />
          </div>
          <div className="convo-list">
            {conversations.length ? conversations.map((conversation) => (
              <button key={conversation.id} type="button" className={`convo${conversation.id === selectedId ? ' on' : ''}`} onClick={() => selectConversation(conversation.id)}>
                <span className="avatar sm">{getInitials(conversation.participant)}</span>
                <span className="info">
                  <b>{getFullName(conversation.participant)}</b>
                  <small>{conversation.lastMessage?.contenido ?? 'Sin mensajes'}</small>
                </span>
                <span className="meta">
                  {conversation.lastMessage && <span>{timeAgo(conversation.lastMessage.createdAt)}</span>}
                  {conversation.unreadCount > 0 && <span className="unread">{conversation.unreadCount}</span>}
                </span>
              </button>
            )) : <EmptyState title={query ? 'Sin resultados' : 'Aún no hay conversaciones'}>{!query && 'Empieza una con «Nuevo mensaje».'}</EmptyState>}
          </div>
        </div>

        <div className="thread-pane">
          {selected ? (
            <>
              <div className="thread-head">
                <button type="button" className="icon-btn back-btn" onClick={() => setSelectedId(null)} aria-label="Volver a las conversaciones"><Icon name="back" /></button>
                <span className="avatar sm">{getInitials(selected.participant)}</span>
                <div>
                  <b>{getFullName(selected.participant)}</b>
                  <small className="muted"> · {ROLE_LABELS[selected.participant?.rol]}</small>
                </div>
              </div>
              <div className="thread" ref={threadRef}>
                {messages.map((message) => (
                  <div key={message.id} className={`bubble${message.remitenteId === user.id ? ' mine' : ''}`}>
                    {message.contenido}
                    <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
                  </div>
                ))}
              </div>
              {error && <div className="alert composer-alert" role="alert">{error}</div>}
              <div className="composer">
                <textarea rows="2" value={draft} placeholder="Escribe un mensaje…" aria-label="Mensaje"
                  onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} />
                <button type="button" className="btn primary" onClick={handleSend}><Icon name="send" /> Enviar</button>
              </div>
            </>
          ) : (
            <EmptyState title="Selecciona una conversación">O empieza una nueva con «Nuevo mensaje».</EmptyState>
          )}
        </div>
      </div>
      {newOpen && <NewConversationModal user={user} onClose={() => setNewOpen(false)} onSelect={handleSelectContact} />}
    </>
  );
}