import { useState } from 'react';
import { ArrowLeft, Send, Radio, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface EndDevice {
  _id: string;
  name: string;
  devEUI: string;
  application: string;
  brand: string;
  status: string;
  battery: number;
  rssi: number;
  lastSeen: string;
  createdAt: string;
}

interface DownlinkProps {
  selectedDevices: EndDevice[];
  onBack: () => void;
}

export function Downlink({ selectedDevices, onBack }: DownlinkProps) {
  const [fPort, setFPort] = useState<string>('1');
  const [payload, setPayload] = useState<string>('');
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSendDownlink = () => {
    // Validate inputs
    if (!fPort || parseInt(fPort) < 1 || parseInt(fPort) > 223) {
      setErrorMessage('FPort must be between 1 and 223');
      setSendStatus('error');
      return;
    }

    if (!payload || payload.trim() === '') {
      setErrorMessage('Payload cannot be empty');
      setSendStatus('error');
      return;
    }

    // Validate hex payload
    const hexRegex = /^[0-9A-Fa-f]+$/;
    if (!hexRegex.test(payload.replace(/\s/g, ''))) {
      setErrorMessage('Payload must be a valid hexadecimal string');
      setSendStatus('error');
      return;
    }

    // Simulate sending downlink
    setSendStatus('sending');
    setErrorMessage('');

    setTimeout(() => {
      setSendStatus('success');
      // Reset after 3 seconds
      setTimeout(() => {
        setSendStatus('idle');
        setPayload('');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-400" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Schedule Downlink</h2>
          <p className="text-slate-400">Send downlink messages to selected devices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Device List */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50">
              <h3 className="font-semibold text-white">Selected Devices ({selectedDevices.length})</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto themed-scrollbar">
              {selectedDevices.map((device) => (
                <div
                  key={device._id}
                  className="p-4 border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 ${
                      device.status === 'active' 
                        ? 'bg-gradient-to-br from-green-600 to-emerald-600' 
                        : 'bg-gradient-to-br from-gray-600 to-slate-600'
                    }`}>
                      <Radio className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{device.name}</div>
                      <div className="text-xs text-slate-400 font-mono truncate">{device.devEUI}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          device.status === 'active'
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            device.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                          }`}></div>
                          {device.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Downlink Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Messages */}
          {sendStatus === 'success' && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-green-400">Downlink Scheduled Successfully!</div>
                <div className="text-sm text-green-400/80">
                  Downlink has been queued for {selectedDevices.length} device{selectedDevices.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}

          {sendStatus === 'error' && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-red-400">Error</div>
                <div className="text-sm text-red-400/80">{errorMessage}</div>
              </div>
              <button
                onClick={() => setSendStatus('idle')}
                className="p-1 hover:bg-red-500/20 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          )}

          {/* Downlink Configuration */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Downlink Configuration</h3>
            
            <div className="space-y-4">
              {/* FPort */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  FPort <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="223"
                  value={fPort}
                  onChange={(e) => setFPort(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter FPort (1-223)"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Application port number (1-223). Port 0 is reserved for MAC commands.
                </p>
              </div>

              {/* Payload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Payload (Hex) <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value.toUpperCase())}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hexadecimal payload (e.g., 48656C6C6F)"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-500">
                    Enter payload as hexadecimal string (without 0x prefix)
                  </p>
                  <p className="text-xs text-slate-400">
                    {payload.replace(/\s/g, '').length / 2} bytes
                  </p>
                </div>
              </div>

              {/* Confirmed/Unconfirmed */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Transmission Mode
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="confirmed"
                      checked={!confirmed}
                      onChange={() => setConfirmed(false)}
                      className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">Unconfirmed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="confirmed"
                      checked={confirmed}
                      onChange={() => setConfirmed(true)}
                      className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">Confirmed</span>
                  </label>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {confirmed 
                    ? 'Device will send acknowledgment for this downlink' 
                    : 'Device will not send acknowledgment (recommended for most use cases)'}
                </p>
              </div>
            </div>
          </div>

          {/* Payload Examples */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Payload Examples</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-300">Turn ON Command</span>
                  <button
                    onClick={() => setPayload('01')}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Use this
                  </button>
                </div>
                <code className="text-xs text-slate-400 font-mono">01</code>
              </div>
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-300">Turn OFF Command</span>
                  <button
                    onClick={() => setPayload('00')}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Use this
                  </button>
                </div>
                <code className="text-xs text-slate-400 font-mono">00</code>
              </div>
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-300">Hello World (ASCII)</span>
                  <button
                    onClick={() => setPayload('48656C6C6F576F726C64')}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Use this
                  </button>
                </div>
                <code className="text-xs text-slate-400 font-mono">48656C6C6F576F726C64</code>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendDownlink}
            disabled={sendStatus === 'sending' || sendStatus === 'success'}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
              sendStatus === 'sending' || sendStatus === 'success'
                ? 'bg-slate-600 cursor-not-allowed text-slate-400'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30 text-white'
            }`}
          >
            {sendStatus === 'sending' ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Scheduling Downlink...
              </>
            ) : sendStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Downlink Scheduled!
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Schedule Downlink to {selectedDevices.length} Device{selectedDevices.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}