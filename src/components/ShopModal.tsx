import React from 'react';
import { PlayerProgress, ShopItem } from '../types';
import { SHOP_ITEMS } from '../data/shopAndAchievements';
import { audioSynth } from '../utils/audio';
import { Coins, X, Palette, Sparkles, Check, Lock } from 'lucide-react';

interface ShopModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (updater: (p: PlayerProgress) => PlayerProgress) => void;
  onClose: () => void;
}

export default function ShopModal({ progress, onUpdateProgress, onClose }: ShopModalProps) {
  const [tab, setTab] = React.useState<'SKIN' | 'THEME'>('SKIN');

  const filteredItems = SHOP_ITEMS.filter(item => item.type === tab);

  const buyOrEquipItem = (item: ShopItem) => {
    audioSynth.playClick();
    const isSkin = item.type === 'SKIN';
    const unlockedList = isSkin ? progress.unlockedSkins : progress.unlockedThemes;
    const isUnlocked = unlockedList.includes(item.id);

    if (isUnlocked) {
      // Equip
      onUpdateProgress(prev => {
        const next = { ...prev };
        if (isSkin) {
          next.activeSkin = item.id;
        } else {
          next.activeTheme = item.id;
        }
        return next;
      });
    } else {
      // Try to unlock
      if (progress.coins >= item.cost) {
        audioSynth.playBuy();
        onUpdateProgress(prev => {
          const next = { ...prev };
          next.coins -= item.cost;
          if (isSkin) {
            next.unlockedSkins = [...next.unlockedSkins, item.id];
            next.activeSkin = item.id;
          } else {
            next.unlockedThemes = [...next.unlockedThemes, item.id];
            next.activeTheme = item.id;
          }
          return next;
        });
      } else {
        audioSynth.playBlock();
        // Highlight negative state
        alert(`You need ${item.cost - progress.coins} more coins to purchase this item! Solve more puzzles to earn coins.`);
      }
    }
  };

  const getAdFreeUpgrade = () => {
    audioSynth.playBuy();
    onUpdateProgress(prev => ({
      ...prev,
      isPremium: true,
      coins: prev.coins + 500, // Gift 500 coins for premium upgrade
    }));
    alert('Congratulations! You are now a PREMIUM user. We gifted you 500 Coins! All interstitials and daily limits are removed.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 text-slate-100 shadow-2xl animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-950/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="h-5 w-5 text-indigo-400" />
            Customization Shop
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950/60 border border-amber-500/30 rounded-full py-1 px-3">
              <Coins className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-sm font-extrabold text-amber-300 font-mono">{progress.coins}</span>
            </div>
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
        </div>

        {/* Tab Toggle */}
        <div className="flex p-2 bg-slate-950/40 border-b border-slate-800/60">
          <button
            onClick={() => {
              audioSynth.playClick();
              setTab('SKIN');
            }}
            className={`flex-1 py-2 text-center text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all ${
              tab === 'SKIN'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            Arrow Skins
          </button>
          <button
            onClick={() => {
              audioSynth.playClick();
              setTab('THEME');
            }}
            className={`flex-1 py-2 text-center text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all ${
              tab === 'THEME'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            Board Themes
          </button>
        </div>

        {/* Items List */}
        <div className="p-5 space-y-4 max-h-[350px] overflow-y-auto">
          {filteredItems.map(item => {
            const isSkin = item.type === 'SKIN';
            const unlockedList = isSkin ? progress.unlockedSkins : progress.unlockedThemes;
            const isUnlocked = unlockedList.includes(item.id);
            const isEquipped = isSkin ? progress.activeSkin === item.id : progress.activeTheme === item.id;

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isEquipped
                    ? 'bg-indigo-950/20 border-indigo-500/60'
                    : 'bg-slate-950/20 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Visual Preview Swatch */}
                <div className="flex items-center gap-3">
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md relative"
                    style={{ backgroundColor: item.previewColor }}
                  >
                    {isSkin ? (
                      <span className="text-xl rotate-45">&rarr;</span>
                    ) : (
                      <span className="text-xs uppercase tracking-tighter opacity-80">Grid</span>
                    )}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      {item.name}
                      {isEquipped && (
                        <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-widest font-black">
                          Equipped
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-normal max-w-[180px]">
                      {item.description}
                    </div>
                  </div>
                </div>

                {/* Purchase or Equip CTA */}
                <div>
                  {isEquipped ? (
                    <button className="flex items-center gap-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 py-1.5 px-3.5 text-xs font-bold pointer-events-none">
                      <Check className="h-3.5 w-3.5" />
                      Active
                    </button>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => buyOrEquipItem(item)}
                      className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white py-1.5 px-4 text-xs font-bold transition"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => buyOrEquipItem(item)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 py-2 px-3.5 text-xs font-black transition shadow-md shadow-amber-500/10"
                    >
                      <Coins className="h-3.5 w-3.5 fill-slate-950" />
                      {item.cost}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner for Monetization & Ads */}
        <div className="bg-slate-950/60 border-t border-slate-800 px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex gap-2.5 items-center">
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
              <Sparkles className="h-4 w-4 animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Go Ad-Free Premium</div>
              <div className="text-[10px] text-slate-400">Get +500 Coins, remove all timers</div>
            </div>
          </div>
          {progress.isPremium ? (
            <span className="text-[11px] font-black uppercase tracking-widest bg-yellow-400/20 text-yellow-300 py-1.5 px-3 rounded-xl">
              Unlocked!
            </span>
          ) : (
            <button
              onClick={getAdFreeUpgrade}
              className="rounded-xl bg-yellow-500 hover:bg-yellow-600 text-slate-950 py-1.5 px-3.5 text-xs font-extrabold transition shadow-md shadow-yellow-500/20"
            >
              Get Premium
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
