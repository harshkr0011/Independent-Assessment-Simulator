import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

export default function Timer({ 
  duration = 12, 
  onExpire, 
  isPaused = false, 
  format = 'SS', // 'SS' | 'MM:SS'
  resetKey = 0,
  showRing = true,
  className = '' 
}) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const startTimeRef = useRef(Date.now());

  // Reset timer whenever duration or resetKey changes (e.g. new question)
  useEffect(() => {
    setTimeRemaining(duration);
    startTimeRef.current = Date.now();
  }, [duration, resetKey]);

  useEffect(() => {
    if (isPaused || duration <= 0) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpireRef.current) {
          onExpireRef.current();
        }
      }
    }, 80);

    return () => clearInterval(interval);
  }, [duration, isPaused, resetKey]);

  const displaySec = Math.ceil(timeRemaining);
  const minutes = Math.floor(displaySec / 60);
  const seconds = displaySec % 60;

  const isWarning = timeRemaining <= (format === 'MM:SS' ? 60 : 6) && timeRemaining > (format === 'MM:SS' ? 10 : 3);
  const isDanger = timeRemaining <= (format === 'MM:SS' ? 10 : 3);

  // Circular SVG ring calculation (r = 26, circumference = 2 * PI * 26 ≈ 163.36)
  const r = 24;
  const circumference = 2 * Math.PI * r;
  const progress = duration > 0 ? timeRemaining / duration : 0;
  const strokeDashoffset = circumference * (1 - progress);

  if (showRing && format === 'SS') {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        {/* Circular Ring SVG matching Netlify app */}
        <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 60 60">
          <circle 
            cx="30" 
            cy="30" 
            r={r} 
            className="stroke-slate-200 dark:stroke-slate-800 fill-none stroke-[5]" 
          />
          <circle 
            cx="30" 
            cy="30" 
            r={r} 
            style={{ strokeDasharray: circumference, strokeDashoffset }}
            className={`fill-none stroke-[5] transition-all duration-100 stroke-linecap-round ${
              isDanger ? 'stroke-rose-500' : isWarning ? 'stroke-amber-500' : 'stroke-brand-600'
            }`} 
          />
        </svg>

        {/* Seconds Counter Text inside circle */}
        <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">
          <span className={isDanger ? 'text-rose-600 animate-pulse' : isWarning ? 'text-amber-600' : 'text-slate-900 dark:text-slate-100'}>
            {displaySec}s
          </span>
        </div>
      </div>
    );
  }

  // Pill badge fallback format
  const formattedText = format === 'MM:SS'
    ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${displaySec}s`;

  return (
    <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border font-mono font-bold transition-all ${
      isDanger
        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 animate-pulse'
        : isWarning
        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400'
        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
    } ${className}`}>
      {isDanger || isWarning ? (
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
      )}
      <span className="text-sm tracking-wider">{formattedText}</span>
    </div>
  );
}
