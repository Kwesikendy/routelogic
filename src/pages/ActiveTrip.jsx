import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import Navbar from '../components/shared/Navbar'
import Card from '../components/shared/Card'
import Button from '../components/shared/Button'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export default function ActiveTrip() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [tripData, setTripData] = useState(null)
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }

        // Fetch active trip data
        const fetchTripData = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.get(`${API_URL}/driver/active-trip`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setTripData(response.data.trip)
                setLoading(false)
            } catch (err) {
                console.error('Failed to fetch trip data:', err)
                setLoading(false)
            }
        }

        fetchTripData()

        // Fetch bookings
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token')
                const userId = JSON.parse(userData)._id || JSON.parse(userData).id
                const response = await axios.get(`${API_URL}/driver/bookings?driverId=${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setBookings(response.data.bookings || [])
            } catch (err) {
                console.error('Failed to fetch bookings:', err)
            }
        }

        fetchBookings()
        const bookingsInterval = setInterval(fetchBookings, 5000) // Poll every 5 seconds

        // Send location updates every 10 seconds
        const locationInterval = setInterval(() => {
            if (navigator.geolocation && tripData) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    try {
                        const token = localStorage.getItem('token')
                        await axios.put(
                            `${API_URL}/driver/update-location`,
                            {
                                trotroId: tripData.trotroId,
                                lat: pos.coords.latitude,
                                lng: pos.coords.longitude
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                    } catch (err) {
                        console.error('Failed to update location:', err)
                    }
                })
            }
        }, 10000)

        return () => {
            clearInterval(bookingsInterval)
            clearInterval(locationInterval)
        }
    }, [tripData])

    const handleAcceptBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token')
            await axios.put(
                `${API_URL}/driver/accept-booking/${bookingId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            // Refresh bookings
            const response = await axios.get(`${API_URL}/driver/bookings?driverId=${user._id || user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setBookings(response.data.bookings || [])
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to accept booking')
        }
    }

    const handleStopTrip = async () => {
        if (!confirm('Are you sure you want to stop this trip?')) return

        try {
            const token = localStorage.getItem('token')
            await axios.post(
                `${API_URL}/driver/stop-trip`,
                { trotroId: tripData.trotroId },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            navigate('/driver/dashboard')
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to stop trip')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-light">Loading trip data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar user={user} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="page-title">Active Trip</h1>
                    <p className="text-text-light mt-2">Manage your current trip and bookings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Trip Info */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card>
                            <h3 className="card-title mb-4">Trip Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-text-light text-small">Route</span>
                                    <p className="font-semibold">{tripData?.routeName || 'Circle to Madina'}</p>
                                </div>
                                <div>
                                    <span className="text-text-light text-small">Status</span>
                                    <span className="inline-block px-3 py-1 rounded-full text-small font-medium bg-secondary/10 text-secondary">
                                        Active
                                    </span>
                                </div>
                                <div>
                                    <span className="text-text-light text-small">Available Seats</span>
                                    <p className="font-semibold text-lg">{tripData?.availableSeats || 14}/{tripData?.capacity || 14}</p>
                                </div>
                                <div>
                                    <span className="text-text-light text-small">Fare per Seat</span>
                                    <p className="font-semibold text-primary">GHS {tripData?.fare?.toFixed(2) || '3.50'}</p>
                                </div>
                            </div>

                            <Button
                                variant="danger"
                                onClick={handleStopTrip}
                                className="w-full mt-6"
                            >
                                Stop Trip
                            </Button>
                        </Card>

                        <Card>
                            <h3 className="card-title mb-3">Location Sharing</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                                <span className="text-small text-text-light">Broadcasting location every 10s</span>
                            </div>
                        </Card>
                    </div>

                    {/* Bookings List */}
                    <div className="lg:col-span-2">
                        <Card>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="card-title">Incoming Bookings</h3>
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-small">
                                    {bookings.filter(b => b.status === 'pending').length} Pending
                                </span>
                            </div>

                            {bookings.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-5xl mb-4">📱</div>
                                    <p className="text-text-light">No bookings yet</p>
                                    <p className="text-small text-text-light mt-1">Passengers will appear here when they book</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookings.map(booking => (
                                        <div
                                            key={booking.bookingId || booking._id}
                                            className="border border-border rounded-lg p-4 hover:border-primary transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-semibold">{booking.passengerName || 'Passenger'}</h4>
                                                    <p className="text-small text-text-light">
                                                        {booking.pickupStop} → {booking.dropoffStop}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-small font-medium ${booking.status === 'pending' ? 'bg-warning/10 text-warning' :
                                                        booking.status === 'accepted' ? 'bg-secondary/10 text-secondary' :
                                                            'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-small text-text-light">
                                                    Fare: <span className="font-semibold text-primary">GHS {booking.fare?.toFixed(2)}</span>
                                                </span>
                                                {booking.status === 'pending' && (
                                                    <Button
                                                        onClick={() => handleAcceptBooking(booking.bookingId || booking._id)}
                                                        className="px-4 py-2 text-small"
                                                    >
                                                        Accept
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
