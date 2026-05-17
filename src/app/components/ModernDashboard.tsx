import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { ModernSidebar } from './ModernSidebar';
import { ModernTopBar } from './ModernTopBar';
import { StatsOverview } from './StatsOverview';
import { DeviceList } from './DeviceList';
import { ActivityChart } from './ActivityChart';
import { MapView } from './MapView';
import { LiveMonitoring } from './LiveMonitoring';
import { Applications } from './Applications';
import { Gateways } from './Gateways';
import { Analytics } from './Analytics';
import { Storage } from './Storage';
import { Integrations } from './Integrations';
import { Users } from './Users';
import { Settings } from './Settings';
import { EndDevices } from './EndDevices';
import { UplinkMessages } from './UplinkMessages';
import { Companies } from './Companies';
import { useApplications } from '@/lib/hooks/useApplications';
import { useGateways } from '@/lib/hooks/useGateways';
import { useEndDevices } from '@/lib/hooks/useEndDevices';
import { useUsers } from '@/lib/hooks/useUsers';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { useIntegrations } from '@/lib/hooks/useIntegrations';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { toast } from 'sonner';

interface ModernDashboardProps {
  onLogout?: () => void;
}

export function ModernDashboard({ onLogout }: ModernDashboardProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(undefined);
  const [viewingGateway, setViewingGateway] = useState<any | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Handle navigation from search
  const handleNavigate = (view: string, itemId?: number) => {
    setIsNavigating(true);
    setTimeout(() => {
      setActiveView(view);
      setSelectedItemId(itemId);
      setTimeout(() => setIsNavigating(false), 300);
    }, 400);
  };

  // Handle view change with animation
  const handleViewChange = (view: string) => {
    setIsNavigating(true);
    setTimeout(() => {
      setActiveView(view);
      setTimeout(() => setIsNavigating(false), 300);
    }, 400);
  };

  const applicationsQuery = useApplications();
  const gatewaysQuery = useGateways();
  const endDevicesQuery = useEndDevices();
  const usersQuery = useUsers();
  const companiesQuery = useCompanies();
  const integrationsQuery = useIntegrations();
  useWebSocket();

  const applications = applicationsQuery.data ?? [];
  const gateways = gatewaysQuery.data ?? [];
  const endDevices = endDevicesQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const companies = companiesQuery.data ?? [];
  const integrations = integrationsQuery.data ?? [];

  if (applicationsQuery.error) toast.error('Failed to load applications');
  if (gatewaysQuery.error) toast.error('Failed to load gateways');
  if (endDevicesQuery.error) toast.error('Failed to load end devices');
  if (usersQuery.error) toast.error('Failed to load users');
  if (companiesQuery.error) toast.error('Failed to load companies');
  if (integrationsQuery.error) toast.error('Failed to load integrations');

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <>
            <StatsOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityChart />
              <MapView />
            </div>
            <DeviceList />
          </>
        );
      case 'monitoring':
        return <LiveMonitoring />;
      case 'uplinks':
        return <UplinkMessages />;
      case 'applications':
        return (
          <Applications
            applications={applications}
            onCreate={(data) => applicationsQuery.create.mutate(data)}
            onUpdate={(id, data) => applicationsQuery.update.mutate({ id, data })}
            onDelete={(id) => applicationsQuery.remove.mutate(id)}
          />
        );
      case 'gateways':
        return (
          <Gateways
            gateways={gateways}
            onCreate={(data) => gatewaysQuery.create.mutate(data)}
            onUpdate={(id, data) => gatewaysQuery.update.mutate({ id, data })}
            onDelete={(id) => gatewaysQuery.remove.mutate(id)}
            initialViewingGateway={viewingGateway}
            onClearViewingGateway={() => setViewingGateway(null)}
            selectedGatewayId={selectedItemId}
            onClearSelectedGateway={() => setSelectedItemId(undefined)}
          />
        );
      case 'enddevices':
        return (
          <EndDevices
            endDevices={endDevices}
            applications={applications}
            gateways={gateways}
            onCreate={(data) => endDevicesQuery.create.mutate(data)}
            onUpdate={(id, data) => endDevicesQuery.update.mutate({ id, data })}
            onDelete={(id) => endDevicesQuery.remove.mutate(id)}
            onViewGateway={(gateway) => {
              setActiveView('gateways');
              setViewingGateway(gateway);
            }}
            selectedDeviceId={selectedItemId}
            onClearSelectedDevice={() => setSelectedItemId(undefined)}
          />
        );
      case 'analytics':
        return <Analytics />;
      case 'storage':
        return <Storage />;
      case 'integrations':
        return (
          <Integrations
            integrations={integrations}
            onCreate={(data) => integrationsQuery.create.mutate(data)}
            onUpdate={(id, data) => integrationsQuery.update.mutate({ id, data })}
            onDelete={(id) => integrationsQuery.remove.mutate(id)}
          />
        );
      case 'users':
        return (
          <Users
            users={users}
            onCreate={(data) => usersQuery.create.mutate(data)}
            onUpdate={(id, data) => usersQuery.update.mutate({ id, data })}
            onDelete={(id) => usersQuery.remove.mutate(id)}
          />
        );
      case 'companies':
        return (
          <Companies
            companies={companies}
            onCreate={(data) => companiesQuery.create.mutate(data)}
            onUpdate={(id, data) => companiesQuery.update.mutate({ id, data })}
            onDelete={(id) => companiesQuery.remove.mutate(id)}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return (
          <>
            <StatsOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityChart />
              <MapView />
            </div>
            <DeviceList />
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ModernSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeView={activeView}
        onViewChange={handleViewChange}
        endDevicesCount={endDevices.length}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <ModernTopBar
          gateways={gateways}
          endDevices={endDevices}
          onNavigate={handleNavigate}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 relative hide-scrollbar" style={{ isolation: 'isolate' }}>
          <AnimatePresence>
            {isNavigating && (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50"
              >
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                  <p className="text-white text-sm">Loading...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}