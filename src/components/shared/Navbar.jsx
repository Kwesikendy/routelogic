import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar({ user }) {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    // Don't show navbar on landing, login, register, passenger dashboard, or driver dashboard pages
    // (passenger and driver dashboards have their own integrated sidebars)
    if (['/login', '/register', '/', '/passenger/dashboard', '/driver/dashboard', '/driver/active-trip', '/passenger/booking-confirmation', '/passenger/ride'].includes(location.pathname) || location.pathname.startsWith('/passenger/track')) {
        return null
    }

    const isAdmin = user?.role === 'admin'
    const isDriver = user?.role === 'driver'
    const isPassenger = user?.role === 'passenger'

    return (
        <div className="flex h-screen bg-primary">
            {/* Sidebar */}
            <div className="sidebar">
                {/* Logo */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white">RouteLogic</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6">
                    {isAdmin && (
                        <>
                            <Link to="/admin/dashboard" className={`sidebar-item ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Dashboard
                            </Link>
                            <Link to="/admin/live-map" className={`sidebar-item ${location.pathname === '/admin/live-map' ? 'active' : ''}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Live Map
                            </Link>
                            <Link to="/admin/routes" className={`sidebar-item ${location.pathname === '/admin/routes' ? 'active' : ''}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Routes
                            </Link>
                            <Link to="/admin/fleet" className={`sidebar-item ${location.pathname === '/admin/fleet' ? 'active' : ''}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16c0 1.1 0.9 2 2 2h1c1.1 0 2-0.9 2-2v-3h6v3c0 1.1 0.9 2 2 2h1c1.1 0 2-0.9 2-2v-1h0.5a2.5 2.5 0 0 0 2.5-2.5V8a2.5 2.5 0 0 0-2.5-2.5h-15A2.5 2.5 0 0 0 2 8v5.5A2.5 2.5 0 0 0 4.5 16H4z m1.5-7h15v2h-15V9z" />
                                </svg>
                                Fleet
                            </Link>
                            <Link to="/admin/riders" className={`sidebar-item ${location.pathname === '/admin/riders' ? 'active' : ''}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Riders
                            </Link>
                            <Link to="/admin/analytics" className={`sidebar-item ${location.pathname === '/admin/analytics' ? 'active' : ''}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Analytics
                            </Link>
                            <Link to="/admin/settings" className={`sidebar-item ${location.pathname === '/admin/settings' ? 'active' : ''}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Settings
                            </Link>
                        </>
                    )}

                    {isPassenger && (
                        <>
                            <Link to="/passenger/dashboard" className={`sidebar-item ${location.pathname === '/passenger/dashboard' ? 'active' : ''}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Dashboard
                            </Link>
                        </>
                    )}

                    {isDriver && (
                        <>
                            <Link to="/driver/dashboard" className={`sidebar-item ${location.pathname === '/driver/dashboard' ? 'active' : ''}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Dashboard
                            </Link>
                            <Link to="/driver/active-trip" className={`sidebar-item ${location.pathname === '/driver/active-trip' ? 'active' : ''}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Active Trip
                            </Link>
                        </>
                    )}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</div>
                            <div className="text-xs text-secondary capitalize">{user?.role || 'Guest'}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-sm text-secondary hover:text-white hover:bg-tertiary rounded-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}
