import React, { useState } from 'react';
import { MessageSquare, ShieldCheck, Wifi, Phone, MapPin, X, Info, ChevronRight, ChevronLeft } from 'lucide-react';

export const PropertyCard = ({
  id,
  title,
  monthlyRent,
  areaName,
  propertyType,
  gender,
  accommodationType,
  coverImage,
  images = [],
  description,
  phone,
  isVerified,
  hasWifi,
  onOpenChat
}) => {
  const [showModal, setShowModal] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const allImages = images && images.length > 0 ? images : [coverImage];

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition font-bengali">
        {/* Image & Badges */}
        <div className="relative h-48 bg-gray-100">
          <img 
            src={coverImage || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'} 
            alt={title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {isVerified && (
              <span className="bg-[#168A45] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> ভেরিফাইড
              </span>
            )}
            {hasWifi && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Wifi className="w-3.5 h-3.5" /> ওয়াইফাই
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-xl shadow-sm">
            ৳ {monthlyRent} / মাস
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5">
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {areaName}
            </p>
            <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{title}</h3>
            
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="bg-gray-100 text-gray-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg">
                {accommodationType || propertyType}
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg">
                {gender === 'MALE' ? 'ছাত্র (Male)' : gender === 'FEMALE' ? 'ছাত্রী (Female)' : 'যেকোনো (Both)'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Info className="w-4 h-4 text-[#168A45]" /> বিস্তারিত দেখুন
            </button>
            
            {/* Owner hole onOpenChat thakbe na, tai button hide thakbe */}
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="flex-1 bg-[#168A45] hover:bg-[#117037] text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-4 h-4" /> চ্যাট করুন
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-bengali">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-[#168A45] text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-base">বাসার বিস্তারিত ও মালিকের তথ্য</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
              
              {/* Image Gallery */}
              <div className="space-y-2">
                <div className="relative h-64 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img 
                    src={allImages[activeImgIdx]} 
                    alt="Property View" 
                    className="w-full h-full object-cover"
                  />
                  {allImages.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveImgIdx((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setActiveImgIdx((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImgIdx(idx)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${activeImgIdx === idx ? 'border-[#168A45]' : 'border-transparent opacity-60'}`}
                      >
                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Rent */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-emerald-700 font-bold">{areaName}</p>
                  <h4 className="font-bold text-base text-gray-900 mt-0.5">{title}</h4>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500">মাসিক ভাড়া</p>
                  <p className="text-lg font-extrabold text-[#168A45]">৳ {monthlyRent}</p>
                </div>
              </div>

              {/* Owner Contact Information */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                <h5 className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#168A45]" /> মালিকের যোগাযোগের তথ্য
                </h5>
                <p className="text-xs text-gray-700">
                  মোবাইল নম্বর: <span className="font-bold text-gray-900 text-sm select-all">{phone || 'প্রদান করা হয়নি'}</span>
                </p>
              </div>

              {/* Property Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-500 block">ক্যাটাগরি / ধরন</span>
                  <span className="font-bold text-xs text-gray-800">{propertyType}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-500 block">জেন্ডার প্রিফারেন্স</span>
                  <span className="font-bold text-xs text-gray-800">
                    {gender === 'MALE' ? 'ছাত্র (Male)' : gender === 'FEMALE' ? 'ছাত্রী (Female)' : 'যেকোনো (Both)'}
                  </span>
                </div>
              </div>

              {/* Description */}
              {description && (
                <div className="space-y-1">
                  <h5 className="font-bold text-gray-800 text-xs">বিস্তারিত বিবরণ ও শর্তাবলী:</h5>
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-line leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              {/* Action in Modal (Chat button inside details modal hidden for owners) */}
              {onOpenChat && (
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      onOpenChat();
                    }}
                    className="w-full bg-[#168A45] hover:bg-[#117037] text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" /> মালিকের সাথে সরাসরি চ্যাট করুন
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};