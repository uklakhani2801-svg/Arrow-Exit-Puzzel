import React from 'react';
import { PlayerProgress, GameMode, ScreenState, Difficulty } from '../types';
import { audioSynth } from '../utils/audio';
import { ArrowLeft, Lock, Star, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface LevelSelectScreenProps {
  progress: PlayerProgress;
  onSetScreen: (screen: ScreenState) => void;
  onSelectLevel: (levelNum: number) => void;
  gameMode: GameMode;
}

const PAGE_SIZE = 24;

export default function LevelSelectScreen({
  progress,
  onSetScreen,
  onSelectLevel,
  gameMode,
}: LevelSelectScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<Difficulty>('EASY');
  const [page, setPage] = React.useState(0);

  // Group level numbers by difficulty
  const getLevelRange = (diff: Difficulty) => {
    switch (diff) {
      case 'EASY':
        return { start: 1, end: 125 };
      case 'MEDIUM':
        return { start: 126, end: 250 };
      case 'HARD':
        return { start: 251, end: 375 };
      case 'EXPERT':
        return { start: 376, end: 500 };
    }
  };

  const { start, end } = getLevelRange(selectedDifficulty);
  const totalLevelsInDiff = end - start + 1;
  const maxPages = Math.ceil(totalLevelsInDiff / PAGE_SIZE);

  const levels = React.useMemo(() => {
    const list = [];
    for (let i = start; i <= end; i++) {
      list.push(i);
    }
    return list;
  }, [start, end]);

  const displayedLevels = React.useMemo(() => {
    const startIdx = page * PAGE_SIZE;
    return levels.slice(startIdx, startIdx + PAGE_SIZE);
  }, [levels, page]);

  // Adjust page if difficulty changes
  React.useEffect(() => {
    setPage(0);
  }, [selectedDifficulty]);

  const handleLevelClick = (levelNum: number, isLocked: boolean) => {
    audioSynth.playClick();
    if (isLocked) {
      audioSynth.playBlock();
      alert(`Level ${levelNum} is locked! Complete preceding levels to unlock it.`);
      return;
    }
    onSelectLevel(levelNum);
  };

  const getThemeClass = () => {
    switch (progress.activeTheme) {
      case 'theme_light':
        return 'from-slate-50 to-slate-100 text-slate-900';
      case 'theme_sunset':
        return 'from-amber-950 to-orange-950 text-amber-50';
      case 'theme_forest':
        return 'from-emerald-950 to-teal-950 text-emerald-50';
      case 'theme_cosmic':
        return 'from-[#03010b] to-[#0c0422] text-indigo-50';
      default:
        return 'from-slate-900 to-slate-950 text-slate-100';
    }
  };

  const getDifficultyTitle = (diff: Difficulty) => {
    switch (diff) {
      case 'EASY': return 'Easy (5x5)';
      case 'MEDIUM': return 'Medium (6x6)';
      case 'HARD': return 'Hard (7x7)';
      case 'EXPERT': return 'Expert (8x8)';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getThemeClass()} flex flex-col justify-between p-5`}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            audioSynth.playClick();
            onSetScreen('MENU');
          }}
          className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-black tracking-tight text-white uppercase leading-none">
            {gameMode === 'CHALLENGE' ? 'Challenge Board' : 'Classic Mode'}
          </h2>
          <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase font-extrabold block mt-0.5">
            Select Your Puzzle
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full py-1 px-3 text-xs font-bold font-mono">
          💰 {progress.coins}
        </div>
      </div>

      {/* Difficulty Category Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-950/40 border border-white/5 p-1 rounded-2xl my-4">
        {(['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as Difficulty[]).map(diff => (
          <button
            key={diff}
            onClick={() => {
              audioSynth.playClick();
              setSelectedDifficulty(diff);
            }}
            className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition ${
              selectedDifficulty === diff
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Grid Header Info */}
      <div className="flex justify-between items-center text-xs text-slate-400 font-medium px-1 mb-2">
        <span>{getDifficultyTitle(selectedDifficulty)} Range</span>
        <span>Page {page + 1} of {maxPages}</span>
      </div>

      {/* Levels Grid Grid */}
      <div className="grid grid-cols-4 gap-3 my-auto max-w-sm w-full mx-auto">
        {displayedLevels.map(levelNum => {
          const isLocked = gameMode === 'CHALLENGE'
            ? levelNum > (progress.unlockedLevelChallenge ?? 1)
            : levelNum > progress.unlockedLevel;
          const stars = gameMode === 'CHALLENGE'
            ? (progress.levelStarsChallenge ?? {})[levelNum] || 0
            : progress.levelStars[levelNum] || 0;

          return (
            <button
              key={levelNum}
              onClick={() => handleLevelClick(levelNum, isLocked)}
              className={`aspect-square rounded-2xl border flex flex-col items-center justify-center relative transition active:scale-95 ${
                isLocked
                  ? 'bg-slate-950/30 border-slate-800/80 text-slate-600'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
              }`}
            >
              <span className={`font-black text-sm ${isLocked ? 'text-slate-600' : 'text-white'}`}>
                {levelNum}
              </span>

              {/* Stars display */}
              {!isLocked && (
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-2.5 w-2.5 ${
                        idx < stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
              )}

              {isLocked && (
                <div className="absolute top-1 right-1 bg-slate-900/60 p-0.5 rounded-md">
                  <Lock className="h-3 w-3 text-slate-500" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center max-w-xs w-full mx-auto mt-6">
        <button
          onClick={() => {
            audioSynth.playClick();
            setPage(prev => Math.max(0, prev - 1));
          }}
          disabled={page === 0}
          className={`p-2.5 rounded-xl border flex items-center justify-center transition ${
            page === 0
              ? 'opacity-35 pointer-events-none'
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-xs font-bold text-slate-400 font-mono">
          Levels {displayedLevels[0]} - {displayedLevels[displayedLevels.length - 1]}
        </span>

        <button
          onClick={() => {
            audioSynth.playClick();
            setPage(prev => Math.min(maxPages - 1, prev + 1));
          }}
          disabled={page === maxPages - 1}
          className={`p-2.5 rounded-xl border flex items-center justify-center transition ${
            page === maxPages - 1
              ? 'opacity-35 pointer-events-none'
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

    </div>
  );
}
