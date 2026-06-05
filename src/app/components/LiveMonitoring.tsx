import { useState } from 'react';
import { Activity, Radio, Signal, Battery, AlertTriangle, CheckCircle, Clock, Upload } from 'lucide-react';
import { formatDateTime } from '@/app/utils/formatDate';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { useUplinks } from '@/lib/hooks/useUplinks';
import { useEndDevices } from '@/lib/hooks/useEndDevices';

function DeviceCard({ device }: { device: any }) {
  const { data: uplinkPages } = useUplinks(device.devEUI);
  const lastUplink = uplinkPages?.pages[0]?.data?.[0] ?? null;
  const uplinkTotal = uplinkPages?.pages[0]?.total ?? null;

  const status = device.status === 'active' ? 'active'
    : (device.battery != null && device.battery < 25) ? 'warning'
    : 'idle';

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg ${
            status === 'active'  ? 'bg-gradient-to-br from-green-600 to-emerald-600' :
            status === 'warning' ? 'bg-gradient-to-br from-yellow-600 to-orange-600' :
                                   'bg-gradient-to-br from-gray-600 to-slate-600'
          }`}>
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{device.name}</h3>
            <p className="text-xs text-slate-400 font-mono">{device.devEUI}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
          status === 'active'  ? 'bg-green-500/20 text-green-400' :
          status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                 'bg-gray-500/20 text-gray-400'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            status === 'active'  ? 'bg-green-400 animate-pulse' :
            status === 'warning' ? 'bg-yellow-400' :
                                   'bg-gray-400'
          }`} />
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Battery className={`w-4 h-4 ${
              device.battery == null  ? 'text-slate-500' :
              device.battery > 70    ? 'text-green-400' :
              device.battery > 30    ? 'text-yellow-400' :
                                       'text-red-400'
            }`} />
            <span className="text-sm text-slate-300">
              Battery: {device.battery != null ? `${device.battery}%` : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Signal className={`w-4 h-4 ${
              device.rssi == null  ? 'text-slate-500' :
              device.rssi > -70   ? 'text-green-400' :
              device.rssi > -85   ? 'text-yellow-400' :
                                    'text-red-400'
            }`} />
            <span className="text-sm text-slate-300">
              RSSI: {device.rssi != null ? `${device.rssi} dBm` : '—'}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300 truncate">
              {lastUplink
                ? formatDateTime(lastUplink.receivedAt)
                : device.lastSeen ? formatDateTime(device.lastSeen) : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-300">
              {uplinkTotal != null ? `${uplinkTotal} uplinks` : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LiveMonitoring() {
  const [filter, setFilter] = useState('all');
  useWebSocket();
  const { data: uplinkData, isLoading: uplinkLoading } = useUplinks();
  const { data: devices = [], isLoading: devicesLoading } = useEndDevices();

  const recentUplinks = uplinkData?.pages[0]?.data ?? [];
  const allDevices = devices as any[];
  const activeDevices = allDevices.filter((d: any) => d.status === 'active');
  const warningDevices = allDevices.filter((d: any) => d.battery != null && d.battery < 25);

  const filtered =
    filter === 'active'  ? activeDevices :
    filter === 'warning' ? warningDevices :
                           allDevices;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Live Monitoring</h2>
          <p className="text-slate-400">Real-time device activity and status</p>
        </div>
        <div className="flex gap-3">
          {(['all', 'active', 'warning'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {f === 'all' ? 'All Devices' : f === 'active' ? 'Active' : 'Warnings'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: <Activity className="w-5 h-5" />, label: 'Active Now',       value: activeDevices.length,                    gradient: 'from-green-600 to-emerald-600' },
          { icon: <Radio className="w-5 h-5" />,    label: 'Recent Uplinks',   value: recentUplinks.length,                    gradient: 'from-blue-600 to-cyan-600' },
          { icon: <AlertTriangle className="w-5 h-5" />, label: 'Low Battery', value: warningDevices.length,                   gradient: 'from-yellow-600 to-orange-600' },
          { icon: <CheckCircle className="w-5 h-5" />, label: 'Total Devices', value: allDevices.length,                       gradient: 'from-purple-600 to-pink-600' },
        ].map(({ icon, label, value, gradient }) => (
          <div key={label} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-lg text-white`}>
                {icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {devicesLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Radio className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No devices found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((device: any) => (
            <DeviceCard key={device._id} device={device} />
          ))}
        </div>
      )}

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-lg font-bold text-white">Recent Uplinks</h3>
        </div>
        {uplinkLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : recentUplinks.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No uplinks yet</div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {recentUplinks.slice(0, 10).map((uplink: any) => (
              <div key={uplink._id ?? uplink.id} className="p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Radio className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white font-mono">{uplink.deviceEUI}</div>
                    <div className="text-xs text-slate-400">{formatDateTime(uplink.receivedAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Signal className="w-4 h-4 text-slate-400" />
                    <span className={uplink.rssi > -70 ? 'text-green-400' : uplink.rssi > -85 ? 'text-yellow-400' : 'text-red-400'}>
                      {uplink.rssi} dBm
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs">SNR: {uplink.snr} dB</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
