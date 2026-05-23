import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { readStoredUser } from '../services/authService';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const user = readStoredUser();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    const role = user.role?.toLowerCase();
    if (role !== 'admin') {
      navigate('/', { replace: true });
      return;
    }
  }, [user, navigate]);

  if (!user) return null;
  const role = user.role?.toLowerCase();
  if (role !== 'admin') return null;

  return <>{children}</>;
}
