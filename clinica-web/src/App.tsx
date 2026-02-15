import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { ClientsPage } from './pages/ClientsPage';
import { DashboardPage } from './pages/DashboardPage';
import { BirthdaysPage } from './pages/BirthdaysPage';
import { PackagesPage } from './pages/PackagesPage';
import { ServicesPage } from './pages/ServicesPage';
import { TasksPage } from './pages/TasksPage';
import { InventoryPage } from './pages/InventoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReferralsPage } from './pages/ReferralsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PortalClientPage } from './pages/PortalClientPage';

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
        <Route path="/estoque" element={<InventoryPage />} />
        <Route path="/relatorios" element={<ReportsPage />} />
        <Route path="/indicacoes" element={<ReferralsPage />} />
        <Route path="/notificacoes" element={<NotificationsPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
        <Route path="/portal-cliente" element={<PortalClientPage />} />
        <Route path="*" element={<Navigate to="/painel" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
