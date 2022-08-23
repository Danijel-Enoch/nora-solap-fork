module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      display: ['Inter, sans-serif'],
      body: ['Inter, sans-serif'],
    },
    extend: {
      animation: {
        shake: 'shake 0.4s linear 4',
        'spin-fast': 'spin 0.5s linear infinite',
      },
      cursor: {
        help: 'help',
      },
      colors: {
        'light-theme': {
          orange: {
            DEFAULT: '#FF810A',
            dark: '#F58700',
          },
          red: { DEFAULT: '#CC2929', dark: '#CC2929', muted: '#eba9a9' },
          green: { DEFAULT: '#5EBF4D', dark: '#5EBF4D', muted: '#bfe5b8' },
          'bkg-1': '#FDFDFD',
          'bkg-2': '#f7f7f7',
          'bkg-3': '#F0F0F0',
          'bkg-4': '#E6E6E6',
          'fgd-1': '#061f23',
          'fgd-2': '#0C3F45',
          'fgd-3': '#446065',
          'fgd-4': '#B0B0B0',
          'bkg-button': '#E6DBCF',
        },
        'dark-theme': {
          yellow: {
            DEFAULT: '#F2C94C',
            dark: '#E4AF11',
          },
          red: { DEFAULT: '#CC2929', dark: '#AA2222', muted: '#571e20' },
          green: { DEFAULT: '#5EBF4D', dark: '#4BA53B', muted: '#365D31' },
          orange: { DEFAULT: '#FF810A' },
          'bkg-1': '#101012',
          'bkg-2': '#1B1B1F',
          'bkg-3': '#27272B',
          'bkg-4': '#38383D',
          'fgd-1': '#D1D1D1',
          'fgd-2': '#C8C8C8',
          'fgd-3': '#B3B3B3',
          'fgd-4': '#878787',
          'bkg-button': '#4E5152',
        },
        'solape-theme': {
          orange: {
            DEFAULT: '#FF810A',
            dark: '#F58700',
          },
          red: { DEFAULT: '#DE0269', dark: '#A2024C', muted: '#9B0149', bright: '#FD499D' },
          green: { DEFAULT: '#0AD171', dark: '#08AF5F',  muted: '#067D43', bright: '#29F592' },
          'bkg-1': '#000',
          'bkg-2': '#121616',
          'bkg-3': '#1C2222',
          'bkg-4': '#38383D',
          'fgd-1': '#D1D1D1',
          'fgd-2': '#C8C8C8',
          'fgd-3': '#B3B3B3',
          'fgd-4': '#878787',
          'fgd-5': '#FFCB99',
          'bkg-button': '#E06C00',
          'bkg-button-2': '#4E5152',

        },
        'th-bkg-1': 'var(--bkg-1)',
        'th-bkg-2': 'var(--bkg-2)',
        'th-bkg-3': 'var(--bkg-3)',
        'th-bkg-4': 'var(--bkg-4)',
        'th-fgd-1': 'var(--fgd-1)',
        'th-fgd-2': 'var(--fgd-2)',
        'th-fgd-3': 'var(--fgd-3)',
        'th-fgd-4': 'var(--fgd-4)',
        'th-fgd-5': 'var(--fgd-5)',
        'th-primary': 'var(--primary)',
        'th-primary-dark': 'var(--primary-dark)',
        'th-red': 'var(--red)',
        'th-red-dark': 'var(--red-dark)',
        'th-red-muted': 'var(--red-muted)',
        'th-red-bright': 'var(--red-bright)',
        'th-green': 'var(--green)',
        'th-green-dark': 'var(--green-dark)',
        'th-green-muted': 'var(--green-muted)',
        'th-green-bright': 'var(--green-bright)',
        'th-orange': 'var(--orange)',
        'th-bkg-button': 'var(--bkg-button)',
        'th-bkg-button-2': 'var(--bkg-button-2)',

      },
      fontSize: {
        xxs: '.65rem',
      },
      keyframes: {
        shake: {
          '0%, 100%': {
            transform: 'rotate(0deg)',
          },
          '20%, 60%': {
            transform: 'rotate(6deg)',
          },
          '40%, 80%': {
            transform: 'rotate(-6deg)',
          },
        },
      },
      backgroundImage: {
        'long-loss': "url('/share_images/bg-long-loss.png')",
        'long-profit': "url('/share_images/bg-long-profit.png')",
        'short-loss': "url('/share_images/bg-short-loss.png')",
        'short-profit': "url('/share_images/bg-short-profit.png')",
      },
      screens: {
        xl: '1600px',
      },
    },
  },
  // variants: {
  //   extend: {
  //     cursor: ['hover', 'focus', 'disabled'],
  //     opacity: ['disabled'],
  //     backgroundColor: ['disabled'],
  //     textColor: ['disabled'],
  //   },
  // },
  plugins: [],
}
