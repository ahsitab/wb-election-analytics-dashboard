import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { motion } from 'framer-motion';

interface MetricsPanelProps {
  insights: any;
}

const PARTY_COLORS: Record<string, string> = {
  'TMC': '#00B140',
  'BJP': '#FF9933',
  'CPI(M)': '#DE2024',
  'INC': '#00BFFF',
  'Others': '#A0A0A0',
};

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ insights }) => {
  if (!insights) return null;

  const seatData = Object.entries(insights.seat_counts).map(([name, value]) => ({ name, value }));
  const voteData = Object.entries(insights.vote_shares).map(([name, value]) => ({ name, value }));

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute top-4 left-4 z-[1000] w-80 flex flex-col gap-4 max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden p-1 custom-scrollbar"
    >
      <div className="glass rounded-xl p-4">
        <h2 className="text-xl font-bold mb-1 tracking-tight text-white">West Bengal</h2>
        <p className="text-sm text-slate-400 mb-4 uppercase tracking-widest">Election Analytics</p>
        
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-indigo-500 rounded-full"></span> Seat Distribution
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={seatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {seatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PARTY_COLORS[entry.name] || PARTY_COLORS['Others']} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {seatData.map((d) => (
              <div key={d.name} className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PARTY_COLORS[d.name] }}></div>
                <span className="text-slate-300">{d.name}:</span>
                <span className="font-bold text-white">{d.value as any}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded-full"></span> Vote Share (%)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={voteData} layout="vertical" margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {voteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PARTY_COLORS[entry.name] || PARTY_COLORS['Others']} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
