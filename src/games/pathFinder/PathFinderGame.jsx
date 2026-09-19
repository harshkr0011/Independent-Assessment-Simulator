import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext.jsx';
import { generatePathPuzzle, rotate3x3Block, reroute3x3Block } from './tileGenerator.js';
import { validatePath } from './pathValidator.js';
import { playSound } from '../../services/audioEngine.js';
import { calculateGameScore } from '../../services/scoringEngine.js';
import AssessmentHeader from '../../components/common/AssessmentHeader.jsx';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import { CheckCircle2, RotateCw, ArrowLeftRight, RotateCcw } from 'lucide-react';

export default function PathFinderGame({ onComplete, isMockMode = false }) {
  const { settings, difficulty } = useGameContext();

  const [activeLevelTab, setActiveLevelTab] = useState(1);
  const [puzzle, setPuzzle] = useState(null);
  const [grid, setGrid] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null); // { bR, bC }
  const [actionCount, setActionCount] = useState(0);
  const [validationResult, setValidationResult] = useState({ isConnected: false, pathCells: [] });
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [sessionStartTime] = useState(() => Date.now());
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const totalPuzzles = isMockMode ? 3 : 4;

  useEffect(() => {
    const levelToLoad = isMockMode ? (difficulty + puzzlesCompleted) : activeLevelTab;
    loadPuzzle(levelToLoad);
  }, [activeLevelTab, difficulty, puzzlesCompleted, isMockMode]);

  const loadPuzzle = (lvl) => {
    const p = generatePathPuzzle(lvl);
    setPuzzle(p);
    setGrid(p.grid);
    setSelectedBlock(null);
    setActionCount(0);
    setValidationResult({ isConnected: false, pathCells: [] });
  };

  // Auto-advance to next question/level when path connects Rocket to Star
  useEffect(() => {
    if (validationResult.isConnected) {
      const timer = setTimeout(() => {
        handleNextQuestion();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [validationResult.isConnected]);

  const handleNextQuestion = () => {
    if (isMockMode) {
      if (puzzlesCompleted + 1 < totalPuzzles) {
        setPuzzlesCompleted(prev => prev + 1);
      } else {
        finishGame(true);
      }
    } else {
      if (activeLevelTab < 4) {
        setActiveLevelTab(prev => prev + 1);
      } else {
        finishGame(true);
      }
    }
  };

  const handleCellClick = (r, c) => {
    const bR = Math.floor(r / 3);
    const bC = Math.floor(c / 3);
    setSelectedBlock({ bR, bC });
    playSound('pop', settings.soundEnabled);
  };

  const handleRotate = () => {
    if (!selectedBlock || !puzzle) return;
    playSound('rotate', settings.soundEnabled);
    const next = rotate3x3Block(grid, selectedBlock.bR, selectedBlock.bC, puzzle.rows, puzzle.cols);
    setGrid(next);
    setActionCount(prev => prev + 1);

    // Live validation check
    const check = validatePath(next, puzzle.rows, puzzle.cols, puzzle.start, puzzle.destination);
    setValidationResult(check);
    if (check.isConnected && !validationResult.isConnected) {
      playSound('success', settings.soundEnabled);
    }
  };

  const handleChangeLayout = () => {
    if (!selectedBlock || !puzzle) return;
    playSound('rotate', settings.soundEnabled);
    const next = reroute3x3Block(grid, selectedBlock.bR, selectedBlock.bC, puzzle.rows, puzzle.cols);
    setGrid(next);
    setActionCount(prev => prev + 1);

    // Live validation check
    const check = validatePath(next, puzzle.rows, puzzle.cols, puzzle.start, puzzle.destination);
    setValidationResult(check);
    if (check.isConnected && !validationResult.isConnected) {
      playSound('success', settings.soundEnabled);
    }
  };

  const handleReset = () => {
    playSound('unselect', settings.soundEnabled);
    const levelToLoad = isMockMode ? (difficulty + puzzlesCompleted) : activeLevelTab;
    loadPuzzle(levelToLoad);
  };

  const handleValidate = () => {
    if (!puzzle) return;
    const check = validatePath(grid, puzzle.rows, puzzle.cols, puzzle.start, puzzle.destination);
    setValidationResult(check);

    if (check.isConnected) {
      playSound('success', settings.soundEnabled);
    } else {
      playSound('incorrect', settings.soundEnabled);
    }
  };

  const finishGame = (success) => {
    const timeSpent = parseFloat(((Date.now() - sessionStartTime) / 1000).toFixed(1));
    const scoringResult = calculateGameScore({
      gameType: 'path-finder',
      correctCount: success ? 1 : 0,
      totalCount: 1,
      timeSpent,
      timeLimit: 240,
      userRotations: actionCount,
      optimalRotations: puzzle ? puzzle.minimumRotations : 4
    });

    const summary = {
      game: 'path-finder',
      score: scoringResult.finalScore,
      accuracyScore: scoringResult.accuracyScore,
      accuracy: success ? 100 : 0,
      speedRating: scoringResult.speedScore,
      efficiencyScore: scoringResult.efficiencyScore,
      rotationCount: actionCount,
      minimumRotations: puzzle ? puzzle.minimumRotations : 4,
      timeSpent,
      isCorrect: success
    };

    if (onComplete) onComplete(summary);
  };

  if (!puzzle) {
    return <div className="p-8 text-center text-slate-500 font-medium">Generating 3×3 Grid Path Builder...</div>;
  }

  const levelTabs = [
    { level: 1, label: 'Level 1 (6x6)' },
    { level: 2, label: 'Level 2 (6x6)' },
    { level: 3, label: 'Level 3 (9x9)' },
    { level: 4, label: 'Level 4 (9x9)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fadeIn px-2 sm:px-4">
      
      {/* Assessment Header */}
      <AssessmentHeader 
        gameTitle="PATH MAKER"
        timerSeconds={240}
        onTimerExpire={() => finishGame(false)}
        progressText={isMockMode ? `Challenge ${puzzlesCompleted + 1} / ${totalPuzzles}` : `Level ${puzzle.difficulty} / 4`}
        format="MM:SS"
        resetKey={0}
      />

      {/* Main Title & Subtitle matching reference screens */}
      <div className="text-center space-y-1.5 py-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          3×3 Grid Path Builder
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Select a 3×3 Block. Black cells are path slots; some blocks contain an extra empty black Track cell. 
          Rotate the block or re-route arrows without changing the black-cell positions.
        </p>
      </div>

      {/* Level Selector Tabs */}
      {!isMockMode && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {levelTabs.map(tab => (
            <button
              key={tab.level}
              onClick={() => setActiveLevelTab(tab.level)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                activeLevelTab === tab.level
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 border-slate-900 dark:border-slate-100 shadow-md scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Central Interactive Grid Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 p-4 sm:p-6 flex flex-col items-center space-y-6 shadow-xs transition-colors duration-200">
        
        {/* Main Grid Container with Rocket 🚀 & Star 🪐 Aligned on Entry & Exit Rows */}
        <div className="relative my-2">
          
          {/* Rocket Icon (Start 🚀) aligned with start.r */}
          <div 
            className="absolute -left-10 sm:-left-12 flex items-center justify-center z-10 transition-all duration-300"
            style={{
              top: `${((puzzle.start.r + 0.5) / puzzle.rows) * 100}%`,
              transform: 'translateY(-50%)'
            }}
          >
            <span className="text-2xl sm:text-3xl animate-bounce" title="Start Rocket">🚀</span>
          </div>

          {/* 3x3 Block Grid Board */}
          <div 
            className="grid border-4 border-slate-900 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 shadow-2xl rounded-sm overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))`,
              width: `${Math.min(460, puzzle.cols * 44)}px`
            }}
          >
            {grid.map((row, r) => row.map((cell, c) => {
              const bR = Math.floor(r / 3);
              const bC = Math.floor(c / 3);
              const isSelectedBlock = selectedBlock && selectedBlock.bR === bR && selectedBlock.bC === bC;
              const isConnectedPath = validationResult.pathCells.includes(`${r},${c}`);

              // 3x3 Block demarcation border styling
              const isBlockRightEdge = (c % 3 === 2) && (c !== puzzle.cols - 1);
              const isBlockBottomEdge = (r % 3 === 2) && (r !== puzzle.rows - 1);

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative aspect-square flex items-center justify-center select-none transition-all duration-150 ${
                    cell.isBlack ? 'bg-black text-white dark:bg-slate-950' : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  } ${
                    isBlockRightEdge ? 'border-r-4 border-slate-900 dark:border-slate-700' : 'border-r border-slate-300 dark:border-slate-800'
                  } ${
                    isBlockBottomEdge ? 'border-b-4 border-slate-900 dark:border-slate-700' : 'border-b border-slate-300 dark:border-slate-800'
                  } ${
                    isSelectedBlock 
                      ? 'ring-2 ring-blue-500 ring-inset bg-opacity-90' 
                      : ''
                  }`}
                >
                  {/* Selection Block Tint Highlight */}
                  {isSelectedBlock && (
                    <div className="absolute inset-0 bg-blue-500/15 pointer-events-none" />
                  )}

                  {/* Connected Path Outline */}
                  {isConnectedPath && cell.isBlack && (
                    <div className="absolute inset-0 border-2 border-emerald-400 bg-emerald-500/20 pointer-events-none" />
                  )}

                  {/* Symbol Render */}
                  <CellSymbol symbol={cell.symbol} isBlack={cell.isBlack} isConnected={isConnectedPath} />
                </button>
              );
            }))}
          </div>

          {/* Star / Planet Icon (Destination 🪐) aligned with destination.r */}
          <div 
            className="absolute -right-10 sm:-right-12 flex items-center justify-center z-10 transition-all duration-300"
            style={{
              top: `${((puzzle.destination.r + 0.5) / puzzle.rows) * 100}%`,
              transform: 'translateY(-50%)'
            }}
          >
            <span className="text-2xl sm:text-3xl animate-pulse" title="Destination Star">🪐</span>
          </div>

        </div>

        {/* Selected Block Info Helper */}
        <div className="text-center font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          {selectedBlock ? (
            <span className="text-blue-600 dark:text-blue-400 font-extrabold">
              Selected 3×3 Block ({selectedBlock.bR + 1}, {selectedBlock.bC + 1})
            </span>
          ) : (
            <span className="text-slate-700 dark:text-slate-300">Click any black or white cell to select its 3×3 block.</span>
          )}
        </div>

        {/* Action Controls matching screenshots */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          
          {/* Rotate Button */}
          <button
            onClick={handleRotate}
            disabled={!selectedBlock}
            className={`px-4 py-2.5 rounded-lg border-2 text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all shadow-xs ${
              selectedBlock
                ? 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-800 dark:border-slate-700 hover:border-black active:scale-95'
                : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-300 dark:border-slate-800 cursor-not-allowed'
            }`}
          >
            <RotateCw className="w-4 h-4 text-blue-500" />
            <span>Rotate</span>
          </button>

          {/* Change Layout Button */}
          <button
            onClick={handleChangeLayout}
            disabled={!selectedBlock}
            className={`px-4 py-2.5 rounded-lg border-2 text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all shadow-xs ${
              selectedBlock
                ? 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-800 dark:border-slate-700 hover:border-black active:scale-95'
                : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-300 dark:border-slate-800 cursor-not-allowed'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 text-blue-500" />
            <span>Change Layout</span>
          </button>

          {/* Validate Button */}
          <button
            onClick={handleValidate}
            className="px-5 py-2.5 rounded-lg border-2 border-slate-900 dark:border-slate-700 bg-white hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-xs hover:border-emerald-600 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Validate</span>
          </button>

          {/* Reset Level Button */}
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-lg border-2 border-slate-900 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-xs active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <span>Reset Level</span>
          </button>

        </div>

        {/* Validation Result Toast Banner */}
        {validationResult.isConnected && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 px-6 py-3 rounded-xl text-sm font-extrabold flex items-center space-x-3 shadow-md animate-pop">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>✓ PATH CONNECTED (ROCKET 🚀 &rarr; STAR 🪐)! Loading Next Question...</span>
            <button
              onClick={handleNextQuestion}
              className="ml-4 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
            >
              Next &rarr;
            </button>
          </div>
        )}

        {/* Legend Footer matching reference image */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium text-center border-t border-slate-200 dark:border-slate-800 pt-3 max-w-lg">
          Black = active path &bull; White = inactive &bull; Re-route changes arrow positions/directions only
        </div>

      </div>

      <ConfirmationModal
        isOpen={showQuitModal}
        title="Quit Path Builder Practice?"
        message="Your puzzle progress will not be saved."
        onConfirm={() => window.location.reload()}
        onCancel={() => setShowQuitModal(false)}
      />
    </div>
  );
}

/**
 * Render Vector Symbols (Arrows →, ↓, ←, ↑, Dot •, or Track) inside grid cells
 */
function CellSymbol({ symbol, isBlack, isConnected }) {
  if (!isBlack || symbol === 'empty') return null;

  if (symbol === 'dot') {
    return <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs inline-block" />;
  }

  if (symbol === 'track') {
    return null; // Empty black track cell
  }

  // Directional Arrows
  let rot = 0;
  if (symbol === 'right') rot = 0;
  else if (symbol === 'down') rot = 90;
  else if (symbol === 'left') rot = 180;
  else if (symbol === 'up') rot = 270;

  return (
    <svg 
      viewBox="0 0 24 24" 
      className="w-5 h-5 text-white stroke-current stroke-[3] fill-none transition-transform duration-200"
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
