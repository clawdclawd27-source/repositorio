import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
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
import { OperationalHelpPage } from './pages/OperationalHelpPage';

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

        <Route path="/servicos" element={<ServicesPage />} />
        <Route path="/indicacoes" element={<ReferralsPage />} />
        <Route path="/notificacoes" element={<NotificationsPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
        <Route path="/portal-cliente" element={<PortalClientPage />} />
        <Route path="/ajuda-operacional" element={<RoleRoute allow={['ADMIN', 'OWNER']}><OperationalHelpPage /></RoleRoute>} />

        <Route path="/clientes" element={<RoleRoute allow={['ADMIN', 'OWNER']}><ClientsPage /></RoleRoute>} />
        <Route path="/consultas" element={<RoleRoute allow={['ADMIN', 'OWNER']}><AppointmentsPage /></RoleRoute>} />
        <Route path="/tarefas" element={<RoleRoute allow={['ADMIN', 'OWNER']}><TasksPage /></RoleRoute>} />
        <Route path="/aniversarios" element={<RoleRoute allow={['ADMIN', 'OWNER']}><BirthdaysPage /></RoleRoute>} />
        <Route path="/financeiro" element={<RoleRoute allow={['ADMIN', 'OWNER']}><PackagesPage /></RoleRoute>} />
        <Route path="/estoque" element={<RoleRoute allow={['ADMIN', 'OWNER']}><InventoryPage /></RoleRoute>} />
        <Route path="/relatorios" element={<RoleRoute allow={['ADMIN', 'OWNER']}><ReportsPage /></RoleRoute>} />

        <Route path="*" element={<Navigate to="/painel" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
