import { useState, useRef, useLayoutEffect } from 'react';
import { ArrowLeft, Activity, Radio, Code, Settings, Battery, Signal, Clock, Download, Upload, Eye, Send, EyeOff, Share2, UserPlus, Building, X, Shield, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';
import { useUplinks } from '@/lib/hooks/useUplinks';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { useUsers } from '@/lib/hooks/useUsers';
import { useEndDevices } from '@/lib/hooks/useEndDevices';
import { formatDateTime } from '@/app/utils/formatDate';
import { decodeUplinkPayload, type DecodeResult } from '@/app/utils/decodePayload';
import { toast } from 'sonner';

interface DeviceDetailProps {
  device: any;
  onBack: () => void;
}

export function DeviceDetail({ device, onBack }: DeviceDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDownlinkModal, setShowDownlinkModal] = useState(false);
  const [downlinkData, setDownlinkData] = useState({ fport: '1', payload: '', confirmed: false, retries: '3' });
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [showResetDevNoncesConfirm, setShowResetDevNoncesConfirm] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  // Settings state — initialized from device
  const [frequencyPlan, setFrequencyPlan] = useState(device.frequencyPlan ?? 'EU_863_870');
  const [lorawanVersion, setLorawanVersion] = useState(device.lorawanVersion ?? '1.0.3');
  const [regionalParametersVersion, setRegionalParametersVersion] = useState(device.regionalParametersVersion ?? 'RP001_1_0_3');
  const [supportsClassB, setSupportsClassB] = useState(device.supportsClassB ?? false);
  const [supportsClassC, setSupportsClassC] = useState(device.supportsClassC ?? false);
  const [activationMode, setActivationMode] = useState(device.activationMode ?? 'OTAA');
  const [resetsJoinNonces, setResetsJoinNonces] = useState(device.resetsJoinNonces ?? true);
  const [formatterType, setFormatterType] = useState(device.payloadFormatterType ?? 'none');
  const [formatterCode, setFormatterCode] = useState(device.payloadFormatterCode ?? '');
  const [testBytePayload, setTestBytePayload] = useState('');
  const [testFPort, setTestFPort] = useState('1');
  const [testResult, setTestResult] = useState<DecodeResult | null>(null);

  const { update, remove, sendDownlink, updateShare } = useEndDevices();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Share state
  const { data: companies = [] } = useCompanies();
  const { data: allUsers = [] } = useUsers();

  const DEFAULT_PERMS = {
    deleteDevice: false, viewDeviceInformation: true, viewDeviceKeys: false,
    editBasicSettings: false, viewEditAPIKeys: false, viewEditCollaborators: false,
    readTraffic: true, writeDownlink: false, viewDeviceStatus: true,
  };

  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedPermission, setSelectedPermission] = useState<'full' | 'custom'>('full');
  const [customPermissions, setCustomPermissions] = useState({ ...DEFAULT_PERMS });
  const [companyPermission, setCompanyPermission] = useState<'full' | 'custom'>('full');
  const [companyCustomPermissions, setCompanyCustomPermissions] = useState({ ...DEFAULT_PERMS });

  const [collaborators, setCollaborators] = useState<{ id: string; name: string; email: string; role: string; permission: 'full' | 'custom'; addedDate: string }[]>(
    (device.collaborators ?? []).map((c: any) => {
      const user = (allUsers as any[]).find((u: any) => u._id === c.userId);
      return { id: c.userId, name: user?.name ?? c.userId, email: user?.email ?? '', role: user?.role ?? '', permission: c.permission, addedDate: c.addedDate };
    })
  );
  const [sharedCompanyEntries, setSharedCompanyEntries] = useState<{ id: string; permission: 'full' | 'custom'; addedDate: string }[]>(
    device.sharedCompanies?.length
      ? device.sharedCompanies.map((s: any) => ({ id: s.companyId, permission: s.permission, addedDate: s.addedDate }))
      : device.companyId ? [{ id: device.companyId._id ?? device.companyId, permission: 'full', addedDate: new Date().toISOString().split('T')[0] }] : []
  );

  const filteredUsers = (allUsers as any[]).filter((u: any) =>
    !collaborators.some(c => c.id === u._id) &&
    (u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || (u.email ?? '').toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  const filteredAvailableCompanies = (companies as any[]).filter((c: any) =>
    !sharedCompanyEntries.some(e => e.id === c._id) &&
    (c.name?.toLowerCase().includes(companySearchQuery.toLowerCase()) || (c.email ?? '').toLowerCase().includes(companySearchQuery.toLowerCase()))
  );

  const handleAddCollaborator = () => {
    if (!selectedUser) return;
    setCollaborators(prev => [...prev, {
      id: selectedUser._id, name: selectedUser.name, email: selectedUser.email,
      role: selectedUser.role, permission: selectedPermission,
      addedDate: new Date().toISOString().split('T')[0],
    }]);
    setShowAddCollaborator(false); setSelectedUser(null); setUserSearchQuery('');
    setSelectedPermission('full'); setCustomPermissions({ ...DEFAULT_PERMS });
  };

  const handleAddCompany = () => {
    if (!selectedCompany) return;
    setSharedCompanyEntries(prev => [...prev, { id: selectedCompany._id, permission: companyPermission, addedDate: new Date().toISOString().split('T')[0] }]);
    setShowAddCompany(false); setSelectedCompany(null); setCompanySearchQuery('');
    setCompanyPermission('full'); setCompanyCustomPermissions({ ...DEFAULT_PERMS });
  };

  const handleSaveShare = () => {
    updateShare.mutate({
      id: device._id,
      data: {
        collaborators: collaborators.map(c => ({ userId: c.id, permission: c.permission, addedDate: c.addedDate })),
        sharedCompanies: sharedCompanyEntries.map(e => ({ companyId: e.id, permission: e.permission, addedDate: e.addedDate })),
      },
    }, {
      onSuccess: () => toast.success('Sharing settings saved'),
      onError: () => toast.error('Failed to save sharing settings'),
    });
  };

  const handleSaveSettings = () => {
    update.mutate({
      id: device._id,
      data: { frequencyPlan, lorawanVersion, regionalParametersVersion, supportsClassB, supportsClassC, activationMode, resetsJoinNonces },
    }, {
      onSuccess: () => toast.success('Settings saved'),
      onError: () => toast.error('Failed to save settings'),
    });
  };

  const handleSendDownlink = () => {
    const fPortNum = parseInt(downlinkData.fport, 10);
    if (!downlinkData.payload || isNaN(fPortNum)) return;
    sendDownlink.mutate({
      id: device._id,
      data: { fPort: fPortNum, payload: downlinkData.payload, confirmed: downlinkData.confirmed, retries: parseInt(downlinkData.retries, 10) || 0 },
    }, {
      onSuccess: () => { toast.success('Downlink queued'); setShowDownlinkModal(false); },
      onError: () => toast.error('Failed to queue downlink'),
    });
  };

  const { data: uplinkPages } = useUplinks(device.devEUI);
  const messages = uplinkPages?.pages.flatMap((p: any) => p.data) ?? [];

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const formatKey = (key: string | undefined, visible: boolean) =>
    key ? (visible ? key : '•'.repeat(Math.min(key.length, 16))) : '—';

  const handleSaveFormatter = () => {
    update.mutate({
      id: device._id,
      data: { payloadFormatterType: formatterType, payloadFormatterCode: formatterCode },
    }, {
      onSuccess: () => toast.success('Formatter saved'),
      onError: () => toast.error('Failed to save formatter'),
    });
  };

  const handleTestDecoder = () => {
    const fPortNum = parseInt(testFPort, 10);
    setTestResult(decodeUplinkPayload(testBytePayload, formatterCode, isNaN(fPortNum) ? undefined : fPortNum));
  };

  const handleResetDevNonces = () => {
    update.mutate({ id: device._id, data: {} }, {
      onSuccess: () => toast.success('DevNonces reset'),
      onError: () => toast.error('Failed to reset DevNonces'),
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white capitalize">{device.status}</div>
              <div className="text-xs text-slate-400">Status</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Battery className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{device.battery}%</div>
              <div className="text-xs text-slate-400">Battery</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Signal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{device.rssi} dBm</div>
              <div className="text-xs text-slate-400">RSSI</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{formatDateTime(device.lastSeen)}</div>
              <div className="text-xs text-slate-400">Last Seen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Information */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Device Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Device Name</label>
              <div className="text-sm text-white mt-1">{device.name}</div>
            </div>
            <div>
              <label className="text-xs text-slate-400">DevEUI</label>
              <div className="text-sm text-white font-mono mt-1">{device.devEUI?.toUpperCase()}</div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Application</label>
              <div className="text-sm text-white mt-1">{device.applicationId?.name ?? device.application ?? '—'}</div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Device Class</label>
              <div className="text-sm text-white mt-1">
                {device.supportsClassC ? 'Class C' : device.supportsClassB ? 'Class B' : 'Class A'}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400">LoRaWAN Version</label>
              <div className="text-sm text-white mt-1">{device.lorawanVersion ?? '—'}</div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Regional Parameters</label>
              <div className="text-sm text-white mt-1">{device.regionalParametersVersion ?? '—'}</div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Activation Mode</label>
              <div className="text-sm text-white mt-1">{device.activationMode ?? 'OTAA'}</div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Frequency Plan</label>
              <div className="text-sm text-white mt-1">{device.frequencyPlan ?? '—'}</div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Created Date</label>
              <div className="text-sm text-white mt-1">
                {device.createdAt ? new Date(device.createdAt).toLocaleString() : '—'}
              </div>
            </div>
          </div>

          {device.joinEUI && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">JoinEUI</label>
                <div className="text-sm text-white font-mono bg-slate-700/50 px-3 py-1.5 rounded-lg mt-1">{device.joinEUI?.toUpperCase()}</div>
              </div>
            </div>
          )}

          {(device.appKey || device.nwkKey) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'AppKey', key: 'appKey', value: device.appKey },
                { label: 'NwkKey', key: 'nwkKey', value: device.nwkKey },
              ].filter(k => k.value).map(({ label, key, value }) => (
                <div key={key}>
                  <label className="text-xs text-slate-400">{label}</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 text-sm text-white font-mono bg-slate-700/50 px-3 py-1.5 rounded-lg">
                      {formatKey(value, !!showKeys[key])?.toUpperCase()}
                    </div>
                    <button onClick={() => toggleKeyVisibility(key)} className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors">
                      {showKeys[key] ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Session Information */}
      {(device.devAddr || device.appSKey || device.nwkSKey || device.fNwkSIntKey) && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Session Information</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {device.sessionStart && (
                <div>
                  <label className="text-xs text-slate-400">Session start</label>
                  <div className="text-sm text-white mt-1">{new Date(device.sessionStart).toLocaleString()}</div>
                </div>
              )}
              {device.devAddr && (
                <div>
                  <label className="text-xs text-slate-400">Device address</label>
                  <div className="text-sm text-white font-mono bg-slate-700/50 px-3 py-1.5 rounded-lg mt-1">{device.devAddr?.toUpperCase()}</div>
                </div>
              )}
              {device.fCntUp !== undefined && (
                <div>
                  <label className="text-xs text-slate-400">Frame counter (uplink)</label>
                  <div className="text-sm text-white font-mono mt-1">{device.fCntUp}</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'FNwkSIntKey', key: 'fNwkSIntKey', value: device.fNwkSIntKey },
                { label: 'SNwkSIntKey', key: 'sNwkSIntKey', value: device.sNwkSIntKey },
                { label: 'NwkSEncKey', key: 'nwkSEncKey', value: device.nwkSEncKey },
                { label: 'AppSKey', key: 'appSKey', value: device.appSKey },
              ].filter(k => k.value).map(({ label, key, value }) => (
                <div key={key}>
                  <label className="text-xs text-slate-400">{label}</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 text-sm text-white font-mono bg-slate-700/50 px-3 py-1.5 rounded-lg">
                      {formatKey(value, !!showKeys[key])?.toUpperCase()}
                    </div>
                    <button onClick={() => toggleKeyVisibility(key)} className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors">
                      {showKeys[key] ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLiveData = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{messages.length}</div>
              <div className="text-xs text-slate-400">Uplink Messages</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-xs text-slate-400">Downlink Messages</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Signal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {messages.length > 0
                  ? `${Math.round(messages.reduce((a: number, m: any) => a + (m.rssi ?? 0), 0) / messages.length)} dBm`
                  : '— dBm'}
              </div>
              <div className="text-xs text-slate-400">Avg RSSI</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto themed-scrollbar">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Payload (Hex)</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">FPort</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">FCnt</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">RSSI</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">SNR</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">SF</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg: any) => {
                const id = msg._id ?? msg.id;
                const isExpanded = expandedMessage === id;
                const hexPayload = msg.dataHex || (msg.decodedData
                  ? Array.from(JSON.stringify(msg.decodedData))
                      .map((c: any) => c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase())
                      .join(' ')
                  : '—');

                return (
                  <>
                    <tr
                      key={id}
                      onClick={() => setExpandedMessage(isExpanded ? null : id)}
                      className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-blue-400 font-medium">Uplink</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">{formatDateTime(msg.receivedAt)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-sm">
                        <div className="">
                          <div className="bg-slate-900/50 border border-slate-700/50 rounded px-2 py-1 overflow-hidden">
                            <code className="text-xs text-orange-400 font-mono whitespace-nowrap block overflow-hidden text-ellipsis">
                              {hexPayload}
                            </code>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Click to expand</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">{msg.fPort ?? '—'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-300 font-mono">{msg.fCnt ?? '—'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-sm font-medium ${msg.rssi > -70 ? 'text-green-400' : msg.rssi > -85 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {msg.rssi} dBm
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-300">{msg.snr} dB</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">
                          {msg.spreadingFactor ? `SF${msg.spreadingFactor}` : (msg.dataRate ?? '—')}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`expanded-${id}`} className="border-b border-slate-700/30 bg-slate-900/50">
                        <td colSpan={8} className="py-4 px-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-3">Message Details</h4>
                              <div className="space-y-2">
                                <div className="flex gap-3">
                                  <span className="text-xs text-slate-400 w-24 shrink-0">Gateway EUI:</span>
                                  <span className="text-xs text-white font-mono">{msg.gatewayEUI?.toUpperCase()}</span>
                                </div>
                                <div className="flex gap-3">
                                  <span className="text-xs text-slate-400 w-24 shrink-0">Frequency:</span>
                                  <span className="text-xs text-white font-mono">{msg.frequency} MHz</span>
                                </div>
                                <div className="flex gap-3">
                                  <span className="text-xs text-slate-400 w-24 shrink-0">Data Rate:</span>
                                  <span className="text-xs text-white font-mono">{msg.dataRate ?? '—'}</span>
                                </div>
                                <div className="flex gap-3">
                                  <span className="text-xs text-slate-400 w-24 shrink-0">Coding Rate:</span>
                                  <span className="text-xs text-white font-mono">{msg.codingRate ?? '—'}</span>
                                </div>
                                <div className="flex gap-3">
                                  <span className="text-xs text-slate-400 w-24 shrink-0">Modulation:</span>
                                  <span className="text-xs text-white font-mono">{msg.modulation ?? '—'}</span>
                                </div>
                                <div className="flex gap-3">
                                  <span className="text-xs text-slate-400 w-24 shrink-0">Bandwidth:</span>
                                  <span className="text-xs text-white font-mono">{msg.bandwidth ? `${msg.bandwidth} kHz` : '—'}</span>
                                </div>
                                <div className="flex gap-3">
                                  <span className="text-xs text-slate-400 w-24 shrink-0">Channel:</span>
                                  <span className="text-xs text-white font-mono">{msg.channel ?? '—'}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-3">Payload</h4>
                              <div className="mb-3">
                                <label className="text-xs text-slate-400 mb-1 block">Hex Format</label>
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                                  <pre className="text-xs text-orange-400 font-mono overflow-x-auto whitespace-pre-wrap break-all">{hexPayload}</pre>
                                </div>
                              </div>
                              {msg.decodedData && (
                                <div>
                                  <label className="text-xs text-slate-400 mb-1 block">JSON Format</label>
                                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                                    <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                                      {JSON.stringify(msg.decodedData, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                              {device.payloadFormatterType === 'javascript' && device.payloadFormatterCode && (
                                <div className='mt-3'>
                                  <label className="text-xs text-slate-400 mb-1 block">Decoded (Formatter)</label>
                                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                                    {(() => {
                                      const result = decodeUplinkPayload(hexPayload, device.payloadFormatterCode, msg.fPort);
                                      return (
                                        <pre className={`text-xs font-mono overflow-x-auto ${result.errors?.length ? 'text-red-400' : 'text-green-400'}`}>
                                          {JSON.stringify(result, null, 2)}
                                        </pre>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPayloadFormatter = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payload Formatter</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Formatter Type</label>
            <select
              value={formatterType}
              onChange={e => setFormatterType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="none">None</option>
              <option value="javascript">JavaScript</option>
              <option value="cayennelpp">CayenneLPP</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Uplink Formatter</label>
            <textarea
              value={formatterCode}
              onChange={e => setFormatterCode(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={10}
              placeholder={"function decodeUplink(input) {\n  return {\n    data: {\n      // decoded payload\n    }\n  };\n}"}
            />
          </div>
          <button
            onClick={handleSaveFormatter}
            disabled={update.isPending}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50">
            {update.isPending ? 'Saving…' : 'Save Formatter'}
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Test</h3>
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm text-slate-300 mb-2 block">Byte payload</label>
              <input
                type="text"
                value={testBytePayload}
                onChange={e => setTestBytePayload(e.target.value)}
                placeholder="e.g. 03 21 9E 12 12 ..."
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-28">
              <label className="text-sm text-slate-300 mb-2 block">FPort</label>
              <input
                type="number"
                value={testFPort}
                onChange={e => setTestFPort(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleTestDecoder}
              disabled={!testBytePayload || formatterType !== 'javascript' || !formatterCode}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50">
              Test decoder
            </button>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Decoded test payload</label>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 min-h-[8rem]">
              {testResult && (
                <pre className={`text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all ${testResult.errors?.length ? 'text-red-400' : 'text-green-400'}`}>
                  {JSON.stringify(testResult.data ?? testResult, null, 2)}
                </pre>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Complete uplink data</label>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 min-h-[8rem]">
              {testResult && (
                <pre className="text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PermissionsList = ({ perms, setPerms }: { perms: typeof DEFAULT_PERMS; setPerms: (p: typeof DEFAULT_PERMS) => void }) => {
    const allChecked = Object.values(perms).every(Boolean);
    const PERM_LABELS: [keyof typeof DEFAULT_PERMS, string][] = [
      ['deleteDevice', 'delete device'],
      ['viewDeviceInformation', 'view device information'],
      ['viewDeviceKeys', 'view device keys (AppKey, NwkKey, session keys)'],
      ['editBasicSettings', 'edit basic device settings'],
      ['viewEditAPIKeys', 'view and edit device API keys'],
      ['viewEditCollaborators', 'view and edit device collaborators'],
      ['readTraffic', 'read device traffic (uplinks)'],
      ['writeDownlink', 'write downlink traffic'],
      ['viewDeviceStatus', 'view device status'],
    ];
    return (
      <div className="mt-3 p-3 bg-slate-700/30 rounded-lg max-h-64 overflow-y-auto themed-scrollbar space-y-2">
        <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-slate-600/50">
          <input type="checkbox" checked={allChecked}
            onChange={(e) => setPerms(Object.fromEntries(Object.keys(perms).map(k => [k, e.target.checked])) as typeof DEFAULT_PERMS)}
            className="w-4 h-4 rounded text-blue-500" />
          <span className="text-sm text-slate-200 font-medium">Select all</span>
        </label>
        {PERM_LABELS.map(([key, label]) => (
          <label key={key} className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={perms[key]}
              onChange={(e) => setPerms({ ...perms, [key]: e.target.checked })}
              className="w-4 h-4 rounded text-blue-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-slate-300">{label}</span>
          </label>
        ))}
      </div>
    );
  };

  const renderShare = () => (
    <div className="space-y-6">
      {/* Collaborators */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Collaborators</h3>
            <p className="text-sm text-slate-400">Manage user access to this device</p>
          </div>
          <button onClick={() => setShowAddCollaborator(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">
            <UserPlus className="w-4 h-4" />Add Collaborator
          </button>
        </div>
        <div className="space-y-3">
          {collaborators.map((c) => (
            <div key={c.id} className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{c.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{c.name}</h4>
                    <p className="text-sm text-slate-400">{c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-slate-300">{c.permission === 'full' ? 'Full Access' : 'Custom Rights'}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Added {c.addedDate}</p>
                  </div>
                  <button onClick={() => setCollaborators(collaborators.filter(x => x.id !== c.id))}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {collaborators.length === 0 && (
            <div className="p-8 text-center">
              <UserPlus className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-1">No collaborators yet</p>
              <p className="text-sm text-slate-500">Add users to grant them access to this device</p>
            </div>
          )}
        </div>
      </div>

      {/* Companies */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Shared with Companies</h3>
            <p className="text-sm text-slate-400">Companies that have access to this device</p>
          </div>
          <button onClick={() => setShowAddCompany(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">
            <Building className="w-4 h-4" />Add Company
          </button>
        </div>
        <div className="space-y-3">
          {sharedCompanyEntries.map((entry) => {
            const company = (companies as any[]).find((c: any) => c._id === entry.id);
            if (!company) return null;
            return (
              <div key={entry.id} className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{company.name}</h4>
                      <p className="text-sm text-slate-400">{company.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-slate-300">{entry.permission === 'full' ? 'Full Access' : 'Custom Rights'}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Added {entry.addedDate}</p>
                    </div>
                    <button onClick={() => setSharedCompanyEntries(sharedCompanyEntries.filter(e => e.id !== entry.id))}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {sharedCompanyEntries.length === 0 && (
            <div className="p-8 text-center">
              <Building className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-1">Not shared with any companies</p>
              <p className="text-sm text-slate-500">Add companies to share this device with them</p>
            </div>
          )}
        </div>
        <div className="pt-6 border-t border-slate-700/50 mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {sharedCompanyEntries.length === 0
              ? 'Device is private (not shared with any company)'
              : `Sharing with ${sharedCompanyEntries.length} ${sharedCompanyEntries.length === 1 ? 'company' : 'companies'}`}
          </p>
          <button
            onClick={handleSaveShare}
            disabled={updateShare.isPending}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50">
            {updateShare.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">LoRaWAN Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Frequency plan <span className="text-red-400">*</span></label>
            <select value={frequencyPlan} onChange={e => setFrequencyPlan(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="EU_863_870">Europe 863-870 MHz (SF9 for RX2 - recommended)</option>
              <option value="US_902_928">United States 902-928 MHz (SF10 for RX2)</option>
              <option value="AU_915_928">Australia 915-928 MHz (SF12 for RX2)</option>
              <option value="AS_923">Asia 923 MHz (SF10 for RX2)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">LoRaWAN version <span className="text-red-400">*</span></label>
            <select value={lorawanVersion} onChange={e => setLorawanVersion(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="1.1.0">LoRaWAN Specification 1.1.0</option>
              <option value="1.0.4">LoRaWAN Specification 1.0.4</option>
              <option value="1.0.3">LoRaWAN Specification 1.0.3</option>
              <option value="1.0.2">LoRaWAN Specification 1.0.2</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Regional Parameters version <span className="text-red-400">*</span></label>
            <select value={regionalParametersVersion} onChange={e => setRegionalParametersVersion(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="RP001_1_1_A">RP001 Regional Parameters 1.1 revision A</option>
              <option value="RP001_1_0_B">RP001 Regional Parameters 1.0 revision B</option>
              <option value="RP002_1_0_3">RP002-1.0.3 Regional Parameters</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">LoRaWAN class capabilities</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={supportsClassB} onChange={e => setSupportsClassB(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                <span className="text-sm text-slate-300">Supports class B</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={supportsClassC} onChange={e => setSupportsClassC(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                <span className="text-sm text-slate-300">Supports class C</span>
              </label>
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Activation mode <span className="text-red-400">*</span></label>
            <div className="space-y-2">
              {[
                { value: 'OTAA', label: 'Over the air activation (OTAA)' },
                { value: 'ABP', label: 'Activation by personalization (ABP)' },
                { value: 'Multicast', label: 'Define multicast group (ABP & Multicast)' },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="activationMode" value={value} checked={activationMode === value}
                    onChange={() => setActivationMode(value)}
                    className="w-4 h-4 bg-slate-700 border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-4">
            <label className="text-sm text-slate-300 mb-2 block">Resets join nonces</label>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" checked={resetsJoinNonces} onChange={e => setResetsJoinNonces(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500" />
              <span className="text-sm text-slate-300">Enabled</span>
            </label>
            <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <div className="text-orange-400 mt-0.5">⚠</div>
              <p className="text-sm text-orange-400">Resetting is insecure and makes your end device susceptible for replay attacks</p>
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Reset used DevNonces</label>
            <button
              onClick={() => setShowResetDevNoncesConfirm(true)}
              className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500 rounded-lg text-orange-400 font-medium transition-all"
            >
              Reset used DevNonces
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Session and MAC state reset</h3>
        <p className="text-sm text-slate-400 mb-4">
          Reset the session context and MAC state of the device. This will clear all data associated with the current session.
        </p>
        <button className="px-6 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500 rounded-lg text-orange-400 font-medium transition-all">
          Reset session and MAC state
        </button>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Device Actions</h3>
        <div className="flex gap-4">
          <button
            onClick={handleSaveSettings}
            disabled={update.isPending}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
          >
            {update.isPending ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 font-medium transition-all"
          >
            Delete Device
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col relative -mt-6 -mx-6 px-6">
      {/* Add Collaborator Dialog */}
      <AnimatePresence>
        {showAddCollaborator && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto themed-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Add Collaborator</h3>
                <button onClick={() => { setShowAddCollaborator(false); setSelectedUser(null); setUserSearchQuery(''); }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="mb-4">
                <label className="text-sm text-slate-300 mb-2 block">Search User</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input type="text" value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              {userSearchQuery && (
                <div className="mb-4 max-h-48 overflow-y-auto themed-scrollbar border border-slate-700 rounded-lg">
                  {filteredUsers.length > 0 ? filteredUsers.map((u: any) => (
                    <button key={u._id} onClick={() => { setSelectedUser(u); setUserSearchQuery(''); }}
                      className="w-full p-3 hover:bg-slate-700/50 transition-colors text-left border-b border-slate-700/30 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-medium">{u.name?.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{u.name}</div>
                          <div className="text-xs text-slate-400 truncate">{u.email}</div>
                        </div>
                        <span className="text-xs text-slate-500">{u.role}</span>
                      </div>
                    </button>
                  )) : <div className="p-4 text-center text-sm text-slate-400">No users found</div>}
                </div>
              )}
              {selectedUser && (
                <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{selectedUser.name?.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{selectedUser.name}</div>
                      <div className="text-sm text-slate-400">{selectedUser.email}</div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-slate-700 rounded transition-colors">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  <label className="text-sm text-slate-300 mb-3 block">Access Level</label>
                  <div className="space-y-2">
                    {(['full', 'custom'] as const).map((val) => (
                      <label key={val} className="flex items-start gap-3 cursor-pointer p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <input type="radio" name="user-perm" value={val} checked={selectedPermission === val} onChange={() => setSelectedPermission(val)} className="mt-0.5 w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-white font-medium">{val === 'full' ? 'Full Access' : 'Custom Rights'}</div>
                          <div className="text-xs text-slate-400 mt-1">{val === 'full' ? 'Complete control over this device' : 'Select specific permissions'}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {selectedPermission === 'custom' && <PermissionsList perms={customPermissions} setPerms={setCustomPermissions} />}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setShowAddCollaborator(false); setSelectedUser(null); setUserSearchQuery(''); }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-all">Cancel</button>
                <button onClick={handleAddCollaborator} disabled={!selectedUser}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">Add Collaborator</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Company Dialog */}
      <AnimatePresence>
        {showAddCompany && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto themed-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Add Company</h3>
                <button onClick={() => { setShowAddCompany(false); setSelectedCompany(null); setCompanySearchQuery(''); }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="mb-4">
                <label className="text-sm text-slate-300 mb-2 block">Search Company</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input type="text" value={companySearchQuery} onChange={(e) => setCompanySearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              {companySearchQuery && (
                <div className="mb-4 max-h-48 overflow-y-auto themed-scrollbar border border-slate-700 rounded-lg">
                  {filteredAvailableCompanies.length > 0 ? filteredAvailableCompanies.map((c: any) => (
                    <button key={c._id} onClick={() => { setSelectedCompany(c); setCompanySearchQuery(''); }}
                      className="w-full p-3 hover:bg-slate-700/50 transition-colors text-left border-b border-slate-700/30 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{c.name}</div>
                          <div className="text-xs text-slate-400 truncate">{c.email}</div>
                        </div>
                      </div>
                    </button>
                  )) : <div className="p-4 text-center text-sm text-slate-400">No companies found</div>}
                </div>
              )}
              {selectedCompany && (
                <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{selectedCompany.name}</div>
                      <div className="text-sm text-slate-400">{selectedCompany.email}</div>
                    </div>
                    <button onClick={() => setSelectedCompany(null)} className="p-1 hover:bg-slate-700 rounded transition-colors">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  <label className="text-sm text-slate-300 mb-3 block">Access Level</label>
                  <div className="space-y-2">
                    {(['full', 'custom'] as const).map((val) => (
                      <label key={val} className="flex items-start gap-3 cursor-pointer p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <input type="radio" name="company-perm" value={val} checked={companyPermission === val} onChange={() => setCompanyPermission(val)} className="mt-0.5 w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-white font-medium">{val === 'full' ? 'Full Access' : 'Custom Rights'}</div>
                          <div className="text-xs text-slate-400 mt-1">{val === 'full' ? 'Complete control over this device' : 'Select specific permissions'}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {companyPermission === 'custom' && <PermissionsList perms={companyCustomPermissions} setPerms={setCompanyCustomPermissions} />}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setShowAddCompany(false); setSelectedCompany(null); setCompanySearchQuery(''); }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-all">Cancel</button>
                <button onClick={handleAddCompany} disabled={!selectedCompany}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">Add Company</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">{device.name}</h2>
            <p className="text-slate-400 font-mono text-sm">{device.devEUI?.toUpperCase()}</p>
          </div>
        </div>
        <button
          onClick={() => setShowDownlinkModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Send className="w-4 h-4" />
          Send Downlink
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {[
          { id: 'overview', icon: <Activity className="w-4 h-4" />, label: 'Overview' },
          { id: 'livedata', icon: <Radio className="w-4 h-4" />, label: 'Live Data' },
          { id: 'formatter', icon: <Code className="w-4 h-4" />, label: 'Payload Formatter' },
          { id: 'share', icon: <Share2 className="w-4 h-4" />, label: 'Share' },
          { id: 'settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'livedata' && renderLiveData()}
      {activeTab === 'formatter' && renderPayloadFormatter()}
      {activeTab === 'share' && renderShare()}
      {activeTab === 'settings' && renderSettings()}

      {/* Downlink Modal */}
      <Modal
        isOpen={showDownlinkModal}
        onClose={() => setShowDownlinkModal(false)}
        title="Schedule Downlink"
      >
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Radio className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">Target Device</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Device Name:</span>
                <span className="text-sm text-white font-medium">{device.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">DevEUI:</span>
                <span className="text-sm text-white font-mono">{device.devEUI?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Application:</span>
                <span className="text-sm text-white">{device.applicationId?.name ?? device.application}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Status:</span>
                <span className={`text-sm font-medium ${device.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                  {device.status?.charAt(0).toUpperCase() + device.status?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">FPort</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1-223"
              value={downlinkData.fport}
              onChange={e => setDownlinkData({ ...downlinkData, fport: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Payload (Base64 or Hex)</label>
            <textarea
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter payload..."
              value={downlinkData.payload}
              onChange={e => setDownlinkData({ ...downlinkData, payload: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Number of Retries</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0-15"
              min="0"
              max="15"
              value={downlinkData.retries}
              onChange={e => setDownlinkData({ ...downlinkData, retries: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">Number of retries if not acknowledged (0-15)</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="confirmed"
              className="rounded"
              checked={downlinkData.confirmed}
              onChange={e => setDownlinkData({ ...downlinkData, confirmed: e.target.checked })}
            />
            <label htmlFor="confirmed" className="text-sm text-slate-300">Confirmed downlink</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowDownlinkModal(false)}
              className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSendDownlink}
              disabled={sendDownlink.isPending || !downlinkData.payload}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
            >
              {sendDownlink.isPending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showResetDevNoncesConfirm}
        onClose={() => setShowResetDevNoncesConfirm(false)}
        onConfirm={handleResetDevNonces}
        title="Reset used DevNonces"
        message="Are you sure you want to reset the used DevNonces of this end device? Resetting enables replay attacks using past nonces. Do not use unless you have reset the end device NVRAM."
        confirmText="Reset used DevNonces"
        type="danger"
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          remove.mutate(device._id, {
            onSuccess: () => { toast.success('Device deleted'); onBack(); },
            onError: () => toast.error('Failed to delete device'),
          });
        }}
        title="Delete Device"
        message={`Are you sure you want to delete "${device.name}"? This action cannot be undone.`}
        confirmText="Delete Device"
        type="danger"
      />
    </div>
  );
}
