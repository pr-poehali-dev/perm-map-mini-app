import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import Icon from '@/components/ui/icon';

const PERM_CENTER: [number, number] = [58.0105, 56.2502];

type DeliveryType = 'walking' | 'car' | 'truck';

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const Index = () => {
  const [activeType, setActiveType] = useState<DeliveryType>('walking');
  const [mapCenter] = useState<[number, number]>(PERM_CENTER);
  const [mapZoom] = useState(12);

  const deliveryButtons = [
    { type: 'walking' as DeliveryType, icon: 'PersonStanding' },
    { type: 'car' as DeliveryType, icon: 'Car' },
    { type: 'truck' as DeliveryType, icon: 'Truck' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full"
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 safe-area-bottom">
        <div className="flex gap-3 max-w-md mx-auto">
          {deliveryButtons.map((btn) => (
            <button
              key={btn.type}
              onClick={() => setActiveType(btn.type)}
              className={`flex-1 h-14 rounded-xl transition-all duration-200 flex items-center justify-center ${
                activeType === btn.type
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name={btn.icon} size={28} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;