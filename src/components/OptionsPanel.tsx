import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Keyboard, Gamepad2, RotateCcw, Check, ChevronLeft, Music, Sliders } from 'lucide-react';
import { KeyBindings, GameSettings } from '../types';
import { audio } from '../utils/audio';

interface OptionsPanelProps {
  keyBindings: KeyBindings;
  onUpdateKeyBindings: (bindings: KeyBindings) => void;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onBack: () => void;
}

const PRESETS = {
  wasd: {
    moveLeft: { key: 'KeyA', label: 'A' },
    moveRight: { key: 'KeyD', label: 'D' },
    jump: { key: 'KeyW', label: 'W' },
    attack: { key: 'KeyJ', label: 'J' }
  },
  arrows: {
    moveLeft: { key: 'ArrowLeft', label: '←' },
    moveRight: { key: 'ArrowRight', label: '→' },
    jump: { key: 'ArrowUp', label: '↑' },
    attack: { key: 'Space', label: 'Space' }
  }
};

export default function OptionsPanel({
  keyBindings,
  onUpdateKeyBindings,
  settings,
  onUpdateSettings,
  onBack
}: OptionsPanelProps) {
  const [activeRebind, setActiveRebind] = useState<keyof KeyBindings | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!activeRebind) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const newKey = e.code;
      // Get a nice readable label
      let label = e.key;
      if (newKey === 'Space') label = 'Space';
      else if (newKey === 'ArrowUp') label = '↑';
      else if (newKey === 'ArrowDown') label = '↓';
      else if (newKey === 'ArrowLeft') label = '←';
      else if (newKey === 'ArrowRight') label = '→';
      else if (label.length === 1) label = label.toUpperCase();

      const updated = {
        ...keyBindings,
        [activeRebind]: { key: newKey, label }
      };

      onUpdateKeyBindings(updated);
      setActiveRebind(null);
      setIsListening(false);
      audio.playCoin(); // confirm sound effect
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRebind, keyBindings, onUpdateKeyBindings]);

  const startRebind = (action: keyof KeyBindings) => {
    setActiveRebind(action);
    setIsListening(true);
    audio.playJump();
  };

  const applyPreset = (presetName: 'wasd' | 'arrows') => {
    onUpdateKeyBindings(PRESETS[presetName]);
    audio.playCoin();
  };

  const resetAll = () => {
    onUpdateKeyBindings(PRESETS.arrows);
    onUpdateSettings({
      musicVolume: 0.3,
      sfxVolume: 0.5,
      useOnScreenGamepad: false,
      gamepadOpacity: 0.7
    });
    audio.setMusicVolume(0.3);
    audio.setSfxVolume(0.5);
    audio.playCoin();
  };

  const handleMusicVolChange = (val: number) => {
    const updated = { ...settings, musicVolume: val };
    onUpdateSettings(updated);
    audio.setMusicVolume(val);
  };

  const handleSfxVolChange = (val: number) => {
    const updated = { ...settings, sfxVolume: val };
    onUpdateSettings(updated);
    audio.setSfxVolume(val);
    audio.playAttack(); // preview sound level
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-neutral-950 border border-red-900/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.15)] relative overflow-hidden font-sans text-neutral-200">
      {/* Decorative top red accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => {
            audio.playJump();
            onBack();
          }}
          className="flex items-center gap-2 text-neutral-400 hover:text-red-500 transition-colors py-2 px-3 hover:bg-neutral-900 rounded-lg group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span>ย้อนกลับ (Back)</span>
        </button>
        <h2 className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-red-500 animate-pulse" />
          <span>ตั้งค่าเกม (Options)</span>
        </h2>
      </div>

      <div className="space-y-8">
        {/* Section 1: Keyboard Customizer */}
        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-amber-500">
              <Keyboard className="w-5 h-5" />
              <span>ปุ่มการบังคับ (Control Keys)</span>
            </h3>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => applyPreset('arrows')}
                className="px-2 py-1 bg-neutral-800 hover:bg-red-900/30 border border-neutral-700 hover:border-red-800/50 rounded transition-all text-neutral-300"
              >
                ปุ่มลูกศร (Arrows)
              </button>
              <button
                onClick={() => applyPreset('wasd')}
                className="px-2 py-1 bg-neutral-800 hover:bg-red-900/30 border border-neutral-700 hover:border-red-800/50 rounded transition-all text-neutral-300"
              >
                WASD
              </button>
            </div>
          </div>

          {isListening && (
            <div className="bg-red-950/20 border border-red-800/30 text-red-400 p-3 rounded-lg text-center text-sm animate-pulse">
              กรุณากดปุ่มบนคีย์บอร์ดที่ต้องการสลับ... (Press any key for{' '}
              <span className="font-bold underline text-amber-400 uppercase">
                {activeRebind === 'moveLeft'
                  ? 'เดินซ้าย'
                  : activeRebind === 'moveRight'
                  ? 'เดินขวา'
                  : activeRebind === 'jump'
                  ? 'กระโดด'
                  : 'โจมตี'}
              </span>
              )
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-lg border border-neutral-900">
              <span className="text-sm text-neutral-400">เดินซ้าย (Move Left)</span>
              <button
                onClick={() => startRebind('moveLeft')}
                disabled={isListening}
                className={`min-w-[70px] px-3 py-1.5 text-sm font-semibold rounded border transition-all ${
                  activeRebind === 'moveLeft'
                    ? 'bg-amber-500 border-amber-400 text-neutral-950 animate-bounce'
                    : 'bg-neutral-900 border-neutral-700 hover:border-red-500 text-neutral-100 hover:text-red-500'
                }`}
              >
                {keyBindings.moveLeft.label}
              </button>
            </div>

            <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-lg border border-neutral-900">
              <span className="text-sm text-neutral-400">เดินขวา (Move Right)</span>
              <button
                onClick={() => startRebind('moveRight')}
                disabled={isListening}
                className={`min-w-[70px] px-3 py-1.5 text-sm font-semibold rounded border transition-all ${
                  activeRebind === 'moveRight'
                    ? 'bg-amber-500 border-amber-400 text-neutral-950 animate-bounce'
                    : 'bg-neutral-900 border-neutral-700 hover:border-red-500 text-neutral-100 hover:text-red-500'
                }`}
              >
                {keyBindings.moveRight.label}
              </button>
            </div>

            <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-lg border border-neutral-900">
              <span className="text-sm text-neutral-400">กระโดด (Jump)</span>
              <button
                onClick={() => startRebind('jump')}
                disabled={isListening}
                className={`min-w-[70px] px-3 py-1.5 text-sm font-semibold rounded border transition-all ${
                  activeRebind === 'jump'
                    ? 'bg-amber-500 border-amber-400 text-neutral-950 animate-bounce'
                    : 'bg-neutral-900 border-neutral-700 hover:border-red-500 text-neutral-100 hover:text-red-500'
                }`}
              >
                {keyBindings.jump.label}
              </button>
            </div>

            <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-lg border border-neutral-900">
              <span className="text-sm text-neutral-400">โจมตี (Attack)</span>
              <button
                onClick={() => startRebind('attack')}
                disabled={isListening}
                className={`min-w-[70px] px-3 py-1.5 text-sm font-semibold rounded border transition-all ${
                  activeRebind === 'attack'
                    ? 'bg-amber-500 border-amber-400 text-neutral-950 animate-bounce'
                    : 'bg-neutral-900 border-neutral-700 hover:border-red-500 text-neutral-100 hover:text-red-500'
                }`}
              >
                {keyBindings.attack.label}
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Audio Config */}
        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-xl p-5 space-y-5">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-amber-500 border-b border-neutral-800/80 pb-3">
            <Volume2 className="w-5 h-5" />
            <span>ปรับระดับเสียง (Audio Settings)</span>
          </h3>

          <div className="space-y-4">
            {/* Music volume */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-red-400" /> ดนตรีประกอบ (Music Volume)
                </span>
                <span className="font-mono text-amber-400">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-neutral-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => handleMusicVolChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <Volume2 className="w-4 h-4 text-red-400" />
              </div>
            </div>

            {/* SFX volume */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-400" /> เสียงเอฟเฟกต์ (SFX Volume)
                </span>
                <span className="font-mono text-amber-400">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-neutral-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => handleSfxVolChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <Volume2 className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Mobile Touch Gamepad */}
        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-amber-500 border-b border-neutral-800/80 pb-3">
            <Gamepad2 className="w-5 h-5" />
            <span>ปุ่มจำลองหน้าจอสัมผัส (On-Screen Gamepad)</span>
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-200">เปิดปุ่มควบคุมเสมือนบนจอ</p>
              <p className="text-xs text-neutral-500 mt-1">
                สำหรับผู้เล่นบนโทรศัพท์มือถือ หรือผู้ที่ต้องการใช้ปุ่มกดบนหน้าจอ
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.useOnScreenGamepad}
                onChange={(e) => {
                  onUpdateSettings({ ...settings, useOnScreenGamepad: e.target.checked });
                  audio.playCoin();
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 peer-checked:after:bg-white"></div>
            </label>
          </div>

          {settings.useOnScreenGamepad && (
            <div className="space-y-2 pt-2 border-t border-neutral-800/40 animate-fadeIn">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">ความโปร่งใสของปุ่ม (Opacity)</span>
                <span className="font-mono text-amber-400">
                  {Math.round(settings.gamepadOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={settings.gamepadOpacity}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, gamepadOpacity: parseFloat(e.target.value) })
                }
                className="w-full h-1 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-between pt-2">
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors py-1 px-2.5 rounded hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าทั้งหมด (Reset All)</span>
          </button>
          <button
            onClick={() => {
              audio.playCoin();
              onBack();
            }}
            className="glow-button flex items-center gap-2 py-2.5 px-6 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold shadow-lg text-sm transition-all border border-red-500"
          >
            <Check className="w-4 h-4" />
            <span>บันทึกและปิด (Save & Close)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
