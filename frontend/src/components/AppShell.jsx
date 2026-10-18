import { useEffect, useState } from 'react';
import Icon from './Icon';
import { getSchoolName } from '../services/userService';
import { ROLE_LABELS, getFullName, getInitials } from '../utils/formatters';

export default function AppShell({ user, roleLabel, sections, activeId, badges = {}, onSignOut, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeSection = sections.find((section) => section.id === activeId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeId]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="shell">
      <aside className={`side${menuOpen ? ' open' : ''}`}>
        <div className="brand">
          <span className="star">✦</span>
          <div>
            <b>NOVA</b>
            <small>{roleLabel}</small>
          </div>
        </div>
        <div className="school">
          <small>Institución</small>
          <b>{getSchoolName()}</b>
        </div>
        <nav aria-label="Secciones">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={section.id === activeId ? 'on' : ''}
              aria-current={section.id === activeId ? 'page' : undefined}
              onClick={closeMenu}
            >
              <Icon name={section.icon} />
              <span>{section.label}</span>
              {badges[section.id] > 0 && <em className="nav-badge">{badges[section.id]}</em>}
            </a>
          ))}
        </nav>
        <div className="me">
          <span className="avatar">{getInitials(user)}</span>
          <div>
            <b>{getFullName(user)}</b>
            <small>{ROLE_LABELS[user.rol]}</small>
          </div>
          <button type="button" className="icon-btn" onClick={onSignOut} title="Cerrar sesión" aria-label="Cerrar sesión">
            <Icon name="logout" />
          </button>
        </div>
      </aside>
      <div className="scrim" onClick={closeMenu} />
      <main className="main">
        <header className="top">
          <button type="button" className="icon-btn menu" onClick={() => setMenuOpen((open) => !open)} aria-label="Abrir menú">
            <Icon name="menu" />
          </button>
          <span className="crumbs">{activeSection?.label}</span>
          <span className="date">
            {new Date().toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </header>
        <section className="view">{children}</section>
      </main>
    </div>
  );
}