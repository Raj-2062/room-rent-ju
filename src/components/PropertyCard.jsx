import React from 'react';
import { MapPin, ShieldCheck, Wifi, UserCheck, Heart, MessageSquare } from 'lucide-react';

export const PropertyCard = ({
  title,
  coverImage,
  monthlyRent,
  areaName,
  propertyType,
  gender,
  accommodationType,
  isVerified,
  hasWifi,
  onOpenChat
}) => {
  return (
    <div className="group relative rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Image Banner */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img 
          src={coverImage} 
          alt={title} 
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <button 
          aria-label="Save to Favorites"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:text-red-500 hover:bg-white transition"
        >
          <Heart className="w-4 h-4" />
        </button>

        {isVerified && (
          <div className="absolute top-3 left-3 bg-[#168A45]/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ভেরিফাইড বাসা</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-gray-900/70 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md">
          {propertyType === 'STUDENT_MESS' ? 'মেস / স্টুডেন্ট' : 'ফ্যামিলি ফ্ল্যাট'}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-[#168A45] transition">
            {title}
          </h3>
          <div className="flex items-center text-xs text-gray-500 mt-1 gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#168A45] flex-shrink-0" />
            <span>{areaName}, জাহাঙ্গীরনগর</span>
          </div>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-[11px] bg-[#EAF7EF] text-[#0B5D2A] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              {gender === 'MALE' ? 'ছাত্র' : gender === 'FEMALE' ? 'ছাত্রী' : 'যেকোনো'}
            </span>
            {accommodationType && (
              <span className="text-[11px] bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-md">
                {accommodationType}
              </span>
            )}
            {hasWifi && (
              <span className="text-[11px] bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                <Wifi className="w-3 h-3" /> ওয়াইফাই
              </span>
            )}
          </div>
        </div>

        {/* Actions & Rent */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-lg font-extrabold text-[#168A45]">৳{monthlyRent.toLocaleString('bn-BD')}</span>
            <span className="text-xs text-gray-400"> / মাস</span>
          </div>
          <button
            onClick={onOpenChat}
            className="px-3 py-1.5 bg-[#EAF7EF] text-[#0B5D2A] hover:bg-[#168A45] hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" /> চ্যাট করুন
          </button>
        </div>
      </div>
    </div>
  );
};