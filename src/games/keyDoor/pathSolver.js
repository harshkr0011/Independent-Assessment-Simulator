/**
 * Lock & Key Memory Game BFS / State-Space Solvability & Solution Path Generator
 * Computes shortest valid move sequence:
 * e.g. "Up -> Up -> Right -> Up (Get Key) -> Down -> Left -> Down (Exit)"
 */

export function solveKeyDoorMaze(grid, rows, cols, start, exit, requiredKeyIds = ['K1']) {
  if (!grid || !start || !exit) {
    return { isSolvable: false, shortestPathLength: 0, solutionPathText: '', solutionSteps: [] };
  }

  const keyBitMap = {};
  requiredKeyIds.forEach((keyId, idx) => {
    keyBitMap[keyId] = 1 << idx;
  });

  const allKeysMask = (1 << requiredKeyIds.length) - 1;

  // Queue state: { r, c, keysMask, steps, path: [ { dir, note } ] }
  const queue = [{ r: start.r, c: start.c, keysMask: 0, steps: 0, path: [] }];
  const visited = new Set([`${start.r},${start.c},0`]);

  const DIRS = [
    { r: -1, c: 0, name: 'Up' },
    { r: 1, c: 0, name: 'Down' },
    { r: 0, c: -1, name: 'Left' },
    { r: 0, c: 1, name: 'Right' }
  ];

  while (queue.length > 0) {
    const current = queue.shift();

    // Check if reached exit with key collected
    if (current.r === exit.r && current.c === exit.c) {
      const hasAllKeys = (current.keysMask === allKeysMask);
      if (hasAllKeys || requiredKeyIds.length === 0) {
        // Format solution path string
        const formattedPath = current.path.map((item, i) => {
          if (i === current.path.length - 1) return `${item.name} (Exit)`;
          if (item.note) return `${item.name} (${item.note})`;
          return item.name;
        });

        return {
          isSolvable: true,
          shortestPathLength: current.steps,
          solutionSteps: formattedPath,
          solutionPathText: formattedPath.join(' -> ')
        };
      }
    }

    for (const d of DIRS) {
      const nr = current.r + d.r;
      const nc = current.c + d.c;

      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

      const currentCell = grid[current.r]?.[current.c];
      const targetCell = grid[nr]?.[nc];
      if (!targetCell || targetCell.type === 'wall') continue;

      // Check Directional Door Restrictions (if cell has door direction constraints)
      if (targetCell.type === 'door' && targetCell.allowedDirection) {
        if (targetCell.allowedDirection !== d.name.toLowerCase()) {
          continue; // Blocked: Wrong entrance direction!
        }
      }

      let nextKeysMask = current.keysMask;
      let note = null;

      // Check key pickup
      if (targetCell.type === 'key' && targetCell.keyId) {
        const bit = keyBitMap[targetCell.keyId] || 1;
        if (!(current.keysMask & bit)) {
          nextKeysMask |= bit;
          note = 'Get Key';
        }
      }

      // Check door unlock
      if (targetCell.type === 'door' && targetCell.doorId) {
        const requiredBit = keyBitMap[targetCell.doorId] || 1;
        if (!(current.keysMask & requiredBit)) {
          continue; // Locked door without key
        }
      }

      const stateKey = `${nr},${nc},${nextKeysMask}`;
      if (!visited.has(stateKey)) {
        visited.add(stateKey);
        queue.push({
          r: nr,
          c: nc,
          keysMask: nextKeysMask,
          steps: current.steps + 1,
          path: [...current.path, { name: d.name, note }]
        });
      }
    }
  }

  return { isSolvable: false, shortestPathLength: 0, solutionSteps: [], solutionPathText: '' };
}
