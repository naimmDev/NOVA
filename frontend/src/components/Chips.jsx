export default function Chips({ items }) {
  if (!items.length) return <span className="muted">—</span>;
  return (
    <div className="chips">
      {items.map((item) => (
        <span key={item} className="chip">{item}</span>
      ))}
    </div>
  );
}