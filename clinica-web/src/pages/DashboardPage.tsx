import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Shortcut = {
  label: string;
  subtitle: string;
  cta: string;
  path: string;
  icon: string;
  enabled?: boolean;
};

const clinicShortcuts: Shortcut[] = [
  { label: 'Clientes', subtitle: 'Cadastro, edição e contato', cta: 'Abrir', path: '/clientes', icon: 'CL', enabled: true },
  { label: 'Consultas', subtitle: 'Agenda do dia e confirmações', cta: 'Abrir', path: '/consultas', icon: 'AG', enabled: true },
  { label: 'Tarefas', subtitle: 'Pendências e prazos da equipe', cta: 'Abrir', path: '/tarefas', icon: 'TK', enabled: true },
  { label: 'Aniversários', subtitle: 'Hoje e lista do mês', cta: 'Abrir', path: '/aniversarios', icon: 'AN', enabled: true },
  { label: 'Serviços', subtitle: 'Catálogo e preços', cta: 'Abrir', path: '/servicos', icon: 'SV', enabled: true },
  { label: 'Financeiro', subtitle: 'Pacotes, vendas e saldos', cta: 'Abrir', path: '/financeiro', icon: 'FN', enabled: true },
  { label: 'Estoque', subtitle: 'Produtos, consumo e alertas', cta: 'Abrir', path: '/estoque', icon: 'ET', enabled: true },
  { label: 'Relatórios', subtitle: 'Indicadores de negócio', cta: 'Abrir', path: '/relatorios', icon: 'RL', enabled: true },
  { label: 'Indicações', subtitle: 'Indicações e conversão', cta: 'Abrir', path: '/indicacoes', icon: 'IN', enabled: true },
  { label: 'Notificações', subtitle: 'Histórico de envios', cta: 'Abrir', path: '/notificacoes', icon: 'NT', enabled: true },
  { label: 'Configurações', subtitle: 'Preferências do sistema', cta: 'Abrir', path: '/configuracoes', icon: 'CF', enabled: true },
  { label: 'Portal Cliente', subtitle: 'Visão do cliente final', cta: 'Abrir', path: '/portal-cliente', icon: 'PC', enabled: true },
  { label: 'Ajuda Operacional', subtitle: 'POP diário da equipe', cta: 'Abrir', path: '/ajuda-operacional', icon: 'AJ', enabled: true },
];

const clientShortcuts: Shortcut[] = [
  { label: 'Portal Cliente', subtitle: 'Minha visão pessoal', cta: 'Abrir', path: '/portal-cliente', icon: 'PC', enabled: true },
  { label: 'Notificações', subtitle: 'Alertas de consultas e agendamentos', cta: 'Abrir', path: '/portal-notificacoes', icon: 'NT', enabled: true },
  { label: 'Serviços', subtitle: 'Facial e corporal com equipe especializada', cta: 'Abrir', path: '/servicos', icon: 'SV', enabled: true },
  { label: 'Indicações', subtitle: 'Indique e acompanhe o status', cta: 'Abrir', path: '/indicacoes', icon: 'IN', enabled: true },
  { label: 'Configurações', subtitle: 'Ajustes da conta', cta: 'Abrir', path: '/configuracoes', icon: 'CF', enabled: true },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT';
  const shortcuts = isClient ? clientShortcuts : clinicShortcuts;

  return (
    <div className="dashboard-wrap">
      <section className="dashboard-header">
        <img src="/assets/logo-clinica.jpg" alt="Logo da clínica" className="dashboard-logo-img" />
        <div>
          <h1>{isClient ? 'Área do Cliente' : 'Clínica Emanuelle Ferreira'}</h1>
          <p>{isClient ? 'Painel limpo e focado no cliente' : 'Painel administrativo'}</p>
        </div>
      </section>

      <section className="dashboard-grid">
        {shortcuts.map((item) => (
          <article
            key={item.path}
            className={`dashboard-tile ${item.enabled ? 'enabled' : 'disabled'}`}
            onClick={() => item.enabled && navigate(item.path)}
          >
            <div className="tile-icon">{item.icon}</div>
            <div className="tile-content">
              <h3>{item.label}</h3>
              <p>{item.subtitle}</p>
            </div>
            <button type="button" className="tile-cta" disabled={!item.enabled}>
              {item.cta} <span>›</span>
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
