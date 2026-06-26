// Web Audio API Sound and Music Generator for Dan Sai Adventure
// No external assets required, pure browser-synthesized audio!

class AudioSynth {
  private ctx: AudioContext | null = null;
  private musicInterval: any = null;
  private isPlayingMusic = false;
  private masterVolumeNode: GainNode | null = null;
  private musicVolumeNode: GainNode | null = null;
  private sfxVolumeNode: GainNode | null = null;

  // Volumes
  private sfxVol = 0.5;
  private musicVol = 0.3;

  private initContext() {
    if (this.ctx) return;
    try {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterVolumeNode = this.ctx.createGain();
      this.masterVolumeNode.gain.setValueAtTime(1, this.ctx.currentTime);
      this.masterVolumeNode.connect(this.ctx.destination);

      this.musicVolumeNode = this.ctx.createGain();
      this.musicVolumeNode.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
      this.musicVolumeNode.connect(this.masterVolumeNode);

      this.sfxVolumeNode = this.ctx.createGain();
      this.sfxVolumeNode.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
      this.sfxVolumeNode.connect(this.masterVolumeNode);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  setMusicVolume(vol: number) {
    this.musicVol = vol;
    if (this.musicVolumeNode && this.ctx) {
      this.musicVolumeNode.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  setSfxVolume(vol: number) {
    this.sfxVol = vol;
    if (this.sfxVolumeNode && this.ctx) {
      this.sfxVolumeNode.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  playJump() {
    this.initContext();
    if (!this.ctx || !this.sfxVolumeNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.sfxVol * 0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination); // Direct bypass or via sfx node

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playCoin() {
    this.initContext();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc1.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1046.50, this.ctx.currentTime); // C6

    gain.gain.setValueAtTime(this.sfxVol * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.25);
    osc2.stop(this.ctx.currentTime + 0.25);
  }

  playHit() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(this.sfxVol * 0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.31);
  }

  playAttack() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.sfxVol * 0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playChing(type: "ching" | "chab") {
    this.initContext();
    if (!this.ctx) return;

    // A metallic clank/hiss using highpass filtered white noise or high freq sine waves
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(type === "ching" ? 2500 : 1200, this.ctx.currentTime);
    
    const duration = type === "ching" ? 0.35 : 0.15;
    gain.gain.setValueAtTime(this.musicVol * 0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  startMusic() {
    this.initContext();
    if (this.isPlayingMusic || !this.ctx) return;
    this.isPlayingMusic = true;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Traditional Isan Phin Pentatonic Loop (Am Pentatonic: A, C, D, E, G)
    // Scale frequencies: A4=440, C5=523.25, D5=587.33, E5=659.25, G5=783.99, A5=880
    const phinScale = [440, 523.25, 587.33, 659.25, 783.99, 880];
    const sequence = [
      0, 3, 5, 3, 4, 3, 0, 3, // Phin melody
      1, 3, 5, 3, 4, 3, 2, 0
    ];
    const rhythm = [
      true, false, true, false, true, false, true, false,
      true, false, true, false, true, false, true, false
    ];

    let step = 0;
    const tempo = 170; // ms per step (approx 88 BPM)

    this.musicInterval = setInterval(() => {
      if (!this.ctx || !this.isPlayingMusic) return;

      const time = this.ctx.currentTime;

      // Ching & Chab rhythm on the 4th/8th beats (traditional cymbals)
      if (step % 4 === 0) {
        this.playChing("ching");
      } else if (step % 4 === 2) {
        this.playChing("chab");
      }

      // Bass drone/pulse
      if (step % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = "sawtooth";
        // Alternate between A2 (110Hz) and E2 (82.4Hz)
        bassOsc.frequency.setValueAtTime(step % 8 < 4 ? 110 : 82.4, time);
        
        // Soft lowpass filter for bass
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(250, time);

        bassGain.gain.setValueAtTime(this.musicVol * 0.15, time);
        bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

        bassOsc.connect(filter);
        filter.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start();
        bassOsc.stop(time + 0.31);
      }

      // Melody notes
      if (rhythm[step % rhythm.length] && Math.random() > 0.1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Plucky Phin sound (Triangle wave with fast decay)
        osc.type = "triangle";
        const noteIndex = sequence[step % sequence.length];
        const baseFreq = phinScale[noteIndex];
        // Add minor randomized variation to mimic traditional phin playing ornamentations
        const ornamentation = (step % 3 === 0) ? baseFreq * 1.025 : baseFreq;
        
        osc.frequency.setValueAtTime(baseFreq, time);
        if (step % 3 === 0) {
          osc.frequency.setValueAtTime(ornamentation, time + 0.04);
        }

        gain.gain.setValueAtTime(this.musicVol * 0.22, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(time + 0.21);
      }

      step++;
    }, tempo);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new AudioSynth();
