import React from 'react';
import { Search, MapPin, Home, UserCheck } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative bg-gradient-to-b from-[#EAF7EF] via-[#F8FAF8] to-[#F8FAF8] py-12 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        
        <span className="inline-block bg-white border border-[#CBEED6] text-[#0B5D2A] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          🎓 জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ও সাভার এলাকার জন্য
        </span>
        
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          জাহাঙ্গীরনগরের কাছে <span className="text-[#168A45]">আপনার পছন্দের বাসা</span> খুঁজুন
        </h1>
        
        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
          ফ্ল্যাট, স্টুডেন্ট মেস ও সিঙ্গেল রুম — কোনো মাধ্যম ছাড়াই সরাসরি মালিকের সাথে কথা বলুন।
        </p>

        {/* Search Panel Box */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-gray-100 text-left mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* Area */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#168A45]" /> এলাকা
              </label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#168A45] outline-none">
                <option>সব এলাকা</option>
                <option>আমবাগান (Ambagan)</option>
                <option>ইসলামনগর (Islamnagar)</option>
                <option>গেরুয়া (Gerua)</option>
                <option>পান্ধোয়া (Pandhoa)</option>
                <option>সিএন্ডবি (C&B Gate)</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-[#168A45]" /> ক্যাটাগরি
              </label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#168A45] outline-none">
                <option>ছাত্র/ছাত্রী মেস</option>
                <option>ফ্যামিলি ফ্ল্যাট</option>
                <option>সিঙ্গেল রুম</option>
                <option>শেয়ার্ড রুম / সিট</option>
              </select>
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#168A45]" /> জেন্ডার
              </label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#168A45] outline-none">
                <option>ছাত্র (Male)</option>
                <option>ছাত্রী (Female)</option>
                <option>যেকোনো (Any)</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button className="w-full bg-[#168A45] hover:bg-[#117037] text-white font-semibold p-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm">
                <Search className="w-4 h-4" /> বাসা খুঁজুন
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};