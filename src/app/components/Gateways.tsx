import { Plus, Layers, MapPin, Signal, Activity, MoreVertical, Eye, Trash2, CheckSquare, Square, Upload, Download, Share2, Filter, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GatewayForm } from './GatewayForm';
import { GatewayDetail } from './GatewayDetail';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';

interface Gateway {
  id: number;
  name: string;
  eui: string;
  location: string;
  status: string;
  devices: number;
  uptime: string;
  lastSeen: string;
  messages?: number;
  company?: string;
}

interface GatewaysProps {
  gateways: Gateway[];
  setGateways: (gateways: Gateway[]) => void;
  initialViewingGateway?: Gateway | null;
  onClearViewingGateway?: () => void;
  selectedGatewayId?: number;
  onClearSelectedGateway?: () => void;
}

export function Gateways({ gateways, setGateways, initialViewingGateway, onClearViewingGateway, selectedGatewayId, onClearSelectedGateway }: GatewaysProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingGateway, setViewingGateway] = useState<Gateway | null>(null);
  const [selectedGateways, setSelectedGateways] = useState<number[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingGateway, setSharingGateway] = useState<Gateway | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingGateway, setDeletingGateway] = useState<Gateway | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  
  // Timestamp tracking
  const [gatewayTimestamps, setGatewayTimestamps] = useState<Map<number, number>>(new Map());
  const [neverConnectedGateways, setNeverConnectedGateways] = useState<Set<number>>(new Set());
  const [, setCurrentTime] = useState(Date.now());
  
  // Filter and Sort state
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'none' | 'asc' | 'desc'>('none');

  // Handle initial viewing gateway from props
  useEffect(() => {
    if (initialViewingGateway) {
      setViewingGateway(initialViewingGateway);
      if (onClearViewingGateway) {
        onClearViewingGateway();
      }
    }
  }, [initialViewingGateway, onClearViewingGateway]);

  // Handle selected gateway from search
  useEffect(() => {
    if (selectedGatewayId) {
      const gateway = gateways.find(g => g.id === selectedGatewayId);
      if (gateway) {
        setViewingGateway(gateway);
      }
      if (onClearSelectedGateway) {
        onClearSelectedGateway();
      }
    }
  }, [selectedGatewayId, gateways, onClearSelectedGateway]);

  // Initialize timestamps for all gateways
  useEffect(() => {
    const initialTimestamps = new Map<number, number>();
    const neverConnected = new Set<number>();
    
    gateways.forEach((gateway, index) => {
      if (!gatewayTimestamps.has(gateway.id)) {
        // 15% chance of never connecting
        if (index % 7 === 0) {
          neverConnected.add(gateway.id);
          initialTimestamps.set(gateway.id, -1); // -1 indicates never connected
        } else {
          // Vary timestamps more
          const random = Math.random();
          if (random < 0.4) {
            // 40% recent (1-300 seconds)
            initialTimestamps.set(gateway.id, Math.floor(Math.random() * 300) + 1);
          } else if (random < 0.7) {
            // 30% medium (5-120 minutes)
            initialTimestamps.set(gateway.id, Math.floor(Math.random() * 6900) + 300);
          } else if (random < 0.9) {
            // 20% old (2-48 hours)
            initialTimestamps.set(gateway.id, Math.floor(Math.random() * 165600) + 7200);
          } else {
            // 10% very old (2-60 days)
            initialTimestamps.set(gateway.id, Math.floor(Math.random() * 5011200) + 172800);
          }
        }
      }
    });
    
    if (initialTimestamps.size > 0) {
      setGatewayTimestamps(prev => new Map([...prev, ...initialTimestamps]));
    }
    if (neverConnected.size > 0) {
      setNeverConnectedGateways(neverConnected);
    }
  }, [gateways]);

  // Update timestamps every second
  useEffect(() => {
    const interval = setInterval(() => {
      setGatewayTimestamps(prev => {
        const updated = new Map(prev);
        gateways.forEach(gateway => {
          if (!neverConnectedGateways.has(gateway.id)) {
            const current = updated.get(gateway.id) || 0;
            updated.set(gateway.id, current + 1);
          }
        });
        return updated;
      });
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gateways, neverConnectedGateways]);

  // Format timestamp to human readable
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

  const handleAdd = (data: any) => {
    const newGateway: Gateway = {
      id: gateways.length + 1,
      name: data.name,
      eui: data.eui,
      location: data.location,
      status: 'online',
      devices: 0,
      uptime: '99.9%',
      lastSeen: 'Just now',
    };

    setGateways([...gateways, newGateway]);
    setShowAddModal(false);
  };

  const handleDelete = (gateway: Gateway) => {
    setDeletingGateway(gateway);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingGateway) {
      setGateways(gateways.filter(g => g.id !== deletingGateway.id));
      setDeletingGateway(null);
    }
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    setGateways(gateways.filter(g => !selectedGateways.includes(g.id)));
    setSelectedGateways([]);
  };

  const toggleSelectAll = () => {
    if (selectedGateways.length === gateways.length) {
      setSelectedGateways([]);
    } else {
      setSelectedGateways(gateways.map(g => g.id));
    }
  };

  const toggleSelectGateway = (id: number) => {
    if (selectedGateways.includes(id)) {
      setSelectedGateways(selectedGateways.filter(g => g !== id));
    } else {
      setSelectedGateways([...selectedGateways, id]);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(gateways, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'gateways_export.json';
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
          setGateways([...gateways, ...imported]);
          alert('Gateways imported successfully!');
        } catch (error) {
          alert('Error importing gateways. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleShare = (company: string) => {
    alert(`Gateway \"${sharingGateway?.name}\" shared with ${company}`);
    setShowShareModal(false);
    setSharingGateway(null);
  };

  // Convert time string to minutes for sorting
  const parseLastSeen = (lastSeen: string): number => {
    if (lastSeen.includes('Just now')) return 0;
    if (lastSeen.includes('sec')) return parseFloat(lastSeen) / 60;
    if (lastSeen.includes('min')) return parseFloat(lastSeen);
    if (lastSeen.includes('hour')) return parseFloat(lastSeen) * 60;
    if (lastSeen.includes('day')) return parseFloat(lastSeen) * 1440;
    return 0;
  };

  // Apply filters and sorting
  const getFilteredAndSortedGateways = () => {
    let filtered = gateways;

    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter(g => g.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.eui.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.company && g.company.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting
    if (sortBy !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        const aTime = parseLastSeen(a.lastSeen);
        const bTime = parseLastSeen(b.lastSeen);
        return sortBy === 'asc' ? aTime - bTime : bTime - aTime;
      });
    }

    return filtered;
  };

  const filteredGateways = getFilteredAndSortedGateways();

  const handleLastSeenSort = () => {
    if (sortBy === 'none') {
      setSortBy('asc');
    } else if (sortBy === 'asc') {
      setSortBy('desc');
    } else {
      setSortBy('none');
    }
  };

  // If viewing a gateway, show the detail view
  if (viewingGateway) {
    return <GatewayDetail gateway={viewingGateway} onBack={() => setViewingGateway(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Gateways</h2>
          <p className="text-slate-400">Monitor and manage your network gateways</p>
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
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Gateway
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{gateways.filter(g => g.status === 'online').length}</div>
              <div className="text-xs text-slate-400">Online</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center">
              <Signal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{gateways.filter(g => g.status === 'warning').length}</div>
              <div className="text-xs text-slate-400">Warning</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{gateways.filter(g => g.status === 'offline').length}</div>
              <div className="text-xs text-slate-400">Offline</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{gateways.reduce((acc, g) => acc + g.devices, 0)}</div>
              <div className="text-xs text-slate-400">Total Devices</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gateways Table */}
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
                placeholder="Search by name, EUI or location..."
                className="pl-10 pr-4 py-2 w-64 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="online">Online</option>
              <option value="warning">Warning</option>
              <option value="offline">Offline</option>
            </select>
            {filterStatus && (
              <button
                onClick={() => setFilterStatus('')}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
          {selectedGateways.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <span className="text-blue-400 text-sm font-semibold">
                  {selectedGateways.length} gateway{selectedGateways.length > 1 ? 's' : ''} selected
                </span>
              </div>
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
                <th className="py-4 px-6">
                  <button onClick={toggleSelectAll} className="flex items-center justify-center">
                    {selectedGateways.length === gateways.length ? (
                      <CheckSquare className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Gateway</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Company</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Location</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Devices</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Uptime</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">
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
                <th className="text-right py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGateways.map((gateway) => (
                <tr 
                  key={gateway.id} 
                  className={`border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors group ${
                    selectedGateways.includes(gateway.id) ? 'bg-blue-500/20 border-blue-500/50' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <button onClick={() => toggleSelectGateway(gateway.id)}>
                      {selectedGateways.includes(gateway.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                        gateway.status === 'online' ? 'bg-gradient-to-br from-green-600 to-emerald-600' :
                        gateway.status === 'warning' ? 'bg-gradient-to-br from-yellow-600 to-orange-600' :
                        'bg-gradient-to-br from-gray-600 to-slate-600'
                      }`}>
                        <Layers className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div 
                          onClick={() => setViewingGateway(gateway)}
                          className="text-sm font-medium text-white hover:text-blue-400 cursor-pointer transition-colors"
                        >
                          {gateway.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{gateway.eui}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-white">{gateway.company || '-'}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-white">{gateway.location}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      gateway.status === 'online' ? 'bg-green-500/20 text-green-400' :
                      gateway.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        gateway.status === 'online' ? 'bg-green-400 animate-pulse' :
                        gateway.status === 'warning' ? 'bg-yellow-400' :
                        'bg-gray-400'
                      }`}></div>
                      {gateway.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-white font-medium">{gateway.devices}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-white">{gateway.uptime}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {neverConnectedGateways.has(gateway.id) ? (
                        <>
                          <span className="text-sm text-red-400 font-medium">Never</span>
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-slate-300">{formatTimestamp(gatewayTimestamps.get(gateway.id) || 0)}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setSharingGateway(gateway);
                          setShowShareModal(true);
                        }}
                        className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-purple-400" />
                      </button>
                      <button 
                        onClick={() => handleDelete(gateway)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                      <button className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <GatewayForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
      />

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSharingGateway(null);
        }}
        title={`Share Gateway: ${sharingGateway?.name}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-sm">Select a company to share this gateway with:</p>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Gateway"
        message={`Are you sure you want to delete the gateway "${deletingGateway?.name}"?`}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Gateways"
        message={`Are you sure you want to delete ${selectedGateways.length} selected gateways?`}
      />
    </div>
  );
}