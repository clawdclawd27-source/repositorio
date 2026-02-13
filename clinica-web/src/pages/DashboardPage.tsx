import { useNavigate } from 'react-router-dom';

const shortcuts = [
  { label: 'Clientes', path: '/clientes' },
  { label: 'Consultas', path: '/consultas' },
  { label: 'Serviços', path: '/servicos' },
  { label: 'Pacotes / Financeiro', path: '/financeiro' },
  { label: 'Tarefas', path: '/tarefas' },
  { label: 'Indicações', path: '/indicacoes' },
  { label: 'Relatórios', path: '/relatorios' },
  { label: 'Configurações', path: '/configuracoes' },
];

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ display: 'grid', gap: 14 }}>
      <h2 style={{ margin: 0 }}>Painel rápido</h2>
      <p style={{ margin: 0 }}>Escolha uma área para abrir:</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        {shortcuts.map((item) => (
          <button key={item.path} type="button" onClick={() => navigate(item.path)}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
