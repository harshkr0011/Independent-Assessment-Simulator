import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext.jsx';
import { generateTestPaper } from './mathGenerator.js';
import { playSound } from '../../services/audioEngine.js';
import { calculateGameScore } from '../../services/scoringEngine.js';
import AssessmentHeader from '../../components/common/AssessmentHeader.jsx';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import { CheckCircle2, Flame } from 'lucide-react';

export default function QuickMathGame({ onComplete, isMockMode = false }) {
  const { settings, difficulty } = useGameContext();

  const totalQuestions = 25;
  const timerPerQuestion = settings.timerSpeed || (
    difficulty === 1 ? 15 :
    difficulty === 2 ? 12 :
    difficulty === 3 ? 10 :
    difficulty === 4 ? 8 : 6
  );

  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [errorShakeIdx, setErrorShakeIdx] = useState(null);
  const [bubblePositions, setBubblePositions] = useState([]);

  // Initialize test paper
  useEffect(() => {
    const bubbleCount = 3; // 3 randomized 2D bubbles per question
    const paper = generateTestPaper(totalQuestions, difficulty, bubbleCount);
    setQuestions(paper);
    setCurrentQIndex(0);
    setSelectedIndices([]);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setUserAnswers([]);
    setQuestionStartTime(Date.now());
  }, [difficulty, totalQuestions]);

  const currentQ = questions[currentQIndex];

  // Generate randomized non-overlapping 2D positions (x%, y%) per question
  useEffect(() => {
    if (!currentQ) return;
    const count = currentQ.expressions.length;
    const positions = [];

    // Predefined 2D layout slots across the central panel to guarantee zero overlap
    const slotPresets = [
      [ { x: 50, y: 25 }, { x: 25, y: 68 }, { x: 75, y: 68 } ],
      [ { x: 30, y: 35 }, { x: 70, y: 35 }, { x: 50, y: 75 } ],
      [ { x: 25, y: 50 }, { x: 50, y: 25 }, { x: 75, y: 50 } ],
      [ { x: 35, y: 28 }, { x: 65, y: 68 }, { x: 50, y: 48 } ]
    ];

    const chosenPreset = slotPresets[currentQIndex % slotPresets.length];
    for (let i = 0; i < count; i++) {
      positions.push(chosenPreset[i % chosenPreset.length]);
    }

    setBubblePositions(positions);
  }, [currentQIndex, currentQ]);

  const handleBubbleClick = (clickedIdx) => {
    playSound('pop', settings.soundEnabled);

    const pos = selectedIndices.indexOf(clickedIdx);
    if (pos !== -1) {
      // Unselect clicked bubble (misclick recovery)
      const next = [...selectedIndices];
      next.splice(pos, 1);
      setSelectedIndices(next);
      return;
    }

    if (!currentQ) return;
    const nextSelected = [...selectedIndices, clickedIdx];
    setSelectedIndices(nextSelected);

    // Auto submit when all bubbles are selected
    if (nextSelected.length === currentQ.expressions.length) {
      setTimeout(() => {
        submitAnswer(nextSelected, false);
      }, 150);
    }
  };

  const submitAnswer = (userSelected, timedOut = false) => {
    if (!currentQ) return;

    const timeSpent = parseFloat(((Date.now() - questionStartTime) / 1000).toFixed(1));
    let isCorrect = false;

    if (!timedOut && userSelected.length === currentQ.targetOrder.length) {
      isCorrect = userSelected.every((val, idx) => val === currentQ.targetOrder[idx]);
    }

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      playSound('correct', settings.soundEnabled);
    } else {
      setStreak(0);
      playSound('incorrect', settings.soundEnabled);
      setErrorShakeIdx(currentQIndex);
      setTimeout(() => setErrorShakeIdx(null), 400);
    }

    const answerRecord = {
      question: currentQ,
      selectedIndices: userSelected,
      correctIndices: currentQ.targetOrder,
      isCorrect,
      timeSpent,
      timedOut
    };

    const nextAnswers = [...userAnswers, answerRecord];
    setUserAnswers(nextAnswers);

    if (currentQIndex + 1 < totalQuestions) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedIndices([]);
      setQuestionStartTime(Date.now());
    } else {
      finishGame(nextAnswers, isCorrect ? score + 1 : score);
    }
  };

  const handleTimerExpire = () => {
    submitAnswer(selectedIndices, true);
  };

  const finishGame = (finalAnswers, finalScore) => {
    const totalTimeSpent = finalAnswers.reduce((sum, a) => sum + a.timeSpent, 0);
    const avgTime = parseFloat((totalTimeSpent / Math.max(1, totalQuestions)).toFixed(1));

    const scoringResult = calculateGameScore({
      gameType: 'quick-math',
      correctCount: finalScore,
      totalCount: totalQuestions,
      timeSpent: totalTimeSpent,
      timeLimit: totalQuestions * timerPerQuestion,
      streakMax: maxStreak
    });

    const summary = {
      game: 'quick-math',
      score: scoringResult.finalScore,
      accuracyScore: scoringResult.accuracyScore,
      accuracy: Math.round((finalScore / totalQuestions) * 100),
      speedRating: scoringResult.speedScore,
      avgTime,
      correctCount: finalScore,
      totalCount: totalQuestions,
      streakMax: maxStreak,
      answers: finalAnswers
    };

    if (onComplete) onComplete(summary);
  };

  if (!currentQ) {
    return <div className="p-8 text-center text-slate-500 font-medium">Generating mathematical assessment...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-fadeIn">
      
      {/* Assessment Screen Header */}
      <AssessmentHeader 
        gameTitle="QUICK MATH"
        timerSeconds={timerPerQuestion}
        onTimerExpire={handleTimerExpire}
        progressText={`Question ${String(currentQIndex + 1).padStart(2, '0')} / ${totalQuestions}`}
        format="SS"
        resetKey={currentQIndex}
      />

      {/* Objective Banner */}
      <div className="bg-slate-900 text-white rounded-xl px-5 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
          <span>SELECT FROM <strong>LOWEST TO HIGHEST</strong></span>
        </div>
        <div className="flex items-center space-x-3 text-xs font-bold">
          <span className="text-emerald-400 font-mono">Score: {score}</span>
          <span className="text-amber-400 font-mono">Streak: {streak}</span>
        </div>
      </div>

      {/* Central Assessment Panel (2D Random Bubble Canvas) */}
      <div className={`relative bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 min-h-[360px] sm:min-h-[420px] overflow-hidden shadow-xs ${
        errorShakeIdx === currentQIndex ? 'animate-shake border-rose-500' : ''
      }`}>
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-60 pointer-events-none" />

        {/* 2D Random Positioned Bubbles */}
        {currentQ.expressions.map((expr, idx) => {
          const selectedPos = selectedIndices.indexOf(idx);
          const isSelected = selectedPos !== -1;
          const pos = bubblePositions[idx] || { x: 25 + idx * 20, y: 50 };

          return (
            <button
              key={expr.id || idx}
              onClick={() => handleBubbleClick(idx)}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className={`absolute group w-24 h-24 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center text-center p-3 transition-all duration-200 select-none hover:scale-[1.03] active:scale-95 shadow-md ${
                isSelected
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 border-4 border-brand-500 shadow-xl shadow-brand-500/30 scale-105'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border-2 border-slate-300 dark:border-slate-700 hover:border-brand-500 shadow-slate-200 dark:shadow-none'
              }`}
            >
              {/* Selection Order Badge Pill */}
              {isSelected && (
                <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center shadow-md animate-pop">
                  {selectedPos + 1}
                </span>
              )}

              {/* Expression Text */}
              <div 
                className="font-extrabold text-sm sm:text-base tracking-tight leading-snug"
                dangerouslySetInnerHTML={{ __html: expr.html }}
              />
            </button>
          );
        })}
      </div>

      {/* Selected Sequence Slots Footer */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center justify-between space-x-2">
        {currentQ.expressions.map((_, slotIdx) => {
          const selectedBubbleIdx = selectedIndices[slotIdx];
          const isFilled = selectedBubbleIdx !== undefined;
          const expr = isFilled ? currentQ.expressions[selectedBubbleIdx] : null;

          return (
            <div 
              key={slotIdx}
              className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-all ${
                isFilled 
                  ? 'bg-brand-50 border-brand-300 text-brand-900 font-bold' 
                  : 'bg-slate-50 border-dashed border-slate-300 text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                {slotIdx + 1}
              </span>
              <span className="font-mono font-bold text-slate-900">
                {expr ? expr.rawText : '---'}
              </span>
            </div>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={showQuitModal}
        title="Quit Practice?"
        message="Your progress in this practice session will not be saved."
        onConfirm={() => window.location.reload()}
        onCancel={() => setShowQuitModal(false)}
      />
    </div>
  );
}
