import React, { useState } from 'react';
import { X, Store, MapPin, Phone, QrCode, Sparkles, Loader2, CheckCircle, Tag } from 'lucide-react';
import { api } from '../api';

const CATEGORIES = [
  "Grocery & Daily Needs",
  "Food & Beverage / QSR",
  "Electronics & Gadgets",
  "Fashion & Apparel",
  "Pharmacy & Healthcare",
  "Bakery & Confectionery",
  "Salon & Personal Care",
  "Stationery & Books",
  "Hardware & Automobile",
  "Other Retail"
];

export default function RegisterMerchantModal({ isOpen, onClose, onMerchantRegistered }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grocery & Daily Needs',
    city: '',
    phone: '',
    upi_vpa: '',
    seed_sample_transactions: true
  });
  const [vpaManuallyEdited, setVpaManuallyEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const newName = e.target.value;
    const cleanHandle = newName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 15);
    
    setFormData(prev => ({
      ...prev,
      name: newName,
      upi_vpa: vpaManuallyEdited ? prev.upi_vpa : (cleanHandle ? `${cleanHandle}@paytm` : '')
    }));
  };

  const handleVpaChange = (e) => {
    setVpaManuallyEdited(true);
    setFormData(prev => ({ ...prev, upi_vpa: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || formData.name.length < 2) {
      setError("Please enter a valid store/business name (min 2 characters).");
      return;
    }
    if (!formData.city.trim() || formData.city.length < 2) {
      setError("Please provide the city and state.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);
      const registered = await api.registerMerchant(formData);
      onMerchantRegistered(registered);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to register merchant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Register New Merchant</h2>
              <p className="text-xs text-indigo-200">Add a business to Paytm Merchant Growth AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Store / Business Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-indigo-600" />
              Store / Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Anand Sweets & Bakers"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-xs"
            />
          </div>

          {/* Business Category */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              Business Vertical / Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer text-xs"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* City & State */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              City &amp; State *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="e.g. Pune, Maharashtra"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-xs"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              Contact Mobile Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="e.g. +91 98234 56789"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-xs"
            />
          </div>

          {/* Paytm UPI VPA */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-indigo-600" />
              Paytm UPI ID / VPA Handle
            </label>
            <input
              type="text"
              value={formData.upi_vpa}
              onChange={handleVpaChange}
              placeholder="e.g. anandsweets@paytm"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-xs"
            />
            <span className="text-[11px] text-slate-400 block">
              Auto-generated with <code>@paytm</code> handle
            </span>
          </div>

          {/* Seed Initial Transactions Option */}
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-1.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.seed_sample_transactions}
                onChange={(e) => setFormData(prev => ({ ...prev, seed_sample_transactions: e.target.checked }))}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <div>
                <span className="font-bold text-slate-900 block">Generate 60 Days of Initial Transaction Activity</span>
                <span className="text-[11px] text-slate-600 leading-normal block">
                  Instantly creates realistic transaction histories, XGBoost forecasts, customer cohorts, and AI recommendations for this store.
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-semibold rounded-full hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Register Merchant</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
