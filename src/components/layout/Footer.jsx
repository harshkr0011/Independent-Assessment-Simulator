import React from 'react';
import { useGameContext } from '../../context/GameContext.jsx';
import { Brain, Shield } from 'lucide-react';

export default function Footer() {
  const { navigateTo, startMockAssessment } = useGameContext();

  return (
    <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <Brain className="w-6 h-6 text-brand-400" />
              <span className="font-extrabold text-lg tracking-tight">COGNITIVE CHALLENGE</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Production-quality cognitive practice simulator. Master fast mental math, spatial path finding, and logical route planning under realistic assessment conditions.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigateTo('selection')} className="hover:text-white transition-colors">Practice Games</button></li>
              <li><button onClick={() => startMockAssessment()} className="hover:text-white transition-colors">Full Mock Assessment</button></li>
              <li><button onClick={() => navigateTo('dashboard')} className="hover:text-white transition-colors">Performance Analytics</button></li>
              <li><button onClick={() => navigateTo('dev')} className="hover:text-white transition-colors">Developer Mode</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Assessment Info</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p>• Quick Math: 25 Qs (15s/Q)</p>
              <p>• Path Finder: 3 Puzzles (5 min/P)</p>
              <p>• Key & Door: 3 Puzzles (5 min/P)</p>
              <div className="pt-2 flex items-center space-x-1 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-brand-400" />
                <span>Deterministic Seed Support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Cognitive Challenge Practice Simulator. Independent tool.</p>
          <p className="mt-2 sm:mt-0">Not affiliated with or endorsed by any employer or test provider.</p>
        </div>
      </div>
    </footer>
  );
}
