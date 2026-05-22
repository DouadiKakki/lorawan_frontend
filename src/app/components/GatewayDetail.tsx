import { useState } from 'react';
import { ArrowLeft, Activity, Radio, MapPin, Settings, Signal, Zap, Clock, Upload, Download, Eye, CheckCircle, Share2, Building } from 'lucide-react';
import { formatDateTime } from '@/app/utils/formatDate';
import { motion, AnimatePresence } from 'motion/react';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { useUplinks } from '@/lib/hooks/useUplinks';

interface GatewayDetailProps {
  gateway: any;
  onBack: () => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

export function GatewayDetail({ gateway, onBack, onUpdate, onDelete }: GatewayDetailProps) {
  const { data: companies = [] } = useCompanies();

  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [locationType, setLocationType] = useState<'inherited' | 'manual'>('manual');
  const [manualLocation, setManualLocation] = useState({
    latitude: '40.7128',
    longitude: '-74.0060',
    altitude: '10',
    placement: 'Indoor',
    address: '',
  });
  const [settingsName, setSettingsName] = useState(gateway.name);
  const [settingsDescription, setSettingsDescription] = useState('');

  const [sharedCompanies, setSharedCompanies] = useState<string[]>(
    gateway.companyId ? [gateway.companyId._id ?? gateway.companyId] : []
  );

  const toggleCompanyShare = (companyId: string) => {
    if (sharedCompanies.includes(companyId)) {
      setSharedCompanies(sharedCompanies.filter(id => id !== companyId));
    } else {
      setSharedCompanies([...sharedCompanies, companyId]);
    }
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
    setIsDeleting(true);
    onDelete(gateway._id);
    setTimeout(() => {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      onBack();
    }, 1000);
  };

  const { data: uplinkPages } = useUplinks(undefined, undefined, gateway.eui);
  const uplinks = uplinkPages?.pages.flatMap((p: any) => p.data) ?? [];

  const avgRssi = uplinks.length
    ? Math.round(uplinks.reduce((acc: number, m: any) => acc + (m.rssi ?? 0), 0) / uplinks.length)
    : null;

  const [expandedTraffic, setExpandedTraffic] = useState<string | null>(null);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white capitalize">{gateway.status}</div>
              <div className="text-xs text-slate-400">Status</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{gateway.devices}</div>
              <div className="text-xs text-slate-400">Active Devices</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Signal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{gateway.messages ?? '—'}</div>
              <div className="text-xs text-slate-400">Messages/Day</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{formatDateTime(gateway.lastSeen)}</div>
              <div className="text-xs text-slate-400">Last Seen</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Gateway Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400">Gateway Name</label>
            <div className="text-sm text-white mt-1">{gateway.name}</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Gateway EUI</label>
            <div className="text-sm text-white font-mono mt-1">{gateway.eui}</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Company</label>
            <div className="text-sm text-white mt-1">{gateway.companyId?.name ?? gateway.company ?? '—'}</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Location</label>
            <div className="text-sm text-white mt-1">{gateway.location}</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Frequency Plan</label>
            <div className="text-sm text-white mt-1">US915</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Gateway Model</label>
            <div className="text-sm text-white mt-1">MultiTech Conduit</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Firmware Version</label>
            <div className="text-sm text-white mt-1">5.3.1</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">LoRa Basics Station</label>
            <div className="text-sm text-white mt-1">v2.0.6</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Network Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400">Gateway Server Address</label>
            <div className="text-sm text-white font-mono mt-1">nam1.cloud.thethings.network</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Connected Since</label>
            <div className="text-sm text-white mt-1">2024-12-18 09:15:30</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Round-Trip Time</label>
            <div className="text-sm text-white mt-1">45 ms</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">IP Address</label>
            <div className="text-sm text-white font-mono mt-1">192.168.1.100</div>
          </div>
        </div>
      </div>
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
              <div className="text-2xl font-bold text-white">{uplinks.length}</div>
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
              <div className="text-2xl font-bold text-white">—</div>
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
              <div className="text-2xl font-bold text-white">{avgRssi !== null ? `${avgRssi} dBm` : '—'}</div>
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
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Device EUI</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">RSSI</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">SNR</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">FPort</th>
                <th className="text-right py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uplinks.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">No uplink messages yet</td>
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
                            <div className="bg-slate-900/50 border border-slate-700/50 rounded px-2 py-1 overflow-hidden">
                              <code className="text-xs text-orange-400 font-mono whitespace-nowrap block overflow-hidden text-ellipsis">
                                {msg.dataHex}
                              </code>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Click to expand</div>
                          </>
                        ) : (
                          <span className="text-sm text-slate-500">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-white font-mono">{msg.deviceEUI ?? msg.devEUI ?? '—'}</span>
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
                      <td colSpan={8} className="py-4 px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-3">Message Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Gateway EUI:</span>
                                <span className="text-xs text-white font-mono">{msg.gatewayEUI ?? '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Frequency:</span>
                                <span className="text-xs text-white font-mono">{msg.frequency != null ? `${msg.frequency} MHz` : '—'}</span>
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
                  <select
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={manualLocation.placement}
                    onChange={(e) => setManualLocation({ ...manualLocation, placement: e.target.value })}
                  >
                    <option>Indoor</option>
                    <option>Outdoor</option>
                    <option>Unknown</option>
                  </select>
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
              onClick={() => handleSaveChanges({ location: manualLocation.address || gateway.location })}
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

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Map View</h3>
        <div className="w-full h-64 bg-slate-700/50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400">Map integration would be shown here</p>
          </div>
        </div>
      </div>
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

  const renderShare = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Share Gateway</h3>
            <p className="text-sm text-slate-400">Select companies to share this gateway with</p>
          </div>
          <div className="px-3 py-1 bg-blue-500/20 rounded-full">
            <span className="text-sm text-blue-400 font-medium">
              {sharedCompanies.length} {sharedCompanies.length === 1 ? 'company' : 'companies'} selected
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {(companies as any[]).map((company: any) => {
            const isShared = sharedCompanies.includes(company._id);
            return (
              <div
                key={company._id}
                className={`p-4 border rounded-xl transition-all cursor-pointer ${
                  isShared
                    ? 'bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/20'
                    : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50'
                }`}
                onClick={() => toggleCompanyShare(company._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={isShared}
                      onChange={() => toggleCompanyShare(company._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded text-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{company.name}</h4>
                        <p className="text-sm text-slate-400 truncate">{company.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 ml-13">
                      <span>{company.users ?? 0} users</span>
                      <span>&bull;</span>
                      <span>{company.devices ?? 0} devices</span>
                    </div>
                  </div>
                  {isShared && (
                    <div className="flex-shrink-0">
                      <div className="px-3 py-1 bg-green-500/20 rounded-full">
                        <span className="text-xs text-green-400 font-medium">Shared</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-6 border-t border-slate-700/50 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {sharedCompanies.length === 0
                ? 'Gateway is private (not shared with any company)'
                : `Sharing with ${sharedCompanies.length} ${sharedCompanies.length === 1 ? 'company' : 'companies'}`
              }
            </p>
            <button
              onClick={() => handleSaveChanges({ companyId: sharedCompanies[0] ?? null })}
              disabled={isSaving || showSuccess}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {showSuccess && <CheckCircle className="w-4 h-4" />}
              {showSuccess ? 'Saved!' : isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative">
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

      <AnimatePresence>
        {showDeleteConfirm && (
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
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Delete Gateway?</h3>
                <p className="text-slate-400 mb-2">Are you sure you want to delete</p>
                <p className="text-white font-semibold mb-1">{gateway.name}</p>
                <p className="text-slate-500 text-sm font-mono mb-6">{gateway.eui}</p>
                <p className="text-red-400 text-sm mb-6">This action cannot be undone.</p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteGateway}
                    disabled={isDeleting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">{gateway.name}</h2>
          <p className="text-slate-400 font-mono text-sm">{gateway.eui}</p>
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

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'livedata' && renderLiveData()}
      {activeTab === 'location' && renderLocation()}
      {activeTab === 'settings' && renderSettings()}
      {activeTab === 'share' && renderShare()}
    </div>
  );
}
