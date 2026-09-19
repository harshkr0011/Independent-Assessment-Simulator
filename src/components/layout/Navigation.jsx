import React from 'react';
import { useGameContext } from '../../context/GameContext.jsx';
import { Brain, Play, Award, LayoutDashboard, Volume2, VolumeX, Code, Moon, Sun } from 'lucide-react';

export default function Navigation() {
  const { activeView, navigateTo, startMockAssessment, settings, toggleSound, toggleDarkMode } = useGameContext();
  const isDark = settings?.darkMode;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <button 
            onClick={() => navigateTo('landing')} 
            className="flex items-center space-x-3 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:bg-brand-700 transition-colors">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-100">
                  COGNITIVE <span className="text-brand-600 dark:text-brand-400">CHALLENGE</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">
                  Simulator
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden xs:block">Gamified Assessment Practice</p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => navigateTo('selection')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                activeView === 'selection' || activeView === 'practice' || activeView === 'instructions'
                  ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Practice</span>
            </button>

            <button
              onClick={() => startMockAssessment()}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                activeView === 'mock'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-slate-700 border border-brand-200 dark:border-slate-700'
              }`}
            >
              <Award className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Full Mock Test</span>
            </button>

            <button
              onClick={() => navigateTo('dashboard')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </button>

            <button
              onClick={() => navigateTo('dev')}
              title="Developer Mode"
              className={`p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                activeView === 'dev' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : ''
              }`}
            >
              <Code className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={settings.soundEnabled ? 'Sound ON' : 'Sound OFF'}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400 dark:text-slate-600" />
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
