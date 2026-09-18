import React from 'react';
import { Home, Search, Heart, PlusCircle, MessageSquare } from 'lucide-react';

export const MobileBottomNav = ({ activeTab, onNavigate, onOpenPostModal, savedCount = 0 }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-1.5 px-3 flex justify-around items-center shadow-lg">
      {/* Home */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition cursor-pointer ${
          activeTab === 'home' ? 'text-[#168A45]' : 'text-gray-500'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>হোম</span>
      </button>

      {/* Search / Filter */}
      <button
        onClick={() => {
          onNavigate('home');
          window.scrollTo({ top: 350, behavior: 'smooth' });
        }}
        className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-gray-500 cursor-pointer"
      >
        <Search className="w-5 h-5" />
        <span>খুঁজুন</span>
      </button>

      {/* Post Property Floating CTA */}
      <button
        onClick={onOpenPostModal}
        className="flex flex-col items-center -mt-5 bg-[#168A45] text-white p-2.5 rounded-full shadow-lg hover:bg-[#117037] transition cursor-pointer"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      {/* Safety / Guides */}
      <button
        onClick={() => onNavigate('safety')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition cursor-pointer ${
          activeTab === 'safety' ? 'text-[#168A45]' : 'text-gray-500'
        }`}
      >
        <Heart className="w-5 h-5" />
        <span>নিরাপত্তা</span>
      </button>

      {/* Admin / Activity */}
      <button
        onClick={() => onNavigate('admin')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition cursor-pointer ${
          activeTab === 'admin' ? 'text-[#168A45]' : 'text-gray-500'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span>ড্যাশবোর্ড</span>
      </button>
    </div>
  );
};