import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Sliders, Volume2, VolumeX, Sparkles, HelpCircle, BookOpen } from 'lucide-react';
import { audio } from '../utils/audio';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenOptions: () => void;
  isMusicMuted: boolean;
  onToggleMusic: () => void;
}

export default function MainMenu({
  onStartGame,
  onOpenOptions,
  isMusicMuted,
  onToggleMusic
}: MainMenuProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  const handlePlayClick = () => {
    audio.playJump();
    onStartGame();
  };

  const handleOptionsClick = () => {
    audio.playJump();
    onOpenOptions();
  };

  const handleMuteClick = () => {
    onToggleMusic();
    audio.playCoin();
  };

  return (
    <div className="relative min-h-screen bg-black text-neutral-100 flex flex-col justify-between p-6 overflow-hidden pixel-grid select-none font-sans">
      
      {/* Absolute floating amber embers/particles for immersive experience */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-t from-red-500 to-amber-500 rounded-full opacity-60 filter blur-[1px]"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-20px`,
            }}
            animate={{
              y: -window.innerHeight - 50,
              x: Math.sin(i) * 120,
              opacity: [0.2, 0.7, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 12,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "linear",
            }}
          />
        ))}

        {/* Traditional Thai Floating Lanterns (โคมลอย) */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`lantern-${i}`}
            className="absolute w-8 h-10 bg-amber-600/30 border border-amber-500/30 rounded-t-xl rounded-b-md shadow-[0_0_15px_rgba(245,158,11,0.2)] flex flex-col justify-end p-1"
            style={{
              left: `${15 + Math.random() * 70}%`,
              bottom: `-80px`,
            }}
            animate={{
              y: -window.innerHeight - 150,
              x: Math.sin(i) * 80,
              rotate: [0, 5, -5, 0],
              opacity: [0, 0.6, 0.8, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 15,
              repeat: Infinity,
              delay: Math.random() * 15,
              ease: "easeInOut",
            }}
          >
            {/* Tiny candle wick glow */}
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mx-auto animate-pulse shadow-[0_0_8px_#facc15]" />
          </motion.div>
        ))}
      </div>

      {/* Top Bar (Mute controls & info) */}
      <div className="flex justify-between items-center z-10">
        <button
          onClick={handleMuteClick}
          className="p-3 bg-neutral-900/60 border border-neutral-800 hover:border-red-500/50 rounded-xl text-neutral-400 hover:text-white transition-all backdrop-blur"
          title={isMusicMuted ? "เปิดเสียงดนตรี" : "ปิดเสียงดนตรี"}
        >
          {isMusicMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-red-500 animate-pulse" />}
        </button>

        <button
          onClick={() => {
            audio.playCoin();
            setShowTutorial(!showTutorial);
          }}
          className="flex items-center gap-2 py-2.5 px-4 bg-neutral-900/60 border border-neutral-800 hover:border-red-500/50 rounded-xl text-neutral-300 hover:text-white transition-all backdrop-blur"
        >
          <BookOpen className="w-4 h-4 text-red-500" />
          <span className="text-xs font-semibold">แนะนำวิธีเล่น</span>
        </button>
      </div>

      {/* Center content: Logo & Title */}
      <div className="flex-1 flex flex-col justify-center items-center text-center z-10 max-w-lg mx-auto py-12">
        {/* Game Logo */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 relative group"
        >
          {/* Ambient red halo behind logo */}
          <div className="absolute inset-0 bg-red-600/10 rounded-full filter blur-2xl group-hover:bg-red-500/20 transition-all duration-700"></div>
          
          <img
            src="https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/logo_fj2ctz.png"
            alt="Dan Sai Adventure Logo"
            className="h-44 sm:h-52 object-contain relative drop-shadow-[0_0_20px_rgba(239,68,68,0.25)] select-none pointer-events-none transform hover:scale-102 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Title Name using "Kanit" font */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-1"
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-400 via-red-500 to-red-800 font-sans italic filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            Dan Sai Adventure
          </h1>
          <p className="text-amber-500 font-semibold text-sm tracking-widest uppercase">
            ด่านซ้าย แอดเวนเจอร์
          </p>
          <div className="flex items-center justify-center gap-1.5 text-neutral-500 text-xs mt-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500/80" />
            <span>สัมผัสเทศกาลผีตาโขนดินแดนสัจจะและไมตรี</span>
          </div>
        </motion.div>

        {/* Navigation Menus */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 w-full max-w-xs space-y-4"
        >
          {/* Play Menu Button */}
          <button
            onClick={handlePlayClick}
            className="glow-button w-full flex items-center justify-center gap-3 py-4 px-8 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white font-extrabold rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.3)] text-lg hover:brightness-110 active:scale-98 transition-all border border-red-500/30"
          >
            <Play className="w-5 h-5 fill-white animate-pulse" />
            <span>เข้าเกม (START ADVENTURE)</span>
          </button>

          {/* Options Menu Button */}
          <button
            onClick={handleOptionsClick}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-8 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-900/60 text-neutral-300 hover:text-white font-bold rounded-xl shadow-md transition-all active:scale-98"
          >
            <Sliders className="w-4.5 h-4.5 text-amber-500" />
            <span>ตั้งค่าปุ่ม & ตัวละคร (OPTIONS)</span>
          </button>
        </motion.div>
      </div>

      {/* Tutorial modal overlay */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-black/90 flex justify-center items-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-950 border border-red-900/30 rounded-2xl p-6 max-w-md w-full relative space-y-4 shadow-[0_0_60px_rgba(239,68,68,0.2)]">
            <h3 className="text-xl font-bold text-amber-500 border-b border-neutral-800 pb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-red-500" />
              <span>คู่มือการปกป้องเมืองด่านซ้าย</span>
            </h3>
            
            <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
              <p>
                ในดินแดนด่านซ้ายโบราณ เหล่าวิญญาณป่าและผีร้ายพยายามจะขัดขวางงานประเพณีบุญหลวง คุณในฐานะผู้สืบทอดหน้ากากโบราณต้องวิ่งออกไปขับไล่พวกมัน!
              </p>
              <div className="bg-black/60 p-3 rounded-lg border border-neutral-900 space-y-1.5 font-sans">
                <div className="text-amber-400 font-bold text-xs">วัตถุประสงค์ในการเล่น:</div>
                <ul className="list-disc list-inside text-xs text-neutral-400 space-y-1">
                  <li>หลบหลีกอุปสรรค: กองหินหนาม และเปลวไฟบนพื้นดิน</li>
                  <li>สยบผีร้าย: ใช้ปุ่ม <span className="text-red-400 font-bold">โจมตี</span> เพื่อฟันไล่พวกผีป่าที่ลอยมา</li>
                  <li>เก็บเหรียญ: เพื่อสะสมคะแนนโบนัสและซื้อความจำนงอันเป็นมงคล</li>
                </ul>
              </div>
              <p className="text-xs text-neutral-400">
                *คุณสามารถตั้งค่าเปลี่ยนปุ่มควบคุมการเคลื่อนที่ แตะปุ่ม หรือสลับปุ่มความถี่ได้ในเมนู <span className="text-amber-500 font-semibold">Options</span>
              </p>
            </div>

            <button
              onClick={() => {
                audio.playCoin();
                setShowTutorial(false);
              }}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 hover:text-white border border-neutral-800 rounded-lg text-xs font-semibold transition-all"
            >
              รับทราบ นำทางสู่การผจญภัย!
            </button>
          </div>
        </div>
      )}

      {/* Footer Cultural Notes */}
      <div className="text-center z-10 pt-4 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xxs text-neutral-600 font-sans">
        <div>
          <span>© 2026 Dan Sai Adventure. Inspired by Phi Ta Khon Festival, Loei Province, Thailand.</span>
        </div>
        <div className="flex gap-4">
          <span className="hover:text-neutral-400 cursor-pointer">ประเพณีบุญหลวง</span>
          <span className="hover:text-neutral-400 cursor-pointer">การละเล่นผีตาโขน</span>
          <span className="hover:text-neutral-400 cursor-pointer">วัดโพนชัย</span>
        </div>
      </div>
    </div>
  );
}
