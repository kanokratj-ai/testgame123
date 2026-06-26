/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MainMenu from './components/MainMenu';
import OptionsPanel from './components/OptionsPanel';
import GameCanvas from './components/GameCanvas';
import { KeyBindings, GameSettings } from './types';
import { audio } from './utils/audio';

const DEFAULT_BINDINGS: KeyBindings = {
  moveLeft: { key: 'ArrowLeft', label: '←' },
  moveRight: { key: 'ArrowRight', label: '→' },
  jump: { key: 'ArrowUp', label: '↑' },
  attack: { key: 'Space', label: 'Space' }
};

const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.3,
  sfxVolume: 0.5,
  useOnScreenGamepad: false,
  gamepadOpacity: 0.7
};

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'options' | 'game'>('menu');
  const [keyBindings, setKeyBindings] = useState<KeyBindings>(DEFAULT_BINDINGS);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    const savedBindings = localStorage.getItem('dansai_bindings');
    if (savedBindings) {
      try {
        setKeyBindings(JSON.parse(savedBindings));
      } catch (e) {
        console.error(e);
      }
    }

    const savedSettings = localStorage.getItem('dansai_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        // Sync to audio singleton
        audio.setMusicVolume(parsed.musicVolume);
        audio.setSfxVolume(parsed.sfxVolume);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync to local storage on update
  const handleUpdateKeyBindings = (newBindings: KeyBindings) => {
    setKeyBindings(newBindings);
    localStorage.setItem('dansai_bindings', JSON.stringify(newBindings));
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem('dansai_settings', JSON.stringify(newSettings));
  };

  // Music loop handling
  useEffect(() => {
    if (userInteracted && !isMusicMuted && screen === 'menu') {
      audio.startMusic();
    } else {
      audio.stopMusic();
    }
    return () => audio.stopMusic();
  }, [userInteracted, isMusicMuted, screen]);

  // Handle first interaction for Web Audio autoplay bypass
  const handleFirstInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      if (!isMusicMuted && screen === 'menu') {
        audio.startMusic();
      }
    }
  };

  const toggleMuteMusic = () => {
    const nextMute = !isMusicMuted;
    setIsMusicMuted(nextMute);
    if (nextMute) {
      audio.stopMusic();
    } else if (userInteracted && screen === 'menu') {
      audio.startMusic();
    }
  };

  return (
    <div
      onClick={handleFirstInteraction}
      onTouchStart={handleFirstInteraction}
      onKeyDown={handleFirstInteraction}
      className="min-h-screen bg-black text-neutral-200 overflow-x-hidden font-sans select-none"
    >
      <AnimatePresence mode="wait">
        {screen === 'menu' && (
          <motion.div
            key="menu-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="min-h-screen flex flex-col justify-center"
          >
            <MainMenu
              onStartGame={() => setScreen('game')}
              onOpenOptions={() => setScreen('options')}
              isMusicMuted={isMusicMuted}
              onToggleMusic={toggleMuteMusic}
            />
          </motion.div>
        )}

        {screen === 'options' && (
          <motion.div
            key="options-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="min-h-screen flex items-center justify-center p-4 bg-black/95 pixel-grid"
          >
            <OptionsPanel
              keyBindings={keyBindings}
              onUpdateKeyBindings={handleUpdateKeyBindings}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onBack={() => setScreen('menu')}
            />
          </motion.div>
        )}

        {screen === 'game' && (
          <motion.div
            key="game-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen flex flex-col bg-neutral-950"
          >
            <GameCanvas
              keyBindings={keyBindings}
              settings={settings}
              onBackToMenu={() => setScreen('menu')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

