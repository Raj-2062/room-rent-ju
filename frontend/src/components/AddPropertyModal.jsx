import React, { useState } from 'react';
import { X, ImageIcon, Trash2, Home, MapPin, Link as LinkIcon, Building, Phone } from 'lucide-react';

export const AddPropertyModal = ({ isOpen, onClose, onPropertyAdded }) => {
  const [formData, setFormData] = useState({
    basha_type: 'টিনশেড বাসা',
    floor_level: '',
    property_type: 'STUDENT_MESS',
    accommodation_type: 'মেস',
    gender: 'BOTH',
    monthly_rent: '',
    phone: '', // বাধ্যতামূলক মোবাইল নম্বর ফিল্ড
    selected_area: '',
    google_map_link: '',
    area_id: 1,
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  if (!isOpen) return null;

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = [...imageFiles, ...files];
      setImageFiles(newFiles);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const getMapUrl = () => {
    const baseQuery = formData.selected_area 
      ? `${formData.selected_area}, Jahangirnagar University, Savar, Dhaka` 
      : `Jahangirnagar University, Savar, Dhaka`;
    return `https://maps.google.com/maps?q=${encodeURIComponent(baseQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.basha_type === 'বিল্ডিং' && !formData.floor_level) {
      alert("তলার সংখ্যা দিন।");
      return;
    }
    if (imageFiles.length === 0) {
      alert("কমপক্ষে একটি ছবি আপলোড করুন।");
      return;
    }
    if (!formData.selected_area) {
      alert("এলাকা সিলেক্ট করুন।");
      return;
    }
    if (!formData.phone) {
      alert("যোগাযোগের নম্বর দিন।");
      return;
    }

    setSubmitting(true);

    let ownerId = 1;
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        ownerId = Number(parsed.user_id || parsed.id || 1);
      } catch (err) {
        console.error("User ID parsing error:", err);
      }
    }

    let uploadedUrls = [];

    if (imageFiles.length > 0) {
      const formDataImages = new FormData();
      imageFiles.forEach((file) => {
        formDataImages.append('files', file);
      });

      try {
        const uploadRes = await fetch('http://localhost:8000/api/upload-multiple', {
          method: 'POST',
          body: formDataImages,
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          uploadedUrls = data.image_urls || [];
        }
      } catch (err) {
        console.error('Multiple images upload failed:', err);
      }
    }

    const categoryName = formData.property_type === 'STUDENT_MESS' ? 'স্টুডেন্ট মেস' : formData.property_type === 'FLAT' ? 'ফ্যামিলি ফ্ল্যাট' : 'সাবলেট';
    const finalTitle = formData.basha_type === 'বিল্ডিং'
      ? `${formData.basha_type} (${formData.floor_level} তলা) - ${categoryName}`
      : `${formData.basha_type} - ${categoryName}`;
    
    const finalDescription = formData.google_map_link.trim() 
      ? `${formData.description}\n\nম্যাপ লিংক: ${formData.google_map_link}`
      : formData.description;

    try {
      const response = await fetch('http://localhost:8000/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          description: finalDescription,
          property_type: formData.property_type,
          accommodation_type: formData.accommodation_type,
          gender: formData.gender,
          monthly_rent: parseFloat(formData.monthly_rent) || 0,
          phone: formData.phone, // পাঠানো হলো ফোন নম্বর
          advance_amount: 0,
          area_id: Number(formData.area_id) || 1,
          owner_id: ownerId,
          address: formData.selected_area,
          coverImage: uploadedUrls[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
          images: uploadedUrls
        })
      });

      if (response.ok) {
        alert('বিজ্ঞাপন সফলভাবে যোগ করা হয়েছে!');
        
        setFormData({
          basha_type: 'টিনশেড বাসা',
          floor_level: '',
          property_type: 'STUDENT_MESS',
          accommodation_type: 'মেস',
          gender: 'BOTH',
          monthly_rent: '',
          phone: '',
          selected_area: '',
          google_map_link: '',
          area_id: 1,
          description: ''
        });
        setImageFiles([]);
        setPreviews([]);

        if (onPropertyAdded) onPropertyAdded();
        onClose();
      } else {
        alert('বিজ্ঞাপন যোগ করা সম্ভব হয়নি।');
      }
    } catch (err) {
      console.error(err);
      alert('সার্ভার ত্রুটি ঘটেছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-bengali">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#168A45] text-white flex justify-between items-center shrink-0">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Home className="w-5 h-5" /> নতুন বাসা ভাড়া বিজ্ঞাপন দিন
          </h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Building className="w-4 h-4 text-[#168A45]" />
              <h4 className="font-bold text-gray-800">বাসার ধরন ও ক্যাটাগরি</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">বাসার ধরন <span className="text-red-500">*</span></label>
                <select
                  name="basha_type"
                  value={formData.basha_type}
                  onChange={(e) => setFormData({ ...formData, basha_type: e.target.value, floor_level: e.target.value === 'টিনশেড বাসা' ? '' : formData.floor_level })}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
                >
                  <option value="টিনশেড বাসা">টিনশেড বাসা</option>
                  <option value="বিল্ডিং">বিল্ডিং</option>
                </select>
              </div>

              {formData.basha_type === 'বিল্ডিং' ? (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">কত তলা? <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="floor_level"
                    required
                    placeholder="যেমন: ৩ তলা"
                    value={formData.floor_level}
                    onChange={(e) => setFormData({ ...formData, floor_level: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ক্যাটাগরি</label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
                  >
                    <option value="STUDENT_MESS">স্টুডেন্ট মেস</option>
                    <option value="FLAT">ফ্যামিলি ফ্ল্যাট</option>
                    <option value="SUBLET">সাবলেট</option>
                  </select>
                </div>
              )}
            </div>

            {formData.basha_type === 'বিল্ডিং' && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">ক্যাটাগরি</label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
                >
                  <option value="STUDENT_MESS">স্টুডেন্ট মেস</option>
                  <option value="FLAT">ফ্যামিলি ফ্ল্যাট</option>
                  <option value="SUBLET">সাবলেট</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">জেন্ডার</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
            >
              <option value="MALE">ছাত্র (Male)</option>
              <option value="FEMALE">ছাত্রী (Female)</option>
              <option value="BOTH">যেকোনো (Both)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">মাসিক ভাড়া (৳) <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="monthly_rent"
                required
                placeholder="টাকার পরিমাণ"
                value={formData.monthly_rent}
                onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#168A45]" /> যোগাযোগের মোবাইল নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                required
                placeholder="যেমন: 01700000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
              />
            </div>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-4">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-4 h-4 text-[#168A45]" />
              <h4 className="font-bold text-gray-800">লোকেশন ও ম্যাপ</h4>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">এলাকা নির্বাচন করুন <span className="text-red-500">*</span></label>
              <select
                name="selected_area"
                required
                value={formData.selected_area}
                onChange={(e) => setFormData({ ...formData, selected_area: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
              >
                <option value="" disabled>-- এলাকা নির্বাচন করুন --</option>
                <option value="আমবাগান (Ambagan)">আমবাগান (Ambagan)</option>
                <option value="ইসলামনগর (Islamnagar)">ইসলামনগর (Islamnagar)</option>
                <option value="গেরুয়া (Gerua)">গেরুয়া (Gerua)</option>
                <option value="পান্ধোয়া (Pandhoa)">পান্ধোয়া (Pandhoa)</option>
                <option value="সিএন্ডবি গেট (C&B Gate)">সিএন্ডবি গেট (C&B Gate)</option>
                <option value="রেডিও কলোনি (Radio Colony)">রেডিও কলোনি (Radio Colony)</option>
                <option value="সাভার (Savar)">সাভার (Savar)</option>
                <option value="সেনওয়ালিয়া (Senoyalia)">সেনওয়ালিয়া (Senoyalia)</option>
              </select>
            </div>

            <div className="w-full h-40 rounded-xl overflow-hidden border border-emerald-200 shadow-sm relative pointer-events-none">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={getMapUrl()}
                title="Live Google Map"
              ></iframe>
              <div className="absolute bottom-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[9px] font-bold text-emerald-700 backdrop-blur-sm">Live Location preview</div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-600" /> গুগল ম্যাপ লিংক (ঐচ্ছিক)
              </label>
              <input
                type="url"
                name="google_map_link"
                placeholder="https://maps.app.goo.gl/..."
                value={formData.google_map_link}
                onChange={(e) => setFormData({ ...formData, google_map_link: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">বিস্তারিত বিবরণ</label>
            <textarea
              name="description"
              rows="3"
              placeholder="বাসার সুবিধা ও শর্তাবলী লিখুন..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45] resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">ছবি আপলোড করুন <span className="text-red-500">*</span></label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center bg-gray-50 hover:bg-gray-100 transition">
              <label className="cursor-pointer flex flex-col items-center gap-1">
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-600 font-medium">এখান থেকে ছবি সিলেক্ট করুন</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                  className="hidden"
                />
              </label>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-gray-200">
                    <img src={src} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        কভার
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#168A45] hover:bg-[#117037] text-white font-bold py-3 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {submitting ? 'পোস্ট হচ্ছে...' : 'বিজ্ঞাপন পোস্ট করুন'}
          </button>
        </form>
      </div>
    </div>
  );
};