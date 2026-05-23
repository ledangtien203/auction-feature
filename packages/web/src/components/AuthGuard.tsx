import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { readStoredUser } from '../services/authService';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const user = readStoredUser();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else {
      setIsChecking(false);
    }
  }, [user, navigate]);

  // Don't render while checking auth
  if (isChecking && !user) {
    return null;
  }

  return <>{children}</>;
}
