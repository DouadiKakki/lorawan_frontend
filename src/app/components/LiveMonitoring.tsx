import { useState } from 'react';
import { Activity, Radio, Signal, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { useUplinks } from '@/lib/hooks/useUplinks';
import { useEndDevices } from '@/lib/hooks/useEndDevices';

export function LiveMonitoring() {
  const [filter, setFilter] = useState('all');
  useWebSocket();
  const { data: uplinkData, isLoading: uplinkLoading } = useUplinks();
  const { data: devices = [] } = useEndDevices();
  const recentUplinks = uplinkData?.pages[0]?.data ?? [];

  const allDevices = devices as any[];
  const activeNow = allDevices.filter((d: any) => d.status === 'active').length;
  const totalMonitored = allDevices.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Live Monitoring</h2>
          <p className="text-slate-400">Real-time device activity and status</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            All Devices
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'active' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            Active
          </button>
          <button 
            onClick={() => setFilter('warning')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'warning' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            Warnings
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Active Now"
          value={String(activeNow)}
          gradient="from-green-600 to-emerald-600"
        />
        <StatCard
          icon={<Radio className="w-5 h-5" />}
          label="Recent Uplinks"
          value={String(recentUplinks.length)}
          gradient="from-blue-600 to-cyan-600"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Inactive"
          value={String(totalMonitored - activeNow)}
          gradient="from-yellow-600 to-orange-600"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Total Monitored"
          value={String(totalMonitored)}
          gradient="from-purple-600 to-pink-600"
        />
      </div>

      {/* Recent Uplinks */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-lg font-bold text-white">Recent Uplinks</h3>
        </div>
        {uplinkLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-pulse text-slate-400">Loading...</div>
          </div>
        ) : recentUplinks.length === 0 ? (
          <div className="p-8 flex items-center justify-center">
            <div className="text-slate-400">No uplinks yet</div>
          </div>
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
                    <div className="text-xs text-slate-400">{uplink.receivedAt ? new Date(uplink.receivedAt).toLocaleString() : '-'}</div>
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

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}

function StatCard({ icon, label, value, gradient }: StatCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  );
}
