/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerProgress, ScreenState, ModalState, GameMode, Difficulty } from './types';
import MainMenuScreen from './components/MainMenuScreen';
import LevelSelectScreen from './components/LevelSelectScreen';
import GameplayScreen from './components/GameplayScreen';
import DailySelectScreen from './components/DailySelectScreen';

// Modals
import SettingsModal from './components/SettingsModal';
import TutorialModal from './components/TutorialModal';
import ShopModal from './components/ShopModal';
import AchievementsModal from './components/AchievementsModal';
import DailyRewardsModal from './components/DailyRewardsModal';

import { audioSynth } from './utils/audio';
import { Play, Sparkles } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'arrow_exit_player_progress_v1.1';

const INITIAL_PROGRESS: PlayerProgress = {
  coins: 200, // Gift some coins to start with so they can try the Shop!
  unlockedLevel: 1,
  levelStars: {},
  activeSkin: 'skin_standard',
  activeTheme: 'theme_slate',
  unlockedSkins: ['skin_standard'],
  unlockedThemes: ['theme_slate'],
  isPremium: false,
  highScoreTimeAttack: 0,
  dailyStreak: 0,
  lastDailyClaim: '',
  completedDailyPuzzles: [],
  stats: {
    totalArrowsExited: 0,
    totalLevelsWon: 0,
    totalHintsUsed: 0,
    perfectSolves: 0,
  },
  achievementsClaimed: [],
};

