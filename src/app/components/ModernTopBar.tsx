import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Settings, User, ChevronDown, Radio, Wifi, LogOut, Sun, Moon } from 'lucide-react';
import { ProfileSettings } from './ProfileSettings';

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
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export function ModernTopBar({ gateways, endDevices, onNavigate, onLogout, isDark, onToggleTheme }: ModernTopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', title: 'Gateway Offline', message: 'Gateway-West-05 has been offline for 2 days', time: '2 hours ago', read: false },
    { id: 2, type: 'success', title: 'Device Connected', message: 'Temperature Sensor 01 successfully connected', time: '3 hours ago', read: false },
    { id: 3, type: 'info', title: 'Firmware Update Available', message: 'New firmware v2.4.1 is available for 5 gateways', time: '5 hours ago', read: true },
    { id: 4, type: 'warning', title: 'Low Battery Alert', message: 'GPS Tracker 06 battery level is at 15%', time: '1 day ago', read: true },
    { id: 5, type: 'success', title: 'Integration Active', message: 'AWS IoT Core integration is now active', time: '2 days ago', read: true },
  ]);
  const searchRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

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

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
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
    <>
    {showProfileSettings && <ProfileSettings onBack={() => setShowProfileSettings(false)} />}
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

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all group"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-slate-400 group-hover:text-yellow-300 transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all group"
            >
              <Bell className="w-5 h-5 text-slate-400 group-hover:text-white" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden backdrop-blur-xl z-50">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
                  <h3 className="text-white font-bold">Notifications</h3>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white">
                    {notifications.filter(n => !n.read).length} new
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto themed-scrollbar">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer ${!notification.read ? 'bg-slate-700/20' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-lg ${
                          notification.type === 'warning' ? 'bg-yellow-500/20' :
                          notification.type === 'success' ? 'bg-green-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          <Bell className={`w-4 h-4 ${
                            notification.type === 'warning' ? 'text-yellow-400' :
                            notification.type === 'success' ? 'text-green-400' :
                            'text-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-slate-500 mt-2">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-slate-900/50 border-t border-slate-700">
                  <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all group"
          >
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
                    <button
                      onClick={() => { setShowUserInfo(false); setShowProfileSettings(true); }}
                      className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white text-sm font-medium transition-all"
                    >
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
    </>
  );
}