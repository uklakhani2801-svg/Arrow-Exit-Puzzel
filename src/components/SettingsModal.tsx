import React from 'react';
import { PlayerProgress, ModalState } from '../types';
import { audioSynth } from '../utils/audio';
import { Volume2, VolumeX, Music, RotateCcw, Award, ShieldAlert, X } from 'lucide-react';

interface SettingsModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (updater: (p: PlayerProgress) => PlayerProgress) => void;
  onClose: () => void;
  onResetProgress: () => void;
}

export default function SettingsModal({
  progress,
  onUpdateProgress,
  onClose,
  onResetProgress,
}: SettingsModalProps) {
  const [sfx, setSfx] = React.useState(audioSynth.getSfxEnabled());
  const [music, setMusic] = React.useState(audioSynth.getMusicEnabled());
  const [showConfirmReset, setShowConfirmReset] = React.useState(false);

  const toggleSfx = () => {
    const newState = !sfx;
    setSfx(newState);
    audioSynth.setSfxEnabled(newState);
    audioSynth.playClick();
  };

  const toggleMusic = () => {
    const newState = !music;
    setMusic(newState);
    audioSynth.setMusicEnabled(newState);
    audioSynth.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 text-slate-100 shadow-2xl animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-indigo-400" />
            Game Settings
          </h2>
          <button
            onClick={() => {
              audioSynth.playClick();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-5">
          {/* Sounds */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Audio</h3>
            
            <div className="flex items-center justify-between rounded-xl bg-slate-950/40 p-3.5 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${sfx ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                  {sfx ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </div>
                <div>
                  <div className="font-medium">Sound Effects</div>
                  <div className="text-xs text-slate-400">Slides, bumps, and exit sparkles</div>
                </div>
              </div>
              <button
                onClick={toggleSfx}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  sfx ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    sfx ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-950/40 p-3.5 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${music ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-800 text-slate-500'}`}>
                  <Music className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Background Music</div>
                  <div className="text-xs text-slate-400">Procedural relaxing Zen harmonies</div>
                </div>
              </div>
              <button
                onClick={toggleMusic}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  music ? 'bg-pink-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    music ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-400" />
              Your Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-950/20 border border-slate-800/80 p-3 text-center">
                <div className="text-2xl font-extrabold text-white">{progress.stats.totalLevelsWon}</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Levels Cleared</div>
              </div>
              <div className="rounded-xl bg-slate-950/20 border border-slate-800/80 p-3 text-center">
                <div className="text-2xl font-extrabold text-white">{progress.stats.totalArrowsExited}</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Arrows Cleared</div>
              </div>
              <div className="rounded-xl bg-slate-950/20 border border-slate-800/80 p-3 text-center">
                <div className="text-2xl font-extrabold text-white">{progress.stats.perfectSolves}</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Perfect Solves</div>
              </div>
              <div className="rounded-xl bg-slate-950/20 border border-slate-800/80 p-3 text-center">
                <div className="text-2xl font-extrabold text-white">{progress.coins}</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Current Coins</div>
              </div>
            </div>
          </div>

          {/* Reset / Premium info */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            {showConfirmReset ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 space-y-2">
                <div className="flex gap-2 text-red-400">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <div className="text-xs leading-relaxed">
                    <strong>Are you absolutely sure?</strong> This will erase all your levels, unlocked skins, themes, and coins permanently!
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      audioSynth.playClick();
                      setShowConfirmReset(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      audioSynth.playClick();
                      onResetProgress();
                      setShowConfirmReset(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition"
                  >
                    Yes, Erase All
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  audioSynth.playClick();
                  setShowConfirmReset(true);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 py-3 text-sm font-semibold transition"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Game Data
              </button>
            )}
          </div>
        </div>

        {/* Footer / Credits */}
        <div className="bg-slate-950/40 border-t border-slate-800 px-5 py-4 text-center">
          <div className="text-xs text-slate-400 font-mono">Arrow Exit Puzzle v1.2.0</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Procedural Physics Puzzle Engine &bull; Pure CSS 60FPS</div>
        </div>
      </div>
    </div>
  );
}
