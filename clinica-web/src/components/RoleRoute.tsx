import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export function RoleRoute({ children, allow }: { children: JSX.Element; allow: UserRole[] }) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) return <Navigate to="/painel" replace />;
  return children;
}
