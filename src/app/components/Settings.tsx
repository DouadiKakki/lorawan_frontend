import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Wifi, Database, Zap, Save, Loader2 } from 'lucide-react';
import { SuccessMessage } from './SuccessMessage';
import { AppSelect } from './ui/AppSelect';

export function Settings() {
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-600'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <SuccessMessage show={saved} message="Changes Saved!" description="Your settings have been updated successfully" />

      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
        <p className="text-slate-400">Configure your LoRaWAN network server</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Configuration */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Network Configuration</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Network Name</label>
              <input type="text" value={settings.networkName}
                onChange={(e) => setSettings({ ...settings, networkName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Region</label>
              <AppSelect
                value={settings.region}
                onValueChange={(v) => setSettings({ ...settings, region: v })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                options={[
                  { value: 'US915', label: 'US915' },
                  { value: 'EU868', label: 'EU868' },
                  { value: 'AS923', label: 'AS923' },
                  { value: 'AU915', label: 'AU915' },
                ]}
              />
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm text-white">Adaptive Data Rate (ADR)</div>
                <div className="text-xs text-slate-400">Automatically optimize data rate</div>
              </div>
              <Toggle checked={settings.adr} onChange={(v) => setSettings({ ...settings, adr: v })} />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Security</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">API Key</label>
              <div className="flex gap-2">
                <input type="password" defaultValue="sk_live_xxxxxxxxxxxxxxxx"
                  className="flex-1 px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button className="px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-white text-sm transition-all">
                  Regenerate
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Session Timeout</label>
              <AppSelect
                value={settings.sessionTimeout}
                onValueChange={(v) => setSettings({ ...settings, sessionTimeout: v })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                options={[
                  { value: '0.5', label: '30 minutes' },
                  { value: '1', label: '1 hour' },
                  { value: '4', label: '4 hours' },
                  { value: '8', label: '8 hours' },
                ]}
              />
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm text-white">Two-Factor Authentication</div>
                <div className="text-xs text-slate-400">Require 2FA on login</div>
              </div>
              <Toggle checked={settings.twoFactor} onChange={(v) => setSettings({ ...settings, twoFactor: v })} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Notifications</h3>
          </div>
          <div className="space-y-4">
            {[
              { key: 'deviceOffline', label: 'Device Offline', desc: 'Alert when a device goes offline' },
              { key: 'gatewayErrors', label: 'Gateway Errors', desc: 'Alert on gateway connectivity issues' },
              { key: 'lowBattery', label: 'Low Battery Warning', desc: 'Alert when battery drops below 20%' },
              { key: 'newDevice', label: 'New Device Registration', desc: 'Alert on new device joins' },
              { key: 'systemUpdates', label: 'System Updates', desc: 'Alert on firmware updates available' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-1">
                <div>
                  <div className="text-sm text-white">{label}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
                <Toggle
                  checked={settings[key as keyof typeof settings] as boolean}
                  onChange={(v) => setSettings({ ...settings, [key]: v })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Data Retention</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Device Data</label>
              <AppSelect
                value={settings.deviceData}
                onValueChange={(v) => setSettings({ ...settings, deviceData: v })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                options={[
                  { value: '30', label: '30 days' },
                  { value: '60', label: '60 days' },
                  { value: '90', label: '90 days' },
                  { value: '365', label: '1 year' },
                  { value: 'forever', label: 'Forever' },
                ]}
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Gateway Logs</label>
              <AppSelect
                value={settings.gatewayLogs}
                onValueChange={(v) => setSettings({ ...settings, gatewayLogs: v })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                options={[
                  { value: '7', label: '7 days' },
                  { value: '30', label: '30 days' },
                  { value: '90', label: '90 days' },
                ]}
              />
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm text-white">Auto-archive Old Data</div>
                <div className="text-xs text-slate-400">Move expired data to cold storage</div>
              </div>
              <Toggle checked={settings.autoArchive} onChange={(v) => setSettings({ ...settings, autoArchive: v })} />
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">System Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Version', value: 'v3.2.1' },
            { label: 'Uptime', value: '45 days' },
            { label: 'Last Updated', value: 'Dec 15, 2024' },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 bg-slate-700/30 rounded-lg">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>
              <div className="text-lg font-semibold text-white">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30 rounded-lg text-white font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed">
          {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : <><Save className="w-5 h-5" />Save Changes</>}
        </button>
      </div>
    </div>
  );
}
