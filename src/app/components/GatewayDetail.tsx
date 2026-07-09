import { useState, useRef } from 'react';
import { ArrowLeft, Activity, Radio, MapPin, Settings, Signal, Zap, Clock, Upload, Download, Eye, CheckCircle, Share2, Building, UserPlus, Search, X, Shield } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { formatDateTime } from '@/app/utils/formatDate';
import { motion, AnimatePresence } from 'motion/react';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { useUsers } from '@/lib/hooks/useUsers';
import { useUplinks } from '@/lib/hooks/useUplinks';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '@/lib/GoogleMapsProvider';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { AppSelect } from './ui/AppSelect';

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

function GatewayMapPanel({ lat, lng, onPinMove }: { lat: string; lng: string; onPinMove: (lat: number, lng: number) => void }) {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const hasCoords = !isNaN(parsedLat) && !isNaN(parsedLng) && (parsedLat !== 0 || parsedLng !== 0);
  const position = hasCoords ? { lat: parsedLat, lng: parsedLng } : null;

  // stable initial center — only set once so map doesn't re-center on coord input changes
  const initialCenter = useRef(position ?? { lat: 0, lng: 0 });

  const handleMove = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lt = parseFloat(e.latLng.lat().toFixed(6));
    const lg = parseFloat(e.latLng.lng().toFixed(6));
    onPinMove(lt, lg);
  };

  if (loadError) return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Map View</h3>
      <div className="w-full h-64 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 text-sm">Failed to load map</div>
    </div>
  );

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-1">Map View</h3>
      <p className="text-xs text-slate-500 mb-4">Click map or drag pin to set coordinates</p>
      <div className="w-full h-64 rounded-lg overflow-hidden border border-slate-700/50">
        {!isLoaded ? (
          <div className="h-full flex items-center justify-center bg-slate-900">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={initialCenter.current}
            zoom={hasCoords ? 13 : 2}
            options={{ styles: DARK_MAP_STYLES, disableDefaultUI: true, zoomControl: true }}
            onLoad={(map) => { mapRef.current = map; }}
            onClick={handleMove}
          >
            {position && <Marker position={position} draggable onDragEnd={handleMove} />}
          </GoogleMap>
        )}
      </div>
    </div>
  );
}

interface GatewayDetailProps {
  gateway: any;
  onBack: () => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

export function GatewayDetail({ gateway, onBack, onUpdate, onDelete }: GatewayDetailProps) {
  const { data: companies = [] } = useCompanies();

  const [activeTab, setActiveTabState] = useState(
    () => new URLSearchParams(window.location.search).get('tab') ?? 'overview'
  );
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    window.history.replaceState(null, '', `?${params.toString()}`);
  };
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [locationType, setLocationType] = useState<'inherited' | 'manual'>(
    gateway.locationType === 'inherited' ? 'inherited' : 'manual'
  );
  const [manualLocation, setManualLocation] = useState({
    latitude: gateway.latitude != null ? String(gateway.latitude) : '',
    longitude: gateway.longitude != null ? String(gateway.longitude) : '',
    altitude: gateway.altitude != null ? String(gateway.altitude) : '0',
    placement: gateway.placement ?? 'Unknown',
    address: gateway.location ?? '',
  });
  const [settingsName, setSettingsName] = useState(gateway.name);
  const [settingsDescription, setSettingsDescription] = useState('');

  const DEFAULT_PERMS = {
    deleteGateway: false, viewGatewayInformation: true, linkGatewayServer: false,
    viewGatewayLocation: true, purgeGateway: false, retrieveSecrets: false,
    viewEditAPIKeys: false, editBasicSettings: false, viewEditCollaborators: false,
    viewGatewayStatus: true, writeDownlink: false, readTraffic: true, storeSecrets: false,
  };

  const { data: allUsers = [] } = useUsers();

  const [collaborators, setCollaborators] = useState<{ id: string; name: string; email: string; role: string; permission: string; addedDate: string }[]>([]);
  const [sharedCompanyEntries, setSharedCompanyEntries] = useState<{ id: string; permission: 'full' | 'custom'; addedDate: string }[]>(
    gateway.companyId ? [{ id: gateway.companyId._id ?? gateway.companyId, permission: 'full', addedDate: new Date().toISOString().split('T')[0] }] : []
  );

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