export default function App() {
  const [progress, setProgress] = React.useState<PlayerProgress>(INITIAL_PROGRESS);
  const [screen, setScreen] = React.useState<ScreenState>('SPLASH');
  const [modal, setModal] = React.useState<ModalState>('NONE');
  const [gameMode, setGameMode] = React.useState<GameMode>('CLASSIC');
  
  // Active selected level info
  const [selectedLevelNumber, setSelectedLevelNumber] = React.useState<number>(1);
  const [dailyDateStr, setDailyDateStr] = React.useState<string>('');
  const [dailyDifficulty, setDailyDifficulty] = React.useState<Difficulty>('EASY');

  // Load from local storage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure legacy formats merge correctly
        setProgress({
          ...INITIAL_PROGRESS,
          ...parsed,
          stats: {
            ...INITIAL_PROGRESS.stats,
            ...(parsed.stats || {}),
          }
        });
      }
    } catch (e) {
      console.error('Failed to load progress from localStorage:', e);
    }
  }, []);

  // Save to local storage whenever progress changes
  const updateProgress = (updater: (p: PlayerProgress) => PlayerProgress) => {
    setProgress(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save progress to localStorage:', e);
      }
      return next;
    });
  };

  const resetAllProgress = () => {
    updateProgress(() => INITIAL_PROGRESS);
    alert('Game reset successful! Have fun building your streak again.');
  };

  // Splash screen transition timer
  React.useEffect(() => {
    if (screen === 'SPLASH') {
      const timer = setTimeout(() => {
        setScreen('MENU');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Handle standard level completed
  const handleLevelComplete = (levelNum: number, stars: number, coinsEarned: number) => {
    updateProgress(prev => {
      const next = { ...prev };
      
      // Save stars if higher than before
      const oldStars = next.levelStars[levelNum] || 0;
      if (stars > oldStars) {
        next.levelStars[levelNum] = stars;
      }

      // Unlock next level if they cleared their highest unlocked level
      if (levelNum === prev.unlockedLevel) {
        next.unlockedLevel = levelNum + 1;
      }

      // Award coins
      next.coins += coinsEarned;

      // Update statistics
      next.stats.totalLevelsWon += 1;
      if (stars === 3) {
        next.stats.perfectSolves += 1;
      }

      return next;
    });
  };

  const handleSelectLevel = (levelNum: number) => {
    setSelectedLevelNumber(levelNum);
    setScreen('GAMEPLAY');
  };

  const handleSelectDailyPuzzle = (dateStr: string, difficulty: Difficulty) => {
    setDailyDateStr(dateStr);
    setDailyDifficulty(difficulty);
    setScreen('GAMEPLAY');
  };

  const getThemeClass = () => {
    switch (progress.activeTheme) {
      case 'theme_light':
        return 'bg-slate-50 text-slate-900';
      case 'theme_sunset':
        return 'bg-amber-950 text-amber-50';
      case 'theme_forest':
        return 'bg-emerald-950 text-emerald-50';
      case 'theme_cosmic':
        return 'bg-[#03010b] text-indigo-50';
      case 'theme_cyberpunk':
        return 'bg-slate-950 text-fuchsia-50';
      case 'theme_ocean':
        return 'bg-[#021526] text-cyan-50';
      default:
        return 'bg-slate-900 text-slate-100';
    }
  };

  // Render Screens
  const renderScreen = () => {
    switch (screen) {
      case 'MENU':
        return (
          <MainMenuScreen
            progress={progress}
            onSetScreen={setScreen}
            onSetGameMode={setGameMode}
            onSetModal={setModal}
          />
        );
      case 'LEVEL_SELECT':
        return (
          <LevelSelectScreen
            progress={progress}
            onSetScreen={setScreen}
            onSelectLevel={handleSelectLevel}
            gameMode={gameMode}
          />
        );
      case 'DAILY_SELECT':
        return (
          <DailySelectScreen
            progress={progress}
            onSetScreen={setScreen}
            onSelectDailyPuzzle={handleSelectDailyPuzzle}
          />
        );
      case 'GAMEPLAY':
        return (
          <GameplayScreen
            progress={progress}
            onUpdateProgress={updateProgress}
            onSetScreen={setScreen}
            gameMode={gameMode}
            selectedLevelNumber={selectedLevelNumber}
            dailyDateStr={dailyDateStr}
            dailyDifficulty={dailyDifficulty}
            onLevelComplete={handleLevelComplete}
            onNextLevel={() => setSelectedLevelNumber(prev => prev + 1)}
          />
        );
      case 'SPLASH':
      default:
        return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative">
            
            {/* Visual background grid */}
            <div className="absolute inset-0 opacity-[0.03] grid grid-cols-6 gap-6 rotate-12 scale-150">
              {Array.from({ length: 36 }).map((_, idx) => (
                <span key={idx} className="text-7xl font-black text-white">
                  &rarr;
                </span>
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-sm w-full space-y-6">
              
              {/* Rotating Arrow Badge */}
              <div className="h-20 w-20 rounded-3xl bg-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30 text-white font-black text-4xl rotate-45 animate-bounce">
                <span className="-rotate-45">&rarr;</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
                  Arrow Exit
                </h1>
                <p className="text-xs text-indigo-400 font-mono tracking-widest uppercase font-extrabold">
                  Grid Escape Puzzle
                </p>
              </div>

              {/* Progress loader */}
              <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full animate-[loading-bar_2s_ease-in-out_infinite]"
                     style={{ width: '60%' }} />
              </div>

              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest pt-4">
                Loading Solvable Boards...
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${getThemeClass()} relative font-sans antialiased selection:bg-indigo-500 selection:text-white`}>
      
      {/* Active Screen */}
      {renderScreen()}

      {/* Modal Dialog Overlays */}
      {modal === 'SETTINGS' && (
        <SettingsModal
          progress={progress}
          onUpdateProgress={updateProgress}
          onClose={() => setModal('NONE')}
          onResetProgress={resetAllProgress}
        />
      )}

      {modal === 'TUTORIAL' && (
        <TutorialModal
          onClose={() => setModal('NONE')}
        />
      )}

      {modal === 'SHOP' && (
        <ShopModal
          progress={progress}
          onUpdateProgress={updateProgress}
          onClose={() => setModal('NONE')}
        />
      )}

      {modal === 'ACHIEVEMENTS' && (
        <AchievementsModal
          progress={progress}
          onUpdateProgress={updateProgress}
          onClose={() => setModal('NONE')}
        />
      )}

      {modal === 'DAILY_REWARDS' && (
        <DailyRewardsModal
          progress={progress}
          onUpdateProgress={updateProgress}
          onClose={() => setModal('NONE')}
        />
      )}

    </div>
  );
}
