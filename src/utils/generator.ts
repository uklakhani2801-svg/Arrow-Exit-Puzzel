import { ArrowEntity, LevelData, Difficulty, Direction, GameMode } from '../types';

const DIRECTIONS: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

const COLOR_PALETTES = [
  '#FF595E', // Coral Red
  '#FFCA3A', // Vibrant Yellow
  '#8AC926', // Fresh Green
  '#1982C4', // Sky Blue
  '#6A4C93', // Royal Purple
  '#F15BB5', // Hot Pink
  '#00F5D4', // Teal Neon
  '#FF9F1C', // Amber Orange
];

// Helper to check if a cell is on the board
function isValidCell(r: number, c: number, gridSize: number): boolean {
  return r >= 0 && r < gridSize && c >= 0 && c < gridSize;
}

// Get the path from (r,c) to the edge in direction dir (excluding (r,c) itself)
function getExitPath(r: number, c: number, dir: Direction, gridSize: number): { r: number; c: number }[] {
  const path: { r: number; c: number }[] = [];
  let currR = r;
  let currC = c;

  let dr = 0;
  let dc = 0;
  if (dir === 'UP') dr = -1;
  else if (dir === 'DOWN') dr = 1;
  else if (dir === 'LEFT') dc = -1;
  else if (dir === 'RIGHT') dc = 1;

  currR += dr;
  currC += dc;

  while (isValidCell(currR, currC, gridSize)) {
    path.push({ r: currR, c: currC });
    currR += dr;
    currC += dc;
  }

  return path;
}

// Seeded random number generator (Mulberry32)
function createRandom(seed: number) {
  let h = seed | 0;
  if (h === 0) h = 1;
  return function() {
    h = (h + 0x9e3779b9) | 0;
    let z = h;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aa7d);
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
    return ((z ^ (z >>> 15)) >>> 0) / 4294967296;
  };
}

// Deterministic Fisher-Yates shuffle
function shuffle<T>(array: T[], random: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/**
 * Procedural Level Generator:
 * Generates highly interactive, solvable levels by starting from an empty grid
 * and placing arrows in reverse sequence. If we slide them in from the exit path,
 * they are guaranteed to be solvable in reverse order of placement!
 */
export function generateLevel(levelNumber: number, difficulty: Difficulty, mode?: GameMode): LevelData {
  let gridSize = 5;
  let targetArrowsCount = 25;

  if (difficulty === 'EASY') {
    gridSize = 5;
    targetArrowsCount = gridSize * gridSize; // 25
  } else if (difficulty === 'MEDIUM') {
    gridSize = 6;
    targetArrowsCount = gridSize * gridSize; // 36
  } else if (difficulty === 'HARD') {
    gridSize = 7;
    targetArrowsCount = gridSize * gridSize; // 49
  } else if (difficulty === 'EXPERT') {
    gridSize = 8;
    targetArrowsCount = gridSize * gridSize; // 64
  }

  // Offset seed by difficulty to make Easy 1 differ from Medium 1, etc.
  let seed = levelNumber;
  if (difficulty === 'EASY') seed += 10000;
  else if (difficulty === 'MEDIUM') seed += 20000;
  else if (difficulty === 'HARD') seed += 30000;
  else if (difficulty === 'EXPERT') seed += 40000;

  // Add distinct offset based on mode to guarantee completely different levels
  if (mode === 'CHALLENGE') {
    seed += 150000;
  } else if (mode === 'TIME_ATTACK') {
    seed += 250000;
  }

  const random = createRandom(seed);

  // Helper to calculate distance to the edge of the grid
  const distToEdge = (r: number, c: number) => Math.min(r, c, gridSize - 1 - r, gridSize - 1 - c);

  const occupied = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
  const placementSequence: ArrowEntity[] = [];

  let backtracks = 0;
  const maxBacktracks = 5000;

  function solveBacktrack(placedCount: number): boolean {
    if (placedCount === targetArrowsCount) {
      return true;
    }
    if (backtracks > maxBacktracks) {
      return false;
    }

    // Gather all empty cells
    const cells: { r: number; c: number }[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!occupied[r][c]) {
          cells.push({ r, c });
        }
      }
    }

    // Sort cells by distance to edge DESCENDING (most interior cells first)
    // Add some random noise for diversity while keeping the deterministic nature of the seed
    cells.sort((a, b) => {
      const distA = distToEdge(a.r, a.c);
      const distB = distToEdge(b.r, b.c);
      if (distA !== distB) {
        return distB - distA; // Interior cells first
      }
      // Deterministic tie-breaker
      return random() - 0.5;
    });

    for (const cell of cells) {
      const dirs = shuffle(DIRECTIONS, random);
      for (const dir of dirs) {
        // Check if the exit path in dir has any currently placed arrows
        const path = getExitPath(cell.r, cell.c, dir, gridSize);
        let pathIsClear = true;
        for (const p of path) {
          if (occupied[p.r][p.c]) {
            pathIsClear = false;
            break;
          }
        }

        if (pathIsClear) {
          // Place the arrow
          const color = COLOR_PALETTES[placedCount % COLOR_PALETTES.length];
          const arrow: ArrowEntity = {
            id: `arrow_${placedCount}_${Math.floor(random() * 100000)}`,
            r: cell.r,
            c: cell.c,
            dir: dir,
            color: color,
          };

          occupied[cell.r][cell.c] = true;
          placementSequence.push(arrow);

          if (solveBacktrack(placedCount + 1)) {
            return true;
          }

          // Undo placement
          occupied[cell.r][cell.c] = false;
          placementSequence.pop();
          backtracks++;
        }
      }
    }

    return false;
  }

  const success = solveBacktrack(0);

  if (success && placementSequence.length === targetArrowsCount) {
    const solutionSequence = [...placementSequence].reverse().map(a => a.id);
    return {
      levelNumber,
      gridSize,
      difficulty,
      arrows: placementSequence,
      targetMoves: placementSequence.length,
      solutionSequence,
    };
  }

  // If backtracking fails to fill 100% (extremely rare with our heuristic), return a fallback level
  return getFallbackLevel(levelNumber, difficulty);
}

