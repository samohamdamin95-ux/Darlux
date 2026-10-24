import type { Config } from 'tailwindcss';

/**
 * Darlux design tokens.
 * Editorial black & white with a single accent (plum). Every color used in
 * the UI comes from here so the brand can be re-skinned in one place.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', md: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1360px' },
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0A0A0A',
          soft: '#262626',
          muted: '#6B6B6B',
          subtle: '#A3A3A3',
        },
        line: {
          DEFAULT: '#E7E5E4',
          strong: '#D4D4D4',
        },
        canvas: {
          DEFAULT: '#FFFFFF',
          soft: '#FAF8F6',
          muted: '#F3F0EC',
        },
        accent: {
          DEFAULT: '#7B2152',
          hover: '#63183F',
          soft: '#F6EAF0',
          contrast: '#FFFFFF',
        },
        success: '#166534',
        danger: '#B42318',
        star: '#0A0A0A',
      },
      fontFamily: {
        sans: ['var(--font-primary)', 'var(--font-secondary)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        luxe: '0.18em',
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '10px',
        xl: '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,10,10,0.04), 0 8px 24px -12px rgba(10,10,10,0.12)',
        pop: '0 24px 48px -16px rgba(10,10,10,0.25)',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'fade-in': 'fade-in 300ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
