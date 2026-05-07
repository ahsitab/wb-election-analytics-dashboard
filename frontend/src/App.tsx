import { useEffect, useState } from 'react';
import { ElectoralMap } from './components/Map/ElectoralMap';
import { MapLayers } from './components/Map/MapLayers';
import type { MapMode } from './components/Map/MapLayers';
import { MetricsPanel } from './components/Dashboard/MetricsPanel';
import { InsightCard } from './components/InsightEngine/InsightCard';
import { fetchElectionData, fetchGeoJSON, fetchInsights } from './api';
import { Loader2 } from 'lucide-react';

function App() {
  const [mode, setMode] = useState<MapMode>('results');
  const [geojson, setGeoJSON] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [selectedConstituency, setSelectedConstituency] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [geoRes, dataRes, insightsRes] = await Promise.all([
          fetchGeoJSON(),
          fetchElectionData(),
          fetchInsights()
        ]);
        setGeoJSON(geoRes.data);
        setData(dataRes.data);
        setInsights(insightsRes.data);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-200">
        <Loader2 className="animate-spin mb-4 text-indigo-500" size={48} />
        <h1 className="text-2xl font-bold tracking-tight">Initializing Intelligence System</h1>
        <p className="text-slate-400">Loading geospatial datasets...</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative bg-slate-900 overflow-hidden">
      {/* Background Map */}
      <div className="absolute inset-0">
        <ElectoralMap 
          geojson={geojson} 
          data={data} 
          mode={mode} 
          onSelectConstituency={setSelectedConstituency} 
        />
      </div>

      {/* Floating UI Elements */}
      <MetricsPanel insights={insights} />
      <MapLayers currentMode={mode} setMode={setMode} />

      {selectedConstituency && (
        <InsightCard 
          constituency={selectedConstituency} 
          onClose={() => setSelectedConstituency(null)} 
        />
      )}
    </div>
  );
}

export default App;
