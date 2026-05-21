import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { readStoredUser } from '../services/authService';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAuth = true, requireAdmin = false }: AuthGuardProps) {
  const navigate = useNavigate();
  const user = readStoredUser();

  useEffect(() => {
    if (requireAuth && !user) {
      // Cần đăng nhập nhưng chưa đăng nhập
      navigate('/login', { replace: true });
      return;
    }

    if (requireAdmin && (!user || user.role !== 'admin')) {
      // Cần quyền admin nhưng không có
      navigate('/', { replace: true });
      return;
    }

    if (!requireAuth && user) {
      // Route công khai nhưng đã đăng nhập, chuyển hướng theo role
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
      return;
    }
  }, [user, navigate, requireAuth, requireAdmin]);

  // Kiểm tra điều kiện render
  if (requireAuth && !user) {
    return null;
  }

  if (requireAdmin && (!user || user.role !== 'admin')) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}
