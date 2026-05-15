import { useState } from 'react';
import { Activity, MessageSquare, MapPin, FileText, Settings, Download, Trash2 } from 'lucide-react';

interface DataMessage {
  id: string;
  time: string;
  type: string;
  data: any;
}

const mockData: DataMessage[] = [
  {
    id: '1',
    time: '17:22:30',
    type: 'Forwarded uplink data message',
    data: { DevAddr: "26 08 22 21", Payload: { commandNbr: "0x12", direction: "uplink", event: "heartbeat", frameType: 30, sensorType: 3, telemetryL: 1 } }
  },
  {
    id: '2',
    time: '17:27:14',
    type: 'Forwarded uplink data message',
    data: { DevAddr: "26 08 22 21", Payload: { commandNbr: "0x12", direction: "uplink", event: "heartbeat", frameType: 30, sensorType: 3, telemetryL: 1 } }
  },
  {
    id: '3',
    time: '17:26:13',
    type: 'Successfully processed data message',
    data: { DevAddr: "26 08 22 21" }
  },
  {
    id: '4',
    time: '17:26:13',
    type: 'Forwarded uplink data message',
    data: { DevAddr: "26 08 22 21", Payload: { commandNbr: "0x12", direction: "uplink", event: "heartbeat", frameType: 30, sensorType: 3, telemetryL: 1 } }
  },
  {
    id: '5',
    time: '17:24:36',
    type: 'Successfully processed data message',
    data: { DevAddr: "26 08 22 21" }
  },
  {
    id: '6',
    time: '17:24:36',
    type: 'Forwarded uplink data message',
    data: { DevAddr: "26 08 22 21", Payload: { commandNbr: "0x12", direction: "uplink", event: "heartbeat", frameType: 30, sensorType: 3, telemetryL: 1 } }
  },
  {
    id: '7',
    time: '17:22:46',
    type: 'Successfully processed data message',
    data: { DevAddr: "26 08 22 21" }
  },
  {
    id: '8',
    time: '17:22:46',
    type: 'Forwarded uplink data message',
    data: { DevAddr: "26 08 22 21", Payload: { commandNbr: "0x12", direction: "uplink", event: "heartbeat", frameType: 30, sensorType: 3, telemetryL: 1 } }
  },
  {
    id: '9',
    time: '17:21:02',
    type: 'Forwarded uplink data message',
    data: { DevAddr: "26 08 22 21", Payload: { commandNbr: "0x12", direction: "uplink", event: "heartbeat", frameType: 30, sensorType: 3, telemetryL: 1 } }
  },
  {
    id: '10',
    time: '17:20:02',
    type: 'Successfully processed data message',
    data: { DevAddr: "26 08 22 21" }
  },
];

export function LiveDataView() {
  const [activeTab, setActiveTab] = useState('live-data');
  const [verboseMode, setVerboseMode] = useState(false);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6">
          <div className="flex">
            <Tab
              icon={<Activity />}
              label="Device overview"
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <Tab
              icon={<Activity />}
              label="Live data"
              active={activeTab === 'live-data'}
              onClick={() => setActiveTab('live-data')}
            />
            <Tab
              icon={<MessageSquare />}
              label="Messaging"
              active={activeTab === 'messaging'}
              onClick={() => setActiveTab('messaging')}
            />
            <Tab
              icon={<MapPin />}
              label="Location"
              active={activeTab === 'location'}
              onClick={() => setActiveTab('location')}
            />
            <Tab
              icon={<FileText />}
              label="Payload formatters"
              active={activeTab === 'payload'}
              onClick={() => setActiveTab('payload')}
            />
            <Tab
              icon={<Settings />}
              label="Settings"
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={verboseMode}
              onChange={(e) => setVerboseMode(e.target.checked)}
              className="rounded border-gray-300"
            />
            Verbose mode
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
            <Download className="w-4 h-4" />
            Export as JSON
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Data table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Data Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockData.map((message) => (
              <tr key={message.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900 whitespace-nowrap">{message.time}</td>
                <td className="px-6 py-3 text-sm text-gray-900">{message.type}</td>
                <td className="px-6 py-3 text-sm font-mono text-gray-700">
                  <div className="overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(message.data, null, 2)}</pre>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        eui = v3.30.1.grs.c170681
      </div>
    </div>
  );
}

interface TabProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function Tab({ icon, label, active, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      <span className="w-4 h-4">{icon}</span>
      {label}
    </button>
  );
}
