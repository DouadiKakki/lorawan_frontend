import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ModernDashboard } from './components/ModernDashboard';

export default function App() {
  const [authenticated, setAuthenticated] = useState(auth.isAuthenticated());
  const [showSignup, setShowSignup] = useState(false);

  const handleLogout = () => {
    auth.clearTokens();
    setAuthenticated(false);
  };

  useEffect(() => {
    const onForceLogout = () => { auth.clearTokens(); setAuthenticated(false); };
    window.addEventListener('auth:logout', onForceLogout);
    return () => window.removeEventListener('auth:logout', onForceLogout);
  }, []);

  if (!authenticated) {
    if (showSignup) {
      return (
        <SignupPage
          onSignup={() => setAuthenticated(true)}
          onSwitchToLogin={() => setShowSignup(false)}
        />
      );
    }
    return (
      <LoginPage
        onLogin={() => setAuthenticated(true)}
        onSwitchToSignup={() => setShowSignup(true)}
      />
    );
  }

  return <ModernDashboard onLogout={handleLogout} />;
}
