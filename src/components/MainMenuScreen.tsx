import { PlayerProgress, GameMode, ScreenState } from '../types';
import { audioSynth } from '../utils/audio';
import { Play, Calendar, Trophy, Palette, HelpCircle, Settings, Timer, ShieldAlert, Award } from 'lucide-react';

interface MainMenuScreenProps {
  progress: PlayerProgress;
  onSetScreen: (screen: ScreenState) => void;
  onSetGameMode: (mode: GameMode) => void;
  onSetModal: (modal: any) => void;
  onSelectLevel?: (levelNum: number) => void;
}

export default function MainMenuScreen({
  progress,
  onSetScreen,
  onSetGameMode,
  onSetModal,
  onSelectLevel,
}: MainMenuScreenProps) {

  const selectMode = (mode: GameMode) => {
    audioSynth.playClick();
    onSetGameMode(mode);
    if (mode === 'DAILY') {
      onSetScreen('DAILY_SELECT');
    } else if (mode === 'TIME_ATTACK') {
      if (onSelectLevel) {
        onSelectLevel(1);
      }
      onSetScreen('GAMEPLAY');
    } else {
      onSetScreen('LEVEL_SELECT');
    }
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

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getThemeClass()} flex flex-col justify-between p-6 overflow-hidden`}>
      
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
        <div className="grid grid-cols-4 gap-12 rotate-12 scale-150">
          {Array.from({ length: 16 }).map((_, idx) => (
            <span key={idx} className="text-9xl font-black">
              {['&rarr;', '&larr;', '&uarr;', '&darr;'][idx % 4]}
            </span>
          ))}
        </div>
      </div>

      {/* Top Bar (Stats Summary) */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full py-1.5 px-3.5 backdrop-blur-md">
          <Award className="h-4 w-4 text-yellow-400" />
          <span className="text-xs font-bold tracking-wide">Level {progress.unlockedLevel}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full py-1.5 px-3.5 font-bold text-xs">
            💰 <span className="font-mono">{progress.coins}</span>
          </div>
          {progress.isPremium && (
            <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black uppercase text-[9px] tracking-wider py-1 px-2.5 rounded-full shadow-lg shadow-amber-500/10">
              PRO
            </span>
          )}
        </div>
      </div>

      {/* Hero / Logo */}
      <div className="relative z-10 flex flex-col items-center text-center mt-6">
        <div className="relative flex items-center justify-center mb-4">
          {/* Circular Pulse Backdrop */}
          <div className="absolute h-24 w-24 rounded-full bg-indigo-500/10 animate-ping" />
          <div className="absolute h-20 w-20 rounded-full bg-indigo-500/20 animate-pulse" />

          {/* Logo Badge */}
          <div className="h-16 w-16 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30 text-white font-black text-3xl rotate-45 select-none hover:rotate-[225deg] transition-all duration-700">
            <span className="-rotate-45">&rarr;</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase select-none">
          Arrow Exit
        </h1>
        <p className="text-xs text-indigo-400 font-mono tracking-widest uppercase font-extrabold mt-1">
          Grid Escape Logic
        </p>
      </div>

      {/* Game Mode CTA List */}
      <div className="relative z-10 my-auto max-w-sm w-full mx-auto space-y-3.5 pt-4">
        
        {/* Quick Play Classic */}
        <button
          onClick={() => selectMode('CLASSIC')}
          className="w-full group flex items-center justify-between bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white p-4 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <Play className="h-6 w-6 fill-white" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-base tracking-tight">Classic Puzzle</div>
              <div className="text-xs text-indigo-100/80 mt-0.5">Progressive unsolvability grid</div>
            </div>
          </div>
          <span className="text-xl group-hover:translate-x-1.5 transition-transform pr-2">&rarr;</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          {/* Challenge Mode */}
          <button
            onClick={() => selectMode('CHALLENGE')}
            className="group flex flex-col justify-between bg-white/5 border border-white/10 hover:bg-white/10 p-3.5 rounded-2xl text-left transition active:scale-[0.98]"
          >
            <div className="h-9 w-9 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center mb-2.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white leading-none">Challenge</div>
              <div className="text-[10px] text-slate-400 mt-1 leading-tight">Strict move limits</div>
            </div>
          </button>

          {/* Time Attack */}
          <button
            onClick={() => selectMode('TIME_ATTACK')}
            className="group flex flex-col justify-between bg-white/5 border border-white/10 hover:bg-white/10 p-3.5 rounded-2xl text-left transition active:scale-[0.98]"
          >
            <div className="h-9 w-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white leading-none">Time Attack</div>
              <div className="text-[10px] text-slate-400 mt-1 leading-tight">Race the clocks</div>
            </div>
          </button>
        </div>

        {/* Daily Puzzle */}
        <button
          onClick={() => selectMode('DAILY')}
          className="w-full flex items-center justify-between bg-white/5 border border-white/10 hover:bg-white/10 p-3.5 rounded-2xl transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-white">Daily Puzzle</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Solve daily for calendar rewards</div>
            </div>
          </div>
          <span className="text-xs bg-cyan-500/20 text-cyan-300 py-1 px-2.5 rounded-full font-black uppercase tracking-wider">
            Daily
          </span>
        </button>
      </div>

      {/* Bottom Actions Row */}
      <div className="relative z-10 max-w-sm w-full mx-auto grid grid-cols-5 gap-2 pt-6">
        <button
          onClick={() => {
            audioSynth.playClick();
            onSetModal('SHOP');
          }}
          className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition text-slate-400 hover:text-white"
        >
          <Palette className="h-5 w-5 text-indigo-400" />
          <span className="text-[9px] uppercase font-bold tracking-widest font-mono">Shop</span>
        </button>

        <button
          onClick={() => {
            audioSynth.playClick();
            onSetModal('ACHIEVEMENTS');
          }}
          className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition text-slate-400 hover:text-white"
        >
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span className="text-[9px] uppercase font-bold tracking-widest font-mono">Trophy</span>
        </button>

        <button
          onClick={() => {
            audioSynth.playClick();
            onSetModal('DAILY_REWARDS');
          }}
          className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition text-slate-400 hover:text-white relative"
        >
          <Calendar className="h-5 w-5 text-cyan-400" />
          <span className="text-[9px] uppercase font-bold tracking-widest font-mono">Streak</span>
          {/* Small dot indicating claimable daily reward */}
          <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
        </button>

        <button
          onClick={() => {
            audioSynth.playClick();
            onSetModal('TUTORIAL');
          }}
          className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition text-slate-400 hover:text-white"
        >
          <HelpCircle className="h-5 w-5 text-pink-400" />
          <span className="text-[9px] uppercase font-bold tracking-widest font-mono">Help</span>
        </button>

        <button
          onClick={() => {
            audioSynth.playClick();
            onSetModal('SETTINGS');
          }}
          className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition text-slate-400 hover:text-white"
        >
          <Settings className="h-5 w-5 text-teal-400" />
          <span className="text-[9px] uppercase font-bold tracking-widest font-mono">Config</span>
        </button>
      </div>
    </div>
  );
}
