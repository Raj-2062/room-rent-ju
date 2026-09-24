import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react_leaflet';
import L from 'leaflet';

// Fix default marker icon issue in Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// JU Campus Center Coordinates
const JU_CENTER = [23.8824, 90.2673];

export const HousingMap = ({ properties, onOpenChat }) => {
  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-6 z-0">
      <MapContainer center={JU_CENTER} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((item) => {
          const lat = item.latitude || 23.88;
          const lng = item.longitude || 90.26;
          return (
            <Marker key={item.id} position={[lat, lng]}>
              <Popup>
                <div className="text-xs p-1 font-bengali">
                  <p className="font-bold text-sm text-gray-900">{item.title}</p>
                  <p className="text-[#168A45] font-bold mt-1">৳{item.monthly_rent || item.monthlyRent}/মাস</p>
                  <button
                    onClick={() => onOpenChat(item)}
                    className="mt-2 w-full bg-[#168A45] text-white py-1 px-2 rounded-lg font-semibold text-[11px]"
                  >
                    চ্যাট করুন
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};