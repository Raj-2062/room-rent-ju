import React from 'react';
import { Home, Search, PlusCircle, ShieldCheck } from 'lucide-react';

export const Navbar = ({ onOpenPostModal }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[#168A45] rounded-xl flex items-center justify-center text-white shadow-md group-hover:bg-[#117037] transition">
            <Home className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[#0B5D2A] tracking-tight">বাসা ভাড়া<span className="text-[#168A45]">.com</span></span>
            <span className="text-[10px] text-gray-500 font-medium -mt-1">জাহাঙ্গীরনগরের কাছে আপনার ঠিকানা</span>
          </div>
        </a>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#search" className="hover:text-[#168A45] transition flex items-center gap-1">
            <Search className="w-4 h-4" /> বাসা খুঁজুন
          </a>
          <a href="#safety" className="hover:text-[#168A45] transition flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> নিরাপত্তা
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2">
          <a href="#search" className="px-3.5 py-2 text-xs font-semibold text-[#0B5D2A] bg-[#EAF7EF] hover:bg-[#CBEED6] rounded-xl transition">
            বাসা খুঁজছেন?
          </a>
          <button 
            onClick={onOpenPostModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#168A45] hover:bg-[#117037] rounded-xl shadow-sm transition flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> বাসা ভাড়া দিন
          </button>
        </div>
        
      </div>
    </header>
  );
};