import { useState } from 'react';
import { ArrowLeft, Activity, Radio, MessageSquare, Code, Settings, Battery, Signal, Wifi, Clock, Download, Upload, Eye } from 'lucide-react';

interface DeviceDetailProps {
  device: any;
  onBack: () => void;
}

export function DeviceDetail({ device, onBack }: DeviceDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample uplink/downlink messages for the device
  const messages = [
    { id: 1, type: 'uplink', timestamp: '2024-12-20 14:32:15', fport: 1, fcnt: 1245, payload: '{"temp":22.5,"humidity":65}', rssi: -67, snr: 8.5, sf: 'SF7', bandwidth: '125 kHz', frequency: '902.3 MHz', gateway: 'Gateway-Central-01', size: '24 bytes' },
    { id: 2, type: 'downlink', timestamp: '2024-12-20 14:32:16', fport: 2, fcnt: 89, payload: '{"command":"set_interval","value":300}', confirmed: true, pending: false, gateway: 'Gateway-Central-01', size: '36 bytes' },
    { id: 3, type: 'uplink', timestamp: '2024-12-20 14:27:15', fport: 1, fcnt: 1244, payload: '{"temp":22.3,"humidity":64}', rssi: -68, snr: 8.2, sf: 'SF7', bandwidth: '125 kHz', frequency: '902.3 MHz', gateway: 'Gateway-Central-01', size: '24 bytes' },
    { id: 4, type: 'uplink', timestamp: '2024-12-20 14:22:15', fport: 1, fcnt: 1243, payload: '{"temp":22.1,"humidity":66}', rssi: -66, snr: 8.7, sf: 'SF7', bandwidth: '125 kHz', frequency: '902.3 MHz', gateway: 'Gateway-Central-01', size: '24 bytes' },
    { id: 5, type: 'downlink', timestamp: '2024-12-20 14:20:10', fport: 2, fcnt: 88, payload: '{"command":"reboot"}', confirmed: true, pending: false, gateway: 'Gateway-Central-01', size: '18 bytes' },
    { id: 6, type: 'uplink', timestamp: '2024-12-20 14:17:15', fport: 1, fcnt: 1242, payload: '{"temp":21.9,"humidity":65}', rssi: -69, snr: 8.1, sf: 'SF7', bandwidth: '125 kHz', frequency: '902.3 MHz', gateway: 'Gateway-Central-01', size: '24 bytes' },
    { id: 7, type: 'uplink', timestamp: '2024-12-20 14:12:15', fport: 1, fcnt: 1241, payload: '{"temp":21.8,"humidity":67}', rssi: -67, snr: 8.4, sf: 'SF7', bandwidth: '125 kHz', frequency: '902.3 MHz', gateway: 'Gateway-Central-01', size: '24 bytes' },
  ];

  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
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
              <div className="text-2xl font-bold text-white">{device.lastSeen}</div>
              <div className="text-xs text-slate-400">Last Seen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Information */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Device Information</h3>
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
        </div>
      </div>

      {/* Session Information */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Session Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400">Device Address</label>
            <div className="text-sm text-white font-mono mt-1">26011D3A</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Network Session Key</label>
            <div className="text-sm text-white font-mono mt-1">••••••••••••••••</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Application Session Key</label>
            <div className="text-sm text-white font-mono mt-1">••••••••••••••••</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Frame Counter (Up)</label>
            <div className="text-sm text-white font-mono mt-1">1245</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLiveData = () => (
    <div className="space-y-6">
      {/* Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{messages.filter(m => m.type === 'uplink').length}</div>
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
              <div className="text-2xl font-bold text-white">{messages.filter(m => m.type === 'downlink').length}</div>
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
              <div className="text-2xl font-bold text-white">-67 dBm</div>
              <div className="text-xs text-slate-400">Avg RSSI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">FPort</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">FCnt</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">RSSI</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">SNR</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">SF</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => {
                const isExpanded = expandedMessage === msg.id;
                return (
                  <tr 
                    key={msg.id}
                    onClick={() => setExpandedMessage(isExpanded ? null : msg.id)}
                    className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {msg.type === 'uplink' ? (
                          <>
                            <Upload className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-blue-400 font-medium">Uplink</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-purple-400 font-medium">Downlink</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{msg.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">{msg.fport}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-300 font-mono">{msg.fcnt}</span>
                    </td>
                    <td className="py-4 px-6">
                      {msg.type === 'uplink' && msg.rssi ? (
                        <span className={`text-sm font-medium ${
                          msg.rssi > -70 ? 'text-green-400' :
                          msg.rssi > -85 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {msg.rssi} dBm
                        </span>
                      ) : (
                        <span className="text-sm text-slate-500">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {msg.type === 'uplink' && msg.snr ? (
                        <span className="text-sm text-slate-300">{msg.snr} dB</span>
                      ) : (
                        <span className="text-sm text-slate-500">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {msg.type === 'uplink' && msg.sf ? (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">{msg.sf}</span>
                      ) : (
                        <span className="text-sm text-slate-500">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {messages.map((msg) => {
                const isExpanded = expandedMessage === msg.id;
                return isExpanded ? (
                  <tr key={`expanded-${msg.id}`} className="border-b border-slate-700/30 bg-slate-900/50">
                    <td colSpan={7} className="py-4 px-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-3">Message Details</h4>
                          <div className="space-y-2">
                            {msg.type === 'uplink' && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Gateway:</span>
                                  <span className="text-xs text-white">{msg.gateway}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Frequency:</span>
                                  <span className="text-xs text-white font-mono">{msg.frequency}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Bandwidth:</span>
                                  <span className="text-xs text-white font-mono">{msg.bandwidth}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Spreading Factor:</span>
                                  <span className="text-xs text-white font-mono">{msg.sf}</span>
                                </div>
                              </>
                            )}
                            {msg.type === 'downlink' && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Gateway:</span>
                                  <span className="text-xs text-white">{msg.gateway}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Confirmed:</span>
                                  <span className="text-xs text-white">{msg.confirmed ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Pending:</span>
                                  <span className="text-xs text-white">{msg.pending ? 'Yes' : 'No'}</span>
                                </div>
                              </>
                            )}
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-400">Payload Size:</span>
                              <span className="text-xs text-white font-mono">{msg.size}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-3">Payload</h4>
                          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                            <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                              {JSON.stringify(JSON.parse(msg.payload), null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMessaging = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Schedule Downlink</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">FPort</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1-223"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Payload (Base64 or Hex)</label>
            <textarea
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter payload..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="confirmed" className="rounded" />
            <label htmlFor="confirmed" className="text-sm text-slate-300">Confirmed downlink</label>
          </div>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">
            Schedule Downlink
          </button>
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
              placeholder="function decodeUplink(input) {&#10;  return {&#10;    data: {&#10;      // decoded payload&#10;    }&#10;  };&#10;}"
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
        <h3 className="text-lg font-semibold text-white mb-4">Device Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Device Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue={device.name}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Device description..."
            />
          </div>
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
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">{device.name}</h2>
          <p className="text-slate-400 font-mono text-sm">{device.devEUI}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('livedata')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'livedata'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          Live Data
        </button>
        <button
          onClick={() => setActiveTab('messaging')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'messaging'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Messaging
        </button>
        <button
          onClick={() => setActiveTab('formatter')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'formatter'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          Payload Formatter
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'livedata' && renderLiveData()}
      {activeTab === 'messaging' && renderMessaging()}
      {activeTab === 'formatter' && renderPayloadFormatter()}
      {activeTab === 'settings' && renderSettings()}
    </div>
  );
}