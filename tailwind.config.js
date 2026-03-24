/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./**/*.{html,js}"],
    theme: {
        extend: {
            colors: {
                primary: '#6366F1',   // Indigo
                secondary: '#818CF8', // Indigo Light
                cta: '#22C55E',       // Green
                background: '#030712', // Darkest Gray (Overridden for Dark Mode)
                surface: '#111827',    // Gray 900
                text: '#F8FAFC',       // Slate 50
            },
            fontFamily: {
                sans: ['"Exo 2"', 'sans-serif'],
                display: ['Orbitron', 'sans-serif'],
            },
            boxShadow: {
                'neon': '0 0 10px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)',
                'neon-hover': '0 0 15px rgba(99, 102, 241, 0.8), 0 0 30px rgba(99, 102, 241, 0.5)',
            }
        },
    },
    plugins: [],
}
