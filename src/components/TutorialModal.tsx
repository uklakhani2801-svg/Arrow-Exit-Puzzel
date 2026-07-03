import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../utils/audio';
import { Play, ArrowRight, ArrowLeft, X, HelpCircle, CheckCircle2 } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export default function TutorialModal({ onClose }: TutorialModalProps) {
  const [slide, setSlide] = React.useState(0);

  const slides = [
    {
      title: 'Arrow Exit Rules',
      subtitle: 'Sliding logic mechanics',
      description: 'Your goal is to clear the board by sliding all arrows out of the grid. Each arrow points in a direction: Up, Down, Left, or Right.',
      visual: (
        <div className="relative h-44 w-full flex items-center justify-center bg-slate-950/40 border border-slate-800 rounded-2xl p-4 overflow-hidden">
          {/* Edge walls */}
          <div className="absolute top-0 bottom-0 left-4 w-1 bg-red-500/20 rounded-full" />
          <div className="absolute top-0 bottom-0 right-4 w-1 bg-emerald-500/20 rounded-full" />
          
          <div className="flex gap-6 items-center">
            <div className="flex flex-col items-center gap-1.5 animate-bounce">
              <div className="h-14 w-14 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white font-black text-2xl">
                &uarr;
              </div>
              <span className="text-[11px] text-cyan-400 font-mono">Moves UP</span>
            </div>
            
            <div className="flex flex-col items-center gap-1.5 animate-bounce [animation-delay:0.2s]">
              <div className="h-14 w-14 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30 text-white font-black text-2xl">
                &rarr;
              </div>
              <span className="text-[11px] text-pink-400 font-mono">Moves RIGHT</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Overcoming Obstacles',
      subtitle: 'Path clearance strategy',
      description: 'If an arrow’s path is blocked by another arrow, it cannot move. It will bounce off the obstacle and shake. You must clear blockers first!',
      visual: (
        <div className="relative h-44 w-full flex flex-col items-center justify-center bg-slate-950/40 border border-slate-800 rounded-2xl p-4 gap-2">
          <div className="flex items-center gap-3">
            {/* Blocked arrow */}
            <div className="h-14 w-14 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-2xl shadow-lg relative animate-bump-RIGHT infinite">
              &rarr;
              <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-[10px] px-1.5 rounded-full font-bold">BLOCKED</div>
            </div>
            
            {/* Blocker arrow */}
            <div className="h-14 w-14 rounded-xl bg-amber-400 flex items-center justify-center text-slate-900 font-black text-2xl shadow-lg">
              &darr;
            </div>
          </div>
          <span className="text-xs text-orange-400 text-center font-medium mt-1">The Left arrow is blocked by the Down arrow!</span>
        </div>
      )
    },
    {
      title: 'Successful Exit',
      subtitle: 'Solve from outside in',
      description: 'Find arrows at the edges pointing outwards. When their exit path is clear of any blockers, tapping them makes them fly off and disappear!',
      visual: (
        <div className="relative h-44 w-full flex items-center justify-center bg-slate-950/40 border border-slate-800 rounded-2xl p-4 overflow-hidden">
          {/* Flying exit effect */}
          <motion.div 
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: 300, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeIn' }}
            className="h-14 w-14 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-500/20"
          >
            &rarr;
          </motion.div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 h-20 w-1 border-r-2 border-dashed border-emerald-400/40 flex items-center justify-center">
            <span className="text-[10px] text-emerald-400 font-mono rotate-90 translate-x-3 uppercase tracking-widest font-bold">EXIT</span>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    audioSynth.playClick();
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    audioSynth.playClick();
    if (slide > 0) {
      setSlide(slide - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-900">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-cyan-400" />
            How to Play Tutorial
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

        {/* Slide contents */}
        <div className="p-5 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="text-center">
                <span className="text-[11px] uppercase tracking-widest text-indigo-400 font-mono font-bold">
                  Step {slide + 1} of {slides.length} &bull; {slides[slide].subtitle}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">{slides[slide].title}</h3>
              </div>

              {slides[slide].visual}

              <p className="text-sm text-slate-300 text-center leading-relaxed font-sans px-2">
                {slides[slide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Indicators */}
          <div className="flex justify-center gap-2 pt-2">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  slide === idx ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              onClick={prevSlide}
              disabled={slide === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                slide === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Prev
            </button>

            <button
              onClick={nextSlide}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition hover:translate-y-[-1px]"
            >
              {slide === slides.length - 1 ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Start Playing
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
