import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import Button from '../components/shared/Button'
import Card from '../components/shared/Card'

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

            // Store token and user info
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            // Redirect based on role
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
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-3xl">R</span>
                    </div>
                    <h1 className="text-section-header">Welcome Back</h1>
                    <p className="text-secondary mt-1">Login to continue</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-text font-medium mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-text font-medium mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-text font-medium mb-2">Login as</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="passenger">Passenger</option>
                            <option value="driver">Driver</option>
                        </select>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/register" className="text-primary hover:text-primary-dark">
                        Don't have an account? Sign up
                    </Link>
                </div>
            </Card>
        </div>
    )
}
