import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Resume() {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: "tween", ease: "anticipate", duration: 0.5 }}
      className="min-h-screen bg-ark-bg p-8 pt-20"
    >
      <Link to="/" className="fixed top-6 left-6 flex items-center gap-2 font-bold hover:text-ark-red transition-colors z-40">
        <ArrowLeft /> EJECT / RETURN
      </Link>

      <div className="max-w-4xl mx-auto border-l-4 border-ark-red pl-8 relative">
        {/* 顶部装饰 */}
        <div className="absolute -left-[4px] top-0 w-4 h-4 bg-ark-red"></div>
        
        <header className="mb-12">
            <h1 className="text-6xl font-sans font-bold mb-2">OPERATOR RESUME</h1>
            <div className="text-ark-blue font-mono border-b-2 border-ark-dark pb-4">
                ID: 0011932 // CLEARANCE LEVEL: TOP SECRET
            </div>
        </header>

        {/* 技能部分 */}
        <section className="mb-16">
            <h2 className="text-2xl font-bold bg-ark-dark text-white inline-block px-2 py-1 mb-6">COMBAT SKILLS (TECH)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['React / TypeScript', 'Next.js', 'Tailwind CSS', 'Figma / UI Design', 'Node.js', 'WebGL / Three.js'].map((skill) => (
                    <div key={skill} className="flex items-center justify-between border-b border-gray-400 pb-2">
                        <span>{skill}</span>
                        <div className="flex gap-1">
                            {[1,2,3,4,5].map(n => <div key={n} className={`w-2 h-4 ${n > 1 ? 'bg-ark-orange' : 'bg-gray-300'}`}></div>)}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* 经历部分 */}
        <section>
            <h2 className="text-2xl font-bold bg-ark-dark text-white inline-block px-2 py-1 mb-6">MISSION LOG (EXP)</h2>
            <div className="space-y-8">
                <div className="group">
                    <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-xl font-bold group-hover:text-ark-red transition-colors">Senior Frontend Developer</h3>
                        <span className="font-mono text-sm">2021 - PRESENT</span>
                    </div>
                    <p className="text-gray-600 max-w-2xl">Responsible for building large-scale tactical interfaces...</p>
                </div>
                {/* 更多经历... */}
            </div>
        </section>
      </div>
    </motion.div>
  );
}