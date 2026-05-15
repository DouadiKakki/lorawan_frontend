import { Database, HardDrive, Archive, Download, Trash2, BarChart3 } from 'lucide-react';
import { useUplinkStatsSummary } from '@/lib/hooks/useUplinkStats';

export function Storage() {
  const { data: summary } = useUplinkStatsSummary();
  const total = (summary as any)?.total ?? 0;
  const deviceCount = (summary as any)?.deviceCount ?? 0;
  const gatewayCount = (summary as any)?.gatewayCount ?? 0;

  const storageData = [
    { id: 1, name: 'Uplink Messages', size: '—', records: total.toLocaleString(), retention: '90 days', lastBackup: 'Live' },
    { id: 2, name: 'Active Devices', size: '—', records: String(deviceCount), retention: '—', lastBackup: 'Live' },
    { id: 3, name: 'Active Gateways', size: '—', records: String(gatewayCount), retention: '—', lastBackup: 'Live' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Data Storage</h2>
        <p className="text-slate-400">Manage data retention and storage</p>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">5.5 GB</div>
              <div className="text-xs text-slate-400">Total Storage</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">2.8M</div>
              <div className="text-xs text-slate-400">Total Records</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Archive className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">1.2 GB</div>
              <div className="text-xs text-slate-400">Archived</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">45%</div>
              <div className="text-xs text-slate-400">Usage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Usage Bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Storage Usage</h3>
          <span className="text-sm text-slate-400">5.5 GB of 12 GB used</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all" style={{ width: '45%' }}></div>
        </div>
      </div>

      {/* Storage Breakdown */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Data Type</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Size</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Records</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Retention</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Last Backup</th>
                <th className="text-right py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {storageData.map((item) => (
                <tr key={item.id} className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-white font-medium">{item.size}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-300">{item.records}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                      {item.retention}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-300">{item.lastBackup}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors">
                        <Download className="w-4 h-4 text-blue-400" />
                      </button>
                      <button className="p-2 hover:bg-green-500/20 rounded-lg transition-colors">
                        <Archive className="w-4 h-4 text-green-400" />
                      </button>
                      <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backup Schedule */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Automated Backups</h3>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white text-sm font-medium hover:shadow-lg transition-all">
            Configure Schedule
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Frequency</div>
            <div className="text-lg font-semibold text-white">Every 6 hours</div>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Next Backup</div>
            <div className="text-lg font-semibold text-white">In 2 hours</div>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="text-lg font-semibold text-green-400">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
