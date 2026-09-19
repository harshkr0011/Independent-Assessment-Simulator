/**
 * Automated Unit Test Suite for Cognitive Challenge Practice Simulator
 * Execute with: node src/tests/runTests.js
 */

import { generateQuestion } from '../games/quickMath/mathGenerator.js';
import { validatePath } from '../games/pathFinder/pathValidator.js';
import { generatePathPuzzle } from '../games/pathFinder/tileGenerator.js';
import { solveKeyDoorMaze } from '../games/keyDoor/pathSolver.js';
import { generateKeyDoorMaze } from '../games/keyDoor/mazeGenerator.js';
import { calculateGameScore } from '../services/scoringEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASSED: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAILED: ${message}`);
  }
}

console.log('====================================================');
console.log(' RUNNING COGNITIVE CHALLENGE CORE UNIT TEST SUITE');
console.log('====================================================\n');

// 1. Quick Math Engine Tests
console.log('1. Quick Math Generator & Deterministic Sorting:');
for (let lvl = 1; lvl <= 5; lvl++) {
  const q = generateQuestion(lvl, 3);
  assert(q.expressions.length === 3, `Level ${lvl} generates 3 expressions`);
  
  // Verify deterministic ascending order
  const sortedValues = q.targetOrder.map(idx => q.expressions[idx].value);
  let isAscending = true;
  for (let i = 0; i < sortedValues.length - 1; i++) {
    if (sortedValues[i] > sortedValues[i + 1]) isAscending = false;
  }
  assert(isAscending, `Level ${lvl} expressions sorted in strictly ascending order`);
}

// 2. 3x3 Grid Path Builder Connectivity & Generator Solvability Tests
console.log('\n2. 3x3 Grid Path Builder Directed Connectivity & Solvability:');
for (let lvl = 1; lvl <= 4; lvl++) {
  const puzzle = generatePathPuzzle(lvl);
  assert(puzzle.grid.length === puzzle.rows, `Level ${lvl} grid has ${puzzle.rows} rows`);
  
  // Validate that target solution grid configuration is solvable
  const checkSol = validatePath(puzzle.solutionGrid, puzzle.rows, puzzle.cols, puzzle.start, puzzle.destination);
  assert(checkSol.isConnected === true, `Level ${lvl} solution grid connects Rocket to Planet`);
  
  // Validate that scrambled puzzle grid returns boolean result
  const checkScrambled = validatePath(puzzle.grid, puzzle.rows, puzzle.cols, puzzle.start, puzzle.destination);
  assert(typeof checkScrambled.isConnected === 'boolean', `Level ${lvl} scrambled grid BFS validation returns valid result`);
}

// 3. Lock & Key Memory Game Solvability & Solution Path Tests
console.log('\n3. Lock & Key Memory Game Generator & BFS Solution Path:');
for (let lvl = 1; lvl <= 6; lvl++) {
  const maze = generateKeyDoorMaze(lvl);
  const solveCheck = solveKeyDoorMaze(maze.grid, maze.rows, maze.cols, maze.start, maze.exit, maze.keyIds);
  assert(solveCheck.isSolvable === true, `Level ${lvl} maze is solvable`);
  assert(solveCheck.solutionSteps.length > 0, `Level ${lvl} generates non-empty solution path sequence`);
}

// 4. Scoring Engine Tests
console.log('\n4. Scoring Engine Composite Formula Tests:');
const scoreRes = calculateGameScore({
  gameType: 'quick-math',
  correctCount: 20,
  totalCount: 25,
  timeSpent: 200,
  timeLimit: 300,
  streakMax: 8
});
assert(scoreRes.finalScore > 0, 'Scoring engine outputs non-zero weighted score');
assert(scoreRes.accuracyScore === 80, 'Accuracy score calculated correctly (20/25 = 80%)');

console.log('\n====================================================');
console.log(` TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) process.exit(1);
