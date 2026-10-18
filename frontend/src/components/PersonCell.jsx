import { getFullName, getInitials } from '../utils/formatters';

export default function PersonCell({ user }) {
  return (
    <div className="person">
      <span className="avatar sm">{getInitials(user)}</span>
      <div>
        <b>{getFullName(user)}</b>
        <small>{user.email}</small>
      </div>
    </div>
  );
}