import { ShopItem, Achievement } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
  // Skins
  {
    id: 'skin_standard',
    name: 'Classic Minimalist',
    type: 'SKIN',
    cost: 0,
    previewColor: '#1982C4',
    description: 'The standard elegant and sharp directional arrows.',
  },
  {
    id: 'skin_rounded',
    name: 'Retro Rounded',
    type: 'SKIN',
    cost: 200,
    previewColor: '#FF595E',
    description: 'Friendly rounded arrow designs with soft edges.',
  },
  {
    id: 'skin_tech',
    name: 'Futuristic Tech',
    type: 'SKIN',
    cost: 450,
    previewColor: '#00F5D4',
    description: 'Sleek tech arrows with dual stripe accents.',
  },
  {
    id: 'skin_glow',
    name: 'Neon Border',
    type: 'SKIN',
    cost: 750,
    previewColor: '#F15BB5',
    description: 'Stunning outline style with extra glowing borders.',
  },

  // Themes
  {
    id: 'theme_slate',
    name: 'Midnight Slate',
    type: 'THEME',
    cost: 0,
    previewColor: '#1E293B',
    description: 'Deep modern dark slate backdrop with vibrant arrow contrasts.',
  },
  {
    id: 'theme_light',
    name: 'Modernist Light',
    type: 'THEME',
    cost: 150,
    previewColor: '#F8FAFC',
    description: 'Clean minimalist off-white aesthetic for high daytime legibility.',
  },
  {
    id: 'theme_sunset',
    name: 'Sunset Horizon',
    type: 'THEME',
    cost: 300,
    previewColor: '#7C2D12',
    description: 'Immersive warm amber, crimson, and terracotta gradients.',
  },
  {
    id: 'theme_forest',
    name: 'Emerald Moss',
    type: 'THEME',
    cost: 450,
    previewColor: '#064E3B',
    description: 'Relaxing evergreen forest background with soft organic shades.',
  },
  {
    id: 'theme_cosmic',
    name: 'Deep Space Sparkle',
    type: 'THEME',
    cost: 800,
    previewColor: '#0F0926',
    description: 'Pitch-black cosmic abyss with stars and rich golden details.',
  },
  {
    id: 'theme_cyberpunk',
    name: 'Cyberpunk Neon',
    type: 'THEME',
    cost: 600,
    previewColor: '#701A75',
    description: 'Vibrant neon fuchsia and electric purple theme with cybernetic grid glows.',
  },
  {
    id: 'theme_ocean',
    name: 'Deep Ocean Abyss',
    type: 'THEME',
    cost: 500,
    previewColor: '#032B44',
    description: 'Sub-aquatic calm turquoise and deep sea navy theme.',
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'clear_first',
    title: 'First Step',
    description: 'Clear your first puzzle level.',
    rewardCoins: 50,
    icon: '🏆',
    getProgress: (progress) => ({
      current: progress.stats.totalLevelsWon >= 1 ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'clear_10',
    title: 'Puzzle Apprentice',
    description: 'Solve 10 puzzle levels.',
    rewardCoins: 150,
    icon: '🧠',
    getProgress: (progress) => ({
      current: Math.min(progress.stats.totalLevelsWon, 10),
      target: 10,
    }),
  },
  {
    id: 'clear_50',
    title: 'Logic Master',
    description: 'Solve 50 puzzle levels.',
    rewardCoins: 400,
    icon: '🔮',
    getProgress: (progress) => ({
      current: Math.min(progress.stats.totalLevelsWon, 50),
      target: 50,
    }),
  },
  {
    id: 'arrows_100',
    title: 'Arrow Popper',
    description: 'Exit 100 arrows from the board.',
    rewardCoins: 100,
    icon: '🏹',
    getProgress: (progress) => ({
      current: Math.min(progress.stats.totalArrowsExited, 100),
      target: 100,
    }),
  },
  {
    id: 'arrows_500',
    title: 'Sky Clearer',
    description: 'Exit 500 arrows from the board.',
    rewardCoins: 300,
    icon: '🌌',
    getProgress: (progress) => ({
      current: Math.min(progress.stats.totalArrowsExited, 500),
      target: 500,
    }),
  },
  {
    id: 'perfect_10',
    title: 'Perfectionist',
    description: 'Solve 10 levels with a perfect 3-star score.',
    rewardCoins: 200,
    icon: '⭐',
    getProgress: (progress) => ({
      current: Math.min(progress.stats.perfectSolves, 10),
      target: 10,
    }),
  },
  {
    id: 'hints_zero',
    title: 'Pure Genius',
    description: 'Reach Level 15 without ever buying a hint.',
    rewardCoins: 250,
    icon: '⚡',
    getProgress: (progress) => ({
      current: progress.stats.totalHintsUsed === 0 && progress.unlockedLevel >= 15 ? 15 : Math.min(progress.unlockedLevel, 14),
      target: 15,
    }),
  },
  {
    id: 'coin_collector',
    title: 'Treasure Hunter',
    description: 'Earn 1,000 lifetime coins.',
    rewardCoins: 200,
    icon: '💰',
    getProgress: (progress) => ({
      current: Math.min(progress.coins, 1000),
      target: 1000,
    }),
  },
];
