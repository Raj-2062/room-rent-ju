import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PropertyCard } from './components/PropertyCard';
import { AreaFilter } from './components/AreaFilter';
import { AddPropertyModal } from './components/AddPropertyModal';
import { ChatModal } from './components/ChatModal';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Safety } from './pages/Safety';
import { AdminDashboard } from './components/AdminDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { CampusMap } from './components/CampusMap';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeChatProperty, setActiveChatProperty] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser({
          ...parsed,
          user_id: parsed.user_id || parsed.id,
          role: String(parsed.role || parsed.user_role || '').toUpperCase()
        });
      } catch (e) {
        localStorage.removeItem('user_info');
      }
    }
  }, []);

  // ইউজার ওনার বা অ্যাডমিন কি না তা চেক করার জন্য
  const userRole = String(currentUser?.role || '').toUpperCase();
  const isOwnerOrAdmin = userRole.includes('OWNER') || userRole === 'ADMIN';
  const isOwner = isOwnerOrAdmin;

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    setCurrentUser(null);
    setActiveTab('home');
  };

  const handleOpenChat = (propertyOrId) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    
    let propObj = typeof propertyOrId === 'object' ? propertyOrId : null;
    let propId = propObj ? propObj.id : String(propertyOrId).replace('property_', '');

    if (!propObj) {
      propObj = properties.find(p => String(p.id) === String(propId)) || { id: propId };
    }

    const finderId = currentUser?.user_id || currentUser?.id || 1;
    
    setActiveChatProperty({
      ...propObj,
      conversation_id: `property_${propId}_finder_${finderId}`
    });
  };

  const handleOpenPostModal = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    // ফাইন্ডার বা সাধারণ ইউজার হলে বাসা পোস্ট করতে বাধা দেওয়া
    if (!isOwnerOrAdmin) {
      alert("দুঃখিত, সাধারণ ইউজার বা রুম ফাইন্ডাররা নতুন বাসা পোস্ট করতে পারবেন না। শুধুমাত্র বাড়ির মালিক বা ওনাররা পোস্ট করতে পারবেন।");
      return;
    }
    setIsModalOpen(true);
  };

  // API Fetching with Area, Category, and Gender filters
  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedArea && selectedArea !== 'all') params.append('area', selectedArea);
      if (selectedCategory && selectedCategory !== 'all') params.append('property_type', selectedCategory);
      if (selectedGender && selectedGender !== 'all') params.append('gender', selectedGender);

      const url = `http://localhost:8000/api/properties?${params.toString()}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setProperties(data);
      } else if (data && Array.isArray(data.properties)) {
        setProperties(data.properties);
      } else if (data && Array.isArray(data.data)) {
        setProperties(data.data);
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [selectedArea, selectedCategory, selectedGender]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col pb-16 md:pb-0 font-bengali">
      <Navbar 
        onOpenPostModal={handleOpenPostModal} 
        onNavigate={(tab) => setActiveTab(tab)}
        activeTab={activeTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {activeTab === 'home' && (
        <>
          <Hero 
            selectedArea={selectedArea}
            onSelectArea={setSelectedArea}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedGender={selectedGender}
            onSelectGender={setSelectedGender}
          />
          <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex-1 w-full">
            <CampusMap properties={properties} />
            <AreaFilter 
              selectedArea={selectedArea} 
              onSelectArea={setSelectedArea} 
              filters={{ area: selectedArea, property_type: selectedCategory, gender: selectedGender }}
              onFilterChange={(newFilters) => {
                if (newFilters.area !== undefined) setSelectedArea(newFilters.area);
                if (newFilters.property_type !== undefined) setSelectedCategory(newFilters.property_type);
                if (newFilters.gender !== undefined) setSelectedGender(newFilters.gender);
              }}
            />
            
            {loading ? (
              <div className="text-center py-12 text-sm text-gray-500">তথ্য লোড হচ্ছে...</div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {properties.map((item) => (
                  <PropertyCard 
                    key={item.id} 
                    id={item.id}
                    title={item.title}
                    monthlyRent={item.monthly_rent || item.monthlyRent}
                    areaName={item.address || ""}
                    propertyType={item.property_type || item.propertyType}
                    gender={item.gender}
                    accommodationType={item.accommodation_type || item.accommodationType}
                    coverImage={item.coverImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"}
                    images={item.images || []}
                    description={item.description}
                    phone={item.phone || item.owner_phone || "01700000000"} 
                    isVerified={item.status === 'APPROVED'}
                    hasWifi={true}
                    // ওনার বা অ্যাডমিন হলে চ্যাট করার ফাংশন পাস হবে না, ফলে বাটন লুকিয়ে থাকবে
                    onOpenChat={isOwner ? undefined : () => handleOpenChat(item)} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 my-4">
                <p className="text-sm font-semibold text-gray-600">কোনো বাসা পাওয়া যায়নি।</p>
              </div>
            )}
          </main>
        </>
      )}

      {activeTab === 'dashboard' && (
        <OwnerDashboard 
          currentUser={currentUser} 
          onOpenPostModal={handleOpenPostModal} 
        />
      )}

      {activeTab === 'safety' && <Safety />}

      {activeTab === 'admin' && (
        currentUser?.role === 'ADMIN' ? (
          <AdminDashboard />
        ) : (
          <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl shadow-sm text-center border border-gray-100 font-bengali">
            <h3 className="text-base font-bold text-red-600 mb-2">অনুমতি নেই!</h3>
            <p className="text-xs text-gray-500 mb-4">এই পেজটি শুধুমাত্র সিস্টেম অ্যাডমিনের জন্য।</p>
            <button 
              onClick={() => setActiveTab('home')}
              className="px-4 py-2 bg-[#168A45] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              হোম পেজে ফিরে যান
            </button>
          </div>
        )
      )}

      <AddPropertyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPropertyAdded={loadProperties}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          const normalized = {
            ...user,
            user_id: user.user_id || user.id,
            role: String(user.role || '').toUpperCase()
          };
          localStorage.setItem('user_info', JSON.stringify(normalized));
          setCurrentUser(normalized);
        }}
      />

      <ChatModal
        isOpen={!!activeChatProperty}
        onClose={() => setActiveChatProperty(null)}
        conversationId={activeChatProperty?.conversation_id || 'default_room_chat'}
        user={currentUser}
      />

      <MobileBottomNav 
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onOpenPostModal={handleOpenPostModal}
      />
    </div>
  );
}