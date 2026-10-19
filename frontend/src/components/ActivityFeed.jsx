import { getFullName, timeAgo } from '../utils/formatters';

export default function ActivityFeed({ items }) {
  if (!items.length) return <p className="muted">Todavía no hay actividad.</p>;
  return (
    <ul className="feed">
      {items.map((item) => (
        <li key={item.id}>
          <span className="dot" />
          <div>
            <p>{item.descripcion || item.accion}</p>
            <small>{getFullName(item.usuario)} · {timeAgo(item.fecha)}</small>
          </div>
        </li>
      ))}
    </ul>
  );
}