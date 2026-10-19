import { useState } from 'react';
import { useAuth } from './AuthContext';
import FormField from '../../components/FormField';
import { resetDb } from '../../services/mockDb';
import { getSchoolName } from '../../services/userService';

// Demo shortcuts exist only while developing (`npm run dev`); `vite build` removes them.
const SHOW_DEMO = import.meta.env.DEV;

const DEMO_ACCOUNTS = [
  { label: 'SuperAdmin', email: 'superadmin@nova.edu' },
  { label: 'Admin', email: 'admin@nova.edu' },
  { label: 'Docente', email: 'andres.villarreal@nova.edu' },
  { label: 'Estudiante', email: 'valentina.perez@nova.edu' },
];

export default function LoginPage() {
  const { signIn, signInDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = signIn({ email, password });
    if (result.error) setError(result.error);
  };

  const handleDemo = (demoEmail) => {
    const result = signInDemo(demoEmail);
    if (result.error) setError(result.error);
  };

  return (
    <main className="auth">
      <section className="auth-art">
        <div className="logo"><span className="star">✦</span> NOVA</div>
        <div>
          <h1>La escuela, ordenada y a la mano</h1>
          <p className="lead">
            Agenda, anuncios y mensajería para administradores, docentes y estudiantes, en un solo lugar.
          </p>
        </div>
        <div className="school-tag">
          <span>Plataforma de la comunidad escolar del</span>
          <b>{getSchoolName()}</b>
        </div>
      </section>
      <section className="auth-form">
        <div className="auth-card">
          <p className="school-mini">{getSchoolName()}</p>
          <h2>Iniciar sesión</h2>
          <p className="sub">Entra con tu correo institucional.</p>
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="alert" role="alert">{error}</div>}
            <FormField label="Correo electrónico" htmlFor="email">
              <input id="email" type="email" autoComplete="username" placeholder="nombre@nova.edu"
                value={email} onChange={(event) => setEmail(event.target.value)} />
            </FormField>
            <FormField label="Contraseña" htmlFor="password">
              <div className="pw">
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                  value={password} onChange={(event) => setPassword(event.target.value)} />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </FormField>
            <button className="btn primary block" type="submit">Entrar</button>
          </form>
          {SHOW_DEMO && (
            <>
              <div className="demo">
                <b>Modo demostración</b>
                {DEMO_ACCOUNTS.map((account) => (
                  <button key={account.email} type="button" onClick={() => handleDemo(account.email)}>
                    <span>{account.label} · {account.email}</span>
                    <span>Entrar</span>
                  </button>
                ))}
              </div>
              <button className="reset" type="button" onClick={resetDb}>
                Restablecer los datos de demostración
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}