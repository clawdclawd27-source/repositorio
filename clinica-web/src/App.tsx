import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SectionPage } from './pages/SectionPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/clientes" element={<SectionPage title="Clientes" hint="Gestão de clientes, cadastro e histórico." />} />
        <Route path="/consultas" element={<SectionPage title="Consultas" hint="Agenda, status e acompanhamento de consultas." />} />
        <Route path="/tarefas" element={<SectionPage title="Tarefas" hint="Tarefas internas da equipe e responsáveis." />} />
        <Route path="/aniversarios" element={<SectionPage title="Aniversários" hint="Lista de aniversariantes e envio automático." />} />
        <Route path="/servicos" element={<SectionPage title="Serviços" hint="Catálogo de procedimentos e duração." />} />
        <Route path="/financeiro" element={<SectionPage title="Financeiro" hint="Entradas, saídas, pendências e saldo." />} />
        <Route path="/estoque" element={<SectionPage title="Estoque" hint="Itens, movimentações e alertas de baixo estoque." />} />
        <Route path="/relatorios" element={<SectionPage title="Relatórios" hint="Indicadores de consultas, financeiro e indicações." />} />
        <Route path="/indicacoes" element={<SectionPage title="Indicações" hint="Indicações de clientes e taxa de conversão." />} />
        <Route path="/notificacoes" element={<SectionPage title="Notificações" hint="Logs e disparos de WhatsApp." />} />
        <Route path="/configuracoes" element={<SectionPage title="Configurações" hint="Permissões e templates do sistema." />} />
        <Route path="*" element={<Navigate to="/clientes" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
