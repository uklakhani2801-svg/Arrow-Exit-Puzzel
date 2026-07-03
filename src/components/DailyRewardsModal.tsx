import React from 'react';
import { PlayerProgress } from '../types';
import { audioSynth } from '../utils/audio';
import { CalendarDays, Gift, X, Sparkles, Check, Coins } from 'lucide-react';

interface DailyRewardsModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (updater: (p: PlayerProgress) => PlayerProgress) => void;
  onClose: () => void;
}

const REWARDS_BY_DAY = [50, 75, 100, 125, 150, 200, 350];

export default function DailyRewardsModal({
  progress,
  onUpdateProgress,
  onClose,
}: DailyRewardsModalProps) {
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayString();
  const yesterdayStr = getYesterdayString();

  const isClaimedToday = progress.lastDailyClaim === todayStr;

  // Determine current active day in streak (0 to 6)
  let currentStreakDay = progress.dailyStreak;
  if (progress.lastDailyClaim !== todayStr && progress.lastDailyClaim !== yesterdayStr) {
    // Streak broken or brand new
    currentStreakDay = 0;
  } else {
    // If we claimed yesterday, today our claim is for progress.dailyStreak % 7
    // If we claimed today, our claimed day was (progress.dailyStreak - 1) % 7
    currentStreakDay = isClaimedToday 
      ? (progress.dailyStreak - 1) % 7 
      : progress.dailyStreak % 7;
  }

  const claimReward = () => {
    if (isClaimedToday) return;

    audioSynth.playBuy();

    onUpdateProgress(prev => {
      const nextStreak = (prev.lastDailyClaim === yesterdayStr) ? prev.dailyStreak + 1 : 1;
      const dayIndex = (nextStreak - 1) % 7;
      const coinAward = REWARDS_BY_DAY[dayIndex];

      return {
        ...prev,
        coins: prev.coins + coinAward,
        dailyStreak: nextStreak,
        lastDailyClaim: todayStr,
      };
    });

    const rewardAmount = REWARDS_BY_DAY[currentStreakDay];
    alert(`Success! You claimed your Day ${currentStreakDay + 1} daily reward of ${rewardAmount} Coins! Keep your streak active tomorrow.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 text-slate-100 shadow-2xl animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-950/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-cyan-400" />
            Daily Rewards
          </h2>
          <button
            onClick={() => {
              audioSynth.playClick();
              onClose();
            }}
            className="rounded-lg p-1 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          <div className="text-center">
            <span className="text-[11px] uppercase tracking-widest text-indigo-400 font-mono font-bold">
              Check in consecutively
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {progress.lastDailyClaim === todayStr ? (
                <span>Streak Active: Day {progress.dailyStreak}!</span>
              ) : (
                <span>Claim Day {currentStreakDay + 1} Reward!</span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Don’t break your streak! Check in every day to earn massive bonuses on Day 7.
            </p>
          </div>

          {/* 7 Day Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {REWARDS_BY_DAY.map((coinsAward, idx) => {
              const isPastClaimed = isClaimedToday
                ? idx < currentStreakDay
                : idx < currentStreakDay;
              const isToday = idx === currentStreakDay;
              const isFuture = idx > currentStreakDay;

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-between p-2.5 rounded-xl border text-center transition-all ${
                    idx === 6 ? 'col-span-2 bg-gradient-to-br' : ''
                  } ${
                    isPastClaimed
                      ? 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                      : isToday
                      ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10 scale-[1.03]'
                      : 'bg-slate-950/10 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                    Day {idx + 1}
                  </div>
                  
                  <div className="my-2.5 flex items-center justify-center">
                    {isPastClaimed ? (
                      <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 shadow-inner">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-amber-400'
                      } ${idx === 6 ? 'animate-bounce' : ''}`}>
                        <Coins className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="text-xs font-black font-mono">
                    {coinsAward}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Claim Button */}
          <div className="pt-2">
            {isClaimedToday ? (
              <div className="w-full text-center py-3.5 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />
                You claimed today's reward! Come back tomorrow.
              </div>
            ) : (
              <button
                onClick={claimReward}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white py-3.5 text-sm font-black transition-all shadow-lg shadow-indigo-500/20 active:translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" />
                Claim Day {currentStreakDay + 1} Reward
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
