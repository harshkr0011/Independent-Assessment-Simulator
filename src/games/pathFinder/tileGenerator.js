/**
 * 100% Solvable 3x3 Grid Path Builder & Arrow Track Generator
 * Path connects Rocket (🚀) entry on the left edge to Star (🪐) exit on the right edge.
 */

import { getGlobalRng } from '../../services/seedRng.js';
import { validatePath } from './pathValidator.js';

export function getGridDimensions(level = 1) {
  if (level <= 2) return { rows: 6, cols: 6, blockRows: 2, blockCols: 2 };
  return { rows: 9, cols: 9, blockRows: 3, blockCols: 3 };
}

/**
 * Rotates a 3x3 sub-block in grid 90 degrees Clockwise (both positions and arrow directions)
 */
export function rotate3x3Block(grid, blockR, blockC, rows, cols) {
  const nextGrid = grid.map(row => row.map(cell => ({ ...cell })));
  const startR = blockR * 3;
  const startC = blockC * 3;

  // Extract 3x3 sub-grid
  const sub = [];
  for (let r = 0; r < 3; r++) {
    const subRow = [];
    for (let c = 0; c < 3; c++) {
      subRow.push(grid[startR + r][startC + c]);
    }
    sub.push(subRow);
  }

  // Rotate 3x3 sub-grid Clockwise: (r, c) -> (c, 2 - r)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const orig = sub[r][c];
      const targetR = startR + c;
      const targetC = startC + (2 - r);

      let newSymbol = orig.symbol;
      if (orig.symbol === 'right') newSymbol = 'down';
      else if (orig.symbol === 'down') newSymbol = 'left';
      else if (orig.symbol === 'left') newSymbol = 'up';
      else if (orig.symbol === 'up') newSymbol = 'right';

      nextGrid[targetR][targetC] = {
        ...orig,
        r: targetR,
        c: targetC,
        blockR,
        blockC,
        symbol: newSymbol
      };
    }
  }

  return nextGrid;
}

/**
 * Rotates a 3x3 sub-block 90 degrees Counter-Clockwise (Re-route / Undo helper)
 */
export function reroute3x3Block(grid, blockR, blockC, rows, cols) {
  let current = grid;
  for (let i = 0; i < 3; i++) {
    current = rotate3x3Block(current, blockR, blockC, rows, cols);
  }
  return current;
}

/**
 * Procedurally generates a GUARANTEED SOLVABLE 3x3 Grid Path Builder puzzle
 * Path flows from Rocket (🚀) on the left to Star (🪐) on the right.
 */
export function generatePathPuzzle(level = 1, rng = getGlobalRng()) {
  const { rows, cols, blockRows, blockCols } = getGridDimensions(level);

  let attempts = 0;
  while (attempts < 100) {
    attempts++;

    // 1. Initialize grid structure
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          r,
          c,
          blockR: Math.floor(r / 3),
          blockC: Math.floor(c / 3),
          isBlack: false,
          symbol: 'empty',
          isStart: false,
          isDestination: false
        });
      }
      grid.push(row);
    }

    // 2. Rocket entry on left edge (c = 0), Star exit on right edge (c = cols - 1)
    let start = { r: level <= 2 ? 1 : 2, c: 0 };
    let destination = { r: level <= 2 ? 4 : 6, c: cols - 1 };

    grid[start.r][start.c].isStart = true;
    grid[start.r][start.c].isBlack = true;

    grid[destination.r][destination.c].isDestination = true;
    grid[destination.r][destination.c].isBlack = true;

    // 3. Build continuous directed path from Rocket to Star
    const solutionPath = generateDirectedSolutionPath(grid, rows, cols, start, destination, rng);
    if (!solutionPath) continue;

    // 4. Fill empty cells with random decorative track/arrow/dot cells
    fillSubBlocksWithTracks(grid, blockRows, blockCols, rng);

    // Save exact solution grid
    const solutionGrid = grid.map(row => row.map(c => ({ ...c })));

    // Verify solution grid connects Rocket to Star
    const checkSol = validatePath(solutionGrid, rows, cols, start, destination);
    if (!checkSol.isConnected) continue;

    // 5. Scramble grid ONLY using valid 3x3 block rotations (1, 2, or 3 turns)
    let scrambledGrid = solutionGrid.map(row => row.map(c => ({ ...c })));
    let totalRotations = 0;

    for (let bR = 0; bR < blockRows; bR++) {
      for (let bC = 0; bC < blockCols; bC++) {
        const turns = rng.nextInt(1, 3);
        totalRotations += turns;
        for (let i = 0; i < turns; i++) {
          scrambledGrid = rotate3x3Block(scrambledGrid, bR, bC, rows, cols);
        }
      }
    }

    // Ensure scrambled grid is not pre-solved
    const checkScrambled = validatePath(scrambledGrid, rows, cols, start, destination);
    if (checkScrambled.isConnected) continue;

    // 6. Solver verification
    const isSolvable = verifyPuzzleSolvability(scrambledGrid, rows, cols, blockRows, blockCols, start, destination);
    if (!isSolvable) continue;

    return {
      grid: scrambledGrid,
      initialGrid: scrambledGrid.map(row => row.map(c => ({ ...c }))),
      solutionGrid,
      rows,
      cols,
      blockRows,
      blockCols,
      start,
      destination,
      difficulty: level,
      minimumRotations: Math.max(2, totalRotations)
    };
  }

  return createFallback3x3Puzzle(level);
}

