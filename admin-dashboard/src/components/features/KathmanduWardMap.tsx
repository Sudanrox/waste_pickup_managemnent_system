/**
 * Kathmandu Ward Map Component
 * Interactive Leaflet map showing all 32 wards of Kathmandu Metropolitan City
 * with markers colored by response rate and sized by customer count.
 */
import { useMemo, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Bell, Users, TrendingUp } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Approximate center coordinates for each of the 32 wards
const WARD_COORDINATES: Record<number, [number, number]> = {
  1: [27.7776, 85.3613],   // Budhanilkantha
  2: [27.7339, 85.2711],   // Nagarjun
  3: [27.7142, 85.2736],   // Tarakeshwar
  4: [27.6760, 85.2487],   // Chandragiri
  5: [27.6083, 85.2672],   // Dakshinkali
  6: [27.6781, 85.2786],   // Kirtipur
  7: [27.7588, 85.4194],   // Shankharapur
  8: [27.7471, 85.3389],   // Tokha
  9: [27.7378, 85.3769],   // Gokarneshwar
  10: [27.7009, 85.3686],  // Kageshwari-Manohara
  11: [27.7234, 85.2958],  // Tarkeshwar
  12: [27.7284, 85.3509],  // Kapan
  13: [27.6866, 85.3378],  // Baneshwor
  14: [27.6922, 85.3283],  // Shantinagar
  15: [27.7107, 85.3446],  // Gaushala
  16: [27.7068, 85.3354],  // Battisputali
  17: [27.6783, 85.3479],  // Koteshwor
  18: [27.6870, 85.3489],  // Tinkune
  19: [27.6901, 85.3443],  // New Baneshwor
  20: [27.6896, 85.3382],  // Minbhawan
  21: [27.7219, 85.3314],  // Baluwatar
  22: [27.7292, 85.3206],  // Maharajgunj
  23: [27.7375, 85.3224],  // Basundhara
  24: [27.7263, 85.3093],  // Samakhusi
  25: [27.7302, 85.3110],  // Gongabu
  26: [27.7103, 85.2887],  // Swayambhu
  27: [27.6965, 85.3018],  // Kalimati
  28: [27.6936, 85.2845],  // Kalanki
  29: [27.6944, 85.2944],  // Kuleshwor
  30: [27.6810, 85.2980],  // Balkhu
  31: [27.6590, 85.3210],  // Satdobato
  32: [27.6680, 85.3225],  // Lagankhel
};

// Kathmandu center
const KTM_CENTER: [number, number] = [27.7100, 85.3240];
const DEFAULT_ZOOM = 12;

interface WardData {
  wardNumber: number;
  name: string;
  nameNe: string;
  customerCount: number;
  responseRate?: number;
  isActive: boolean;
  lastPickupDate?: string | null;
}

interface KathmanduWardMapProps {
  wards: WardData[];
  selectedWard?: number | null;
  onWardSelect?: (wardNumber: number) => void;
}

/**
 * Returns a color based on response rate (green = high, red = low)
 */
function getResponseColor(rate: number, isActive: boolean): string {
  if (!isActive) return '#9ca3af'; // gray for inactive
  if (rate >= 80) return '#22c55e'; // green
  if (rate >= 60) return '#84cc16'; // lime
  if (rate >= 40) return '#eab308'; // yellow
  if (rate >= 20) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * Returns marker radius based on customer count (min 6, max 18)
 */
function getMarkerRadius(customerCount: number): number {
  return Math.max(6, Math.min(18, 6 + (customerCount / 100)));
}

/**
 * Sub-component to fly to a selected ward.
 * Uses useEffect + ref to only fly when the wardNumber actually changes.
 */
function FlyToWard({ wardNumber }: { wardNumber: number | null }) {
  const map = useMap();
  const prevWard = useRef<number | null>(null);

  useEffect(() => {
    if (wardNumber && wardNumber !== prevWard.current && WARD_COORDINATES[wardNumber]) {
      map.flyTo(WARD_COORDINATES[wardNumber], 14, { duration: 0.8 });
    } else if (!wardNumber && prevWard.current) {
      map.flyTo(KTM_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
    }
    prevWard.current = wardNumber;
  }, [wardNumber, map]);

  return null;
}

export default function KathmanduWardMap({
  wards,
  selectedWard = null,
  onWardSelect,
}: KathmanduWardMapProps) {
  const [hoveredWard, setHoveredWard] = useState<number | null>(null);
  const navigate = useNavigate();

  const wardMap = useMemo(() => {
    const map = new Map<number, WardData>();
    wards.forEach((w) => map.set(w.wardNumber, w));
    return map;
  }, [wards]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={KTM_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectedWard && <FlyToWard wardNumber={selectedWard} />}

        {Object.entries(WARD_COORDINATES).map(([wardNumStr, coords]) => {
          const wardNum = parseInt(wardNumStr);
          const ward = wardMap.get(wardNum);
          if (!ward) return null;

          const rate = ward.responseRate ?? 0;
          const color = getResponseColor(rate, ward.isActive);
          const radius = getMarkerRadius(ward.customerCount);
          const isSelected = selectedWard === wardNum;
          const isHovered = hoveredWard === wardNum;

          return (
            <CircleMarker
              key={wardNum}
              center={coords}
              radius={isSelected ? radius + 4 : isHovered ? radius + 2 : radius}
              pathOptions={{
                color: isSelected ? '#4f46e5' : color,
                fillColor: color,
                fillOpacity: isSelected ? 0.9 : ward.isActive ? 0.7 : 0.3,
                weight: isSelected ? 3 : isHovered ? 2 : 1,
              }}
              eventHandlers={{
                click: () => onWardSelect?.(wardNum),
                mouseover: () => setHoveredWard(wardNum),
                mouseout: () => setHoveredWard(null),
              }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-700 font-bold text-xs">{wardNum}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">
                        Ward {wardNum}
                      </p>
                      <p className="text-xs text-gray-500">{ward.name}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Users size={12} /> Customers
                      </span>
                      <span className="font-medium text-gray-900">{ward.customerCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-gray-500">
                        <TrendingUp size={12} /> Response
                      </span>
                      <span className="font-medium text-gray-900">{rate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Status</span>
                      <span
                        className={`font-medium ${
                          ward.isActive ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {ward.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/notifications/create?ward=${wardNum}`);
                      }}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <Bell size={12} /> Send Notification
                    </button>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 z-[1000] text-xs">
        <p className="font-medium text-gray-700 mb-1.5">Response Rate</p>
        <div className="space-y-1">
          <LegendItem color="#22c55e" label="80%+" />
          <LegendItem color="#84cc16" label="60-79%" />
          <LegendItem color="#eab308" label="40-59%" />
          <LegendItem color="#f97316" label="20-39%" />
          <LegendItem color="#ef4444" label="< 20%" />
          <LegendItem color="#9ca3af" label="Inactive" />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-3 h-3 rounded-full border border-white/50"
        style={{ backgroundColor: color }}
      />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}
