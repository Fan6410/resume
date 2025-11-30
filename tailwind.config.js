/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 这里定义的颜色是为了让 index.css 中的 @apply 能找到对应的类
      colors: {
        'ark-bg': '#f2f0e4',       // 米色背景
        'ark-dark': '#1a1a1a',     // 深黑
        'ark-red': '#d93f0b',      // 红色
        'ark-orange': '#e88d2a',   // 橙色
        'ark-blue': '#2a7b88',     // 蓝色
        'ark-teal': '#85c2c9',     // 青色
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
        sans: ['"Oswald"', 'sans-serif'],
      },
      backgroundImage: {
        'noise': "url('https://grainy-gradients.vercel.app/noise.svg')",
      }
    },
  },
  plugins: [],
}