function generateDirectedSolutionPath(grid, rows, cols, start, destination, rng) {
  const path = [{ r: start.r, c: start.c }];
  const visited = new Set([`${start.r},${start.c}`]);

  let current = { r: start.r, c: start.c };

  while (current.r !== destination.r || current.c !== destination.c) {
    const neighbors = [];
    const dirs = [
      { r: 0, c: 1, sym: 'right' },
      { r: 1, c: 0, sym: 'down' },
      { r: 0, c: -1, sym: 'left' },
      { r: -1, c: 0, sym: 'up' }
    ];

    for (const d of dirs) {
      const nr = current.r + d.r;
      const nc = current.c + d.c;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(`${nr},${nc}`)) {
        const dist = Math.abs(nr - destination.r) + Math.abs(nc - destination.c);
        neighbors.push({ r: nr, c: nc, dir: d, dist });
      }
    }

    if (neighbors.length === 0) return null;

    neighbors.sort((a, b) => a.dist - b.dist);
    const chosen = rng.next() < 0.85 ? neighbors[0] : rng.choice(neighbors);

    // Set directional arrow in current cell pointing to chosen neighbor
    grid[current.r][current.c].isBlack = true;
    grid[current.r][current.c].symbol = chosen.dir.sym;

    visited.add(`${chosen.r},${chosen.c}`);
    path.push({ r: chosen.r, c: chosen.c });
    current = { r: chosen.r, c: chosen.c };
  }

  // Set destination cell symbol to point right towards the Star icon
  grid[destination.r][destination.c].isBlack = true;
  grid[destination.r][destination.c].symbol = 'right';

  return path;
}

function fillSubBlocksWithTracks(grid, blockRows, blockCols, rng) {
  for (let bR = 0; bR < blockRows; bR++) {
    for (let bC = 0; bC < blockCols; bC++) {
      const startR = bR * 3;
      const startC = bC * 3;

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const cell = grid[startR + r][startC + c];
          if (!cell.isBlack && rng.next() < 0.35) {
            cell.isBlack = true;
            cell.symbol = rng.choice(['right', 'down', 'left', 'up', 'dot', 'track']);
          }
        }
      }
    }
  }
}

function verifyPuzzleSolvability(grid, rows, cols, blockRows, blockCols, start, destination) {
  if (blockRows === 2 && blockCols === 2) {
    return checkRotationCombinations(grid, rows, cols, start, destination, 0);
  }
  return true;
}

function checkRotationCombinations(currentGrid, rows, cols, start, destination, blockIdx) {
  if (blockIdx === 4) {
    const check = validatePath(currentGrid, rows, cols, start, destination);
    return check.isConnected;
  }

  const bR = Math.floor(blockIdx / 2);
  const bC = blockIdx % 2;

  let testGrid = currentGrid;
  for (let rot = 0; rot < 4; rot++) {
    if (checkRotationCombinations(testGrid, rows, cols, start, destination, blockIdx + 1)) {
      return true;
    }
    testGrid = rotate3x3Block(testGrid, bR, bC, rows, cols);
  }

  return false;
}

function createFallback3x3Puzzle(level) {
  const { rows, cols, blockRows, blockCols } = getGridDimensions(level);
  const start = { r: 1, c: 0 };
  const destination = { r: 4, c: 5 };

  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const isStart = (r === start.r && c === start.c);
      const isDest = (r === destination.r && c === destination.c);
      const isPath = (r === 1 && c <= 3) || (c === 3 && r >= 1 && r <= 4) || (r === 4 && c >= 3);

      row.push({
        r, c,
        blockR: Math.floor(r / 3),
        blockC: Math.floor(c / 3),
        isBlack: isPath || isStart || isDest,
        symbol: isStart ? 'right' : isDest ? 'right' : isPath ? 'right' : 'empty',
        isStart,
        isDestination: isDest
      });
    }
    grid.push(row);
  }

  const scrambled = rotate3x3Block(grid, 0, 0, rows, cols);

  return {
    grid: scrambled,
    initialGrid: scrambled.map(row => row.map(c => ({ ...c }))),
    solutionGrid: grid,
    rows, cols, blockRows, blockCols, start, destination,
    difficulty: level, minimumRotations: 4
  };
}
