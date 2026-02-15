import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell single">
      <header className="topbar">
        <div className="topbar-brand">
          <img src="/assets/logo-clinica.jpg" alt="Logo Clínica Emanuelle Ferreira" className="topbar-logo" />
          <div>
            <strong>Clínica Emanuelle Ferreira</strong>
            <div className="topbar-sub">Biomedicina Estética Avançada · {user?.name} ({user?.role})</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => navigate('/painel')}>Início</button>
          {user?.role === 'CLIENT' ? (
            <button type="button" onClick={() => navigate('/configuracoes')}>Configurações</button>
          ) : null}
          <button type="button" onClick={logout}>Sair</button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
