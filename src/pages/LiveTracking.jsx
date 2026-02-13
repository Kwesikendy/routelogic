import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { io } from 'socket.io-client'
import axios from 'axios'
import Navbar from '../components/shared/Navbar'
import Card from '../components/shared/Card'
import Button from '../components/shared/Button'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom trotro icon
const trotroIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="#0066FF" stroke="white" stroke-width="3"/>
      <text x="20" y="27" font-size="20" fill="white" text-anchor="middle" font-weight="bold">T</text>
    </svg>
  `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
})

export default function LiveTracking() {
    const { trotroId } = useParams()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    const [trotroLocation, setTrotroLocation] = useState(null)
    const [route, setRoute] = useState(null)
    const [trotroData, setTrotroData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [bookingLoading, setBookingLoading] = useState(false)

    useEffect(() => {
        // Fetch initial trotro data
        const fetchTrotroData = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.get(`${API_URL}/trotro-location/${trotroId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                setRoute(response.data.route)
                setTrotroLocation(response.data.location)
                setTrotroData(response.data.trotro)
                setLoading(false)
            } catch (err) {
                console.error('Failed to fetch trotro data:', err)
                setLoading(false)
            }
        }

        fetchTrotroData()

        // Setup Socket.io for real-time updates
        const socket = io(SOCKET_URL)

        socket.emit('subscribe-trotro', { trotroId })

        socket.on(`trotro-${trotroId}-location`, (data) => {
            setTrotroLocation({ lat: data.lat, lng: data.lng })
        })

        return () => {
            socket.emit('unsubscribe-trotro', { trotroId })
            socket.disconnect()
        }
    }, [trotroId])

    const handleBookSeat = async () => {
        setBookingLoading(true)
        try {
            const token = localStorage.getItem('token')
            await axios.post(
                `${API_URL}/book-seat`,
                {
                    trotroId,
                    passengerId: user._id || user.id,
                    pickupStop: route?.pickup || 'Circle',
                    dropoffStop: route?.destination || 'Madina'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            navigate('/passenger/booking-confirmation')
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to book seat')
        } finally {
            setBookingLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-light">Loading trotro data...</p>
                </div>
            </div>
        )
    }

    // Default center (Accra, Ghana)
    const defaultCenter = [5.6037, -0.1870]
    const mapCenter = trotroLocation ? [trotroLocation.lat, trotroLocation.lng] : defaultCenter

    return (
        <div className="min-h-screen bg-background">


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/passenger/dashboard')}
                        className="text-primary hover:text-primary-dark flex items-center gap-2 mb-4"
                    >
                        <span>←</span> Back to Search
                    </button>
                    <h1 className="page-title">Live Tracking</h1>
                    <p className="text-text-light mt-2">{route?.routeName || 'Route'}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map */}
                    <div className="lg:col-span-2">
                        <Card className="p-0 overflow-hidden">
                            <div style={{ height: '500px', width: '100%', borderRadius: '12px' }}>
                                <MapContainer
                                    center={mapCenter}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                                    scrollWheelZoom={true}
                                >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    />

                                    {/* Route Polyline */}
                                    {route?.coordinates && (
                                        <Polyline
                                            positions={route.coordinates.map(coord => [coord.lat, coord.lng])}
                                            color="#0066FF"
                                            weight={4}
                                            opacity={0.8}
                                        />
                                    )}

                                    {/* Trotro Marker */}
                                    {trotroLocation && (
                                        <Marker
                                            position={[trotroLocation.lat, trotroLocation.lng]}
                                            icon={trotroIcon}
                                        >
                                            <Popup>
                                                <div className="text-center">
                                                    <strong>{route?.routeName || 'Trotro'}</strong>
                                                    <br />
                                                    <span className="text-small">
                                                        {trotroData?.availableSeats || 8} seats available
                                                    </span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}
                                </MapContainer>
                            </div>
                        </Card>
                    </div>

                    {/* Booking Info */}
                    <div className="space-y-4">
                        <Card>
                            <h3 className="card-title mb-4">Trotro Details</h3>

                            <div className="space-y-3 mb-6">
                                <div>
                                    <span className="text-text-light text-small">Status</span>
                                    <p className="font-semibold text-secondary">Active</p>
                                </div>
                                <div>
                                    <span className="text-text-light text-small">Arriving in</span>
                                    <p className="font-semibold text-lg">~5 mins</p>
                                </div>
                                <div>
                                    <span className="text-text-light text-small">Available Seats</span>
                                    <p className="font-semibold">{trotroData?.availableSeats || 8}/{trotroData?.capacity || 14}</p>
                                </div>
                                <div>
                                    <span className="text-text-light text-small">Fare</span>
                                    <p className="font-semibold text-primary text-lg">GHS {trotroData?.fare?.toFixed(2) || '3.50'}</p>
                                </div>
                                {trotroData?.batteryLevel && (
                                    <div>
                                        <span className="text-text-light text-small">Battery</span>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-secondary h-2 rounded-full"
                                                    style={{ width: `${trotroData.batteryLevel}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-small font-medium">{trotroData.batteryLevel}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleBookSeat}
                                disabled={bookingLoading || (trotroData?.availableSeats || 0) === 0}
                                className="w-full"
                            >
                                {bookingLoading ? 'Booking...' : `Book Seat - GHS ${trotroData?.fare?.toFixed(2) || '3.50'}`}
                            </Button>
                        </Card>

                        <Card>
                            <h3 className="card-title mb-3">Route Stops</h3>
                            <div className="space-y-2">
                                {route?.stops?.slice(0, 4).map((stop, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-primary font-semibold text-small">{index + 1}</span>
                                        </div>
                                        <span className="text-text">{stop.name || stop}</span>
                                    </div>
                                )) || (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-primary font-semibold text-small">1</span>
                                                </div>
                                                <span className="text-text">{route?.pickup || 'Circle'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-primary font-semibold text-small">2</span>
                                                </div>
                                                <span className="text-text">{route?.destination || 'Madina'}</span>
                                            </div>
                                        </>
                                    )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
