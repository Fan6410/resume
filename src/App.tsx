import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Resume from './pages/Resume';
import Portfolio from './pages/Portfolio';
// 1. 引入详情页组件 (注意路径，如果你文件放在 src 下就是 './ProjectDetail')
import ProjectDetail from './pages/ProjectDetail';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/resume" element={<Resume />} />

        {/* 这里建议去掉通配符 *，除非你有子路由需求 */}
        <Route path="/portfolio" element={<Portfolio />} />

        {/* 2. 添加这一行：动态路由，:id 会匹配 data.ts 里的项目 ID */}
        <Route path="/project/:id" element={<ProjectDetail />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen w-full relative">
        {/* 全局噪点与扫描线覆盖 */}
        <div className="fixed inset-0 opacity-40 bg-noise pointer-events-none z-50"></div>
        <div className="fixed inset-0 scanlines z-50"></div>

        <AnimatedRoutes />
      </div>
    </Router>
  );
}
