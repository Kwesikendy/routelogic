import { useEffect, useState } from 'react'

export default function AuthLayout({ children, title, subtitle }) {
    // Floating icons animation logic could go here, or just CSS

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gray-900">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                {/* Gradient Mesh */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900 via-gray-900 to-cyan-900 opacity-80"></div>

                {/* Moving Road/Path Effect (CSS Animation) */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)',
                        backgroundSize: '30px 30px',
                        animation: 'moveBackground 20s linear infinite'
                    }}
                ></div>

                {/* Floating Icons - SVGs */}
                <div className="absolute top-1/4 left-1/4 animate-bounce duration-[3000ms] delay-0 opacity-10 text-cyan-500">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" /></svg>
                </div>
                <div className="absolute top-3/4 right-1/4 animate-bounce duration-[4000ms] delay-700 opacity-10 text-teal-500">
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                </div>
                <div className="absolute top-1/2 right-10 animate-pulse duration-[5000ms] opacity-10 text-white">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>
                </div>
                <div className="absolute bottom-20 left-20 animate-pulse duration-[6000ms] opacity-10 text-emerald-500">
                    <svg className="w-28 h-28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4 22h16L12 2zm1 17h-2v-2h2v2zm0-4h-2V8h2v7z" /></svg>
                </div>
            </div>

            {/* Glassmorphic Card */}
            <div className="relative z-10 w-full max-w-md p-8 mx-4">
                {/* Frosted Glass Effect */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"></div>

                <div className="relative z-20">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30 transform rotate-3 hover:rotate-0 transition-all duration-300">
                            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" /></svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
                        <p className="text-cyan-200 mt-2 font-medium">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-center w-full z-10 text-gray-500 text-sm">
                RouteLogic &copy; {new Date().getFullYear()} • Travel Made Simple
            </div>

            <style>{`
                @keyframes moveBackground {
                    0% { background-position: 0 0; }
                    100% { background-position: 100px 100px; }
                }
            `}</style>
        </div>
    )
}
