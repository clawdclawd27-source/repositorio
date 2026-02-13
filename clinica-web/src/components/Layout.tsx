import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell single">
      <header className="topbar">
        <div>
          <strong>{user?.name}</strong> <span style={{ opacity: 0.8 }}>({user?.role})</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => navigate('/painel')}>Painel</button>
          <button type="button" onClick={logout}>Sair</button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
