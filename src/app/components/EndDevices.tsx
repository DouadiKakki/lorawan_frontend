import { useState, useEffect, useRef } from 'react';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { useEndDevices } from '@/lib/hooks/useEndDevices';
import { useUplinkStatsInterval } from '@/lib/hooks/useUplinkStats';
import { Radio, Plus, Edit2, Trash2, Battery, Signal, CheckSquare, Square, Download, Clock, Upload, Share2, Filter, ArrowUpDown, ArrowUp, ArrowDown, Search, Send, WifiOff, MoreVertical, Power, PowerOff } from 'lucide-react';
import { DeviceDetail } from './DeviceDetail';
import { Modal } from './Modal';
import { Downlink } from './Downlink';
import { ConfirmDialog } from './ConfirmDialog';
import { DeviceLocationMap } from './DeviceLocationMap';
import { SuccessMessage } from './SuccessMessage';
import { LoadingMessage } from './LoadingMessage';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface EndDevice {
  _id: string;
  name: string;
  devEUI: string;
  devAddr?: string;
  appSKey?: string;
  nwkSKey?: string;
  application: string;
  brand: string;
  company: string;
  status: string;
  disabled?: boolean;
  battery: number;
  rssi: number;
  lastSeen: string;
  createdAt: string;
  connectedGateways?: Array<{ gatewayEUI: string; rssi: number }>;
}

interface EndDevicesProps {
  endDevices: EndDevice[];
  onCreate: (data: any) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  applications: any[];
  gateways: any[];
  onViewGateway: (gateway: any) => void;
  selectedDeviceId?: string;
  onClearSelectedDevice?: () => void;
}

