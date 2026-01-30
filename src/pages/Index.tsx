import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Icon from '@/components/ui/icon';

const PERM_CENTER: [number, number] = [58.0105, 56.2502];

type DeliveryType = 'walking' | 'car' | 'truck';

interface DemandZone {
  id: number;
  position: [number, number];
  coefficient: number;
  radius: number;
}

const demandZones: Record<DeliveryType, DemandZone[]> = {
  walking: [
    { id: 1, position: [58.0105, 56.2502], coefficient: 1.5, radius: 800 },
    { id: 2, position: [58.0205, 56.2702], coefficient: 2.0, radius: 600 },
    { id: 3, position: [57.9905, 56.2302], coefficient: 1.8, radius: 700 },
  ],
  car: [
    { id: 1, position: [58.0305, 56.2602], coefficient: 1.6, radius: 1200 },
    { id: 2, position: [57.9805, 56.2202], coefficient: 2.2, radius: 1000 },
    { id: 3, position: [58.0005, 56.2902], coefficient: 1.4, radius: 900 },
  ],
  truck: [
    { id: 1, position: [58.0405, 56.2402], coefficient: 1.9, radius: 1500 },
    { id: 2, position: [57.9705, 56.2702], coefficient: 2.5, radius: 1300 },
    { id: 3, position: [58.0105, 56.2102], coefficient: 1.7, radius: 1100 },
  ],
};

const getZoneColor = (coefficient: number): string => {
  if (coefficient >= 2.0) return '#8B5CF6';
  if (coefficient >= 1.5) return '#A78BFA';
  return '#C4B5FD';
};

const Index = () => {
  const [activeType, setActiveType] = useState<DeliveryType>('walking');
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const circlesRef = useRef<L.Circle[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(PERM_CENTER, 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    circlesRef.current.forEach(circle => circle.remove());
    circlesRef.current = [];

    const zones = demandZones[activeType];
    zones.forEach(zone => {
      const color = getZoneColor(zone.coefficient);
      const circle = L.circle(zone.position, {
        color: color,
        fillColor: color,
        fillOpacity: 0.3,
        weight: 2,
        radius: zone.radius,
      }).addTo(mapRef.current!);

      circle.bindPopup(`
        <div style="font-size: 14px;">
          <div style="font-weight: 600; margin-bottom: 4px;">Коэффициент: ${zone.coefficient}x</div>
          <div style="color: #888;">Повышенный спрос</div>
        </div>
      `);

      circlesRef.current.push(circle);
    });
  }, [activeType]);

  const deliveryButtons = [
    { type: 'walking' as DeliveryType, icon: 'PersonStanding' },
    { type: 'car' as DeliveryType, icon: 'Car' },
    { type: 'truck' as DeliveryType, icon: 'Truck' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <div ref={mapContainerRef} className="flex-1 w-full" />

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