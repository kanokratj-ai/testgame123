import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Play, RotateCcw, Home, Volume2, VolumeX, Heart, Award, Flame, Gamepad2, Keyboard, Sparkles, Wand2 } from 'lucide-react';
import { KeyBindings, GameSettings, ScoreEntry } from '../types';
import { audio } from '../utils/audio';

interface GameCanvasProps {
  keyBindings: KeyBindings;
  settings: GameSettings;
  onBackToMenu: () => void;
}

interface Enemy3D {
  mesh: THREE.Mesh;
  x: number;
  z: number;
  speed: number;
  type: 'spirit' | 'fire' | 'beast';
  health: number;
  bobOffset: number;
  frame?: number;
  frameTimer?: number;
  state?: 'stand' | 'walk';
  flashTimer?: number;
  flashColor?: number;
  knockbackX?: number;
  knockbackZ?: number;
  knockbackTimer?: number;
  isDying?: boolean;
  deathVelocityX?: number;
  deathVelocityY?: number;
  deathVelocityZ?: number;
  deathSpinSpeed?: number;
  deathTimer?: number;
}

interface Grass3D {
  mesh: THREE.Mesh;
  x: number;
  z: number;
  currentScaleY: number;
}

interface Boss3D {
  mesh: THREE.Mesh;
  x: number;
  z: number;
  health: number;
  maxHealth: number;
  state: 'idle' | 'dash' | 'charge' | 'shoot' | 'dying';
  stateTimer: number;
  targetX: number;
  targetZ: number;
  bobOffset: number;
  pulseTimer: number;
  frame: number;
  frameTimer: number;
  flashTimer?: number;
  flashColor?: number;
  deathTimer?: number;
}

interface BossFireball3D {
  mesh: THREE.Mesh;
  warningMesh?: THREE.Mesh;
  targetX: number;
  targetZ: number;
  y: number;
  progress: number;
  duration: number;
}

interface WarpPortal3D {
  mesh: THREE.Mesh;
  x: number;
  z: number;
  active: boolean;
}

interface Npc3D {
  mesh: THREE.Mesh;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  state: 'walk' | 'idle' | 'dialogue';
  frame: number;
  frameTimer: number;
}

interface Coin3D {
  mesh: THREE.Mesh;
  x: number;
  z: number;
  collected: boolean;
  value: number;
}

interface Particle3D {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

interface Projectile3D {
  mesh: THREE.Mesh;
  vx: number;
  vz: number;
  life: number;
}

interface Item3D {
  mesh: THREE.Mesh;
  x: number;
  z: number;
  collected: boolean;
}

const dialogues = [
  {
    speaker: 'ลุงสมหมาย (นักอนุรักษ์วัฒนธรรม)',
    side: 'right',
    text: 'โอ้โห! เจ้าหนุ่ม! ข้าเฝ้ามองดูอยู่... เจ้าปราบเจ้าพญาวิญญาณร้ายผีตาโขนลงได้สำเร็จจริงๆ หรือนี่! ช่างกล้าหาญยิ่งนัก!',
    row: 0,
  },
  {
    speaker: 'ผู้กล้าด่านซ้าย (ตัวคุณ)',
    side: 'left',
    text: 'ขอบคุณครับลุงสมหมาย! มันพยายามจะเข้ามาปั่นป่วนและทำลายประเพณีบุญหลวงผีตาโขนของเรา ผมยอมให้เกิดขึ้นไม่ได้จริงๆ ครับ!',
    row: 0,
  },
  {
    speaker: 'ลุงสมหมาย (นักอนุกษ์วัฒนธรรม)',
    side: 'right',
    text: 'สุดยอดมาก! พลังดาบศักดิ์สิทธิ์และหน้ากากวิเศษที่เจ้าสวมใส่ ช่างส่องประกายขับไล่ความมืดมิดไปเสียสิ้น!',
    row: 0,
  },
  {
    speaker: 'ผู้กล้าด่านซ้าย (ตัวคุณ)',
    side: 'left',
    text: 'ทุกคนในอำเภอด่านซ้ายร่วมส่งแรงใจให้ผมด้วยครับ ดาบพญานาคเล่มนี้แผลงฤทธิ์ได้เพราะจิตใจอันบริสุทธิ์ของทุกคน!',
    row: 1,
  },
  {
    speaker: 'ลุงสมหมาย (นักอนุรักษ์วัฒนธรรม)',
    side: 'right',
    text: 'ชาวด่านซ้ายและเหล่านักท่องเที่ยวทุกคนจะต้องดีใจแน่ๆ ประเพณีละเล่นผีตาโขนปีนี้จะต้องเป็นปีที่สงบสุขและงดงามที่สุด!',
    row: 1,
  },
  {
    speaker: 'ผู้กล้าด่านซ้าย (ตัวคุณ)',
    side: 'left',
    text: 'ยินดีอย่างยิ่งครับ! ตอนนี้ด่านซ้ายปลอดภัยแล้ว เรากลับไปร่วมวงรำเซิ้งและทานมะม่วงอร่อยๆ ในงานกันเถอะครับลุง!',
    row: 3,
  },
  {
    speaker: 'ลุงสมหมาย (นักอนุรักษ์วัฒนธรรม)',
    side: 'right',
    text: 'ฮ่าๆๆ ถูกต้องแล้ว! ประตูมิติกำลังเปิดออก... มาร่วมเฉลิมฉลองด้วยกันในฐานะ "ฮีโร่ผู้พิทักษ์ด่านซ้าย" เถอะนะ!',
    row: 0,
  },
  {
    speaker: 'ผู้กล้าด่านซ้าย (ตัวคุณ)',
    side: 'left',
    text: 'ไปกันเลยครับลุง! ไปสนุกกับเสียงดนตรีแคน วงกลองยาว และขบวนแห่ผีตาโขนอันยิ่งใหญ่กัน!',
    row: 3,
  },
];

export default function GameCanvas({ keyBindings, settings, onBackToMenu }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // React Game States
  const [score, setScore] = useState(0);
  const [coinsCount, setCoinsCount] = useState(0);
  const [health, setHealth] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScores, setHighScores] = useState<ScoreEntry[]>([]);
  const [playerName, setPlayerName] = useState('ผู้กล้าด่านซ้าย');
  const [isScoreSaved, setIsScoreSaved] = useState(false);
  const [bossHealth, setBossHealth] = useState<number | null>(null);
  const [isVictory, setIsVictory] = useState(false);
  const [inDialogue, setInDialogue] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [dialogueFrame, setDialogueFrame] = useState(0);
  const [showFinishScreen, setShowFinishScreen] = useState(false);

