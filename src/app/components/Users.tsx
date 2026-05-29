import { Plus, Crown, Shield, Eye, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, Mail, Edit2, KeyRound, MoreVertical, UserCog, Power } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from './Modal';
import { UserForm } from './UserForm';
import { SuccessMessage } from './SuccessMessage';
import { formatDate, formatDateTime } from '@/app/utils/formatDate';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string | Date | null;
  company?: string;
  createdAt?: string;
  devicesCount?: number;
}

interface UsersProps {
  users: UserData[];
  onCreate: (data: any) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', operator: 'Operator', viewer: 'Viewer' };

export function Users({ users, onCreate, onUpdate, onDelete }: UsersProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserData | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'none' | 'asc' | 'desc'>('none');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState({ title: '', description: '' });

  const portalDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId !== null) {
        const btn = buttonRefs.current[openDropdownId];
        const portal = portalDropdownRef.current;
        const target = event.target as Node;
        if (btn?.contains(target) || portal?.contains(target)) return;
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  const showMsg = (title: string, description: string) => {
    setSuccessMsg({ title, description });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAdd = (data: any) => {
    onCreate(data);
    setShowAddModal(false);
    showMsg('User Added!', `${data.name} has been added successfully`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      onDelete(id);
      showMsg('User Deleted!', `${name} has been removed successfully`);
    }
  };

  const handleUpdateUser = (data: any) => {
    if (!editingUser) return;
    onUpdate(editingUser._id, data);
    setShowEditModal(false);
    setEditingUser(null);
    showMsg('User Updated!', `${data.name} has been updated successfully`);
  };

  const handleToggleStatus = (user: UserData) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    onUpdate(user._id, { status: newStatus });
    setOpenDropdownId(null);
    showMsg(
      `User ${newStatus === 'active' ? 'Activated' : 'Deactivated'}!`,
      `${user.name} has been ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
    );
  };

  const parseLastLogin = (lastLogin?: string | Date | null): number => {
    if (!lastLogin) return 999999;
    const d = new Date(lastLogin);
    return isNaN(d.getTime()) ? 999999 : d.getTime();
  };

  const filteredUsers = (() => {
    let list = users;
    if (filterStatus) list = list.filter(u => u.status === filterStatus);
    if (filterRole) list = list.filter(u => u.role === filterRole);
    if (searchQuery) list = list.filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortBy !== 'none') {
      list = [...list].sort((a, b) => {
        const diff = parseLastLogin(a.lastLogin) - parseLastLogin(b.lastLogin);
        return sortBy === 'asc' ? diff : -diff;
      });
    }
    return list;
  })();

  const roleColor = (role: string) => ({
    admin: 'bg-orange-500/20 text-orange-400',
    operator: 'bg-blue-500/20 text-blue-400',
    viewer: 'bg-purple-500/20 text-purple-400',
  }[role] ?? 'bg-slate-500/20 text-slate-400');

  const roleAvatar = (role: string) => ({
    admin: 'bg-gradient-to-br from-orange-600 to-red-600',
    operator: 'bg-gradient-to-br from-blue-600 to-cyan-600',
    viewer: 'bg-gradient-to-br from-purple-600 to-pink-600',
  }[role] ?? 'bg-gradient-to-br from-slate-600 to-slate-700');

  return (
    <div className="space-y-6">
      <SuccessMessage show={showSuccess} message={successMsg.title} description={successMsg.description} />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
          <p className="text-slate-400">Manage users and access control</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', count: users.length, icon: Crown, gradient: 'from-blue-600 to-cyan-600' },
          { label: 'Admins', count: users.filter(u => u.role === 'admin').length, icon: Crown, gradient: 'from-green-600 to-emerald-600' },
          { label: 'Operators', count: users.filter(u => u.role === 'operator').length, icon: Shield, gradient: 'from-purple-600 to-pink-600' },
          { label: 'Viewers', count: users.filter(u => u.role === 'viewer').length, icon: Eye, gradient: 'from-orange-600 to-red-600' },
        ].map(({ label, count, icon: Icon, gradient }) => (
          <div key={label} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl">
        <div className="p-4 border-b border-slate-700/50 flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-10 pr-4 py-2 w-72 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Filter className="w-5 h-5 text-slate-400" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="viewer">Viewer</option>
          </select>
          {(filterStatus || filterRole) && (
            <button onClick={() => { setFilterStatus(''); setFilterRole(''); }}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Clear filters
            </button>
          )}
        </div>

        <div className="overflow-x-auto themed-scrollbar">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Company</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Role</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Devices</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">
                  <button onClick={() => setSortBy(s => s === 'none' ? 'asc' : s === 'asc' ? 'desc' : 'none')}
                    className="flex items-center gap-2 hover:text-white transition-colors">
                    Last Login
                    {sortBy === 'none' && <ArrowUpDown className="w-4 h-4" />}
                    {sortBy === 'asc' && <ArrowUp className="w-4 h-4 text-blue-400" />}
                    {sortBy === 'desc' && <ArrowDown className="w-4 h-4 text-blue-400" />}
                  </button>
                </th>
                <th className="text-right py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 rounded-lg p-2 -m-2 transition-all group/user"
                      onClick={() => { setViewingUser(user); setShowDetailModal(true); }}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${roleAvatar(user.role)}`}>
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover/user:text-blue-400 transition-colors">{user.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />{user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6"><span className="text-sm text-white">{user.company || '—'}</span></td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${roleColor(user.role)}`}>
                      {user.role === 'admin' && <Crown className="w-3 h-3" />}
                      {user.role === 'operator' && <Shield className="w-3 h-3" />}
                      {user.role === 'viewer' && <Eye className="w-3 h-3" />}
                      {ROLE_LABEL[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-white font-medium">{user.devicesCount ?? 0}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-300">{formatDateTime(user.lastLogin) || 'Never'}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end">
                      <div ref={el => { dropdownRefs.current[user._id] = el; }}>
                        <button
                          ref={el => { buttonRefs.current[user._id] = el; }}
                          onClick={() => {
                            if (openDropdownId === user._id) { setOpenDropdownId(null); return; }
                            const rect = buttonRefs.current[user._id]?.getBoundingClientRect();
                            if (rect) setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                            setOpenDropdownId(user._id);
                          }}
                          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Roles & Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2"><Crown className="w-5 h-5 text-orange-400" /><h4 className="font-semibold text-white">Admin</h4></div>
            <p className="text-sm text-slate-400">Full system access and configuration</p>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2"><Shield className="w-5 h-5 text-blue-400" /><h4 className="font-semibold text-white">Operator</h4></div>
            <p className="text-sm text-slate-400">Manage devices and view analytics</p>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2"><Eye className="w-5 h-5 text-purple-400" /><h4 className="font-semibold text-white">Viewer</h4></div>
            <p className="text-sm text-slate-400">Read-only access to data</p>
          </div>
        </div>
      </div>

      {openDropdownId && createPortal(
        <div
          ref={portalDropdownRef}
          className="fixed w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-[200]"
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
        >
          {(() => {
            const user = filteredUsers.find(u => u._id === openDropdownId);
            if (!user) return null;
            return <>
              <button onClick={() => { setEditingUser(user); setShowEditModal(true); setOpenDropdownId(null); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 transition-colors text-left">
                <Edit2 className="w-4 h-4 text-blue-400" /><span className="text-sm text-white">Edit User</span>
              </button>
              <button onClick={() => { setOpenDropdownId(null); alert('Reset password functionality'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 transition-colors text-left">
                <KeyRound className="w-4 h-4 text-purple-400" /><span className="text-sm text-white">Reset Password</span>
              </button>
              <button onClick={() => handleToggleStatus(user)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 transition-colors text-left">
                <Power className="w-4 h-4 text-yellow-400" /><span className="text-sm text-white">{user.status === 'active' ? 'Deactivate' : 'Activate'}</span>
              </button>
              <button onClick={() => { setOpenDropdownId(null); alert(`Impersonating ${user.name}`); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 transition-colors text-left">
                <UserCog className="w-4 h-4 text-cyan-400" /><span className="text-sm text-white">Impersonate</span>
              </button>
              <div className="border-t border-slate-700" />
              <button onClick={() => { handleDelete(user._id, user.name); setOpenDropdownId(null); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/20 transition-colors text-left">
                <Trash2 className="w-4 h-4 text-red-400" /><span className="text-sm text-red-400">Delete User</span>
              </button>
            </>;
          })()}
        </div>,
        document.body
      )}

      <UserForm isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAdd} />
      <UserForm
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingUser(null); }}
        onSubmit={handleUpdateUser}
        editData={editingUser}
      />

      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setViewingUser(null); }}
        title={`User Details: ${viewingUser?.name}`}
        size="lg"
      >
        {viewingUser && (
          <div className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg -mt-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-xl">{viewingUser.name}</div>
                  <div className="text-blue-100 text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4" />{viewingUser.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Company</label>
                <p className="text-white mt-1 font-medium">{viewingUser.company || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Role</label>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${roleColor(viewingUser.role)}`}>
                    {viewingUser.role === 'admin' && <Crown className="w-3 h-3" />}
                    {viewingUser.role === 'operator' && <Shield className="w-3 h-3" />}
                    {viewingUser.role === 'viewer' && <Eye className="w-3 h-3" />}
                    {ROLE_LABEL[viewingUser.role] ?? viewingUser.role}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Status</label>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    viewingUser.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${viewingUser.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                    {viewingUser.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Last Login</label>
                <p className="text-white mt-1">{formatDateTime(viewingUser.lastLogin) || 'Never'}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Member Since</label>
                <p className="text-white mt-1">{formatDate(viewingUser.createdAt)}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Devices</label>
                <p className="text-white mt-1 font-medium">{viewingUser.devicesCount ?? 0}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Permissions & Access</h3>
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                {viewingUser.role === 'admin' && (<>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full" /><span className="text-sm text-white">Full system access and configuration</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full" /><span className="text-sm text-white">User management capabilities</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full" /><span className="text-sm text-white">Gateway and device configuration</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full" /><span className="text-sm text-white">Access to all analytics and reports</span></div>
                </>)}
                {viewingUser.role === 'operator' && (<>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full" /><span className="text-sm text-white">Manage assigned devices</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full" /><span className="text-sm text-white">View analytics and reports</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full" /><span className="text-sm text-white">Configure device settings</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-full" /><span className="text-sm text-slate-400">No user management access</span></div>
                </>)}
                {viewingUser.role === 'viewer' && (<>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-400 rounded-full" /><span className="text-sm text-white">Read-only access to data</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-400 rounded-full" /><span className="text-sm text-white">View device information</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-full" /><span className="text-sm text-slate-400">No configuration access</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-full" /><span className="text-sm text-slate-400">No user management access</span></div>
                </>)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
