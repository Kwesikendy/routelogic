import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/shared/Navbar'
import Card from '../components/shared/Card'
import Button from '../components/shared/Button'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function DriverDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [routes, setRoutes] = useState([])
    const [selectedRoute, setSelectedRoute] = useState('')
    const [seats, setSeats] = useState(14)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }

        // Fetch available routes
        const fetchRoutes = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.get(`${API_URL}/routes`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setRoutes(response.data.routes || [])
            } catch (err) {
                console.error('Failed to fetch routes:', err)
            }
        }

        fetchRoutes()
    }, [])

    const handleStartTrip = async () => {
        if (!selectedRoute) {
            alert('Please select a route')
            return
        }

        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            await axios.post(
                `${API_URL}/driver/start-trip`,
                {
                    driverId: user._id || user.id,
                    routeId: selectedRoute,
                    availableSeats: seats
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            navigate('/driver/active-trip')
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to start trip')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar user={user} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="page-title">Driver Dashboard</h1>
                    <p className="text-text-light mt-2">Start your trip and manage bookings</p>
                </div>

                <Card>
                    <h2 className="section-header mb-6">Start Your Trip</h2>

                    <div className="space-y-6">
                        {/* Route Selection */}
                        <div>
                            <label className="block text-text font-medium mb-2">Select Route</label>
                            <select
                                value={selectedRoute}
                                onChange={(e) => setSelectedRoute(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Choose a route</option>
                                {routes.map(route => (
                                    <option key={route._id || route.routeId} value={route._id || route.routeId}>
                                        {route.name || route.routeName} ({route.pickup} → {route.destination})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Seats Selection */}
                        <div>
                            <label className="block text-text font-medium mb-2">
                                Available Seats: {seats}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="14"
                                value={seats}
                                onChange={(e) => setSeats(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-small text-text-light mt-1">
                                <span>1</span>
                                <span>14</span>
                            </div>
                        </div>

                        {/* Selected Route Info */}
                        {selectedRoute && (
                            <div className="bg-background rounded-lg p-4">
                                <h3 className="font-semibold mb-2">Route Details</h3>
                                {routes.find(r => (r._id || r.routeId) === selectedRoute) && (
                                    <div className="space-y-1 text-small">
                                        <p><span className="text-text-light">Distance:</span> {routes.find(r => (r._id || r.routeId) === selectedRoute).distance} km</p>
                                        <p><span className="text-text-light">Base Fare:</span> GHS {routes.find(r => (r._id || r.routeId) === selectedRoute).baseFare?.toFixed(2)}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            onClick={handleStartTrip}
                            disabled={loading || !selectedRoute}
                            className="w-full"
                        >
                            {loading ? 'Starting Trip...' : 'Start Trip'}
                        </Button>
                    </div>
                </Card>

                {/* Instructions */}
                <Card className="mt-6">
                    <h3 className="card-title mb-3">How it works</h3>
                    <ol className="space-y-2 text-text-light">
                        <li className="flex gap-3">
                            <span className="font-semibold text-primary">1.</span>
                            <span>Select your route and set available seats</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-semibold text-primary">2.</span>
                            <span>Start your trip - passengers can now see and book your trotro</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-semibold text-primary">3.</span>
                            <span>Accept booking requests from passengers</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-semibold text-primary">4.</span>
                            <span>Complete your trip and earn revenue</span>
                        </li>
                    </ol>
                </Card>
            </div>
        </div>
    )
}
