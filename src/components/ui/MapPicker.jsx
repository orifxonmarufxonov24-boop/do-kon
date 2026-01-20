import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icon in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            // map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ location, onChange }) {
    const defaultCenter = [41.2995, 69.2401]; // Tashkent
    const [pos, setPos] = useState(location || null);

    const handleChange = (latlng) => {
        setPos(latlng);
        onChange({ lat: latlng.lat, lng: latlng.lng });
    };

    return (
        <div className="h-64 w-full rounded-lg overflow-hidden border border-white/10 z-0 relative">
            <MapContainer center={location ? [location.lat, location.lng] : defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={pos} setPosition={handleChange} />
            </MapContainer>
        </div>
    );
}
