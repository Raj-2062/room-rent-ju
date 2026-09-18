import React, { useState } from 'react';
import { X, Building, DollarSign, MapPin, CheckCircle, Upload, ArrowRight, ArrowLeft } from 'lucide-react';

export const AddPropertyModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    propertyType: 'STUDENT_MESS',
    gender: 'MALE',
    accommodationType: 'Single Room',
    areaName: 'Ambagan',
    address: '',
    monthlyRent: '',
    advanceAmount: '',
    description: '',
    hasWifi: false,
    hasAttachedBath: false,
    hasKitchen: false,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('বিজ্ঞাপনটি পর্যালোচনার জন্য জমা দেওয়া হয়েছে! (Pending Admin Approval)');
    onClose();
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#168A45] text-white flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold">বাসার বিজ্ঞাপন দিন</h2>
            <p className="text-xs text-green-100">ধাপ {step} / ৩ — {step === 1 ? 'মৌলিক তথ্য' : step === 2 ? 'ভাড়া ও সুবিধা' : 'ছবি ও অবস্থান'}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* STEP 1: Basic & Category Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">বিজ্ঞাপনের শিরোনাম *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="যেমন: আমবাগান সংলগ্ন সুসজ্জিত সিঙ্গেল রুম"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#168A45] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ক্যাটাগরি *</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#168A45] outline-none"
                  >
                    <option value="STUDENT_MESS">ছাত্র/ছাত্রী মেস</option>
                    <option value="FAMILY_FLAT">ফ্যামিলি ফ্ল্যাট</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">জেন্ডার *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#168A45] outline-none"
                  >
                    <option value="MALE">ছাত্র (Male)</option>
                    <option value="FEMALE">ছাত্রী (Female)</option>
                    <option value="BOTH">উভয় (Both)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">থাকার ব্যবস্থা</label>
                <input
                  type="text"
                  name="accommodationType"
                  placeholder="যেমন: সিঙ্গেল রুম / শেয়ার্ড সিট / ৩ বেড ফ্ল্যাট"
                  value={formData.accommodationType}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#168A45] outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Pricing & Facilities */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">মাসিক ভাড়া (৳) *</label>
                  <input
                    type="number"
                    name="monthlyRent"
                    required
                    placeholder="৪৫০০"
                    value={formData.monthlyRent}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#168A45] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">অগ্রিম / জামানত (৳)</label>
                  <input
                    type="number"
                    name="advanceAmount"
                    placeholder="৫০০০"
                    value={formData.advanceAmount}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#168A45] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">সুবিধাসমূহ</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-gray-50 border rounded-xl cursor-pointer">
                    <input type="checkbox" name="hasWifi" checked={formData.hasWifi} onChange={handleChange} className="accent-[#168A45]" />
                    <span>ওয়াইফাই (Wi-Fi)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-gray-50 border rounded-xl cursor-pointer">
                    <input type="checkbox" name="hasAttachedBath" checked={formData.hasAttachedBath} onChange={handleChange} className="accent-[#168A45]" />
                    <span>অ্যাটাচড বাথ</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-gray-50 border rounded-xl cursor-pointer">
                    <input type="checkbox" name="hasKitchen" checked={formData.hasKitchen} onChange={handleChange} className="accent-[#168A45]" />
                    <span>রান্নাঘরের সুযোগ</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">বিস্তারিত বিবরণ</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="বাসা সংক্রান্ত অতিরিক্ত নিয়মকানুন বা বিবরণ লিখুন..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#168A45] outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Location & Image Upload */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">জাহাঙ্গীরনগরের সংলগ্ন এলাকা *</label>
                <select
                  name="areaName"
                  value={formData.areaName}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#168A45] outline-none"
                >
                  <option value="Ambagan">আমবাগান (Ambagan)</option>
                  <option value="Islamnagar">ইসলামনগর (Islamnagar)</option>
                  <option value="Gerua">গেরুয়া (Gerua)</option>
                  <option value="Pandhoa">পান্ধোয়া (Pandhoa)</option>
                  <option value="CB Gate">সিএন্ডবি গেট (C&B Gate)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">বিস্তারিত ঠিকানা</label>
                <input
                  type="text"
                  name="address"
                  placeholder="রোড নম্বর, বাসা নম্বর বা পরিচিত স্থান"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#168A45] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">বাসার ছবি যোগ করুন</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 font-medium">ছবি আপলোড করতে ক্লিক করুন অথবা ড্র্যাগ করুন</p>
                  <span className="text-[10px] text-gray-400">(সর্বোচ্চ ৫টি ছবি, PNG/JPG)</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> পেছনে
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#168A45] hover:bg-[#117037] rounded-xl flex items-center gap-1 shadow-sm"
              >
                পরবর্তী <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#168A45] hover:bg-[#117037] rounded-xl flex items-center gap-1 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" /> বিজ্ঞাপন জমা দিন
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};