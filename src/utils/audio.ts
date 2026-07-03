// Web Audio API Synthesizer for Arrow Exit Puzzle
// This handles all game audio effects and background ambient music without needing static files.

class AudioSynthManager {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = false;
  private bgmInterval: any = null;
  private isBgmPlaying: boolean = false;

  constructor() {
    // Lazy initialize to bypass browser autoplay restrictions
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
  }

  getSfxEnabled() {
    return this.sfxEnabled;
  }

  getMusicEnabled() {
    return this.musicEnabled;
  }

  // --- SFX SYNTHESIS ---

  // Slide sound: Quick low-to-high swoop
  playSlide() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // Block sound: Dull, low thump
  playBlock() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  // Exit sound: Satisfying high sparkle
  playExit() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Main chime
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.2);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);

    // High harmonic sparkle
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.51, now); // E6
    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.15);
  }

  // Click sound
  playClick() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Buy item sound: Beautiful double chime
  playBuy() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C major chord
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.35);
    });
  }

  // Victory sound: Beautiful ascending major scale arpeggio
  playVictory() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // C Major Arpeggio: C4, E4, G4, C5, E5, G5, C6
    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
    });
  }

  // --- AMBIENT BGM GENERATOR ---

  // Soft, relaxing background melodies generated procedurally
  private startBgm() {
    if (!this.musicEnabled || this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    let noteIndex = 0;

    // Pentatonic scale in F# (super relaxing / Zen vibe)
    const scale = [185.00, 207.65, 220.00, 277.18, 311.13, 369.99, 415.30, 440.00, 554.37];

    const playMelodyNote = () => {
      if (!this.musicEnabled || !this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      // Soft triangle sound
      osc.type = 'triangle';

      // Pick next note
      const baseFreq = scale[noteIndex % scale.length];
      osc.frequency.setValueAtTime(baseFreq, now);

      // Simple auto-accompaniment arpeggio
      noteIndex = (noteIndex + (Math.random() > 0.5 ? 1 : 2)) % scale.length;

      // Low pass filter to make it warmer/softer
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      // Soft envelope
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.5); // Slow attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5); // Very long decay

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 4.0);
    };

    // Trigger notes every 2.5 seconds
    this.bgmInterval = setInterval(playMelodyNote, 2500);
    playMelodyNote(); // first note instantly
  }

  private stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isBgmPlaying = false;
  }
}

export const audioSynth = new AudioSynthManager();
