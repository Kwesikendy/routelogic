/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0066FF',
                    dark: '#0052CC',
                    light: '#3385FF',
                },
                secondary: {
                    DEFAULT: '#00C853',
                    dark: '#00A844',
                },
                danger: '#FF3B30',
                warning: '#FFA500',
                background: '#0F1419',
                text: {
                    DEFAULT: '#FFFFFF',
                    light: '#8B92A7',
                },
                border: '#2A3142',
            },
            spacing: {
                'xs': '4px',
                'sm': '8px',
                'md': '16px',
                'lg': '24px',
                'xl': '32px',
            },
            fontSize: {
                'page-title': '32px',
                'section-header': '24px',
                'card-title': '20px',
                'body': '16px',
                'small': '14px',
            },
            borderRadius: {
                'card': '12px',
                'button': '8px',
                'input': '8px',
            },
            boxShadow: {
                'card': '0 2px 8px rgba(0,0,0,0.08)',
            },
        },
    },
    plugins: [],
}
