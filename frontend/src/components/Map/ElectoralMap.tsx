import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { MapMode } from './MapLayers';

interface ElectoralMapProps {
  geojson: any;
  data: any[];
  mode: MapMode;
  onSelectConstituency: (data: any) => void;
}

// Party colors from tailwind config
const PARTY_COLORS: Record<string, string> = {
  'TMC': '#00B140',
  'BJP': '#FF9933',
  'CPI(M)': '#DE2024',
  'INC': '#00BFFF',
  'Others': '#A0A0A0',
};

const CLUSTER_COLORS = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981'];

// Heatmap component
const HeatmapLayer = ({ data, mode }: { data: any[], mode: MapMode }) => {
  const map = useMap();
  
  useEffect(() => {
    if (mode !== 'turnout' && mode !== 'margin') return;

    const points = data.map(d => {
      const intensity = mode === 'turnout' 
        ? (d.turnout - 50) / 50 // Normalize somewhat
        : d.margin / 50; 
      return [d.lat, d.lng, intensity];
    });

    // @ts-ignore - leaflet.heat doesn't have perfect types
    const heat = L.heatLayer(points, {
      radius: 45,
      blur: 35,
      maxZoom: 10,
      gradient: mode === 'turnout' 
        ? {0.4: 'blue', 0.65: 'lime', 1: 'red'}
        : {0.4: 'yellow', 0.65: 'orange', 1: 'purple'}
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, data, mode]);

  return null;
};

export const ElectoralMap: React.FC<ElectoralMapProps> = ({ geojson, data, mode, onSelectConstituency }) => {
  const dataMap = useMemo(() => {
    const map = new Map();
    data.forEach(d => map.set(d.id, d));
    return map;
  }, [data]);

  const getStyle = (feature: any) => {
    const cData = dataMap.get(feature.properties.id);
    if (!cData) return { fillColor: '#333', weight: 1, color: '#555', fillOpacity: 0.2 };

    let fillColor = '#333';
    let fillOpacity = 0.6;

    if (mode === 'results') {
      fillColor = PARTY_COLORS[cData.winning_party] || PARTY_COLORS['Others'];
    } else if (mode === 'cluster') {
      fillColor = CLUSTER_COLORS[cData.cluster % CLUSTER_COLORS.length];
    } else {
      // For heatmap modes, we make polygons mostly transparent
      fillOpacity = 0.1;
      fillColor = '#1e293b';
    }

    return {
      fillColor,
      weight: 1,
      opacity: 1,
      color: 'rgba(255,255,255,0.2)',
      fillOpacity
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const cData = dataMap.get(feature.properties.id);
    if (!cData) return;

    const tooltipContent = `
      <div class="p-2 min-w-[150px]">
        <h3 class="font-bold text-lg mb-1">${cData.name}</h3>
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 rounded-full" style="background-color: ${PARTY_COLORS[cData.winning_party]}"></div>
          <span class="font-semibold">${cData.winning_party}</span>
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-300">
          <span>Margin:</span>
          <span class="text-right font-mono">${cData.margin}%</span>
          <span>Turnout:</span>
          <span class="text-right font-mono">${cData.turnout}%</span>
        </div>
      </div>
    `;

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      className: 'custom-tooltip',
      opacity: 0.95
    });

    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 2,
          color: '#fff',
          fillOpacity: mode === 'results' ? 0.8 : 0.3,
        });
        target.bringToFront();
      },
      mouseout: (e) => {
        const target = e.target;
        // @ts-ignore - resetStyle exists on GeoJSON layer
        target.options.geoJsonLayer.resetStyle(target);
      },
      click: () => {
        onSelectConstituency(cData);
      }
    });
  };

  // Center of West Bengal approx
  const center: L.LatLngTuple = [24.3, 87.8];

  return (
    <MapContainer 
      center={center} 
      zoom={7} 
      className="w-full h-full bg-slate-900"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {geojson && (
        <GeoJSON
          key={`geojson-${mode}`} // Force re-render on mode change for styles
          data={geojson}
          style={getStyle}
          onEachFeature={(feature, layer) => {
            // Store reference to parent layer for resetStyle
            // @ts-ignore
            layer.options.geoJsonLayer = layer._layerGroup;
            onEachFeature(feature, layer);
          }}
        />
      )}

      {(mode === 'turnout' || mode === 'margin') && (
        <HeatmapLayer data={data} mode={mode} />
      )}
    </MapContainer>
  );
};
