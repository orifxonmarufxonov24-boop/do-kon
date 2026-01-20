import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaShareAlt, FaCopy, FaTelegramPlane } from 'react-icons/fa';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapDisplay({ location, address }) {
    const [showShare, setShowShare] = useState(false);

    if (!location || !location.lat) return null;
    const center = [location.lat, location.lng];

    const shareLink = `https://yandex.com/maps/?pt=${location.lng},${location.lat}&z=15&l=map`;
    const tgLink = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent("Bizning manzil: " + (address || ""))}`;

    const copyAddress = () => {
        navigator.clipboard.writeText(address ? `${address} (${shareLink})` : shareLink);
        alert("Manzil nusxalandi!");
        setShowShare(false);
    };

    return (
        <div className="h-full w-full z-0 relative">
            <MapContainer center={center} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center}>
                    {address && <Popup>{address}</Popup>}
                </Marker>
            </MapContainer>

            {/* Share Controls */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
                <button
                    onClick={() => setShowShare(!showShare)}
                    className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    title="Ulashish"
                >
                    <FaShareAlt />
                </button>

                {showShare && (
                    <div className="bg-white rounded-lg shadow-xl p-2 flex flex-col gap-1 min-w-[200px]">
                        <button onClick={copyAddress} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm whitespace-nowrap text-left text-gray-800">
                            <FaCopy className="text-gray-500" /> Nusxa olish
                        </button>
                        <a href={tgLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm text-blue-600 whitespace-nowrap text-left">
                            <FaTelegramPlane /> Telegramda ulashish
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
