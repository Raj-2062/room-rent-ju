import React from 'react';

export const AreaFilter = ({ 
  filters = {}, 
  onFilterChange, 
  selectedArea, 
  onSelectArea 
}) => {
  // Support both object filters ({ area: 'all' }) and legacy string props ('all')
  const currentArea = selectedArea || filters?.area || 'all';

  const handleAreaChange = (areaId) => {
    if (onSelectArea) {
      onSelectArea(areaId);
    }
    if (onFilterChange) {
      onFilterChange({ ...filters, area: areaId });
    }
  };

  const areas = [
    { id: 'all', name: 'সব এলাকা' },
    { id: 'Ambagan', name: 'আমবাগান' },
    { id: 'Islamnagar', name: 'ইসলামনগর' },
    { id: 'Gerua', name: 'গেরুয়া' },
    { id: 'Pandhoa', name: 'পান্ধোয়া' },
    { id: 'C&B Gate', name: 'সিএন্ডবি গেট' },
    { id: 'Radio Colony', name: 'রেডিও কলোনি' },
    { id: 'Savar', name: 'সাভার' },
    { id: 'Senoyalia', name: 'সেনওয়ালিয়া' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4 mb-6 font-bengali">
      {/* Horizontal Area Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {areas.map((area) => (
          <button
            key={area.id}
            onClick={() => handleAreaChange(area.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              currentArea === area.id
                ? 'bg-[#168A45] text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {area.name}
          </button>
        ))}
      </div>

      {/* Filter Options */}
      {onFilterChange && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100 text-xs">
          {/* Category */}
          <div>
            <label className="text-gray-500 font-medium mb-1 block">ক্যাটাগরি</label>
            <select
              value={filters?.property_type || 'all'}
              onChange={(e) => onFilterChange({ ...filters, property_type: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 outline-none focus:ring-1 focus:ring-[#168A45]"
            >
              <option value="all">সব টাইপ</option>
              <option value="STUDENT_MESS">স্টুডেন্ট মেস</option>
              <option value="FAMILY_FLAT">ফ্যামিলি ফ্ল্যাট</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="text-gray-500 font-medium mb-1 block">জেন্ডার</label>
            <select
              value={filters?.gender || 'all'}
              onChange={(e) => onFilterChange({ ...filters, gender: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 outline-none focus:ring-1 focus:ring-[#168A45]"
            >
              <option value="all">যেকোনো</option>
              <option value="MALE">ছাত্র (Male)</option>
              <option value="FEMALE">ছাত্রী (Female)</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="text-gray-500 font-medium mb-1 block">ক্রমানুসারে</label>
            <select
              value={filters?.sort_by || 'newest'}
              onChange={(e) => onFilterChange({ ...filters, sort_by: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 outline-none focus:ring-1 focus:ring-[#168A45]"
            >
              <option value="newest">নতুনগুলো আগে</option>
              <option value="price_low">কম ভাড়া আগে</option>
              <option value="price_high">বেশি ভাড়া আগে</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <button
              onClick={() => onFilterChange({ area: 'all', property_type: 'all', gender: 'all', sort_by: 'newest' })}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold p-2 rounded-xl transition text-center cursor-pointer"
            >
              ফিল্টার রিসেট
            </button>
          </div>
        </div>
      )}
    </div>
  );
};