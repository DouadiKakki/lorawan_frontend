import { useState } from 'react';
import { CheckCircle2, XCircle, Lock } from 'lucide-react';
import { api } from '@/lib/api';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [message, setMessage] = useState('');

  const token = new URLSearchParams(window.location.search).get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { setStatus('error'); setMessage('No reset token was provided.'); return; }
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: password });
      setStatus('success');
      setMessage(res.data.message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.response?.data?.message || 'This reset link is invalid or has expired.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
        {status === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <h1 className="text-xl font-bold text-white mb-2 text-center">Set a new password</h1>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">New Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter New Password" autoComplete="new-password" required minLength={8}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium">
              Reset Password
            </button>
          </form>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Password Reset</h1>
            <p className="text-slate-300">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Reset Failed</h1>
            <p className="text-slate-300">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
