import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import { io } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Accra center coordinates
const ACCRA_CENTER = [5.6037, -0.1870]

// Dark map styling
const mapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
]

export default function ActiveTrip() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [tripData, setTripData] = useState(null)
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentLocation, setCurrentLocation] = useState(null)
    const [earnings, setEarnings] = useState(0)

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
                if (err.response && err.response.status === 404) {
                    navigate('/driver/dashboard')
                }
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
                const bookingsList = response.data.bookings || []
                setBookings(bookingsList)

                // Calculate earnings from accepted bookings
                const totalEarnings = bookingsList
                    .filter(b => b.status === 'accepted')
                    .reduce((sum, b) => sum + (b.fare || 0), 0)
                setEarnings(totalEarnings)
            } catch (err) {
                console.error('Failed to fetch bookings:', err)
            }
        }

        fetchBookings()
        const bookingsInterval = setInterval(fetchBookings, 5000)

        // Socket.io for real-time updates
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')

        if (tripData?.trotroId) {
            console.log('🔌 Connecting to socket for trotro:', tripData.trotroId)
            socket.emit('subscribe-trotro', { trotroId: tripData.trotroId })

            socket.on('new-booking', (booking) => {
                console.log('🔔 New booking received!', booking)
                fetchBookings() // Refresh full list to be safe
                // Optional: Show toast notification
                new Audio('/notification.mp3').play().catch(e => console.log('Audio play failed', e))
            })

            socket.on('connect', () => console.log('✅ Socket connected'))
            socket.on('connect_error', (err) => console.error('❌ Socket connection error:', err))
        }

        return () => {
            clearInterval(bookingsInterval)
            if (tripData?.trotroId) {
                console.log('🔌 Disconnecting socket')
                socket.emit('unsubscribe-trotro', { trotroId: tripData.trotroId })
            }
            socket.disconnect()
        }
    }, [tripData?.trotroId])

    // Get and update location
    useEffect(() => {
        const updateLocation = () => {
            if (navigator.geolocation && tripData) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const newLocation = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    }
                    setCurrentLocation(newLocation)

                    try {
                        const token = localStorage.getItem('token')
                        await axios.put(
                            `${API_URL}/driver/update-location`,
                            {
                                trotroId: tripData.trotroId,
                                ...newLocation
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                    } catch (err) {
                        console.error('Failed to update location:', err)
                    }
                })
            }
        }

        if (tripData) {
            updateLocation()
            const locationInterval = setInterval(updateLocation, 10000)
            return () => clearInterval(locationInterval)
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                    <p className="text-secondary">Loading trip data...</p>
                </div>
            </div>
        )
    }

    if (!tripData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <svg className="w-16 h-16 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-bold text-white mb-2">No Active Trip</h2>
                    <p className="text-secondary mb-6">Start a trip from your dashboard</p>
                    <button
                        onClick={() => navigate('/driver/dashboard')}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-gray-900 rounded-lg font-bold"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    const pendingCount = bookings.filter(b => b.status === 'pending').length
    const acceptedCount = bookings.filter(b => b.status === 'accepted').length

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar - Trip Management */}
            <div className="w-full md:w-96 bg-secondary border-r border-border overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => navigate('/driver/dashboard')}
                            className="w-8 h-8 bg-tertiary border border-border rounded-lg flex items-center justify-center hover:bg-border transition-colors"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">Active Trip</h1>
                            <p className="text-secondary text-xs">Managing your route</p>
                        </div>
                    </div>
                </div>

                {/* Trip Stats */}
                <div className="p-6 border-b border-border">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-tertiary/40 border border-border/50 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-cyan-400">{tripData?.availableSeats || 14}</div>
                            <div className="text-xs text-muted mt-1">Seats Left</div>
                        </div>
                        <div className="bg-tertiary/40 border border-border/50 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-teal-400">{acceptedCount}</div>
                            <div className="text-xs text-muted mt-1">Booked</div>
                        </div>
                        <div className="bg-tertiary/40 border border-border/50 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-green">GHS {earnings.toFixed(0)}</div>
                            <div className="text-xs text-muted mt-1">Earned</div>
                        </div>
                    </div>
                </div>

                {/* Route Info */}
                <div className="p-6 border-b border-border">
                    <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Route Details
                    </h2>
                    <div className="bg-tertiary/40 border border-border/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-bold">{tripData?.routeName || 'Circle to Madina'}</h3>
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green/20 text-green flex items-center gap-1">
                                <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
                                Active
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-secondary">Fare per Seat:</span>
                                <span className="text-cyan-400 font-bold">GHS {tripData?.fare?.toFixed(2) || '3.50'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary">Capacity:</span>
                                <span className="text-white font-semibold">{tripData?.capacity || 14} seats</span>
                            </div>
                        </div>
                    </div>

                    {/* Location Sharing Status */}
                    <div className="mt-4 flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
                        <span className="text-secondary">Broadcasting location every 10s</span>
                    </div>
                </div>

                {/* Bookings */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Bookings
                        </h2>
                        {pendingCount > 0 && (
                            <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                                {pendingCount} Pending
                            </span>
                        )}
                    </div>

                    {bookings.length === 0 ? (
                        <div className="bg-tertiary/40 border border-border/50 rounded-xl p-6 text-center">
                            <svg className="w-12 h-12 text-secondary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <p className="text-secondary text-sm">No bookings yet</p>
                            <p className="text-muted text-xs mt-1">Waiting for passengers...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {bookings.map(booking => (
                                <div
                                    key={booking.bookingId || booking._id}
                                    className="bg-tertiary border border-border rounded-xl p-4 hover:border-cyan-500/50 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-white font-bold text-sm">{booking.passengerName || 'Passenger'}</h4>
                                            <p className="text-secondary text-xs mt-1">
                                                {booking.pickupStop} → {booking.dropoffStop}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                            booking.status === 'accepted' ? 'bg-green/20 text-green' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-cyan-400 font-bold text-sm">
                                            GHS {booking.fare?.toFixed(2)}
                                        </span>
                                        {booking.status === 'pending' && (
                                            <button
                                                onClick={() => handleAcceptBooking(booking.bookingId || booking._id)}
                                                className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs font-semibold hover:bg-cyan-500/20 transition-colors"
                                            >
                                                Accept
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stop Trip Button */}
                <div className="p-6 border-t border-border mt-auto">
                    <button
                        onClick={handleStopTrip}
                        className="w-full px-6 py-4 bg-danger/10 text-danger rounded-lg font-bold hover:bg-danger/20 transition-all border border-danger/30"
                    >
                        Stop Trip & Go Offline
                    </button>
                </div>
            </div>

            {/* Leaflet Map View */}
            <div className="flex-1 relative h-full">
                <div className="absolute inset-0">
                    <MapContainer
                        center={currentLocation ? [currentLocation.lat, currentLocation.lng] : ACCRA_CENTER}
                        zoom={13}
                        style={{ width: '100%', height: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />

                        {/* Driver's current location */}
                        {currentLocation && (
                            <Marker position={[currentLocation.lat, currentLocation.lng]}>
                                <Popup>
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">🚐</div>
                                        <div className="font-bold">Your Location</div>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>

                {/* Trip Info Overlay */}
                <div className="absolute top-6 left-6 z-[1000]">
                    <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-gray-200 min-w-[280px]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-3 h-3 bg-green rounded-full animate-pulse"></div>
                            <div>
                                <p className="text-gray-900 font-bold text-sm">{tripData?.routeName || 'Active Route'}</p>
                                <p className="text-gray-600 text-xs text-left">Live tracking enabled</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-gray-100 rounded-lg p-2">
                                <p className="text-gray-500 text-left">Bookings</p>
                                <p className="text-gray-900 font-bold text-left">{acceptedCount}/{tripData?.capacity || 14}</p>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-2">
                                <p className="text-gray-500 text-left">Earnings</p>
                                <p className="text-green font-bold text-left">GHS {earnings.toFixed(0)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Bookings Alert */}
                {pendingCount > 0 && (
                    <div className="absolute top-6 right-6 z-[1000]">
                        <div className="bg-amber-500 text-gray-900 rounded-xl p-4 shadow-xl animate-pulse">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                                <span className="font-bold">{pendingCount} New Booking{pendingCount > 1 ? 's' : ''}!</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
