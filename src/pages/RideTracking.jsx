import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { io } from 'socket.io-client'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// Component to center map on relevant points
function MapEffects({ driverLocation, userLocation }) {
    const map = useMap()
    useEffect(() => {
        if (driverLocation) {
            map.flyTo([driverLocation.lat, driverLocation.lng], 16, {
                animate: true,
                duration: 1.5
            })
        }
    }, [driverLocation, map])
    return null
}

const driverIcon = L.divIcon({
    html: '<div style="font-size: 40px; line-height: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">🚎</div>',
    className: 'bg-transparent',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
})

const userIcon = L.divIcon({
    html: '<div style="font-size: 35px; line-height: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">📍</div>',
    className: 'bg-transparent',
    iconSize: [35, 35],
    iconAnchor: [17, 35]
})

export default function RideTracking() {
    const navigate = useNavigate()
    const [bookingData, setBookingData] = useState(null)
    const [driverLocation, setDriverLocation] = useState(null)
    const [routePath, setRoutePath] = useState([])
    const [eta, setEta] = useState(null)
    const [status, setStatus] = useState('loading')

    useEffect(() => {
        const fetchActiveBooking = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.get(`${API_URL}/active-booking`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setBookingData(response.data)
                setDriverLocation(response.data.trotro.location)
                setStatus('active')
            } catch (err) {
                console.error('No active booking:', err)
                setStatus('no_ride')
            }
        }
        fetchActiveBooking()
    }, [navigate])

    useEffect(() => {
        if (!bookingData) return

        const socket = io(SOCKET_URL)
        const channel = `trotro-${bookingData.trotro.trotroId}`

        socket.emit('subscribe-trotro', { trotroId: bookingData.trotro.trotroId })

        socket.on('location-update', (loc) => {
            setDriverLocation(loc)
        })

        return () => {
            socket.off('location-update')
            socket.disconnect()
        }
    }, [bookingData])

    // Update dynamic OSRM path and ETA
    useEffect(() => {
        const updateRoute = async () => {
            if (driverLocation && bookingData?.booking?.pickupLocation) {
                try {
                    const from = `${driverLocation.lng},${driverLocation.lat}`
                    const to = `${bookingData.booking.pickupLocation.lng},${bookingData.booking.pickupLocation.lat}`
                    const url = `http://router.project-osrm.org/route/v1/driving/${from};${to}?overview=full&geometries=geojson`

                    const res = await axios.get(url)
                    if (res.data.routes && res.data.routes.length > 0) {
                        const route = res.data.routes[0]
                        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]) // Flip to LatLng
                        setRoutePath(coordinates)

                        // Calculate ETA
                        const durationMins = Math.ceil(route.duration / 60)
                        setEta(`${durationMins} mins`)
                    }
                } catch (err) {
                    // console.error('OSRM fetch error:', err)
                }
            }
        }

        updateRoute()
    }, [driverLocation, bookingData])

    if (status === 'loading') return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mr-3"></div>
            <span className="text-lg font-medium text-cyan-100">Locating your ride...</span>
        </div>
    )

    if (status === 'no_ride') return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🚏</span>
            </div>
            <h2 className="text-3xl font-bold mb-3">No Active Ride</h2>
            <p className="text-gray-400 mb-8 text-lg">You don't have a trip in progress right now.</p>
            <button
                onClick={() => navigate('/passenger/dashboard')}
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-bold text-lg hover:from-cyan-500 hover:to-blue-500 transition shadow-lg shadow-cyan-900/40"
            >
                Find a Ride
            </button>
        </div>
    )

    return (
        <div className="flex flex-col h-screen bg-gray-900 relative overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={[driverLocation?.lat || 5.6037, driverLocation?.lng || -0.1870]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; CARTO'
                    />

                    {/* Dynamic Path */}
                    {routePath.length > 0 && (
                        <Polyline
                            positions={routePath}
                            color="#00f2ff"
                            weight={5}
                            opacity={0.8}
                            dashArray="10, 10"
                        />
                    )}

                    {/* Driver Marker */}
                    {driverLocation && (
                        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                            <Popup className="custom-popup">
                                <div className="text-center">
                                    <p className="font-bold text-gray-900">{bookingData.driver.name}</p>
                                    <p className="text-xs text-gray-500">{bookingData.trotro.licensePlate}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Pickup Marker */}
                    {bookingData?.booking?.pickupLocation && (
                        <Marker position={[bookingData.booking.pickupLocation.lat, bookingData.booking.pickupLocation.lng]} icon={userIcon}>
                            <Popup>Pickup Point</Popup>
                        </Marker>
                    )}

                    <MapEffects driverLocation={driverLocation} />
                </MapContainer>
            </div>

            {/* Top Bar (Overlay) */}
            <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start bg-gradient-to-b from-gray-900/80 to-transparent pb-12 pointer-events-none">
                <button
                    onClick={() => navigate('/passenger/dashboard')}
                    className="bg-gray-800/90 backdrop-blur-md text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-gray-700 pointer-events-auto hover:bg-gray-700 active:scale-95 transition"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="bg-emerald-500/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-emerald-400/30">
                    <span className="text-white font-bold text-sm">Trip in Progress</span>
                </div>
            </div>

            {/* Bottom Floating Card */}
            <div className="absolute bottom-6 left-4 right-4 z-20">
                <div className="bg-gray-800/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-700/50 transform transition-all duration-300">
                    {/* Header: ETA & Status */}
                    <div className="flex items-center justify-between mb-6 border-b border-gray-700/50 pb-4">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <h1 className="text-4xl font-extrabold text-white">{eta || '--'}</h1>
                                <span className="text-gray-400 font-medium">min away</span>
                            </div>
                            <p className="text-cyan-400 text-sm font-medium mt-1">
                                {bookingData.booking.status === 'arrived' ? 'Driver has arrived!' : 'Arriving soon'}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-900/30">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                    </div>

                    {/* Driver & Vehicle Info */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center text-2xl border-2 border-gray-600">
                                {bookingData.driver.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-gray-800"></div>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-white font-bold text-lg">{bookingData.driver.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-300 font-mono border border-gray-600">
                                    {bookingData.trotro.licensePlate}
                                </span>
                                <span className="text-gray-500 text-sm">• Toyota HiAce</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <a
                                href={`tel:${bookingData.driver.phone}`}
                                className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-green-400 hover:bg-green-500/10 hover:text-green-300 transition border border-gray-600/50"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
