import { useState, useEffect } from 'react';
import { Radio, Plus, Edit2, Trash2, Eye, Battery, Signal, CheckSquare, Square, Download, Clock, Upload, Share2, Filter, ArrowUpDown, ArrowUp, ArrowDown, Search, Send } from 'lucide-react';
import { DeviceDetail } from './DeviceDetail';
import { Modal } from './Modal';
import { Downlink } from './Downlink';
import { ConfirmDialog } from './ConfirmDialog';

interface EndDevice {
  id: number;
  name: string;
  devEUI: string;
  application: string;
  brand: string;
  company: string;
  status: string;
  battery: number;
  rssi: number;
  lastSeen: string;
  createdAt: string;
  connectedGateways?: Array<{ eui: string; rssi: number }>;
}

interface EndDevicesProps {
  endDevices: EndDevice[];
  setEndDevices: (devices: EndDevice[]) => void;
  applications: any[];
  gateways: any[];
  onViewGateway: (gateway: any) => void;
  selectedDeviceId?: number;
  onClearSelectedDevice?: () => void;
}

export function EndDevices({ endDevices, setEndDevices, applications, gateways, onViewGateway, selectedDeviceId, onClearSelectedDevice }: EndDevicesProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<EndDevice | null>(null);
  const [viewingDevice, setViewingDevice] = useState<EndDevice | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingDevice, setSharingDevice] = useState<EndDevice | null>(null);
  const [showDownlink, setShowDownlink] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingDevice, setDeletingDevice] = useState<EndDevice | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  
  // Filter and Sort state
  const [filterApplication, setFilterApplication] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'none' | 'asc' | 'desc'>('none');
  const [sortByBattery, setSortByBattery] = useState<'none' | 'asc' | 'desc'>('none');
  const [sortByCreated, setSortByCreated] = useState<'none' | 'asc' | 'desc'>('none');
  
  // Track last seen timestamps for each device (in seconds since last data)
  const [deviceTimestamps, setDeviceTimestamps] = useState<Map<number, number>>(new Map());
  
  // Track devices that never connected
  const [neverConnectedDevices, setNeverConnectedDevices] = useState<Set<number>>(new Set());
  
  // Track devices that are currently blinking
  const [blinkingDevices, setBlinkingDevices] = useState<Set<number>>(new Set());
  
  // Force re-render every second to update times
  const [, setCurrentTime] = useState(Date.now());
  
  // Handle selected device from search
  useEffect(() => {
    if (selectedDeviceId) {
      const device = endDevices.find(d => d.id === selectedDeviceId);
      if (device) {
        setViewingDevice(device);
      }
      if (onClearSelectedDevice) {
        onClearSelectedDevice();
      }
    }
  }, [selectedDeviceId, endDevices, onClearSelectedDevice]);
  
  // Initialize timestamps for all devices
  useEffect(() => {
    const initialTimestamps = new Map<number, number>();
    const neverConnected = new Set<number>();
    
    endDevices.forEach((device, index) => {
      if (!deviceTimestamps.has(device.id)) {
        // 20% chance of never connecting
        if (index % 5 === 0) {
          neverConnected.add(device.id);
          initialTimestamps.set(device.id, -1); // -1 indicates never connected
        } else {
          // Vary timestamps more: some recent, some old
          const random = Math.random();
          if (random < 0.3) {
            // 30% recent (1-60 seconds)
            initialTimestamps.set(device.id, Math.floor(Math.random() * 60) + 1);
          } else if (random < 0.6) {
            // 30% medium (1-60 minutes = 60-3600 seconds)
            initialTimestamps.set(device.id, Math.floor(Math.random() * 3540) + 60);
          } else if (random < 0.85) {
            // 25% old (1-24 hours = 3600-86400 seconds)
            initialTimestamps.set(device.id, Math.floor(Math.random() * 82800) + 3600);
          } else {
            // 15% very old (1-30 days = 86400-2592000 seconds)
            initialTimestamps.set(device.id, Math.floor(Math.random() * 2505600) + 86400);
          }
        }
      }
    });
    
    if (initialTimestamps.size > 0) {
      setDeviceTimestamps(prev => new Map([...prev, ...initialTimestamps]));
    }
    if (neverConnected.size > 0) {
      setNeverConnectedDevices(neverConnected);
    }
  }, [endDevices]);
  
  // Update all timestamps every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceTimestamps(prev => {
        const updated = new Map(prev);
        endDevices.forEach(device => {
          // Don't update timestamp for never connected devices
          if (!neverConnectedDevices.has(device.id)) {
            const current = updated.get(device.id) || 0;
            updated.set(device.id, current + 1);
          }
        });
        return updated;
      });
      setCurrentTime(Date.now()); // Force re-render
    }, 1000);
    
    return () => clearInterval(interval);
  }, [endDevices, neverConnectedDevices]);
  
  // Simulate data reception - reset timestamp and show blue blinking dot
  useEffect(() => {
    const interval = setInterval(() => {
      const activeDevices = endDevices.filter(d => d.status === 'active');
      if (activeDevices.length > 0) {
        const randomDevice = activeDevices[Math.floor(Math.random() * activeDevices.length)];
        
        // Reset timestamp to 1 second
        setDeviceTimestamps(prev => {
          const updated = new Map(prev);
          updated.set(randomDevice.id, 1);
          return updated;
        });
        
        // Add to blinking devices
        setBlinkingDevices(prev => new Set(prev).add(randomDevice.id));
        
        // Remove blinking after 2 seconds
        setTimeout(() => {
          setBlinkingDevices(prev => {
            const updated = new Set(prev);
            updated.delete(randomDevice.id);
            return updated;
          });
        }, 2000);
      }
    }, 4000); // Trigger every 4 seconds
    
    return () => clearInterval(interval);
  }, [endDevices]);
  
  // Format timestamp to human readable format
  const formatTimestamp = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} sec ago`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} min ago`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(seconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };
  
  const [formData, setFormData] = useState({
    name: '',
    devEUI: '',
    application: '',
    appKey: '',
    appEUI: '',
  });

  const handleAdd = () => {
    const newDevice: EndDevice = {
      id: endDevices.length + 1,
      name: formData.name,
      devEUI: formData.devEUI,
      application: formData.application,
      brand: 'Brand X',
      company: 'Company A',
      status: 'active',
      battery: 100,
      rssi: -65,
      lastSeen: 'Just now',
      createdAt: new Date().toISOString(),
    };

    setEndDevices([...endDevices, newDevice]);
    setShowAddModal(false);
    setFormData({ name: '', devEUI: '', application: '', appKey: '', appEUI: '' });
  };

  const handleDelete = (device: EndDevice) => {
    setDeletingDevice(device);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingDevice) {
      setEndDevices(endDevices.filter(d => d.id !== deletingDevice.id));
      setDeletingDevice(null);
    }
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    setEndDevices(endDevices.filter(d => !selectedDevices.includes(d.id)));
    setSelectedDevices([]);
  };

  const handleEdit = (device: EndDevice) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      devEUI: device.devEUI,
      application: device.application,
      appKey: '',
      appEUI: '',
    });
    setShowAddModal(true);
  };

  const handleUpdate = () => {
    if (editingDevice) {
      setEndDevices(endDevices.map(d => 
        d.id === editingDevice.id 
          ? { ...d, name: formData.name, devEUI: formData.devEUI, application: formData.application }
          : d
      ));
      setShowAddModal(false);
      setEditingDevice(null);
      setFormData({ name: '', devEUI: '', application: '', appKey: '', appEUI: '' });
    }
  };

  const toggleSelectAll = () => {
    if (selectedDevices.length === endDevices.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(endDevices.map(d => d.id));
    }
  };

  const toggleSelectDevice = (id: number) => {
    if (selectedDevices.includes(id)) {
      setSelectedDevices(selectedDevices.filter(d => d !== id));
    } else {
      setSelectedDevices([...selectedDevices, id]);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(endDevices, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'devices_export.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setEndDevices([...endDevices, ...imported]);
          alert('Devices imported successfully!');
        } catch (error) {
          alert('Error importing devices. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleShare = (company: string) => {
    alert(`Device \"${sharingDevice?.name}\" shared with ${company}`);
    setShowShareModal(false);
    setSharingDevice(null);
  };

  // Apply filters and sorting
  const getFilteredAndSortedDevices = () => {
    let filtered = endDevices;

    // Apply application filter
    if (filterApplication) {
      filtered = filtered.filter(d => d.application === filterApplication);
    }

    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter(d => d.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.devEUI.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        const aTime = deviceTimestamps.get(a.id);
        const bTime = deviceTimestamps.get(b.id);
        
        // Handle undefined timestamps (treat as never connected)
        const aValue = aTime === undefined ? -1 : aTime;
        const bValue = bTime === undefined ? -1 : bTime;
        
        // Handle never connected devices (-1) - always at the end
        if (aValue === -1 && bValue === -1) return 0;
        if (aValue === -1) return 1; // Never connected always goes to end
        if (bValue === -1) return -1; // Never connected always goes to end
        
        // For asc: smaller timestamp (more recent) comes first (less time at top)
        // For desc: larger timestamp (older) comes first (more time at top)
        return sortBy === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    if (sortByBattery !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        return sortByBattery === 'asc' ? a.battery - b.battery : b.battery - a.battery;
      });
    }

    if (sortByCreated !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        const aDate = new Date(a.createdAt);
        const bDate = new Date(b.createdAt);
        return sortByCreated === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      });
    }

    return filtered;
  };

  const filteredDevices = getFilteredAndSortedDevices();

  const handleLastSeenSort = () => {
    if (sortBy === 'none') {
      setSortBy('asc');
    } else if (sortBy === 'asc') {
      setSortBy('desc');
    } else {
      setSortBy('none');
    }
  };

  const handleBatterySort = () => {
    if (sortByBattery === 'none') {
      setSortByBattery('asc');
    } else if (sortByBattery === 'asc') {
      setSortByBattery('desc');
    } else {
      setSortByBattery('none');
    }
  };

  const handleCreatedSort = () => {
    if (sortByCreated === 'none') {
      setSortByCreated('asc');
    } else if (sortByCreated === 'asc') {
      setSortByCreated('desc');
    } else {
      setSortByCreated('none');
    }
  };

  const formatCreatedDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // If viewing a device, show the detail view
  if (viewingDevice) {
    return <DeviceDetail device={viewingDevice} onBack={() => setViewingDevice(null)} />;
  }

  // If showing downlink, show the downlink view
  if (showDownlink) {
    const selectedDevicesData = endDevices.filter(d => selectedDevices.includes(d.id));
    return (
      <Downlink 
        selectedDevices={selectedDevicesData} 
        onBack={() => {
          setShowDownlink(false);
          setSelectedDevices([]);
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">End Devices</h2>
          <p className="text-slate-400">Manage your LoRaWAN end devices</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white font-medium cursor-pointer transition-all">
            <Upload className="w-5 h-5" />
            Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white font-medium transition-all"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          <button 
            onClick={() => {
              setEditingDevice(null);
              setFormData({ name: '', devEUI: '', application: '', appKey: '', appEUI: '' });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Device
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{endDevices.filter(d => d.status === 'active').length}</div>
              <div className="text-xs text-slate-400">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Signal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{endDevices.length}</div>
              <div className="text-xs text-slate-400">Total Devices</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center">
              <Battery className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {Math.round(endDevices.reduce((acc, d) => acc + d.battery, 0) / endDevices.length)}%
              </div>
              <div className="text-xs text-slate-400">Avg Battery</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Signal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {Math.round(endDevices.reduce((acc, d) => acc + d.rssi, 0) / endDevices.length)} dBm
              </div>
              <div className="text-xs text-slate-400">Avg RSSI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or EUI..."
                className="pl-10 pr-4 py-2 w-64 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filterApplication}
              onChange={(e) => setFilterApplication(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Applications</option>
              {applications.map((app) => (
                <option key={app.id} value={app.name}>{app.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {(filterApplication || filterStatus) && (
              <button
                onClick={() => {
                  setFilterApplication('');
                  setFilterStatus('');
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
          {selectedDevices.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <span className="text-blue-400 text-sm font-semibold">
                  {selectedDevices.length} device{selectedDevices.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <button 
                onClick={() => setShowDownlink(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50 rounded-lg text-white text-sm font-medium transition-all"
              >
                <Send className="w-4 h-4" />
                Downlink
              </button>
              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto hide-scrollbar">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700/50 sticky top-0 z-10">
              <tr>
                <th className="py-4 px-3">
                  <button onClick={toggleSelectAll} className="flex items-center justify-center">
                    {selectedDevices.length === endDevices.length ? (
                      <CheckSquare className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="text-left py-4 px-3 text-xs text-slate-400 uppercase tracking-wider">Device</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Application</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Company</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={handleBatterySort}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    Battery
                    {sortByBattery === 'none' && <ArrowUpDown className="w-4 h-4" />}
                    {sortByBattery === 'asc' && <ArrowUp className="w-4 h-4 text-blue-400" />}
                    {sortByBattery === 'desc' && <ArrowDown className="w-4 h-4 text-blue-400" />}
                  </button>
                </th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Signal</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Gateways</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider w-60">
                  <button 
                    onClick={handleLastSeenSort}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    Last Seen
                    {sortBy === 'none' && <ArrowUpDown className="w-4 h-4" />}
                    {sortBy === 'asc' && <ArrowUp className="w-4 h-4 text-blue-400" />}
                    {sortBy === 'desc' && <ArrowDown className="w-4 h-4 text-blue-400" />}
                  </button>
                </th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={handleCreatedSort}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    Created
                    {sortByCreated === 'none' && <ArrowUpDown className="w-4 h-4" />}
                    {sortByCreated === 'asc' && <ArrowUp className="w-4 h-4 text-blue-400" />}
                    {sortByCreated === 'desc' && <ArrowDown className="w-4 h-4 text-blue-400" />}
                  </button>
                </th>
                <th className="text-right py-4 px-6 text-xs text-slate-400 uppercase tracking-wider w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device) => (
                <tr 
                  key={device.id}
                  className={`border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors group ${
                    selectedDevices.includes(device.id) ? 'bg-blue-500/20 border-blue-500/50' : ''
                  }`}
                >
                  <td className="py-4 px-3">
                    <button onClick={() => toggleSelectDevice(device.id)}>
                      {selectedDevices.includes(device.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        device.status === 'active'
                          ? 'bg-gradient-to-br from-green-600 to-emerald-600'
                          : 'bg-gradient-to-br from-gray-600 to-slate-600'
                      }`}>
                        <Radio className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div 
                          onClick={() => setViewingDevice(device)}
                          className="text-sm font-medium text-white hover:text-blue-400 cursor-pointer transition-colors"
                        >
                          {device.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{device.devEUI.replace(/-/g, '')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-sm text-white">{device.application}</div>
                      <div className="text-xs text-slate-500">{device.brand}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-white">{device.company}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      device.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        device.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                      }`}></div>
                      {device.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Battery className={`w-4 h-4 ${
                        device.battery > 70 ? 'text-green-400' :
                        device.battery > 30 ? 'text-yellow-400' :
                        'text-red-400'
                      }`} />
                      <span className="text-sm text-white">{device.battery}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Signal className={`w-4 h-4 ${
                        device.rssi > -70 ? 'text-green-400' :
                        device.rssi > -85 ? 'text-yellow-400' :
                        'text-red-400'
                      }`} />
                      <span className="text-sm text-white whitespace-nowrap">{device.rssi} dBm</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {device.connectedGateways && device.connectedGateways.length > 0 ? (
                        device.connectedGateways.map((gw, index) => {
                          const gatewayInfo = gateways.find(g => g.eui === gw.eui);
                          return (
                            <div 
                              key={index}
                              onClick={() => {
                                if (gatewayInfo) {
                                  onViewGateway(gatewayInfo);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-400/40 rounded-md text-xs font-mono hover:from-violet-500/30 hover:to-purple-500/30 hover:border-violet-400/60 cursor-pointer transition-all group"
                              title={`Gateway: ${gw.eui}\nRSSI: ${gw.rssi} dBm`}
                            >
                              <span className="text-violet-300 group-hover:text-violet-200">{gw.eui}</span>
                              <span className="text-slate-400">•</span>
                              <span className={`font-semibold ${
                                gw.rssi > -70 ? 'text-emerald-400' :
                                gw.rssi > -85 ? 'text-amber-400' :
                                'text-rose-400'
                              }`}>
                                {gw.rssi}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-500">No gateways</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 flex-nowrap">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      {neverConnectedDevices.has(device.id) ? (
                        <>
                          <span className="text-sm text-red-400 whitespace-nowrap font-medium">Never</span>
                          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-slate-300 whitespace-nowrap">{formatTimestamp(deviceTimestamps.get(device.id) || 0)}</span>
                          <div className={`w-2 h-2 rounded-full bg-blue-400 transition-all duration-500 flex-shrink-0 ${
                            blinkingDevices.has(device.id) ? 'animate-ping' : ''
                          }`}></div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-300">{formatCreatedDate(device.createdAt)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setSharingDevice(device);
                          setShowShareModal(true);
                        }}
                        className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-purple-400" />
                      </button>
                      <button 
                        onClick={() => handleEdit(device)}
                        className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-green-400" />
                      </button>
                      <button 
                        onClick={() => handleDelete(device)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingDevice(null);
        }}
        title={editingDevice ? 'Edit End Device' : 'Add New End Device'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Device Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Temperature Sensor 01"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Device EUI *</label>
            <input
              type="text"
              value={formData.devEUI}
              onChange={(e) => setFormData({ ...formData, devEUI: e.target.value })}
              placeholder="70-B3-D5-7E-D0-06-6E-81"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Application *</label>
            <select
              value={formData.application}
              onChange={(e) => setFormData({ ...formData, application: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select application</option>
              {applications.map((app) => (
                <option key={app.id} value={app.name}>{app.name}</option>
              ))}
            </select>
          </div>

          {!editingDevice && (
            <>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Application EUI</label>
                <input
                  type="text"
                  value={formData.appEUI}
                  onChange={(e) => setFormData({ ...formData, appEUI: e.target.value })}
                  placeholder="00-00-00-00-00-00-00-00"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Application Key</label>
                <input
                  type="text"
                  value={formData.appKey}
                  onChange={(e) => setFormData({ ...formData, appKey: e.target.value })}
                  placeholder="00000000000000000000000000000000"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingDevice(null);
              }}
              className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={editingDevice ? handleUpdate : handleAdd}
              disabled={!formData.name || !formData.devEUI || !formData.application}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingDevice ? 'Update Device' : 'Add Device'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSharingDevice(null);
        }}
        title={`Share Device: ${sharingDevice?.name}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-sm">Select a company to share this device with:</p>
          <div className="space-y-2">
            {['Company A', 'Company B', 'Company C', 'Company D'].map((company) => (
              <button
                key={company}
                onClick={() => handleShare(company)}
                className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white text-left transition-all"
              >
                {company}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Device"
        message={`Are you sure you want to delete the device "${deletingDevice?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        title="Delete Selected Devices"
        message={`Are you sure you want to delete ${selectedDevices.length} selected device${selectedDevices.length > 1 ? 's' : ''}? This action cannot be undone.`}
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}