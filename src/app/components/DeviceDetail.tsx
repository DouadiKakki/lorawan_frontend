import { useState } from 'react';
import { ArrowLeft, Activity, Radio, Code, Settings, Battery, Signal, Clock, Download, Upload, Eye, Send, EyeOff } from 'lucide-react';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';
import { useUplinks } from '@/lib/hooks/useUplinks';
import { formatDateTime } from '@/app/utils/formatDate';

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

  const { data: uplinkPages } = useUplinks(device.devEUI);
  const messages = uplinkPages?.pages.flatMap((p: any) => p.data) ?? [];

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const formatKey = (key: string, visible: boolean) =>
    visible ? key : '•'.repeat(16);

  const handleResetDevNonces = () => {
    console.log('DevNonces reset');
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
              <div className="text-sm text-white font-mono mt-1">{device.devEUI}</div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Application</label>
              <div className="text-sm text-white mt-1">{device.application}</div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Device Class</label>
              <div className="text-sm text-white mt-1">Class A</div>
            </div>
            <div>
              <label className="text-xs text-slate-400">LoRaWAN Version</label>
              <div className="text-sm text-white mt-1">1.0.3</div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Regional Parameters</label>
              <div className="text-sm text-white mt-1">US915</div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Created Date</label>
              <div className="text-sm text-white mt-1">
                {device.createdAt ? new Date(device.createdAt).toLocaleString() : 'Jan 15, 2024 10:30 AM'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">JoinEUI</label>
              <div className="text-sm text-white font-mono bg-slate-700/50 px-3 py-1.5 rounded-lg mt-1">70 B3 D5 7E D0 06 C5 1A</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'AppKey', key: 'appKey', value: 'A1 B2 C3 D4 E5 F6 78 90 A1 B2 C3 D4 E5 F6 78 90' },
              { label: 'NwkKey', key: 'nwkKey', value: 'B2 C3 D4 E5 F6 78 90 A1 B2 C3 D4 E5 F6 78 90 A1' },
            ].map(({ label, key, value }) => (
              <div key={key}>
                <label className="text-xs text-slate-400">{label}</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 text-sm text-white font-mono bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    {formatKey(value, !!showKeys[key])}
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

      {/* Session Information */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Session Information</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Session start</label>
              <div className="text-sm text-white mt-1">Jan 24, 2026 17:26:02</div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Device address</label>
              <div className="text-sm text-white font-mono bg-slate-700/50 px-3 py-1.5 rounded-lg mt-1">26 0B 50 E3</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'FNwkSIntKey', key: 'fNwkSIntKey', value: '69 A1 83 51 C1 A2 0D 8B 1D 9A AE 52 CB AA 48 8D' },
              { label: 'SNwkSIntKey', key: 'sNwkSIntKey', value: '6B F5 D1 8F FB D8 5C FD 9C AD 0F 9B 31 38 5C CC' },
              { label: 'NwkSEncKey', key: 'nwkSEncKey', value: '7D 27 A6 F8 95 56 C3 24 8B BF DF 74 38 5C 89 8B' },
              { label: 'AppSKey', key: 'appSKey', value: 'C3 D4 E5 F6 78 90 A1 B2 C3 D4 E5 F6 78 90 A1 B2' },
            ].map(({ label, key, value }) => (
              <div key={key}>
                <label className="text-xs text-slate-400">{label}</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 text-sm text-white font-mono bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    {formatKey(value, !!showKeys[key])}
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
                const hexPayload = msg.rawData
                  ? msg.rawData
                  : msg.decodedData
                    ? Array.from(JSON.stringify(msg.decodedData))
                        .map((c: any) => c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase())
                        .join(' ')
                    : '—';

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
                      <td className="py-4 px-6">
                        <div className="max-w-xs">
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
                        <span className="text-sm text-slate-500">—</span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`expanded-${id}`} className="border-b border-slate-700/30 bg-slate-900/50">
                        <td colSpan={8} className="py-4 px-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-3">Message Details</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Gateway EUI:</span>
                                  <span className="text-xs text-white font-mono">{msg.gatewayEUI}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Frequency:</span>
                                  <span className="text-xs text-white font-mono">{msg.frequency} MHz</span>
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
            <select className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>None</option>
              <option>JavaScript</option>
              <option>CayenneLPP</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Uplink Formatter</label>
            <textarea
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={10}
              placeholder={"function decodeUplink(input) {\n  return {\n    data: {\n      // decoded payload\n    }\n  };\n}"}
            />
          </div>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">
            Save Formatter
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
            <select className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Europe 863-870 MHz (SF9 for RX2 - recommended)</option>
              <option>United States 902-928 MHz (SF10 for RX2)</option>
              <option>Australia 915-928 MHz (SF12 for RX2)</option>
              <option>Asia 923 MHz (SF10 for RX2)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">LoRaWAN version <span className="text-red-400">*</span></label>
            <select className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>LoRaWAN Specification 1.1.0</option>
              <option>LoRaWAN Specification 1.0.4</option>
              <option>LoRaWAN Specification 1.0.3</option>
              <option>LoRaWAN Specification 1.0.2</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Regional Parameters version <span className="text-red-400">*</span></label>
            <select className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>RP001 Regional Parameters 1.1 revision A</option>
              <option>RP001 Regional Parameters 1.0 revision B</option>
              <option>RP002-1.0.3 Regional Parameters</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">LoRaWAN class capabilities</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                <span className="text-sm text-slate-300">Supports class B</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                <span className="text-sm text-slate-300">Supports class C</span>
              </label>
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Activation mode <span className="text-red-400">*</span></label>
            <div className="space-y-2">
              {['Over the air activation (OTAA)', 'Activation by personalization (ABP)', 'Define multicast group (ABP & Multicast)'].map((mode, i) => (
                <label key={mode} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="activationMode" defaultChecked={i === 0} className="w-4 h-4 bg-slate-700 border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm text-slate-300">{mode}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-4">
            <label className="text-sm text-slate-300 mb-2 block">Resets join nonces</label>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500" />
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
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">
            Save Changes
          </button>
          <button className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 font-medium transition-all">
            Delete Device
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">{device.name}</h2>
            <p className="text-slate-400 font-mono text-sm">{device.devEUI}</p>
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
                <span className="text-sm text-white font-mono">{device.devEUI}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Application:</span>
                <span className="text-sm text-white">{device.application}</span>
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
              onClick={() => { console.log('Sending downlink:', downlinkData); setShowDownlinkModal(false); }}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              Send
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
    </div>
  );
}
