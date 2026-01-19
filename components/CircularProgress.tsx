
import React from 'react';

interface CircularProgressProps {
  percentage: number;
  current: number;
  goal: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, current, goal }) => {
  const normalizedPercentage = Math.min(percentage, 100);
  const stroke = 12;
  const radius = 90;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative py-8">
      <div className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90 drop-shadow-sm"
        >
          <circle
            stroke="#e2e8f0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="#3b82f6"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold text-slate-800">{Math.round(percentage)}%</span>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Goal Progress</span>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-slate-500 text-sm">Consumed Today</p>
        <p className="text-2xl font-bold text-blue-600">
          {current} <span className="text-slate-400 font-normal text-sm">/ {goal} ml</span>
        </p>
      </div>
    </div>
  );
};

export default CircularProgress;
