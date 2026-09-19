import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext.jsx';
import { generateKeyDoorMaze } from './mazeGenerator.js';
import { playSound } from '../../services/audioEngine.js';
import { calculateGameScore } from '../../services/scoringEngine.js';
import AssessmentHeader from '../../components/common/AssessmentHeader.jsx';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import { User, Key, DoorClosed, RotateCcw, Lightbulb, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function KeyDoorGame({ onComplete, isMockMode = false }) {
  const { settings, difficulty } = useGameContext();

  const [activeLevelTab, setActiveLevelTab] = useState(1);
  const [maze, setMaze] = useState(null);
  const [grid, setGrid] = useState([]);
  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 });
  const [hasKey, setHasKey] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [sessionStartTime] = useState(() => Date.now());
  const [toastMessage, setToastMessage] = useState(null);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const totalPuzzles = isMockMode ? 3 : 6;

  useEffect(() => {
    const levelToLoad = isMockMode ? (difficulty + puzzlesCompleted) : activeLevelTab;
    loadLevel(levelToLoad);
  }, [activeLevelTab, difficulty, puzzlesCompleted, isMockMode]);

  const loadLevel = (lvl) => {
    const m = generateKeyDoorMaze(lvl);
    setMaze(m);
    setGrid(m.grid);
    setPlayerPos(m.start);
    setHasKey(false);
    setMoveCount(0);
    setIsCompleted(false);
    setShowSolutionModal(false);
    setToastMessage(null);
  };

  // Strictly enforce Keyboard Navigation (Arrow Keys / WASD)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCompleted || showSolutionModal) return;

      const key = e.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') movePlayer(-1, 0, 'up');
      else if (key === 'arrowdown' || key === 's') movePlayer(1, 0, 'down');
      else if (key === 'arrowleft' || key === 'a') movePlayer(0, -1, 'left');
      else if (key === 'arrowright' || key === 'd') movePlayer(0, 1, 'right');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, grid, hasKey, isCompleted, showSolutionModal]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 1800);
  };

  const movePlayer = (dr, dc, moveDirName) => {
    if (!maze || isCompleted) return;

    const nr = playerPos.r + dr;
    const nc = playerPos.c + dc;

    // Check boundary
    if (nr < 0 || nr >= maze.rows || nc < 0 || nc >= maze.cols) return;

    const targetCell = grid[nr][nc];
    if (!targetCell) return;

    // Check Invisible Obstacle / Wall Collision -> Remains HIDDEN, resets attempt to beginning
    if (targetCell.type === 'wall') {
      playSound('incorrect', settings.soundEnabled);
      setPlayerPos(maze.start);
      setHasKey(false); // Full reset from beginning
      showToast('BLOCKED! Invisible obstacle hit — Restarting from center start (👤)!');
      return;
    }

    // Check Directional / Locked Door Collision
    if (targetCell.type === 'door') {
      const isDirectionBlocked = targetCell.allowedDirection && targetCell.allowedDirection !== moveDirName;
      const isLocked = !hasKey;

      if (isDirectionBlocked || isLocked) {
        playSound('incorrect', settings.soundEnabled);
        setPlayerPos(maze.start);
        setHasKey(false); // Full reset from beginning
        showToast('BLOCKED! Door locked or wrong direction — Restarting from start (👤)!');
        return;
      }
    }

    // Valid Step Move
    setPlayerPos({ r: nr, c: nc });
    setMoveCount(prev => prev + 1);
    playSound('pop', settings.soundEnabled);

    // Check Key Pickup
    if (targetCell.type === 'key' && !hasKey) {
      setHasKey(true);
      playSound('key', settings.soundEnabled);
      showToast('KEY COLLECTED! 🔑 Head to exit door 🚪');
    }

    // Check Exit Reach
    if (targetCell.type === 'exit') {
      if (!hasKey) {
        playSound('incorrect', settings.soundEnabled);
        setPlayerPos(maze.start);
        setHasKey(false);
        showToast('KEY REQUIRED! Collect 🔑 first before exit 🚪');
      } else {
        setIsCompleted(true);
        playSound('success', settings.soundEnabled);

        setTimeout(() => {
          handleNextLevel();
        }, 900);
      }
    }
  };

  const handleNextLevel = () => {
    if (isMockMode) {
      if (puzzlesCompleted + 1 < totalPuzzles) {
        setPuzzlesCompleted(prev => prev + 1);
      } else {
        finishGame(true, moveCount + 1);
      }
    } else {
      if (activeLevelTab < 6) {
        setActiveLevelTab(prev => prev + 1);
      } else {
        finishGame(true, moveCount + 1);
      }
    }
  };

  const handleResetLevel = () => {
    playSound('unselect', settings.soundEnabled);
    const levelToLoad = isMockMode ? (difficulty + puzzlesCompleted) : activeLevelTab;
    loadLevel(levelToLoad);
  };

  const finishGame = (success, finalMoves) => {
    const timeSpent = parseFloat(((Date.now() - sessionStartTime) / 1000).toFixed(1));
    const scoringResult = calculateGameScore({
      gameType: 'key-door',
      correctCount: success ? 1 : 0,
      totalCount: 1,
      timeSpent,
      timeLimit: 240,
      userMoves: finalMoves || moveCount,
      optimalMoves: maze.shortestPathLength
    });

    const summary = {
      game: 'key-door',
      score: scoringResult.finalScore,
      accuracyScore: scoringResult.accuracyScore,
      accuracy: success ? 100 : 0,
      speedRating: scoringResult.speedScore,
      efficiencyScore: scoringResult.efficiencyScore,
      keysCollected: hasKey ? 1 : 0,
      moveCount: finalMoves || moveCount,
      optimalMoves: maze.shortestPathLength,
      timeSpent,
      isCorrect: success
    };

    if (onComplete) onComplete(summary);
  };

  if (!maze) return <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">Generating Lock & Key Memory Game...</div>;

  const levelTabs = [
    { level: 1, label: 'Level 1 (4x4)' },
    { level: 2, label: 'Level 2 (5x5)' },
    { level: 3, label: 'Level 3 (6x6)' },
    { level: 4, label: 'Level 4 (6x6)' },
    { level: 5, label: 'Level 5 (7x7)' },
    { level: 6, label: 'Level 6 (8x8)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fadeIn px-2 sm:px-4">
      
      {/* Assessment Header */}
      <AssessmentHeader 
        gameTitle="KEY & DOOR"
        timerSeconds={240}
        onTimerExpire={() => finishGame(false, moveCount)}
        progressText={isMockMode ? `Challenge ${puzzlesCompleted + 1} / ${totalPuzzles}` : `Level ${maze.difficulty} / 6`}
        format="MM:SS"
        resetKey={0}
      />

      {/* Main Title & Subtitle matching reference screenshot */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Lock & Key Memory Game
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
          Memory Maze: Obstacles are INVISIBLE. Hitting an invisible wall restarts your attempt from the dark center square (👤)!
        </p>
      </div>

      {/* Level Selector Tabs */}
      {!isMockMode && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {levelTabs.map(tab => (
            <button
              key={tab.level}
              onClick={() => setActiveLevelTab(tab.level)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeLevelTab === tab.level
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'bg-blue-500 hover:bg-blue-600 text-white opacity-90'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Level Sub-header Info */}
      <div className="text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center space-x-2">
          <span>Level {maze.difficulty} ({maze.rows}x{maze.cols}) - Keys Left: {hasKey ? 0 : 1}</span>
          <span className="text-amber-500">🔑</span>
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Use Keyboard Arrow Keys (⬆️ ⬇️ ⬅️ ➡️)</span>
      </div>

      {/* Main Game Arena Container matching screenshots */}
      <div className="bg-slate-100 dark:bg-slate-900/90 rounded-xl p-4 sm:p-8 flex flex-col items-center space-y-5 relative shadow-inner border border-slate-200 dark:border-slate-800">
        
        {/* Toast Alert Indicator */}
        {toastMessage && (
          <div className="absolute -top-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 px-5 py-2 rounded-full text-xs font-extrabold shadow-2xl animate-pop z-30">
            {toastMessage}
          </div>
        )}

        {/* Central Grid (Obstacles remain INVISIBLE / HIDDEN for pure memory test) */}
        <div 
          className="grid gap-1.5 sm:gap-2 bg-slate-200 dark:bg-slate-950 p-3 rounded-2xl border-2 border-slate-300 dark:border-slate-800 shadow-md select-none"
          style={{ 
            gridTemplateColumns: `repeat(${maze.cols}, minmax(0, 1fr))`,
            width: `${Math.min(380, maze.cols * 64)}px`
          }}
        >
          {grid.map((row, r) => row.map((cell, c) => {
            const isPlayerHere = playerPos.r === r && playerPos.c === c;
            const isCenterStart = maze.start.r === r && maze.start.c === c;
            const isKeyCell = cell.type === 'key';
            const isDoorCell = cell.type === 'door';
            const isExitCell = cell.type === 'exit';

            return (
              <div
                key={`${r}-${c}`}
                className={`relative aspect-square rounded-md flex items-center justify-center select-none transition-all shadow-xs ${
                  isCenterStart
                    ? 'bg-slate-900 dark:bg-slate-800 text-white border-2 border-slate-950 dark:border-slate-700'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Center Start Avatar (👤) when player is not on start */}
                {isCenterStart && !isPlayerHere && (
                  <User className="w-6 h-6 text-purple-400 animate-pulse" />
                )}

                {/* Key Item (🔑) */}
                {isKeyCell && !hasKey && !isPlayerHere && (
                  <span className="text-2xl sm:text-3xl animate-bounce" title="Key">🔑</span>
                )}

                {/* Exit Door Item (🚪) */}
                {isExitCell && !isPlayerHere && (
                  <span className="text-2xl sm:text-3xl" title="Exit Door">🚪</span>
                )}

                {/* Directional Door Indicator */}
                {isDoorCell && !isPlayerHere && (
                  <div className="flex flex-col items-center justify-center">
                    <DoorClosed className="w-5 h-5 text-amber-700 dark:text-amber-500" />
                  </div>
                )}

                {/* Active Player Avatar Token (👤) */}
                {isPlayerHere && (
                  <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-purple-400 flex items-center justify-center text-purple-400 shadow-lg animate-pop">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          }))}
        </div>

        {/* Action Controls matching reference screenshots */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          
          {/* Reset Level Button */}
          <button
            onClick={handleResetLevel}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Level</span>
          </button>

          {/* Show Answer / Solution Path Button */}
          <button
            onClick={() => setShowSolutionModal(true)}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all active:scale-95"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Show Answer / Solution Path</span>
          </button>

        </div>

        {/* Level Complete Success Toast */}
        {isCompleted && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 px-6 py-3 rounded-xl text-sm font-extrabold flex items-center space-x-3 shadow-md animate-pop">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>✓ LEVEL COMPLETE! Loading Next Level...</span>
          </div>
        )}

        {/* Virtual D-Pad for Touch Devices */}
        <div className="flex flex-col items-center space-y-1.5 pt-2">
          <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Keyboard Arrow Keys (⬆️ ⬇️ ⬅️ ➡️) or D-Pad:</div>
          <div className="space-y-1.5">
            <div className="flex justify-center">
              <button onClick={() => movePlayer(-1, 0, 'up')} className="w-11 h-11 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold flex items-center justify-center active:bg-blue-600 shadow-md">
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center space-x-3">
              <button onClick={() => movePlayer(0, -1, 'left')} className="w-11 h-11 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold flex items-center justify-center active:bg-blue-600 shadow-md">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button onClick={() => movePlayer(1, 0, 'down')} className="w-11 h-11 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold flex items-center justify-center active:bg-blue-600 shadow-md">
                <ArrowDown className="w-5 h-5" />
              </button>
              <button onClick={() => movePlayer(0, 1, 'right')} className="w-11 h-11 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold flex items-center justify-center active:bg-blue-600 shadow-md">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Game Rules Card matching reference screenshot */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 max-w-xl text-xs sm:text-sm shadow-xs">
        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Game Rules:</h3>
        <ul className="space-y-2 text-slate-700 dark:text-slate-300 font-medium">
          <li className="flex items-center space-x-2">
            <span className="text-slate-400">&bull;</span>
            <span>Start at the dark center square ( <User className="w-4 h-4 inline text-purple-600 dark:text-purple-400 font-bold" /> ).</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-slate-400">&bull;</span>
            <span>Use Keyboard Arrow Keys (⬆️ ⬇️ ⬅️ ➡️ / WASD) to navigate step-by-step.</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-slate-400">&bull;</span>
            <span>Hitting an invisible obstacle or locked door restarts your attempt from the start square ( 👤 )!</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-slate-400">&bull;</span>
            <span>Collect key 🔑 first, then head to the exit door 🚪 .</span>
          </li>
        </ul>
      </div>

      {/* Solution Path Modal Popup matching reference screenshot Image 2 */}
      {showSolutionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Solution Path Guide</span>
              <h2 className="text-base font-extrabold text-white">
                Solution Path for Level {maze.difficulty}:
              </h2>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs leading-relaxed max-h-56 overflow-y-auto">
              {maze.solutionPathText || 'Up -> Right (Get Key) -> Down -> Left (Exit)'}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSolutionModal(false)}
                className="px-6 py-2 rounded-full bg-purple-200 hover:bg-purple-300 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95"
              >
                OK
              </button>
            </div>

          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showQuitModal}
        title="Quit Lock & Key Practice?"
        message="Your puzzle progress will not be saved."
        onConfirm={() => window.location.reload()}
        onCancel={() => setShowQuitModal(false)}
      />
    </div>
  );
}
