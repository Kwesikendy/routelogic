import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Card from '../shared/Card'
import Button from '../shared/Button'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function SearchRoute() {
    const navigate = useNavigate()
    const [pickup, setPickup] = useState('')
    const [destination, setDestination] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Common Accra locations
    const locations = [
        'Circle',
        'Madina',
        'Tema',
        'Legon',
        '37 Station',
        'Achimota',
        'Kasoa',
        'Lapaz',
        'Kaneshie',
        'Adabraka'
    ]

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

    return (
        <div className="space-y-6">
            {/* Search Form */}
            <Card>
                <h2 className="section-header mb-4">Find Your Trotro</h2>

                {error && (
                    <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-text font-medium mb-2">Pickup Location</label>
                        <select
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Select pickup</option>
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-text font-medium mb-2">Destination</label>
                        <select
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Select destination</option>
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto">
                    {loading ? 'Searching...' : 'Find Trotro'}
                </Button>
            </Card>

            {/* Results */}
            {results.length > 0 && (
                <div>
                    <h3 className="section-header mb-4">Available Trotros</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.map(route => (
                            route.trotros?.map(trotro => (
                                <Card key={trotro.trotroId} className="hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="card-title">{route.routeName}</h4>
                                            <p className="text-text-light text-small">{route.pickup} → {route.destination}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-small font-medium ${trotro.status === 'active' ? 'bg-secondary/10 text-secondary' : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {trotro.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-text-light">Seats Available:</span>
                                            <span className="font-semibold">{trotro.availableSeats}/{trotro.capacity}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-light">Fare:</span>
                                            <span className="font-semibold text-primary">GHS {trotro.fare.toFixed(2)}</span>
                                        </div>
                                        {trotro.batteryLevel && (
                                            <div className="flex justify-between">
                                                <span className="text-text-light">Battery:</span>
                                                <span className="font-semibold">{trotro.batteryLevel}%</span>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        onClick={() => navigate(`/passenger/track/${trotro.trotroId}`)}
                                        className="w-full"
                                    >
                                        Track Live
                                    </Button>
                                </Card>
                            ))
                        ))}
                    </div>
                </div>
            )}

            {!loading && results.length === 0 && pickup && destination && (
                <Card className="text-center py-8">
                    <p className="text-text-light">No trotros found for this route. Try a different route or check back later.</p>
                </Card>
            )}
        </div>
    )
}
