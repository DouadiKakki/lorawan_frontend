import { useState, Fragment } from 'react';
import { ArrowLeft, Activity, Radio, MapPin, Settings, Signal, Zap, Clock, Upload, Download, Eye } from 'lucide-react';
import { useUplinks } from '@/lib/hooks/useUplinks';

interface GatewayDetailProps {
  gateway: any;
  onBack: () => void;
}

export function GatewayDetail({ gateway, onBack }: GatewayDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: uplinkPages } = useUplinks(undefined, undefined, gateway.eui ?? gateway.gatewayEUI);
  const trafficData = uplinkPages?.pages.flatMap((p: any) => p.data) ?? [];

  const [expandedTraffic, setExpandedTraffic] = useState<string | null>(null);

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
              <div className="text-2xl font-bold text-white">{gateway.messages}</div>
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
              <div className="text-2xl font-bold text-white">{gateway.lastSeen}</div>
              <div className="text-xs text-slate-400">Last Seen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gateway Information */}
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
            <label className="text-xs text-slate-400">Location</label>
            <div className="text-sm text-white mt-1">{gateway.location || '—'}</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Company</label>
            <div className="text-sm text-white mt-1">{gateway.company || '—'}</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Uptime</label>
            <div className="text-sm text-white mt-1">{gateway.uptime || '—'}</div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Last Seen</label>
            <div className="text-sm text-white mt-1">
              {gateway.lastSeen ? new Date(gateway.lastSeen).toLocaleString() : 'Never'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLiveData = () => (
    <div className="space-y-6">
      {/* Traffic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{trafficData.length}</div>
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
              <div className="text-2xl font-bold text-white">-68 dBm</div>
              <div className="text-xs text-slate-400">Avg RSSI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Device</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">RSSI</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">SNR</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">SF</th>
                <th className="text-right py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trafficData.map((traffic: any) => {
                const id = traffic._id ?? traffic.id;
                const isExpanded = expandedTraffic === id;
                return (
                  <Fragment key={id}>
                    <tr className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors group">
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
                            {traffic.receivedAt ? new Date(traffic.receivedAt).toLocaleString() : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-white font-mono">{traffic.deviceEUI}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-sm font-medium ${
                          traffic.rssi > -70 ? 'text-green-400' :
                          traffic.rssi > -85 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {traffic.rssi} dBm
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-300">{traffic.snr} dB</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-500">—</span>
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
                    {isExpanded && (
                      <tr key={`detail-${id}`} className="border-b border-slate-700/30 bg-slate-900/50">
                        <td colSpan={7} className="py-4 px-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-3">Traffic Details</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Frequency:</span>
                                  <span className="text-xs text-white font-mono">{traffic.frequency} MHz</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">RSSI:</span>
                                  <span className="text-xs text-white">{traffic.rssi} dBm</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">SNR:</span>
                                  <span className="text-xs text-white">{traffic.snr} dB</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Device EUI:</span>
                                  <span className="text-xs text-white font-mono">{traffic.deviceEUI}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Latitude</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="40.7128"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Longitude</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="-74.0060"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Altitude (meters)</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="10"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Placement</label>
              <select className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
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
              placeholder="Enter gateway address..."
            />
          </div>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">
            Update Location
          </button>
        </div>
      </div>

      {/* Map Placeholder */}
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
              defaultValue={gateway.name}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Gateway description..."
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
            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">
              Save Changes
            </button>
            <button className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 font-medium transition-all">
              Delete Gateway
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
          <h2 className="text-2xl font-bold text-white">{gateway.name}</h2>
          <p className="text-slate-400 font-mono text-sm">{gateway.eui}</p>
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
          onClick={() => setActiveTab('location')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'location'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Location
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
      {activeTab === 'location' && renderLocation()}
      {activeTab === 'settings' && renderSettings()}
    </div>
  );
}