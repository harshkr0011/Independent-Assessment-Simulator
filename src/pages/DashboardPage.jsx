import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext.jsx';
import { storageService } from '../services/storageService.js';
import { Play, Award, Zap, Compass, Key, Target, TrendingUp, History, ArrowRight, Clock, Layers, BarChart3, CheckCircle2, Sparkles, Trophy } from 'lucide-react';

export default function DashboardPage() {
  const { navigateTo, startPracticeGame, startMockAssessment } = useGameContext();
  const [selectedAnalyticsGame, setSelectedAnalyticsGame] = useState('quick-math');

  const metrics = storageService.getPerformanceMetrics();
  const pb = storageService.getPersonalBests();

  const skillBars = [
    { name: 'Accuracy', value: metrics.accuracy, color: 'bg-emerald-500' },
    { name: 'Speed', value: metrics.speed, color: 'bg-brand-500' },
    { name: 'Spatial Reasoning', value: metrics.spatialReasoning, color: 'bg-indigo-500' },
    { name: 'Logical Planning', value: metrics.logicalPlanning, color: 'bg-amber-500' },
    { name: 'Consistency', value: metrics.consistency, color: 'bg-teal-500' },
  ];

  const gameLevelsConfig = {
    'quick-math': [
      { level: 1, title: 'Level 1: Basic Operations (+, -)', targetSpeed: '< 15s', benchmarkAcc: '95%', badge: '⚡ Speed Foundation' },
      { level: 2, title: 'Level 2: Multiplication & Division (×, ÷)', targetSpeed: '< 15s', benchmarkAcc: '90%', badge: '🧮 Numeracy Master' },
      { level: 3, title: 'Level 3: Fractions & Decimals', targetSpeed: '< 15s', benchmarkAcc: '88%', badge: '📐 Precision Math' },
      { level: 4, title: 'Level 4: PEMDAS Parentheses', targetSpeed: '< 15s', benchmarkAcc: '85%', badge: '🧠 Logic Operations' },
      { level: 5, title: 'Level 5: Distractors & Complex Math', targetSpeed: '< 15s', benchmarkAcc: '82%', badge: '🚀 Expert Numeracy' }
    ],
    'path-finder': [
      { level: 1, title: 'Level 1: 6×6 Grid (2×2 Sub-Blocks)', targetSpeed: '< 30s', benchmarkAcc: '100%', badge: '🧩 Path Builder' },
      { level: 2, title: 'Level 2: 6×6 Grid (Advanced Scramble)', targetSpeed: '< 40s', benchmarkAcc: '100%', badge: '🔄 Rotation Expert' },
      { level: 3, title: 'Level 3: 9×9 Grid (3×3 Sub-Blocks)', targetSpeed: '< 55s', benchmarkAcc: '95%', badge: '🪐 Spatial Master' },
      { level: 4, title: 'Level 4: 9×9 Grid (Master Scramble)', targetSpeed: '< 65s', benchmarkAcc: '90%', badge: '🚀 Route Architect' }
    ],
    'key-door': [
      { level: 1, title: 'Level 1: 4×4 Grid (1 Key 🔑, 3 Invisible Walls)', targetSpeed: '< 20s', benchmarkAcc: '100%', badge: '🔑 Key Explorer' },
      { level: 2, title: 'Level 2: 5×5 Grid (5 Invisible Walls, 1 Door)', targetSpeed: '< 30s', benchmarkAcc: '95%', badge: '🚪 Door Navigator' },
      { level: 3, title: 'Level 3: 6×6 Grid (8 Invisible Walls, 2 Doors)', targetSpeed: '< 45s', benchmarkAcc: '90%', badge: '🧠 Memory Maze Master' },
      { level: 4, title: 'Level 4: 6×6 Grid (10 Invisible Walls)', targetSpeed: '< 50s', benchmarkAcc: '88%', badge: '🛡️ Obstacle Dodger' },
      { level: 5, title: 'Level 5: 7×7 Grid (14 Invisible Walls)', targetSpeed: '< 60s', benchmarkAcc: '85%', badge: '🗺️ Grid Tactician' },
      { level: 6, title: 'Level 6: 8×8 Master Grid (18 Walls, 4 Doors)', targetSpeed: '< 75s', benchmarkAcc: '80%', badge: '👑 Accenture Champion' }
    ]
  };

  const selectedLevels = gameLevelsConfig[selectedAnalyticsGame] || gameLevelsConfig['quick-math'];
  const activeLevelData = metrics.levelStats?.[selectedAnalyticsGame] || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Performance Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Track your skill mastery, level progression, and practice attempt timing.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => startMockAssessment()}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center space-x-2 active:scale-95"
          >
            <Award className="w-4 h-4" />
            <span>Full Mock Assessment</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Overall Score Card */}
        <div className="corporate-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Overall Practice Score</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-slate-100">{metrics.overallScore}</span>
            <span className="text-sm font-extrabold text-slate-600 dark:text-slate-400">/ 100</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Weighted index based on Speed (20%), Accuracy (35%), Spatial (25%), and Logic (20%).
          </p>
        </div>

        {/* Cognitive Skill Bars */}
        <div className="md:col-span-2 corporate-card rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Cognitive Performance Metrics</h3>
          
          <div className="space-y-2.5">
            {skillBars.map(skill => (
              <div key={skill.name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>{skill.name}</span>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100">{skill.value}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`${skill.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${skill.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Weak Area Recommendation Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-500/20">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Recommended Practice</span>
            <h3 className="text-lg font-bold">Targeted Practice: {metrics.weakestArea}</h3>
            <p className="text-xs text-amber-100">Your performance in {metrics.weakestArea} is lower. Practice targeted puzzles to boost your score.</p>
          </div>
        </div>

        <button
          onClick={() => startPracticeGame(metrics.recommendedGame, 1)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-amber-50 transition-colors shadow-md flex-shrink-0 flex items-center justify-center space-x-2 active:scale-95"
        >
          <span>Start Targeted Practice</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Level-by-Level Improvement Analytics Section */}
      <div className="corporate-card rounded-2xl p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Level-by-Level Progress & Skill Improvement</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Analyze how your speed, accuracy, and solve efficiency evolve from Level 1 to Master Level.</p>
            </div>
          </div>

          {/* Game Selection Selector Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setSelectedAnalyticsGame('quick-math')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedAnalyticsGame === 'quick-math'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Quick Math
            </button>
            <button
              onClick={() => setSelectedAnalyticsGame('path-finder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedAnalyticsGame === 'path-finder'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Path Finder
            </button>
            <button
              onClick={() => setSelectedAnalyticsGame('key-door')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedAnalyticsGame === 'key-door'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Key & Door
            </button>
          </div>
        </div>

        {/* Level Progression Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedLevels.map((lvlConfig) => {
            const lvlStats = activeLevelData[lvlConfig.level];
            const hasPlayed = lvlStats && lvlStats.attempts > 0;
            const avgTime = hasPlayed ? (lvlStats.totalTime / lvlStats.attempts).toFixed(1) : null;
            const avgAcc = hasPlayed ? Math.round(lvlStats.totalAccuracy / lvlStats.attempts) : null;

            return (
              <div 
                key={lvlConfig.level}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-extrabold uppercase tracking-wider">
                    {lvlConfig.badge}
                  </span>
                  {hasPlayed ? (
                    <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">Not Attempted</span>
                  )}
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{lvlConfig.title}</h4>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    <span>Target: <strong>{lvlConfig.targetSpeed}</strong></span>
                    <span>•</span>
                    <span>Min Acc: <strong>{lvlConfig.benchmarkAcc}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Attempts</span>
                    <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs mt-0.5">{lvlStats?.attempts || 0}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Avg Time</span>
                    <p className="font-extrabold text-brand-600 dark:text-brand-400 text-xs mt-0.5">{avgTime ? `${avgTime}s` : '-'}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Best Score</span>
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">{lvlStats?.bestScore || '-'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Game Cards Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Game Statistics & Practice</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Quick Math */}
          <div className="corporate-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Quick Math</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Speed & Numeracy</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Best Score</span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{pb['quick-math']?.bestScore || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Accuracy</span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{pb['quick-math']?.accuracy || 0}%</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Attempts</span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{pb['quick-math']?.attempts || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Best Time</span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{pb['quick-math']?.bestTime ? `${pb['quick-math'].bestTime}s` : '-'}</p>
              </div>
            </div>

            <button
              onClick={() => startPracticeGame('quick-math', 1)}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Practice Quick Math</span>
            </button>
          </div>

          {/* Path Finder */}
          <div className="corporate-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Path Finder</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Spatial Reasoning</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Best Score</span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{pb['path-finder']?.bestScore || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Levels Cleared</span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{pb['path-finder']?.levelsCompleted || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Attempts</span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{pb['path-finder']?.attempts || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Average Time</span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{pb['path-finder']?.averageTime ? `${pb['path-finder'].averageTime}s` : '-'}</p>
              </div>
            </div>

            <button
              onClick={() => startPracticeGame('path-finder', 1)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Practice Path Finder</span>
            </button>
          </div>

          {/* Key & Door */}
          <div className="corporate-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Key & Door</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Logical Planning</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Best Score</span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{pb['key-door']?.bestScore || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Keys Collected</span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{pb['key-door']?.keysCollected || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Attempts</span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{pb['key-door']?.attempts || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Average Time</span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{pb['key-door']?.averageTime ? `${pb['key-door'].averageTime}s` : '-'}</p>
              </div>
            </div>

            <button
              onClick={() => startPracticeGame('key-door', 1)}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Practice Key & Door</span>
            </button>
          </div>

        </div>
      </div>

      {/* Recent Practice Attempts Table with Time Spent & Level */}
      <div className="corporate-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-extrabold text-base">
            <History className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2>Recent Practice Attempts</h2>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Detailed Attempt History & Speed Timings</span>
        </div>

        {metrics.recentAttempts.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No practice attempts recorded yet. Start a game to see your history!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Game</th>
                  <th className="py-3.5 px-4">Level / Mode</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Accuracy</th>
                  <th className="py-3.5 px-4">Time Spent ⏱️</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {metrics.recentAttempts.map(att => {
                  const formattedTime = att.timeSpent 
                    ? (att.timeSpent >= 60 ? `${Math.floor(att.timeSpent / 60)}m ${Math.round(att.timeSpent % 60)}s` : `${att.timeSpent}s`)
                    : '18.4s';
                    
                  return (
                    <tr key={att.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 capitalize">
                        {att.game === 'quick-math' && '⚡ Quick Math'}
                        {att.game === 'path-finder' && '🧩 Path Finder'}
                        {att.game === 'key-door' && '🔑 Key & Door'}
                        {att.game === 'full-mock' && '🏆 Full Mock Test'}
                        {!['quick-math', 'path-finder', 'key-door', 'full-mock'].includes(att.game) && att.game}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px]">
                          {att.difficulty ? `Level ${att.difficulty}` : (att.game === 'full-mock' ? 'Mock Exam' : 'Level 1')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-brand-600 dark:text-brand-400 text-sm">{att.score}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{att.accuracy || 100}%</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{formattedTime}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                        {new Date(att.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
