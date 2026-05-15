import { Plus, Crown, Shield, Eye, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, Mail } from 'lucide-react';
import { useState } from 'react';
import { Modal } from './Modal';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  devices: string;
}

interface UsersProps {
  users: UserData[];
  setUsers: (users: UserData[]) => void;
}

export function Users({ users, setUsers }: UsersProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserData | null>(null);
  
  // Filter and Sort state
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'none' | 'asc' | 'desc'>('none');

  const handleAdd = (data: any) => {
    const newUser: UserData = {
      id: users.length + 1,
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'active',
      lastLogin: 'Never',
      devices: data.role === 'Admin' ? 'All' : '0',
    };

    setUsers([...users, newUser]);
    setShowAddModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleViewDetails = (user: UserData) => {
    setViewingUser(user);
    setShowDetailModal(true);
  };

  // Convert last login string to minutes for sorting
  const parseLastLogin = (lastLogin: string): number => {
    if (lastLogin.includes('Never')) return 999999;
    if (lastLogin.includes('Just now')) return 0;
    if (lastLogin.includes('min')) return parseFloat(lastLogin);
    if (lastLogin.includes('hour')) return parseFloat(lastLogin) * 60;
    if (lastLogin.includes('day')) return parseFloat(lastLogin) * 1440;
    return 0;
  };

  // Apply filters and sorting
  const getFilteredAndSortedUsers = () => {
    let filtered = users;

    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter(u => u.status === filterStatus);
    }

    // Apply role filter
    if (filterRole) {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        const aTime = parseLastLogin(a.lastLogin);
        const bTime = parseLastLogin(b.lastLogin);
        return sortBy === 'asc' ? aTime - bTime : bTime - aTime;
      });
    }

    return filtered;
  };

  const filteredUsers = getFilteredAndSortedUsers();

  const handleLastLoginSort = () => {
    if (sortBy === 'none') {
      setSortBy('asc');
    } else if (sortBy === 'asc') {
      setSortBy('desc');
    } else {
      setSortBy('none');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <div className="text-xs text-slate-400">Total Users</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'Admin').length}</div>
              <div className="text-xs text-slate-400">Admins</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'Operator').length}</div>
              <div className="text-xs text-slate-400">Operators</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'Viewer').length}</div>
              <div className="text-xs text-slate-400">Viewers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Operator">Operator</option>
              <option value="Viewer">Viewer</option>
            </select>
            {(filterStatus || filterRole) && (
              <button
                onClick={() => {
                  setFilterStatus('');
                  setFilterRole('');
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
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
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Role</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Devices</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={handleLastLoginSort}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
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
                <tr key={user.id} className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors group">
                  <td className="py-4 px-6">
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 rounded-lg p-2 -m-2 transition-all group/user"
                      onClick={() => handleViewDetails(user)}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                        user.role === 'Admin' ? 'bg-gradient-to-br from-orange-600 to-red-600' :
                        user.role === 'Operator' ? 'bg-gradient-to-br from-blue-600 to-cyan-600' :
                        'bg-gradient-to-br from-purple-600 to-pink-600'
                      }`}>
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover/user:text-blue-400 transition-colors">{user.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'Admin' ? 'bg-orange-500/20 text-orange-400' :
                      user.role === 'Operator' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {user.role === 'Admin' && <Crown className="w-3 h-3" />}
                      {user.role === 'Operator' && <Shield className="w-3 h-3" />}
                      {user.role === 'Viewer' && <Eye className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        user.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                      }`}></div>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-white font-medium">{user.devices}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-300">{user.lastLogin}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
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

      {/* Roles & Permissions */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Roles & Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-orange-400" />
              <h4 className="font-semibold text-white">Admin</h4>
            </div>
            <p className="text-sm text-slate-400">Full system access and configuration</p>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h4 className="font-semibold text-white">Operator</h4>
            </div>
            <p className="text-sm text-slate-400">Manage devices and view analytics</p>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-purple-400" />
              <h4 className="font-semibold text-white">Viewer</h4>
            </div>
            <p className="text-sm text-slate-400">Read-only access to data</p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setViewingUser(null);
        }}
        title={`User Details: ${viewingUser?.name}`}
        size="lg"
      >
        {viewingUser && (
          <div className="space-y-6">
            {/* User Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg -mt-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                  viewingUser.role === 'Admin' ? 'bg-white/20' :
                  viewingUser.role === 'Operator' ? 'bg-white/20' :
                  'bg-white/20'
                }`}>
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-xl">{viewingUser.name}</div>
                  <div className="text-blue-100 text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {viewingUser.email}
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Role</label>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                    viewingUser.role === 'Admin' ? 'bg-orange-500/20 text-orange-400' :
                    viewingUser.role === 'Operator' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {viewingUser.role === 'Admin' && <Crown className="w-3 h-3" />}
                    {viewingUser.role === 'Operator' && <Shield className="w-3 h-3" />}
                    {viewingUser.role === 'Viewer' && <Eye className="w-3 h-3" />}
                    {viewingUser.role}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Status</label>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    viewingUser.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      viewingUser.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    {viewingUser.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Last Login</label>
                <p className="text-white mt-1">{viewingUser.lastLogin}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Device Access</label>
                <p className="text-white mt-1 font-medium">{viewingUser.devices}</p>
              </div>
            </div>

            {/* Permissions Section */}
            <div className="pt-4 border-t border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Permissions & Access</h3>
              <div className="bg-slate-700/30 rounded-lg p-4">
                {viewingUser.role === 'Admin' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-white">Full system access and configuration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-white">User management capabilities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-white">Gateway and device configuration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-white">Access to all analytics and reports</span>
                    </div>
                  </div>
                )}
                {viewingUser.role === 'Operator' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-white">Manage assigned devices</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-white">View analytics and reports</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-white">Configure device settings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-sm text-slate-400">No user management access</span>
                    </div>
                  </div>
                )}
                {viewingUser.role === 'Viewer' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm text-white">Read-only access to data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm text-white">View device information</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-sm text-slate-400">No configuration access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-sm text-slate-400">No user management access</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Section */}
            <div className="pt-4 border-t border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-2 bg-slate-700/30 rounded-lg p-4">
                <div className="text-sm text-slate-400">Last login: {viewingUser.lastLogin}</div>
                <div className="text-sm text-slate-400">Account created: {new Date().toLocaleDateString()}</div>
                <div className="text-sm text-slate-400">Total devices managed: {viewingUser.devices}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}