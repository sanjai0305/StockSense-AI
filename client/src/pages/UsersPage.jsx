import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Shield, Mail, Phone, X, CheckCircle2, UserCog, Lock } from 'lucide-react';
import api from '../services/api';
import { formatDate } from '../utils/formatters';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('CASHIER');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.success) setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', { fullName, email, phone, role, password });
      setModalOpen(false);
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DCEBE1] shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold shadow-sm">
            <UserCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#14231C]">
              User Roles & Staff Access Control
            </h2>
            <p className="text-xs text-[#66756C] font-medium mt-0.5">
              Manage authorized supermarket staff, billing cashiers, inventory managers, and store owners
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white text-xs font-bold rounded-2xl shadow-emerald transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Add Staff Member
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-[#66756C]">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-7 h-7 border-2 border-[#00966B] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-medium">Loading staff access records...</span>
            </div>
          </div>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-3xl p-6 border border-[#DCEBE1] shadow-card hover:shadow-emerald transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#00966B] text-white font-black flex items-center justify-center text-lg shadow-sm">
                    {u.fullName ? u.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                      u.role === 'STORE_OWNER'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : u.role === 'MANAGER'
                        ? 'bg-[#E8F8EE] text-[#00966B] border-[#CDE9D6]'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {u.role.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-black text-[#14231C] text-base group-hover:text-[#00966B] transition-colors">{u.fullName}</h3>
                <div className="mt-3.5 space-y-2 text-xs text-[#14231C]">
                  <p className="flex items-center gap-2 text-[#66756C]">
                    <Mail className="w-4 h-4 text-[#66756C] flex-shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </p>
                  {u.phone && (
                    <p className="flex items-center gap-2 text-[#66756C]">
                      <Phone className="w-4 h-4 text-[#66756C] flex-shrink-0" />
                      <span>{u.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#DCEBE1] flex items-center justify-between text-xs text-[#66756C] font-semibold">
                <span>Joined {formatDate(u.createdAt)}</span>
                <span className="text-[#00966B] font-bold flex items-center gap-1.5 bg-[#E8F8EE] px-2.5 py-0.5 rounded-full border border-[#CDE9D6]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authorized
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#DCEBE1] animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-[#DCEBE1] flex items-center justify-between bg-[#F4FAF6]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
                  <UserCog className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-black text-[#14231C] text-base">Add Staff User</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#66756C] hover:text-[#14231C] font-bold p-1">✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-[#14231C] mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sundaram"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#14231C] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="priya@stocksense.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#14231C] mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#14231C] mb-1">Staff Role & Permissions</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                >
                  <option value="CASHIER">Cashier (Point of Sale Checkout Only)</option>
                  <option value="MANAGER">Store Manager (Inventory & Restock Purchases)</option>
                  <option value="STORE_OWNER">Store Owner (Full Administrative Access)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#14231C] mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="+91 98450 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                />
              </div>
              <div className="pt-3 border-t border-[#DCEBE1] flex justify-end gap-2.5">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-xs font-bold text-[#14231C]">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white rounded-2xl text-xs font-bold shadow-emerald transition-all">Create Staff Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
