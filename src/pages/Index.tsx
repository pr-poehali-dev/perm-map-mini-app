import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

declare global {
  interface Window {
    ymaps: any;
  }
}

const PERM_CENTER = [58.0105, 56.2502];

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
  if (coefficient >= 2.0) return '#EC4899';
  if (coefficient >= 1.5) return '#F472B6';
  return '#FBCFE8';
};

const Index = () => {
  const [activeType, setActiveType] = useState<DeliveryType>('walking');
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const circlesRef = useRef<any[]>([]);

  useEffect(() => {
    const initMap = () => {
      if (!window.ymaps || !mapContainerRef.current || mapRef.current) return;

      window.ymaps.ready(() => {
        const map = new window.ymaps.Map(mapContainerRef.current, {
          center: PERM_CENTER,
          zoom: 12,
          controls: [],
          type: 'yandex#map',
        });

        map.setType('yandex#map');
        
        const customMapType = new window.ymaps.MapType('Custom', ['custom#layer']);
        window.ymaps.layer.storage.add('custom#layer', function () {
          return new window.ymaps.Layer('https://vec0%d.maps.yandex.net/tiles?l=map&%c&%l&scale=1&lang=ru_RU&style=gray', {
            tileTransparent: false
          });
        });
        
        map.setType('Custom');
        map.behaviors.disable('scrollZoom');

        mapRef.current = map;
      });
    };

    if (window.ymaps) {
      initMap();
    } else {
      const checkYmaps = setInterval(() => {
        if (window.ymaps) {
          clearInterval(checkYmaps);
          initMap();
        }
      }, 100);

      return () => clearInterval(checkYmaps);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.ymaps) return;

    circlesRef.current.forEach(shape => mapRef.current.geoObjects.remove(shape));
    circlesRef.current = [];

    const zones = demandZones[activeType];
    zones.forEach(zone => {
      const color = getZoneColor(zone.coefficient);
      const hexagonCoords = createHexagon(zone.position, zone.radius);
      
      const hexagon = new window.ymaps.Polygon(
        [hexagonCoords],
        {
          hintContent: `Коэффициент: ${zone.coefficient}x`,
        },
        {
          fillColor: color,
          fillOpacity: 0.35,
          strokeColor: color,
          strokeWidth: 2.5,
          strokeOpacity: 0.7,
        }
      );

      hexagon.events.add('click', () => {
        hexagon.balloon.open(zone.position, `
          <div style="font-size: 14px; padding: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
            <div style="font-weight: 600; margin-bottom: 4px; color: #1a1f2c;">Коэффициент: ${zone.coefficient}x</div>
            <div style="color: #6b7280; font-size: 12px;">Повышенный спрос</div>
          </div>
        `);
      });

      mapRef.current.geoObjects.add(hexagon);
      circlesRef.current.push(hexagon);
    });
  }, [activeType]);

  const createHexagon = (center: [number, number], radiusMeters: number): [number, number][] => {
    const earthRadius = 6371000;
    const latRad = (center[0] * Math.PI) / 180;
    
    const latOffset = (radiusMeters / earthRadius) * (180 / Math.PI);
    const lonOffset = (radiusMeters / earthRadius) * (180 / Math.PI) / Math.cos(latRad);
    
    const points: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const lat = center[0] + latOffset * Math.sin(angle);
      const lon = center[1] + lonOffset * Math.cos(angle);
      points.push([lat, lon]);
    }
    
    return points;
  };

  const deliveryButtons = [
    { type: 'walking' as DeliveryType, icon: 'PersonStanding' },
    { type: 'car' as DeliveryType, icon: 'Car' },
    { type: 'truck' as DeliveryType, icon: 'Truck' },
  ];

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ flex: 1, width: '100%', height: '100%' }} />

      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'white', 
        borderTop: '1px solid #e5e7eb', 
        padding: '16px',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', gap: '12px', maxWidth: '448px', margin: '0 auto' }}>
          {deliveryButtons.map((btn) => (
            <button
              key={btn.type}
              onClick={() => setActiveType(btn.type)}
              style={{
                flex: 1,
                height: '56px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                backgroundColor: activeType === btn.type ? '#0EA5E9' : '#f3f4f6',
                color: activeType === btn.type ? 'white' : '#6b7280',
                transform: activeType === btn.type ? 'scale(1.05)' : 'scale(1)',
                boxShadow: activeType === btn.type ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
              }}
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