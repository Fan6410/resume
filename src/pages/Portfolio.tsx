// src/Portfolio.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Layers, Eye, Box } from 'lucide-react';
// 1. 引入刚才创建的数据
import { projectsData } from '../data';

const categories = [
  {
    id: 'uiux',
    name: 'UI/UX DESIGN',
    icon: Layers,
    color: 'bg-ark-red',
    text: 'text-ark-red',
  },
  {
    id: 'visual',
    name: 'VISUAL DESIGN',
    icon: Eye,
    color: 'bg-ark-orange',
    text: 'text-ark-orange',
  },
  {
    id: 'product',
    name: 'PRODUCT DESIGN',
    icon: Box,
    color: 'bg-ark-blue',
    text: 'text-ark-blue',
  },
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // 2. 根据当前选中的类别筛选数据
  const filteredProjects = activeCategory
    ? projectsData.filter((p) => p.category === activeCategory)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-ark-dark text-ark-bg p-4 md:p-8 pt-32"
    >
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 font-bold transition-all border rounded-sm bg-ark-dark/80 backdrop-blur-md border-white/10 text-ark-bg hover:text-ark-orange hover:border-ark-orange/50 shadow-lg"
      >
        <ArrowLeft size={18} />
        <span className="tracking-widest">TERMINATE</span>
      </Link>

      {/* 类别选择器 - 保持不变 */}
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 transition-all duration-500 ${
          activeCategory ? 'h-auto md:h-32' : 'h-[60vh] content-center'
        }`}
      >
        {categories.map((cat, index) => (
          <motion.div
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            layout
            className={`
              relative border-2 border-ark-bg p-6 cursor-pointer overflow-hidden group hover:bg-ark-bg hover:text-ark-dark transition-colors
              ${activeCategory === cat.id ? 'bg-ark-bg text-ark-dark' : ''}
              ${
                activeCategory && activeCategory !== cat.id
                  ? 'opacity-50 scale-90'
                  : 'opacity-100'
              }
            `}
          >
            <div
              className={`absolute top-0 right-0 p-2 ${cat.color} text-ark-dark font-bold text-xs`}
            >
              Tape_0{index + 1}
            </div>
            <cat.icon size={48} className="mb-4" />
            <h2 className="text-3xl font-sans font-bold">{cat.name}</h2>
            <div className="flex gap-2 mt-4 opacity-50">
              <div className="h-2 w-12 bg-current"></div>
              <div className="h-2 w-2 bg-current"></div>
              <div className="h-2 w-2 bg-current"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 项目详情列表 */}
      <AnimatePresence mode="wait">
        {activeCategory && (
          <motion.div
            key={activeCategory}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="max-w-6xl mx-auto pb-20"
          >
            <h3 className="text-xl font-mono mb-6 border-b border-gray-700 pb-2">
              Directory: /root/{activeCategory}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {filteredProjects.map((proj) => (
    // ✨ 修改点 1：把外层的 div 改为 Link，并加上 to 属性
    // 这样整个方块都是可点击的链接
    <Link
      key={proj.id}
      to={`/project/${proj.id}`}
      className="block bg-[#2a2a2a] p-1 border border-gray-600 hover:border-ark-orange transition-colors group cursor-pointer"
    >
      <div className="bg-black aspect-video mb-4 relative flex items-center justify-center overflow-hidden">
        {proj.coverImage ? (
          <img 
            src={proj.coverImage} 
            alt={proj.title}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <span className="text-gray-700 font-sans text-4xl group-hover:scale-110 transition-transform">
            NO SIGNAL
          </span>
        )}
        <div className="absolute inset-0 border border-white/10 m-2 pointer-events-none"></div>
      </div>
      
      <div className="p-4">
        <h4 className="text-2xl font-bold font-sans text-white">
          {proj.title}
        </h4>
        <p className="text-gray-400 font-mono text-sm mt-2">
          {proj.desc}
        </p>
        
        {/* ✨ 修改点 2：里面的按钮只是装饰了，因为外层已经是 Link */}
        <div className="mt-4 text-ark-orange group-hover:text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          View Data <span className="block w-2 h-2 bg-current"></span>
        </div>
      </div>
    </Link>
  ))}
  
  {/* 空状态提示保持不变 */}
  {filteredProjects.length === 0 && (
     <div className="col-span-2 text-center py-20 text-gray-500 font-mono">
       // EMPTY DIRECTORY
     </div>
  )}
</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}