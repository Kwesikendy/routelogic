import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper to calculate distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radius of earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

// Component to handle map effects like flying to location
function MapEffects({ pickupLocation, destinationLocation }) {
    const map = useMap()

    useEffect(() => {
        if (pickupLocation && destinationLocation) {
            const bounds = L.latLngBounds([
                [pickupLocation.lat, pickupLocation.lng],
                [destinationLocation.lat, destinationLocation.lng]
            ])
            map.fitBounds(bounds, { padding: [50, 50] })
        } else if (pickupLocation) {
            map.flyTo([pickupLocation.lat, pickupLocation.lng], 14)
        } else if (destinationLocation) {
            map.flyTo([destinationLocation.lat, destinationLocation.lng], 14)
        }
    }, [pickupLocation, destinationLocation, map])

    return null
}

// Accenture Center coordinates
const ACCRA_CENTER = [5.6037, -0.1870]

function ActiveRideBanner() {
    const navigate = useNavigate()
    const [hasActiveRide, setHasActiveRide] = useState(false)

    useEffect(() => {
        const checkActiveRide = async () => {
            try {
                const token = localStorage.getItem('token')
                await axios.get(`${API_URL}/active-booking`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setHasActiveRide(true)
            } catch (err) {
                setHasActiveRide(false)
            }
        }
        checkActiveRide()
    }, [])

    if (!hasActiveRide) return null

    return (
        <div
            onClick={() => navigate('/passenger/ride')}
            className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all border border-emerald-400/30 group"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-xl">🚎</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Trip in Progress</h3>
                        <p className="text-emerald-100 text-xs">Click to track your ride</p>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </div>
    )
}



export default function PassengerDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [pickup, setPickup] = useState('')
    const [destination, setDestination] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [selectedTrotro, setSelectedTrotro] = useState(null)
    const [estimatedTime, setEstimatedTime] = useState(null)
    const [routeCoordinates, setRouteCoordinates] = useState(null)

    // Common Accra locations with coordinates
    const locations = [
        { name: 'Circle', lat: 5.6037, lng: -0.1870 },
        { name: 'Madina', lat: 5.6893, lng: -0.1677 },
        { name: 'Tema', lat: 5.6698, lng: -0.0166 },
        { name: 'Legon', lat: 5.6505, lng: -0.1870 },
        { name: '37 Station', lat: 5.5893, lng: -0.1870 },
        { name: 'Achimota', lat: 5.6893, lng: -0.2270 },
        { name: 'Kasoa', lat: 5.5270, lng: -0.4170 },
        { name: 'Lapaz', lat: 5.6270, lng: -0.2570 },
        { name: 'Kaneshie', lat: 5.5693, lng: -0.2370 },
        { name: 'Adabraka', lat: 5.5693, lng: -0.2070 }
    ]

    // Demo trotro locations for visual interest
    const demoTrotros = [
        { id: 1, lat: 5.6137, lng: -0.1970, name: 'Circle Route', seats: 8, fare: 3.50 },
        { id: 2, lat: 5.6793, lng: -0.1577, name: 'Madina Route', seats: 5, fare: 4.00 },
        { id: 3, lat: 5.5893, lng: -0.1970, name: '37 Station Route', seats: 12, fare: 2.50 },
    ]

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    const handleSearch = async () => {
        if (!pickup || !destination) {
            setError('Please select both pickup and destination')
            return
        }

        if (pickup === destination) {
            setError('Pickup and destination cannot be the same')
            return
        }

        setError('')
        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(
                `${API_URL}/search-route`,
                { pickup, destination },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setResults(response.data.routes || [])
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to search routes')
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const pickupLocation = locations.find(loc => loc.name === pickup)
    const destinationLocation = locations.find(loc => loc.name === destination)

    // Update estimated time when pickup/destination changes
    useEffect(() => {
        if (pickupLocation && destinationLocation) {
            // Reset state
            setEstimatedTime('Calculating...')
            setRouteCoordinates(null)

            // Calculate straight line distance as fallback base
            const dist = calculateDistance(
                pickupLocation.lat, pickupLocation.lng,
                destinationLocation.lat, destinationLocation.lng
            )

            // Fetch real route from OSRM
            const fetchRoute = async () => {
                try {
                    const response = await axios.get(
                        `https://router.project-osrm.org/route/v1/driving/${pickupLocation.lng},${pickupLocation.lat};${destinationLocation.lng},${destinationLocation.lat}?overview=full&geometries=geojson`
                    )

                    if (response.data.routes && response.data.routes.length > 0) {
                        const route = response.data.routes[0]
                        // OSRM returns duration in seconds
                        const durationMins = Math.ceil(route.duration / 60)
                        setEstimatedTime(`${durationMins} mins`)

                        // OSRM returns [lon, lat], Leaflet needs [lat, lon]
                        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]])
                        setRouteCoordinates(coordinates)
                    } else {
                        throw new Error('No route found')
                    }
                } catch (err) {
                    console.error("Failed to fetch route:", err)
                    // Fallback to straight line calculation
                    const duration = Math.ceil(dist * 2)
                    setEstimatedTime(`${duration} mins`)
                }
            }

            fetchRoute()
        } else {
            setEstimatedTime(null)
            setRouteCoordinates(null)
        }
    }, [pickupLocation, destinationLocation])

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar - Search Panel */}
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
                    <p className="text-secondary text-sm">Find your trotro in real-time</p>

                    {/* Active Ride Banner */}
                    <ActiveRideBanner />
                </div>

                {/* Search Form */}
                <div className="p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Where to?
                    </h2>

                    {error && (
                        <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4 mb-4">
                        {/* Pickup */}
                        <div>
                            <label className="block text-white font-medium mb-2 text-sm">Pickup Location</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full"></div>
                                <select
                                    value={pickup}
                                    onChange={(e) => setPickup(e.target.value)}
                                    className="input-field pl-8 w-full"
                                >
                                    <option value="">Select pickup location</option>
                                    {locations.map(loc => (
                                        <option key={loc.name} value={loc.name}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Destination */}
                        <div>
                            <label className="block text-white font-medium mb-2 text-sm">Destination</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-teal-400 rounded-full"></div>
                                <select
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="input-field pl-8 w-full"
                                >
                                    <option value="">Select destination</option>
                                    {locations.map(loc => (
                                        <option key={loc.name} value={loc.name}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-gray-900 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Searching...
                            </span>
                        ) : (
                            'Find Trotro'
                        )}
                    </button>
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div className="px-6 pb-6">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Available Trotros ({results.reduce((acc, route) => acc + (route.trotros?.length || 0), 0)})
                        </h3>
                        <div className="space-y-3">
                            {results.map(route =>
                                route.trotros?.map(trotro => (
                                    <div
                                        key={trotro.trotroId}
                                        className="bg-tertiary border border-border rounded-xl p-4 hover:border-cyan-500/50 transition-all cursor-pointer"
                                        onClick={() => navigate(`/passenger/track/${trotro.trotroId}`)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-white font-bold">{trotro.driverName}</h4>
                                                <p className="text-secondary text-xs">{trotro.licensePlate}</p>
                                                <p className="text-cyan-500 text-xs font-medium mt-1">{trotro.availableSeats} seats left</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${trotro.status === 'active' ? 'bg-green/20 text-green' : 'bg-gray-500/20 text-gray-400'}`}>
                                                {trotro.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span className="text-white font-semibold">{trotro.availableSeats}/{trotro.capacity}</span>
                                            </div>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-cyan-400 font-bold text-lg">GHS {trotro.fare.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <button className="w-full py-2 bg-cyan-500/10 text-cyan-400 rounded-lg font-semibold text-sm hover:bg-cyan-500/20 transition-colors">
                                            Track & Book →
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {!loading && results.length === 0 && pickup && destination && (
                    <div className="px-6 pb-6">
                        <div className="bg-tertiary border border-border rounded-xl p-6 text-center">
                            <svg className="w-12 h-12 text-secondary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-secondary text-sm">No trotros found for this route.</p>
                            <p className="text-muted text-xs mt-1">Try a different route or check back later.</p>
                        </div>
                    </div>
                )}

                {/* User Profile */}
                <div className="mt-auto p-6 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{user?.name}</p>
                            <p className="text-secondary text-xs">Passenger</p>
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

            {/* Leaflet Map View */}
            <div className="flex-1 relative h-full">
                <div className="absolute inset-0">
                    <MapContainer
                        center={ACCRA_CENTER}
                        zoom={13}
                        style={{ width: '100%', height: '100%' }}
                        zoomControl={true}
                    >
                        <MapEffects pickupLocation={pickupLocation} destinationLocation={destinationLocation} />

                        {/* Route Path Polyline (Fallback Dashed Line) */}
                        {pickupLocation && destinationLocation && results.length === 0 && !routeCoordinates && (
                            <Polyline
                                positions={[
                                    [pickupLocation.lat, pickupLocation.lng],
                                    [destinationLocation.lat, destinationLocation.lng]
                                ]}
                                pathOptions={{
                                    color: "#06b6d4",
                                    weight: 4,
                                    opacity: 0.5,
                                    dashArray: "10, 10"
                                }}
                            />
                        )}

                        {/* OSRM Route Path (Solid Line) */}
                        {routeCoordinates && results.length === 0 && (
                            <Polyline
                                positions={routeCoordinates}
                                pathOptions={{
                                    color: "#06b6d4",
                                    weight: 5,
                                    opacity: 0.8
                                }}
                            />
                        )}

                        {/* Actual Route Path if available in results */}
                        {results.length > 0 && results[0].coordinates && (
                            <Polyline
                                positions={results[0].coordinates.map(c => [c.lat, c.lng])}
                                pathOptions={{
                                    color: "#06b6d4",
                                    weight: 5
                                }}
                            />
                        )}

                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />

                        {/* Demo Trotro Markers - Always show them */}
                        {demoTrotros.map(trotro => (
                            <Marker
                                key={trotro.id}
                                position={[trotro.lat, trotro.lng]}
                                eventHandlers={{
                                    click: () => setSelectedTrotro(trotro)
                                }}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <h3 className="font-bold text-gray-900 mb-1">🚐 {trotro.name}</h3>
                                        <p className="text-sm text-gray-600">{trotro.seats} seats • GHS {trotro.fare.toFixed(2)}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Pickup Marker */}
                        {pickupLocation && (
                            <Marker position={[pickupLocation.lat, pickupLocation.lng]}>
                                <Popup>
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">📍</div>
                                        <div className="font-semibold">Pickup</div>
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* Destination Marker */}
                        {destinationLocation && (
                            <Marker position={[destinationLocation.lat, destinationLocation.lng]}>
                                <Popup>
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">🎯</div>
                                        <div className="font-semibold">Destination</div>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>

                {/* Estimated Time Overlay */}
                {(pickup || destination) && (
                    <div className="absolute top-4 right-4 z-[1000]">
                        <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-gray-200 min-w-[200px]">
                            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Estimated Time</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                    {results.length > 0 ? (results[0].estimatedDuration || '15 mins') : (estimatedTime || 'Calculating...')}
                                </span>
                                <span className="text-xs text-green-500 font-medium mb-1">
                                    {results.length > 0 ? '• Optimal Route' : '• Traffic Normal'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Map Overlay Info */}
                {!pickup && !destination && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-[1000]">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-200">
                            <svg className="w-16 h-16 text-cyan-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Select Your Route</h3>
                            <p className="text-gray-600 text-sm">Choose pickup and destination to see available trotros</p>
                            <p className="text-cyan-500 text-xs mt-2 font-semibold">🗺️ Powered by Leaflet & CARTO</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
