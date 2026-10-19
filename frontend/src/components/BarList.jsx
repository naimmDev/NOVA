export default function BarList({ items, emptyText = 'Todavía no hay datos.' }) {
  if (!items.length) return <p className="muted">{emptyText}</p>;
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <div className="bars">
      {items.map((item) => (
        <div key={item.label}>
          <div className="bl"><span>{item.label}</span><b>{item.value}</b></div>
          <div className="bt"><i style={{ width: `${(item.value / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}