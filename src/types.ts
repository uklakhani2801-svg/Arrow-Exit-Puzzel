export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  r: number;
  c: number;
}

export interface ArrowEntity {
  id: string;
  r: number;
  c: number;
  dir: Direction;
  color: string;
  exiting?: boolean;
  exitDelay?: number;
}

export type GameMode = 'CLASSIC' | 'CHALLENGE' | 'TIME_ATTACK' | 'DAILY';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export interface LevelData {
  levelNumber: number;
  gridSize: number;
  difficulty: Difficulty;
  arrows: ArrowEntity[];
  targetMoves: number;
  solutionSequence: string[]; // arrow IDs in order of valid exit
}

export interface PlayerProgress {
  coins: number;
  unlockedLevel: number;
  levelStars: Record<number, number>; // levelNumber -> 1, 2, or 3
  unlockedLevelChallenge?: number; // independent progression for Challenge Mode
  levelStarsChallenge?: Record<number, number>; // independent stars for Challenge Mode
  activeSkin: string;
  activeTheme: string;
  unlockedSkins: string[];
  unlockedThemes: string[];
  isPremium: boolean;
  highScoreTimeAttack: number;
  dailyStreak: number;
  lastDailyClaim: string; // YYYY-MM-DD
  completedDailyPuzzles: string[]; // YYYY-MM-DD list
  stats: {
    totalArrowsExited: number;
    totalLevelsWon: number;
    totalHintsUsed: number;
    perfectSolves: number;
  };
  achievementsClaimed: string[];
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'SKIN' | 'THEME';
  cost: number;
  previewColor: string;
  description: string;
  isPremiumOnly?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  icon: string;
  getProgress: (progress: PlayerProgress) => { current: number; target: number };
}

export type ScreenState =
  | 'SPLASH'
  | 'MENU'
  | 'LEVEL_SELECT'
  | 'GAMEPLAY'
  | 'DAILY_SELECT';

export type ModalState =
  | 'NONE'
  | 'PAUSE'
  | 'VICTORY'
  | 'GAME_OVER'
  | 'SETTINGS'
  | 'SHOP'
  | 'ACHIEVEMENTS'
  | 'DAILY_REWARDS'
  | 'WATCH_AD'
  | 'TUTORIAL';
