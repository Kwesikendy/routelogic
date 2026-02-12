import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import Button from '../components/shared/Button'
import Card from '../components/shared/Card'

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

        // Validation
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
            setError(err.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
            <Card className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-3xl">R</span>
                    </div>
                    <h1 className="text-section-header">Create Account</h1>
                    <p className="text-text-light mt-1">Join RouteLogic today</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white font-medium mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white font-medium mb-2">Email</label>
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
                        <label className="block text-white font-medium mb-2">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="0244123456"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white font-medium mb-2">Password</label>
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
                        <label className="block text-white font-medium mb-2">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white font-medium mb-2">Register as</label>
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
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-primary hover:text-primary-dark">
                        Already have an account? Login
                    </Link>
                </div>
            </Card>
        </div>
    )
}
