/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          yellow: '#e5a93c',
          yellowHover: '#cf952a',
          yellowLight: '#fef7e6',
          yellowDark: '#b87c14',
          grayBg: '#f6f6f8',
          sidebarLight: '#fbfbfd',
          sidebarDark: '#202022',
          listLight: '#f7f7f9',
          listDark: '#1a1a1c',
          editorLight: '#ffffff',
          editorDark: '#161618',
          borderLight: '#e5e5ea',
          borderDark: '#2e2e32',
          activeLight: '#eaeaea',
          activeDark: '#2c2c30',
          hoverLight: '#f0f0f4',
          hoverDark: '#242428',
          textMuted: '#8e8e93',
          textMutedDark: '#98989d',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: [
          '"SF Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Courier New"',
          'monospace'
        ]
      }
    },
  },
  plugins: [],
}
