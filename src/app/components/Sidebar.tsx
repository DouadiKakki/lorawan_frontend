import { useState } from 'react';
import { Search, Home, Radio, Layers, Activity, Webhook, Database, FileText, Users, Settings, Key, Plug, ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const [applicationsExpanded, setApplicationsExpanded] = useState(true);
  const [endDevicesExpanded, setEndDevicesExpanded] = useState(true);

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-xs text-gray-500">THE THINGS STACK</div>
              <div className="font-semibold text-sm">Community</div>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <kbd className="absolute right-2 top-1.5 px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">
              Ctrl K
            </kbd>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <NavItem icon={<Home />} label="Home" collapsed={collapsed} />
        
        <NavItem 
          icon={<Radio />} 
          label="Applications" 
          collapsed={collapsed} 
          active
          expandable
          expanded={applicationsExpanded}
          onToggle={() => setApplicationsExpanded(!applicationsExpanded)}
        />
        
        {!collapsed && applicationsExpanded && (
          <div className="ml-8 space-y-0.5">
            <SubNavItem label="Application overview" />
            <SubNavItem label="End devices" active expandable expanded={endDevicesExpanded} onToggle={() => setEndDevicesExpanded(!endDevicesExpanded)} />
            {endDevicesExpanded && (
              <div className="ml-4 space-y-0.5">
                <SubNavItem label="Live data" active />
                <SubNavItem label="Webhooks" />
                <SubNavItem label="Message storage" />
                <SubNavItem label="Payload formatters" />
                <SubNavItem label="Collaborators" />
                <SubNavItem label="MAC settings profiles" />
                <SubNavItem label="API keys" />
                <SubNavItem label="Other integrations" />
                <SubNavItem label="General settings" />
              </div>
            )}
          </div>
        )}

        <NavItem icon={<Layers />} label="Gateways" collapsed={collapsed} />

        {!collapsed && (
          <>
            <div className="px-3 py-2 mt-4">
              <div className="text-xs text-gray-500">Top end devices</div>
            </div>
            <DeviceItem icon="💡" label="eqp12-light" />
            <DeviceItem icon="🧪" label="test-esp" />
            <DeviceItem icon="💡" label="light-controller" />
            <DeviceItem icon="🔢" label="Counter" />
          </>
        )}
      </nav>

      {/* Resources */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-200">
          <button className="flex items-center justify-between w-full text-sm text-gray-700 hover:bg-gray-100 px-2 py-1.5 rounded">
            <span>Resources</span>
            <ChevronDown className="w-4 h-4" />
          </button>
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
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

function NavItem({ icon, label, collapsed, active, expandable, expanded, onToggle }: NavItemProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm ${
        active ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{label}</span>
          {expandable && (
            expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </>
      )}
    </button>
  );
}

interface SubNavItemProps {
  label: string;
  active?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

function SubNavItem({ label, active, expandable, expanded, onToggle }: SubNavItemProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm ${
        active ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className="flex-1 text-left">{label}</span>
      {expandable && (
        expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
      )}
    </button>
  );
}

interface DeviceItemProps {
  icon: string;
  label: string;
}

function DeviceItem({ icon, label }: DeviceItemProps) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">
      <span className="w-5 h-5 flex items-center justify-center text-base">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}
