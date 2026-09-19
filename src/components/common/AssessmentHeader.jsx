import React from 'react';
import Timer from './Timer.jsx';
import { ShieldCheck, Moon, Sun } from 'lucide-react';
import { useGameContext } from '../../context/GameContext.jsx';

export default function AssessmentHeader({ 
  gameTitle = 'QUICK MATH', 
  timerSeconds = 12, 
  onTimerExpire, 
  progressText = 'Question 07 / 25',
  format = 'SS',
  resetKey = 0,
  isPaused = false
}) {
  const { settings, toggleDarkMode } = useGameContext();
  const isDark = settings?.darkMode;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs mb-4 transition-colors duration-200">
      {/* Top Header Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        
        {/* Left: Cognitive Assessment */}
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-slate-100 uppercase">
            COGNITIVE <span className="text-brand-600 dark:text-brand-400">ASSESSMENT</span>
          </span>
        </div>

        {/* Center: Game Name */}
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-3 sm:px-4 py-1 rounded-md text-xs font-black tracking-widest text-slate-900 dark:text-slate-100 uppercase">
          {gameTitle}
        </div>

        {/* Right: TIME & Dark Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={toggleDarkMode}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline">TIME</span>
          <Timer 
            duration={timerSeconds} 
            onExpire={onTimerExpire} 
            isPaused={isPaused} 
            format={format}
            resetKey={resetKey}
          />
        </div>

      </div>

      {/* Sub Header: Progress */}
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400 animate-pulse" />
          <span>Progress: <strong className="text-slate-900 dark:text-slate-100 font-mono">{progressText}</strong></span>
        </div>

        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden xs:inline">Test Mode — Standardized Simulation</span>
      </div>
    </div>
  );
}
