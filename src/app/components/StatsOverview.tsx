import { Radio, Activity, TrendingUp, Zap, ArrowUp, ArrowDown } from 'lucide-react';

export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Devices"
        value="2,847"
        change="+12.5%"
        trend="up"
        icon={<Radio />}
        gradient="from-blue-600 to-cyan-600"
      />
      <StatCard
        title="Active Gateways"
        value="42"
        change="+3.2%"
        trend="up"
        icon={<Zap />}
        gradient="from-purple-600 to-pink-600"
      />
      <StatCard
        title="Messages Today"
        value="156.2K"
        change="+28.4%"
        trend="up"
        icon={<Activity />}
        gradient="from-green-600 to-emerald-600"
      />
      <StatCard
        title="Network Load"
        value="68%"
        change="-5.1%"
        trend="down"
        icon={<TrendingUp />}
        gradient="from-orange-600 to-red-600"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  gradient: string;
}

function StatCard({ title, value, change, trend, icon, gradient }: StatCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <div className="text-white">{icon}</div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
          trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
    </div>
  );
}
