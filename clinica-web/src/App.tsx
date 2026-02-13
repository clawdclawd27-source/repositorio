import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { ClientsPage } from './pages/ClientsPage';
import { DashboardPage } from './pages/DashboardPage';
import { BirthdaysPage } from './pages/BirthdaysPage';
import { PackagesPage } from './pages/PackagesPage';
import { SectionPage } from './pages/SectionPage';
import { ServicesPage } from './pages/ServicesPage';
import { TasksPage } from './pages/TasksPage';

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
        <Route path="/painel" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/consultas" element={<AppointmentsPage />} />
        <Route path="/tarefas" element={<TasksPage />} />
        <Route path="/aniversarios" element={<BirthdaysPage />} />
        <Route path="/servicos" element={<ServicesPage />} />
        <Route path="/financeiro" element={<PackagesPage />} />
        <Route path="/estoque" element={<SectionPage title="Estoque" hint="Itens, movimentações e alertas de baixo estoque." />} />
        <Route path="/relatorios" element={<SectionPage title="Relatórios" hint="Indicadores de consultas, financeiro e indicações." />} />
        <Route path="/indicacoes" element={<SectionPage title="Indicações" hint="Indicações de clientes e taxa de conversão." />} />
        <Route path="/notificacoes" element={<SectionPage title="Notificações" hint="Logs e disparos de WhatsApp." />} />
        <Route path="/configuracoes" element={<SectionPage title="Configurações" hint="Permissões e templates do sistema." />} />
        <Route path="*" element={<Navigate to="/painel" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
