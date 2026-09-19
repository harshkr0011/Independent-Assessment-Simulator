import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext.jsx';
import { 
  Award, Zap, CheckCircle2, XCircle, Clock, RotateCcw, Home, Download, 
  Lightbulb, ShieldAlert, Sparkles, Navigation, Key, Compass, Brain
} from 'lucide-react';

export default function ResultsPage() {
  const { lastResult, navigateTo, startMockAssessment, startPracticeGame } = useGameContext();
  const [filter, setFilter] = useState('all'); // 'all' | 'correct' | 'incorrect'
  const [showTricksModal, setShowTricksModal] = useState(false);

  const currentGameType = lastResult?.game || 'quick-math';

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lastResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `accenture_${currentGameType}_result_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestart = () => {
    if (currentGameType === 'full-mock') {
      startMockAssessment();
    } else {
      startPracticeGame(currentGameType, 1);
    }
  };

  // ----------------------------------------------------
  // RENDER GAME 1: QUICK MATH (ACCENTURE BUBBLE MATHS)
  // ----------------------------------------------------
  if (currentGameType === 'quick-math') {
    const answers = lastResult?.answers || [];
    const totalCount = lastResult?.totalCount || 25;
    const correctCount = lastResult?.correctCount ?? (lastResult?.accuracy ? Math.round((lastResult.accuracy / 100) * totalCount) : 11);
    const accuracy = lastResult?.accuracy ?? Math.round((correctCount / totalCount) * 100);
    const avgTime = lastResult?.avgTime || 6.8;

    const isShortlisted = correctCount >= 18;
    const probabilityPercent = isShortlisted 
      ? Math.min(98, Math.round(75 + (correctCount - 18) * 3)) 
      : Math.max(10, Math.round((correctCount / 18) * 35));

    let speedRatingText = '⚡ Lightning Fast';
    if (avgTime > 6 && avgTime <= 8) speedRatingText = 'Fast';
    else if (avgTime > 8 && avgTime <= 10) speedRatingText = 'Moderate';
    else if (avgTime > 10) speedRatingText = 'Slow';

    const filteredAnswers = answers.filter(a => {
      if (filter === 'correct') return a.isCorrect;
      if (filter === 'incorrect') return !a.isCorrect;
      return true;
    });

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn font-sans">
        
        {/* Brand Navigation Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl border border-slate-800">
          <div>
            <div className="text-xs font-black tracking-widest text-brand-400 uppercase">
              ACCENTURE <span className="text-white">BUBBLE MATHS</span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-200">
              Cognitive Assessment Simulator & Shortlist Predictor
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
              Motion: <strong className="text-brand-400">Floating 2D</strong>
            </span>

            <button
              onClick={() => setShowTricksModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center space-x-1.5 shadow-md transition-all active:scale-95"
            >
              <Lightbulb className="w-4 h-4 text-slate-950" />
              <span>Quick Mental Tricks</span>
            </button>
          </div>
        </div>

        {/* Shortlist Status Banner */}
        <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-xl relative overflow-hidden transition-all ${
          isShortlisted 
            ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/50 text-white'
            : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border-rose-500/50 text-white'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isShortlisted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {isShortlisted ? <Award className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                <span>{isShortlisted ? 'SHORTLISTED' : 'NOT SHORTLISTED'}</span>
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                SHORTLIST PROBABILITY: <span className={isShortlisted ? 'text-emerald-400' : 'text-rose-400'}>{isShortlisted ? 'HIGH' : 'LOW'}</span>
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {isShortlisted 
                  ? `You scored ${correctCount}/${totalCount} (${accuracy}%), comfortably clearing Accenture's 18-20 question sectional cutoff.`
                  : `You scored ${correctCount}/${totalCount} (${accuracy}%). You are below Accenture's standard 18+ correct question target cutoff. Further practice is required.`
                }
              </p>
            </div>

            {/* Selection Chance Badge */}
            <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl text-center flex-shrink-0 min-w-[130px] shadow-2xl">
              <div className={`text-4xl font-black ${isShortlisted ? 'text-emerald-400' : 'text-rose-400'}`}>
                {probabilityPercent}%
              </div>
              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider pt-1">
                Selection Chance
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <Award className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Total Score</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{correctCount} / {totalCount}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Accuracy Rate</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{accuracy}%</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Avg Time / Q</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{avgTime}s</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Speed Efficiency</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{speedRatingText}</div>
          </div>
        </div>

        {/* Accenture Assessment Algorithm Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3>Accenture Assessment Algorithm Breakdown</h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-100 text-brand-400 dark:text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
              <p>
                <strong>Accuracy Threshold:</strong> Accenture uses a strict raw score cutoff (typically <strong>18 to 20 correct answers</strong> out of 25). 
                {isShortlisted 
                  ? ` Your score of ${correctCount}/${totalCount} comfortably clears the sectional baseline requirement.`
                  : ` Your score of ${correctCount}/${totalCount} falls short of the sectional baseline requirement.`
                }
              </p>
            </div>

            <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-100 text-brand-400 dark:text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
              <p>
                <strong>Speed Tie-Breaker:</strong> If candidates score the same (e.g. both get 21/25), speed serves as the tie-breaker. 
                Your fast average speed of <strong>{avgTime}s</strong> gives you a strong tie-breaker advantage against candidates with identical raw scores!
              </p>
            </div>

            <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-100 text-brand-400 dark:text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">3</span>
              <p>
                <strong>Non-Competitive Absolute Scoring:</strong> Selection is based on meeting individual sectional benchmarks rather than direct relative elimination. You are not forced to beat others—just clear the 18+ threshold!
              </p>
            </div>
          </div>
        </div>

        {/* Question-by-Question Breakdown Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">Question-by-Question Breakdown</h3>

            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filter === 'all' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All ({answers.length || totalCount})
              </button>

              <button
                onClick={() => setFilter('correct')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filter === 'correct' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                ✓ Correct ({answers.filter(a => a.isCorrect).length})
              </button>

              <button
                onClick={() => setFilter('incorrect')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filter === 'incorrect' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                ✕ Incorrect / Timeout ({answers.filter(a => !a.isCorrect).length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAnswers.length === 0 ? (
              <div className="p-6 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">No questions match the selected filter.</div>
            ) : (
              filteredAnswers.map((item, idx) => {
                const qNum = idx + 1;
                const q = item.question;
                const isCorrect = item.isCorrect;
                const timedOut = item.timedOut;

                return (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-slate-100 text-sm">Question {qNum}</span>
                      <span className={`px-2.5 py-1 rounded-md font-extrabold flex items-center space-x-1 ${
                        isCorrect 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                          : timedOut 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
                        <span>
                          {isCorrect ? `Correct (${item.timeSpent}s)` : timedOut ? 'Timed Out (12.0s)' : `Incorrect (${item.timeSpent}s)`}
                        </span>
                      </span>
                    </div>

                    {q && q.expressions && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {q.expressions.map((expr, exprIdx) => {
                          const userOrder = item.selectedIndices ? item.selectedIndices.indexOf(exprIdx) : -1;
                          const hasUserOrder = userOrder !== -1;

                          return (
                            <div key={exprIdx} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center space-x-3 text-xs">
                              <span className={`w-6 h-6 rounded-full font-black flex items-center justify-center text-xs ${
                                hasUserOrder ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                              }`}>
                                {hasUserOrder ? userOrder + 1 : '-'}
                              </span>
                              
                              <div className="flex-1">
                                <div 
                                  className="font-bold text-slate-900 dark:text-slate-100" 
                                  dangerouslySetInnerHTML={{ __html: expr.html }} 
                                />
                                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
                                  Val: {expr.value.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-brand-400" />
            <span>Practice Quick Math Again</span>
          </button>

          <button
            onClick={() => navigateTo('landing')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <Home className="w-4 h-4 text-slate-600" />
            <span>Main Menu</span>
          </button>

          <button
            onClick={exportJSON}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export JSON Result</span>
          </button>
        </div>

        {/* MODAL: Quick Mental Math Tricks */}
        {showTricksModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-amber-400 font-extrabold">
                  <Lightbulb className="w-5 h-5" />
                  <h3>Accenture Mental Math Shortcuts</h3>
                </div>
                <button onClick={() => setShowTricksModal(false)} className="text-slate-400 hover:text-white font-bold text-base">&times;</button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-extrabold text-brand-400 text-sm">Trick 1: Negative vs Zero vs Positive Filter</div>
                  <p>Do NOT calculate exact numbers if signs differ! Negative numbers are ALWAYS lowest, 0 is middle, positive is highest.</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-extrabold text-brand-400 text-sm">Trick 2: 0.5 Fraction Benchmark</div>
                  <p>Don't cross-multiply! Compare against 0.5: 1/9 &lt; 3/7 (just under 0.5) &lt; 5/6 (almost 1.0).</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-extrabold text-brand-400 text-sm">Trick 3: Decimal Tenths Truncation</div>
                  <p>Ignore digits far after the decimal point. Look only at the first digit after decimal (e.g. 0.098 &lt; 0.345 &lt; 0.41).</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-extrabold text-brand-400 text-sm">Trick 4: Butterfly Cross-Multiplication</div>
                  <p>To compare a/b vs c/d, multiply a &times; d vs b &times; c for instant 2-second comparison.</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowTricksModal(false)}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md transition-all"
                >
                  Got it, let's practice!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER GAME 2: PATH FINDER (3×3 GRID PATH BUILDER)
  // ----------------------------------------------------
  if (currentGameType === 'path-finder') {
    const isCorrect = lastResult?.isCorrect ?? (lastResult?.accuracy === 100);
    const rotationCount = lastResult?.rotationCount || 0;
    const minimumRotations = lastResult?.minimumRotations || 4;
    const efficiencyScore = lastResult?.efficiencyScore || Math.max(20, Math.round(100 - Math.max(0, rotationCount - minimumRotations) * 15));
    const timeSpent = lastResult?.timeSpent || 45.0;

    const isShortlisted = isCorrect && efficiencyScore >= 60;
    const probabilityPercent = isShortlisted 
      ? Math.min(95, Math.round(70 + (efficiencyScore / 100) * 25))
      : Math.max(15, Math.round((efficiencyScore / 100) * 45));

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn font-sans">
        
        {/* Brand Navigation Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl border border-slate-800">
          <div>
            <div className="text-xs font-black tracking-widest text-indigo-400 uppercase">
              ACCENTURE <span className="text-white">PATH FINDER</span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-200">
              Spatial Reasoning Assessment Simulator & Shortlist Predictor
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/50 text-xs font-bold text-indigo-300">
              Grid: <strong>3×3 Sub-Block Rotation</strong>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
              🚀 → 🪐
            </span>
          </div>
        </div>

        {/* Shortlist Status Banner */}
        <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-xl relative overflow-hidden transition-all ${
          isShortlisted 
            ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-indigo-500/50 text-white'
            : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border-rose-500/50 text-white'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isShortlisted ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                <Compass className="w-3.5 h-3.5" />
                <span>{isShortlisted ? 'SPATIAL MASTERY ACHIEVED' : 'PATHWAY INCOMPLETE / UNOPTIMIZED'}</span>
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                SHORTLIST PROBABILITY: <span className={isShortlisted ? 'text-indigo-400' : 'text-rose-400'}>{isShortlisted ? 'HIGH' : 'LOW'}</span>
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {isShortlisted 
                  ? `Successfully constructed a continuous route from Start 🚀 to Destination 🪐 with ${rotationCount} rotations (${efficiencyScore}% path efficiency).`
                  : `Path connection was incomplete or exceeded rotation limits. Standard Accenture threshold requires rapid spatial connectivity.`
                }
              </p>
            </div>

            {/* Selection Chance Badge */}
            <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl text-center flex-shrink-0 min-w-[130px] shadow-2xl">
              <div className={`text-4xl font-black ${isShortlisted ? 'text-indigo-400' : 'text-rose-400'}`}>
                {probabilityPercent}%
              </div>
              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider pt-1">
                Selection Chance
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Route Connectivity</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">{isCorrect ? '✓ Connected' : '✕ Incomplete'}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Rotations & Re-routes</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">{rotationCount} <span className="text-xs text-slate-400 font-normal">/ {minimumRotations} min</span></div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Route Efficiency</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{efficiencyScore}%</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Completion Time</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{timeSpent}s</div>
          </div>
        </div>

        {/* Accenture Assessment Algorithm Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3>Accenture Spatial Reasoning Algorithm Breakdown</h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-100 text-indigo-400 dark:text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
              <p>
                <strong>3×3 Sub-Grid Visualization:</strong> Accenture evaluates spatial agility by testing your ability to mentally manipulate 3×3 blocks and maintain continuous path geometry without altering black path slot constraints.
              </p>
            </div>

            <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-100 text-indigo-400 dark:text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
              <p>
                <strong>Minimal Move Economy:</strong> Path accuracy combined with optimal rotation choices (using minimum required turns) yields maximum spatial evaluation percentile.
              </p>
            </div>

            <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-100 text-indigo-400 dark:text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">3</span>
              <p>
                <strong>Speed & Entry Alignment:</strong> Swiftly aligning 3×3 block arrows from Start (🚀) to Destination (🪐) serves as the primary tie-breaker against identical raw scores.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
            <span>Practice Path Finder Again</span>
          </button>

          <button
            onClick={() => navigateTo('landing')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <Home className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Main Menu</span>
          </button>

          <button
            onClick={exportJSON}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Export JSON Result</span>
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER GAME 3: KEY & DOOR (LOGICAL PLANNING & MEMORY)
  // ----------------------------------------------------
  if (currentGameType === 'key-door') {
    const isCorrect = lastResult?.isCorrect ?? (lastResult?.accuracy === 100);
    const keysCollected = lastResult?.keysCollected || (isCorrect ? 1 : 0);
    const moveCount = lastResult?.moveCount || 0;
    const optimalMoves = lastResult?.optimalMoves || 10;
    const efficiencyScore = lastResult?.efficiencyScore || Math.max(20, Math.round(100 - Math.max(0, moveCount - optimalMoves) * 8));
    const timeSpent = lastResult?.timeSpent || 35.0;

    const isShortlisted = isCorrect && keysCollected === 1;
    const probabilityPercent = isShortlisted 
      ? Math.min(95, Math.round(75 + (efficiencyScore / 100) * 20))
      : Math.max(15, Math.round((efficiencyScore / 100) * 40));

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn font-sans">
        
        {/* Brand Navigation Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl border border-slate-800">
          <div>
            <div className="text-xs font-black tracking-widest text-amber-400 uppercase">
              ACCENTURE <span className="text-white">KEY & DOOR</span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-200">
              Logical Planning & Working Memory Assessment Simulator
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-700/50 text-xs font-bold text-amber-300">
              Keyboard: <strong>Arrow Keys</strong>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
              Obstacles: <strong>Hidden</strong>
            </span>
          </div>
        </div>

        {/* Shortlist Status Banner */}
        <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-xl relative overflow-hidden transition-all ${
          isShortlisted 
            ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 border-amber-500/50 text-white'
            : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border-rose-500/50 text-white'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isShortlisted ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                <Key className="w-3.5 h-3.5" />
                <span>{isShortlisted ? 'LOGICAL MAZE CLEARED' : 'NAVIGATION INCOMPLETE'}</span>
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                SHORTLIST PROBABILITY: <span className={isShortlisted ? 'text-amber-400' : 'text-rose-400'}>{isShortlisted ? 'HIGH' : 'LOW'}</span>
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {isShortlisted 
                  ? `Successfully collected key 🔑 and unlocked the exit door 🚪 in ${moveCount} steps (${efficiencyScore}% route efficiency).`
                  : `Failed to retrieve key prior to exit or trapped by hidden maze obstacles. Sequential planning is required.`
                }
              </p>
            </div>

            {/* Selection Chance Badge */}
            <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl text-center flex-shrink-0 min-w-[130px] shadow-2xl">
              <div className={`text-4xl font-black ${isShortlisted ? 'text-amber-400' : 'text-rose-400'}`}>
                {probabilityPercent}%
              </div>
              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider pt-1">
                Selection Chance
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Key Collection</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">{keysCollected === 1 ? '🔑 Collected' : '✕ Missing'}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <Navigation className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Navigation Moves</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">{moveCount} <span className="text-xs text-slate-400 font-normal">/ {optimalMoves} min</span></div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Working Memory</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{efficiencyScore}%</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Completion Time</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{timeSpent}s</div>
          </div>
        </div>

        {/* Accenture Assessment Algorithm Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3>Accenture Logical Planning Algorithm Breakdown</h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-100 text-amber-400 dark:text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
              <p>
                <strong>Sequential Key Retrieval:</strong> Accenture tests multi-step logical planning by requiring candidates to collect color-matched keys 🔑 prior to attempting door exits 🚪.
              </p>
            </div>

            <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-100 text-amber-400 dark:text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
              <p>
                <strong>Invisible Obstacle Memory:</strong> Hidden wall collisions reset position back to start (👤). Remembering obstacle locations without visual markers evaluates short-term spatial working memory.
              </p>
            </div>

            <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-100 text-amber-400 dark:text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">3</span>
              <p>
                <strong>Step Economy & Path Directness:</strong> Minimizing unnecessary steps and avoiding backtracking reflects high executive function and spatial memory retention.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-amber-400 dark:text-amber-600" />
            <span>Practice Key & Door Again</span>
          </button>

          <button
            onClick={() => navigateTo('landing')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <Home className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Main Menu</span>
          </button>

          <button
            onClick={exportJSON}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Export JSON Result</span>
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER GAME 4: FULL MOCK ASSESSMENT SUMMARY
  // ----------------------------------------------------
  const mockDetails = lastResult?.details || {};
  const mockAvgAccuracy = lastResult?.accuracy || 0;
  const isMockShortlisted = mockAvgAccuracy >= 75;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn font-sans">
      
      {/* Brand Navigation Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div>
          <div className="text-xs font-black tracking-widest text-brand-400 uppercase">
            ACCENTURE <span className="text-white">FULL MOCK SIMULATION</span>
          </div>
          <h1 className="text-sm sm:text-base font-extrabold text-slate-200">
            Composite Cognitive Assessment Report
          </h1>
        </div>
      </div>

      {/* Shortlist Status Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-xl relative overflow-hidden transition-all ${
        isMockShortlisted 
          ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/50 text-white'
          : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border-rose-500/50 text-white'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isMockShortlisted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {isMockShortlisted ? <Award className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
              <span>{isMockShortlisted ? 'SHORTLISTED' : 'NOT SHORTLISTED'}</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              OVERALL COMPOSITE SCORE: <span className={isMockShortlisted ? 'text-emerald-400' : 'text-rose-400'}>{mockAvgAccuracy}%</span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {isMockShortlisted 
                ? `Outstanding job! You cleared Accenture's sectional benchmark requirements across Quick Math, Path Finder, and Key & Door.`
                : `Your composite score of ${mockAvgAccuracy}% is below the sectional target. Review individual section scores below and practice focused areas.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* 3 Section Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Quick Math Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Section 1: Quick Math</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {mockDetails.quickMath?.correctCount ?? '-'} / {mockDetails.quickMath?.totalCount ?? 25}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Accuracy: <strong className="text-slate-800 dark:text-slate-200">{mockDetails.quickMath?.accuracy ?? 0}%</strong>
          </div>
        </div>

        {/* Path Finder Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center space-x-1.5">
            <Compass className="w-4 h-4" />
            <span>Section 2: Path Finder</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {mockDetails.pathFinder?.isCorrect ? '✓ Completed' : '✕ Incomplete'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Efficiency: <strong className="text-slate-800 dark:text-slate-200">{mockDetails.pathFinder?.efficiencyScore ?? 0}%</strong>
          </div>
        </div>

        {/* Key & Door Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
            <Key className="w-4 h-4" />
            <span>Section 3: Key & Door</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {mockDetails.keyDoor?.isCorrect ? '✓ Cleared' : '✕ Trapped'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Memory Score: <strong className="text-slate-800 dark:text-slate-200">{mockDetails.keyDoor?.efficiencyScore ?? 0}%</strong>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => startMockAssessment()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-brand-400 dark:text-brand-600" />
          <span>Retake Full Mock Assessment</span>
        </button>

        <button
          onClick={() => navigateTo('landing')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
        >
          <Home className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span>Main Menu</span>
        </button>
      </div>

    </div>
  );
}
