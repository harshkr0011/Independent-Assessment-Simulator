import React from 'react';

export default function ProgressBar({ current, total, label = 'Progress' }) {
  const percentage = Math.min(100, Math.max(0, Math.round((current / Math.max(1, total)) * 100)));

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-mono">{current} / {total}</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-brand-600 h-full rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
