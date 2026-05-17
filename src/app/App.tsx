import { useState } from 'react';
import { auth } from '@/lib/auth';
import { LoginPage } from './components/LoginPage';
import { ModernDashboard } from './components/ModernDashboard';

export default function App() {
  const [authenticated, setAuthenticated] = useState(auth.isAuthenticated());

  const handleLogout = () => {
    auth.clearTokens();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  return <ModernDashboard onLogout={handleLogout} />;
}
