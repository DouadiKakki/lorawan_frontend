import { useState, useRef, useEffect } from 'react';
import { Search, Home, Radio, Layers, Activity, Zap, Database, FileText, Users, Settings, Key, Plug, ChevronDown, ChevronRight, ChevronLeft, BarChart3, Building2 } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
  endDevicesCount?: number;
  gatewaysCount?: number;
  activeDevicesCount?: number;
}

export function ModernSidebar({ collapsed, onToggle, activeView, onViewChange, endDevicesCount = 0, gatewaysCount = 0, activeDevicesCount = 0 }: SidebarProps) {
  const [applicationsExpanded, setApplicationsExpanded] = useState(true);
  const [endDevicesExpanded, setEndDevicesExpanded] = useState(true);
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  return (
    <div className={`bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col ${collapsed ? 'w-20' : 'w-72'} transition-all duration-300 relative z-[55]`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all z-50"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo */}
      <div className="p-4 border-b border-slate-700/50 relative">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/50 rounded-lg p-2 -m-2 transition-all"
          onClick={() => !collapsed && setShowCompanyInfo(!showCompanyInfo)}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <div className="font-bold text-white hover:text-blue-400 transition-colors">LoRaNavix</div>
              <div className="text-xs text-slate-400">Network Server</div>
            </div>
          )}
        </div>

        {/* Company Info Dropdown */}
        {showCompanyInfo && !collapsed && (
          <div className="absolute top-full left-0 right-0 mt-2 mx-4 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden backdrop-blur-xl z-50">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">LoRaNavix</div>
                  <div className="text-blue-100 text-xs">IoT Network Platform</div>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Company Type</div>
                <div className="text-white text-sm">LoRaWAN Network Server</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Active Gateways</div>
                <div className="text-white font-medium">{gatewaysCount} gateways online</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Devices</div>
                <div className="text-white font-medium">{endDevicesCount} end devices</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Operational</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-700">
                <button 
                  onClick={() => {
                    setShowCompanyInfo(false);
                    onViewChange('companies');
                  }}
                  className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white text-sm font-medium transition-all"
                >
                  Manage Companies
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search devices..."
              className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-3">
        <NavItem
          icon={<Home />}
          label="Overview"
          collapsed={collapsed}
          active={activeView === 'overview'}
          onClick={() => onViewChange('overview')}
        />
        <NavItem 
          icon={<Activity />} 
          label="Live Monitoring" 
          collapsed={collapsed} 
          active={activeView === 'monitoring'}
          onClick={() => onViewChange('monitoring')}
          badge={activeDevicesCount > 0 ? String(activeDevicesCount) : undefined}
        />
        <NavItem
          icon={<Radio />}
          label="Applications"
          collapsed={collapsed}
          active={activeView === 'applications'}
          onClick={() => onViewChange('applications')}
        />
        <NavItem
          icon={<Layers />}
          label="Gateways"
          collapsed={collapsed}
          active={activeView === 'gateways'}
          onClick={() => onViewChange('gateways')}
          badge={gatewaysCount > 0 ? String(gatewaysCount) : undefined}
        />
        <NavItem 
          icon={<Radio />} 
          label="End Devices" 
          collapsed={collapsed} 
          active={activeView === 'enddevices'}
          onClick={() => onViewChange('enddevices')}
          badge={endDevicesCount > 0 ? String(endDevicesCount) : undefined}
        />
        <NavItem 
          icon={<BarChart3 />} 
          label="Analytics" 
          collapsed={collapsed} 
          active={activeView === 'analytics'}
          onClick={() => onViewChange('analytics')}
        />
        <NavItem 
          icon={<Database />} 
          label="Storage" 
          collapsed={collapsed} 
          active={activeView === 'storage'}
          onClick={() => onViewChange('storage')}
        />
        <NavItem 
          icon={<Plug />} 
          label="Integrations" 
          collapsed={collapsed} 
          active={activeView === 'integrations'}
          onClick={() => onViewChange('integrations')}
        />

        {!collapsed && (
          <div className="mt-6 mb-2 px-3">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Management</div>
          </div>
        )}

        <NavItem 
          icon={<Users />} 
          label="Users" 
          collapsed={collapsed} 
          active={activeView === 'users'}
          onClick={() => onViewChange('users')}
        />
        <NavItem 
          icon={<Building2 />} 
          label="Companies" 
          collapsed={collapsed} 
          active={activeView === 'companies'}
          onClick={() => onViewChange('companies')}
        />
        <NavItem 
          icon={<Settings />} 
          label="Settings" 
          collapsed={collapsed} 
          active={activeView === 'settings'}
          onClick={() => onViewChange('settings')}
        />
      </nav>

      {/* Status Card */}
      {!collapsed && (
        <div className="p-4 m-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-300">System Status</span>
          </div>
          <div className="text-xl font-bold text-white">All Systems</div>
          <div className="text-sm text-green-400">Operational</div>
        </div>
      )}
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active?: boolean;
  onClick?: () => void;
  badge?: string;
}

function NavItem({ icon, label, collapsed, active, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-all group ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
      }`}
    >
      <span className={`w-5 h-5 flex items-center justify-center transition-transform group-hover:scale-110 ${active ? '' : 'text-slate-400'}`}>
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left text-sm font-medium">{label}</span>
          {badge && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              active ? 'bg-white/20' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}