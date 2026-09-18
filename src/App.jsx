import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PropertyCard } from './components/PropertyCard';
import { AreaFilter } from './components/AreaFilter';

export default function App() {
  const [selectedArea, setSelectedArea] = useState('all');

  const sampleProperties = [
    {
      id: 1,
      areaId: 'ambagan',
      title: "আমবাগান মেইন রোডের কাছে সিঙ্গেল রুম (ওয়াইফাই সহ)",
      coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
      monthlyRent: 4500,
      areaName: "আমবাগান",
      propertyType: "STUDENT_MESS",
      gender: "MALE",
      accommodationType: "সিঙ্গেল রুম",
      isVerified: true,
      hasWifi: true
    },
    {
      id: 2,
      areaId: 'islamnagar',
      title: "ইসলামনগরে শান্ত পরিবেশে ছাত্রী মেসে আসন খালি",
      coverImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
      monthlyRent: 3200,
      areaName: "ইসলামনগর",
      propertyType: "STUDENT_MESS",
      gender: "FEMALE",
      accommodationType: "শেয়ার্ড সিট",
      isVerified: true,
      hasWifi: true
    },
    {
      id: 3,
      areaId: 'gerua',
      title: "গেরুয়া বাজার সংলগ্ন ৩ বেডরুমের ফ্যামিলি ফ্ল্যাট",
      coverImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
      monthlyRent: 14000,
      areaName: "গেরুয়া",
      propertyType: "FAMILY_FLAT",
      gender: "BOTH",
      accommodationType: "ফুল ফ্ল্যাট",
      isVerified: false,
      hasWifi: false
    }
  ];

  const filteredProperties = selectedArea === 'all'
    ? sampleProperties
    : sampleProperties.filter(item => item.areaId === selectedArea);

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col">
      <Navbar />
      <Hero />

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <AreaFilter selectedArea={selectedArea} onSelectArea={setSelectedArea} />

        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">জনপ্রিয় বাসা সমূহ</h2>
            <p className="text-xs text-gray-500">জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ের আশেপাশের যাচাইকৃত স্থান</p>
          </div>
        </div>

        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((item) => (
              <PropertyCard key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 my-4">
            <p className="text-sm font-semibold text-gray-600">এই এলাকায় মুহূর্তে কোনো বাসা পাওয়া যায়নি।</p>
            <button 
              onClick={() => setSelectedArea('all')}
              className="mt-3 text-xs font-bold text-[#168A45] hover:underline"
            >
              সব এলাকার বাসা দেখুন →
            </button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-500">
        <p>© 2026 বাসা ভাড়া.com — জাহাঙ্গীরনগর বিশ্ববিদ্যালয় সংলগ্ন আবাসন প্ল্যাটফর্ম</p>
      </footer>
    </div>
  );
}