import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService.js';
import { setGlobalSeed } from '../services/seedRng.js';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [activeView, setActiveView] = useState('landing'); // landing | dashboard | selection | instructions | practice | mock | results | dev
  const [activeGame, setActiveGame] = useState(null); // quick-math | path-finder | key-door
  const [activeMode, setActiveMode] = useState('practice'); // practice | mock | daily | endless
  const [difficulty, setDifficulty] = useState(1);
  const [currentSeed, setCurrentSeed] = useState(null);

  // Settings
  const [settings, setSettings] = useState(() => storageService.getSettings());

  // Mock Mode state
  const [mockSectionIndex, setMockSectionIndex] = useState(0); // 0: Quick Math, 1: Path Finder, 2: Key & Door
  const [mockResults, setMockResults] = useState({
    quickMath: null,
    pathFinder: null,
    keyDoor: null
  });

  // Last game result
  const [lastResult, setLastResult] = useState(null);

  // Update storage when settings change
  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  // Handle seed from query param (e.g. ?seed=12345)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const seedParam = urlParams.get('seed');
      if (seedParam) {
        setCurrentSeed(seedParam);
        setGlobalSeed(seedParam);
      }
    }
  }, []);

  const navigateTo = (view, gameId = null) => {
    if (gameId) setActiveGame(gameId);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startPracticeGame = (gameId, level = 1) => {
    setActiveGame(gameId);
    setDifficulty(level);
    setActiveMode('practice');
    setActiveView('practice');
  };

  const startMockAssessment = (customSeed = null) => {
    const seed = customSeed || Math.floor(Math.random() * 1000000).toString();
    setCurrentSeed(seed);
    setGlobalSeed(seed);
    setActiveMode('mock');
    setMockSectionIndex(0);
    setMockResults({ quickMath: null, pathFinder: null, keyDoor: null });
    setActiveGame('quick-math');
    setActiveView('mock');
  };

  const recordMockSectionResult = (sectionGameId, resultData) => {
    const updated = { ...mockResults, [sectionGameId]: resultData };
    setMockResults(updated);

    if (mockSectionIndex < 2) {
      // Advance to next section (0 -> 1: path-finder, 1 -> 2: key-door)
      const nextIndex = mockSectionIndex + 1;
      const nextGame = nextIndex === 1 ? 'path-finder' : 'key-door';
      setMockSectionIndex(nextIndex);
      setActiveGame(nextGame);
    } else {
      // Completed all 3 sections!
      const totalScore = (updated.quickMath?.score || 0) + (updated.pathFinder?.score || 0) + (updated.keyDoor?.score || 0);
      const avgAccuracy = Math.round(
        ((updated.quickMath?.accuracyScore || 0) + (updated.pathFinder?.accuracyScore || 0) + (updated.keyDoor?.accuracyScore || 0)) / 3
      );

      const mockSummary = {
        game: 'full-mock',
        score: totalScore,
        accuracy: avgAccuracy,
        seed: currentSeed,
        details: updated,
        completedAt: new Date().toISOString()
      };

      storageService.saveAttempt(mockSummary);
      setLastResult(mockSummary);
      setActiveView('results');
    }
  };

  const finishPracticeSession = (resultData) => {
    const saved = storageService.saveAttempt(resultData);
    setLastResult(saved || resultData);
    setActiveView('results');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (settings?.darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings?.darkMode]);

  const toggleSound = () => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  return (
    <GameContext.Provider value={{
      activeView,
      setActiveView,
      activeGame,
      setActiveGame,
      activeMode,
      setActiveMode,
      difficulty,
      setDifficulty,
      currentSeed,
      settings,
      setSettings,
      toggleSound,
      toggleDarkMode,
      navigateTo,
      startPracticeGame,
      startMockAssessment,
      mockSectionIndex,
      mockResults,
      recordMockSectionResult,
      finishPracticeSession,
      lastResult
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGameContext must be used within GameProvider');
  return context;
}
