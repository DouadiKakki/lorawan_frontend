import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Radio, Zap } from 'lucide-react';
import { useUplinkStatsHourly, useUplinkStatsGateway, useUplinkStatsSummary } from '@/lib/hooks/useUplinkStats';
import { useEndDevices } from '@/lib/hooks/useEndDevices';

export function Analytics() {
  const { data: hourly = [] } = useUplinkStatsHourly();
  const { data: gatewayStats = [] } = useUplinkStatsGateway();
  const { data: summary } = useUplinkStatsSummary();
  const { data: devices = [] } = useEndDevices();

  const networkData = (hourly as any[]).map((h: any) => ({ time: h.time, uplink: h.uplinks }));
  const gatewayPerformance = (gatewayStats as any[]);
  const activeDevices = (devices as any[]).filter((d: any) => d.status === 'active').length;
  const totalUplinks = (summary as any)?.total ?? '—';
  const last24h = (summary as any)?.last24h ?? '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Analytics</h2>
        <p className="text-slate-400">Network performance and insights</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          icon={<TrendingUp />}
          label="Network Uptime"
          value="99.8%"
          trend="+0.2%"
          gradient="from-green-600 to-emerald-600"
        />
        <KPICard
          icon={<Activity />}
          label="Avg Packet Loss"
          value="0.3%"
          trend="-0.1%"
          gradient="from-blue-600 to-cyan-600"
        />
        <KPICard
          icon={<Radio />}
          label="Active Devices"
          value={String(activeDevices)}
          trend=""
          gradient="from-purple-600 to-pink-600"
        />
        <KPICard
          icon={<Zap />}
          label="Uplinks (24h)"
          value={String(last24h)}
          trend={`${totalUplinks} total`}
          gradient="from-orange-600 to-red-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Traffic */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Network Traffic (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={networkData}>
              <defs>
                <linearGradient id="colorUplink" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDownlink" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area type="monotone" dataKey="uplink" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUplink)" />
              <Area type="monotone" dataKey="downlink" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorDownlink)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-slate-400">Uplink</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-slate-400">Downlink</span>
            </div>
          </div>
        </div>

        {/* Device Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Device Status</h3>
          <div className="space-y-4 mt-6">
            {[
              { label: 'Active', color: '#10b981', count: (devices as any[]).filter((d: any) => d.status === 'active').length },
              { label: 'Inactive', color: '#64748b', count: (devices as any[]).filter((d: any) => d.status === 'inactive').length },
            ].map(row => {
              const total = (devices as any[]).length || 1;
              const pct = Math.round((row.count / total) * 100);
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="text-white font-medium">{row.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: row.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <div className="text-3xl font-bold text-white">{(devices as any[]).length}</div>
            <div className="text-sm text-slate-400">Total devices</div>
          </div>
        </div>

        {/* Gateway Performance */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4">Gateway Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gatewayPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="performance" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  gradient: string;
}

function KPICard({ icon, label, value, trend, gradient }: KPICardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-lg`}>
          <div className="text-white">{icon}</div>
        </div>
        <span className="text-xs text-green-400 font-medium">{trend}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
