import React from 'react';
import { useGameContext } from '../context/GameContext.jsx';
import QuickMathGame from '../games/quickMath/QuickMathGame.jsx';
import PathFinderGame from '../games/pathFinder/PathFinderGame.jsx';
import KeyDoorGame from '../games/keyDoor/KeyDoorGame.jsx';

export default function PracticeGamePage() {
  const { activeGame, finishPracticeSession } = useGameContext();

  const handleGameComplete = (summary) => {
    finishPracticeSession(summary);
  };

  return (
    <div className="py-6 px-4">
      {activeGame === 'quick-math' && <QuickMathGame onComplete={handleGameComplete} isMockMode={false} />}
      {activeGame === 'path-finder' && <PathFinderGame onComplete={handleGameComplete} isMockMode={false} />}
      {activeGame === 'key-door' && <KeyDoorGame onComplete={handleGameComplete} isMockMode={false} />}
    </div>
  );
}
