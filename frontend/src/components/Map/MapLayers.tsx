import React from 'react';
import { Layers, Activity, Users, Map as MapIcon, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export type MapMode = 'results' | 'turnout' | 'margin' | 'cluster';

interface MapLayersProps {
  currentMode: MapMode;
  setMode: (mode: MapMode) => void;
}

export const MapLayers: React.FC<MapLayersProps> = ({ currentMode, setMode }) => {
  const layers = [
    { id: 'results', label: 'Election Results', icon: MapIcon },
    { id: 'turnout', label: 'Turnout Heatmap', icon: Users },
    { id: 'margin', label: 'Margin Intensity', icon: Activity },
    { id: 'cluster', label: 'Socio-Econ Cluster', icon: BarChart3 },
  ] as const;

  return (
    <div className="absolute top-4 right-4 z-[1000] glass rounded-xl p-2 flex flex-col gap-2">
      <div className="text-xs text-slate-400 uppercase font-semibold px-2 py-1 flex items-center gap-2">
        <Layers size={14} /> Map Layers
      </div>
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isActive = currentMode === layer.id;
        return (
          <button
            key={layer.id}
            onClick={() => setMode(layer.id as MapMode)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 relative ${
              isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeLayer"
                className="absolute inset-0 bg-indigo-600/30 border border-indigo-500/50 rounded-lg"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Icon size={16} className="relative z-10" />
            <span className="relative z-10">{layer.label}</span>
          </button>
        );
      })}
    </div>
  );
};
