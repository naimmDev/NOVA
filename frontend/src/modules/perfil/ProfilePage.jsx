import { useState } from 'react';
import Chips from '../../components/Chips';
import FormField from '../../components/FormField';
import PageHeader from '../../components/PageHeader';
import { useToast } from '../../components/ToastProvider';
import { getGroupsForUser, getSubjectsForTeacher, updateOwnProfile } from '../../services/userService';
import { ROLE_LABELS, getFullName, getInitials } from '../../utils/formatters';
import { useAuth } from '../auth/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const showToast = useToast();
  const [nombre, setNombre] = useState(user.nombre);
  const [apellido, setApellido] = useState(user.apellido);
  const [error, setError] = useState('');

  const groups = getGroupsForUser(user).map((group) => group.nombre);
  const subjects = user.rol === 'DOCENTE' ? getSubjectsForTeacher(user.id).map((subject) => subject.nombre) : null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = updateOwnProfile(user.id, { nombre, apellido });
    setError(result.error ?? '');
    if (result.ok) showToast('Perfil actualizado');
  };

  return (
    <>
      <PageHeader title="Mi perfil" description="Consulta tus datos y actualiza los que puedes modificar." />
      <div className="profile-grid">
        <div className="card pad">
          <div className="profile-id">
            <span className="avatar lg">{getInitials(user)}</span>
            <div>
              <h3>{getFullName(user)}</h3>
              <span className="badge info">{ROLE_LABELS[user.rol]}</span>
            </div>
          </div>
          <dl className="facts">
            <div><dt>Código</dt><dd>{user.codigo}</dd></div>
            <div><dt>Correo institucional</dt><dd>{user.email}</dd></div>
            <div><dt>{user.rol === 'DOCENTE' ? 'Grupos que atiende' : 'Grupo'}</dt><dd><Chips items={groups} /></dd></div>
            {subjects && <div><dt>Asignaturas que imparte</dt><dd><Chips items={subjects} /></dd></div>}
          </dl>
        </div>
        <form className="card pad" onSubmit={handleSubmit} noValidate>
          <h3>Datos que puedes editar</h3>
          {error && <div className="alert" role="alert">{error}</div>}
          <FormField label="Nombre" htmlFor="profile-name" required>
            <input id="profile-name" type="text" value={nombre} onChange={(event) => setNombre(event.target.value)} />
          </FormField>
          <FormField label="Apellido" htmlFor="profile-lastname" required>
            <input id="profile-lastname" type="text" value={apellido} onChange={(event) => setApellido(event.target.value)} />
          </FormField>
          <p className="muted">El código y el correo los gestiona la administración.</p>
          <button type="submit" className="btn primary">Guardar cambios</button>
        </form>
      </div>
    </>
  );
}