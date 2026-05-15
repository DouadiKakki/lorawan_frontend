import { useState } from 'react';
import { Radio, Clock, Signal, Database, Eye, Trash2, Download, CheckSquare, Square } from 'lucide-react';

const uplinkMessages = [
  { id: 1, deviceName: 'Temperature Sensor 01', devEUI: '70-B3-D5-7E-D0-06-6E-81', timestamp: '2024-12-20 14:32:15', fport: 1, fcnt: 1245, payload: '{"temp":22.5,"humidity":65}', rssi: -67, snr: 8.5, sf: 'SF7', bandwidth: '125 kHz', frequency: '902.3 MHz', gateway: 'Gateway-Central-01' },
  { id: 2, deviceName: 'Light Controller 02', devEUI: '8C-F9-57-ED-32-4A-1B-C2', timestamp: '2024-12-20 14:31:48', fport: 2, fcnt: 892, payload: '{"state":"on","brightness":75}', rssi: -72, snr: 7.2, sf: 'SF8', bandwidth: '125 kHz', frequency: '903.1 MHz', gateway: 'Gateway-Central-01' },
  { id: 3, deviceName: 'Door Sensor 03', devEUI: '3A-B2-C8-9D-FF-12-34-56', timestamp: '2024-12-20 14:30:22', fport: 1, fcnt: 3421, payload: '{"door":"closed","battery":23}', rssi: -89, snr: 2.1, sf: 'SF10', bandwidth: '125 kHz', frequency: '904.5 MHz', gateway: 'Gateway-South-03' },
  { id: 4, deviceName: 'Motion Detector 04', devEUI: '5D-7F-A3-8E-11-CC-DD-EE', timestamp: '2024-12-20 14:29:55', fport: 1, fcnt: 756, payload: '{"motion":true,"timestamp":1703084995}', rssi: -58, snr: 11.3, sf: 'SF7', bandwidth: '125 kHz', frequency: '902.7 MHz', gateway: 'Gateway-East-04' },
  { id: 5, deviceName: 'GPS Tracker 06', devEUI: '1A-2B-3C-4D-5E-6F-7A-8B', timestamp: '2024-12-20 14:28:33', fport: 3, fcnt: 2134, payload: '{"lat":40.7128,"lon":-74.0060,"alt":12}', rssi: -64, snr: 9.8, sf: 'SF9', bandwidth: '125 kHz', frequency: '905.2 MHz', gateway: 'Gateway-North-02' },
  { id: 6, deviceName: 'Soil Moisture 07', devEUI: '9C-8D-7E-6F-5A-4B-3C-2D', timestamp: '2024-12-20 14:27:10', fport: 1, fcnt: 4567, payload: '{"moisture":45,"temp":18.3}', rssi: -71, snr: 6.5, sf: 'SF8', bandwidth: '125 kHz', frequency: '903.8 MHz', gateway: 'Gateway-Central-01' },
  { id: 7, deviceName: 'Parking Sensor 08', devEUI: 'A1-B2-C3-D4-E5-F6-00-11', timestamp: '2024-12-20 14:26:42', fport: 2, fcnt: 1890, payload: '{"occupied":false,"distance":250}', rssi: -76, snr: 5.2, sf: 'SF9', bandwidth: '125 kHz', frequency: '904.1 MHz', gateway: 'Gateway-Airport-06' },
  { id: 8, deviceName: 'Street Light 09', devEUI: 'FF-EE-DD-CC-BB-AA-99-88', timestamp: '2024-12-20 14:25:18', fport: 1, fcnt: 3456, payload: '{"power":85,"status":"on"}', rssi: -55, snr: 12.1, sf: 'SF7', bandwidth: '125 kHz', frequency: '902.5 MHz', gateway: 'Gateway-University-09' },
  { id: 9, deviceName: 'Air Quality 11', devEUI: 'AB-CD-EF-12-34-56-78-90', timestamp: '2024-12-20 14:24:05', fport: 4, fcnt: 987, payload: '{"pm25":12,"co2":450,"voc":0.8}', rssi: -68, snr: 7.8, sf: 'SF8', bandwidth: '125 kHz', frequency: '903.5 MHz', gateway: 'Gateway-Harbor-07' },
  { id: 10, deviceName: 'Weather Station 15', devEUI: 'F0-0D-BA-BE-DE-AD-C0-DE', timestamp: '2024-12-20 14:22:47', fport: 5, fcnt: 2341, payload: '{"temp":20.1,"pressure":1013,"wind":3.5}', rssi: -59, snr: 10.5, sf: 'SF7', bandwidth: '125 kHz', frequency: '902.9 MHz', gateway: 'Gateway-East-04' },
];

export function UplinkMessages() {
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);

  const toggleSelect = (id: number) => {
    setSelectedMessages(prev => 
      prev.includes(id) ? prev.filter(msgId => msgId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMessages.length === uplinkMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(uplinkMessages.map(msg => msg.id));
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

      {/* Messages Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
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
              {uplinkMessages.map((msg) => {
                const isExpanded = expandedMessage === msg.id;
                return (
                  <>
                    <tr 
                      key={msg.id}
                      className={`border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors group ${
                        selectedMessages.includes(msg.id) ? 'bg-blue-500/10' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <button onClick={() => toggleSelect(msg.id)}>
                          {selectedMessages.includes(msg.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-sm font-medium text-white">{msg.deviceName}</div>
                          <div className="text-xs text-slate-400 font-mono">{msg.devEUI}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">{msg.timestamp}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">{msg.fport}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-300 font-mono">{msg.fcnt}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-sm font-medium ${
                          msg.rssi > -70 ? 'text-green-400' :
                          msg.rssi > -85 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {msg.rssi} dBm
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-300">{msg.snr} dB</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">{msg.sf}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setExpandedMessage(isExpanded ? null : msg.id)}
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
                      <tr key={`expanded-${msg.id}`} className="border-b border-slate-700/30 bg-slate-900/50">
                        <td colSpan={9} className="py-4 px-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-3">Message Details</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Gateway:</span>
                                  <span className="text-xs text-white">{msg.gateway}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Frequency:</span>
                                  <span className="text-xs text-white font-mono">{msg.frequency}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Bandwidth:</span>
                                  <span className="text-xs text-white font-mono">{msg.bandwidth}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Spreading Factor:</span>
                                  <span className="text-xs text-white font-mono">{msg.sf}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-3">Payload</h4>
                              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                                <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                                  {JSON.stringify(JSON.parse(msg.payload), null, 2)}
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
    </div>
  );
}
