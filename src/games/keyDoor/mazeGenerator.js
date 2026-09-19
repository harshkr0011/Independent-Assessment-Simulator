/**
 * Lock & Key Memory Game Grid Generator
 * Generates 3x3 to 6x6 grids with dark center start square (👤), Key (🔑), Exit Door (🚪),
 * directional doors, hidden wall obstacles, and automated solution path generation.
 */

import { getGlobalRng } from '../../services/seedRng.js';
import { solveKeyDoorMaze } from './pathSolver.js';

export function getMazeConfigForLevel(level = 1) {
  if (level === 1) return { rows: 4, cols: 4, keyIds: ['K1'], wallDensity: 0.20 };
  if (level === 2) return { rows: 5, cols: 5, keyIds: ['K1'], wallDensity: 0.24 };
  if (level === 3) return { rows: 6, cols: 6, keyIds: ['K1'], wallDensity: 0.28 };
  if (level === 4) return { rows: 6, cols: 6, keyIds: ['K1'], wallDensity: 0.32 };
  if (level === 5) return { rows: 7, cols: 7, keyIds: ['K1'], wallDensity: 0.35 };
  return { rows: 8, cols: 8, keyIds: ['K1'], wallDensity: 0.38 }; // Level 6
}

export function generateKeyDoorMaze(level = 1, rng = getGlobalRng()) {
  const { rows, cols, keyIds, wallDensity } = getMazeConfigForLevel(level);

  let attempts = 0;
  while (attempts < 200) {
    attempts++;

    // 1. Initialize empty grid
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push({ r, c, type: 'empty' });
      }
      grid.push(row);
    }

    // 2. Dark Center Start Square (👤)
    const start = { r: Math.floor(rows / 2), c: Math.floor(cols / 2) };
    grid[start.r][start.c] = { r: start.r, c: start.c, type: 'start' };

    // Helper: list available empty cells
    const getEmptyCells = () => {
      const list = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c].type === 'empty') list.push({ r, c });
        }
      }
      return list;
    };

    // 3. Place Exit Door (🚪) at corner/edge cell
    const exitOptions = [
      { r: 0, c: 0 },
      { r: rows - 1, c: 0 },
      { r: 0, c: cols - 1 },
      { r: rows - 1, c: cols - 1 }
    ].filter(p => grid[p.r][p.c].type === 'empty');

    const exit = rng.choice(exitOptions.length > 0 ? exitOptions : getEmptyCells());
    grid[exit.r][exit.c] = { r: exit.r, c: exit.c, type: 'exit', doorId: 'K1' };

    // 4. Place Key (🔑) in distinct cell
    const emptyForKeys = getEmptyCells();
    if (emptyForKeys.length < 2) continue;
    const keyPos = rng.choice(emptyForKeys);
    grid[keyPos.r][keyPos.c] = { r: keyPos.r, c: keyPos.c, type: 'key', keyId: 'K1' };

    // 5. Place Directional / Locked Doors
    if (level >= 2) {
      const emptyForDoors = getEmptyCells();
      if (emptyForDoors.length >= 2) {
        const doorPos = rng.choice(emptyForDoors);
        const allowedDirs = ['up', 'down', 'left', 'right'];
        grid[doorPos.r][doorPos.c] = {
          r: doorPos.r,
          c: doorPos.c,
          type: 'door',
          doorId: 'K1',
          allowedDirection: rng.choice(allowedDirs)
        };
      }
    }

    // 6. Place Hidden Wall Obstacles in white cells
    const wallCount = Math.floor(rows * cols * wallDensity);
    for (let i = 0; i < wallCount; i++) {
      const emptyCells = getEmptyCells();
      if (emptyCells.length < 2) break;
      const wallPos = rng.choice(emptyCells);
      grid[wallPos.r][wallPos.c] = { r: wallPos.r, c: wallPos.c, type: 'wall', isHidden: true };
    }

    // 7. Validate Solvability & Solution Path Text via BFS
    const check = solveKeyDoorMaze(grid, rows, cols, start, exit, keyIds);
    if (check.isSolvable && check.solutionSteps.length > 0) {
      return {
        grid,
        rows,
        cols,
        start,
        exit,
        keyIds,
        difficulty: level,
        shortestPathLength: check.shortestPathLength,
        solutionPathText: check.solutionPathText,
        solutionSteps: check.solutionSteps
      };
    }
  }

  return createFallbackMaze(level);
}

function createFallbackMaze(level) {
  const { rows, cols, keyIds } = getMazeConfigForLevel(level);
  const start = { r: Math.floor(rows / 2), c: Math.floor(cols / 2) };
  const exit = { r: rows - 1, c: 0 };

  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({ r, c, type: 'empty' });
    }
    grid.push(row);
  }

  grid[start.r][start.c] = { r: start.r, c: start.c, type: 'start' };
  grid[exit.r][exit.c] = { r: exit.r, c: exit.c, type: 'exit', doorId: 'K1' };

  grid[0][cols - 1] = { r: 0, c: cols - 1, type: 'key', keyId: 'K1' };

  const check = solveKeyDoorMaze(grid, rows, cols, start, exit, keyIds);

  return {
    grid,
    rows,
    cols,
    start,
    exit,
    keyIds,
    difficulty: level,
    shortestPathLength: check.shortestPathLength || (rows + cols),
    solutionPathText: check.solutionPathText || 'Up -> Right (Get Key) -> Down -> Left (Exit)',
    solutionSteps: check.solutionSteps || ['Up', 'Right (Get Key)', 'Down', 'Left (Exit)']
  };
}
