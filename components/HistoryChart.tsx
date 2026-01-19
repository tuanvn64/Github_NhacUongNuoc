
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WaterLog } from '../types';

interface HistoryChartProps {
  logs: WaterLog[];
  dailyGoal: number;
}

const HistoryChart: React.FC<HistoryChartProps> = ({ logs, dailyGoal }) => {
  // Aggregate logs by hour for today
  const today = new Date().setHours(0, 0, 0, 0);
  const data = Array.from({ length: 24 }).map((_, i) => ({
    hour: `${i}:00`,
    amount: logs
      .filter(log => {
        const d = new Date(log.timestamp);
        return d.setHours(0, 0, 0, 0) === today && d.getHours() === i;
      })
      .reduce((sum, log) => sum + log.amount, 0)
  }));

  return (
    <div className="h-64 w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Today's Intake Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="hour" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            interval={3}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#3b82f6' : '#e2e8f0'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
