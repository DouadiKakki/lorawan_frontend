import { Plus, Layers, MapPin, Signal, Activity, Eye, Trash2, CheckSquare, Square, Upload, Download, Share2, Filter, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { GatewayForm } from './GatewayForm';
import { GatewayDetail } from './GatewayDetail';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';
import { SuccessMessage } from './SuccessMessage';

interface Gateway {
  _id: string;
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
  onCreate: (data: any) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  initialViewingGateway?: Gateway | null;
  onClearViewingGateway?: () => void;
  selectedGatewayId?: string;
  onClearSelectedGateway?: () => void;
}

export function Gateways({ gateways, onCreate, onUpdate, onDelete, initialViewingGateway, onClearViewingGateway, selectedGatewayId, onClearSelectedGateway }: GatewaysProps) {
  const { data: companies = [] } = useCompanies();
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingGateway, setViewingGateway] = useState<Gateway | null>(null);
  const [selectedGateways, setSelectedGateways] = useState<string[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingGateway, setSharingGateway] = useState<Gateway | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingGateway, setDeletingGateway] = useState<Gateway | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', description: '' });

  const showMsg = (title: string, description: string) => {
    setSuccessMessage({ title, description });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

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
      const gateway = gateways.find(g => g._id === selectedGatewayId);
      if (gateway) {
        setViewingGateway(gateway);
      }
      if (onClearSelectedGateway) {
        onClearSelectedGateway();
      }
    }
  }, [selectedGatewayId, gateways, onClearSelectedGateway]);

  // Restore viewed gateway from URL on refresh
  const restoredFromUrl = useRef(false);
  useEffect(() => {
    if (restoredFromUrl.current) return;
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      restoredFromUrl.current = true;
      return;
    }
    const gateway = gateways.find(g => g._id === id);
    if (gateway) {
      setViewingGateway(gateway);
      restoredFromUrl.current = true;
    }
  }, [gateways]);

  // Keep URL in sync with viewed gateway
  useEffect(() => {
    if (!restoredFromUrl.current) return;
    const params = new URLSearchParams(window.location.search);
    if (viewingGateway) {
      params.set('id', viewingGateway._id);
    } else {
      params.delete('id');
    }
    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [viewingGateway]);

  // Re-render every 30s so "X ago" stays fresh
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const formatLastSeen = (lastSeen?: string | Date): string => {
    if (!lastSeen) return 'Never';
    const seconds = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 1000);
    if (seconds < 60) return '1min ago';// `${seconds} sec ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) { const h = Math.floor(seconds / 3600); return `${h} hour${h > 1 ? 's' : ''} ago`; }
    const d = Math.floor(seconds / 86400);
    return `${d} day${d > 1 ? 's' : ''} ago`;
  };

  const handleAdd = (data: any) => {
    const selectedCompany = (companies as any[]).find((c: any) => c.name === data.company);
    onCreate({ name: data.name, eui: data.eui, location: data.location, companyId: selectedCompany?._id || undefined });
    setShowAddModal(false);
    showMsg('Gateway Added!', `${data.name} has been added successfully`);
  };

  const handleDelete = (gateway: Gateway) => {
    setDeletingGateway(gateway);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingGateway) {
      onDelete(deletingGateway._id);
      showMsg('Gateway Deleted!', `${deletingGateway.name} has been removed successfully`);
      setDeletingGateway(null);
    }
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    const count = selectedGateways.length;
    selectedGateways.forEach(id => {
      const gw = gateways.find(g => g._id === id);
      if (gw) onDelete(gw._id);
    });
    setSelectedGateways([]);
    showMsg('Gateways Deleted!', `${count} gateway${count > 1 ? 's' : ''} removed successfully`);
  };

  const toggleSelectAll = () => {
    if (selectedGateways.length === gateways.length) {
      setSelectedGateways([]);
    } else {
      setSelectedGateways(gateways.map(g => g._id));
    }
  };

  const toggleSelectGateway = (id: string) => {
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
          imported.forEach((gw: any) => onCreate({ name: gw.name, eui: gw.eui, location: gw.location }));
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

  const parseLastSeen = (lastSeen: string): number => {
    if (!lastSeen) return Infinity;
    const t = new Date(lastSeen).getTime();
    return isNaN(t) ? Infinity : Date.now() - t;
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
        ((g as any).companyId?.name ?? g.company ?? '').toLowerCase().includes(searchQuery.toLowerCase())
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
    const liveGateway = gateways.find(g => g._id === viewingGateway._id) ?? viewingGateway;
    return <GatewayDetail gateway={liveGateway} onBack={() => setViewingGateway(null)} onUpdate={onUpdate} onDelete={onDelete} />;
  }

  return (
    <div className="space-y-6">
      <SuccessMessage show={showSuccess} message={successMessage.title} description={successMessage.description} />
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
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto themed-scrollbar">
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
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Brand</th>
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
                  key={gateway._id} 
                  className={`border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors group ${
                    selectedGateways.includes(gateway._id) ? 'bg-blue-500/20 border-blue-500/50' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <button onClick={() => toggleSelectGateway(gateway._id)}>
                      {selectedGateways.includes(gateway._id) ? (
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
                        <div className="text-xs text-slate-400 font-mono">{gateway.eui?.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-white">{(gateway as any).brand ?? '-'}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-white">{(gateway as any).companyId?.name ?? gateway.company ?? '-'}</span>
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
                    <span className={`text-sm ${(gateway as any).lastSeen ? 'text-slate-300' : 'text-red-400 font-medium'}`}>
                      {formatLastSeen((gateway as any).lastSeen)}
                    </span>
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
                      <button
                        onClick={() => setViewingGateway(gateway)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-blue-400" />
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
            {(companies as any[]).map((company) => (
              <button
                key={company._id}
                onClick={() => handleShare(company.name)}
                className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white text-left transition-all"
              >
                {company.name}
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