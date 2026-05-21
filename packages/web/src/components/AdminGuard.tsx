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
      // Chưa đăng nhập, chuyển về login
      navigate('/login', { replace: true });
      return;
    }

    if (user.role !== 'admin') {
      // Không phải admin, chuyển về trang chủ
      navigate('/', { replace: true });
      return;
    }
  }, [user, navigate]);

  // Nếu không phải admin hoặc chưa đăng nhập, không render gì
  if (!user || user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
