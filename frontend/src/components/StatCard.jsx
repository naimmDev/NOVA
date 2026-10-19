import Icon from './Icon';

export default function StatCard({ icon, label, value, hint }) {
  return (
    <div className="card stat">
      <span className="ico"><Icon name={icon} /></span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        <small>{hint}</small>
      </div>
    </div>
  );
}