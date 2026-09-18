import React, { useState } from 'react';
import { Users, Home, CheckCircle, XCircle, AlertOctagon, TrendingUp } from 'lucide-react';

export const AdminDashboard = () => {
  const [pendingProperties, setPendingProperties] = useState([
    {
      id: 101,
      title: "ইসলামনগরে ৩ বেডরুমের ফ্যামিলি ফ্ল্যাট",
      owner: "কামরুল ইসলাম",
      area: "Islamnagar",
      price: "৳১২,০০০",
      date: "১৮ সেপ্টেম্বর, ২০২৬"
    },
    {
      id: 102,
      title: "আমবাগান মোড়ে ছাত্র মেস — ২ সিট খালি",
      owner: "আরিফ রহমান",
      area: "Ambagan",
      price: "৳৩,৫০০",
      date: "১৮ সেপ্টেম্বর, ২০২৬"
    }
  ]);

  const handleApprove = (id) => {
    setPendingProperties(prev => prev.filter(p => p.id !== id));
    alert('বিজ্ঞাপনটি অনুমোদন করা হয়েছে!');
  };

  const handleReject = (id) => {
    setPendingProperties(prev => prev.filter(p => p.id !== id));
    alert('বিজ্ঞাপনটি বাতিল করা হয়েছে!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">মোট ইউজার</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">১,২৪০</h3>
          </div>
          <div className="p-3 bg-[#EAF7EF] text-[#168A45] rounded-xl"><Users className="w-6 h-6" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">মোট সম্পত্তি</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">৩৮৫</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Home className="w-6 h-6" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">অপেক্ষমাণ অনুমোদন</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingProperties.length}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">রিপোর্টকৃত বিজ্ঞাপন</p>
            <h3 className="text-2xl font-black text-red-600 mt-1">৩</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertOctagon className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">অনুমোদনের জন্য অপেক্ষমাণ বিজ্ঞাপন</h2>
        
        {pendingProperties.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {pendingProperties.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">মালিক: {item.owner} • এলাকা: {item.area} • ভাড়া: {item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-3 py-1.5 bg-[#168A45] hover:bg-[#117037] text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> অনুমোদন করুন
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-xl flex items-center gap-1 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" /> বাতিল করুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-4 text-center">কোনো অপেক্ষমাণ বিজ্ঞাপন নেই।</p>
        )}
      </div>
    </div>
  );
};