/**
 * Path Finder & 3x3 Grid Directed Arrow Path Validator
 * Validates continuous directed route from Start (Rocket 🚀) to Destination (Planet 🪐).
 */

const DIRECTION_OFFSETS = [
  { r: -1, c: 0, socket: 0, opposite: 2, name: 'up' },    // North
  { r: 0, c: 1, socket: 1, opposite: 3, name: 'right' },  // East
  { r: 1, c: 0, socket: 2, opposite: 0, name: 'down' },   // South
  { r: 0, c: -1, socket: 3, opposite: 1, name: 'left' },  // West
];

export function getRotatedSockets(baseSockets, rotation) {
  if (!baseSockets || baseSockets.length !== 4) return [0, 0, 0, 0];
  const rot = (rotation % 4 + 4) % 4;
  const result = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    result[(i + rot) % 4] = baseSockets[i];
  }
  return result;
}

/**
 * Validates directed path connectivity using Breadth-First Search (BFS)
 * Supports both 3x3 Arrow Tracks and Legacy Rotatable Socket Tiles.
 */
export function validatePath(grid, rows, cols, start, destination) {
  if (!grid || rows <= 0 || cols <= 0 || !start || !destination) {
    return { isConnected: false, pathCells: [], visitedCount: 0 };
  }

  const queue = [{ r: start.r, c: start.c, path: [`${start.r},${start.c}`] }];
  const visited = new Set([`${start.r},${start.c}`]);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.r === destination.r && current.c === destination.c) {
      return {
        isConnected: true,
        pathCells: current.path,
        visitedCount: visited.size
      };
    }

    const currentCell = grid[current.r]?.[current.c];
    if (!currentCell) continue;

    // --- CASE 1: 3x3 Arrow Track Grid ---
    if (currentCell.isBlack !== undefined) {
      if (!currentCell.isBlack) continue;

      const symbol = currentCell.symbol;
      let nextDirs = [];

      if (symbol === 'right') nextDirs = [{ r: 0, c: 1 }];
      else if (symbol === 'down') nextDirs = [{ r: 1, c: 0 }];
      else if (symbol === 'left') nextDirs = [{ r: 0, c: -1 }];
      else if (symbol === 'up') nextDirs = [{ r: -1, c: 0 }];
      else {
        // Dot ('dot') or Track ('track'): Connect to any adjacent black cell
        nextDirs = [
          { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: -1, c: 0 }
        ];
      }

      for (const d of nextDirs) {
        const nr = current.r + d.r;
        const nc = current.c + d.c;
        const key = `${nr},${nc}`;

        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (visited.has(key)) continue;

        const nextCell = grid[nr]?.[nc];
        if (nextCell && nextCell.isBlack) {
          visited.add(key);
          queue.push({
            r: nr,
            c: nc,
            path: [...current.path, key]
          });
        }
      }
      continue;
    }

    // --- CASE 2: Legacy Tile Socket Grid ---
    if (currentCell.type === 'blocked') continue;

    const currentSockets = getRotatedSockets(currentCell.baseSockets, currentCell.rotation);

    for (const dir of DIRECTION_OFFSETS) {
      if (!currentSockets[dir.socket]) continue;

      const nr = current.r + dir.r;
      const nc = current.c + dir.c;
      const key = `${nr},${nc}`;

      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited.has(key)) continue;

      const nextTile = grid[nr]?.[nc];
      if (!nextTile || nextTile.type === 'blocked') continue;

      const nextSockets = getRotatedSockets(nextTile.baseSockets, nextTile.rotation);
      if (nextSockets[dir.opposite]) {
        visited.add(key);
        queue.push({
          r: nr,
          c: nc,
          path: [...current.path, key]
        });
      }
    }
  }

  return { isConnected: false, pathCells: [], visitedCount: visited.size };
}
