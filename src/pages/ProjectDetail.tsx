import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { projectsData } from '../data';

// --- 子组件：专门处理横向滑动的相册 ---
const HorizontalGallery = ({ images }: { images: string[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 支持鼠标滚轮横向滚动
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      };
      el.addEventListener('wheel', onWheel);
      return () => el.removeEventListener('wheel', onWheel);
    }
  }, []);

  return (
    <div className="relative group my-8">
      {/* 提示文字 */}
      <div className="absolute -top-6 left-0 text-[10px] font-mono text-ark-orange flex items-center gap-1 opacity-70">
        <ArrowRight size={10} /> SLIDE TO VIEW
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar"
      >
        {images.map((url, idx) => (
          <div 
            key={idx} 
            className="flex-shrink-0 snap-center relative z-[60] h-[400px] md:h-[600px] border border-gray-800 bg-[#1a1a1a] p-1"
          >
            <img 
              src={url} 
              alt="Gallery Item" 
              className="h-full w-auto object-contain block"
              draggable="false"
            />
          </div>
        ))}
        {/* 占位符，方便滑到最后 */}
        <div className="w-8 flex-shrink-0"></div>
      </div>
    </div>
  );
};

// --- 主组件 ---
export default function ProjectDetail() {
  const { id } = useParams();
  const project = projectsData.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!project) {
    return <div className="text-white pt-32 text-center font-mono">ERROR 404: DATA NOT FOUND</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-ark-dark text-ark-bg"
    >
      {/* 顶部导航 */}
      <Link
        to="/portfolio"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 font-bold transition-all border rounded-sm bg-ark-dark/80 backdrop-blur-md border-white/10 text-ark-bg hover:text-ark-orange hover:border-ark-orange/50 shadow-lg group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="tracking-widest font-mono">BACK</span>
      </Link>

      {/* 头部信息 */}
      <div className="max-w-5xl mx-auto pt-32 px-4 md:px-8 mb-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-wrap gap-4 text-xs font-mono text-ark-orange mb-6 uppercase tracking-wider">
            <span className="border border-ark-orange/30 px-2 py-1">Type: {project.category}</span>
            <span className="border border-ark-orange/30 px-2 py-1">Date: {project.date}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight">
            {project.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-mono border-l-4 border-ark-orange pl-6 py-2 max-w-3xl">
            {project.desc}
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            {project.toolStack.map(tool => (
              <span key={tool} className="bg-[#2a2a2a] px-3 py-1 text-sm text-gray-300 font-mono rounded-sm border border-white/5">
                {tool}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* --- 内容块展示区 --- */}
      <div className="w-full bg-[#111] pb-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-0 md:px-4 pt-10 flex flex-col gap-8">
          
          {project.blocks && project.blocks.length > 0 ? (
            project.blocks.map((block, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5 }}
              >
                {/* 判断类型：竖向图 */}
                {block.type === 'vertical' && (
                  <div className="relative z-[60] w-full">
                    <img 
                      src={block.url} 
                      alt={`Block ${index}`}
                      className="w-full h-auto block shadow-2xl"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* 判断类型：横向图集 */}
                {block.type === 'horizontal' && (
                  <HorizontalGallery images={block.urls} />
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-600 font-mono border border-gray-800">
              [ NO DATA BLOCKS FOUND ]
            </div>
          )}
        </div>
      </div>
      
      {/* 隐藏滚动条样式 */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="text-center py-8 text-xs font-mono text-gray-600">
        END OF RECORD
      </div>
    </motion.div>
  );
}