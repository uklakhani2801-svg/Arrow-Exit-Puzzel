import React from 'react';
import { PlayerProgress, ScreenState } from '../types';
import { audioSynth } from '../utils/audio';
import { ArrowLeft, Calendar, Play, CheckCircle2, Star } from 'lucide-react';

interface DailySelectScreenProps {
  progress: PlayerProgress;
  onSetScreen: (screen: ScreenState) => void;
  onSelectDailyPuzzle: (dateStr: string, difficulty: any) => void;
}

export default function DailySelectScreen({
  progress,
  onSetScreen,
  onSelectDailyPuzzle,
}: DailySelectScreenProps) {
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayString();
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth(); // 0-indexed
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDifficultyForDay = (day: number) => {
    if (day <= 8) return 'EASY';
    if (day <= 16) return 'MEDIUM';
    if (day <= 24) return 'HARD';
    return 'EXPERT';
  };

  const handleDayClick = (day: number) => {
    audioSynth.playClick();
    const todayDayNum = new Date().getDate();
    if (day > todayDayNum) {
      audioSynth.playBlock();
      alert(`This day is in the future! Come back on ${monthNames[currentMonthIdx]} ${day} to play this daily puzzle.`);
      return;
    }

    const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const diff = getDifficultyForDay(day);
    onSelectDailyPuzzle(dateStr, diff);
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
            Daily Puzzles
          </h2>
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase font-extrabold block mt-0.5">
            {monthNames[currentMonthIdx]} {currentYear}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full py-1 px-3 text-xs font-bold font-mono">
          📅 Streak: {progress.dailyStreak}
        </div>
      </div>

      {/* Hero card for today's puzzle */}
      <div className="my-4 p-4 rounded-2xl bg-white/5 border border-white/10 max-w-sm w-full mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold font-mono uppercase tracking-wider">Today's Challenge</div>
            <div className="text-sm font-extrabold text-white">
              {monthNames[currentMonthIdx]} {new Date().getDate()}
            </div>
          </div>
        </div>

        {progress.completedDailyPuzzles.includes(todayStr) ? (
          <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold py-2 px-3 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </div>
        ) : (
          <button
            onClick={() => handleDayClick(new Date().getDate())}
            className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-black py-2 px-4 rounded-xl transition shadow-md shadow-cyan-500/10"
          >
            <Play className="h-3.5 w-3.5 fill-slate-950" />
            Play
          </button>
        )}
      </div>

      {/* Calendar Grid of days */}
      <div className="my-auto max-w-sm w-full mx-auto space-y-3">
        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">
          Calendar Days
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const todayDayNum = new Date().getDate();
            const isToday = dayNum === todayDayNum;
            const isPast = dayNum < todayDayNum;
            const isFuture = dayNum > todayDayNum;

            const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSolved = progress.completedDailyPuzzles.includes(dateStr);

            return (
              <button
                key={dayNum}
                onClick={() => handleDayClick(dayNum)}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition active:scale-95 ${
                  isSolved
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : isToday
                    ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                    : isFuture
                    ? 'bg-slate-950/20 border-slate-900 text-slate-600'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                <span className="text-xs font-extrabold">{dayNum}</span>
                
                {/* Micro difficulty indicator */}
                <span className={`text-[7px] font-black uppercase mt-0.5 tracking-tight ${
                  getDifficultyForDay(dayNum) === 'EASY' ? 'text-emerald-500/70' :
                  getDifficultyForDay(dayNum) === 'MEDIUM' ? 'text-amber-500/70' :
                  getDifficultyForDay(dayNum) === 'HARD' ? 'text-pink-500/70' : 'text-violet-500/70'
                }`}>
                  {getDifficultyForDay(dayNum).slice(0, 3)}
                </span>

                {isSolved && (
                  <div className="absolute top-0.5 right-0.5 bg-emerald-500 rounded-full h-2 w-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-500 max-w-xs mx-auto leading-normal mt-4">
        Play past daily puzzles of the current month! Future puzzles unlock automatically day-by-day.
      </div>
    </div>
  );
}
