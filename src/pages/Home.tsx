import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Disc, Activity } from 'lucide-react';

// --- AUDIO ENGINE (Web Audio API) ---
let audioContext: AudioContext | null = null;
let bgmGainNode: GainNode | null = null;
let bgmStopCallbacks: (() => void)[] = []; // Array of cleanup functions for active sounds

const initAudio = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
};

// Helper: Generate White Noise Buffer
const createNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
};

// SFX: Mechanical Keyboard / Typewriter "Thock"
const playMechanicalClick = () => {
    const ctx = initAudio();
    const t = ctx.currentTime;

    // 1. The "Body" (Thud) - Sine wave dropping pitch rapidly
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.04);
    
    gain.gain.setValueAtTime(0.5, t); 
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);

    // 2. The "Click" (Switch) - High-passed Noise Burst
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = createNoiseBuffer(ctx);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 2000; // Only crisp highs
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.015); // Very short

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSrc.start(t);
    noiseSrc.stop(t + 0.05);
};

// BGM: Lo-Fi Tape + Relaxed Keys
const startBGM = () => {
    const ctx = initAudio();
    if (bgmGainNode) return; // Already playing

    // Master Gain for Fade In/Out
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2); // Soft fade in
    masterGain.connect(ctx.destination);
    bgmGainNode = masterGain;

    // --- Layer 1: Tape Hiss (Warm Background Noise) ---
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = createNoiseBuffer(ctx);
    noiseSrc.loop = true;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 600; // Muffled low rumble/hiss
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.04; // Very subtle
    
    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSrc.start();
    
    bgmStopCallbacks.push(() => noiseSrc.stop());

    // --- Layer 2: Relaxed Melody (Electric Piano Chords) ---
    // Simple Chord Progression: Cmaj7 -> Fmaj7
    const chords = [
        [261.63, 329.63, 392.00, 493.88], // C E G B (Cmaj7)
        [349.23, 440.00, 523.25, 659.25]  // F A C E (Fmaj7)
    ];
    let chordIndex = 0;

    const playChord = () => {
        const now = ctx.currentTime;
        const frequencies = chords[chordIndex];
        const duration = 4.0; 

        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            // Triangle wave for soft "Keys" sound
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            // Subtle Detune for "Lo-Fi" wobble effect
            osc.detune.value = Math.random() * 8 - 4; 

            // Smooth Envelope (Slow Attack, Long Decay)
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 0.2 + (i * 0.03)); // Strum effect
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.start(now);
            osc.stop(now + duration + 1);
        });

        chordIndex = (chordIndex + 1) % chords.length;
    };

    // Play first chord immediately
    playChord();
    // Schedule loop every 5 seconds
    const intervalId = setInterval(playChord, 5000);
    
    bgmStopCallbacks.push(() => clearInterval(intervalId));
};

const stopBGM = () => {
    if (bgmGainNode && audioContext) {
        const t = audioContext.currentTime;
        // Fade out
        bgmGainNode.gain.cancelScheduledValues(t);
        bgmGainNode.gain.setValueAtTime(bgmGainNode.gain.value, t);
        bgmGainNode.gain.linearRampToValueAtTime(0, t + 1.5);
        
        setTimeout(() => {
            bgmStopCallbacks.forEach(cb => cb());
            bgmStopCallbacks = [];
            bgmGainNode = null;
        }, 1500);
    }
};

