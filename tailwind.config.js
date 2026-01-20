/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neon: {
                    blue: '#00f3ff',
                    purple: '#bc13fe',
                    pink: '#ff00ff'
                },
                dark: {
                    bg: '#0a0a0a',
                    card: '#131313',
                    surface: '#1c1c1c'
                }
            },
            boxShadow: {
                'neon-blue': '0 0 10px #00f3ff, 0 0 20px #00f3ff',
                'neon-hover': '0 0 20px #00f3ff, 0 0 40px #00f3ff',
                '3d': '4px 4px 0px 0px rgba(0,0,0,0.5)',
                '3d-active': '2px 2px 0px 0px rgba(0,0,0,0.5)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
