import React, { useState, useEffect, useCallback } from 'react';
import { Users, Building2, Clock, CheckCircle2, XCircle, ShieldCheck, AlertTriangle, Trash2, MessageSquare, Search } from 'lucide-react';
import { ChatModal } from './ChatModal';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_properties: 0,
    pending_properties: 0,
    approved_properties: 0
  });
  const [pendingProperties, setPendingProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'reports', 'properties', 'users'
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
  const adminId = currentUser.user_id || currentUser.id || 1;

  const fetchAdminData = useCallback(async () => {
    try {
      const statsRes = await fetch('http://localhost:8000/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const pendingRes = await fetch('http://localhost:8000/api/admin/properties/pending');
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingProperties(pendingData);
      }

      const reportRes = await fetch(`http://localhost:8000/api/owner/inquiries/${adminId}`);
      if (reportRes.ok) {
        const reportData = await reportRes.json();
        const reportOnly = reportData.filter(item => item.conversation_id.startsWith('admin_report_'));
        setReports(reportOnly);
      }

      const propRes = await fetch('http://localhost:8000/api/properties?area=all');
      if (propRes.ok) {
        const propData = await propRes.json();
        setAllProperties(propData);
      }

      const usersRes = await fetch('http://localhost:8000/api/admin/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 3000);
    return () => clearInterval(interval);
  }, [fetchAdminData]);

  const handleAction = async (propertyId, action) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/properties/${propertyId}/${action}`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      alert("অপারেশন সম্পন্ন করা সম্ভব হয়নি।");
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই বিজ্ঞাপনটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/properties/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAllProperties(prev => prev.filter(p => p.id !== id));
        fetchAdminData();
      }
    } catch (err) {
      alert("মুছে ফেলা সম্ভব হয়নি।");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই ইউজারকে মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsersList(prev => prev.filter(u => u.id !== id));
        fetchAdminData();
      }
    } catch (err) {
      alert("ইউজার ডিলিট করা সম্ভব হয়নি।");
    }
  };

  const handleDeleteReport = async (conversationId) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই রিপোর্টটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/reports/${conversationId}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.conversation_id !== conversationId));
        fetchAdminData();
      }
    } catch (err) {
      alert("রিপোর্ট মুছে ফেলা সম্ভব হয়নি।");
    }
  };

  // Filter users based on search query (email or name)
  const filteredUsers = usersList.filter(u => 
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.full_name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-bengali space-y-6">
      <div className="mb-6 flex items-center gap-2">
        <ShieldCheck className="w-8 h-8 text-[#168A45]" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">অ্যাডমিন কন্ট্রোল প্যানেল</h2>
          <p className="text-xs text-gray-500">বাসা ভাড়া.কম প্ল্যাটফর্ম পরিচালনা ও অনবোর্ডিং নিয়ন্ত্রণ</p>
        </div>
      </div>

      {/* 5 Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div onClick={() => setActiveTab('users')} className={`bg-white p-5 rounded-2xl border shadow-sm cursor-pointer transition ${activeTab === 'users' ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-100'}`}>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-2">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-500">মোট ইউজার</p>
          <h3 className="text-xl font-bold text-gray-900">{stats.total_users}</h3>
        </div>

        <div onClick={() => setActiveTab('properties')} className={`bg-white p-5 rounded-2xl border shadow-sm cursor-pointer transition ${activeTab === 'properties' ? 'border-green-500 ring-2 ring-green-50' : 'border-gray-100'}`}>
          <div className="p-3 bg-green-50 text-[#168A45] rounded-xl w-fit mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-500">মোট বাসা</p>
          <h3 className="text-xl font-bold text-gray-900">{stats.total_properties}</h3>
        </div>

        <div onClick={() => setActiveTab('pending')} className={`bg-white p-5 rounded-2xl border shadow-sm cursor-pointer transition ${activeTab === 'pending' ? 'border-amber-500 ring-2 ring-amber-50' : 'border-gray-100'}`}>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-2">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-500">অনুমোদনের অপেক্ষায়</p>
          <h3 className="text-xl font-bold text-gray-900">{pendingProperties.length}</h3>
        </div>

        <div onClick={() => setActiveTab('properties')} className={`bg-white p-5 rounded-2xl border shadow-sm cursor-pointer transition ${activeTab === 'properties' ? 'border-emerald-500 ring-2 ring-emerald-50' : 'border-gray-100'}`}>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-500">সক্রিয় পোস্ট</p>
          <h3 className="text-xl font-bold text-gray-900">{stats.approved_properties}</h3>
        </div>

        <div onClick={() => setActiveTab('reports')} className={`bg-white p-5 rounded-2xl border shadow-sm cursor-pointer transition col-span-2 md:col-span-1 ${activeTab === 'reports' ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-100'}`}>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl w-fit mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-500">ইউজার রিপোর্ট</p>
          <h3 className="text-xl font-bold text-red-600">{reports.length}</h3>
        </div>
      </div>

      {/* Dynamic Content Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <h3 className="font-bold text-base text-gray-900">
            {activeTab === 'pending' && 'অনুমোদনের জন্য অপেক্ষমাণ পোস্টসমূহ'}
            {activeTab === 'reports' && 'ইউজারদের জরুরি অভিযোগ ও রিপোর্টসমূহ'}
            {activeTab === 'properties' && 'সকল সক্রিয় বিজ্ঞাপন ব্যবস্থাপনা'}
            {activeTab === 'users' && 'প্ল্যাটফর্মের সকল রেজিস্টার্ড ইউজারের তালিকা'}
          </h3>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Search Bar for Users Tab */}
            {activeTab === 'users' && (
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type="text"
                  placeholder="ইমেইল বা নাম দিয়ে খুঁজুন..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#168A45] w-full sm:w-60"
                />
              </div>
            )}
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium shrink-0">
              {activeTab === 'pending' && `${pendingProperties.length} টি পেন্ডিং`}
              {activeTab === 'reports' && `${reports.length} টি রিপোর্ট`}
              {activeTab === 'properties' && `${allProperties.length} টি প্রপার্টি`}
              {activeTab === 'users' && `${filteredUsers.length} টি ইউজার`}
            </span>
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-gray-500 text-center py-10">তথ্য লোড হচ্ছে...</p>
        ) : activeTab === 'pending' ? (
          pendingProperties.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">অনুমোদনের জন্য নতুন কোনো পোস্ট বাকি নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] text-gray-400 uppercase">
                    <th className="py-3 px-2">বিজ্ঞাপন</th>
                    <th className="py-3 px-2">ক্যাটাগরি</th>
                    <th className="py-3 px-2">ভাড়া</th>
                    <th className="py-3 px-2 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {pendingProperties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-2 font-medium text-gray-900 max-w-xs truncate">{prop.title}</td>
                      <td className="py-3 px-2 text-gray-500">{prop.property_type}</td>
                      <td className="py-3 px-2 font-bold text-[#168A45]">৳{prop.monthly_rent || prop.monthlyRent}</td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <button onClick={() => handleAction(prop.id, 'approve')} className="bg-[#168A45] hover:bg-[#117037] text-white px-3 py-1.5 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer">
                          <CheckCircle2 className="w-3.5 h-3.5" /> অ্যাপ্রুভ
                        </button>
                        <button onClick={() => handleAction(prop.id, 'reject')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer">
                          <XCircle className="w-3.5 h-3.5" /> রিজেক্ট
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'reports' ? (
          reports.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">কোনো নতুন রিপোর্ট বা অভিযোগ পাওয়া যায়নি।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] text-gray-400 uppercase">
                    <th className="py-3 px-2">বিজ্ঞাপন / বাসা</th>
                    <th className="py-3 px-2">মালিক (Owner & Email)</th>
                    <th className="py-3 px-2">রিপোর্টার (Reporter & Email)</th>
                    <th className="py-3 px-2">সর্বশেষ অভিযোগ</th>
                    <th className="py-3 px-2 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {reports.map((rep) => (
                    <tr key={rep.conversation_id} className="hover:bg-red-50/30">
                      <td className="py-3 px-2 font-medium text-gray-900">{rep.property_title}</td>
                      <td className="py-3 px-2">
                        <div className="font-medium text-gray-900">{rep.owner_name}</div>
                        <div className="text-[11px] text-gray-500">{rep.owner_email}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-bold text-red-600">{rep.reporter_name} <span className="text-[10px] text-gray-400 font-normal">({rep.reporter_role})</span></div>
                        <div className="text-[11px] text-gray-500">{rep.reporter_email}</div>
                      </td>
                      <td className="py-3 px-2 text-gray-600 max-w-xs truncate">"{rep.last_message}"</td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <button onClick={() => setSelectedChat(rep)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl font-bold transition cursor-pointer inline-flex items-center gap-1 shadow-sm">
                          <MessageSquare className="w-3.5 h-3.5" /> চ্যাট
                        </button>
                        <button onClick={() => handleDeleteReport(rep.conversation_id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer inline-flex items-center gap-1 border border-red-200">
                          <Trash2 className="w-3.5 h-3.5" /> ডিলিট
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'properties' ? (
          allProperties.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">কোনো সক্রিয় প্রপার্টি নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] text-gray-400 uppercase">
                    <th className="py-3 px-2">টাইটেল</th>
                    <th className="py-3 px-2">ঠিকানা</th>
                    <th className="py-3 px-2">ভাড়া</th>
                    <th className="py-3 px-2">স্ট্যাটাস</th>
                    <th className="py-3 px-2 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {allProperties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-2 font-medium text-gray-900 truncate max-w-xs">{prop.title}</td>
                      <td className="py-3 px-2 text-gray-500">{prop.address}</td>
                      <td className="py-3 px-2 font-bold text-[#168A45]">৳{prop.monthly_rent || prop.monthlyRent}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prop.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {prop.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <button onClick={() => handleDeleteProperty(prop.id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer inline-flex items-center gap-1 border border-red-200">
                          <Trash2 className="w-3.5 h-3.5" /> ডিলিট
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">কোনো ইউজার পাওয়া যায়নি।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] text-gray-400 uppercase">
                    <th className="py-3 px-2">আইডি</th>
                    <th className="py-3 px-2">নাম</th>
                    <th className="py-3 px-2">ইমেইল</th>
                    <th className="py-3 px-2">ফোন</th>
                    <th className="py-3 px-2">রোল</th>
                    <th className="py-3 px-2 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-2 text-gray-500">#{u.id}</td>
                      <td className="py-3 px-2 font-medium text-gray-900">{u.full_name}</td>
                      <td className="py-3 px-2 text-gray-600">{u.email}</td>
                      <td className="py-3 px-2 text-gray-600">{u.phone}</td>
                      <td className="py-3 px-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {u.role !== 'ADMIN' && (
                          <button onClick={() => handleDeleteUser(u.id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer inline-flex items-center gap-1 border border-red-200">
                            <Trash2 className="w-3.5 h-3.5" /> ডিলিট
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {selectedChat && (
        <ChatModal
          isOpen={!!selectedChat}
          onClose={() => setSelectedChat(null)}
          conversationId={selectedChat.conversation_id}
          user={currentUser}
        />
      )}
    </div>
  );
};