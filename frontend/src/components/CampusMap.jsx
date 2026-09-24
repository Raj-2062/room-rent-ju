import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Default Leaflet Marker Icon in React-Leaflet
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const CampusMap = ({ properties = [] }) => {
  const juCenter = [23.8814, 90.2672];

  return (
    <div className="relative z-0 w-full h-[350px] sm:h-[400px] rounded-2xl overflow-hidden shadow-sm border border-gray-200 mb-6">
      <MapContainer center={juCenter} zoom={14} className="w-full h-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((prop) => (
          <Marker
            key={prop.id}
            position={[prop.latitude || 23.8810, prop.longitude || 90.2670]}
          >
            <Popup>
              <div className="p-1 max-w-[150px]">
                <img
                  src={prop.coverImage || 'https://via.placeholder.com/150'}
                  alt={prop.title}
                  className="w-full h-16 object-cover rounded-lg mb-1"
                />
                <h4 className="font-bold text-xs truncate">{prop.title}</h4>
                <p className="text-[#168A45] font-bold text-xs">৳ {prop.monthly_rent || prop.monthlyRent}/মাস</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};