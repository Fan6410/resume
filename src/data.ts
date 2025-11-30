// src/data.ts

// 1. 定义新的内容块结构
export type ProjectBlock = 
  | { type: 'vertical'; url: string }              // 竖向单图
  | { type: 'horizontal'; urls: string[] };        // 横向多图滑块

export interface Project {
  id: string;
  category: 'uiux' | 'visual' | 'product';
  title: string;
  desc: string;
  coverImage: string;
  
  // 2. 这里改用 blocks
  blocks: ProjectBlock[]; 
  
  date: string;
  toolStack: string[];
}

export const projectsData: Project[] = [
  {
    id: 'zone',
    category: 'uiux',
    title: 'ZONE',
    desc: 'It is time for a brand new social APP',
    coverImage: '/projects/ZONE/zonecover.jpg',
    
    // 3. 这里是混合排布的配置示例
    blocks: [
      // 第一张：竖向大图 (比如项目介绍)
      { type: 'vertical', url: '/projects/ZONE/zone01.jpg' },
      { type: 'vertical', url: '/projects/ZONE/zone02.jpg' },
      { type: 'vertical', url: '/projects/ZONE/zone03.jpg' },
      
      // 第二组：横向滑动的界面展示 (比如 3 张 APP 界面图)
      { 
        type: 'horizontal', 
        urls: [
          '/projects/ZONE/zone04.jpg'
        ] 
      },
      { type: 'vertical', url: '/projects/ZONE/zone04-1.jpg' },
      {
        type: 'horizontal',
        urls: [
          '/projects/ZONE/zone05.jpg'
        ]
      },
      { type: 'vertical', url: '/projects/ZONE/zone05-1.jpg' },
      { type: 'vertical', url: '/projects/ZONE/zone06.jpg' },
      { type: 'vertical', url: '/projects/ZONE/poster.jpg' },
    ],
    
    date: '2023-11',
    toolStack: ['Adobe Illustrator', 'Figma', 'React'],
    
  },
  
  // 其他项目...
  {
    id: 'brand-x',
    category: 'visual',
    title: 'Brand Identity X',
    desc: 'Logo & Typography',
    coverImage: '',
    blocks: [], // 记得这里也要改成 blocks: []
    date: '2023-10',
    toolStack: ['AI', 'PS'],
  },
];