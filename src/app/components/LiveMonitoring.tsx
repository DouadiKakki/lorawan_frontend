import { useState } from 'react';
import { Activity, Radio, Signal, Battery, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const liveDevices = [
  { id: 1, name: 'Temperature Sensor 01', devEUI: '70-B3-D5-7E-D0-06-6E-81', status: 'transmitting', battery: 95, rssi: -67, lastData: 'Now', dataRate: '3.2 KB/s' },
  { id: 2, name: 'Light Controller 02', devEUI: '8C-F9-57-ED-32-4A-1B-C2', status: 'transmitting', battery: 78, rssi: -72, lastData: '2s ago', dataRate: '1.8 KB/s' },
  { id: 3, name: 'Door Sensor 03', devEUI: '3A-B2-C8-9D-FF-12-34-56', status: 'warning', battery: 23, rssi: -89, lastData: '5s ago', dataRate: '0.5 KB/s' },
  { id: 4, name: 'Motion Detector 04', devEUI: '5D-7F-A3-8E-11-CC-DD-EE', status: 'transmitting', battery: 100, rssi: -58, lastData: '1s ago', dataRate: '2.1 KB/s' },
  { id: 5, name: 'Water Meter 05', devEUI: 'F2-9A-4B-CC-77-88-99-00', status: 'idle', battery: 45, rssi: -95, lastData: '30s ago', dataRate: '0 KB/s' },
];

export function LiveMonitoring() {
  const [filter, setFilter] = useState('all');

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
          value="4"
          gradient="from-green-600 to-emerald-600"
        />
        <StatCard
          icon={<Radio className="w-5 h-5" />}
          label="Transmitting"
          value="3"
          gradient="from-blue-600 to-cyan-600"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Warnings"
          value="1"
          gradient="from-yellow-600 to-orange-600"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Total Monitored"
          value="5"
          gradient="from-purple-600 to-pink-600"
        />
      </div>

      {/* Live Devices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {liveDevices.map((device) => (
          <div
            key={device.id}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg ${
                  device.status === 'transmitting' ? 'bg-gradient-to-br from-green-600 to-emerald-600' :
                  device.status === 'warning' ? 'bg-gradient-to-br from-yellow-600 to-orange-600' :
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
                device.status === 'transmitting' ? 'bg-green-500/20 text-green-400' :
                device.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  device.status === 'transmitting' ? 'bg-green-400 animate-pulse' :
                  device.status === 'warning' ? 'bg-yellow-400' :
                  'bg-gray-400'
                }`}></div>
                {device.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Battery className={`w-4 h-4 ${
                    device.battery > 70 ? 'text-green-400' :
                    device.battery > 30 ? 'text-yellow-400' :
                    'text-red-400'
                  }`} />
                  <span className="text-sm text-slate-300">Battery: {device.battery}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Signal className={`w-4 h-4 ${
                    device.rssi > -70 ? 'text-green-400' :
                    device.rssi > -85 ? 'text-yellow-400' :
                    'text-red-400'
                  }`} />
                  <span className="text-sm text-slate-300">RSSI: {device.rssi} dBm</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">{device.lastData}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">{device.dataRate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
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
