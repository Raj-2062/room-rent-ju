import React from 'react';
import { MapPin } from 'lucide-react';

export const AreaFilter = ({ selectedArea, onSelectArea }) => {
  const areas = [
    { id: 'all', name: 'সব এলাকা', count: '১২+' },
    { id: 'ambagan', name: 'আমবাগান', count: '৫টি বাসা' },
    { id: 'islamnagar', name: 'ইসলামনগর', count: '৪টি বাসা' },
    { id: 'gerua', name: 'গেরুয়া', count: '৩টি বাসা' },
    { id: 'pandhoa', name: 'পান্ধোয়া', count: '২টি বাসা' },
    { id: 'cb', name: 'সিএন্ডবি গেট', count: '১টি বাসা' },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-[#168A45]" />
        <h3 className="text-sm font-bold text-gray-800">জাহাঙ্গীরনগরের আশেপাশের এলাকা</h3>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {areas.map((area) => (
          <button
            key={area.id}
            onClick={() => onSelectArea(area.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              selectedArea === area.id
                ? 'bg-[#168A45] text-white border-[#168A45] shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#168A45]'
            }`}
          >
            <span>{area.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                selectedArea === area.id ? 'bg-[#117037] text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {area.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};