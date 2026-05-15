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

export function ModernDashboard() {
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

  // State for all data
  const [applications, setApplications] = useState([
    { id: 1, name: 'Smart Building', description: 'Temperature and humidity monitoring', brand: 'Acme Corp', devices: 45, status: 'active', color: 'from-blue-600 to-cyan-600' },
    { id: 2, name: 'Asset Tracking', description: 'GPS location tracking for assets', brand: 'TrackTech', devices: 23, status: 'active', color: 'from-purple-600 to-pink-600' },
    { id: 3, name: 'Agriculture Sensors', description: 'Soil moisture and weather data', brand: 'FarmSense', devices: 67, status: 'active', color: 'from-green-600 to-emerald-600' },
    { id: 4, name: 'Parking Management', description: 'Smart parking sensors', brand: 'ParkSmart', devices: 120, status: 'active', color: 'from-orange-600 to-red-600' },
    { id: 5, name: 'Water Monitoring', description: 'Water consumption meters', brand: 'AquaTech', devices: 34, status: 'inactive', color: 'from-gray-600 to-slate-600' },
    { id: 6, name: 'Street Lighting', description: 'Smart street light control', brand: 'LightCity', devices: 89, status: 'active', color: 'from-yellow-600 to-orange-600' },
    { id: 7, name: 'Waste Management', description: 'Smart bin level monitoring', brand: 'EcoClean', devices: 56, status: 'active', color: 'from-teal-600 to-cyan-600' },
    { id: 8, name: 'Environmental Monitoring', description: 'Air quality and noise sensors', brand: 'EnviroWatch', devices: 41, status: 'active', color: 'from-indigo-600 to-blue-600' },
  ]);

  const [gateways, setGateways] = useState([
    { id: 1, name: 'Gateway-Central-01', eui: 'AABBCCDDEEFF0001', location: 'Downtown Office', status: 'online', devices: 234, uptime: '99.9%', lastSeen: '1 min ago', company: 'TechCorp Industries' },
    { id: 2, name: 'Gateway-North-02', eui: 'AABBCCDDEEFF0002', location: 'North Building', status: 'online', devices: 189, uptime: '99.7%', lastSeen: '2 min ago', company: 'Smart City Solutions' },
    { id: 3, name: 'Gateway-South-03', eui: 'AABBCCDDEEFF0003', location: 'South Warehouse', status: 'warning', devices: 156, uptime: '85.2%', lastSeen: '10 min ago', company: 'Smart City Solutions' },
    { id: 4, name: 'Gateway-East-04', eui: 'AABBCCDDEEFF0004', location: 'East Campus', status: 'online', devices: 298, uptime: '99.8%', lastSeen: '30 sec ago', company: 'TechCorp Industries' },
    { id: 5, name: 'Gateway-West-05', eui: 'AABBCCDDEEFF0005', location: 'West Facility', status: 'offline', devices: 0, uptime: '0%', lastSeen: '2 days ago', company: 'Global Logistics Ltd' },
    { id: 6, name: 'Gateway-Airport-06', eui: 'AABBCCDDEEFF0006', location: 'Airport Terminal', status: 'online', devices: 412, uptime: '99.95%', lastSeen: '45 sec ago', company: 'Global Logistics Ltd' },
    { id: 7, name: 'Gateway-Harbor-07', eui: 'AABBCCDDEEFF0007', location: 'Harbor District', status: 'online', devices: 178, uptime: '98.5%', lastSeen: '3 min ago', company: 'TechCorp Industries' },
    { id: 8, name: 'Gateway-Industrial-08', eui: 'AABBCCDDEEFF0008', location: 'Industrial Park', status: 'warning', devices: 223, uptime: '92.1%', lastSeen: '15 min ago', company: 'Manufacturing Pro Inc' },
    { id: 9, name: 'Gateway-University-09', eui: 'AABBCCDDEEFF0009', location: 'University Campus', status: 'online', devices: 167, uptime: '99.3%', lastSeen: '1 min ago', company: 'EduTech Networks' },
    { id: 10, name: 'Gateway-Mall-10', eui: 'AABBCCDDEEFF0010', location: 'Shopping Mall', status: 'offline', devices: 0, uptime: '0%', lastSeen: '5 hours ago', company: 'Retail Connect Group' },
  ]);

  const [endDevices, setEndDevices] = useState([
    { id: 1, name: 'Temperature Sensor 01', devEUI: '70-B3-D5-7E-D0-06-6E-81', application: 'Smart Building', brand: 'Acme Corp', company: 'TechCorp Industries', status: 'active', battery: 95, rssi: -67, lastSeen: '2 min ago', createdAt: '2024-01-15T10:30:00Z', connectedGateways: [{ eui: 'AABBCCDDEEFF0001', rssi: -67 }, { eui: 'AABBCCDDEEFF0002', rssi: -73 }] },
    { id: 2, name: 'Light Controller 02', devEUI: '8C-F9-57-ED-32-4A-1B-C2', application: 'Smart Building', brand: 'Acme Corp', company: 'TechCorp Industries', status: 'active', battery: 78, rssi: -72, lastSeen: '5 min ago', createdAt: '2024-02-10T14:20:00Z', connectedGateways: [{ eui: 'AABBCCDDEEFF0001', rssi: -72 }] },
    { id: 3, name: 'Humidity Sensor 03', devEUI: '44-B2-3C-FF-A1-D7-8E-91', application: 'Smart Building', brand: 'Acme Corp', company: 'Smart City Solutions', status: 'active', battery: 89, rssi: -68, lastSeen: '1 min ago', createdAt: '2024-03-05T08:15:00Z', connectedGateways: [{ eui: 'AABBCCDDEEFF0002', rssi: -68 }, { eui: 'AABBCCDDEEFF0004', rssi: -79 }] },
    { id: 4, name: 'Door Contact 04', devEUI: 'C3-E8-1D-29-4F-6A-B0-72', application: 'Smart Building', brand: 'Acme Corp', company: 'Smart City Solutions', status: 'active', battery: 92, rssi: -70, lastSeen: '30 sec ago', createdAt: '2024-04-12T16:45:00Z', connectedGateways: [{ eui: 'AABBCCDDEEFF0001', rssi: -70 }, { eui: 'AABBCCDDEEFF0002', rssi: -75 }, { eui: 'AABBCCDDEEFF0004', rssi: -82 }] },
    { id: 5, name: 'Motion Detector 05', devEUI: 'AA-55-FF-00-BB-CC-DD-EE', application: 'Smart Building', brand: 'Acme Corp', company: 'TechCorp Industries', status: 'active', battery: 84, rssi: -75, lastSeen: '10 min ago', createdAt: '2024-05-20T11:30:00Z', connectedGateways: [{ eui: 'AABBCCDDEEFF0004', rssi: -75 }] },
    { id: 6, name: 'GPS Tracker 06', devEUI: '11-22-33-44-55-66-77-88', application: 'Asset Tracking', brand: 'TrackTech', company: 'Global Logistics Ltd', status: 'active', battery: 65, rssi: -80, lastSeen: '15 min ago', createdAt: '2024-06-08T09:00:00Z', connectedGateways: [{ eui: 'AABBCCDDEEFF0006', rssi: -80 }, { eui: 'AABBCCDDEEFF0007', rssi: -88 }] },
    { id: 7, name: 'Soil Moisture 07', devEUI: 'DE-AD-BE-EF-CA-FE-BA-BE', application: 'Agriculture Sensors', brand: 'FarmSense', company: 'EduTech Networks', status: 'active', battery: 72, rssi: -77, lastSeen: '20 min ago', createdAt: '2024-07-14T13:20:00Z', connectedGateways: [{ eui: 'AABBCCDDEEFF0009', rssi: -77 }] },
    { id: 8, name: 'Weather Station 08', devEUI: '12-34-56-78-9A-BC-DE-F0', application: 'Agriculture Sensors', brand: 'FarmSense', company: 'Manufacturing Pro Inc', status: 'inactive', battery: 0, rssi: -120, lastSeen: '2 days ago', createdAt: '2024-08-22T07:50:00Z', connectedGateways: [] },
    { id: 9, name: 'Parking Sensor 09', devEUI: 'FE-DC-BA-98-76-54-32-10', application: 'Parking Management', brand: 'ParkSmart', company: 'Retail Connect Group', status: 'active', battery: 88, rssi: -69, lastSeen: '3 min ago', createdAt: '2024-09-01T15:10:00Z', connectedGateways: [{ eui: 'AABBCCDDEEFF0010', rssi: -69 }] },
    { id: 10, name: 'Water Meter 10', devEUI: 'AB-CD-EF-01-23-45-67-89', application: 'Water Monitoring', brand: 'AquaTech', company: 'TechCorp Industries', status: 'active', battery: 94, rssi: -66, lastSeen: '4 min ago', createdAt: '2024-10-05T12:30:00Z', connectedGateways: [{ eui: 'AABBCCDDEEFF0001', rssi: -66 }, { eui: 'AABBCCDDEEFF0004', rssi: -71 }, { eui: 'AABBCCDDEEFF0006', rssi: -84 }] },
  ]);

  const [users, setUsers] = useState([
    { id: 1, name: 'Admin User', email: 'admin@lorawan.io', role: 'Admin', status: 'active', lastLogin: '5 min ago', devices: 'All' },
    { id: 2, name: 'John Smith', email: 'john.smith@company.com', role: 'Operator', status: 'active', lastLogin: '2 hours ago', devices: '234' },
    { id: 3, name: 'Sarah Johnson', email: 'sarah.j@company.com', role: 'Viewer', status: 'active', lastLogin: '1 day ago', devices: '45' },
    { id: 4, name: 'Michael Chen', email: 'mchen@company.com', role: 'Operator', status: 'active', lastLogin: '3 hours ago', devices: '189' },
    { id: 5, name: 'Emma Wilson', email: 'emma.w@company.com', role: 'Viewer', status: 'inactive', lastLogin: '2 weeks ago', devices: '23' },
    { id: 6, name: 'David Martinez', email: 'dmartinez@company.com', role: 'Admin', status: 'active', lastLogin: '1 hour ago', devices: 'All' },
    { id: 7, name: 'Lisa Anderson', email: 'landerson@company.com', role: 'Operator', status: 'active', lastLogin: '30 min ago', devices: '156' },
    { id: 8, name: 'Robert Taylor', email: 'rtaylor@company.com', role: 'Viewer', status: 'active', lastLogin: '4 hours ago', devices: '67' },
    { id: 9, name: 'Jennifer Lee', email: 'jlee@company.com', role: 'Operator', status: 'inactive', lastLogin: '1 week ago', devices: '98' },
    { id: 10, name: 'James Brown', email: 'jbrown@company.com', role: 'Viewer', status: 'active', lastLogin: '2 days ago', devices: '34' },
    { id: 11, name: 'Maria Garcia', email: 'mgarcia@company.com', role: 'Operator', status: 'active', lastLogin: '10 min ago', devices: '201' },
    { id: 12, name: 'Christopher White', email: 'cwhite@company.com', role: 'Viewer', status: 'inactive', lastLogin: '3 weeks ago', devices: '12' },
  ]);

  const [integrations, setIntegrations] = useState([
    { id: 1, name: 'AWS IoT Core', type: 'Cloud', status: 'active', events: 12450, lastSync: '2 min ago', url: '', apiKey: '' },
    { id: 2, name: 'Azure IoT Hub', type: 'Cloud', status: 'active', events: 8920, lastSync: '5 min ago', url: '', apiKey: '' },
    { id: 3, name: 'Custom Webhook', type: 'Webhook', status: 'active', events: 5630, lastSync: '1 min ago', url: '', apiKey: '' },
    { id: 4, name: 'MQTT Broker', type: 'Protocol', status: 'inactive', events: 0, lastSync: 'Never', url: '', apiKey: '' },
    { id: 5, name: 'REST API', type: 'API', status: 'active', events: 3240, lastSync: '10 min ago', url: '', apiKey: '' },
    { id: 6, name: 'Google Cloud IoT', type: 'Cloud', status: 'active', events: 9870, lastSync: '3 min ago', url: '', apiKey: '' },
    { id: 7, name: 'Kafka Stream', type: 'Protocol', status: 'active', events: 15620, lastSync: '1 min ago', url: '', apiKey: '' },
    { id: 8, name: 'InfluxDB', type: 'Database', status: 'active', events: 22340, lastSync: '2 min ago', url: '', apiKey: '' },
    { id: 9, name: 'Grafana', type: 'Visualization', status: 'active', events: 7850, lastSync: '4 min ago', url: '', apiKey: '' },
    { id: 10, name: 'Telegram Bot', type: 'Notification', status: 'active', events: 1230, lastSync: '8 min ago', url: '', apiKey: '' },
    { id: 11, name: 'Slack Webhook', type: 'Notification', status: 'active', events: 890, lastSync: '12 min ago', url: '', apiKey: '' },
    { id: 12, name: 'MongoDB Atlas', type: 'Database', status: 'inactive', events: 0, lastSync: 'Never', url: '', apiKey: '' },
    { id: 13, name: 'ThingSpeak', type: 'Cloud', status: 'active', events: 4560, lastSync: '6 min ago', url: '', apiKey: '' },
    { id: 14, name: 'Node-RED', type: 'Automation', status: 'active', events: 6780, lastSync: '3 min ago', url: '', apiKey: '' },
  ]);

  const [companies, setCompanies] = useState([
    { id: 1, name: 'Company A', email: 'contact@companya.com', phone: '+1 (555) 100-1000', address: '123 Tech Park, Silicon Valley, CA', gateways: 3, devices: 145, users: 12, status: 'active' as const, sharedGateways: ['Gateway-Central-01'], sharedDevices: ['Temperature Sensor 01', 'Light Controller 02'], createdAt: '2023-01-15' },
    { id: 2, name: 'Company B', email: 'info@companyb.com', phone: '+1 (555) 200-2000', address: '456 Innovation Drive, Austin, TX', gateways: 5, devices: 234, users: 18, status: 'active' as const, sharedGateways: [], sharedDevices: [], createdAt: '2023-03-22' },
    { id: 3, name: 'Company C', email: 'support@companyc.com', phone: '+1 (555) 300-3000', address: '789 Business Blvd, New York, NY', gateways: 2, devices: 89, users: 8, status: 'active' as const, sharedGateways: ['Gateway-North-02', 'Gateway-South-03'], sharedDevices: ['GPS Tracker 06'], createdAt: '2023-05-10' },
    { id: 4, name: 'Company D', email: 'hello@companyd.com', phone: '+1 (555) 400-4000', address: '321 Enterprise Way, Seattle, WA', gateways: 1, devices: 67, users: 5, status: 'inactive' as const, sharedGateways: [], sharedDevices: [], createdAt: '2023-07-18' },
  ]);

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
        return <Applications applications={applications} setApplications={setApplications} />;
      case 'gateways':
        return (
          <Gateways 
            gateways={gateways} 
            setGateways={setGateways}
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
            setEndDevices={setEndDevices} 
            applications={applications} 
            gateways={gateways}
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
        return <Integrations integrations={integrations} setIntegrations={setIntegrations} />;
      case 'users':
        return <Users users={users} setUsers={setUsers} />;
      case 'companies':
        return <Companies companies={companies} setCompanies={setCompanies} />;
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