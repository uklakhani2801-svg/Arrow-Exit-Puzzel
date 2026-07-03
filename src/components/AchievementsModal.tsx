import { PlayerProgress, Achievement } from '../types';
import { ACHIEVEMENTS } from '../data/shopAndAchievements';
import { audioSynth } from '../utils/audio';
import { Award, X, Check, Star, Trophy, Gift } from 'lucide-react';

interface AchievementsModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (updater: (p: PlayerProgress) => PlayerProgress) => void;
  onClose: () => void;
}

export default function AchievementsModal({
  progress,
  onUpdateProgress,
  onClose,
}: AchievementsModalProps) {

  const claimReward = (achievement: Achievement) => {
    audioSynth.playBuy();
    onUpdateProgress(prev => {
      const isClaimed = prev.achievementsClaimed.includes(achievement.id);
      if (isClaimed) return prev;

      return {
        ...prev,
        coins: prev.coins + achievement.rewardCoins,
        achievementsClaimed: [...prev.achievementsClaimed, achievement.id],
      };
    });
    alert(`Claimed ${achievement.rewardCoins} Coins for completing: "${achievement.title}"!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 text-slate-100 shadow-2xl animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-950/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Achievements
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
        <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
          {ACHIEVEMENTS.map(item => {
            const { current, target } = item.getProgress(progress);
            const isCompleted = current >= target;
            const isClaimed = progress.achievementsClaimed.includes(item.id);
            const percent = Math.min(Math.round((current / target) * 100), 100);

            return (
              <div
                key={item.id}
                className={`flex flex-col p-4 rounded-2xl border transition-all ${
                  isClaimed
                    ? 'bg-slate-950/20 border-slate-800/60 opacity-70'
                    : isCompleted
                    ? 'bg-amber-950/10 border-amber-500/40 shadow-md shadow-amber-500/5'
                    : 'bg-slate-950/10 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl select-none filter drop-shadow">{item.icon}</span>
                    <div>
                      <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        {item.title}
                        {isClaimed && (
                          <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                            Claimed
                          </span>
                        )}
                        {isCompleted && !isClaimed && (
                          <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse">
                            Ready to Claim
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-normal max-w-[220px] mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {/* Reward indicator / Claim button */}
                  <div>
                    {isClaimed ? (
                      <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Done
                      </div>
                    ) : isCompleted ? (
                      <button
                        onClick={() => claimReward(item)}
                        className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl transition shadow-md shadow-amber-500/20 animate-bounce"
                      >
                        <Gift className="h-3 w-3" />
                        Claim {item.rewardCoins}
                      </button>
                    ) : (
                      <div className="text-xs text-amber-300 font-bold bg-slate-950/50 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
                        <span>+{item.rewardCoins}</span>
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {!isClaimed && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                      <span>Progress</span>
                      <span>
                        {current} / {target} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isCompleted ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
