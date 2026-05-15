import { Radio, Signal, Battery, Clock, MapPin, MoreVertical, Eye, Trash2 } from 'lucide-react';
import { useEndDevices } from '@/lib/hooks/useEndDevices';

export function DeviceList() {
  const { data: devices = [], isLoading } = useEndDevices();
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Connected Devices</h3>
          <p className="text-sm text-slate-400">{isLoading ? 'Loading...' : `${devices.length} devices`}</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">
          View All Devices
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-xs text-slate-400 uppercase tracking-wider">Device</th>
              <th className="text-left py-3 px-4 text-xs text-slate-400 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs text-slate-400 uppercase tracking-wider">Battery</th>
              <th className="text-left py-3 px-4 text-xs text-slate-400 uppercase tracking-wider">Signal</th>
              <th className="text-left py-3 px-4 text-xs text-slate-400 uppercase tracking-wider">Location</th>
              <th className="text-left py-3 px-4 text-xs text-slate-400 uppercase tracking-wider">Last Seen</th>
              <th className="text-left py-3 px-4 text-xs text-slate-400 uppercase tracking-wider">Messages</th>
              <th className="text-right py-3 px-4 text-xs text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device: any) => (
              <tr
                key={device.id}
                className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors group"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      device.status === 'active' ? 'bg-gradient-to-br from-green-600 to-emerald-600' :
                      device.status === 'warning' ? 'bg-gradient-to-br from-yellow-600 to-orange-600' :
                      'bg-gradient-to-br from-gray-600 to-slate-600'
                    } shadow-lg`}>
                      <Radio className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{device.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{device.devEUI}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    device.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    device.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      device.status === 'active' ? 'bg-green-400 animate-pulse' :
                      device.status === 'warning' ? 'bg-yellow-400' :
                      'bg-gray-400'
                    }`}></div>
                    {device.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Battery className={`w-4 h-4 ${
                      device.battery > 70 ? 'text-green-400' :
                      device.battery > 30 ? 'text-yellow-400' :
                      'text-red-400'
                    }`} />
                    <span className="text-sm text-white">{device.battery}%</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Signal className={`w-4 h-4 ${
                      device.rssi > -70 ? 'text-green-400' :
                      device.rssi > -85 ? 'text-yellow-400' :
                      'text-red-400'
                    }`} />
                    <span className="text-sm text-white">{device.rssi} dBm</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-white">{device.location}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">{device.lastSeen}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-white font-medium">{device.messages.toLocaleString()}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-blue-400" />
                    </button>
                    <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
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
  );
}
