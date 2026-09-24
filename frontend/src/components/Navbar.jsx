import React from 'react';
import { Home, LayoutDashboard, Shield, LogIn, LogOut, PlusCircle, ShieldAlert } from 'lucide-react';

export const Navbar = ({ 
  onOpenPostModal, 
  onNavigate, 
  activeTab, 
  currentUser, 
  onOpenAuthModal, 
  onLogout 
}) => {
  // User-er role check kore owner ba admin kina ta nischit kora hocche
  const rawRole = currentUser?.role || currentUser?.user_role || '';
  const userRole = String(rawRole).toUpperCase();
  const isOwnerOrAdmin = userRole.includes('OWNER') || userRole === 'ADMIN';

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 font-bengali">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-[#168A45] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            🏠
          </div>
          <div>
            <h1 className="font-extrabold text-base text-gray-900 leading-none">বাসা ভাড়া.com</h1>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">জাহাঙ্গীরনগরের কাছে আপনার ঠিকানা</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-gray-50/80 p-1 rounded-2xl border border-gray-100">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'home' ? 'bg-white text-[#168A45] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" /> বাসা খুঁজুন
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-white text-[#168A45] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> ড্যাশবোর্ড / মেসেজ
          </button>

          <button
            onClick={() => onNavigate('safety')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'safety' ? 'bg-white text-[#168A45] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> নিরাপত্তা
          </button>

          {/* Admin Tab (Only visible to ADMIN role) */}
          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin' ? 'bg-[#168A45] text-white shadow-sm' : 'bg-emerald-50 text-[#168A45] hover:bg-emerald-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> অ্যাডমিন
            </button>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#168A45]"></span>
                {currentUser.full_name || currentUser.email}
              </span>
              <button
                onClick={onLogout}
                title="লগআউট"
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" /> প্রবেশ করুন
            </button>
          )}

          {/* Shudhumatro Owner ba Admin holei 'vada din' button-ti dekhabe */}
          {isOwnerOrAdmin && (
            <button
              onClick={onOpenPostModal}
              className="bg-[#168A45] hover:bg-[#117037] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> ভাড়া দিন
            </button>
          )}
        </div>

      </div>
    </header>
  );
};