function getFallbackLevel(levelNumber: number, difficulty: Difficulty): LevelData {
  const gridSize = difficulty === 'EASY' ? 5 : difficulty === 'MEDIUM' ? 6 : difficulty === 'HARD' ? 7 : 8;
  const arrows: ArrowEntity[] = [
    { id: 'f1', r: 1, c: 1, dir: 'UP', color: '#FF595E' },
    { id: 'f2', r: 1, c: 2, dir: 'RIGHT', color: '#FFCA3A' },
    { id: 'f3', r: 2, c: 2, dir: 'DOWN', color: '#8AC926' },
    { id: 'f4', r: 2, c: 1, dir: 'LEFT', color: '#1982C4' },
  ];
  return {
    levelNumber,
    gridSize,
    difficulty,
    arrows,
    targetMoves: 4,
    solutionSequence: ['f2', 'f3', 'f4', 'f1'],
  };
}

/**
 * Checks if an arrow can move (exit) from the current board state.
 * Returns the path it will slide along to exit if clear, or null if blocked.
 */
export function getArrowExitPath(arrow: ArrowEntity, allArrows: ArrowEntity[], gridSize: number): { r: number; c: number }[] | null {
  const path = getExitPath(arrow.r, arrow.c, arrow.dir, gridSize);

  // Check if any other arrow is currently in the exit path
  const isBlocked = path.some(p => {
    return allArrows.some(other => other.id !== arrow.id && !other.exiting && other.r === p.r && other.c === p.c);
  });

  if (isBlocked) {
    return null;
  }

  return path;
}

/**
 * Solver / Hint System:
 * Finds a valid arrow that can exit the board right now.
 * It prefers an arrow that is in the ideal solving path or, if none, any arrow that can exit.
 */
export function findNextValidMove(arrows: ArrowEntity[], gridSize: number, solutionSequence: string[]): string | null {
  const activeArrows = arrows.filter(a => !a.exiting);
  if (activeArrows.length === 0) return null;

  // 1. Try to find an arrow in the ideal solution sequence that can exit right now
  for (const id of solutionSequence) {
    const arrow = activeArrows.find(a => a.id === id);
    if (arrow) {
      const exitPath = getArrowExitPath(arrow, activeArrows, gridSize);
      if (exitPath) {
        return arrow.id;
      }
    }
  }

  // 2. If the user deviated or sequence is stale, return the first arrow that can exit
  for (const arrow of activeArrows) {
    const exitPath = getArrowExitPath(arrow, activeArrows, gridSize);
    if (exitPath) {
      return arrow.id;
    }
  }

  return null;
}

/**
 * Dynamic Difficulty calculation:
 * Provides a wavy, engaging progression where the overall difficulty increases as levels go up,
 * but with some levels being slightly easier (breathers) and some harder (boss/peaks).
 */
