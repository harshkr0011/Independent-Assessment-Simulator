import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext.jsx';
import { generatePathPuzzle } from '../games/pathFinder/tileGenerator.js';
import { generateKeyDoorMaze } from '../games/keyDoor/mazeGenerator.js';
import { generateQuestion } from '../games/quickMath/mathGenerator.js';
import { Code, Terminal, Play, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function DevPage() {
  const { currentSeed } = useGameContext();
  const [selectedTool, setSelectedTool] = useState('path-finder');
  const [testLevel, setTestLevel] = useState(1);
  const [outputData, setOutputData] = useState(null);

  const runGeneratorTest = () => {
    if (selectedTool === 'quick-math') {
      const q = generateQuestion(testLevel, 5);
      setOutputData(q);
    } else if (selectedTool === 'path-finder') {
      const p = generatePathPuzzle(testLevel);
      setOutputData(p);
    } else if (selectedTool === 'key-door') {
      const m = generateKeyDoorMaze(testLevel);
      setOutputData(m);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 font-mono text-xs animate-fadeIn">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-2 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2 text-brand-400 font-bold">
          <Terminal className="w-5 h-5" />
          <h1 className="text-base tracking-wider uppercase">DEVELOPER & DEBUGGER ROUTE (/dev)</h1>
        </div>
        <p className="text-slate-400 font-sans text-xs">
          Inspect puzzle generation algorithms, seed parameters, BFS solvability checks, and state validation.
        </p>
      </div>

      {/* Control Panel */}
      <div className="corporate-card rounded-2xl p-6 space-y-4 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Engine:</span>
            <select
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
            >
              <option value="quick-math">Quick Math Generator</option>
              <option value="path-finder">Path Finder Generator</option>
              <option value="key-door">Key & Door Maze Generator</option>
            </select>

            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">Level:</span>
            <select
              value={testLevel}
              onChange={(e) => setTestLevel(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
            >
              {[1, 2, 3, 4, 5].map(l => <option key={l} value={l}>Level {l}</option>)}
            </select>
          </div>

          <button
            onClick={runGeneratorTest}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4 text-brand-400 dark:text-brand-600" />
            <span>Generate & Solvability Check</span>
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-between text-xs">
          <span>Active Seed: <strong>{currentSeed || 'Default Pseudo-Random'}</strong></span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Validation Engine: Active</span>
          </span>
        </div>
      </div>

      {/* JSON Debugger Output */}
      {outputData && (
        <div className="bg-slate-950 text-slate-200 rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-3 overflow-x-auto">
          <div className="flex items-center justify-between text-brand-400 font-bold border-b border-slate-800 pb-2">
            <span>// GENERATED PUZZLE STATE & SOLVABILITY JSON</span>
            <span>Status: 200 OK</span>
          </div>

          <pre className="text-emerald-400 text-[11px] leading-relaxed max-h-[450px] overflow-y-auto">
            {JSON.stringify(outputData, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
}