  const filteredUsers = (allUsers as any[]).filter((u: any) =>
    !collaborators.some(c => c.id === u._id) &&
    (u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || (u.email ?? '').toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  const filteredAvailableCompanies = (companies as any[]).filter((c: any) =>
    !sharedCompanyEntries.some(e => e.id === c._id) &&
    (c.name.toLowerCase().includes(companySearchQuery.toLowerCase()) || (c.email ?? '').toLowerCase().includes(companySearchQuery.toLowerCase()))
  );

  const handleAddCollaborator = () => {
    if (!selectedUser) return;
    setCollaborators([...collaborators, { id: selectedUser._id, name: selectedUser.name, email: selectedUser.email, role: selectedUser.role, permission: selectedPermission, addedDate: new Date().toISOString().split('T')[0] }]);
    setShowAddCollaborator(false); setSelectedUser(null); setUserSearchQuery('');
    setSelectedPermission('full'); setCustomPermissions({ ...DEFAULT_PERMS });
  };

  const handleAddCompany = () => {
    if (!selectedCompany) return;
    setSharedCompanyEntries([...sharedCompanyEntries, { id: selectedCompany._id, permission: companyPermission, addedDate: new Date().toISOString().split('T')[0] }]);
    setShowAddCompany(false); setSelectedCompany(null); setCompanySearchQuery('');
    setCompanyPermission('full'); setCompanyCustomPermissions({ ...DEFAULT_PERMS });
  };

  const handleSaveChanges = (data: any) => {
    setIsSaving(true);
    onUpdate(gateway._id, data);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onBack();
      }, 1500);
    }, 800);
  };

  const handleDeleteGateway = () => {
    onDelete(gateway._id);
    onBack();
  };

  const { data: uplinkPages } = useUplinks(undefined, undefined, gateway.eui);
  const uplinks = uplinkPages?.pages.flatMap((p: any) => p.data) ?? [];

  const avgRssi = uplinks.length
    ? Math.round(uplinks.reduce((acc: number, m: any) => acc + (m.rssi ?? 0), 0) / uplinks.length)
    : null;

  const [expandedTraffic, setExpandedTraffic] = useState<string | null>(null);

  const overviewStats = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { label: 'Status', value: gateway.status, gradient: 'from-green-600 to-emerald-600', icon: <Activity className="w-5 h-5 text-[#fff]" />, capitalize: true },
        { label: 'Active Devices', value: gateway.devices ?? 0, gradient: 'from-blue-600 to-cyan-600', icon: <Zap className="w-5 h-5 text-[#fff]" /> },
        { label: 'Uptime', value: gateway.uptime ?? '—', gradient: 'from-purple-600 to-pink-600', icon: <Signal className="w-5 h-5 text-[#fff]" /> },
        { label: 'Last Seen', value: formatDateTime(gateway.lastSeen) || '—', gradient: 'from-orange-600 to-red-600', icon: <Clock className="w-5 h-5 text-[#fff]" /> },
      ].map(({ label, value, gradient, icon, capitalize }) => (
        <div key={label} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>{icon}</div>
            <div>
              <div className={`text-2xl font-bold text-white ${capitalize ? 'capitalize' : ''}`}>{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Gateway Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Gateway Name', value: gateway.name, mono: false },
            { label: 'Gateway EUI', value: gateway.eui?.toUpperCase(), mono: true },
            { label: 'Company', value: gateway.companyId?.name ?? '—', mono: false },
            { label: 'Location', value: gateway.location || '—', mono: false },
            { label: 'Placement', value: gateway.placement ?? '—', mono: false },
            { label: 'Coordinates', value: gateway.latitude != null && gateway.longitude != null ? `${gateway.latitude}, ${gateway.longitude}` : '—', mono: true },
            { label: 'Altitude', value: gateway.altitude != null ? `${gateway.altitude} m` : '—', mono: false },
            { label: 'Created', value: formatDateTime((gateway as any).createdAt) || '—', mono: false },
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <label className="text-xs text-slate-400">{label}</label>
              <div className={`text-sm text-white mt-1 ${mono ? 'font-mono' : ''}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const liveDataStats = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-[#fff]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{uplinks.length}</div>
            <div className="text-xs text-slate-400">Uplink Messages</div>
          </div>
        </div>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-[#fff]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">—</div>
            <div className="text-xs text-slate-400">Downlink Messages</div>
          </div>
        </div>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
            <Signal className="w-5 h-5 text-[#fff]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{avgRssi !== null ? `${avgRssi} dBm` : '—'}</div>
            <div className="text-xs text-slate-400">Avg RSSI</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLiveData = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto themed-scrollbar">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Payload (Hex)</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Device EUI</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">RSSI</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">SNR</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">SF</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">FPort</th>
                <th className="text-right py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uplinks.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">No uplink messages yet</td>
                </tr>
              )}
              {uplinks.flatMap((msg: any) => {
                const id = msg._id ?? msg.id;
                const isExpanded = expandedTraffic === id;
                const rows = [
                  <tr key={id} className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400 font-medium">Uplink</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">
                          {formatDateTime(msg.receivedAt)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="max-w-xs">
                        {msg.dataHex ? (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="bg-slate-900/50 border border-slate-700/50 rounded px-2 py-1 overflow-hidden">
                                  <code className="text-xs text-orange-400 font-mono whitespace-nowrap block overflow-hidden text-ellipsis">
                                    {msg.dataHex}
                                  </code>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent showArrow={false} className="bg-slate-950 border border-slate-700 text-orange-400 font-mono whitespace-nowrap max-w-none rounded-lg px-3 py-2">
                                {msg.dataHex}
                              </TooltipContent>
                            </Tooltip>
                            <div className="text-xs text-slate-500 mt-1">Click to expand</div>
                          </>
                        ) : (
                          <span className="text-sm text-slate-500">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-white font-mono">{(msg.deviceEUI ?? msg.devEUI)?.toUpperCase() ?? '—'}</span>
                    </td>
                    <td className="py-4 px-6">
                      {msg.rssi != null ? (
                        <span className={`text-sm font-medium ${
                          msg.rssi > -70 ? 'text-green-400' :
                          msg.rssi > -85 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {msg.rssi} dBm
                        </span>
                      ) : (
                        <span className="text-sm text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {msg.snr != null
                        ? <span className="text-sm text-slate-300">{msg.snr} dB</span>
                        : <span className="text-sm text-slate-500">—</span>}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">
                        {msg.spreadingFactor ? `SF${msg.spreadingFactor}` : (msg.dataRate ?? '—')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {msg.fPort != null
                        ? <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">{msg.fPort}</span>
                        : <span className="text-sm text-slate-500">—</span>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setExpandedTraffic(isExpanded ? null : id)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-blue-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ];

                if (isExpanded) {
                  rows.push(
                    <tr key={`detail-${id}`} className="border-b border-slate-700/30 bg-slate-900/50">
                      <td colSpan={9} className="py-4 px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-3">Message Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Gateway EUI:</span>
                                <span className="text-xs text-white font-mono">{msg.gatewayEUI?.toUpperCase() ?? '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Frequency:</span>
                                <span className="text-xs text-white font-mono">{msg.frequency != null ? `${msg.frequency} MHz` : '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Data Rate:</span>
                                <span className="text-xs text-white font-mono">{msg.dataRate ?? '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Coding Rate:</span>
                                <span className="text-xs text-white font-mono">{msg.codingRate ?? '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Modulation:</span>
                                <span className="text-xs text-white font-mono">{msg.modulation ?? '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Spreading Factor:</span>
                                <span className="text-xs text-white font-mono">{msg.spreadingFactor ? `SF${msg.spreadingFactor}` : '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Bandwidth:</span>
                                <span className="text-xs text-white font-mono">{msg.bandwidth ? `${msg.bandwidth} kHz` : '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Channel:</span>
                                <span className="text-xs text-white font-mono">{msg.channel ?? '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">RSSI:</span>
                                <span className="text-xs text-white">{msg.rssi != null ? `${msg.rssi} dBm` : '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">SNR:</span>
                                <span className="text-xs text-white">{msg.snr != null ? `${msg.snr} dB` : '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">FCnt:</span>
                                <span className="text-xs text-white font-mono">{msg.fCnt ?? '—'}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-3">Payload</h4>
                            {msg.dataHex && (
                              <div className="mb-3">
                                <label className="text-xs text-slate-400 mb-1 block">Hex</label>
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                                  <code className="text-xs text-orange-400 font-mono break-all whitespace-pre-wrap">
                                    {msg.dataHex}
                                  </code>
                                </div>
                              </div>
                            )}
                            <div>
                              <label className="text-xs text-slate-400 mb-1 block">Decoded</label>
                              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                                <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                                  {msg.decodedData && Object.keys(msg.decodedData).length > 0
                                    ? JSON.stringify(msg.decodedData, null, 2)
                                    : '(no decoded data)'}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return rows;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Gateway Location</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-3 block">Location Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="locationType"
                  value="inherited"
                  checked={locationType === 'inherited'}
                  onChange={() => setLocationType('inherited')}
                  className="w-4 h-4 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-white">Inherited</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="locationType"
                  value="manual"
                  checked={locationType === 'manual'}
                  onChange={() => setLocationType('manual')}
                  className="w-4 h-4 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-white">Manual</span>
              </label>
            </div>
          </div>

          {locationType === 'inherited' && (
            <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium mb-1">Location inherited from network</p>
                  <p className="text-sm text-slate-400">{gateway.location}</p>
                  <div className="mt-2 text-xs text-slate-500">
                    <div>Latitude: 40.7128</div>
                    <div>Longitude: -74.0060</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {locationType === 'manual' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Latitude</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={manualLocation.latitude}
                    onChange={(e) => setManualLocation({ ...manualLocation, latitude: e.target.value })}
                    placeholder="e.g., 40.7128"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Longitude</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={manualLocation.longitude}
                    onChange={(e) => setManualLocation({ ...manualLocation, longitude: e.target.value })}
                    placeholder="e.g., -74.0060"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Altitude (meters)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={manualLocation.altitude}
                    onChange={(e) => setManualLocation({ ...manualLocation, altitude: e.target.value })}
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Placement</label>
                  <AppSelect
                    value={manualLocation.placement}
                    onValueChange={(v) => setManualLocation({ ...manualLocation, placement: v })}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    options={[
                      { value: 'Indoor', label: 'Indoor' },
                      { value: 'Outdoor', label: 'Outdoor' },
                      { value: 'Unknown', label: 'Unknown' },
                    ]}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Address</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={manualLocation.address}
                  onChange={(e) => setManualLocation({ ...manualLocation, address: e.target.value })}
                  placeholder="Enter gateway address..."
                />
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-700/50">
            <button
              onClick={() => handleSaveChanges(locationType === 'inherited'
                ? { locationType: 'inherited' }
                : {
                    locationType: 'manual',
                    location: manualLocation.address || gateway.location,
                    latitude: parseFloat(manualLocation.latitude) || undefined,
                    longitude: parseFloat(manualLocation.longitude) || undefined,
                    altitude: parseFloat(manualLocation.altitude) || 0,
                    placement: manualLocation.placement,
                  }
              )}
              disabled={isSaving || showSuccess}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {showSuccess && <CheckCircle className="w-4 h-4" />}
              {showSuccess ? 'Saved!' : isSaving ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </div>
      </div>

      <GatewayMapPanel lat={manualLocation.latitude} lng={manualLocation.longitude} onPinMove={(lat, lng) => setManualLocation(prev => ({ ...prev, latitude: String(lat), longitude: String(lng) }))} />
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Gateway Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Gateway Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settingsName}
              onChange={(e) => setSettingsName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Gateway description..."
              value={settingsDescription}
              onChange={(e) => setSettingsDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="auto-update" className="rounded" defaultChecked />
            <label htmlFor="auto-update" className="text-sm text-slate-300">Enable automatic updates</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="status-public" className="rounded" />
            <label htmlFor="status-public" className="text-sm text-slate-300">Make gateway status public</label>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => handleSaveChanges({ name: settingsName })}
              disabled={isSaving || showSuccess}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {showSuccess && <CheckCircle className="w-4 h-4" />}
              {showSuccess ? 'Saved!' : isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 font-medium transition-all"
            >
              Delete Gateway
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PermissionsList = ({ perms, setPerms }: { perms: typeof DEFAULT_PERMS; setPerms: (p: typeof DEFAULT_PERMS) => void }) => {
    const allChecked = Object.values(perms).every(Boolean);
    const PERM_LABELS: [keyof typeof DEFAULT_PERMS, string][] = [
      ['deleteGateway', 'delete gateway'],
      ['viewGatewayInformation', 'view gateway information'],
      ['linkGatewayServer', 'link as Gateway to a Gateway Server for traffic exchange, i.e. write uplink and read downlink'],
      ['viewGatewayLocation', 'view gateway location'],
      ['purgeGateway', 'purge gateway'],
      ['retrieveSecrets', 'retrieve secrets associated with a gateway'],
      ['viewEditAPIKeys', 'view and edit gateway API keys'],
      ['editBasicSettings', 'edit basic gateway settings'],
      ['viewEditCollaborators', 'view and edit gateway collaborators'],
      ['viewGatewayStatus', 'view gateway status'],
      ['writeDownlink', 'write downlink gateway traffic'],
      ['readTraffic', 'read gateway traffic'],
      ['storeSecrets', 'store secrets for a gateway'],
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
            <p className="text-sm text-slate-400">Manage user access to this gateway</p>
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
                    <span className="text-white text-sm font-medium">{c.name?.slice(0, 2).toUpperCase()}</span>
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
              <p className="text-sm text-slate-500">Add users to grant them access to this gateway</p>
            </div>
          )}
        </div>
      </div>

      {/* Companies */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Shared with Companies</h3>
            <p className="text-sm text-slate-400">Companies that have access to this gateway</p>
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
              <p className="text-sm text-slate-500">Add companies to share this gateway with them</p>
            </div>
          )}
        </div>
        <div className="pt-6 border-t border-slate-700/50 mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {sharedCompanyEntries.length === 0
              ? 'Gateway is private (not shared with any company)'
              : `Sharing with ${sharedCompanyEntries.length} ${sharedCompanyEntries.length === 1 ? 'company' : 'companies'}`}
          </p>
          <button
            onClick={() => handleSaveChanges({ companyId: sharedCompanyEntries[0]?.id ?? null })}
            disabled={isSaving || showSuccess}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center gap-2">
            {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {showSuccess && <CheckCircle className="w-4 h-4" />}
            {showSuccess ? 'Saved!' : isSaving ? 'Saving...' : 'Save Changes'}
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
                  {filteredUsers.length > 0 ? filteredUsers.map((u) => (
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
                      <span className="text-white text-sm font-medium">{selectedUser.avatar}</span>
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
                          <div className="text-xs text-slate-400 mt-1">{val === 'full' ? 'Complete control over this gateway' : 'Select specific permissions'}</div>
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
                          <div className="text-xs text-slate-400 mt-1">{val === 'full' ? 'Complete control over this gateway' : 'Select specific permissions'}</div>
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

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                <p className="text-slate-400 mb-6">Your changes have been saved successfully.</p>
                <div className="w-full bg-slate-700/50 rounded-full h-1 overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-green-600 to-emerald-600"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-3">Returning to gateway list...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteGateway}
        title="Delete Gateway"
        message={`Are you sure you want to delete the gateway "${gateway.name}" (${gateway.eui})? This action cannot be undone.`}
        confirmText="Delete"
      />

      {/* Header */}
      <div className="sticky -top-6 z-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -mx-6 px-6 pt-6 pb-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">{gateway.name}</h2>
            <p className="text-slate-400 font-mono text-sm">{gateway.eui?.toUpperCase()}</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-slate-700">
          {[
            { key: 'overview', icon: <Activity className="w-4 h-4" />, label: 'Overview' },
            { key: 'livedata', icon: <Radio className="w-4 h-4" />, label: 'Live Data' },
            { key: 'location', icon: <MapPin className="w-4 h-4" />, label: 'Location' },
            { key: 'settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' },
            { key: 'share', icon: <Share2 className="w-4 h-4" />, label: 'Share' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && overviewStats}
        {activeTab === 'livedata' && liveDataStats}
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'livedata' && renderLiveData()}
        {activeTab === 'location' && renderLocation()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'share' && renderShare()}
      </div>
    </div>
  );
}
