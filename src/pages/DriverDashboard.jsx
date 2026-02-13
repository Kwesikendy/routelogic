import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleMap, LoadScript, Polyline } from '@react-google-maps/api'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Accra center coordinates
const ACCRA_CENTER = { lat: 5.6037, lng: -0.1870 }

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

export default function DriverDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [routes, setRoutes] = useState([])
    const [selectedRoute, setSelectedRoute] = useState('')
    const [seats, setSeats] = useState(14)
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState({
        todayTrips: 0,
        todayEarnings: 0,
        totalPassengers: 0,
        rating: 4.8
    })

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

    const selectedRouteData = routes.find(r => (r._id || r.routeId) === selectedRoute)

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar - Driver Controls */}
            <div className="w-full md:w-96 bg-secondary border-r border-border overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white">RouteLogic</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">Welcome, {user?.name}!</h1>
                    <p className="text-secondary text-sm">Ready to start earning?</p>
                </div>

                {/* Stats Cards */}
                <div className="p-6 border-b border-border">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-tertiary/40 border border-border/50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-xs text-secondary uppercase font-bold">Trips</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.todayTrips}</p>
                            <p className="text-xs text-muted">Today</p>
                        </div>
                        <div className="bg-tertiary/40 border border-border/50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs text-secondary uppercase font-bold">Earned</span>
                            </div>
                            <p className="text-2xl font-bold text-white">GHS {stats.todayEarnings}</p>
                            <p className="text-xs text-muted">Today</p>
                        </div>
                        <div className="bg-tertiary/40 border border-border/50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="text-xs text-secondary uppercase font-bold">Passengers</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.totalPassengers}</p>
                            <p className="text-xs text-muted">Total</p>
                        </div>
                        <div className="bg-tertiary/40 border border-border/50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span className="text-xs text-secondary uppercase font-bold">Rating</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.rating}</p>
                            <p className="text-xs text-muted">Average</p>
                        </div>
                    </div>
                </div>

                {/* Start Trip Form */}
                <div className="p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Start Your Trip
                    </h2>

                    <div className="space-y-4 mb-4">
                        {/* Route Selection */}
                        <div>
                            <label className="block text-white font-medium mb-2 text-sm">Select Route</label>
                            <select
                                value={selectedRoute}
                                onChange={(e) => setSelectedRoute(e.target.value)}
                                className="input-field w-full"
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
                            <label className="block text-white font-medium mb-2 text-sm">
                                Available Seats: <span className="text-cyan-400 font-bold">{seats}</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="14"
                                value={seats}
                                onChange={(e) => setSeats(Number(e.target.value))}
                                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
                                style={{
                                    accentColor: '#22d3ee'
                                }}
                            />
                            <div className="flex justify-between text-xs text-muted mt-1">
                                <span>1</span>
                                <span>14</span>
                            </div>
                        </div>

                        {/* Selected Route Info */}
                        {selectedRouteData && (
                            <div className="bg-tertiary/40 border border-border/50 rounded-xl p-4">
                                <h3 className="text-white font-bold mb-3 text-sm">Route Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-secondary">Distance:</span>
                                        <span className="text-white font-semibold">{selectedRouteData.distance} km</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary">Base Fare:</span>
                                        <span className="text-cyan-400 font-bold">GHS {selectedRouteData.baseFare?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary">Potential Earnings:</span>
                                        <span className="text-teal-400 font-bold">GHS {(selectedRouteData.baseFare * seats).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleStartTrip}
                        disabled={loading || !selectedRoute}
                        className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-gray-900 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Starting Trip...
                            </span>
                        ) : (
                            'Start Trip & Go Online'
                        )}
                    </button>
                </div>

                {/* How it Works */}
                <div className="px-6 pb-6">
                    <div className="bg-tertiary/40 border border-border/50 rounded-xl p-4">
                        <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            How it works
                        </h3>
                        <ol className="space-y-2 text-xs text-secondary">
                            <li className="flex gap-2">
                                <span className="text-cyan-400 font-bold">1.</span>
                                <span>Select your route and set available seats</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-cyan-400 font-bold">2.</span>
                                <span>Start trip - passengers can now book</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-cyan-400 font-bold">3.</span>
                                <span>Accept bookings and pick up passengers</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-cyan-400 font-bold">4.</span>
                                <span>Complete trip and earn revenue</span>
                            </li>
                        </ol>
                    </div>
                </div>

                {/* User Profile */}
                <div className="mt-auto p-6 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{user?.name}</p>
                            <p className="text-secondary text-xs">Driver</p>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.clear()
                                navigate('/login')
                            }}
                            className="text-secondary hover:text-danger text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Google Map View */}
            <div className="flex-1 relative">
                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={ACCRA_CENTER}
                        zoom={12}
                        options={{
                            styles: mapStyles,
                            disableDefaultUI: false,
                            zoomControl: true,
                            mapTypeControl: false,
                            streetViewControl: false,
                            fullscreenControl: true,
                        }}
                    >
                        {/* Show selected route path if available - TEMPORARILY DISABLED */}
                        {/* {selectedRouteData?.coordinates && (
                            <Polyline
                                path={selectedRouteData.coordinates.map(coord => ({ lat: coord[0], lng: coord[1] }))}
                                options={{
                                    strokeColor: "#22d3ee",
                                    strokeWeight: 4,
                                    strokeOpacity: 0.8,
                                }}
                            />
                        )} */}
                    </GoogleMap>
                </LoadScript>

                {/* Map Overlay Info */}
                {!selectedRoute && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-[1000]">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-200">
                            <svg className="w-16 h-16 text-cyan-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Select Your Route</h3>
                            <p className="text-gray-600 text-sm">Choose a route to see it on the map</p>
                            <p className="text-cyan-500 text-xs mt-2 font-semibold">🗺️ Powered by Google Maps</p>
                        </div>
                    </div>
                )}

                {/* Active Trip Indicator */}
                {selectedRoute && (
                    <div className="absolute top-6 left-6 z-[1000]">
                        <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                                <div>
                                    <p className="text-gray-900 font-bold text-sm">{selectedRouteData?.name || selectedRouteData?.routeName}</p>
                                    <p className="text-gray-600 text-xs">{selectedRouteData?.pickup} → {selectedRouteData?.destination}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
