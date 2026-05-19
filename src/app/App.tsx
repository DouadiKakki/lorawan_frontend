import { useState } from 'react';
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
