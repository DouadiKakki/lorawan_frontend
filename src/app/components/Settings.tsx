import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Wifi, Database, Globe, Zap, Save, Check } from 'lucide-react';

export function Settings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    networkName: 'LoRaWAN Network',
    region: 'US915',
    adr: true,
    sessionTimeout: '1',
    twoFactor: true,
    deviceOffline: true,
    gatewayErrors: true,
    lowBattery: true,
    newDevice: false,
    systemUpdates: false,
    deviceData: '30',
    gatewayLogs: '7',
    autoArchive: true,
  });

  const handleSave = () => {
    // Simulate saving
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
        <p className="text-slate-400">Configure your LoRaWAN network server</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Network Configuration</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Network Name</label>
              <input
                type="text"
                value={settings.networkName}
                onChange={(e) => setSettings({ ...settings, networkName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Region</label>
              <select
                value={settings.region}
                onChange={(e) => setSettings({ ...settings, region: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>US915</option>
                <option>EU868</option>
                <option>AS923</option>
                <option>AU915</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">ADR (Adaptive Data Rate)</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.adr}
                  onChange={(e) => setSettings({ ...settings, adr: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600"
                />
                <span className="text-sm text-slate-300">Enable ADR</span>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Security</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  defaultValue="sk_live_xxxxxxxxxxxxxxxx"
                  className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-all">
                  Regenerate
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Session Timeout</label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0.5">30 minutes</option>
                <option value="1">1 hour</option>
                <option value="4">4 hours</option>
                <option value="8">8 hours</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactor}
                  onChange={(e) => setSettings({ ...settings, twoFactor: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600"
                />
                <span className="text-sm text-slate-300">Two-Factor Authentication</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Notifications</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Device Offline</span>
              <input
                type="checkbox"
                checked={settings.deviceOffline}
                onChange={(e) => setSettings({ ...settings, deviceOffline: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Gateway Errors</span>
              <input
                type="checkbox"
                checked={settings.gatewayErrors}
                onChange={(e) => setSettings({ ...settings, gatewayErrors: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Low Battery Warning</span>
              <input
                type="checkbox"
                checked={settings.lowBattery}
                onChange={(e) => setSettings({ ...settings, lowBattery: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">New Device Registration</span>
              <input
                type="checkbox"
                checked={settings.newDevice}
                onChange={(e) => setSettings({ ...settings, newDevice: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">System Updates</span>
              <input
                type="checkbox"
                checked={settings.systemUpdates}
                onChange={(e) => setSettings({ ...settings, systemUpdates: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600"
              />
            </label>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Data Retention</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Device Data</label>
              <select
                value={settings.deviceData}
                onChange={(e) => setSettings({ ...settings, deviceData: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
                <option value="forever">Forever</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Gateway Logs</label>
              <select
                value={settings.gatewayLogs}
                onChange={(e) => setSettings({ ...settings, gatewayLogs: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoArchive}
                  onChange={(e) => setSettings({ ...settings, autoArchive: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600"
                />
                <span className="text-sm text-slate-300">Auto-archive old data</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">System Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Version</div>
            <div className="text-lg font-semibold text-white">v3.2.1</div>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Uptime</div>
            <div className="text-lg font-semibold text-white">45 days</div>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Last Updated</div>
            <div className="text-lg font-semibold text-white">Dec 15, 2024</div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all ${
            saved 
              ? 'bg-green-600' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Settings Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}