export function getDynamicDifficulty(lvlNum: number): Difficulty {
  // Level 1, 2, 3: Warmup (Easy)
  if (lvlNum <= 3) return 'EASY';
  // Level 4: Surprise challenge (Medium)
  if (lvlNum === 4) return 'MEDIUM';
  // Level 5, 6, 7, 8: Easy
  if (lvlNum <= 8) return 'EASY';
  // Level 9, 10: Medium
  if (lvlNum <= 10) return 'MEDIUM';

  // Level 11 to 30: Mostly Easy, with Medium challenges on levels ending in 4, 7, 0
  if (lvlNum <= 30) {
    const lastDigit = lvlNum % 10;
    if (lastDigit === 4 || lastDigit === 7 || lastDigit === 0) {
      return 'MEDIUM';
    }
    return 'EASY';
  }

  // Level 31 to 70: Balanced Easy and Medium
  if (lvlNum <= 70) {
    const lastDigit = lvlNum % 10;
    // 0, 3, 6, 9: Easy breathers
    if (lastDigit === 0 || lastDigit === 3 || lastDigit === 6 || lastDigit === 9) {
      return 'EASY';
    }
    return 'MEDIUM';
  }

  // Level 71 to 120: Mostly Medium, with Easy breathers (ending in 5) and Hard peaks (ending in 0, 8)
  if (lvlNum <= 120) {
    const lastDigit = lvlNum % 10;
    if (lastDigit === 5) return 'EASY';
    if (lastDigit === 0 || lastDigit === 8) return 'HARD';
    return 'MEDIUM';
  }

  // Level 121 to 200: Mostly Hard, with Easy breathers (ending in 5) and Medium breathers (ending in 3, 7)
  if (lvlNum <= 200) {
    const lastDigit = lvlNum % 10;
    if (lastDigit === 5) return 'EASY';
    if (lastDigit === 3 || lastDigit === 7) return 'MEDIUM';
    return 'HARD';
  }

  // Level 201 to 300: Mostly Hard & Expert, with Medium breathers (ending in 5)
  if (lvlNum <= 300) {
    const lastDigit = lvlNum % 10;
    if (lastDigit === 5) return 'MEDIUM';
    if (lastDigit === 0 || lastDigit === 4 || lastDigit === 8) return 'EXPERT';
    return 'HARD';
  }

  // Level 301+: Mostly Expert, with Hard (ending in 5) and Medium (ending in 0) breathers
  const lastDigit = lvlNum % 10;
  if (lastDigit === 0) return 'MEDIUM';
  if (lastDigit === 5) return 'HARD';
  return 'EXPERT';
}

/**
 * Challenge Mode Difficulty Curve:
 * Designed to provide a rich mix of Easy, Medium, and Hard right from the beginning,
 * but with a steadily increasing baseline.
 */
export function getChallengeDifficulty(lvlNum: number): Difficulty {
  const remainder = lvlNum % 10;
  
  if (lvlNum <= 5) {
    if (remainder === 1 || remainder === 2) return 'EASY';
    if (remainder === 3 || remainder === 4) return 'MEDIUM';
    return 'HARD';
  }
  
  if (lvlNum <= 25) {
    if (remainder === 1 || remainder === 4 || remainder === 7) return 'EASY';
    if (remainder === 2 || remainder === 5 || remainder === 8) return 'MEDIUM';
    return 'HARD';
  }
  
  if (lvlNum <= 80) {
    if (remainder === 5) return 'EASY';
    if (remainder === 1 || remainder === 3 || remainder === 7 || remainder === 9) return 'MEDIUM';
    if (remainder === 0 || remainder === 4) return 'EXPERT';
    return 'HARD';
  }
  
  if (remainder === 5) return 'MEDIUM';
  if (remainder === 2 || remainder === 4 || remainder === 8 || remainder === 0) return 'EXPERT';
  return 'HARD';
}

/**
 * Time Attack Mode Difficulty Curve:
 * Fast, progressive flow of Easy, Medium, and Hard levels to keep players on their toes.
 */
export function getTimeAttackDifficulty(lvlNum: number): Difficulty {
  if (lvlNum <= 2) return 'EASY';
  if (lvlNum <= 4) return 'MEDIUM';
  if (lvlNum <= 6) return 'EASY';
  if (lvlNum === 7) return 'HARD';
  
  if (lvlNum <= 12) {
    return lvlNum % 2 === 0 ? 'EASY' : 'MEDIUM';
  }
  
  if (lvlNum <= 20) {
    const r = lvlNum % 3;
    if (r === 0) return 'EASY';
    if (r === 1) return 'MEDIUM';
    return 'HARD';
  }
  
  const r = lvlNum % 4;
  if (r === 0) return 'MEDIUM';
  if (r === 1 || r === 2) return 'HARD';
  return 'EXPERT';
}

