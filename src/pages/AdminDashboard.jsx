import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [stats, setStats] = useState({
        activeVehicles: 48,
        dailyRiders: 12847,
        activeRoutes: 12,
        systemEfficiency: 94.2,
        vehicleChange: '+3 from yesterday',
        ridersChange: '+8.2% vs last week',
        routesStatus: 'All routes operational',
        efficiencyChange: '+2.1% AI optimized'
    })

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }

        // Fetch dashboard stats
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.get(`${API_URL}/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (response.data.stats) {
                    setStats(response.data.stats)
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err)
            }
        }

        fetchStats()
        const interval = setInterval(fetchStats, 30000) // Update every 30s

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex h-screen bg-primary">
            {/* Main Content */}
            <div className="flex-1 ml-0 md:ml-[260px] overflow-auto pt-16 md:pt-0">
                {/* Header */}
                <div className="bg-secondary border-b border-border px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">Command Center</h1>
                            <p className="text-secondary text-sm">Real-time hybrid transit operations</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search routes, vehicles..."
                                    className="input-field w-80 pl-10"
                                />
                                <svg className="w-5 h-5 text-muted absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button className="relative p-2 hover:bg-tertiary rounded-lg transition-colors">
                                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Active Vehicles */}
                        <div className="stat-card group hover:border-cyan-500 transition-all animate-fadeIn">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-secondary text-sm mb-1">Active Vehicles</div>
                                    <div className="text-4xl font-bold text-white">{stats.activeVehicles}</div>
                                </div>
                                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16c0 1.1 0.9 2 2 2h1c1.1 0 2-0.9 2-2v-3h6v3c0 1.1 0.9 2 2 2h1c1.1 0 2-0.9 2-2v-1h0.5a2.5 2.5 0 0 0 2.5-2.5V8a2.5 2.5 0 0 0-2.5-2.5h-15A2.5 2.5 0 0 0 2 8v5.5A2.5 2.5 0 0 0 4.5 16H4z m1.5-7h15v2h-15V9z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-green text-sm font-medium">{stats.vehicleChange}</div>
                        </div>

                        {/* Daily Riders */}
                        <div className="stat-card group hover:border-cyan-500 transition-all animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-secondary text-sm mb-1">Daily Riders</div>
                                    <div className="text-4xl font-bold text-white">{stats.dailyRiders.toLocaleString()}</div>
                                </div>
                                <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-green text-sm font-medium">{stats.ridersChange}</div>
                        </div>

                        {/* Active Routes */}
                        <div className="stat-card group hover:border-cyan-500 transition-all animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-secondary text-sm mb-1">Active Routes</div>
                                    <div className="text-4xl font-bold text-white">{stats.activeRoutes}</div>
                                </div>
                                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-secondary text-sm">{stats.routesStatus}</div>
                        </div>

                        {/* System Efficiency */}
                        <div className="stat-card group hover:border-cyan-500 transition-all animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-secondary text-sm mb-1">System Efficiency</div>
                                    <div className="text-4xl font-bold text-white">{stats.systemEfficiency}%</div>
                                </div>
                                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-green text-sm font-medium">{stats.efficiencyChange}</div>
                        </div>
                    </div>

                    {/* Network Overview & Fleet Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Network Overview */}
                        <div className="lg:col-span-2 card">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Network Overview</h2>
                                <div className="flex items-center gap-2">
                                    <span className="status-dot active"></span>
                                    <span className="text-green text-sm font-medium">System Online</span>
                                </div>
                            </div>
                            <div className="bg-tertiary rounded-lg p-6 h-80 flex items-center justify-center">
                                <div className="text-center">
                                    <svg className="w-16 h-16 text-cyan-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    <p className="text-secondary">Map visualization will appear here</p>
                                    <p className="text-muted text-sm mt-2">{stats.activeRoutes} active routes · {stats.activeVehicles} vehicles in operation</p>
                                </div>
                            </div>
                        </div>

                        {/* Fleet Status */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Fleet Status</h2>
                                <span className="badge-cyan">Live</span>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-tertiary rounded-lg p-4 hover:bg-opacity-80 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16c0 1.1 0.9 2 2 2h1c1.1 0 2-0.9 2-2v-3h6v3c0 1.1 0.9 2 2 2h1c1.1 0 2-0.9 2-2v-1h0.5a2.5 2.5 0 0 0 2.5-2.5V8a2.5 2.5 0 0 0-2.5-2.5h-15A2.5 2.5 0 0 0 2 8v5.5A2.5 2.5 0 0 0 4.5 16H4z m1.5-7h15v2h-15V9z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white font-semibold">HV-001</div>
                                            <div className="text-muted text-xs">Electric Bus - Circle Route</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="status-dot active"></span>
                                            <span className="text-green text-sm">Active</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm">
                                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span className="text-white font-medium">78%</span>
                                            <span className="text-muted text-xs">34 pax</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-tertiary rounded-lg p-4 hover:bg-opacity-80 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16c0 1.1 0.9 2 2 2h1c1.1 0 2-0.9 2-2v-3h6v3c0 1.1 0.9 2 2 2h1c1.1 0 2-0.9 2-2v-1h0.5a2.5 2.5 0 0 0 2.5-2.5V8a2.5 2.5 0 0 0-2.5-2.5h-15A2.5 2.5 0 0 0 2 8v5.5A2.5 2.5 0 0 0 4.5 16H4z m1.5-7h15v2h-15V9z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white font-semibold">HV-002</div>
                                            <div className="text-muted text-xs">Hybrid Shuttle - Madina Route</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="status-dot active"></span>
                                            <span className="text-green text-sm">Active</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm">
                                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span className="text-white font-medium">92%</span>
                                            <span className="text-muted text-xs">18 pax</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
