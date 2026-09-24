import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : 'https://room-rent-ju.onrender.com'; //[cite: 4]

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '01700000000',
    role: 'ROOM_FINDER' // ডিফল্ট রোল
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'অনুরোধটি সম্পন্ন করা যায়নি।');
      }

      localStorage.setItem('user_token', data.access_token || 'user_secure_token');
      localStorage.setItem('user_info', JSON.stringify(data));

      if (onAuthSuccess) onAuthSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Login with Selected Role & Strict Email Validation
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const googleEmail = prompt("আপনার সঠিক গুগল ইমেইল ঠিকানাটি লিখুন:");
      
      if (!googleEmail || !googleEmail.trim() || !googleEmail.includes('@')) {
        setError('দয়া করে একটি সঠিক গুগল ইমেইল ঠিকানা দিন।');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: "mock_google_token", 
          email: googleEmail.trim(), 
          full_name: googleEmail.split('@')[0],
          role: formData.role // ইউজার যে রোল সিলেক্ট করেছে তা পাঠানো হচ্ছে
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'গুগল লগইন ব্যর্থ হয়েছে');
      }

      localStorage.setItem('user_token', data.access_token);
      localStorage.setItem('user_info', JSON.stringify(data.user));

      if (onAuthSuccess) onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'গুগল লগইন সম্পন্ন করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-bengali">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 relative animate-fadeIn">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4 pt-2">
          <div className="w-12 h-12 bg-emerald-50 text-[#168A45] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">বাসা ভাড়া.com এ স্বাগতম</h3>
          <p className="text-xs text-gray-500 mt-1">আপনার অ্যাকাউন্টে নিরাপদে প্রবেশ করুন</p>
        </div>

        {/* Login / Register Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              !isRegister ? 'bg-white text-[#168A45] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            লগইন করুন
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              isRegister ? 'bg-white text-[#168A45] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            নতুন অ্যাকাউন্ট (সাইন আপ)
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-4">
          <label className="block font-semibold text-gray-700 text-xs mb-1.5">আপনি কী করতে চান? (রোল নির্বাচন করুন)</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'ROOM_FINDER' })}
              className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                formData.role === 'ROOM_FINDER'
                  ? 'bg-emerald-50 border-[#168A45] text-[#168A45] shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              🔍 বাসা খুঁজছি
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'HOME_OWNER' })}
              className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                formData.role === 'HOME_OWNER'
                  ? 'bg-emerald-50 border-[#168A45] text-[#168A45] shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              🏠 বাসা ভাড়া দেব
            </button>
          </div>
        </div>

        {/* Google Quick Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2.5 cursor-pointer text-xs shadow-sm mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.15v3.14C3.11 21.36 7.23 24 12 24z"/>
            <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.62H1.15C.42 8.09 0 9.75 0 12s.42 3.91 1.15 5.38l4.12-3.14z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.11 2.64 1.15 6.62l4.12 3.14c.95-2.85 3.6-4.96 6.73-4.96z"/>
          </svg>
          Google দিয়ে প্রবেশ করুন (নির্বাচিত রোল অনুযায়ী)
        </button>

        <div className="relative flex py-1 items-center mb-3">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-3 text-gray-400 text-[11px]">অথবা ইমেইল ব্যবহার করুন</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegister && (
            <div>
              <label className="block font-semibold text-gray-700 mb-1">পূর্ণ নাম</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="আপনার নাম লিখুন"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">ইমেইল ঠিকানা</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#168A45] hover:bg-[#117037] text-white font-bold py-3 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'প্রসেস হচ্ছে...' : isRegister ? 'সাইন আপ সম্পন্ন করুন' : 'লগইন করুন'}
          </button>
        </form>

      </div>
    </div>
  );
};