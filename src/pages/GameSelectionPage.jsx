import React from 'react';
import { useGameContext } from '../context/GameContext.jsx';
import { Zap, Compass, Key, Award, Sliders } from 'lucide-react';

export default function GameSelectionPage() {
  const { navigateTo, startMockAssessment } = useGameContext();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Choose Practice Mode</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Select an individual game to hone specific cognitive abilities or run a complete mock assessment simulation.
        </p>
      </div>

      {/* Primary Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        
        {/* Full Mock Assessment Mode Card */}
        <div 
          onClick={() => startMockAssessment()}
          className="corporate-card rounded-2xl p-8 cursor-pointer group hover:border-brand-500 hover:shadow-xl hover:shadow-brand-500/10 transition-all border-2 border-brand-500/30 bg-gradient-to-br from-brand-50/50 dark:from-brand-950/40 to-white dark:to-slate-900"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/30">
              <Award className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider">
              Recommended
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            Full Mock Assessment Simulation
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            Runs Quick Math (25 Qs), Path Finder (3 Puzzles), and Key & Door (3 Puzzles) sequentially with automated transition screens and strict exam timer rules.
          </p>
        </div>

        {/* Custom Practice Selector */}
        <div 
          onClick={() => navigateTo('instructions', 'quick-math')}
          className="corporate-card corporate-card-hover rounded-2xl p-8 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-md">
              <Sliders className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
              Targeted
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            Targeted Individual Game Practice
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            Select a specific game and difficulty level (Levels 1 to 6) to isolate weak areas and improve average speed and accuracy.
          </p>
        </div>

      </div>

      {/* Individual Game Selector Cards */}
      <div className="max-w-4xl mx-auto space-y-4 pt-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Select Game Module</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <button
            onClick={() => navigateTo('instructions', 'quick-math')}
            className="corporate-card corporate-card-hover rounded-2xl p-6 text-left space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-brand-600 dark:group-hover:text-brand-400">Quick Math</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">25 arithmetic expressions. Mental calculations under 15 seconds.</p>
          </button>

          <button
            onClick={() => navigateTo('instructions', 'path-finder')}
            className="corporate-card corporate-card-hover rounded-2xl p-6 text-left space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Path Finder</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Rotate and re-route 3×3 grid tiles to connect Start 🚀 to Destination 🪐.</p>
          </button>

          <button
            onClick={() => navigateTo('instructions', 'key-door')}
            className="corporate-card corporate-card-hover rounded-2xl p-6 text-left space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-amber-600 dark:group-hover:text-amber-400">Key & Door</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Keyboard arrow navigation through memory mazes with invisible obstacles.</p>
          </button>

        </div>
      </div>

    </div>
  );
}
