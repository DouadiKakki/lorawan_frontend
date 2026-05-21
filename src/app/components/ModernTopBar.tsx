import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Settings, User, ChevronDown, Radio, Wifi, LogOut } from 'lucide-react';

interface Gateway {
  _id: string;
  name: string;
  eui: string;
  location: string;
  status: string;
  devices: number;
  uptime: string;
  lastSeen: string;
}

interface EndDevice {
  _id: string;
  name: string;
  devEUI: string;
  application: string;
  brand: string;
  status: string;
  battery: number;
  rssi: number;
  lastSeen: string;
  createdAt: string;
}

interface SearchResult {
  type: 'gateway' | 'device';
  id: string;
  name: string;
  identifier: string;
  location?: string;
  application?: string;
}

interface ModernTopBarProps {
  gateways: Gateway[];
  endDevices: EndDevice[];
  onNavigate: (view: string, itemId?: string) => void;
  onLogout?: () => void;
}

export function ModernTopBar({ gateways, endDevices, onNavigate, onLogout }: ModernTopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close user info when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserInfo(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search logic
  const searchResults: SearchResult[] = [];
  
  if (searchQuery.trim().length >= 2) {
    const query = searchQuery.toLowerCase();

    // Search gateways
    gateways.forEach(gateway => {
      if (
        gateway.name.toLowerCase().includes(query) ||
        gateway.eui.toLowerCase().includes(query) ||
        gateway.location.toLowerCase().includes(query)
      ) {
        searchResults.push({
          type: 'gateway',
          id: gateway._id,
          name: gateway.name,
          identifier: gateway.eui,
          location: gateway.location,
        });
      }
    });

    // Search end devices
    endDevices.forEach(device => {
      if (
        device.name.toLowerCase().includes(query) ||
        device.devEUI.toLowerCase().includes(query)
      ) {
        searchResults.push({
          type: 'device',
          id: device._id,
          name: device.name,
          identifier: device.devEUI,
          application: device.application,
        });
      }
    });
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'gateway') {
      onNavigate('gateways', result.id);
    } else {
      onNavigate('enddevices', result.id);
    }
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 relative z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white mb-1">Network Overview</h1>
          <p className="text-sm text-slate-400">Real-time monitoring and analytics</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block z-[9999]" ref={searchRef}>
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 z-10" />
            <input
              type="text"
              placeholder="Quick search..."
              className="w-64 pl-10 pr-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent relative z-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
            />
            
            {/* Search Results Dropdown */}
            {showResults && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full mt-1 left-0 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden max-h-64 overflow-y-auto backdrop-blur-xl z-[99999] themed-scrollbar">
                {searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full px-4 py-3 hover:bg-slate-700/50 transition-colors text-left border-b border-slate-700/30 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1.5 rounded-lg ${
                            result.type === 'gateway' 
                              ? 'bg-blue-500/20' 
                              : 'bg-purple-500/20'
                          }`}>
                            {result.type === 'gateway' ? (
                              <Wifi className="w-4 h-4 text-blue-400" />
                            ) : (
                              <Radio className="w-4 h-4 text-purple-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate">
                                {result.name}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                result.type === 'gateway'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-purple-500/20 text-purple-400'
                              }`}>
                                {result.type === 'gateway' ? 'Gateway' : 'Device'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 font-mono truncate">
                              {result.identifier}
                            </div>
                            {(result.location || result.application) && (
                              <div className="text-xs text-slate-500 mt-1">
                                {result.type === 'gateway' ? result.location : result.application}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try searching by name, EUI, or location
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all group">
            <Bell className="w-5 h-5 text-slate-400 group-hover:text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
          </button>

          {/* Settings */}
          <button className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all group">
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-white" />
          </button>

          {/* User Profile */}
          <div className="relative" ref={userRef}>
            <div 
              className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg hover:bg-slate-700 transition-all cursor-pointer group border border-transparent hover:border-blue-500/30"
              onClick={() => setShowUserInfo(!showUserInfo)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden lg:block">
                <div className="text-sm text-white font-medium group-hover:text-blue-400 transition-colors">Admin User</div>
                <div className="text-xs text-slate-400">admin@lorawan.io</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-white hidden lg:block transition-transform ${showUserInfo ? 'rotate-180' : ''}`} />
            </div>

            {/* User Info Dropdown */}
            {showUserInfo && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden backdrop-blur-xl z-50">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold">Admin User</div>
                      <div className="text-blue-100 text-sm">admin@lorawan.io</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Role</div>
                    <div className="text-white font-medium">Administrator</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Active</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Last Login</div>
                    <div className="text-white">Today at 10:30 AM</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Permissions</div>
                    <div className="text-white text-sm">Full System Access</div>
                  </div>
                  <div className="pt-3 border-t border-slate-700 space-y-2">
                    <button className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white text-sm font-medium transition-all">
                      View Profile Settings
                    </button>
                    <button
                      onClick={() => onLogout?.()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-red-400 hover:text-red-300 text-sm font-medium transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}