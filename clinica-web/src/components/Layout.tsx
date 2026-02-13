import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const items = [
  ['Clientes', '/clientes'],
  ['Consultas', '/consultas'],
  ['Tarefas', '/tarefas'],
  ['Aniversários', '/aniversarios'],
  ['Serviços', '/servicos'],
  ['Financeiro', '/financeiro'],
  ['Estoque', '/estoque'],
  ['Relatórios', '/relatorios'],
  ['Indicações', '/indicacoes'],
  ['Notificações', '/notificacoes'],
  ['Configurações', '/configuracoes'],
];

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Clínica Painel</h2>
        <p>{user?.name} ({user?.role})</p>
        <nav>
          {items.map(([label, path]) => (
            <Link key={path} to={path}>{label}</Link>
          ))}
        </nav>
        <button onClick={logout}>Sair</button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
