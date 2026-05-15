import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Activity, Radio, Zap } from 'lucide-react';

const networkData = [
  { time: '00:00', uplink: 4200, downlink: 1800, packets: 6000 },
  { time: '04:00', uplink: 3100, downlink: 1200, packets: 4300 },
  { time: '08:00', uplink: 5800, downlink: 2400, packets: 8200 },
  { time: '12:00', uplink: 8900, downlink: 3600, packets: 12500 },
  { time: '16:00', uplink: 7200, downlink: 2900, packets: 10100 },
  { time: '20:00', uplink: 6100, downlink: 2500, packets: 8600 },
  { time: '23:59', uplink: 5400, downlink: 2200, packets: 7600 },
];

const deviceTypeData = [
  { name: 'Sensors', value: 450, color: '#3b82f6' },
  { name: 'Controllers', value: 280, color: '#8b5cf6' },
  { name: 'Meters', value: 320, color: '#10b981' },
  { name: 'Trackers', value: 180, color: '#f59e0b' },
];

const gatewayPerformance = [
  { name: 'GW-01', performance: 99.9, packets: 12500 },
  { name: 'GW-02', performance: 99.7, packets: 11200 },
  { name: 'GW-03', performance: 85.2, packets: 8900 },
  { name: 'GW-04', performance: 99.8, packets: 13400 },
  { name: 'GW-05', performance: 0, packets: 0 },
];

export function Analytics() {
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
          value="1,230"
          trend="+12"
          gradient="from-purple-600 to-pink-600"
        />
        <KPICard
          icon={<Zap />}
          label="Data Throughput"
          value="2.4 GB"
          trend="+18%"
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

        {/* Device Types */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Device Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={deviceTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {deviceTypeData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-slate-400">{item.name}: {item.value}</span>
              </div>
            ))}
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
