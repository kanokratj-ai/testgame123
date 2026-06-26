export interface KeyBindings {
  moveLeft: { key: string; label: string };
  moveRight: { key: string; label: string };
  jump: { key: string; label: string };
  attack: { key: string; label: string };
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  useOnScreenGamepad: boolean;
  gamepadOpacity: number;
}

export interface ScoreEntry {
  name: string;
  score: number;
  date: string;
}
