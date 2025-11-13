/** @type {import('tailwindcss').Config} */
export default {
  // 支持 <html class="dark"> 或 <html data-theme="dark">
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        blink: {
          '0%,50%': { opacity: '1' },
          '51%,100%': { opacity: '0' }
        }
      },
      animation: {
        blink: 'blink 1s infinite'
      },
      boxShadow: {
        'card-soft': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
      },
      borderRadius: {
        xl: '12px'
      },
      colors: {
        // 将 Tailwind 语义色与 CSS 变量桥接（使用当前主题变量）
        'surface': 'var(--color-surface)',
        'primary': 'var(--color-primary)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)'
      }
    }
  },
  plugins: []
}
