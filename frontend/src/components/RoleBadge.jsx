import { ROLE_LABELS } from '../utils/formatters';

export default function RoleBadge({ role }) {
  return <span className={`badge role-${role}`}>{ROLE_LABELS[role]}</span>;
}