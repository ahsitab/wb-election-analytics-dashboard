import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, X, TrendingUp, AlertTriangle } from 'lucide-react';
import { predictParty } from '../../api';

interface InsightCardProps {
  constituency: any;
  onClose: () => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({ constituency, onClose }) => {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await predictParty({
        turnout: constituency.turnout,
        urbanization: constituency.urbanization,
        literacy: constituency.literacy,
        income: constituency.income
      });
      setPrediction(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] glass rounded-2xl p-4 w-[450px] shadow-2xl border-indigo-500/20"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
        <X size={20} />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <BrainCircuit className="text-white" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{constituency.name}</h3>
          <p className="text-sm text-slate-400 mb-4">Constituency Intelligence Report</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Winning Party</div>
              <div className="font-semibold text-white">{constituency.winning_party}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Margin</div>
              <div className="font-semibold text-white">{constituency.margin}%</div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Urbanization Index</span>
              <span className="text-white font-mono">{constituency.urbanization}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${constituency.urbanization}%` }}></div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Literacy Rate</span>
              <span className="text-white font-mono">{constituency.literacy}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${constituency.literacy}%` }}></div>
            </div>
          </div>

          {!prediction && (
            <button
              onClick={handlePredict}
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Run AI Prediction Model <TrendingUp size={16} /></>
              )}
            </button>
          )}

          {prediction && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-slate-800/80 rounded-xl p-3 border border-indigo-500/30"
            >
              <div className="text-xs text-indigo-300 font-semibold mb-2 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={12} /> ML Model Output
              </div>
              <div className="flex justify-between items-end mb-3">
                <span className="text-sm text-slate-300">Predicted Winner:</span>
                <span className="text-xl font-bold text-white">{prediction.predicted_party}</span>
              </div>
              <div className="space-y-1">
                {Object.entries(prediction.probabilities)
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .slice(0, 3)
                  .map(([party, prob]: any) => (
                    <div key={party} className="flex items-center text-xs">
                      <span className="w-16 text-slate-400">{party}</span>
                      <div className="flex-1 bg-slate-900 rounded-full h-1.5 mx-2">
                        <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${prob}%` }}></div>
                      </div>
                      <span className="w-8 text-right font-mono text-slate-300">{prob}%</span>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
