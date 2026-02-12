import { Link } from 'react-router-dom'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const chartData = [
    { time: '06:00', riders: 400, efficiency: 85 },
    { time: '08:00', riders: 1200, efficiency: 72 },
    { time: '10:00', riders: 900, efficiency: 88 },
    { time: '12:00', riders: 1100, efficiency: 91 },
    { time: '14:00', riders: 1000, efficiency: 84 },
    { time: '16:00', riders: 1600, efficiency: 78 },
    { time: '18:00', riders: 1400, efficiency: 94 },
    { time: '20:00', riders: 800, efficiency: 96 },
]

export default function LandingPage() {
    const [stats] = useState({
        activeVehicles: 48,
        dailyRiders: 12847,
        activeRoutes: 12,
        systemEfficiency: 94.2,
        vehicleChange: '+3 from yesterday',
        ridersChange: '+8.2% vs last week',
        routesStatus: 'All routes operational',
        efficiencyChange: '+2.1% AI optimized'
    })

    const [fleet] = useState([
        { id: 'HV-001', type: 'Electric Bus', route: 'Circle', status: 'Active', battery: 78, pax: 34, icon: 'bus' },
        { id: 'HV-002', type: 'Hybrid Shuttle', route: 'Madina', status: 'Active', battery: 92, pax: 18, icon: 'bus' },
        { id: 'HV-003', type: 'Electric Bus', route: 'Achimota', status: 'Delayed', battery: 45, pax: 42, icon: 'clock' },
        { id: 'HV-004', type: 'Autonomous Mini', route: 'Campus', status: 'Active', battery: 61, pax: 6, icon: 'bus' },
        { id: 'HV-005', type: 'Hybrid Shuttle', route: 'Tema', status: 'Maintenance', battery: 12, pax: 0, icon: 'alert' },
    ])

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'text-green'
            case 'Delayed': return 'text-warning'
            case 'Maintenance': return 'text-danger'
            default: return 'text-secondary'
        }
    }

    const getStatusDot = (status) => {
        switch (status) {
            case 'Active': return 'bg-green'
            case 'Delayed': return 'bg-warning'
            case 'Maintenance': return 'bg-danger'
            default: return 'bg-secondary'
        }
    }

    return (
        <div className="flex h-screen bg-background">
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
                <nav className="flex-1 py-6 overflow-y-auto">
                    <Link to="/" className="sidebar-item active">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </Link>
                    <a href="#map" className="sidebar-item">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Live Map
                    </a>
                    <a href="#routes" className="sidebar-item">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Routes
                    </a>
                    <a href="#fleet" className="sidebar-item">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16c0 1.1 0.9 2 2 2h1c1.1 0 2-0.9 2-2v-3h6v3c0 1.1 0.9 2 2 2h1c1.1 0 2-0.9 2-2v-1h0.5a2.5 2.5 0 0 0 2.5-2.5V8a2.5 2.5 0 0 0-2.5-2.5h-15A2.5 2.5 0 0 0 2 8v5.5A2.5 2.5 0 0 0 4.5 16H4z m1.5-7h15v2h-15V9z" />
                        </svg>
                        Fleet
                    </a>
                    <a href="#riders" className="sidebar-item">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Riders
                    </a>
                    <a href="#analytics" className="sidebar-item">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Analytics
                    </a>
                    <a href="#settings" className="sidebar-item">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                    </a>
                </nav>

                {/* CTA Buttons */}
                <div className="p-4 border-t border-border">
                    <div className="space-y-3">
                        <Link
                            to="/register?role=passenger"
                            className="block w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-gray-900 rounded-lg font-semibold text-sm text-center hover:shadow-lg transition-all"
                        >
                            Find a Ride
                        </Link>
                        <Link
                            to="/register?role=driver"
                            className="block w-full px-4 py-3 bg-white text-gray-900 rounded-lg font-bold text-sm text-center hover:bg-gray-100 transition-all shadow-lg border border-gray-200"
                        >
                            Drive with Us
                        </Link>
                        <Link
                            to="/login"
                            className="block text-center text-secondary hover:text-cyan-400 text-sm pt-2 transition-colors"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-[260px] overflow-auto">
                {/* Header */}
                <div className="bg-secondary border-b border-border px-8 py-6 sticky top-0 z-10">
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
                                    className="input-field w-80 !pl-14 focus:w-96 transition-all"
                                />
                                <svg className="w-5 h-5 text-muted absolute left-5 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                {/* Content Grid */}
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Network & Ridership */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Network Overview Card */}
                            <div className="relative overflow-hidden rounded-2xl bg-[#0a0f14] border border-border h-80 group">
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <img
                                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
                                        alt="Network Grid"
                                        className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f14] via-transparent to-transparent opacity-80"></div>
                                </div>

                                {/* Futuristic Grid Background Overlay */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                                    <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M50 200C150 150 300 250 400 200C500 150 650 250 750 200" stroke="var(--accent-cyan)" strokeWidth="2" strokeDasharray="8 8" className="animate-pulse" />
                                        <circle cx="400" cy="200" r="4" fill="var(--accent-cyan)" className="animate-ping" />
                                    </svg>
                                </div>

                                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-3xl font-bold text-white mb-2">Network Overview</h2>
                                            <p className="text-secondary text-sm">12 active routes · 48 vehicles in service</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-green/10 px-3 py-1 rounded-full border border-green/20">
                                            <span className="w-2 h-2 bg-green rounded-full animate-pulse shadow-[0_0_8px_var(--success)]"></span>
                                            <span className="text-green text-xs font-bold uppercase tracking-wider">System Online</span>
                                        </div>
                                    </div>
                                    <div className="mt-auto">
                                        <div className="flex gap-4">
                                            <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10">
                                                <div className="text-cyan-400 text-xs font-bold mb-1 uppercase">Live Node</div>
                                                <div className="text-white font-mono">CC-TRANSIT-01</div>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10">
                                                <div className="text-teal-400 text-xs font-bold mb-1 uppercase">Efficiency</div>
                                                <div className="text-white font-mono">94.2% Peak</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ridership & Efficiency Chart */}
                            <div className="card bg-[#0a0f14] border-border p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Ridership & Efficiency</h2>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                                            <span className="text-secondary text-xs font-bold uppercase">Riders</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-teal-400"></span>
                                            <span className="text-secondary text-xs font-bold uppercase">Efficiency</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorRiders" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                            <XAxis
                                                dataKey="time"
                                                stroke="var(--text-muted)"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                stroke="var(--text-muted)"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(v) => `${v}`}
                                            />
                                            <Tooltip
                                                contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                                itemStyle={{ fontSize: '12px' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="riders"
                                                stroke="var(--accent-cyan)"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorRiders)"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="efficiency"
                                                stroke="var(--accent-teal)"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                fill="transparent"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Fleet Status */}
                        <div className="card bg-[#0a0f14] border-border h-fit">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Fleet Status</h2>
                                <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest bg-cyan-400/10 px-3 py-1 rounded-full">Live</span>
                            </div>

                            <div className="space-y-4">
                                {fleet.map((vehicle) => (
                                    <div key={vehicle.id} className="bg-tertiary/40 border border-border/50 rounded-xl p-4 hover:border-cyan-500/50 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-border/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400/20 transition-colors">
                                                {vehicle.icon === 'bus' && (
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                    </svg>
                                                )}
                                                {vehicle.icon === 'clock' && (
                                                    <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                                {vehicle.icon === 'alert' && (
                                                    <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-white font-bold tracking-tight">{vehicle.id}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${getStatusDot(vehicle.status)}`}></span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${getStatusColor(vehicle.status)}`}>
                                                            {vehicle.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-secondary text-xs truncate">
                                                    {vehicle.type} · {vehicle.route}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-teal-400 font-bold mb-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    <span className="text-sm">{vehicle.battery}%</span>
                                                </div>
                                                <div className="text-[10px] text-text-muted font-bold uppercase">{vehicle.pax} pax</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-6 py-3 border border-border border-dashed rounded-xl text-secondary text-sm font-bold uppercase tracking-widest hover:border-cyan-500/50 hover:text-white transition-all">
                                View Full Fleet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
