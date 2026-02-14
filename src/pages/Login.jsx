import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/shared/Button'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Login() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: searchParams.get('role') || 'passenger'
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await axios.post(`${API_URL}/auth/login`, formData)
            const { token, user } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            if (user.role === 'passenger') {
                navigate('/passenger/dashboard')
            } else if (user.role === 'driver') {
                navigate('/driver/dashboard')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to continue your journey"
        >
            {error && (
                <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-100 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group">
                    <label className="block text-cyan-100 text-sm font-medium mb-2 ml-1">Email Address</label>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-gray-800/50 border border-gray-600/50 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder-gray-500 group-hover:bg-gray-800/70"
                            placeholder="name@example.com"
                            required
                        />
                        <div className="absolute right-3 top-3.5 text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="group">
                    <label className="block text-cyan-100 text-sm font-medium mb-2 ml-1">Password</label>
                    <div className="relative">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-gray-800/50 border border-gray-600/50 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder-gray-500 group-hover:bg-gray-800/70"
                            placeholder="••••••••"
                            required
                        />
                        <div className="absolute right-3 top-3.5 text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-cyan-100 text-sm font-medium mb-2 ml-1">I am a...</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'passenger' })}
                            className={`py-3 px-4 rounded-xl font-medium text-sm transition-all border ${formData.role === 'passenger'
                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-900/20'
                                    : 'bg-gray-800/30 border-gray-600/30 text-gray-400 hover:bg-gray-800/50'
                                }`}
                        >
                            🧔 Passenger
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'driver' })}
                            className={`py-3 px-4 rounded-xl font-medium text-sm transition-all border ${formData.role === 'driver'
                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-900/20'
                                    : 'bg-gray-800/30 border-gray-600/30 text-gray-400 hover:bg-gray-800/50'
                                }`}
                        >
                            🚌 Driver
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-900/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing In...
                        </span>
                    ) : 'Sign In'}
                </button>
            </form>

            <div className="mt-8 text-center text-sm">
                <p className="text-gray-400">
                    New to RouteLogic?{' '}
                    <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline decoration-cyan-400/30 underline-offset-4 transition-all">
                        Create an account
                    </Link>
                </p>
            </div>
        </AuthLayout>
    )
}