// --- 正方形缺角卡带组件 (布局重构：左侧垂直识别带 + 右侧信息) ---
const RetroSquareDisk = ({ title, sub, id, icon: Icon, theme, onClick, delay }: any) => {
  
  // 1. 定义更符合罗德岛风格的纯色，而非之前的渐变
  const mainColor = theme === 'red' ? '#d93f0b' : '#0098DC';
  
  // 2. 切角路径 (保持右下角切角)
  const clipShape = "polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)";

  return (
    <motion.div
      drag
      whileDrag={{ scale: 1.1, zIndex: 100, cursor: 'grabbing' }}
      whileHover={{ y: -8, scale: 1.02, cursor: 'grab', zIndex: 60 }}
      initial={{ y: -180, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 50, damping: 15, delay: delay }}
      onClick={() => {
        playMechanicalClick();
        onClick();
      }}
      className="relative w-64 h-64 group transition-transform duration-300 perspective-1000 filter drop-shadow-2xl"
    >
      <div className="w-full h-full bg-[#f0f0f0] relative overflow-hidden flex" style={{ clipPath: clipShape }}>
        
        {/* 显影遮罩动画 */}
        <motion.div 
            initial={{ height: "100%" }} animate={{ height: "0%" }}
            transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeInOut" }} 
            className="absolute top-0 left-0 w-full bg-[#e5e5e5] z-30 border-b-2 border-gray-400"
        />
        
        {/* --- 卡片核心内容区 (改为 flex-row 左右布局) --- */}
        <div className="flex-1 flex flex-row relative z-10 bg-[#f8fafc]">
            
            {/* 左侧：垂直识别带 (应用你提供的装饰代码) */}
            <div 
                className="w-20 h-full flex flex-col items-center justify-between py-6 relative overflow-hidden shadow-[inset_-2px_0_5px_rgba(0,0,0,0.1)]"
                style={{ backgroundColor: mainColor }}
            >
                {/* 装饰纹理: 斜向黑条纹 */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,#000_25%,#000_50%,transparent_50%,transparent_75%,#000_75%,#000_100%)] bg-[length:10px_10px]" />
                
                {/* 垂直文字: RHODES ISLAND */}
                <div className="text-white/80 font-mono text-xs font-bold tracking-widest rotate-180" style={{ writingMode: 'vertical-rl' }}>
                  RHODES ISLAND
                </div>
                
                {/* 图标 (已移除) */}
                
                {/* 垂直编号 */}
                <div className="text-white font-black text-3xl rotate-180 z-10" style={{ writingMode: 'vertical-rl' }}>
                  {id}
                </div>
            </div>

            {/* 右侧：信息区 */}
            <div className="flex-1 p-4 flex flex-col justify-center relative">
                {/* 背景浅水印 */}
                <Icon className="absolute -right-6 -bottom-6 text-black/5 w-32 h-32 rotate-12 pointer-events-none" />

                <div className="flex justify-between items-start mb-4 opacity-50">
                    <div className="font-mono text-[10px] border border-black px-1">DAT-SQ</div>
                </div>
                
                <h2 className="font-sans text-3xl font-black text-gray-900 leading-[0.9] uppercase tracking-tighter mb-2">
                    {title}
                </h2>
                
                <div className="w-8 h-1 bg-gray-900 mb-2"></div>
                
                <div className="text-xs font-serif italic text-gray-500">
                    {sub}
                </div>
            </div>
        </div>

        {/* 最右侧：机械 Spine (保持不变) */}
        <div className="w-10 h-full bg-[#222] flex flex-col items-center py-2 relative border-l border-gray-500">
            <div className="w-6 h-8 bg-red-600 rounded-[1px] mb-2 opacity-80 border border-white/10" />
            <div className="flex-1 w-full flex flex-col gap-[4px] px-2 opacity-30">
                {Array.from({ length: 12 }).map((_, i) => (<div key={i} className="w-full h-[2px] bg-white rounded-full" />))}
            </div>
        </div>
        
        {/* 表面光泽 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/5 pointer-events-none z-20" />
    </div>
    </motion.div>
  );
};

// --- 工业风按键组件 ---
const CyberButton = ({ label, active, onClick, color = "gray" }: any) => {
    return (
        <button
            onClick={(e) => {
                playMechanicalClick();
                onClick(e);
            }}
            className={`
                group relative h-12 min-w-[4rem] px-4
                flex flex-col items-center justify-center
                font-mono text-[10px] font-bold tracking-wider
                transition-all duration-100 ease-out
                ${color === 'red' ? 'bg-red-600 text-white' : 'bg-[#dcdcdc] text-gray-600'}
                shadow-[0_4px_0_rgba(0,0,0,0.2)]
                active:shadow-none active:translate-y-[4px]
                border-t border-white/50 rounded-[2px]
            `}
        >
            <div className="mb-1">{label}</div>
            <div className={`w-2 h-1 rounded-full ${active ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-black/20'}`}></div>
        </button>
    )
}

export default function Home() {
  const [ejected, setEjected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  // Handle playing music
  const togglePlay = () => {
    if (!isPlaying) {
        setIsPlaying(true);
        startBGM();
    }
  };

  const toggleStop = () => {
    if (isPlaying) {
        setIsPlaying(false);
        stopBGM();
    }
    setEjected(false);
  };

  const handleEject = () => {
      setEjected(true);
      // Play click sound when ejecting
      playMechanicalClick();
  };

  return (
    <motion.div 
      exit={{ opacity: 0 }}
      className="h-screen w-full flex flex-col items-center justify-start pt-[20vh] bg-ark-bg relative overflow-hidden select-none"
    >
      
      {/* 1. 基础纹理层 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
           style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* --- 左上角 FAN.Z 背景大字 --- */}
      <div className="absolute top-0 left-0 p-10 z-10 pointer-events-none select-none opacity-10 mix-blend-multiply">
        <div className="flex flex-col relative">
            <h1 className="font-sans font-black text-[12rem] leading-[0.75] text-[#222] tracking-tighter -ml-4">
              FAN.Z
            </h1>
            <div className="flex items-center gap-4 mt-4 pl-2">
                <div className="h-2 w-24 bg-black/80"></div>
                <div className="font-mono text-sm font-bold tracking-[0.4em] text-black/70 uppercase">
                    Personal Terminal
                </div>
            </div>
            {/* 装饰性坐标 */}
             <div className="absolute -right-20 top-2 font-mono text-[10px] text-black/40 rotate-90 origin-left">
                COORD: 22.54°N / 114.05°E
            </div>
        </div>
      </div>

      {/* --- NEW: 右下角 PORTFOLIO 背景大字 --- */}
      <div className="absolute bottom-0 right-0 p-10 z-10 pointer-events-none select-none opacity-10 mix-blend-multiply text-right">
        <div className="flex flex-col items-end relative">
             {/* 装饰性坐标/竖排文字 */}
             <div className="absolute -left-12 bottom-4 font-mono text-[10px] text-black/40 -rotate-90 origin-bottom-left">
                SECTOR: ARCHIVES // B-02
            </div>

            <h1 className="font-sans font-black text-[9rem] leading-[0.75] text-[#222] tracking-tighter -mr-4">
              PORTFOLIO
            </h1>
            <div className="flex items-center gap-4 mt-4 pr-2 justify-end w-full">
                <div className="font-mono text-sm font-bold tracking-[0.4em] text-black/70 uppercase">
                    Creative Works
                </div>
                <div className="h-2 w-24 bg-black/80"></div>
            </div>
        </div>
      </div>

      {/* 2. 巨大的 PORTFOLIO 背景字 (中央水印 - 保持微妙存在或可移除，此处保留作为层次感) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden">
         <span className="font-sans font-black text-[18vw] text-white opacity-[0.02] tracking-tighter leading-none whitespace-nowrap blur-[1px]">
            SYSTEM
         </span>
      </div>

      {/* 3. 机器层 (Z-Index: 50) */}
      <div className="relative w-full max-w-xl z-50">
        <div className="w-full bg-[#eeeeec] rounded-sm shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/60 p-1 relative">
            <div className="h-28 bg-[#111] w-full rounded-[2px] relative overflow-hidden flex items-center justify-between px-6 border-b-4 border-[#333]">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-10"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,1)_50%,_rgba(0,0,0,1)_50%),_linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>

                <div className="flex flex-col justify-center gap-1 z-0">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-ark-orange animate-pulse" />
                        <span className="font-mono text-ark-orange text-xs tracking-widest shadow-[0_0_8px_rgba(249,115,22,0.4)]">SYSTEM_076</span>
                    </div>
                    <div className="h-[1px] w-24 bg-gray-700 my-1"></div>
                    <span className="font-mono text-[10px] text-gray-500">{ejected ? "STATUS: DISK_EJECTED" : "STATUS: STANDBY MODE"}</span>
                </div>
                <div className="text-right">
                    <div className={`font-mono text-3xl font-black tracking-tighter transition-colors duration-300 ${ejected ? 'text-red-500 animate-pulse' : 'text-teal-500'}`}>{ejected ? "OPEN" : "LOAD"}</div>
                </div>
            </div>

            <div className="h-20 bg-[#e5e5e5] flex items-center px-6 justify-between border-t border-white/50">
                <div className="flex gap-0.5 h-full items-center opacity-80">
                    <div className="w-1.5 h-8 bg-ark-red"></div>
                    <div className="w-1.5 h-8 bg-ark-orange"></div>
                    <div className="w-1.5 h-8 bg-ark-blue"></div>
                    <div className="w-1.5 h-8 bg-ark-teal"></div>
                    <div className="ml-2 font-mono text-[8px] text-gray-400 rotate-90 origin-left translate-y-4">RH-IND</div>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="flex gap-2 mr-4">
                        <div className="w-3 h-3 rounded-full bg-[#333] border border-gray-400 flex items-center justify-center">
                            <div className={`w-1.5 h-1.5 rounded-full ${ejected ? 'bg-red-500' : 'bg-green-500'} shadow-[0_0_5px_currentColor]`}></div>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-[#333] border border-gray-400"></div>
                    </div>
                    <CyberButton label="STOP" onClick={toggleStop} />
                    <CyberButton label="PLAY" active={isPlaying} onClick={togglePlay} />
                    <div className="ml-2 relative">
                        {!ejected && (<div className="absolute -top-3 left-0 w-full flex justify-center"><span className="font-mono text-[8px] text-ark-red animate-pulse">PUSH</span></div>)}
                        <CyberButton label="EJECT" color="red" active={ejected} onClick={handleEject} />
                    </div>
                </div>
            </div>
            <div className="absolute -bottom-2 left-4 right-4 h-3 bg-[#1a1a1a] rounded-b-sm shadow-inner z-0"></div>
        </div>
      </div>

      {/* 4. 卡片层 (Z-Index: 40) */}
      <div className="relative w-full flex justify-center gap-6 z-40 -mt-3 perspective-[1200px]">
        {ejected && (
          <>
            <RetroSquareDisk 
                title="RESUME" 
                sub="Personal Data"
                id="A-01"
                icon={FileText} 
                theme="red"
                delay={0.1}
                onClick={() => navigate('/resume')}
            />
            <RetroSquareDisk 
                title="WORKS" 
                sub="Portfolio Archives"
                id="B-02"
                icon={Disc} 
                theme="blue"
                delay={0.4}
                onClick={() => navigate('/portfolio')}
            />
          </>
        )}
      </div>

    </motion.div>
  );
}