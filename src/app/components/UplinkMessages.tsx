import { useState } from 'react';
import { Radio, Clock, Signal, Database, Eye, Trash2, Download, CheckSquare, Square } from 'lucide-react';
import { formatDateTime } from '@/app/utils/formatDate';
import { useUplinks } from '@/lib/hooks/useUplinks';

export function UplinkMessages() {
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useUplinks();
  const uplinkMessages = data?.pages.flatMap((p: any) => p.data) ?? [];

  const toggleSelect = (id: string) => {
    setSelectedMessages(prev =>
      prev.includes(id) ? prev.filter(msgId => msgId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMessages.length === uplinkMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(uplinkMessages.map((msg: any) => msg._id ?? msg.id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedMessages.length} selected messages?`)) {
      setSelectedMessages([]);
    }
  };

  const handleExport = () => {
    alert(`Exporting ${selectedMessages.length} messages to CSV...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Uplink Messages</h2>
          <p className="text-slate-400">Real-time LoRaWAN uplink message stream</p>
        </div>
        {selectedMessages.length > 0 && (
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
              {selectedMessages.length} selected
            </span>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{uplinkMessages.length}</div>
              <div className="text-xs text-slate-400">Total Messages</div>
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
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">8.2</div>
              <div className="text-xs text-slate-400">Avg SNR</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">2.3/min</div>
              <div className="text-xs text-slate-400">Message Rate</div>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 flex items-center justify-center">
          <div className="animate-pulse text-slate-400">Loading uplink messages...</div>
        </div>
      )}

      {/* Messages Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto themed-scrollbar">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="py-4 px-6">
                  <button onClick={toggleSelectAll}>
                    {selectedMessages.length === uplinkMessages.length ? (
                      <CheckSquare className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Device</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">FPort</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">FCnt</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">RSSI</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">SNR</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">SF</th>
                <th className="text-right py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uplinkMessages.map((msg: any) => {
                const msgId = msg._id ?? msg.id;
                const isExpanded = expandedMessage === msgId;
                const rssi = msg.rssi ?? 0;
                const snr = msg.snr ?? 0;
                const sf = msg.spreadingFactor ? `SF${msg.spreadingFactor}` : (msg.dataRate ?? '-');
                const payload = msg.decodedData ? JSON.stringify(msg.decodedData) : (msg.payload ?? '');
                return (
                  <>
                    <tr
                      key={msgId}
                      className={`border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors group ${
                        selectedMessages.includes(msgId) ? 'bg-blue-500/10' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <button onClick={() => toggleSelect(msgId)}>
                          {selectedMessages.includes(msgId) ? (
                            <CheckSquare className="w-5 h-5 text-blue-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-sm font-medium text-white">{msg.deviceName ?? '-'}</div>
                          <div className="text-xs text-slate-400 font-mono">{msg.deviceEUI ?? msg.devEUI ?? '-'}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">
                            {formatDateTime(msg.receivedAt) ?? (msg.timestamp ?? '-')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">{msg.fPort ?? msg.fport ?? '-'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-300 font-mono">{msg.fCnt ?? msg.fcnt ?? '-'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-sm font-medium ${
                          rssi > -70 ? 'text-green-400' :
                          rssi > -85 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {rssi} dBm
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-300">{snr} dB</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">{sf}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setExpandedMessage(isExpanded ? null : msgId)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                          <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`expanded-${msgId}`} className="border-b border-slate-700/30 bg-slate-900/50">
                        <td colSpan={9} className="py-4 px-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-3">Message Details</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Gateway:</span>
                                  <span className="text-xs text-white">{msg.gatewayEUI ?? msg.gateway ?? '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Gateway:</span>
                                  <span className="text-xs text-white font-mono">{msg.gatewayEUI ?? '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Frequency:</span>
                                  <span className="text-xs text-white font-mono">{msg.frequency ? `${msg.frequency} MHz` : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Data Rate:</span>
                                  <span className="text-xs text-white font-mono">{msg.dataRate ?? '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Coding Rate:</span>
                                  <span className="text-xs text-white font-mono">{msg.codingRate ?? '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Modulation:</span>
                                  <span className="text-xs text-white font-mono">{msg.modulation ?? '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Spreading Factor:</span>
                                  <span className="text-xs text-white font-mono">{msg.spreadingFactor ? `SF${msg.spreadingFactor}` : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Bandwidth:</span>
                                  <span className="text-xs text-white font-mono">{msg.bandwidth ? `${msg.bandwidth} kHz` : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Channel:</span>
                                  <span className="text-xs text-white font-mono">{msg.channel ?? '-'}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-3">Payload</h4>
                              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                                <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                                  {payload}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg text-sm transition-all"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
