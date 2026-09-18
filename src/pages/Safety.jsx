import React from 'react';
import { ShieldCheck, AlertTriangle, Eye, CreditCard, UserCheck, PhoneCall } from 'lucide-react';

export const Safety = () => {
  const safetyTips = [
    {
      icon: <CreditCard className="w-6 h-6 text-red-500" />,
      title: "অগ্রিম টাকা পাঠানোর আগে সতর্কতা",
      desc: "বাসা সরাসরি না দেখে অথবা চুক্তিপত্র না করে কখনোই বিকাশ, নগদ বা ব্যাংকে অগ্রিম বুকিং মানি পাঠাবেন না।"
    },
    {
      icon: <Eye className="w-6 h-6 text-[#168A45]" />,
      title: "সরেজমিনে বাসা পরিদর্শন করুন",
      desc: "অবশ্যই বাসা, ঘরের আলো-বাতাস, পানির ব্যবস্থা, গ্যাস ও ওয়াইফাই সুযোগ-সুবিধা নিজের চোখে দেখে নিন।"
    },
    {
      icon: <UserCheck className="w-6 h-6 text-[#168A45]" />,
      title: "মালিকের পরিচয় যাচাইকরণ",
      desc: "প্রয়োজনে বাসা মালিকের জাতীয় পরিচয়পত্র (NID) ও যোগাযোগের নম্বর সংগৃহীত রাখুন।"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      title: "সন্দেহজনক বিজ্ঞাপন রিপোর্ট করুন",
      desc: "ভুল তথ্য বা ভুয়া ভাড়ার বিবরণ দেখলে সাথে সাথেই বিজ্ঞাপনের 'Report' বোতামে ক্লিক করুন।"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center space-y-3 mb-10">
        <span className="bg-[#EAF7EF] text-[#0B5D2A] text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-[#168A45]" /> বাসা ভাড়া ট্রাস্ট ও নিরাপত্তা guide
        </span>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900">নিরাপদে বাসা ভাড়া নিন</h1>
        <p className="text-gray-600 text-sm max-w-xl mx-auto">
          জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ের শিক্ষার্থীদের নিরাপদে বাসা খুঁজে পেতে আমাদের বিশেষ দিকনির্দেশনা।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {safetyTips.map((tip, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl w-fit">{tip.icon}</div>
            <h3 className="font-bold text-base text-gray-900">{tip.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};