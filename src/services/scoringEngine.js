/**
 * Comprehensive Scoring Engine
 * Formula: Final Score = (Accuracy * 0.50) + (Speed * 0.25) + (Efficiency * 0.25)
 */

export function calculateGameScore({
  gameType,
  correctCount = 0,
  totalCount = 1,
  timeSpent = 1,
  timeLimit = 60,
  userMoves = 0,
  optimalMoves = 0,
  userRotations = 0,
  optimalRotations = 0,
  streakMax = 0
}) {
  // 1. Accuracy Component (0 - 100)
  const rawAccuracy = (correctCount / Math.max(1, totalCount)) * 100;
  const accuracyScore = Math.min(100, Math.max(0, Math.round(rawAccuracy)));

  // 2. Speed Component (0 - 100)
  // Higher score for completing under target duration
  let speedScore = 50;
  if (timeSpent > 0 && timeLimit > 0) {
    const timeRatio = timeSpent / timeLimit;
    if (timeRatio <= 0.4) speedScore = 100;
    else if (timeRatio <= 0.7) speedScore = 85;
    else if (timeRatio <= 1.0) speedScore = 70;
    else speedScore = Math.max(20, 70 - Math.round((timeRatio - 1.0) * 50));
  }

  // 3. Efficiency Component (0 - 100)
  let efficiencyScore = 80;
  if (gameType === 'path-finder') {
    if (optimalRotations > 0 && userRotations > 0) {
      const rotRatio = optimalRotations / userRotations;
      efficiencyScore = Math.min(100, Math.max(30, Math.round(rotRatio * 100)));
    } else {
      efficiencyScore = 85;
    }
  } else if (gameType === 'key-door') {
    if (optimalMoves > 0 && userMoves > 0) {
      const moveRatio = optimalMoves / userMoves;
      efficiencyScore = Math.min(100, Math.max(30, Math.round(moveRatio * 100)));
    } else {
      efficiencyScore = 85;
    }
  } else if (gameType === 'quick-math') {
    const streakBonus = Math.min(20, streakMax * 2);
    efficiencyScore = Math.min(100, 80 + streakBonus);
  }

  // 4. Weighted Final Score (Base scale out of 10,000 for standard assessment feel)
  const weightedPercentage = (
    (accuracyScore * 0.50) +
    (speedScore * 0.25) +
    (efficiencyScore * 0.25)
  );

  const finalScore = Math.round(weightedPercentage * 100);

  return {
    finalScore,
    weightedPercentage: Math.round(weightedPercentage),
    accuracyScore,
    speedScore,
    efficiencyScore,
    streakMax
  };
}
