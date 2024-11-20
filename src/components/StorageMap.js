import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const StorageMap = ({ storageUnits }) => (
  <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '400px', width: '100%' }}>
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
    />
    {storageUnits.map((unit) => (
      <Marker key={unit.id} position={[unit.lat || 51.505, unit.lng || -0.09]}>
        <Popup>
          <strong>{unit.title}</strong>
          <br />
          {unit.description}
        </Popup>
      </Marker>
    ))}
  </MapContainer>
);

export default StorageMap;
