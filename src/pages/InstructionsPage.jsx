import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext.jsx';
import { Play, Zap, Compass, Key, CheckCircle2, Sliders, ArrowLeft } from 'lucide-react';

export default function InstructionsPage() {
  const { activeGame, startPracticeGame, navigateTo } = useGameContext();
  const [selectedLevel, setSelectedLevel] = useState(1);

  const gameDetails = {
    'quick-math': {
      title: 'Quick Math / Bubble Selection',
      icon: Zap,
      color: 'brand',
      objective: 'Select expressions from LOWEST to HIGHEST value.',
      description: 'Multiple dynamic bubbles containing math expressions will appear. Calculate their values mentally and click bubbles in strictly ascending numerical order.',
      controls: [
        'Click a bubble to select it in sequence (marked with order badges 1, 2, 3...)',
        'Click a selected bubble again to unselect it (misclick recovery)',
        'Question advances automatically when all bubbles are selected or timer expires'
      ],
      scoring: 'Accuracy (50%) + Speed (25%) + Streak Bonus (25%)',
      levels: [
        'Level 1: Single operations (+, -) with small integers',
        'Level 2: Multiplication and division (×, ÷)',
        'Level 3: Fractions and decimals',
        'Level 4: Parentheses and PEMDAS order of operations',
        'Level 5: Mixed complex operations and distractor values'
      ]
    },
    'path-finder': {
      title: 'Path Finder',
      icon: Compass,
      color: 'indigo',
      objective: 'Build a continuous route from Start 🚀 to Destination 🪐.',
      description: 'Rotate and re-route 3×3 grid sub-blocks to form a continuous, unbroken path from Start 🚀 on the left edge to Destination 🪐 on the right edge.',
      controls: [
        'Click any cell inside a 3×3 Block to select it',
        'Click "Rotate" button to rotate the 3×3 sub-block 90° Clockwise',
        'Click "Change Layout" button to re-route arrow directions',
        'Path advances automatically upon full connection'
      ],
      scoring: 'Accuracy (50%) + Speed (25%) + Minimum Rotations Efficiency (25%)',
      levels: [
        'Level 1: 6 × 6 Grid (2 × 2 Sub-Blocks)',
        'Level 2: 6 × 6 Grid (Advanced Scramble)',
        'Level 3: 9 × 9 Grid (3 × 3 Sub-Blocks)',
        'Level 4: 9 × 9 Grid (Master Scramble)'
      ]
    },
    'key-door': {
      title: 'Key & Door Grid Navigation',
      icon: Key,
      color: 'amber',
      objective: 'Collect keys 🔑, unlock matching doors 🚪, and reach the Exit.',
      description: 'Navigate your player through memory mazes step-by-step using keyboard arrow keys. Collect keys, remember invisible wall locations to avoid bounce resets, and reach the exit.',
      controls: [
        'Keyboard Arrow Keys (⬆️ ⬇️ ⬅️ ➡️) or WASD to navigate 1 step at a time',
        'On mobile, use touch screen D-Pad directional controls',
        'Hitting an invisible wall or locked door resets your attempt back to center start (👤)',
        'Collect key 🔑 first before heading to exit door 🚪'
      ],
      scoring: 'Accuracy (50%) + Speed (25%) + Minimum Moves Efficiency (25%)',
      levels: [
        'Level 1: 4 × 4 Grid (1 Key 🔑, 3 Invisible Walls)',
        'Level 2: 5 × 5 Grid (1 Key 🔑, 5 Invisible Walls, 1 Directional Door)',
        'Level 3: 6 × 6 Grid (1 Key 🔑, 8 Invisible Walls, 2 Directional Doors)',
        'Level 4: 6 × 6 Grid (1 Key 🔑, 10 Invisible Walls)',
        'Level 5: 7 × 7 Grid (1 Key 🔑, 14 Invisible Walls)',
        'Level 6: 8 × 8 Master Grid (1 Key 🔑, 18 Invisible Walls, 4 Doors)'
      ]
    }
  };

  const details = gameDetails[activeGame || 'quick-math'];
  const IconComp = details.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn font-sans">
      
      <button
        onClick={() => navigateTo('selection')}
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Game Selection</span>
      </button>

      {/* Header */}
      <div className="bg-slate-900 text-white dark:bg-slate-900 dark:text-slate-100 rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0 border border-brand-500/30">
            <IconComp className="w-7 h-7 text-brand-400" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-400">INSTRUCTIONS</span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{details.title}</h1>
          </div>
        </div>

        <button
          onClick={() => startPracticeGame(activeGame || 'quick-math', selectedLevel)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2 active:scale-95"
        >
          <Play className="w-4 h-4" />
          <span>Start Practice Session</span>
        </button>
      </div>

      {/* Objective & Description */}
      <div className="corporate-card rounded-2xl p-6 space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Objective</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{details.objective}</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 pt-1 leading-relaxed font-normal">{details.description}</p>
        </div>

        {/* Controls */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Controls & Rules</span>
          <ul className="space-y-2 text-sm text-slate-800 dark:text-slate-200">
            {details.controls.map((rule, i) => (
              <li key={i} className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-800 dark:text-slate-200 font-medium">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Level Selection Selector */}
      <div className="corporate-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Select Practice Difficulty</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`p-3 rounded-xl border text-center transition-all ${
                selectedLevel === lvl
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md font-extrabold'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-700 font-semibold'
              }`}
            >
              <div className="text-xs opacity-80">Level</div>
              <div className="text-lg font-black">{lvl}</div>
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
          {details.levels[selectedLevel - 1] || details.levels[details.levels.length - 1]}
        </p>
      </div>

    </div>
  );
}
