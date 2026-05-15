import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

const data = [
  { time: '00:00', uplinks: 420, downlinks: 180, packets: 380 },
  { time: '01:00', uplinks: 380, downlinks: 150, packets: 340 },
  { time: '02:00', uplinks: 310, downlinks: 120, packets: 290 },
  { time: '03:00', uplinks: 290, downlinks: 110, packets: 270 },
  { time: '04:00', uplinks: 310, downlinks: 130, packets: 290 },
  { time: '05:00', uplinks: 340, downlinks: 140, packets: 310 },
  { time: '06:00', uplinks: 450, downlinks: 190, packets: 420 },
  { time: '07:00', uplinks: 520, downlinks: 220, packets: 480 },
  { time: '08:00', uplinks: 580, downlinks: 250, packets: 520 },
  { time: '09:00', uplinks: 650, downlinks: 280, packets: 590 },
  { time: '10:00', uplinks: 720, downlinks: 310, packets: 650 },
  { time: '11:00', uplinks: 810, downlinks: 350, packets: 730 },
  { time: '12:00', uplinks: 890, downlinks: 380, packets: 810 },
  { time: '13:00', uplinks: 850, downlinks: 370, packets: 770 },
  { time: '14:00', uplinks: 780, downlinks: 340, packets: 710 },
  { time: '15:00', uplinks: 740, downlinks: 320, packets: 670 },
  { time: '16:00', uplinks: 720, downlinks: 310, packets: 650 },
  { time: '17:00', uplinks: 680, downlinks: 290, packets: 620 },
  { time: '18:00', uplinks: 640, downlinks: 280, packets: 580 },
  { time: '19:00', uplinks: 610, downlinks: 260, packets: 550 },
  { time: '20:00', uplinks: 610, downlinks: 270, packets: 560 },
  { time: '21:00', uplinks: 580, downlinks: 250, packets: 520 },
  { time: '22:00', uplinks: 520, downlinks: 230, packets: 470 },
  { time: '23:00', uplinks: 480, downlinks: 210, packets: 440 },
];

export function ActivityChart() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Network Activity</h3>
          <p className="text-sm text-slate-400">Last 24 hours</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorUplinks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDownlinks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
          <Area type="monotone" dataKey="uplinks" stroke="#10b981" fillOpacity={1} fill="url(#colorUplinks)" />
          <Area type="monotone" dataKey="downlinks" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDownlinks)" />
          <Area type="monotone" dataKey="packets" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPackets)" />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-sm text-slate-400">Uplinks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-sm text-slate-400">Downlinks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-slate-400">Packets</span>
        </div>
      </div>
    </div>
  );
}