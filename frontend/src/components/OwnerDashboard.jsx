import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Home, PlusCircle, AlertCircle, MessageSquare, Edit3, X } from 'lucide-react';
import { ChatModal } from './ChatModal';

export const OwnerDashboard = ({ currentUser, onOpenPostModal }) => {
  const getActiveUser = () => {
    if (currentUser) return currentUser;
    try {
      const stored = localStorage.getItem('user_info');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  };

  const activeUser = getActiveUser();
  const userId = activeUser?.user_id || activeUser?.id;

  const rawRole = activeUser?.role || activeUser?.user_role || '';
  const userRole = String(rawRole).toUpperCase();
  const isOwnerOrAdmin = userRole.includes('OWNER') || userRole === 'ADMIN';

  const [activeTab, setActiveTab] = useState(isOwnerOrAdmin ? 'properties' : 'inquiries');
  const [myProperties, setMyProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  
  // Edit Property States
  const [editingProperty, setEditingProperty] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    monthly_rent: '',
    address: '',
    property_type: 'STUDENT_MESS',
    gender: 'BOTH',
    description: ''
  });
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;

    try {
      if (isOwnerOrAdmin) {
        const propRes = await fetch(`http://localhost:8000/api/owner/properties/${userId}`);
        if (propRes.ok) {
          const propData = await propRes.json();
          setMyProperties(propData);
        }
      }

      const inqRes = await fetch(`http://localhost:8000/api/owner/inquiries/${userId}`);
      if (inqRes.ok) {
        const inqData = await inqRes.json();
        setInquiries(inqData);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, isOwnerOrAdmin]);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 2500);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [userId, fetchDashboardData]);

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("আপনি কি এই প্রপার্টি ডিলিট করতে চান?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/properties/${propertyId}`, { method: 'DELETE' });
      if (res.ok) {
        setMyProperties((prev) => prev.filter((p) => p.id !== propertyId));
      }
    } catch (err) {
      alert("প্রপার্টি ডিলিট করা যায়নি");
    }
  };

  const handleOpenEdit = (prop) => {
    setEditingProperty(prop);
    setEditForm({
      title: prop.title || '',
      monthly_rent: prop.monthly_rent || prop.monthlyRent || '',
      address: prop.address || '',
      property_type: prop.property_type || 'STUDENT_MESS',
      gender: prop.gender || 'BOTH',
      description: prop.description || ''
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingProperty) return;

    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:8000/api/properties/${editingProperty.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          monthly_rent: parseFloat(editForm.monthly_rent) || 0,
          address: editForm.address,
          property_type: editForm.property_type,
          gender: editForm.gender,
          description: editForm.description
        })
      });

      if (res.ok) {
        alert("প্রপার্টি সফলভাবে আপডেট হয়েছে!");
        setEditingProperty(null);
        fetchDashboardData();
      } else {
        alert("আপডেট করতে সমস্যা হয়েছে");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভারে সমস্যা হয়েছে");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteInquiry = async (conversationId) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ইনকোয়ারিটি ডিলিট করতে চান?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/inquiries/${conversationId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setInquiries((prev) => prev.filter((item) => item.conversation_id !== conversationId));
      } else {
        alert("ইনকোয়ারি ডিলিট করা সম্ভব হয়নি");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভারে সংযোগ স্থাপন করা যায়নি");
    }
  };

  if (!activeUser) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center font-bengali">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
        <p className="text-gray-600 font-bold">লগইন করা নেই</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-2.5 sm:px-6 py-6 font-bengali">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="w-6 h-6 text-[#168A45]" /> 
            {isOwnerOrAdmin ? 'মালিকের ড্যাশবোর্ড' : 'ব্যবহারকারী ড্যাশবোর্ড'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isOwnerOrAdmin 
              ? `আপনার প্রপার্টি ও চ্যাটসমূহ ম্যানেজ করুন (User ID: ${userId})` 
              : 'আপনার চ্যাটসমূহ ম্যানেজ করুন'}
          </p>
        </div>

        {isOwnerOrAdmin && (
          <button
            onClick={onOpenPostModal}
            className="bg-[#168A45] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#117037] transition flex items-center gap-1.5 cursor-pointer shadow-sm w-full sm:w-auto justify-center"
          >
            <PlusCircle className="w-4 h-4" /> নতুন বাসা পোস্ট করুন
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {isOwnerOrAdmin && (
          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-3 text-xs sm:text-sm font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'properties' ? 'border-[#168A45] text-[#168A45]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            আমার প্রপার্টি ({myProperties.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 text-xs sm:text-sm font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'inquiries' ? 'border-[#168A45] text-[#168A45]' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> {isOwnerOrAdmin ? 'ইনকোয়ারি ও চ্যাট' : 'চ্যাটসমূহ'} ({inquiries.length})
        </button>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="text-center py-12 text-xs text-gray-500">লোড হচ্ছে...</div>
      ) : activeTab === 'properties' && isOwnerOrAdmin ? (
        myProperties.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm w-full">
            <p className="text-xs text-gray-500">কোনো প্রপার্টি পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {myProperties.map((prop) => (
              <div key={prop.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 w-full">
                <div className="flex gap-3">
                  <img
                    src={prop.coverImage || prop.cover_image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'}
                    alt={prop.title}
                    className="w-20 h-20 object-cover rounded-xl bg-gray-100 border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 truncate">{prop.title}</h4>
                    <p className="text-xs text-emerald-600 font-medium truncate">{prop.address}</p>
                    <p className="text-xs text-[#168A45] font-bold mt-1">৳ {prop.monthly_rent || prop.monthlyRent} / মাস</p>
                  </div>
                </div>

                {/* Edit & Delete Buttons */}
                <div className="pt-2 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(prop)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-[#168A45] text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition cursor-pointer border border-emerald-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> এডিট
                  </button>
                  <button
                    onClick={() => handleDeleteProperty(prop.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition cursor-pointer border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> ডিলিট
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-3 w-full">
          {inquiries.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm w-full">
              <p className="text-xs text-gray-500">কোনো ইনকোয়ারি নেই</p>
            </div>
          ) : (
            inquiries.map((inq) => (
              <div 
                key={inq.conversation_id} 
                className="w-full bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm hover:shadow-md transition"
              >
                <div className="space-y-1.5 flex-1 min-w-0 pr-2 w-full sm:w-auto">
                  <div className="items-center gap-2 flex-wrap flex">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      inq.conversation_id?.startsWith('admin_report') 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {inq.conversation_id?.startsWith('admin_report') ? 'অ্যাডমিন রিপোর্ট' : 'প্রপার্টি চ্যাট'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 truncate">{inq.property_title || 'বাসা'}</h4>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    সর্বশেষ বার্তা: <span className="italic text-gray-700">"{inq.last_message || 'বার্তা নেই'}"</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <button
                    onClick={() => setSelectedChat(inq)}
                    className="bg-[#168A45] hover:bg-[#117037] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer flex-1 sm:flex-initial justify-center"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> চ্যাট খুলুন
                  </button>
                  <button
                    onClick={() => handleDeleteInquiry(inq.conversation_id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition cursor-pointer border border-red-200 flex items-center justify-center shrink-0"
                    title="ইনকোয়ারি ডিলিট করুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Edit Property Modal */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-bengali">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-4 bg-[#168A45] text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5" /> প্রপার্টি এডিট করুন
              </h3>
              <button onClick={() => setEditingProperty(null)} className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">শিরোনাম</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">মাসিক ভাড়া (টাকা)</label>
                  <input
                    type="number"
                    value={editForm.monthly_rent}
                    onChange={(e) => setEditForm({ ...editForm, monthly_rent: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">এরিয়া</label>
                  <select
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
                    required
                  >
                    <option value="আমবাগানের (Ambagan)">আমবাগানের (Ambagan)</option>
                    <option value="ইসলামনগর (Islamnagar)">ইসলামনগর (Islamnagar)</option>
                    <option value="গেরুয়া (Gerua)">গেরুয়া (Gerua)</option>
                    <option value="পন্ধোয়া (Pandhoa)">পন্ধোয়া (Pandhoa)</option>
                    <option value="সিএন্ডবি গেট (C&B Gate)">সিএন্ডবি গেট (C&B Gate)</option>
                    <option value="রেডিও কলোনি (Radio Colony)">রেডিও কলোনি (Radio Colony)</option>
                    <option value="সাভার (Savar)">সাভার (Savar)</option>
                    <option value="সেনালিয়া (Senoyalia)">সেনালিয়া (Senoyalia)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ধরন</label>
                  <select
                    value={editForm.property_type}
                    onChange={(e) => setEditForm({ ...editForm, property_type: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
                  >
                    <option value="STUDENT_MESS">স্টুডেন্ট মেস</option>
                    <option value="FLAT">ফ্ল্যাট</option>
                    <option value="SUBLET">সাবলেট</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">জেন্ডার</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45]"
                  >
                    <option value="MALE">পুরুষ (Male)</option>
                    <option value="FEMALE">মহিলা (Female)</option>
                    <option value="BOTH">উভয়ই (Both)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">বিস্তারিত বিবরণ</label>
                <textarea
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#168A45] resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-[#168A45] hover:bg-[#117037] text-white font-bold py-3 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {updating ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedChat && (
        <ChatModal
          isOpen={!!selectedChat}
          onClose={() => setSelectedChat(null)}
          conversationId={selectedChat.conversation_id}
          user={activeUser}
        />
      )}
    </div>
  );
};