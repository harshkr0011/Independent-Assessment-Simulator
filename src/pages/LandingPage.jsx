import React from 'react';
import { useGameContext } from '../context/GameContext.jsx';
import DisclaimerBanner from '../components/layout/DisclaimerBanner.jsx';
import { Play, Award, Zap, Compass, Key, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const { navigateTo, startMockAssessment } = useGameContext();

  return (
    <div className="space-y-12 animate-fadeIn pb-12">
      <DisclaimerBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 sm:py-24 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Independent Assessment Simulator</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight max-w-3xl mx-auto leading-tight">
            Train Your <span className="text-brand-600 dark:text-brand-400">Thinking.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Practice speed, spatial reasoning, logical planning, and problem-solving through timed corporate cognitive games.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigateTo('selection')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <Play className="w-5 h-5" />
              <span>Start Practice</span>
            </button>

            <button
              onClick={() => startMockAssessment()}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-base shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 border border-transparent dark:border-slate-700"
            >
              <Award className="w-5 h-5 text-amber-400" />
              <span>Full Mock Assessment</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">25 Qs</span>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quick Math Limit</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">6 &times; 6 &rarr; 9 &times; 9</span>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Path Grid Sizes</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">4 &times; 4 &rarr; 8 &times; 8</span>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Key & Door Mazes</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-2xl font-black text-brand-600 dark:text-brand-400">100% Solvable</span>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">BFS Solved Puzzles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Game Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Cognitive Game Modules</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto font-medium">
            Each game targets specific cognitive abilities evaluated in fresher assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="corporate-card corporate-card-hover rounded-2xl p-6 space-y-5 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-100 dark:border-brand-800">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Quick Math</h3>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">Speed & Numeracy</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 pt-2 leading-relaxed font-normal">
                Evaluate arithmetic expressions mentally and click circular bubbles in strictly ASCENDING value order.
              </p>
            </div>
            <button
              onClick={() => navigateTo('instructions', 'quick-math')}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-brand-600 dark:bg-slate-800 dark:hover:bg-brand-600 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-95"
            >
              <span>Practice Quick Math</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="corporate-card corporate-card-hover rounded-2xl p-6 space-y-5 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Path Finder</h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Spatial Reasoning</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 pt-2 leading-relaxed font-normal">
                Rotate and re-route 3×3 grid sub-blocks to construct a continuous route from Start 🚀 to Destination 🪐.
              </p>
            </div>
            <button
              onClick={() => navigateTo('instructions', 'path-finder')}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-95"
            >
              <span>Practice Path Finder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="corporate-card corporate-card-hover rounded-2xl p-6 space-y-5 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-800">
              <Key className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Key & Door</h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Logical Planning & Memory</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 pt-2 leading-relaxed font-normal">
                Navigate keyboard arrow keys step-by-step, collect keys 🔑, avoid invisible obstacles, and reach exit 🚪.
              </p>
            </div>
            <button
              onClick={() => navigateTo('instructions', 'key-door')}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-amber-600 dark:bg-slate-800 dark:hover:bg-amber-600 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-95"
            >
              <span>Practice Key & Door</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
