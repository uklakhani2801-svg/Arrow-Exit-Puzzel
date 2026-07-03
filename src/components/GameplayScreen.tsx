import React from 'react';
import { PlayerProgress, GameMode, ScreenState, ArrowEntity, LevelData, Difficulty } from '../types';
import { generateLevel, getArrowExitPath, findNextValidMove, getDynamicDifficulty } from '../utils/generator';
import { audioSynth } from '../utils/audio';
import { 
  ArrowLeft, RotateCcw, Lightbulb, Play, AlertCircle, Timer, 
  HelpCircle, Eye, ChevronRight, Home, Star, Coins, Volume2, VolumeX, Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CreativeArrow, { getLevelArtTheme } from './CreativeArrow';

interface GameplayScreenProps {
  progress: PlayerProgress;
  onUpdateProgress: (updater: (p: PlayerProgress) => PlayerProgress) => void;
  onSetScreen: (screen: ScreenState) => void;
  gameMode: GameMode;
  selectedLevelNumber: number;
  dailyDateStr?: string;
  dailyDifficulty?: Difficulty;
  onLevelComplete: (levelNum: number, stars: number, coinsEarned: number) => void;
  onNextLevel?: () => void;
}

export default function GameplayScreen({
  progress,
  onUpdateProgress,
  onSetScreen,
  gameMode,
  selectedLevelNumber,
  dailyDateStr,
  dailyDifficulty,
  onLevelComplete,
  onNextLevel,
}: GameplayScreenProps) {
  // Level info
  const [levelData, setLevelData] = React.useState<LevelData | null>(null);
  const [activeArrows, setActiveArrows] = React.useState<ArrowEntity[]>([]);
  const [movesCount, setMovesCount] = React.useState(0);
  const [initialArrowsCount, setInitialArrowsCount] = React.useState(0);
  const [lives, setLives] = React.useState(3);

  // Time Attack State
  const [timeRemaining, setTimeRemaining] = React.useState(45);
  const [timeAttackScore, setTimeAttackScore] = React.useState(0);
  const [timeAttackActive, setTimeAttackActive] = React.useState(false);

  // Gameplay helper states
  const [bumpedArrowId, setBumpedArrowId] = React.useState<string | null>(null);
  const [bumpDirection, setBumpDirection] = React.useState<string>('UP');
  const [hintArrowId, setHintArrowId] = React.useState<string | null>(null);
  const [showTutorialTip, setShowTutorialTip] = React.useState(selectedLevelNumber === 1);

  // Modals inside gameplay
  const [victoryModal, setVictoryModal] = React.useState(false);
  const [gameOverModal, setGameOverModal] = React.useState(false);
  const [starsEarned, setStarsEarned] = React.useState(3);

  // Ad simulation states
  const [isWatchingAd, setIsWatchingAd] = React.useState(false);
  const [adCountdown, setAdCountdown] = React.useState(0);

  // Audio state
  const [soundToggle, setSoundToggle] = React.useState(audioSynth.getSfxEnabled());

  // Load level data
  const loadLevel = React.useCallback((lvlNum: number) => {
    let data: LevelData;
    if (gameMode === 'DAILY' && dailyDateStr && dailyDifficulty) {
      // Create a unique integer seed using the full YYYY-MM-DD string (e.g. 20260630)
      const dateSeed = parseInt(dailyDateStr.replace(/-/g, '')) || 1;
      data = generateLevel(dateSeed, dailyDifficulty);
    } else {
      // Classic or Challenge
      const diff: Difficulty = getDynamicDifficulty(lvlNum);
      data = generateLevel(lvlNum, diff);
    }

    setLevelData(data);
    setActiveArrows(data.arrows.map(a => ({ ...a, exiting: false })));
    setMovesCount(0);
    setInitialArrowsCount(data.arrows.length);
    setHintArrowId(null);
    setBumpedArrowId(null);
    setVictoryModal(false);
    setGameOverModal(false);
    setLives(3);
  }, [gameMode, dailyDateStr, dailyDifficulty]);

  // Initial load
  React.useEffect(() => {
    if (gameMode === 'TIME_ATTACK') {
      setTimeRemaining(45);
      setTimeAttackScore(0);
      setTimeAttackActive(true);
      loadLevel(1); // Start from level 1
    } else {
      loadLevel(selectedLevelNumber);
    }
  }, [selectedLevelNumber, loadLevel, gameMode]);

  // Watch Ad Countdown timer loop
  React.useEffect(() => {
    if (!isWatchingAd) return;
    if (adCountdown <= 0) {
      setIsWatchingAd(false);
      setGameOverModal(false);
      
      // Reward continuation: restore lives / time / moves
      setLives(3); // Restore 3 lives!
      
      if (gameMode === 'TIME_ATTACK') {
        setTimeRemaining(prev => prev + 30); // Give 30 more seconds!
      }
      
      if (gameMode === 'CHALLENGE' && levelData) {
        // Reset moves count to 2 moves before allowed limit to give player another chance
        setMovesCount(prev => Math.max(0, levelData.targetMoves - 2));
      }
      
      audioSynth.playVictory();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
      return;
    }

    const timer = setTimeout(() => {
      setAdCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isWatchingAd, adCountdown, gameMode, levelData]);

  const handleWatchAd = () => {
    audioSynth.playClick();
    setAdCountdown(3); // 3-second rapid, fun advertisement simulation
    setIsWatchingAd(true);
  };

  // Time Attack countdown timer loop
  React.useEffect(() => {
    if (gameMode !== 'TIME_ATTACK' || !timeAttackActive || victoryModal || gameOverModal) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          audioSynth.playBlock();
          setGameOverModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode, timeAttackActive, victoryModal, gameOverModal]);

  const handleArrowMove = (arrowId: string) => {
    if (victoryModal || gameOverModal) return;

    const arrow = activeArrows.find(a => a.id === arrowId);
    if (!arrow || arrow.exiting) return;

    setHintArrowId(null); // Clear hint on interaction

    const exitPath = getArrowExitPath(arrow, activeArrows, levelData?.gridSize || 5);

    if (exitPath) {
      // SUCCESS: Slide off board
      audioSynth.playSlide();
      
      // Mark as exiting
      setActiveArrows(prev => prev.map(a => {
        if (a.id === arrowId) {
          return { ...a, exiting: true };
        }
        return a;
      }));

      // Increment moves
      setMovesCount(prev => prev + 1);

      // Perform exit chime and confetti edge effect
      setTimeout(() => {
        audioSynth.playExit();
        
        // Confetti origin calculation
        let xOrigin = 0.5;
        let yOrigin = 0.5;
        if (arrow.dir === 'UP') { xOrigin = 0.5; yOrigin = 0.05; }
        else if (arrow.dir === 'DOWN') { xOrigin = 0.5; yOrigin = 0.95; }
        else if (arrow.dir === 'LEFT') { xOrigin = 0.05; yOrigin = 0.5; }
        else if (arrow.dir === 'RIGHT') { xOrigin = 0.95; yOrigin = 0.5; }

        confetti({
          particleCount: 15,
          spread: 35,
          origin: { x: xOrigin, y: yOrigin },
          colors: [arrow.color, '#FFFFFF', '#FFD700'],
          disableForReducedMotion: true,
        });

        // Completely remove from active list
        setActiveArrows(prev => prev.filter(a => a.id !== arrowId));

        // Check win condition
        const remainingCount = activeArrows.filter(a => a.id !== arrowId).length;
        if (remainingCount === 0) {
          handleVictory();
        }

        // Update stats
        onUpdateProgress(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            totalArrowsExited: prev.stats.totalArrowsExited + 1
          }
        }));

      }, 260); // match transition duration

    } else {
      // BLOCKED: Bump animation
      audioSynth.playBlock();
      setBumpDirection(arrow.dir);
      setBumpedArrowId(arrowId);

      // Add to moves count (wasted move!)
      setMovesCount(prev => prev + 1);

      setTimeout(() => {
        setBumpedArrowId(null);
      }, 250);

      // Deduct a life for a mistake
      setLives(prev => {
        const nextLives = Math.max(0, prev - 1);
        if (nextLives === 0) {
          audioSynth.playBlock();
          setGameOverModal(true);
        }
        return nextLives;
      });

      // Check Challenge Mode loose condition
      if (gameMode === 'CHALLENGE' && levelData) {
        const allowedMoves = levelData.targetMoves + 5;
        if (movesCount + 1 >= allowedMoves) {
          audioSynth.playBlock();
          setGameOverModal(true);
        }
      }
    }
  };

  const handleVictory = () => {
    audioSynth.playVictory();
    
    // Confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Calculate stars rating
    let stars = 1;
    if (movesCount <= initialArrowsCount) {
      stars = 3;
    } else if (movesCount <= initialArrowsCount + 3) {
      stars = 2;
    }
    setStarsEarned(stars);

    // Calculate coins earned
    let coinsReward = 20;
    if (gameMode === 'DAILY') {
      coinsReward = 150; // Daily puzzles are highly rewarding!
    } else if (gameMode === 'TIME_ATTACK') {
      coinsReward = 10; // Rapid small awards
    } else {
      // Classic or Challenge
      if (stars === 3) coinsReward = 35;
      else if (stars === 2) coinsReward = 25;
    }

    setVictoryModal(true);

    if (gameMode === 'TIME_ATTACK') {
      // Add extra time and record score
      setTimeRemaining(prev => Math.min(prev + 12, 90)); // cap at 90s
      setTimeAttackScore(prev => prev + 1);
    } else if (gameMode === 'DAILY' && dailyDateStr) {
      // Record daily completed
      onUpdateProgress(prev => {
        const next = { ...prev };
        next.coins += coinsReward;
        if (!next.completedDailyPuzzles.includes(dailyDateStr)) {
          next.completedDailyPuzzles = [...next.completedDailyPuzzles, dailyDateStr];
        }
        next.stats.totalLevelsWon += 1;
        return next;
      });
    } else {
      // Classic or Challenge mode
      onLevelComplete(selectedLevelNumber, stars, coinsReward);
    }
  };

  // Next level trigger in victory screen
  const nextLevel = () => {
    audioSynth.playClick();
    if (onNextLevel) {
      onNextLevel();
    } else {
      loadLevel(selectedLevelNumber + 1);
    }
  };

  // Trigger hint system
  const triggerHint = () => {
    if (hintArrowId || activeArrows.length === 0 || !levelData) return;

    const hintCost = progress.isPremium ? 0 : 25;

    if (progress.coins < hintCost) {
      audioSynth.playBlock();
      alert(`Hints cost ${hintCost} coins! Solve more levels to earn coins.`);
      return;
    }

    audioSynth.playClick();
    const correctMoveId = findNextValidMove(activeArrows, levelData.gridSize, levelData.solutionSequence);

    if (correctMoveId) {
      setHintArrowId(correctMoveId);
      audioSynth.playBuy();

      // Deduct coins if not premium
      if (hintCost > 0) {
        onUpdateProgress(prev => ({
          ...prev,
          coins: prev.coins - hintCost,
          stats: {
            ...prev.stats,
            totalHintsUsed: prev.stats.totalHintsUsed + 1
          }
        }));
      }
    } else {
      alert('This puzzle state is highly complicated! Try restarting to restore original logic paths.');
    }
  };

  const getThemeColors = () => {
    switch (progress.activeTheme) {
      case 'theme_light':
        return {
          bg: 'bg-slate-50 text-slate-900',
          boardWrapper: 'bg-white shadow-xl border-slate-200/80',
          cell: 'bg-slate-100/50 border-slate-200/30',
          borderAccent: 'border-slate-300',
          hudText: 'text-slate-800',
          accent: 'text-indigo-600',
          btnBg: 'bg-slate-200 hover:bg-slate-300 text-slate-800'
        };
      case 'theme_sunset':
        return {
          bg: 'bg-gradient-to-b from-amber-950 to-orange-950 text-amber-50',
          boardWrapper: 'bg-orange-950/80 border-orange-900/50 shadow-2xl',
          cell: 'bg-orange-950/40 border-orange-900/20',
          borderAccent: 'border-orange-900/40',
          hudText: 'text-amber-200',
          accent: 'text-orange-400',
          btnBg: 'bg-orange-900/35 hover:bg-orange-900/60 text-orange-200'
        };
      case 'theme_forest':
        return {
          bg: 'bg-gradient-to-b from-emerald-950 to-teal-950 text-emerald-50',
          boardWrapper: 'bg-emerald-900/75 border-emerald-800/50 shadow-2xl',
          cell: 'bg-emerald-950/30 border-emerald-900/20',
          borderAccent: 'border-emerald-800/40',
          hudText: 'text-emerald-200',
          accent: 'text-emerald-400',
          btnBg: 'bg-emerald-900/35 hover:bg-emerald-900/60 text-emerald-200'
        };
      case 'theme_cosmic':
        return {
          bg: 'bg-gradient-to-b from-[#03010b] to-[#0a0520] text-indigo-50',
          boardWrapper: 'bg-indigo-950/30 border-indigo-900/40 backdrop-blur-md shadow-2xl shadow-indigo-950/50',
          cell: 'bg-[#060412]/60 border-indigo-950/40',
          borderAccent: 'border-indigo-950/60',
          hudText: 'text-indigo-200',
          accent: 'text-violet-400',
          btnBg: 'bg-indigo-950/40 hover:bg-indigo-950/75 text-indigo-200 border border-indigo-900/30'
        };
      case 'theme_cyberpunk':
        return {
          bg: 'bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-fuchsia-100',
          boardWrapper: 'bg-purple-950/40 border-fuchsia-500/50 shadow-[0_0_20px_rgba(241,87,181,0.25)] backdrop-blur-md',
          cell: 'bg-purple-950/60 border-fuchsia-500/10',
          borderAccent: 'border-fuchsia-500/30',
          hudText: 'text-fuchsia-300',
          accent: 'text-fuchsia-400',
          btnBg: 'bg-fuchsia-500/20 hover:bg-fuchsia-500/40 text-fuchsia-200 border border-fuchsia-500/30'
        };
      case 'theme_ocean':
        return {
          bg: 'bg-gradient-to-b from-[#021526] via-[#032B44] to-[#021526] text-cyan-50',
          boardWrapper: 'bg-[#032B44]/70 border-cyan-500/30 shadow-2xl',
          cell: 'bg-[#021526]/40 border-cyan-500/10',
          borderAccent: 'border-cyan-500/20',
          hudText: 'text-cyan-200',
          accent: 'text-cyan-300',
          btnBg: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 border border-cyan-500/20'
        };
      default: // theme_slate
        return {
          bg: 'bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100',
          boardWrapper: 'bg-slate-800/90 border-slate-700/60 shadow-2xl',
          cell: 'bg-slate-950/40 border-slate-800/40',
          borderAccent: 'border-slate-800/80',
          hudText: 'text-slate-300',
          accent: 'text-cyan-400',
          btnBg: 'bg-slate-800 hover:bg-slate-700 text-slate-100'
        };
    }
  };

  const colors = getThemeColors();
  const size = levelData?.gridSize || 5;

  const toggleSound = () => {
    const s = !soundToggle;
    setSoundToggle(s);
    audioSynth.setSfxEnabled(s);
    audioSynth.playClick();
  };

  const cycleTheme = () => {
    audioSynth.playClick();
    const themes = ['theme_slate', 'theme_light', 'theme_sunset', 'theme_forest', 'theme_cosmic', 'theme_cyberpunk', 'theme_ocean'];
    const currentIndex = themes.indexOf(progress.activeTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    onUpdateProgress(prev => ({
      ...prev,
      activeTheme: nextTheme,
      unlockedThemes: prev.unlockedThemes.includes(nextTheme) 
        ? prev.unlockedThemes 
        : [...prev.unlockedThemes, nextTheme]
    }));
  };

  return (
    <div className={`min-h-screen ${colors.bg} flex flex-col justify-between p-4 relative overflow-hidden select-none`}>
      
      {/* Top HUD Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            audioSynth.playClick();
            onSetScreen('LEVEL_SELECT');
          }}
          className={`p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white transition`}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="text-[10px] opacity-60 font-mono font-bold uppercase tracking-widest">
            {gameMode === 'DAILY' ? 'Daily Puzzle' : gameMode === 'TIME_ATTACK' ? 'Time Attack' : 'Classic Puzzle'}
          </div>
          <h2 className="text-xl font-black text-white">
            {gameMode === 'DAILY' ? 'Today' : gameMode === 'TIME_ATTACK' ? `Streak: ${timeAttackScore}` : `Level ${levelData?.levelNumber}`}
          </h2>
          {levelData && (
            <div className="text-[10px] font-extrabold text-amber-400 font-mono tracking-wide mt-0.5 uppercase">
              ✨ {
                getLevelArtTheme(levelData.levelNumber) === 'MAZE_CLASSIC' ? 'Classic Maze' :
                getLevelArtTheme(levelData.levelNumber) === 'NEON_CIRCUIT' ? 'Cyber Neon Circuit' :
                getLevelArtTheme(levelData.levelNumber) === 'ORGANIC_WAVE' ? 'Organic Wave' :
                getLevelArtTheme(levelData.levelNumber) === 'STEALTH_TECH' ? 'Stealth Tech' :
                '8-Bit Retro Pixel'
              }
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick theme cycle */}
          <button
            onClick={cycleTheme}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition text-amber-400"
            title="Cycle Board Theme"
          >
            <Palette className="h-4 w-4" />
          </button>

          {/* Sound toggle quick control */}
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition text-slate-300"
          >
            {soundToggle ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mode Specific Headers (Timer/Limit counters) */}
      <div className="max-w-sm w-full mx-auto mt-2">
        {gameMode === 'TIME_ATTACK' ? (
          <div className="flex items-center justify-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl py-2 px-4 animate-pulse">
            <Timer className="h-5 w-5" />
            <span className="font-extrabold font-mono text-base">{timeRemaining}s remaining</span>
          </div>
        ) : gameMode === 'CHALLENGE' && levelData ? (
          <div className="flex justify-between items-center bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-2xl py-2 px-4">
            <span className="text-xs font-bold uppercase">Moves Budget</span>
            <span className="font-extrabold font-mono text-base">
              {movesCount} / {levelData.targetMoves + 5}
            </span>
          </div>
        ) : (
          <div className="flex justify-between items-center px-2 text-xs text-slate-400">
            <span className="font-mono">Moves: <strong className="text-white font-black">{movesCount}</strong></span>
            <span className="font-mono">Optimal: <strong className="text-indigo-400 font-black">{levelData?.targetMoves}</strong></span>
          </div>
        )}
      </div>

      {/* Heart Lives Indicator */}
      <div className="flex justify-center items-center gap-2.5 mt-2.5 bg-slate-950/20 border border-white/5 backdrop-blur-sm rounded-2xl py-1.5 px-4 w-fit mx-auto shadow-sm">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lives:</span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((idx) => (
            <span 
              key={idx} 
              className={`text-lg transition-all duration-300 transform inline-block select-none ${
                idx < lives 
                  ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)] scale-110' 
                  : 'text-slate-700/50 scale-90 opacity-40'
              }`}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* The Core Interactive Board */}
      <div className="my-auto flex items-center justify-center">
        <div className="relative w-full max-w-[340px] aspect-square">
          
          {/* Grid Wrapper */}
          <div 
            className={`w-full h-full rounded-3xl p-3 border flex flex-col justify-between transition-all duration-300 ${colors.boardWrapper}`}
          >
            {/* Board Background Cells */}
            <div className="w-full h-full grid gap-1.5 relative overflow-hidden rounded-2xl"
                 style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
              {Array.from({ length: size * size }).map((_, idx) => {
                const r = Math.floor(idx / size);
                const c = idx % size;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border flex items-center justify-center transition-colors ${colors.cell}`}
                  />
                );
              })}

              {/* Absolute Active Arrows Layer */}
              {activeArrows.map(arrow => {
                const rPercent = (arrow.r * 100) / size;
                const cPercent = (arrow.c * 100) / size;
                const widthPercent = 100 / size;

                const isBumped = bumpedArrowId === arrow.id;
                const isHinted = hintArrowId === arrow.id;

                // Animate Slide Out offsets
                let slideX = '0%';
                let slideY = '0%';
                let slideOpacity = 1;
                if (arrow.exiting) {
                  slideOpacity = 0;
                  if (arrow.dir === 'UP') slideY = '-250%';
                  else if (arrow.dir === 'DOWN') slideY = '250%';
                  else if (arrow.dir === 'LEFT') slideX = '-250%';
                  else if (arrow.dir === 'RIGHT') slideX = '250%';
                }

                 return (
                  <div
                    key={arrow.id}
                    onClick={() => handleArrowMove(arrow.id)}
                    className={`absolute p-1 transition-all duration-[350ms] cursor-pointer select-none ${
                      isBumped ? `animate-bump-${bumpDirection}` : ''
                    }`}
                    style={{
                      top: `calc(${rPercent}% + 3px)`,
                      left: `calc(${cPercent}% + 3px)`,
                      width: `calc(${widthPercent}% - 6px)`,
                      height: `calc(${widthPercent}% - 6px)`,
                      transform: `translate(${slideX}, ${slideY})`,
                      opacity: slideOpacity,
                      zIndex: arrow.exiting ? 30 : 10,
                    }}
                  >
                    {/* The Inner Arrow Body: Custom vector maze pathway dynamically styled by level number */}
                    <div
                      className={`w-full h-full rounded-2xl flex items-center justify-center relative select-none hover:scale-[1.05] active:scale-95 transition-all duration-300 bg-slate-950/40 dark:bg-black/55 border border-white/5 shadow-lg ${
                        isHinted ? 'ring-4 ring-yellow-400 animate-pulse scale-[1.05]' : ''
                      }`}
                    >
                      <CreativeArrow
                        id={arrow.id}
                        dir={arrow.dir}
                        color={arrow.color}
                        levelNumber={levelData?.levelNumber || selectedLevelNumber}
                        difficulty={levelData?.difficulty || 'EASY'}
                        isHinted={isHinted}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>

      {/* Control Buttons Row */}
      <div className="max-w-sm w-full mx-auto flex items-center justify-between gap-3 pt-4">
        {/* Restart Button */}
        <button
          onClick={() => {
            audioSynth.playClick();
            if (levelData) loadLevel(levelData.levelNumber);
          }}
          className={`flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-1.5 font-extrabold text-xs transition active:scale-95 ${colors.btnBg}`}
        >
          <RotateCcw className="h-4 w-4" />
          Restart
        </button>

        {/* Hint Trigger */}
        <button
          onClick={triggerHint}
          className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-1.5 font-black text-xs transition active:scale-95 shadow-md shadow-amber-500/10"
        >
          <Lightbulb className="h-4 w-4" />
          Hint {progress.isPremium ? '(Free)' : '(25 💰)'}
        </button>
      </div>

      {/* Tutorial prompt on Level 1 */}
      {showTutorialTip && (
        <div className="fixed bottom-20 left-4 right-4 z-40 bg-indigo-600 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-bounce">
          <div className="flex gap-2.5 items-center">
            <span className="text-xl">💡</span>
            <p className="text-xs font-semibold leading-normal">
              <strong>Tip:</strong> Tap any colored arrow pointing outwards to slide it off the board!
            </p>
          </div>
          <button
            onClick={() => setShowTutorialTip(false)}
            className="text-xs bg-black/20 hover:bg-black/30 text-white px-2.5 py-1 rounded-lg"
          >
            Got it
          </button>
        </div>
      )}

      {/* Victory Celebration Modal */}
      {victoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/30 text-white p-6 text-center space-y-5 animate-scale-in">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center animate-bounce">
                <Star className="h-10 w-10 fill-amber-500" />
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest font-black text-amber-400">
                Puzzle Cleared
              </span>
              <h3 className="text-3xl font-black text-white mt-1">VICTORY!</h3>
            </div>

            {/* Stars evaluation */}
            {gameMode !== 'TIME_ATTACK' && (
              <div className="flex justify-center gap-1.5 py-1">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-8 w-8 ${
                      idx < starsEarned ? 'text-amber-400 fill-amber-400' : 'text-slate-800'
                    } transform hover:scale-110 transition`}
                  />
                ))}
              </div>
            )}

            <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/80">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Completed Moves:</span>
                <span className="font-extrabold text-white">{movesCount} moves</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
                <span>Reward Earnings:</span>
                <span className="font-black text-amber-400 flex items-center gap-1">
                  +{gameMode === 'DAILY' ? 150 : starsEarned === 3 ? 35 : starsEarned === 2 ? 25 : 20} Coins 💰
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  audioSynth.playClick();
                  onSetScreen('LEVEL_SELECT');
                }}
                className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sm font-bold transition active:translate-y-0.5"
              >
                Board List
              </button>
              
              <button
                onClick={nextLevel}
                className="flex-1 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-black transition active:translate-y-0.5 shadow-lg shadow-indigo-500/20"
              >
                Next Puzzle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-red-500/30 text-white p-6 text-center space-y-5 animate-scale-in">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
                <AlertCircle className="h-10 w-10" />
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest font-black text-red-400">
                {gameMode === 'TIME_ATTACK' ? 'Time Ran Out' : lives === 0 ? 'Out of Lives' : 'Out of moves'}
              </span>
              <h3 className="text-3xl font-black text-white mt-1">GAME OVER</h3>
              <p className="text-xs text-slate-400 mt-1.5">
                {gameMode === 'TIME_ATTACK' 
                  ? `You solved ${timeAttackScore} levels in this session!`
                  : lives === 0
                  ? `You ran out of lives! Each collision costs 1 life. Try again to clear the board!`
                  : `You exceeded the allowed move limit for this level!`
                }
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleWatchAd}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 flex items-center justify-center gap-2.5 font-black text-sm transition transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-orange-500/25 border border-amber-300/30 animate-pulse"
              >
                <Play className="h-5 w-5 fill-current" />
                Show Ad & Continue
              </button>
              
              <button
                onClick={() => {
                  audioSynth.playClick();
                  if (levelData) loadLevel(levelData.levelNumber);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 font-bold text-xs transition active:scale-95 border border-slate-700/50"
              >
                <RotateCcw className="h-4 w-4" />
                Restart the Game
              </button>

              <button
                onClick={() => {
                  audioSynth.playClick();
                  onSetScreen('LEVEL_SELECT');
                }}
                className="w-full py-2 px-4 rounded-xl text-[10px] uppercase tracking-wider font-extrabold text-slate-500 hover:text-slate-300 transition"
              >
                Exit to Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive/Simulated Ad Overlay */}
      {isWatchingAd && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/95 p-6 text-white backdrop-blur-md">
          {/* Ad Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-widest font-black text-white/40 border border-white/10 px-2 py-1 rounded">
              Sponsored Advertisement
            </span>
            <div className="bg-amber-500/20 text-amber-300 font-extrabold text-xs px-3 py-1.5 rounded-full border border-amber-500/30">
              Reward Unlocking in <span className="text-white font-black font-mono">{adCountdown}s</span>
            </div>
          </div>

          {/* Ad Content */}
          <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-sm mx-auto flex-1">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-fuchsia-500 to-indigo-500 p-0.5 shadow-2xl animate-pulse">
              <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-3xl">
                🎮
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                Giga Arrow Saga 3D
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                The ultimate 3D puzzle challenge! Swipe, merge, and clear paths. Can you reach Level 99?
              </p>
            </div>

            {/* Fake Gameplay Demo */}
            <div className="w-full bg-slate-900/60 border border-white/10 rounded-2xl p-4 relative overflow-hidden h-36 flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent)]" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center font-black text-xl animate-bounce">
                  ↑
                </div>
                <div className="w-10 h-10 rounded-lg bg-fuchsia-500 flex items-center justify-center font-black text-xl animate-pulse">
                  →
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center font-black text-xl animate-bounce">
                  ←
                </div>
              </div>
              <div className="text-[10px] text-fuchsia-400 font-bold font-mono tracking-wider uppercase mt-4">
                99% of people cannot solve this!
              </div>
            </div>

            {/* Simulated CTA Button */}
            <button
              onClick={() => {
                audioSynth.playClick();
                window.open('https://ai.studio/build', '_blank');
              }}
              className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-widest text-slate-400 hover:text-white uppercase transition"
            >
              Play Now (Ad Demo)
            </button>
          </div>

          {/* Ad Footer */}
          <div className="space-y-4">
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 to-fuchsia-500 h-full transition-all duration-1000"
                style={{ width: `${((3 - adCountdown) / 3) * 100}%` }}
              />
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 font-medium">
                Your game progress is saved. Reward will be automatically claimed when ad completes.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
