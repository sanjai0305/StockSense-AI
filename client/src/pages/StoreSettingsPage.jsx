import React, { useState, useEffect } from 'react';
import { Settings, Store, Save, CheckCircle2, AlertCircle, Phone, MapPin, Mail, DollarSign, Building } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StoreSettingsPage = () => {
  const { store, updateStoreState } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    alternatePhone: '',
    email: '',
    currencySymbol: '₹',
    logoUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || 'Sanjai Supermarket',
        address: store.address || '',
        city: store.city || 'Salem',
        state: store.state || 'Tamil Nadu',
        phone: store.phone || '',
        alternatePhone: store.alternatePhone || '',
        email: store.email || '',
        currencySymbol: store.currencySymbol || '₹',
        logoUrl: store.logoUrl || '',
      });
    }
  }, [store]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await api.put('/store', formData);
      if (res.success) {
        updateStoreState(res.store);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update store settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#DCEBE1] shadow-card flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold shadow-sm">
            <Store className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#14231C]">Store Settings & Business Profile</h2>
            <p className="text-xs text-[#66756C] font-medium mt-0.5">Configure supermarket identity, contact numbers, and billing invoice details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-7 rounded-3xl border border-[#DCEBE1] shadow-card space-y-5">
        {success && (
          <div className="p-4 bg-[#E8F8EE] border border-[#CDE9D6] text-[#00966B] text-xs font-bold rounded-2xl flex items-center gap-2.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-[#00966B]" />
            <span>Store settings and business profile saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#14231C] mb-1">
              Supermarket Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14231C] mb-1">
              Primary Contact Number (+91) *
            </label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14231C] mb-1">
              Alternate Contact Number
            </label>
            <input
              type="text"
              value={formData.alternatePhone}
              onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14231C] mb-1">
              Store Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14231C] mb-1">
              Currency Symbol
            </label>
            <input
              type="text"
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-4 py-2.5 text-xs font-black text-[#00966B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#14231C] mb-1">
              Physical Store Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14231C] mb-1">
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14231C] mb-1">
              State *
            </label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#14231C] mb-1">
              Store Logo URL (Optional)
            </label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://..."
              className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#DCEBE1] flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white text-xs font-bold rounded-2xl shadow-emerald transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{loading ? 'Saving Settings...' : 'Save Business Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreSettingsPage;