export function EndDevices({ endDevices, onCreate, onDelete, applications, gateways, onViewGateway, selectedDeviceId, onClearSelectedDevice }: EndDevicesProps) {
  const { data: companies = [] } = useCompanies();
  const { update: updateDevice, create: createDevice, activate: activateDevice, deactivate: deactivateDevice } = useEndDevices();
  const { data: uplinkIntervals = {} } = useUplinkStatsInterval();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState({ title: '', description: '' });
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState({ title: '', description: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<EndDevice | null>(null);
  const [viewingDevice, setViewingDevice] = useState<EndDevice | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
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

  // Force re-render every second to update relative times
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Handle selected device from search
  useEffect(() => {
    if (selectedDeviceId) {
      const device = endDevices.find(d => d._id === selectedDeviceId);
      if (device) {
        setViewingDevice(device);
      }
      if (onClearSelectedDevice) {
        onClearSelectedDevice();
      }
    }
  }, [selectedDeviceId, endDevices, onClearSelectedDevice]);

  // Restore viewed device from URL on refresh
  const restoredFromUrl = useRef(false);
  useEffect(() => {
    if (restoredFromUrl.current) return;
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      restoredFromUrl.current = true;
      return;
    }
    const device = endDevices.find(d => d._id === id);
    if (device) {
      setViewingDevice(device);
      restoredFromUrl.current = true;
    }
  }, [endDevices]);

  // Keep URL in sync with viewed device
  useEffect(() => {
    if (!restoredFromUrl.current) return;
    const params = new URLSearchParams(window.location.search);
    if (viewingDevice) {
      params.set('id', viewingDevice._id);
    } else {
      params.delete('id');
      params.delete('tab');
    }
    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [viewingDevice]);


  // Re-render every second so relative times stay fresh
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatLastSeen = (lastSeen: string | undefined): string => {
    if (!lastSeen) return 'Never';
    const diffMs = currentTime - new Date(lastSeen).getTime();
    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 0) return 'Just now';
    if (seconds < 60) return `${seconds} sec ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) { const h = Math.floor(seconds / 3600); return `${h} hour${h > 1 ? 's' : ''} ago`; }
    const d = Math.floor(seconds / 86400);
    return `${d} day${d > 1 ? 's' : ''} ago`;
  };

  const formatInterval = (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    devEUI: '',
    application: '',
    company: '',
    appKey: '',
    nwkKey: '',
    appEUI: '',
    locationType: 'inherited' as 'inherited' | 'manual',
    latitude: '',
    longitude: '',
    frequencyPlan: '',
    lorawanVersion: '',
    regionalParams: '',
    activationMode: 'OTAA',
    lorawanClass: 'None (class A only)',
    useNetworkDefaults: true,
    skipJoinServer: false,
  });

  const emptyForm = {
    name: '', devEUI: '', application: '', company: '', appKey: '', nwkKey: '', appEUI: '',
    locationType: 'inherited' as 'inherited' | 'manual', latitude: '', longitude: '',
    frequencyPlan: '', lorawanVersion: '', regionalParams: '', activationMode: 'OTAA',
    lorawanClass: 'None (class A only)', useNetworkDefaults: true, skipJoinServer: false,
  };

  const buildDevicePayload = (selectedApp: any, selectedCompany: any) => ({
    name: formData.name,
    devEUI: formData.devEUI,
    applicationId: selectedApp?._id || undefined,
    companyId: selectedCompany?._id || undefined,
    joinEUI: formData.appEUI || undefined,
    appKey: formData.appKey || undefined,
    nwkKey: formData.nwkKey || undefined,
    locationType: formData.locationType,
    latitude: formData.locationType === 'manual' && formData.latitude ? parseFloat(formData.latitude) : undefined,
    longitude: formData.locationType === 'manual' && formData.longitude ? parseFloat(formData.longitude) : undefined,
    frequencyPlan: formData.frequencyPlan || undefined,
    lorawanVersion: formData.lorawanVersion || undefined,
    regionalParametersVersion: formData.regionalParams || undefined,
    activationMode: formData.activationMode,
    supportsClassB: formData.lorawanClass === 'Class B (Beaconing)' || formData.lorawanClass === 'Class B and class C',
    supportsClassC: formData.lorawanClass === 'Class C (Continuous)' || formData.lorawanClass === 'Class B and class C',
    useNetworkDefaults: formData.useNetworkDefaults,
    skipJoinServer: formData.skipJoinServer,
  });

  const handleAdd = () => {
    const selectedApp = applications.find((a: any) => a.name === formData.application);
    const selectedCompany = (companies as any[]).find((c: any) => c.name === formData.company);
    const deviceName = formData.name;
    setShowAddModal(false);
    setLoadingMsg({ title: 'Adding Device', description: `Registering ${deviceName}...` });
    setShowLoading(true);
    createDevice.mutate(
      buildDevicePayload(selectedApp, selectedCompany),
      {
        onSuccess: () => {
          setShowLoading(false);
          setSuccessMsg({ title: 'Device Added', description: `${deviceName} has been added successfully.` });
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          toast.success('Device added');
        },
        onError: () => {
          setShowLoading(false);
          toast.error('Failed to add device');
        },
      }
    );
    setFormData(emptyForm);
    setFormStep(1);
  };

  const handleDelete = (device: EndDevice) => {
    setDeletingDevice(device);
    setShowDeleteConfirm(true);
  };

  const handleToggleActive = (device: EndDevice) => {
    if (device.disabled) {
      activateDevice.mutate(device._id, {
        onSuccess: () => {
          setSuccessMsg({ title: 'Device Activated', description: `${device.name} can rejoin the network.` });
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          toast.success('Device activated');
        },
        onError: () => toast.error('Failed to activate device'),
      });
    } else {
      deactivateDevice.mutate(device._id, {
        onSuccess: () => {
          setSuccessMsg({ title: 'Device Deactivated', description: `${device.name} session cleared, no longer receiving data.` });
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          toast.success('Device deactivated');
        },
        onError: () => toast.error('Failed to deactivate device'),
      });
    }
  };

  const confirmDelete = () => {
    if (deletingDevice) {
      onDelete(deletingDevice._id);
      setDeletingDevice(null);
    }
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    selectedDevices.forEach(id => {
      const device = endDevices.find(d => d._id === id);
      if (device) onDelete(device._id);
    });
    setSelectedDevices([]);
  };

  const classFromFlags = (classB?: boolean, classC?: boolean) => {
    if (classB && classC) return 'Class B and class C';
    if (classB) return 'Class B (Beaconing)';
    if (classC) return 'Class C (Continuous)';
    return 'None (class A only)';
  };

  const handleEdit = (device: EndDevice) => {
    setEditingDevice(device);
    const d = device as any;
    setFormData({
      name: device.name,
      devEUI: device.devEUI,
      application: d.applicationId?.name ?? device.application ?? '',
      company: d.companyId?.name ?? device.company ?? '',
      appKey: '',
      nwkKey: '',
      appEUI: d.joinEUI ?? '',
      locationType: d.locationType ?? 'inherited',
      latitude: d.latitude?.toString() ?? '',
      longitude: d.longitude?.toString() ?? '',
      frequencyPlan: d.frequencyPlan ?? '',
      lorawanVersion: d.lorawanVersion ?? '',
      regionalParams: d.regionalParametersVersion ?? '',
      activationMode: d.activationMode ?? 'OTAA',
      lorawanClass: classFromFlags(d.supportsClassB, d.supportsClassC),
      useNetworkDefaults: d.useNetworkDefaults ?? true,
      skipJoinServer: d.skipJoinServer ?? false,
    });
    setShowAddModal(true);
  };

  const handleUpdate = () => {
    if (!editingDevice) return;
    const selectedApp = applications.find((a: any) => a.name === formData.application);
    const selectedCompany = (companies as any[]).find((c: any) => c.name === formData.company);
    updateDevice.mutate(
      {
        id: editingDevice._id,
        data: buildDevicePayload(selectedApp, selectedCompany),
      },
      {
        onSuccess: () => {
          setSuccessMsg({ title: 'Device Updated', description: `${formData.name} has been updated successfully.` });
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          toast.success('Device updated');
        },
        onError: () => toast.error('Failed to update device'),
      }
    );
    setShowAddModal(false);
    setEditingDevice(null);
    setFormData(emptyForm);
    setFormStep(1);
  };

  const toggleSelectAll = () => {
    if (selectedDevices.length === endDevices.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(endDevices.map(d => d._id));
    }
  };

  const toggleSelectDevice = (id: string) => {
    if (selectedDevices.includes(id)) {
      setSelectedDevices(selectedDevices.filter(d => d !== id));
    } else {
      setSelectedDevices([...selectedDevices, id]);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(endDevices, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
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
          imported.forEach((d: any) => onCreate({ name: d.name, devEUI: d.devEUI, application: d.application }));
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
      filtered = filtered.filter(d => ((d as any).applicationId?.name ?? d.application) === filterApplication);
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
        ((d as any).companyId?.name ?? d.company ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting by lastSeen
    if (sortBy !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        const aMs = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
        const bMs = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
        // never-seen (0) always at end
        if (aMs === 0 && bMs === 0) return 0;
        if (aMs === 0) return 1;
        if (bMs === 0) return -1;
        // asc = most recent first (larger timestamp first)
        return sortBy === 'asc' ? bMs - aMs : aMs - bMs;
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
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  // If viewing a device, show the detail view
  if (viewingDevice) {
    return <DeviceDetail device={viewingDevice} onBack={() => setViewingDevice(null)} />;
  }

  // If showing downlink, show the downlink view
  if (showDownlink) {
    const selectedDevicesData = endDevices.filter(d => selectedDevices.includes(d._id));
    return (
      <Downlink
        selectedDevices={selectedDevicesData as any}
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
              setFormData(emptyForm);
              setFormStep(1);
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
              <Radio className="w-5 h-5 text-[#fff]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{endDevices.filter(d => d.status === 'active').length}</div>
              <div className="text-xs text-slate-400">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-[#fff]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{endDevices.filter(d => d.status === 'inactive').length}</div>
              <div className="text-xs text-slate-400">Inactive</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Signal className="w-5 h-5 text-[#fff]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {Math.round(endDevices.reduce((acc, d) => acc + d.rssi, 0) / endDevices.length)} dBm
              </div>
              <div className="text-xs text-slate-400">Avg RSSI</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Signal className="w-5 h-5 text-[#fff]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{endDevices.length}</div>
              <div className="text-xs text-slate-400">Total Devices</div>
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
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto themed-scrollbar">
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
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Avg. Uplink Interval</th>
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
                  key={device._id}
                  className={`border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors group ${selectedDevices.includes(device._id) ? 'bg-blue-500/20 border-blue-500/50' : ''
                    }`}
                >
                  <td className="py-4 px-3">
                    <button onClick={() => toggleSelectDevice(device._id)}>
                      {selectedDevices.includes(device._id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${device.status === 'active'
                          ? 'bg-gradient-to-br from-green-600 to-emerald-600'
                          : 'bg-gradient-to-br from-gray-600 to-slate-600'
                        }`}>
                        <Radio className="w-5 h-5 text-[#fff]" />
                      </div>
                      <div>
                        <div
                          onClick={() => setViewingDevice(device)}
                          className="text-sm font-medium text-white hover:text-blue-400 cursor-pointer transition-colors"
                        >
                          {device.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{device.devEUI.replace(/-/g, '').toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-sm text-white">{(device as any).applicationId?.name ?? device.application ?? '—'}</div>
                      <div className="text-xs text-slate-500">{device.brand}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-white">{(device as any).companyId?.name ?? device.company ?? '—'}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${device.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                        }`}></div>
                      {device.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Battery className={`w-4 h-4 ${!device.battery ? 'text-slate-500' :
                          device.battery > 70 ? 'text-green-400' :
                            device.battery > 30 ? 'text-yellow-400' :
                              'text-red-400'
                        }`} />
                      <span className="text-sm text-white">{device.battery ? `${device.battery}%` : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Signal className={`w-4 h-4 ${device.rssi > -70 ? 'text-green-400' :
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
                          const gatewayInfo = gateways.find(g => g.eui === gw.gatewayEUI);
                          return (
                            <Tooltip key={index}>
                              <TooltipTrigger asChild>
                                <div
                                  onClick={() => {
                                    if (gatewayInfo) {
                                      onViewGateway(gatewayInfo);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-400/40 rounded-md text-xs font-mono hover:from-violet-500/30 hover:to-purple-500/30 hover:border-violet-400/60 cursor-pointer transition-all group"
                                >
                                  <span className="text-violet-300 group-hover:text-violet-200">{gw.gatewayEUI?.toUpperCase()}</span>
                                  <span className="text-slate-400">•</span>
                                  <span className={`font-semibold ${gw.rssi > -70 ? 'text-emerald-400' :
                                      gw.rssi > -85 ? 'text-amber-400' :
                                        'text-rose-400'
                                    }`}>
                                    {gw.rssi}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent showArrow={false} className="bg-slate-950 border border-slate-700 text-white font-mono rounded-lg px-3 py-2 text-xs space-y-0.5">
                                <div>Gateway: {gw.gatewayEUI?.toUpperCase()}</div>
                                {gatewayInfo && (
                                  <>
                                    <div>Name: {gatewayInfo.name}</div>
                                    <div>Brand: {(gatewayInfo as any).brand ?? '-'}</div>
                                  </>
                                )}
                                <div>RSSI: {gw.rssi} dBm</div>
                              </TooltipContent>
                            </Tooltip>
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
                      {!device.lastSeen ? (
                        <>
                          <span className="text-sm text-red-400 whitespace-nowrap font-medium">Never</span>
                          <div className="w-2 h-2 rounded-full bg-[#db4900] flex-shrink-0"></div>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-slate-300 whitespace-nowrap">{formatLastSeen(device.lastSeen)}</span>
                          <div className="relative w-1.5 h-1.5 flex-shrink-0">
                            {device.status === 'active' && (
                              <div className="absolute inset-0 rounded-full bg-[#1E5DFF] animate-ping [animation-duration:2s]"></div>
                            )}
                            <div className="relative w-1.5 h-1.5 rounded-full bg-[#1E5DFF]"></div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-300">{formatInterval(uplinkIntervals[device.devEUI])}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-300">{formatCreatedDate(device.createdAt)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-slate-300" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                          <DropdownMenuItem onClick={() => { setSharingDevice(device); setShowShareModal(true); }} className="gap-2 cursor-pointer focus:bg-purple-500/20 focus:text-purple-300">
                            <Share2 className="w-4 h-4 text-purple-400" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(device)} className="gap-2 cursor-pointer focus:bg-green-500/20 focus:text-green-300">
                            <Edit2 className="w-4 h-4 text-green-400" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(device)} className="gap-2 cursor-pointer focus:bg-blue-500/20 focus:text-blue-300">
                            {device.disabled ? <Power className="w-4 h-4 text-blue-400" /> : <PowerOff className="w-4 h-4 text-amber-400" />}
                            {device.disabled ? 'Activate' : 'Deactivate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(device)} className="gap-2 cursor-pointer focus:bg-red-500/20 focus:text-red-300">
                            <Trash2 className="w-4 h-4 text-red-400" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        onClose={() => { setShowAddModal(false); setEditingDevice(null); setFormStep(1); }}
        title={editingDevice ? 'Edit End Device' : 'Add New End Device'}
        size="lg"
      >
        {/* Step indicator */}
        {!editingDevice && (
          <div className="flex items-center gap-2 mb-5">
            {['Basic Info', 'Device Type & Activation'].map((label, i) => {
              const step = i + 1;
              const done = formStep > step;
              const active = formStep === step;
              return (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      {done ? '✓' : step}
                    </div>
                    <span className={`text-xs font-medium truncate ${active ? 'text-white' : done ? 'text-green-400' : 'text-slate-500'}`}>{label}</span>
                  </div>
                  {i < 1 && <div className={`h-px flex-1 mx-1 ${done ? 'bg-green-500' : 'bg-slate-700'}`} />}
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 themed-scrollbar">

          {/* ── Step 1: Basic Info ── */}
          {(editingDevice || formStep === 1) && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Device Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Temperature Sensor 01"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Device EUI *</label>
                <input type="text" value={formData.devEUI} onChange={(e) => setFormData({ ...formData, devEUI: e.target.value })}
                  placeholder="70B3D57ED0066E81"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">AppEUI (JoinEUI) *</label>
                <input type="text" value={formData.appEUI} onChange={(e) => setFormData({ ...formData, appEUI: e.target.value })}
                  placeholder="0000000000000000"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Application Key</label>
                <input type="text" value={formData.appKey} onChange={(e) => setFormData({ ...formData, appKey: e.target.value })}
                  placeholder="00000000000000000000000000000000"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Network Key</label>
                <input type="text" value={formData.nwkKey} onChange={(e) => setFormData({ ...formData, nwkKey: e.target.value })}
                  placeholder="00000000000000000000000000000000"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Application *</label>
                <select value={formData.application} onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select application</option>
                  {applications.map((app) => <option key={app._id} value={app.name}>{app.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Company</label>
                <select value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select company</option>
                  {(companies as any[]).map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Location</label>
                <div className="flex rounded-lg overflow-hidden border border-slate-600 mb-3">
                  {(['inherited', 'manual'] as const).map((type) => (
                    <button key={type} type="button"
                      onClick={() => setFormData({ ...formData, locationType: type })}
                      className={`flex-1 py-2 text-sm font-medium transition-all capitalize ${formData.locationType === type ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-white'}`}>
                      {type}
                    </button>
                  ))}
                </div>
                {formData.locationType === 'inherited' ? (
                  <p className="text-xs text-slate-400 px-1">Location will be inherited from the network server configuration.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Latitude</label>
                        <input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                          placeholder="40.7128"
                          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Longitude</label>
                        <input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                          placeholder="-74.0060"
                          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    {formData.latitude && formData.longitude && !isNaN(parseFloat(formData.latitude)) && !isNaN(parseFloat(formData.longitude)) && (
                      <div className="mt-3 h-[200px] rounded-lg overflow-hidden">
                        <DeviceLocationMap lat={parseFloat(formData.latitude)} lng={parseFloat(formData.longitude)} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Device Type & Activation ── */}
          {!editingDevice && formStep === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">End Device Type</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Frequency Plan *</label>
                    <select value={formData.frequencyPlan} onChange={(e) => setFormData({ ...formData, frequencyPlan: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select...</option>
                      <optgroup label="Europe">
                        <option>Europe 863-870 MHz (SF12 for RX2)</option>
                        <option>Europe 863-870 MHz (SF9 for RX2 - recommended)</option>
                        <option>Europe 863-870 MHz, 6 channels for roaming (Draft)</option>
                        <option>Europe 868.1 MHz</option>
                        <option>Europe 433 MHz (ITU region 1)</option>
                      </optgroup>
                      <optgroup label="United States">
                        <option>United States 902-928 MHz, FSB 1</option>
                        <option>United States 902-928 MHz, FSB 2 (used by TTN)</option>
                        <option>United States 902-928 MHz, FSB 3</option>
                        <option>United States 902-928 MHz, FSB 4</option>
                        <option>United States 902-928 MHz, FSB 5</option>
                        <option>United States 902-928 MHz, FSB 6</option>
                        <option>United States 902-928 MHz, FSB 7</option>
                        <option>United States 902-928 MHz, FSB 8</option>
                      </optgroup>
                      <optgroup label="Australia">
                        <option>Australia 915-928 MHz, FSB 1</option>
                        <option>Australia 915-928 MHz, FSB 2</option>
                      </optgroup>
                      <optgroup label="Asia">
                        <option>Asia 923 MHz</option>
                        <option>Asia 920-923 MHz</option>
                        <option>Asia 915-921 MHz (China)</option>
                      </optgroup>
                      <optgroup label="Other">
                        <option>India 865-867 MHz</option>
                        <option>Korea 920-923 MHz</option>
                        <option>Russia 864-870 MHz</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">LoRaWAN Version *</label>
                    <select value={formData.lorawanVersion} onChange={(e) => setFormData({ ...formData, lorawanVersion: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select...</option>
                      <option>LoRaWAN Specification 1.0.0</option>
                      <option>LoRaWAN Specification 1.0.1</option>
                      <option>LoRaWAN Specification 1.0.2</option>
                      <option>LoRaWAN Specification 1.0.3</option>
                      <option>LoRaWAN Specification 1.0.4</option>
                      <option>LoRaWAN Specification 1.1.0</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Regional Parameters Version *</label>
                    <select value={formData.regionalParams} onChange={(e) => setFormData({ ...formData, regionalParams: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select...</option>
                      <option>TS001 Technical Specification 1.0.0</option>
                      <option>TS001 Technical Specification 1.0.1</option>
                      <option>RP001 Regional Parameters 1.0.2</option>
                      <option>RP001 Regional Parameters 1.0.2 revision B</option>
                      <option>RP001 Regional Parameters 1.0.3 revision A</option>
                      <option>RP001 Regional Parameters 1.1 revision A</option>
                      <option>RP001 Regional Parameters 1.1 revision B</option>
                      <option>RP002 Regional Parameters 1.0.0</option>
                      <option>RP002 Regional Parameters 1.0.1</option>
                      <option>RP002 Regional Parameters 1.0.2</option>
                      <option>RP002 Regional Parameters 1.0.3</option>
                      <option>RP002 Regional Parameters 1.0.4</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700/50 pt-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Activation &amp; Class</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Activation Mode</label>
                    <div className="space-y-2">
                      {[
                        { value: 'OTAA', label: 'Over the air activation (OTAA)' },
                        { value: 'ABP', label: 'Activation by personalization (ABP)' },
                        { value: 'Multicast', label: 'Define multicast group (ABP & Multicast)' },
                      ].map(opt => (
                        <label key={opt.value} onClick={() => setFormData({ ...formData, activationMode: opt.value })}
                          className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${formData.activationMode === opt.value ? 'border-blue-500 bg-blue-500' : 'border-slate-500 group-hover:border-slate-400'}`}>
                            {formData.activationMode === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Additional LoRaWAN Class Capabilities</label>
                    <select value={formData.lorawanClass} onChange={(e) => setFormData({ ...formData, lorawanClass: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>None (class A only)</option>
                      <option>Class B (Beaconing)</option>
                      <option>Class C (Continuous)</option>
                      <option>Class B and class C</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700/50 pt-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Network Defaults</p>
                  <label onClick={() => setFormData({ ...formData, useNetworkDefaults: !formData.useNetworkDefaults })}
                    className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${formData.useNetworkDefaults ? 'border-blue-500 bg-blue-500' : 'border-slate-500'}`}>
                      {formData.useNetworkDefaults && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
                    </div>
                    <span className="text-sm text-slate-300">{"Use network's default MAC settings"}</span>
                  </label>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Cluster Settings</p>
                  <label onClick={() => setFormData({ ...formData, skipJoinServer: !formData.skipJoinServer })}
                    className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${formData.skipJoinServer ? 'border-blue-500 bg-blue-500' : 'border-slate-500'}`}>
                      {formData.skipJoinServer && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
                    </div>
                    <span className="text-sm text-slate-300">Skip registration on Join Server</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4 border-t border-slate-700/50 mt-4">
          <button
            onClick={() => { if (!editingDevice && formStep === 2) { setFormStep(1); } else { setShowAddModal(false); setEditingDevice(null); setFormStep(1); } }}
            className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-all"
          >
            {!editingDevice && formStep === 2 ? 'Back' : 'Cancel'}
          </button>
          {!editingDevice && formStep === 1 ? (
            <button
              onClick={() => setFormStep(2)}
              disabled={!formData.name || !formData.devEUI || !formData.application}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={editingDevice ? handleUpdate : handleAdd}
              disabled={!formData.name || !formData.devEUI || !formData.application || (!editingDevice && (!formData.frequencyPlan || !formData.lorawanVersion || !formData.regionalParams))}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingDevice ? 'Update Device' : 'Add Device'}
            </button>
          )}
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

      <SuccessMessage show={showSuccess} message={successMsg.title} description={successMsg.description} />
      <LoadingMessage show={showLoading} message={loadingMsg.title} description={loadingMsg.description} />
    </div>
  );
}