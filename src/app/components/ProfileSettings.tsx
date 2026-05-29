import { useState, useRef, useEffect } from 'react';
import { User, Mail, Building2, Lock, Check, X, Edit2, Save, Loader2 } from 'lucide-react';
import { useProfile } from '@/lib/hooks/useProfile';
import { auth } from '@/lib/auth';
import { formatDate } from '@/app/utils/formatDate';

interface ProfileSettingsProps {
  onBack: () => void;
}

export function ProfileSettings({ onBack }: ProfileSettingsProps) {
  const { data: profile, isLoading, update, changePassword } = useProfile();
  const payload = auth.getTokenPayload();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync form state when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setEmail(profile.email ?? '');
      setCompany(profile.company ?? '');
    }
  }, [profile]);

  // Click-outside to dismiss
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) onBack();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onBack]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      setName(profile.name ?? '');
      setEmail(profile.email ?? '');
      setCompany(profile.company ?? '');
    }
  };

  const handleSaveChanges = async () => {
    await update.mutateAsync({ name, email, company });
    setIsEditing(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError('All fields are required'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match'); return; }
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters'); return; }
    await changePassword.mutateAsync({ password: newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setShowPasswordChange(false), 1500);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto themed-scrollbar">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                <p className="text-blue-100 mt-1">Manage your account information</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                    {!isEditing && (
                      <button
                        onClick={handleEditProfile}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-400 flex items-center gap-2">
                        <User className="w-4 h-4" />Full Name
                      </label>
                      {isEditing ? (
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      ) : (
                        <div className="bg-slate-700/50 rounded-lg px-4 py-3 text-white">{profile?.name}</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400 flex items-center gap-2">
                        <Mail className="w-4 h-4" />Email Address
                      </label>
                      {isEditing ? (
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      ) : (
                        <div className="bg-slate-700/50 rounded-lg px-4 py-3 text-white">{profile?.email}</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />Company
                      </label>
                      {isEditing ? (
                        <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      ) : (
                        <div className="bg-slate-700/50 rounded-lg px-4 py-3 text-white">{profile?.company || '—'}</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400 flex items-center gap-2">
                        <User className="w-4 h-4" />Role
                      </label>
                      <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed capitalize">
                        {payload?.role ?? profile?.role}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400 flex items-center gap-2">
                        <User className="w-4 h-4" />Status
                      </label>
                      <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed capitalize">
                        {profile?.status}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400 flex items-center gap-2">
                        <User className="w-4 h-4" />Member Since
                      </label>
                      <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed">
                        {profile?.createdAt ? formatDate(profile.createdAt) : '—'}
                      </div>
                    </div>
                  </div>

                  {update.isError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm mt-4">
                      <X className="w-4 h-4" />Failed to save changes
                    </div>
                  )}
                  {update.isSuccess && !isEditing && (
                    <div className="flex items-center gap-2 text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3 mt-4">
                      <Check className="w-5 h-5" />Profile updated successfully!
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSaveChanges}
                        disabled={update.isPending}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                      >
                        {update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                      </button>
                      <button onClick={handleCancelEdit} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-700/50 pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Lock className="w-5 h-5" />Security
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">Update your password</p>
                    </div>
                    {!showPasswordChange && (
                      <button onClick={() => setShowPasswordChange(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Change Password
                      </button>
                    )}
                  </div>

                  {showPasswordChange && (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-400">Current Password</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter current password" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-400">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter new password" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-400">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Confirm new password" />
                      </div>

                      {passwordError && (
                        <div className="flex items-center gap-2 text-red-400 text-sm"><X className="w-4 h-4" />{passwordError}</div>
                      )}
                      {changePassword.isError && (
                        <div className="flex items-center gap-2 text-red-400 text-sm"><X className="w-4 h-4" />Failed to change password</div>
                      )}
                      {changePassword.isSuccess && (
                        <div className="flex items-center gap-2 text-green-400 text-sm"><Check className="w-4 h-4" />Password changed successfully!</div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={changePassword.isPending}
                          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors">
                          {changePassword.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                          Update Password
                        </button>
                        <button type="button"
                          onClick={() => { setShowPasswordChange(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); }}
                          className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