  // Shared state refs for the 3D loop
  const inputRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
    dance: false,
  });

  const gameStateRef = useRef({
    score: 0,
    coins: 0,
    health: 5,
    isPlaying: false,
    isGameOver: false,
    isPaused: false,
    playerPosition: { x: 0, z: 0 },
    playerDirection: { x: 0, z: 1 },
    playerState: 'idle' as 'idle' | 'walk' | 'attack' | 'dance',
    playerFrame: 0,
    playerFrameTimer: 0,
    attackCooldown: 0,
    danceCooldown: 0,
    defeatedCount: 0,
    isVictory: false,
    spawnThreshold: 100,
    inDialogue: false,
    npcSpawned: false,
  });

  const togglePause = React.useCallback(() => {
    const gState = gameStateRef.current;
    if (!gState.isPlaying || gState.isGameOver) return;
    const nextPaused = !gState.isPaused;
    gState.isPaused = nextPaused;
    setIsPaused(nextPaused);
    if (nextPaused) {
      audio.stopMusic();
    } else {
      audio.startMusic();
    }
  }, []);

  // Load Highscores on mount
  useEffect(() => {
    const saved = localStorage.getItem('dansai_highscores');
    if (saved) {
      try {
        setHighScores(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Dialogue sprite frame animation
  useEffect(() => {
    if (!inDialogue) return;
    const interval = setInterval(() => {
      setDialogueFrame((prev) => (prev + 1) % 4);
    }, 150);
    return () => clearInterval(interval);
  }, [inDialogue]);

  const progressDialogue = React.useCallback(() => {
    setDialogueIndex((prev) => {
      if (prev >= 7) {
        setInDialogue(false);
        gameStateRef.current.inDialogue = false;
        setShowFinishScreen(true);
        return prev;
      }
      audio.playCoin();
      return prev + 1;
    });
  }, []);

  // Set up standard Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;

      if (inDialogue) {
        if (['Space', 'Enter', 'KeyE'].includes(code)) {
          e.preventDefault();
          progressDialogue();
        }
        return;
      }

      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyP', 'KeyO', 'Escape'].includes(code)) {
        e.preventDefault(); // prevent window scrolling
      }

      // Movement
      if (code === 'KeyW' || code === 'ArrowUp') inputRef.current.up = true;
      if (code === 'KeyS' || code === 'ArrowDown') inputRef.current.down = true;
      if (code === 'KeyA' || code === 'ArrowLeft') inputRef.current.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') inputRef.current.right = true;

      // Special Actions
      if (code === 'KeyP') inputRef.current.attack = true;
      if (code === 'KeyO') inputRef.current.dance = true;

      if (code === 'Escape') {
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (inDialogue) return;

      if (code === 'KeyW' || code === 'ArrowUp') inputRef.current.up = false;
      if (code === 'KeyS' || code === 'ArrowDown') inputRef.current.down = false;
      if (code === 'KeyA' || code === 'ArrowLeft') inputRef.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') inputRef.current.right = false;

      if (code === 'KeyP') inputRef.current.attack = false;
      if (code === 'KeyO') inputRef.current.dance = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [togglePause, inDialogue, progressDialogue]);

  // 3D Engine Setup Loop
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.FogExp2(0x050505, 0.025);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / 350, 0.1, 1000);
    // Position camera slightly looking down from an angle
    camera.position.set(0, 14, 18);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, Math.min(window.innerHeight * 0.62, 480));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xff4444, 1.2); // Warm red culture hue
    dirLight.position.set(10, 20, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Warm glow point light centered near the scene center
    const centerLight = new THREE.PointLight(0xff9900, 1.5, 30);
    centerLight.position.set(0, 5, 0);
    scene.add(centerLight);

    // TEXTURE LOADER
    const textureLoader = new THREE.TextureLoader();

    // 1. GROUND PLANE (50x50 with tiled ground.png)
    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundTex = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/ground_d1kjrx.png',
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(15, 15); // Tile it small
      }
    );
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.85,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Add boundaries (decorative lit pillars representing ancient Thai gates)
    const boundaryPillars: THREE.Mesh[] = [];
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.6, 5, 8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.6,
    });
    const capGeo = new THREE.SphereGeometry(0.7, 8, 8);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48, // Glowing red top
      emissive: 0xe11d48,
      emissiveIntensity: 1.5,
    });

    const spawnPillar = (x: number, z: number) => {
      const pGroup = new THREE.Group();
      const pMesh = new THREE.Mesh(pillarGeo, pillarMat);
      pMesh.position.y = 2.5;
      pMesh.castShadow = true;
      pGroup.add(pMesh);

      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 5.2;
      pGroup.add(cap);

      pGroup.position.set(x, 0, z);
      scene.add(pGroup);
    };

    // Spawn pillars at the four corners and along borders
    const boundaryLimit = 24.5;
    spawnPillar(-boundaryLimit, -boundaryLimit);
    spawnPillar(boundaryLimit, -boundaryLimit);
    spawnPillar(-boundaryLimit, boundaryLimit);
    spawnPillar(boundaryLimit, boundaryLimit);
    spawnPillar(0, -boundaryLimit);
    spawnPillar(0, boundaryLimit);
    spawnPillar(-boundaryLimit, 0);
    spawnPillar(boundaryLimit, 0);

    // 2. PLAYER BILLBOARD MESH
    const playerGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const playerTex = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439981/player_mask_fmn9yv.png',
      (texture) => {
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(0.25, 0.25); // 4x4 Grid
      }
    );
    const playerMat = new THREE.MeshStandardMaterial({
      map: playerTex,
      transparent: true,
      alphaTest: 0.4,
      side: THREE.DoubleSide,
    });
    const playerMesh = new THREE.Mesh(playerGeo, playerMat);
    playerMesh.position.y = 1.75;
    playerMesh.castShadow = true;
    scene.add(playerMesh);

    // Red mask item texture loader
    const itemTex = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439981/item_a371ol.png'
    );

    // Grass texture loader
    const grassTex = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/grass_2_kjkske.png'
    );

    // Enemy texture loader
    const enemyTex = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/enemy_mp1zhh.png',
      (tex) => {
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(0.25, 0.5); // 4 columns, 2 rows
      }
    );

    // Boss texture loader
    const bossTex = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/boss_pblkge.png',
      (tex) => {
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(0.5, 0.5); // 2 columns, 2 rows
      }
    );

    // NPC texture loader
    const npcTex = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/npc1_pdraha.png',
      (tex) => {
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(0.25, 0.5); // 4 columns, 2 rows
      }
    );

    // 3. FLOATING LANTERNS (โคมลอย)
    const lanterns: { mesh: THREE.Mesh; speed: number; rotSpeed: number }[] = [];
    const lanternGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.8, 8);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.2,
      transparent: true,
      opacity: 0.9,
    });

    for (let i = 0; i < 8; i++) {
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(
        (Math.random() - 0.5) * 44,
        Math.random() * 15,
        (Math.random() - 0.5) * 44
      );
      scene.add(lantern);
      lanterns.push({
        mesh: lantern,
        speed: 0.02 + Math.random() * 0.03,
        rotSpeed: 0.01 + Math.random() * 0.02,
      });
    }

    // GAMEPLAY ENTITIES
    let coinsList: Coin3D[] = [];
    let itemsList: Item3D[] = [];
    let enemiesList: Enemy3D[] = [];
    let grassList: Grass3D[] = [];
    let particlesList: Particle3D[] = [];
    let projectilesList: Projectile3D[] = [];
    let boss: Boss3D | null = null;
    let bossFireballsList: BossFireball3D[] = [];
    let warpPortal: WarpPortal3D | null = null;
    let npc: Npc3D | null = null;

    // Grass setup and spawn
    const grassGeo = new THREE.PlaneGeometry(1.8, 1.8);
    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      transparent: true,
      alphaTest: 0.3,
      side: THREE.DoubleSide,
    });

    const spawnGrass = () => {
      const gMesh = new THREE.Mesh(grassGeo, grassMat.clone());
      gMesh.castShadow = true;
      const gx = (Math.random() - 0.5) * 44;
      const gz = (Math.random() - 0.5) * 44;
      gMesh.position.set(gx, 0.9, gz);
      gMesh.rotation.y = Math.random() * Math.PI * 2;
      scene.add(gMesh);
      grassList.push({
        mesh: gMesh,
        x: gx,
        z: gz,
        currentScaleY: 1.0,
      });
    };

    for (let i = 0; i < 30; i++) {
      spawnGrass();
    }

    // Helper: Spawn single coin
    const spawnCoin = () => {
      const coinGeo = new THREE.TorusGeometry(0.35, 0.1, 8, 24);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
      });
      const mesh = new THREE.Mesh(coinGeo, coinMat);
      mesh.castShadow = true;
      mesh.position.set(
        (Math.random() - 0.5) * 40,
        0.8,
        (Math.random() - 0.5) * 40
      );
      scene.add(mesh);
      coinsList.push({
        mesh,
        x: mesh.position.x,
        z: mesh.position.z,
        collected: false,
        value: 10,
      });
    };

    // Helper: Spawn single healing item (Red Mask)
    const itemGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const itemMat = new THREE.MeshStandardMaterial({
      map: itemTex,
      transparent: true,
      alphaTest: 0.35,
      side: THREE.DoubleSide,
    });

    const spawnItem = () => {
      const mesh = new THREE.Mesh(itemGeo, itemMat);
      mesh.castShadow = true;
      const rx = (Math.random() - 0.5) * 40;
      const rz = (Math.random() - 0.5) * 40;
      mesh.position.set(rx, 0.8, rz);
      scene.add(mesh);
      itemsList.push({
        mesh,
        x: rx,
        z: rz,
        collected: false,
      });
    };

    // Spawn initial coins
    for (let i = 0; i < 15; i++) {
      spawnCoin();
    }

    // Spawn initial healing items (Red Masks)
    for (let i = 0; i < 3; i++) {
      spawnItem();
    }

    // Helper: Spawn single enemy spirit (Dan Sai Monster)
    const enemyGeo = new THREE.PlaneGeometry(3.0, 3.0);
    const spawnEnemy = () => {
      const individualEnemyTex = enemyTex.clone();
      individualEnemyTex.needsUpdate = true;
      const eMat = new THREE.MeshStandardMaterial({
        map: individualEnemyTex,
        transparent: true,
        alphaTest: 0.35,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(enemyGeo, eMat);
      mesh.castShadow = true;

      // Random outer position (along plane edges)
      const angle = Math.random() * Math.PI * 2;
      const dist = 26; // start outside boundaries
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      mesh.position.set(x, 1.5, z);
      scene.add(mesh);

      enemiesList.push({
        mesh,
        x,
        z,
        speed: 0.035 + Math.random() * 0.03,
        type: 'spirit',
        health: 2, // Start with 2 HP
        bobOffset: Math.random() * 100,
        frame: 0,
        frameTimer: 0,
        state: 'walk',
      });
    };

    // Helper: Spawn 3D particles for skills or hits
    const spawnParticles = (originX: number, originY: number, originZ: number, count: number, color: number) => {
      const pGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
      const pMat = new THREE.MeshBasicMaterial({ color, transparent: true });

      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(pGeo, pMat.clone());
        mesh.position.set(originX, originY, originZ);
        scene.add(mesh);

        particlesList.push({
          mesh,
          vx: (Math.random() - 0.5) * 0.2,
          vy: Math.random() * 0.15 + 0.05,
          vz: (Math.random() - 0.5) * 0.2,
          life: 0,
          maxLife: 20 + Math.random() * 15,
        });
      }
    };

    // Helper: Trigger Holy Dance shockwave ring (Skill O)
    const spawnHolyRing = (px: number, pz: number) => {
      const ringGeo = new THREE.RingGeometry(0.5, 0.7, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(px, 0.15, pz);
      scene.add(ringMesh);

      // Push to projectiles to scale and fade
      projectilesList.push({
        mesh: ringMesh,
        vx: 0,
        vz: 0,
        life: 40, // frames alive
      });
    };

    // Helper: Trigger attack slash (P)
    const spawnAttackSlash = (px: number, pz: number, dx: number, dz: number) => {
      const slashGeo = new THREE.PlaneGeometry(2, 1);
      const slashMat = new THREE.MeshBasicMaterial({
        color: 0xef4444, // Glowing fire red
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const slashMesh = new THREE.Mesh(slashGeo, slashMat);
      slashMesh.rotation.y = Math.atan2(dx, dz);
      slashMesh.position.set(px + dx * 1.5, 1.2, pz + dz * 1.5);
      scene.add(slashMesh);

      projectilesList.push({
        mesh: slashMesh,
        vx: dx * 0.25,
        vz: dz * 0.25,
        life: 20,
      });
    };

    // RESIZING ACTION
    const handleResize = () => {
      if (containerRef.current && canvas) {
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // TIMERS / SPAWNING INTERVALS
    let spawnTimer = 0;

    // --- ANIMATION FRAME ENGINE LOOP ---
    let frameId: number;

    const tick = () => {
      const keys = inputRef.current;
      const gState = gameStateRef.current;

      if (gState.isPlaying && !gState.isGameOver && !gState.isPaused) {
        // Increment global score ticking
        gState.score += 1;
        if (gState.score % 10 === 0) {
          setScore(gState.score);
        }

        // --- 1. PLAYER MOVEMENT & ANIMATION CODES ---
        let moveX = 0;
        let moveZ = 0;

        if (!gState.inDialogue) {
          if (keys.up) moveZ -= 1;
          if (keys.down) moveZ += 1;
          if (keys.left) moveX -= 1;
          if (keys.right) moveX += 1;
        }

        // Perform attack triggers
        if (!gState.inDialogue && keys.attack && gState.attackCooldown <= 0) {
          gState.playerState = 'attack';
          gState.playerFrame = 0;
          gState.playerFrameTimer = 0;
          gState.attackCooldown = 25; // cooldown frames
          audio.playAttack();

          // Spawn physical attack projectile
          spawnAttackSlash(
            playerMesh.position.x,
            playerMesh.position.z,
            gState.playerDirection.x,
            gState.playerDirection.z
          );
        }

        // Perform dance/skill triggers
        if (!gState.inDialogue && keys.dance && gState.danceCooldown <= 0) {
          gState.playerState = 'dance';
          gState.playerFrame = 0;
          gState.playerFrameTimer = 0;
          gState.danceCooldown = 50; // dance longer
          audio.playJump();

          // Spawn expanding holy protection ring
          spawnHolyRing(playerMesh.position.x, playerMesh.position.z);
        }

        // Apply coodlown tickdowns
        if (gState.attackCooldown > 0) gState.attackCooldown--;
        if (gState.danceCooldown > 0) gState.danceCooldown--;

        // Resolve normal idle/walking states if not locking actions
        const isActionLocked = gState.playerState === 'attack' || gState.playerState === 'dance';

        if (!isActionLocked) {
          if (moveX !== 0 || moveZ !== 0) {
            gState.playerState = 'walk';
            // Normalize
            const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
            const dx = moveX / length;
            const dz = moveZ / length;

            // Apply speed to position
            const playerSpeed = 0.15;
            playerMesh.position.x += dx * playerSpeed;
            playerMesh.position.z += dz * playerSpeed;

            // Save facing direction
            gState.playerDirection.x = dx;
            gState.playerDirection.z = dz;

            // Bound position inside 50x50 arena
            const bound = 23.5;
            playerMesh.position.x = THREE.MathUtils.clamp(playerMesh.position.x, -bound, bound);
            playerMesh.position.z = THREE.MathUtils.clamp(playerMesh.position.z, -bound, bound);

            // Flip character billboard scale X to match movement left/right
            if (dx < 0) {
              playerMesh.scale.x = -1; // Flip horizontal
            } else if (dx > 0) {
              playerMesh.scale.x = 1;
            }
          } else {
            gState.playerState = 'idle';
          }
        }

        if (gState.inDialogue) {
          gState.playerState = 'idle';
          if (npc) {
            const pdx = npc.mesh.position.x - playerMesh.position.x;
            if (pdx < 0) {
              playerMesh.scale.x = -1;
            } else if (pdx > 0) {
              playerMesh.scale.x = 1;
            }
          }
        }

        // 2D Character sprite Sheet offset updater
        gState.playerFrameTimer++;
        if (gState.playerFrameTimer >= (gState.playerState === 'dance' ? 4 : 8)) {
          gState.playerFrameTimer = 0;
          gState.playerFrame = (gState.playerFrame + 1) % 4;

          // If action finished, reset to idle
          if (gState.playerFrame === 0 && isActionLocked) {
            gState.playerState = 'idle';
          }
        }

        // Texture Grid Offset Mapper
        // Rows: Row 1 is top, Row 4 is bottom
        let rowIdx = 0; // Top row: Idle (offset.y = 0.75)
        if (gState.playerState === 'walk') rowIdx = 1; // Row 2 (offset.y = 0.50)
        if (gState.playerState === 'attack') rowIdx = 2; // Row 3 (offset.y = 0.25)
        if (gState.playerState === 'dance') rowIdx = 3; // Row 4 (offset.y = 0.0)

        // Set repeat & offset
        playerTex.offset.set(gState.playerFrame * 0.25, 0.75 - rowIdx * 0.25);

        // Keep player position saved for camera logic
        gState.playerPosition.x = playerMesh.position.x;
        gState.playerPosition.z = playerMesh.position.z;

        // --- 2. CAMERA CHASE DAMPING SYSTEM ---
        // Camera smooth lerp behind player at specific top-down perspective
        const targetCamX = playerMesh.position.x;
        const targetCamZ = playerMesh.position.z + 13.5;
        const targetCamY = 12.0;

        camera.position.x += (targetCamX - camera.position.x) * 0.08;
        camera.position.z += (targetCamZ - camera.position.z) * 0.08;
        camera.position.y += (targetCamY - camera.position.y) * 0.08;
        camera.lookAt(playerMesh.position.x, 1, playerMesh.position.z);

        // --- 3. ENEMIES / SPIRITS BEHAVIOR ---
        spawnTimer++;
        if (spawnTimer >= (gState.spawnThreshold || 70)) {
          spawnTimer = 0;
          gState.spawnThreshold = 60 + Math.random() * 120; // 1 to 3 seconds randomly
          
          // Spawn enemies if we haven't beaten the boss (no warp portal), but cap to a lower amount if boss is active
          const maxEnemies = boss ? 3 : 12;
          if (enemiesList.length < maxEnemies && !warpPortal) {
            spawnEnemy();
          }
        }

        for (let i = enemiesList.length - 1; i >= 0; i--) {
          const e = enemiesList[i];

          // 1. If enemy is in dying sequence
          if (e.isDying) {
            e.mesh.position.x += e.deathVelocityX || 0;
            e.mesh.position.y += e.deathVelocityY || 0;
            e.mesh.position.z += e.deathVelocityZ || 0;

            // gravity pull
            e.deathVelocityY = (e.deathVelocityY || 0) - 0.015;

            // spin
            e.mesh.rotation.y += e.deathSpinSpeed || 0;
            e.mesh.rotation.z += (e.deathSpinSpeed || 0) * 0.5;

            // scale down
            e.deathTimer = (e.deathTimer || 40) - 1;
            const sf = Math.max(0, e.deathTimer / 40);
            e.mesh.scale.set(sf * (e.mesh.scale.x > 0 ? 1 : -1), sf, sf);

            // rapid flash white
            if (e.mesh.material instanceof THREE.MeshStandardMaterial) {
              if (Math.floor(Date.now() / 40) % 2 === 0) {
                e.mesh.material.color.setHex(0xffffff);
                e.mesh.material.emissive.setHex(0xffffff);
                e.mesh.material.emissiveIntensity = 2.0;
              } else {
                e.mesh.material.color.setHex(0x222222);
                e.mesh.material.emissive.setHex(0x000000);
                e.mesh.material.emissiveIntensity = 0;
              }
            }

            if (e.deathTimer <= 0) {
              scene.remove(e.mesh);
              enemiesList.splice(i, 1);
            }
            continue;
          }

          // 2. Compute angle towards player
          const dirX = gState.playerPosition.x - e.mesh.position.x;
          const dirZ = gState.playerPosition.z - e.mesh.position.z;
          const dist = Math.sqrt(dirX * dirX + dirZ * dirZ);

          // 3. Movement or knockback
          if (e.knockbackTimer && e.knockbackTimer > 0) {
            e.knockbackTimer--;
            e.mesh.position.x += e.knockbackX || 0;
            e.mesh.position.z += e.knockbackZ || 0;
            // damp knockback
            e.knockbackX = (e.knockbackX || 0) * 0.85;
            e.knockbackZ = (e.knockbackZ || 0) * 0.85;
            e.state = 'stand';
          } else {
            if (dist > 0.1) {
              e.mesh.position.x += (dirX / dist) * e.speed;
              e.mesh.position.z += (dirZ / dist) * e.speed;
            }
            e.state = 'walk';

            // Flip horizontally according to horizontal movement direction (facing left is scale.x = 1)
            e.mesh.scale.x = dirX > 0 ? -1 : 1;
          }

          // Eerie float bobbing
          e.mesh.position.y = 1.3 + Math.sin(Date.now() * 0.004 + e.bobOffset) * 0.15;

          // Animate and update frame textures
          e.frameTimer = (e.frameTimer || 0) + 1;
          if (e.frameTimer >= 8) {
            e.frameTimer = 0;
            e.frame = ((e.frame || 0) + 1) % 4;
          }

          if (e.mesh.material instanceof THREE.MeshStandardMaterial && e.mesh.material.map) {
            const colIdx = e.frame || 0;
            const rowIdx = e.state === 'stand' ? 0 : 1; // Row 1 (Stand, top row), Row 2 (Walk, bottom row)
            e.mesh.material.map.offset.set(colIdx * 0.25, 0.5 - rowIdx * 0.5);
          }

          // Flashing effects (Red for attacking, White for hit)
          if (e.flashTimer && e.flashTimer > 0) {
            e.flashTimer--;
            if (e.mesh.material instanceof THREE.MeshStandardMaterial) {
              if (Math.floor(e.flashTimer / 3) % 2 === 0) {
                e.mesh.material.color.setHex(e.flashColor || 0xffffff);
                if (e.flashColor === 0xff0000) {
                  e.mesh.material.emissive.setHex(0xff0000);
                  e.mesh.material.emissiveIntensity = 1.5;
                }
              } else {
                e.mesh.material.color.setHex(0xffffff);
                e.mesh.material.emissive.setHex(0x000000);
                e.mesh.material.emissiveIntensity = 0;
              }
            }
          } else {
            if (e.mesh.material instanceof THREE.MeshStandardMaterial) {
              e.mesh.material.color.setHex(0xffffff);
              e.mesh.material.emissive.setHex(0x000000);
              e.mesh.material.emissiveIntensity = 0;
            }
          }

          // Collision with Player check
          if (dist < 1.1) {
            // Hurt player if not already flashing
            if (!e.flashTimer || e.flashTimer <= 0) {
              gState.health--;
              setHealth(gState.health);
              audio.playHit();
              spawnParticles(playerMesh.position.x, 1.2, playerMesh.position.z, 8, 0xff0000);

              // Start attack blink (Red)
              e.flashTimer = 25;
              e.flashColor = 0xff0000;

              // Bounce back
              e.knockbackX = -dirX / (dist || 1) * 1.5;
              e.knockbackZ = -dirZ / (dist || 1) * 1.5;
              e.knockbackTimer = 15;

              if (gState.health <= 0) {
                gState.isGameOver = true;
                setIsGameOver(true);
                audio.playHit();
                audio.stopMusic();
              }
            }
          }
        }

        // --- 3.5. GRASS INTERACTION BEHAVIOR ---
        for (let g = 0; g < grassList.length; g++) {
          const grass = grassList[g];
          const gdx = playerMesh.position.x - grass.x;
          const gdz = playerMesh.position.z - grass.z;
          const gdist = Math.sqrt(gdx * gdx + gdz * gdz);

          if (gdist < 1.3) {
            // Flatten scale Y down (extremely responsive scale physics)
            grass.currentScaleY += (0.15 - grass.currentScaleY) * 0.25;
          } else {
            // Restore scale Y
            grass.currentScaleY += (1.0 - grass.currentScaleY) * 0.15;
          }

          grass.mesh.scale.y = grass.currentScaleY;
          grass.mesh.position.y = 0.9 * grass.currentScaleY;
        }

        // --- 3.6. BOSS AI & BEHAVIOR ---
        // Spawn boss when player defeats 10 enemies
        if (gState.defeatedCount >= 10 && !boss && !warpPortal) {
          // Spawn the Boss!
          const bossGeo = new THREE.PlaneGeometry(5.0, 5.0);
          const bMat = new THREE.MeshStandardMaterial({
            map: bossTex.clone(),
            transparent: true,
            alphaTest: 0.35,
            side: THREE.DoubleSide,
          });
          const bMesh = new THREE.Mesh(bossGeo, bMat);
          bMesh.castShadow = true;
          bMesh.position.set(0, 3.5, -15);
          scene.add(bMesh);

          boss = {
            mesh: bMesh,
            x: 0,
            z: -15,
            health: 12,
            maxHealth: 12,
            state: 'idle',
            stateTimer: 0,
            targetX: 0,
            targetZ: -5,
            bobOffset: Math.random() * 100,
            pulseTimer: 0,
            frame: 0,
            frameTimer: 0,
          };
          setBossHealth(12);
          spawnParticles(0, 3.5, -15, 30, 0xff5500);
          audio.playJump();
        }

        if (boss) {
          boss.stateTimer++;

          // Hit Flashing
          if (boss.flashTimer && boss.flashTimer > 0) {
            boss.flashTimer--;
            if (boss.mesh.material instanceof THREE.MeshStandardMaterial) {
              if (Math.floor(boss.flashTimer / 3) % 2 === 0) {
                boss.mesh.material.color.setHex(boss.flashColor || 0xffffff);
                boss.mesh.material.emissive.setHex(0xff3300);
                boss.mesh.material.emissiveIntensity = 1.5;
              } else {
                boss.mesh.material.color.setHex(0xffffff);
                boss.mesh.material.emissive.setHex(0x000000);
                boss.mesh.material.emissiveIntensity = 0;
              }
            }
          } else {
            if (boss.mesh.material instanceof THREE.MeshStandardMaterial) {
              boss.mesh.material.color.setHex(0xffffff);
              boss.mesh.material.emissive.setHex(0x000000);
              boss.mesh.material.emissiveIntensity = 0;
            }
          }

          // Frame animation mapping "2 frame 2 แถว"
          boss.frameTimer = (boss.frameTimer || 0) + 1;
          if (boss.frameTimer >= 10) {
            boss.frameTimer = 0;
            boss.frame = ((boss.frame || 0) + 1) % 2;
          }

          if (boss.mesh.material instanceof THREE.MeshStandardMaterial && boss.mesh.material.map) {
            const colIdx = boss.frame || 0;
            const rowIdx = (boss.state === 'charge' || boss.state === 'shoot') ? 1 : 0;
            boss.mesh.material.map.offset.set(colIdx * 0.5, 0.5 - rowIdx * 0.5);
          }

          // Flip horizontal towards player
          const dirToPlayerX = playerMesh.position.x - boss.mesh.position.x;
          boss.mesh.scale.x = dirToPlayerX > 0 ? -2.2 : 2.2;
          boss.mesh.scale.y = 2.2;

          if (boss.state === 'idle') {
            boss.mesh.position.y = 3.5 + Math.sin(Date.now() * 0.003 + boss.bobOffset) * 0.4;
            
            const dx = boss.targetX - boss.mesh.position.x;
            const dz = boss.targetZ - boss.mesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > 0.1) {
              boss.mesh.position.x += (dx / dist) * 0.05;
              boss.mesh.position.z += (dz / dist) * 0.05;
            }

            if (boss.stateTimer > 110) {
              boss.stateTimer = 0;
              const r = Math.random();
              if (r < 0.45) {
                boss.state = 'dash';
                const dashNear = Math.random() < 0.6;
                if (dashNear) {
                  boss.targetX = playerMesh.position.x + (Math.random() - 0.5) * 8;
                  boss.targetZ = playerMesh.position.z + (Math.random() - 0.5) * 8;
                } else {
                  boss.targetX = (Math.random() - 0.5) * 36;
                  boss.targetZ = (Math.random() - 0.5) * 36;
                }
              } else {
                boss.state = 'charge';
              }
            }
          } else if (boss.state === 'dash') {
            const dx = boss.targetX - boss.mesh.position.x;
            const dz = boss.targetZ - boss.mesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > 0.3) {
              boss.mesh.position.x += (dx / dist) * 0.22;
              boss.mesh.position.z += (dz / dist) * 0.22;
              boss.mesh.position.y = 3.2 + Math.sin(Date.now() * 0.01) * 0.2;
            } else {
              boss.state = 'idle';
              boss.stateTimer = 0;
              boss.targetX = (Math.random() - 0.5) * 20;
              boss.targetZ = (Math.random() - 0.5) * 20;
            }

            if (boss.stateTimer > 90) {
              boss.state = 'idle';
              boss.stateTimer = 0;
            }
          } else if (boss.state === 'charge') {
            const pulse = 2.2 + Math.sin(boss.stateTimer * 0.45) * 0.5;
            boss.mesh.scale.set(pulse * (boss.mesh.scale.x > 0 ? 1 : -1), pulse, pulse);
            boss.mesh.position.y = 3.5 + Math.sin(Date.now() * 0.008) * 0.1;

            if (boss.stateTimer > 80) {
              boss.state = 'shoot';
              boss.stateTimer = 0;
            }
          } else if (boss.state === 'shoot') {
            const spawnBossFireball = (tx: number, tz: number) => {
              const fbGeo = new THREE.SphereGeometry(0.5, 12, 12);
              const fbMat = new THREE.MeshStandardMaterial({
                color: 0xff3300,
                emissive: 0xff3300,
                emissiveIntensity: 2.0,
              });
              const fbMesh = new THREE.Mesh(fbGeo, fbMat);
              fbMesh.castShadow = true;
              fbMesh.position.set(tx, 16, tz);
              scene.add(fbMesh);

              const warnGeo = new THREE.RingGeometry(0.1, 1.4, 16);
              const warnMat = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.1,
              });
              const warnMesh = new THREE.Mesh(warnGeo, warnMat);
              warnMesh.rotation.x = -Math.PI / 2;
              warnMesh.position.set(tx, 0.05, tz);
              scene.add(warnMesh);

              bossFireballsList.push({
                mesh: fbMesh,
                warningMesh: warnMesh,
                targetX: tx,
                targetZ: tz,
                y: 16,
                progress: 0,
                duration: 70 + Math.random() * 30,
              });
            };

            spawnBossFireball(playerMesh.position.x, playerMesh.position.z);
            for (let f = 0; f < 3; f++) {
              const angle = Math.random() * Math.PI * 2;
              const d = 3.0 + Math.random() * 6.5;
              const tx = playerMesh.position.x + Math.cos(angle) * d;
              const tz = playerMesh.position.z + Math.sin(angle) * d;
              const bound = 23.5;
              const ctx = THREE.MathUtils.clamp(tx, -bound, bound);
              const ctz = THREE.MathUtils.clamp(tz, -bound, bound);
              spawnBossFireball(ctx, ctz);
            }

            audio.playAttack();
            spawnParticles(boss.mesh.position.x, boss.mesh.position.y, boss.mesh.position.z, 15, 0xff5500);

            boss.state = 'idle';
            boss.stateTimer = 0;
            boss.targetX = (Math.random() - 0.5) * 20;
            boss.targetZ = (Math.random() - 0.5) * 20;
          } else if (boss.state === 'dying') {
            boss.deathTimer = (boss.deathTimer || 80) - 1;
            boss.mesh.position.y += 0.05;
            boss.mesh.rotation.y += 0.15;
            boss.mesh.rotation.z += 0.05;

            if (boss.deathTimer % 4 === 0) {
              spawnParticles(
                boss.mesh.position.x + (Math.random() - 0.5) * 3,
                boss.mesh.position.y + (Math.random() - 0.5) * 3,
                boss.mesh.position.z + (Math.random() - 0.5) * 3,
                6,
                0xffaa00
              );
              audio.playHit();
            }

            if (boss.deathTimer <= 0) {
              spawnParticles(boss.mesh.position.x, boss.mesh.position.y, boss.mesh.position.z, 45, 0xff0000);
              scene.remove(boss.mesh);
              boss = null;
              setBossHealth(null);

              // Clear remaining standard enemies
              for (const enemy of enemiesList) {
                scene.remove(enemy.mesh);
              }
              enemiesList = [];

              const portalGeo = new THREE.TorusGeometry(1.6, 0.25, 12, 32);
              const portalMat = new THREE.MeshStandardMaterial({
                color: 0x06b6d4,
                emissive: 0x06b6d4,
                emissiveIntensity: 2.5,
              });
              const pMesh = new THREE.Mesh(portalGeo, portalMat);
              pMesh.position.set(0, 1.8, 0);
              scene.add(pMesh);

              warpPortal = {
                mesh: pMesh,
                x: 0,
                z: 0,
                active: true,
              };

              // Spawn NPC
              const npcGeo = new THREE.PlaneGeometry(3.0, 3.0);
              const npcMat = new THREE.MeshStandardMaterial({
                map: npcTex.clone(),
                transparent: true,
                alphaTest: 0.35,
                side: THREE.DoubleSide,
              });
              const npcMesh = new THREE.Mesh(npcGeo, npcMat);
              npcMesh.castShadow = true;
              npcMesh.position.set(0, 1.5, -4);
              scene.add(npcMesh);

              npc = {
                mesh: npcMesh,
                x: 0,
                z: -4,
                targetX: playerMesh.position.x,
                targetZ: playerMesh.position.z,
                state: 'walk',
                frame: 0,
                frameTimer: 0,
              };

              gState.npcSpawned = true;

              spawnParticles(0, 1.8, 0, 30, 0x06b6d4);
            }
          }
        }

        // --- 3.7. BOSS FIREBALLS UPDATE ---
        for (let i = bossFireballsList.length - 1; i >= 0; i--) {
          const fb = bossFireballsList[i];
          fb.progress += 1 / fb.duration;

          fb.y = 16 - (16 - 0.15) * fb.progress;
          fb.mesh.position.y = fb.y;
          fb.mesh.rotation.x += 0.05;
          fb.mesh.rotation.y += 0.05;

          if (fb.warningMesh) {
            (fb.warningMesh.material as any).opacity = fb.progress * 0.75;
            const wScale = 0.2 + fb.progress * 1.0;
            fb.warningMesh.scale.set(wScale, wScale, 1);
          }

          if (fb.progress >= 1.0) {
            spawnParticles(fb.targetX, 0.15, fb.targetZ, 14, 0xff4400);
            audio.playHit();

            const pdx = playerMesh.position.x - fb.targetX;
            const pdz = playerMesh.position.z - fb.targetZ;
            const pdist = Math.sqrt(pdx * pdx + pdz * pdz);
            if (pdist < 1.6) {
              gState.health--;
              setHealth(gState.health);
              audio.playHit();
              spawnParticles(playerMesh.position.x, 1.2, playerMesh.position.z, 10, 0xff0000);

              if (gState.health <= 0) {
                gState.isGameOver = true;
                setIsGameOver(true);
                audio.playHit();
                audio.stopMusic();
              }
            }

            scene.remove(fb.mesh);
            if (fb.warningMesh) scene.remove(fb.warningMesh);
            bossFireballsList.splice(i, 1);
          }
        }

        // --- 3.8. WARP PORTAL UPDATE ---
        if (warpPortal && warpPortal.active) {
          warpPortal.mesh.rotation.y += 0.04;
          warpPortal.mesh.rotation.z += 0.02;

          const pdx = playerMesh.position.x - warpPortal.x;
          const pdz = playerMesh.position.z - warpPortal.z;
          const pdist = Math.sqrt(pdx * pdx + pdz * pdz);
          if (pdist < 1.4 && !gState.inDialogue && !gState.isVictory) {
            gState.isVictory = true;
            setIsVictory(true);
            audio.playCoin();
            audio.stopMusic();
          }
        }

        // --- 3.9. NPC UPDATE ---
        if (npc) {
          npc.frameTimer = (npc.frameTimer || 0) + 1;
          if (npc.frameTimer >= 8) {
            npc.frameTimer = 0;
            npc.frame = ((npc.frame || 0) + 1) % 4;
          }

          if (npc.state === 'walk') {
            const dx = playerMesh.position.x - npc.mesh.position.x;
            const dz = playerMesh.position.z - npc.mesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist > 2.5) {
              npc.mesh.position.x += (dx / dist) * 0.055;
              npc.mesh.position.z += (dz / dist) * 0.055;
              npc.mesh.position.y = 1.5 + Math.sin(Date.now() * 0.012) * 0.12;
              npc.mesh.scale.x = dx > 0 ? -1.8 : 1.8;
              npc.mesh.scale.y = 1.8;
            } else {
              npc.state = 'idle';
              gState.inDialogue = true;
              setInDialogue(true);
              setDialogueIndex(0);
              audio.playCoin();
            }
          } else {
            npc.mesh.position.y = 1.5 + Math.sin(Date.now() * 0.003) * 0.06;
            const dx = playerMesh.position.x - npc.mesh.position.x;
            npc.mesh.scale.x = dx > 0 ? -1.8 : 1.8;
            npc.mesh.scale.y = 1.8;
          }

          if (npc.mesh.material instanceof THREE.MeshStandardMaterial && npc.mesh.material.map) {
            const colIdx = npc.frame || 0;
            const rowIdx = npc.state === 'walk' ? 1 : 0;
            npc.mesh.material.map.offset.set(colIdx * 0.25, 0.5 - rowIdx * 0.5);
          }
        }

        // --- 4. COINS BEHAVIOR ---
        for (let i = coinsList.length - 1; i >= 0; i--) {
          const c = coinsList[i];
          c.mesh.rotation.y += 0.03; // spin effect

          // Distance to player
          const dx = playerMesh.position.x - c.x;
          const dz = playerMesh.position.z - c.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < 1.3) {
            // Collected!
            gState.coins += 1;
            gState.score += 120; // nice score bonus
            setCoinsCount(gState.coins);
            setScore(gState.score);

            audio.playCoin();
            spawnParticles(c.mesh.position.x, c.mesh.position.y, c.mesh.position.z, 6, 0xfacc15);

            scene.remove(c.mesh);
            coinsList.splice(i, 1);

            // Spawn another one elsewhere later
            setTimeout(spawnCoin, 1200);
          }
        }

        // --- 4.5. HEALING ITEMS BEHAVIOR (Red Masks) ---
        for (let i = itemsList.length - 1; i >= 0; i--) {
          const item = itemsList[i];

          // Bobbing and spinning effect
          item.mesh.rotation.y += 0.02;
          item.mesh.position.y = 0.8 + Math.sin(Date.now() * 0.005 + item.x) * 0.15;

          // Distance to player
          const dx = playerMesh.position.x - item.x;
          const dz = playerMesh.position.z - item.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < 1.4) {
            // Collected!
            if (gState.health < 5) {
              gState.health = Math.min(gState.health + 1, 5);
              setHealth(gState.health);
            }
            gState.score += 100; // score bonus for mask
            setScore(gState.score);

            audio.playCoin(); // Play a nice sound
            // Red/Orange/Pink sparkle particles
            spawnParticles(item.mesh.position.x, item.mesh.position.y, item.mesh.position.z, 10, 0xef4444);

            scene.remove(item.mesh);
            itemsList.splice(i, 1);

            // Spawn another one elsewhere later after some delay
            setTimeout(spawnItem, 10000);
          }
        }

        // --- 5. PROJECTILES (ATTACKS / RINGS) BEHAVIOR ---
        for (let i = projectilesList.length - 1; i >= 0; i--) {
          const p = projectilesList[i];
          p.life--;

          // Move slash
          p.mesh.position.x += p.vx;
          p.mesh.position.z += p.vz;

          // If it is a dance ring, expand it!
          if (p.vx === 0 && p.vz === 0) {
            p.mesh.scale.x += 0.28;
            p.mesh.scale.y += 0.28;
            // Fade out
            if (p.mesh.material instanceof THREE.Material) {
              p.mesh.material.opacity = p.life / 40;
            }

            // Hit multiple enemies in ring radius
            const radius = p.mesh.scale.x * 0.65;
            for (let j = enemiesList.length - 1; j >= 0; j--) {
              const e = enemiesList[j];
              if (e.isDying) continue;

              const edx = e.mesh.position.x - playerMesh.position.x;
              const edz = e.mesh.position.z - playerMesh.position.z;
              const edist = Math.sqrt(edx * edx + edz * edz);

              if (edist < radius + 0.6) {
                // Hit enemy!
                e.health--;

                if (e.health <= 0) {
                  // 2nd Hit: Launch and blow away
                  e.isDying = true;
                  gState.defeatedCount++;
                  const angle = Math.random() * Math.PI * 2;
                  e.deathVelocityX = Math.cos(angle) * 0.35;
                  e.deathVelocityY = 0.45;
                  e.deathVelocityZ = Math.sin(angle) * 0.35;
                  e.deathSpinSpeed = 0.25;
                  e.deathTimer = 40;

                  gState.score += 250;
                  setScore(gState.score);
                  spawnParticles(e.mesh.position.x, 1.2, e.mesh.position.z, 15, 0xef4444);
                } else {
                  // 1st Hit: Knockback
                  const ndx = edx / (edist || 1);
                  const ndz = edz / (edist || 1);
                  e.knockbackX = ndx * 1.8;
                  e.knockbackZ = ndz * 1.8;
                  e.knockbackTimer = 15;

                  e.flashTimer = 15;
                  e.flashColor = 0xffffff;

                  gState.score += 100;
                  setScore(gState.score);
                  spawnParticles(e.mesh.position.x, 1.2, e.mesh.position.z, 8, 0x8b5cf6);
                }

                audio.playHit();
              }
            }

            // Check Boss hit by Holy Ring
            if (boss && boss.state !== 'dying' && !boss.flashTimer) {
              const bdx = boss.mesh.position.x - playerMesh.position.x;
              const bdz = boss.mesh.position.z - playerMesh.position.z;
              const bdist = Math.sqrt(bdx * bdx + bdz * bdz);
              if (bdist < radius + 1.5) {
                boss.health--;
                setBossHealth(boss.health);
                boss.flashTimer = 15;
                boss.flashColor = 0xffffff;
                spawnParticles(boss.mesh.position.x, 2.5, boss.mesh.position.z, 12, 0xf59e0b);
                audio.playHit();

                if (boss.health <= 0) {
                  boss.state = 'dying';
                  boss.deathTimer = 80;
                  gState.score += 2000;
                  setScore(gState.score);
                }
              }
            }
          } else {
            // Normal physical slash projectile: Check collision against individual enemies
            let hitSomething = false;
            for (let j = enemiesList.length - 1; j >= 0; j--) {
              const e = enemiesList[j];
              if (e.isDying) continue;

              const edx = e.mesh.position.x - p.mesh.position.x;
              const edz = e.mesh.position.z - p.mesh.position.z;
              const edist = Math.sqrt(edx * edx + edz * edz);

              if (edist < 1.4) {
                // Enemy hit by sword!
                e.health--;
                hitSomething = true;

                if (e.health <= 0) {
                  // 2nd Hit: Launch and blow away
                  e.isDying = true;
                  gState.defeatedCount++;
                  const pdx = e.mesh.position.x - playerMesh.position.x;
                  const pdz = e.mesh.position.z - playerMesh.position.z;
                  const pdist = Math.sqrt(pdx * pdx + pdz * pdz) || 1;

                  e.deathVelocityX = (pdx / pdist) * 0.45;
                  e.deathVelocityY = 0.5;
                  e.deathVelocityZ = (pdz / pdist) * 0.45;
                  e.deathSpinSpeed = 0.3;
                  e.deathTimer = 45;

                  gState.score += 300;
                  setScore(gState.score);
                  spawnParticles(e.mesh.position.x, 1.2, e.mesh.position.z, 18, 0xef4444);
                } else {
                  // 1st Hit: Knockback
                  const pdx = e.mesh.position.x - playerMesh.position.x;
                  const pdz = e.mesh.position.z - playerMesh.position.z;
                  const pdist = Math.sqrt(pdx * pdx + pdz * pdz) || 1;

                  e.knockbackX = (pdx / pdist) * 2.2;
                  e.knockbackZ = (pdz / pdist) * 2.2;
                  e.knockbackTimer = 15;

                  e.flashTimer = 15;
                  e.flashColor = 0xffffff;

                  gState.score += 150;
                  setScore(gState.score);
                  spawnParticles(e.mesh.position.x, 1.2, e.mesh.position.z, 10, 0xef4444);
                }

                audio.playHit();

                // Delete projectile
                p.life = 0;
                break;
              }
            }

            // Check Boss hit by physical slash projectile
            if (!hitSomething && boss && boss.state !== 'dying' && !boss.flashTimer) {
              const bdx = boss.mesh.position.x - p.mesh.position.x;
              const bdz = boss.mesh.position.z - p.mesh.position.z;
              const bdist = Math.sqrt(bdx * bdx + bdz * bdz);
              if (bdist < 2.0) {
                boss.health--;
                setBossHealth(boss.health);
                boss.flashTimer = 15;
                boss.flashColor = 0xffffff;
                spawnParticles(boss.mesh.position.x, 2.5, boss.mesh.position.z, 12, 0xef4444);
                audio.playHit();

                p.life = 0;

                if (boss.health <= 0) {
                  boss.state = 'dying';
                  boss.deathTimer = 80;
                  gState.score += 2000;
                  setScore(gState.score);
                }
              }
            }
          }

          if (p.life <= 0) {
            scene.remove(p.mesh);
            projectilesList.splice(i, 1);
          }
        }

        // --- 6. PARTICLES BEHAVIOR ---
        for (let i = particlesList.length - 1; i >= 0; i--) {
          const pt = particlesList[i];
          pt.life++;

          pt.mesh.position.x += pt.vx;
          pt.mesh.position.y += pt.vy;
          pt.mesh.position.z += pt.vz;

          // Apply gravity decay
          pt.vy -= 0.005;

          if (pt.mesh.material instanceof THREE.Material) {
            pt.mesh.material.opacity = 1 - pt.life / pt.maxLife;
          }

          if (pt.life >= pt.maxLife) {
            scene.remove(pt.mesh);
            particlesList.splice(i, 1);
          }
        }
      }

      // 7. LANTERNS ROTATING AND RISING (Always animated, even if paused)
      lanterns.forEach((l) => {
        l.mesh.position.y += l.speed;
        l.mesh.rotation.y += l.rotSpeed;

        // Reset if it goes too high
        if (l.mesh.position.y > 22) {
          l.mesh.position.y = -2;
          l.mesh.position.x = (Math.random() - 0.5) * 44;
          l.mesh.position.z = (Math.random() - 0.5) * 44;
        }
      });

      // Always render
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    // CLEANUP ON UNMOUNT
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);

      // Remove Three.js meshes
      scene.clear();
      renderer.dispose();
    };
  }, [isPlaying, isGameOver, isVictory]);

  // Restart Handler
  const restartGame = () => {
    gameStateRef.current = {
      score: 0,
      coins: 0,
      health: 5,
      isPlaying: true,
      isGameOver: false,
      isPaused: false,
      playerPosition: { x: 0, z: 0 },
      playerDirection: { x: 0, z: 1 },
      playerState: 'idle',
      playerFrame: 0,
      playerFrameTimer: 0,
      attackCooldown: 0,
      danceCooldown: 0,
      defeatedCount: 0,
      isVictory: false,
      spawnThreshold: 100,
      inDialogue: false,
      npcSpawned: false,
    };

    setScore(0);
    setCoinsCount(0);
    setHealth(5);
    setIsGameOver(false);
    setIsPaused(false);
    setIsScoreSaved(false);
    setBossHealth(null);
    setIsVictory(false);
    setInDialogue(false);
    setDialogueIndex(0);
    setShowFinishScreen(false);
    setIsPlaying(true);

    audio.playJump();
    audio.startMusic();
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isScoreSaved) return;

    const newEntry: ScoreEntry = {
      name: playerName.slice(0, 15),
      score: score,
      date: new Date().toLocaleDateString('th-TH'),
    };

    const updated = [...highScores, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);

    setHighScores(updated);
    localStorage.setItem('dansai_highscores', JSON.stringify(updated));
    setIsScoreSaved(true);
    audio.playCoin();
  };

  // Virtual game controls press mapping (touchscreen friendly)
  const handleVirtualPress = (action: 'up' | 'down' | 'left' | 'right' | 'attack' | 'dance', press: boolean) => {
    inputRef.current[action] = press;
  };

  return (
    <div className="w-full flex flex-col bg-black text-neutral-200 select-none font-sans min-h-[500px]">
      {/* Top HUD panel */}
      <div className="flex justify-between items-center bg-neutral-900/95 border-b border-neutral-800 p-4 sticky top-0 z-10">
        <div className="flex gap-3 items-center">
          {/* Health Hearts */}
          <div className="flex items-center gap-1.5 bg-neutral-950 px-3 py-1.5 rounded-lg border border-red-950">
            <span className="text-red-500 font-extrabold text-xs">พลังชีวิต:</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < health ? 'bg-rose-600 scale-100 shadow-[0_0_8px_#f43f5e]' : 'bg-neutral-800 scale-90'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Gold Collected counter */}
          <div className="flex items-center gap-1.5 bg-neutral-950 px-3 py-1.5 rounded-lg border border-amber-950 text-amber-400 font-mono text-sm">
            <Award className="w-4 h-4 text-amber-500" />
            <span>เหรียญ: {coinsCount}</span>
          </div>
        </div>

        {/* Live Score Counter */}
        <div className="flex items-center gap-2 font-mono text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
          <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
          <span>คะแนน: {score}</span>
        </div>

        {/* Back Menu Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              audio.playJump();
              audio.stopMusic();
              onBackToMenu();
            }}
            className="flex items-center gap-1 py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 hover:text-white transition-colors rounded-lg text-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>หน้าแรก</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas stage with overlay panels */}
      <div ref={containerRef} className="relative w-full overflow-hidden bg-neutral-950 border-b border-red-950/20">
        <canvas ref={canvasRef} className="block w-full" />

        {/* Boss HP Bar Overlay */}
        {isPlaying && !isGameOver && bossHealth !== null && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-10 animate-bounce">
            <div className="bg-black/90 border border-red-500/30 p-2.5 rounded-lg shadow-2xl">
              <div className="flex justify-between items-center text-xs font-mono text-red-500 font-bold mb-1">
                <span>👹 บอส: พญาวิญญาณร้ายผีตาโขน</span>
                <span>{bossHealth} / 12 HP</span>
              </div>
              <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-red-950">
                <div
                  className="bg-gradient-to-r from-red-600 to-orange-500 h-full transition-all duration-300"
                  style={{ width: `${(bossHealth / 12) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Victory Screen */}
        {inDialogue && (
          (() => {
            const currentDialogue = dialogues[dialogueIndex] || dialogues[0];
            const playerBgPosition = `${(dialogueFrame % 4) * 33.333}% ${(currentDialogue.side === 'left' ? currentDialogue.row : 0) * 33.333}%`;
            const npcBgPosition = `${(dialogueFrame % 4) * 33.333}% ${(currentDialogue.side === 'right' ? currentDialogue.row : 0) * 100}%`;

            return (
              <div
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    progressDialogue();
                  }
                }}
                className="absolute inset-0 bg-black/60 flex flex-col justify-end p-4 sm:p-6 z-20 animate-fadeIn"
              >
                {/* Characters portraits stage */}
                <div className="flex justify-between items-end w-full max-w-4xl mx-auto mb-2 sm:mb-4 px-4 sm:px-8">
                  {/* Player Portrait (Left) */}
                  <div
                    className={`flex flex-col items-center transition-all duration-300 ${
                      currentDialogue.side === 'left'
                        ? 'scale-105 sm:scale-110 -translate-y-1 sm:-translate-y-2 opacity-100 filter drop-shadow-[0_0_15px_#06b6d4]'
                        : 'scale-90 opacity-40 grayscale-[20%]'
                    }`}
                  >
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-4 border-cyan-500 bg-neutral-900/95 p-1 overflow-hidden relative">
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: "url('https://res.cloudinary.com/dsucg33fv/image/upload/v1782439981/player_mask_fmn9yv.png')",
                          backgroundSize: '400% 400%',
                          backgroundPosition: playerBgPosition,
                          imageRendering: 'pixelated',
                        }}
                      />
                    </div>
                    <span className="mt-2 text-[10px] sm:text-xs font-mono font-extrabold px-2.5 py-0.5 sm:py-1 bg-cyan-950 border border-cyan-500/40 rounded-full text-cyan-400 text-center">
                      ผู้กล้าด่านซ้าย
                    </span>
                  </div>

                  {/* NPC Portrait (Right) */}
                  <div
                    className={`flex flex-col items-center transition-all duration-300 ${
                      currentDialogue.side === 'right'
                        ? 'scale-105 sm:scale-110 -translate-y-1 sm:-translate-y-2 opacity-100 filter drop-shadow-[0_0_15px_#f59e0b]'
                        : 'scale-90 opacity-40 grayscale-[20%]'
                    }`}
                  >
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-4 border-amber-500 bg-neutral-900/95 p-1 overflow-hidden relative">
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: "url('https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/npc1_pdraha.png')",
                          backgroundSize: '400% 200%',
                          backgroundPosition: npcBgPosition,
                          imageRendering: 'pixelated',
                        }}
                      />
                    </div>
                    <span className="mt-2 text-[10px] sm:text-xs font-mono font-extrabold px-2.5 py-0.5 sm:py-1 bg-amber-950 border border-amber-500/40 rounded-full text-amber-400 text-center">
                      ลุงสมหมาย
                    </span>
                  </div>
                </div>

                {/* Dialog Textbox */}
                <div className="w-full max-w-4xl mx-auto bg-neutral-950/95 border-2 border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl relative">
                  <div className="absolute -top-3 left-4 sm:-top-3.5 sm:left-6 bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[10px] sm:text-xs font-bold font-sans px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow border border-amber-500/30">
                    {currentDialogue.speaker}
                  </div>

                  <div className="pt-2 min-h-[60px] sm:min-h-[70px]">
                    <p className="text-xs sm:text-base leading-relaxed text-neutral-100 font-sans tracking-wide">
                      {currentDialogue.text}
                    </p>
                  </div>

                  {/* Box Footer actions */}
                  <div className="flex justify-between items-center mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-neutral-900 text-[9px] sm:text-xxs text-neutral-500">
                    <span className="font-mono hidden sm:inline">กด [SPACE] หรือ [ENTER] เพื่อไปต่อ</span>
                    <span className="font-mono sm:hidden">แตะหน้าจอเพื่อไปต่อ</span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          audio.playJump();
                          setInDialogue(false);
                          gameStateRef.current.inDialogue = false;
                          setShowFinishScreen(true);
                        }}
                        className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-neutral-400 font-bold transition-all text-[10px]"
                      >
                        ข้าม (Skip)
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          progressDialogue();
                        }}
                        className="px-3.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-extrabold rounded shadow-md transition-all animate-pulse text-[10px]"
                      >
                        {dialogueIndex >= 7 ? 'เสร็จสิ้น (Finish)' : 'ถัดไป (Next) ➜'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        )}

        {showFinishScreen && (
          <div className="absolute inset-0 bg-neutral-950/98 flex flex-col justify-center items-center p-6 animate-scaleIn text-center z-30 overflow-y-auto">
            <div className="w-16 h-16 bg-cyan-950/80 rounded-full flex items-center justify-center border border-cyan-500 mb-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-1 tracking-wide font-sans animate-bounce">
              ชนะการท้าทายสำเร็จ! (FINISH)
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mb-6 leading-relaxed">
              ยินดีด้วยอย่างยิ่ง! คุณปราบพญาวิญญาณร้ายสำเร็จ ผ่านประตูมิติกลับคืนงานบุญหลวงผีตาโขน ณ อำเภอด่านซ้าย อย่างงดงามและปลอดภัย! ชาวบ้านต่างชื่นชมและยกย่องคุณในฐานะวีรบุรุษผู้พิทักษ์วัฒนธรรมประเพณี!
            </p>

            {/* Score submissions */}
            <div className="bg-neutral-900 border border-cyan-900/30 rounded-xl p-4 w-full max-w-sm mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">คะแนนผู้ชนะ:</span>
                <span className="font-mono font-bold text-cyan-400 text-base">{score + 5000} (โบนัสชัยชนะ!)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">เหรียญโบราณทั้งหมด:</span>
                <span className="font-mono font-bold text-yellow-400 text-base">{coinsCount}</span>
              </div>

              {!isScoreSaved ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!playerName.trim() || isScoreSaved) return;

                    const newEntry: ScoreEntry = {
                      name: playerName.slice(0, 15),
                      score: score + 5000, // victory bonus!
                      date: new Date().toLocaleDateString('th-TH'),
                    };

                    const updated = [...highScores, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);

                    setHighScores(updated);
                    localStorage.setItem('dansai_highscores', JSON.stringify(updated));
                    setIsScoreSaved(true);
                    audio.playCoin();
                  }}
                  className="pt-2 border-t border-neutral-800 flex gap-2"
                >
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="ใส่ชื่อผู้กล้าของคุณ"
                    className="flex-1 bg-black text-neutral-200 placeholder-neutral-600 px-3 py-1.5 rounded text-xs border border-neutral-800 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs transition-colors"
                  >
                    บันทึกอันดับ
                  </button>
                </form>
              ) : (
                <div className="pt-2 border-t border-neutral-800 text-center text-xs text-cyan-500 font-semibold flex items-center justify-center gap-1">
                  <span>✓ บันทึกสถิติลงตารางผู้นำเรียบร้อยแล้ว</span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={restartGame}
                className="glow-button flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-2.5 px-6 rounded-lg font-bold text-sm text-white transition-all scale-100 hover:scale-105"
              >
                <RotateCcw className="w-4 h-4" />
                <span>เล่นใหม่อีกครั้ง (Restart)</span>
              </button>
              <button
                onClick={() => {
                  audio.playJump();
                  onBackToMenu();
                }}
                className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 py-2.5 px-6 rounded-lg font-bold text-sm text-neutral-300 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>กลับไป Title (Back to Title)</span>
              </button>
            </div>
          </div>
        )}

        {/* Start Game overlay */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col justify-center items-center text-center p-6 animate-fadeIn">
            <h3 className="text-3xl font-extrabold tracking-wide mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500 font-sans italic">
              Dan Sai Adventure
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
              สวมบทเป็นผู้พิทักษ์วัฒนธรรมประเพณีผีตาโขน 
              ออกเดินทางเก็บเหรียญโบราณบนพื้น และใช้พลังเพื่อขับไล่วิญญาณร้าย!
            </p>

            <button
              onClick={restartGame}
              className="glow-button group flex items-center gap-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 py-3.5 px-10 rounded-full font-bold text-lg text-white shadow-2xl transition-all scale-100 hover:scale-105"
            >
              <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
              <span>เริ่มวิ่งสู้ผี (START GAME)</span>
            </button>

            {/* Controls review list */}
            <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm text-xxs bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 text-neutral-400 font-mono">
              <div>• เดิน 8 ทิศทาง: <span className="text-amber-500 font-bold">WASD / ปุ่มลูกศร</span></div>
              <div>• ต่อย/โจมตี: <span className="text-red-400 font-bold">กดปุ่ม P</span></div>
              <div>• เต้นปล่อยพลัง: <span className="text-yellow-400 font-bold">กดปุ่ม O</span></div>
              <div>• หยุดเกม: <span className="text-cyan-400 font-bold">กดปุ่ม ESC</span></div>
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {isPlaying && !isGameOver && isPaused && (
          <div className="absolute inset-0 bg-black/85 flex flex-col justify-center items-center text-center p-6 animate-fadeIn z-20">
            <h3 className="text-3xl font-extrabold tracking-wide mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 font-sans italic">
              เกมหยุดชั่วคราว (PAUSED)
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mb-6">
              พักผ่อนสักครู่แล้วกลับมาร่วมปกป้องประเพณีของด่านซ้ายต่อ!
            </p>

            <div className="flex flex-col gap-3 min-w-[200px]">
              <button
                onClick={togglePause}
                className="glow-button flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 py-2.5 px-6 rounded-lg font-bold text-sm text-neutral-950 transition-all scale-100 hover:scale-105"
              >
                <Play className="w-4 h-4 fill-neutral-950" />
                <span>เล่นต่อ (Resume)</span>
              </button>

              <button
                onClick={() => {
                  togglePause();
                  restartGame();
                }}
                className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 py-2.5 px-6 rounded-lg font-bold text-sm text-neutral-200 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>เริ่มเกมใหม่ (Restart)</span>
              </button>

              <button
                onClick={() => {
                  audio.playJump();
                  audio.stopMusic();
                  onBackToMenu();
                }}
                className="flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 py-2.5 px-6 rounded-lg font-bold text-sm text-neutral-400 transition-all border border-neutral-800"
              >
                <Home className="w-4 h-4" />
                <span>กลับหน้าหลัก (Menu)</span>
              </button>
            </div>

            <p className="mt-6 text-xxs text-neutral-500 font-mono">
              กด [ ESC ] อีกครั้งเพื่อกลับเข้าสู่เกม
            </p>
          </div>
        )}

        {/* Game Over overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-neutral-950/95 flex flex-col justify-center items-center p-6 animate-scaleIn">
            <h3 className="text-4xl font-extrabold text-red-600 mb-1 tracking-wider animate-pulse font-sans">
              จบการท้าทาย
            </h3>
            <p className="text-sm text-neutral-400 mb-4">
              คุณทำได้ดีมากในการปกป้องประเพณีของด่านซ้าย!
            </p>

            {/* Score submissions */}
            <div className="bg-neutral-900 border border-red-900/30 rounded-xl p-4 w-full max-w-sm mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">คะแนนสุดท้าย:</span>
                <span className="font-mono font-bold text-amber-400 text-base">{score}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">เหรียญโบราณ:</span>
                <span className="font-mono font-bold text-yellow-400 text-base">{coinsCount}</span>
              </div>

              {!isScoreSaved ? (
                <form onSubmit={handleSaveScore} className="pt-2 border-t border-neutral-800 flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="ใส่ชื่อผู้กล้าของคุณ"
                    className="flex-1 bg-black text-neutral-200 placeholder-neutral-600 px-3 py-1.5 rounded text-xs border border-neutral-800 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs transition-colors"
                  >
                    บันทึกอันดับ
                  </button>
                </form>
              ) : (
                <div className="pt-2 border-t border-neutral-800 text-center text-xs text-amber-500 font-semibold flex items-center justify-center gap-1">
                  <span>✓ บันทึกสถิติลงตารางผู้นำเรียบร้อยแล้ว</span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={restartGame}
                className="glow-button flex items-center gap-2 bg-red-600 hover:bg-red-500 py-2.5 px-6 rounded-lg font-bold text-sm text-white transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>เล่นใหม่อีกครั้ง (Restart)</span>
              </button>
              <button
                onClick={() => {
                  audio.playJump();
                  onBackToMenu();
                }}
                className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 py-2.5 px-6 rounded-lg font-bold text-sm text-neutral-300 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>กลับหน้าหลัก (Menu)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table & Mobile virtual controller combo under the canvas */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-neutral-950">
        {/* Local Leaderboards list */}
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5">
          <h4 className="font-bold text-amber-500 flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <span>ทำเนียบนักล่าคะแนนสูงสุด (High Scores)</span>
          </h4>

          {highScores.length === 0 ? (
            <p className="text-neutral-500 text-xs italic text-center py-6">
              ยังไม่มีสถิติที่บันทึกไว้ในเบราว์เซอร์นี้ เริ่มเล่นเลยเพื่อครองอันดับ 1!
            </p>
          ) : (
            <div className="space-y-2.5">
              {highScores.map((h, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center p-2.5 rounded-lg border text-sm ${
                    i === 0
                      ? 'bg-amber-950/20 border-amber-800/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.1)]'
                      : 'bg-black/30 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-bold font-mono text-xs w-4 ${i === 0 ? 'text-amber-400' : 'text-neutral-500'}`}>
                      #{i + 1}
                    </span>
                    <span className="font-semibold">{h.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-500 text-xxs font-mono">{h.date}</span>
                    <span className="font-mono font-bold text-amber-500">{h.score} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Virtual Gamepad controls area (Visible if useOnScreenGamepad is toggled) */}
        <div className="flex flex-col justify-center items-center bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5">
          <div className="text-center mb-4">
            <h4 className="font-semibold text-neutral-300 flex items-center justify-center gap-1.5 text-sm">
              <Gamepad2 className="w-4 h-4 text-red-500" />
              <span>แผงควบคุมเสมือน (Virtual Gamepad)</span>
            </h4>
            <p className="text-xxs text-neutral-500 mt-1">
              {settings.useOnScreenGamepad
                ? "ใช้ปุ่มควบคุมด้านล่างเพื่อผจญภัยในพื้นที่ 3 มิติ"
                : "สามารถเปิดใช้แผงควบคุมเสมือนได้ที่หน้าตั้งค่า (Options)"}
            </p>
          </div>

          {settings.useOnScreenGamepad ? (
            <div
              className="w-full max-w-xs flex flex-col items-center bg-black/40 p-4 rounded-2xl border border-neutral-900 gap-4"
              style={{ opacity: settings.gamepadOpacity }}
            >
              {/* D-Pad controls (Up, Down, Left, Right) */}
              <div className="grid grid-cols-3 gap-2 w-36 aspect-square">
                <div />
                <button
                  onMouseDown={() => handleVirtualPress('up', true)}
                  onMouseUp={() => handleVirtualPress('up', false)}
                  onMouseLeave={() => handleVirtualPress('up', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleVirtualPress('up', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleVirtualPress('up', false); }}
                  className="w-10 h-10 bg-neutral-800 active:bg-red-600 rounded-lg flex items-center justify-center text-xs font-bold text-neutral-200"
                >
                  ▲
                </button>
                <div />

                <button
                  onMouseDown={() => handleVirtualPress('left', true)}
                  onMouseUp={() => handleVirtualPress('left', false)}
                  onMouseLeave={() => handleVirtualPress('left', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleVirtualPress('left', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleVirtualPress('left', false); }}
                  className="w-10 h-10 bg-neutral-800 active:bg-red-600 rounded-lg flex items-center justify-center text-xs font-bold text-neutral-200"
                >
                  ◀
                </button>
                <div className="w-10 h-10 flex items-center justify-center text-neutral-600">●</div>
                <button
                  onMouseDown={() => handleVirtualPress('right', true)}
                  onMouseUp={() => handleVirtualPress('right', false)}
                  onMouseLeave={() => handleVirtualPress('right', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleVirtualPress('right', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleVirtualPress('right', false); }}
                  className="w-10 h-10 bg-neutral-800 active:bg-red-600 rounded-lg flex items-center justify-center text-xs font-bold text-neutral-200"
                >
                  ▶
                </button>

                <div />
                <button
                  onMouseDown={() => handleVirtualPress('down', true)}
                  onMouseUp={() => handleVirtualPress('down', false)}
                  onMouseLeave={() => handleVirtualPress('down', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleVirtualPress('down', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleVirtualPress('down', false); }}
                  className="w-10 h-10 bg-neutral-800 active:bg-red-600 rounded-lg flex items-center justify-center text-xs font-bold text-neutral-200"
                >
                  ▼
                </button>
                <div />
              </div>

              {/* Action buttons (P and O) */}
              <div className="flex gap-4 w-full justify-center">
                <button
                  onMouseDown={() => handleVirtualPress('attack', true)}
                  onMouseUp={() => handleVirtualPress('attack', false)}
                  onMouseLeave={() => handleVirtualPress('attack', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleVirtualPress('attack', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleVirtualPress('attack', false); }}
                  className="flex-1 py-2 bg-rose-700 active:bg-rose-500 rounded-xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-1"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>โจมตี (P)</span>
                </button>

                <button
                  onMouseDown={() => handleVirtualPress('dance', true)}
                  onMouseUp={() => handleVirtualPress('dance', false)}
                  onMouseLeave={() => handleVirtualPress('dance', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleVirtualPress('dance', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleVirtualPress('dance', false); }}
                  className="flex-1 py-2 bg-amber-600 active:bg-amber-500 rounded-xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>เต้นสกิล (O)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center p-6 bg-black/20 rounded-xl border border-neutral-900/60 text-neutral-500 py-10 animate-fadeIn">
              <Keyboard className="w-8 h-8 text-neutral-700 mb-2" />
              <p className="text-xs text-center text-neutral-400 font-sans">
                คุณกำลังควบคุมด้วยคีย์บอร์ดคอมพิวเตอร์ของคุณ
              </p>
              <span className="text-xxs text-neutral-600 mt-1">
                เปิดแผงปุ่มสำหรับเล่นบนมือถือได้ในเมนู "ตั้งค่าเกม (Options)"
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
