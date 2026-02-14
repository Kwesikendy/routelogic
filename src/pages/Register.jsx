import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import AuthLayout from '../components/layout/AuthLayout'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Register() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const { confirmPassword, ...registerData } = formData
            const response = await axios.post(`${API_URL}/auth/register`, registerData)
            const { token, user } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            if (user.role === 'passenger') {
                navigate('/passenger/dashboard')
            } else if (user.role === 'driver') {
                navigate('/driver/dashboard')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Start Your Journey"
            subtitle="Join thousands of commuters today"
        >
            {error && (
                <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-100 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="group">
                    <label className="block text-cyan-100 text-xs font-medium mb-1.5 ml-1">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-gray-800/50 border border-gray-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder-gray-500"
                        placeholder="John Doe"
                        required
                    />
                </div>

                <div className="group">
                    <label className="block text-cyan-100 text-xs font-medium mb-1.5 ml-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-gray-800/50 border border-gray-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder-gray-500"
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div className="group">
                    <label className="block text-cyan-100 text-xs font-medium mb-1.5 ml-1">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-gray-800/50 border border-gray-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder-gray-500"
                        placeholder="0244123456"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className="block text-cyan-100 text-xs font-medium mb-1.5 ml-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-gray-800/50 border border-gray-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder-gray-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="group">
                        <label className="block text-cyan-100 text-xs font-medium mb-1.5 ml-1">Confirm</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full bg-gray-800/50 border border-gray-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder-gray-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <label className="block text-cyan-100 text-xs font-medium mb-2 ml-1">I am a...</label>
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
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-900/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <div className="mt-8 text-center text-sm">
                <p className="text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline decoration-cyan-400/30 underline-offset-4 transition-all">
                        Log In
                    </Link>
                </p>
            </div>
        </AuthLayout>
    )
}
