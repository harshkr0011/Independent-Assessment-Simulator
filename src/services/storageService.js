/**
 * LocalStorage Service for Cognitive Challenge Practice Simulator
 * Manages attempts, high scores, radar metrics, and user preferences.
 */

const STORAGE_KEYS = {
  ATTEMPTS: 'cognitive_challenge_attempts_v1',
  PERSONAL_BESTS: 'cognitive_challenge_personal_bests_v1',
  SETTINGS: 'cognitive_challenge_settings_v1',
};

const DEFAULT_SETTINGS = {
  soundEnabled: false,
  timerSpeed: 15,
  bubbleMotion: 'floating',
  theme: 'light',
  darkMode: false,
};

const DEFAULT_PERSONAL_BESTS = {
  'quick-math': { bestScore: 0, accuracy: 0, bestTime: 0, attempts: 0 },
  'path-finder': { bestScore: 0, levelsCompleted: 0, averageTime: 0, attempts: 0 },
  'key-door': { bestScore: 0, keysCollected: 0, levelsCompleted: 0, averageTime: 0, attempts: 0 },
  'full-mock': { bestScore: 0, accuracy: 0, attempts: 0 }
};

export const storageService = {
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  },

  getPersonalBests() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERSONAL_BESTS);
      return data ? { ...DEFAULT_PERSONAL_BESTS, ...JSON.parse(data) } : DEFAULT_PERSONAL_BESTS;
    } catch (e) {
      return DEFAULT_PERSONAL_BESTS;
    }
  },

  getAttempts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveAttempt(attemptData) {
    try {
      const attempts = this.getAttempts();
      const newAttempt = {
        id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        completedAt: new Date().toISOString(),
        ...attemptData
      };

      attempts.unshift(newAttempt);
      // Keep recent 50 attempts
      if (attempts.length > 50) attempts.pop();
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));

      // Update Personal Bests
      const pb = this.getPersonalBests();
      const game = attemptData.game;

      if (!pb[game]) {
        pb[game] = { bestScore: 0, attempts: 0 };
      }

      pb[game].attempts = (pb[game].attempts || 0) + 1;
      if (attemptData.score > (pb[game].bestScore || 0)) {
        pb[game].bestScore = attemptData.score;
      }
      if (attemptData.accuracy !== undefined) {
        pb[game].accuracy = Math.max(pb[game].accuracy || 0, attemptData.accuracy);
      }
      if (attemptData.levelsCompleted !== undefined) {
        pb[game].levelsCompleted = Math.max(pb[game].levelsCompleted || 0, attemptData.levelsCompleted);
      }
      if (attemptData.keysCollected !== undefined) {
        pb[game].keysCollected = Math.max(pb[game].keysCollected || 0, attemptData.keysCollected);
      }

      localStorage.setItem(STORAGE_KEYS.PERSONAL_BESTS, JSON.stringify(pb));
      return newAttempt;
    } catch (e) {
      console.warn('Failed to save attempt', e);
      return null;
    }
  },

  getPerformanceMetrics() {
    const attempts = this.getAttempts();
    
    // Compute level-by-level breakdowns
    const levelStats = {
      'quick-math': {},
      'path-finder': {},
      'key-door': {}
    };

    attempts.forEach(a => {
      const g = a.game;
      const lvl = a.difficulty || 1;
      if (levelStats[g]) {
        if (!levelStats[g][lvl]) {
          levelStats[g][lvl] = { attempts: 0, totalScore: 0, totalAccuracy: 0, totalTime: 0, bestScore: 0 };
        }
        levelStats[g][lvl].attempts++;
        levelStats[g][lvl].totalScore += a.score || 0;
        levelStats[g][lvl].totalAccuracy += a.accuracy || 0;
        levelStats[g][lvl].totalTime += a.timeSpent || 0;
        levelStats[g][lvl].bestScore = Math.max(levelStats[g][lvl].bestScore, a.score || 0);
      }
    });

    if (attempts.length === 0) {
      return {
        overallScore: 0,
        speed: 0,
        accuracy: 0,
        spatialReasoning: 0,
        logicalPlanning: 0,
        consistency: 0,
        weakestArea: 'Speed & Accuracy',
        recommendedGame: 'quick-math',
        recentAttempts: [],
        levelStats
      };
    }

    let mathAccSum = 0, mathCount = 0;
    let pathAccSum = 0, pathCount = 0;
    let keyAccSum = 0, keyCount = 0;
    let speedSum = 0;

    attempts.forEach(a => {
      const acc = a.accuracy || (a.isCorrect ? 100 : 70);
      speedSum += a.speedRating || 75;

      if (a.game === 'quick-math') {
        mathAccSum += acc;
        mathCount++;
      } else if (a.game === 'path-finder') {
        pathAccSum += acc;
        pathCount++;
      } else if (a.game === 'key-door') {
        keyAccSum += acc;
        keyCount++;
      }
    });

    const accuracy = mathCount ? Math.round(mathAccSum / mathCount) : 80;
    const spatialReasoning = pathCount ? Math.round(pathAccSum / pathCount) : 72;
    const logicalPlanning = keyCount ? Math.round(keyAccSum / keyCount) : 75;
    const speed = Math.round(speedSum / attempts.length);
    const consistency = Math.min(98, Math.round(80 + Math.min(15, attempts.length * 1.5)));

    const scores = [
      { name: 'Speed', value: speed, game: 'quick-math' },
      { name: 'Accuracy', value: accuracy, game: 'quick-math' },
      { name: 'Spatial Reasoning', value: spatialReasoning, game: 'path-finder' },
      { name: 'Logical Planning', value: logicalPlanning, game: 'key-door' },
    ];

    scores.sort((a, b) => a.value - b.value);
    const weakest = scores[0];

    const overallScore = Math.round(
      accuracy * 0.35 + speed * 0.2 + spatialReasoning * 0.25 + logicalPlanning * 0.20
    );

    return {
      overallScore,
      speed,
      accuracy,
      spatialReasoning,
      logicalPlanning,
      consistency,
      weakestArea: weakest.name,
      recommendedGame: weakest.game,
      recentAttempts: attempts.slice(0, 10),
      levelStats
    };
  },

  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
      localStorage.removeItem(STORAGE_KEYS.PERSONAL_BESTS);
    } catch (e) {}
  }
};
