import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext.jsx';
import QuickMathGame from '../games/quickMath/QuickMathGame.jsx';
import PathFinderGame from '../games/pathFinder/PathFinderGame.jsx';
import KeyDoorGame from '../games/keyDoor/KeyDoorGame.jsx';
import { Award, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function MockAssessmentPage() {
  const { mockSectionIndex, recordMockSectionResult, currentSeed } = useGameContext();

  const [inTransition, setInTransition] = useState(false);
  const [transitionCountdown, setTransitionCountdown] = useState(3);
  const [pendingResult, setPendingResult] = useState(null);

  const sections = [
    { id: 'quick-math', title: 'Section 1: Quick Math', desc: '25 Questions — 15s / question' },
    { id: 'path-finder', title: 'Section 2: Path Finder', desc: '3 Spatial Grid Puzzles' },
    { id: 'key-door', title: 'Section 3: Key & Door', desc: '3 Navigation Mazes' },
  ];

  const currentSection = sections[mockSectionIndex] || sections[0];

  const handleSectionComplete = (sectionSummary) => {
    setPendingResult(sectionSummary);
    setInTransition(true);
    setTransitionCountdown(3);
  };

  useEffect(() => {
    if (!inTransition) return;

    const timer = setInterval(() => {
      setTransitionCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setInTransition(false);
          if (pendingResult) {
            recordMockSectionResult(currentSection.id, pendingResult);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [inTransition, pendingResult, currentSection, mockSectionIndex]);

  if (inTransition) {
    const nextSection = sections[mockSectionIndex + 1];

    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">SECTION COMPLETE</span>
          <h2 className="text-2xl font-extrabold text-slate-900">{currentSection.title} Finished</h2>
          <p className="text-sm text-slate-500">Your section performance has been logged.</p>
        </div>

        {nextSection ? (
          <div className="bg-slate-900 text-white rounded-2xl p-8 space-y-4 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">UP NEXT</span>
            <h3 className="text-xl font-bold">{nextSection.title}</h3>
            <p className="text-sm text-slate-300">{nextSection.desc}</p>
            
            <div className="pt-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-600 text-white font-mono font-black text-2xl animate-ping">
                {transitionCountdown}
              </div>
            </div>
            <p className="text-xs text-slate-400">Section starting automatically...</p>
          </div>
        ) : (
          <div className="bg-slate-900 text-white rounded-2xl p-8 space-y-3">
            <h3 className="text-xl font-bold">Generating Final Assessment Results</h3>
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-6 px-4 space-y-4">
      {/* Mock Exam Top Header */}
      <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-xl px-5 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">FULL MOCK ASSESSMENT</span>
            <h3 className="text-sm font-extrabold">{currentSection.title}</h3>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {currentSeed && (
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-brand-300 font-mono">
              Seed: {currentSeed}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
            Exam Mode — No Pause
          </span>
        </div>
      </div>

      {/* Render Active Section Game */}
      {mockSectionIndex === 0 && <QuickMathGame onComplete={handleSectionComplete} isMockMode={true} />}
      {mockSectionIndex === 1 && <PathFinderGame onComplete={handleSectionComplete} isMockMode={true} />}
      {mockSectionIndex === 2 && <KeyDoorGame onComplete={handleSectionComplete} isMockMode={true} />}
    </div>
  );
}
