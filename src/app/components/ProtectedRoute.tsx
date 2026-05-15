import { useState } from 'react';
import { auth } from '@/lib/auth';
import { LoginPage } from './LoginPage';

interface Props { children: React.ReactNode; }

export function ProtectedRoute({ children }: Props) {
  const [authenticated, setAuthenticated] = useState(auth.isAuthenticated());

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }
  return <>{children}</>;
}
