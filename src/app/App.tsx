import { ProtectedRoute } from './components/ProtectedRoute';
import { ModernDashboard } from './components/ModernDashboard';

export default function App() {
  return (
    <ProtectedRoute>
      <ModernDashboard />
    </ProtectedRoute>
  );
}
