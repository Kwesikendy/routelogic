import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/shared/Navbar'
import Card from '../components/shared/Card'
import Button from '../components/shared/Button'

export default function BookingConfirmation() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    return (
        <div className="min-h-screen bg-background">
            <Navbar user={user} />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Card className="text-center">
                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="section-header mb-2">Booking Confirmed!</h1>
                    <p className="text-text-light mb-8">Your seat has been reserved successfully</p>

                    <div className="bg-background rounded-lg p-6 mb-8 text-left">
                        <h3 className="font-semibold mb-4">Booking Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-text-light">Booking ID:</span>
                                <span className="font-medium">BK{Date.now().toString().slice(-6)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-light">Status:</span>
                                <span className="text-warning font-medium">Pending Driver Acceptance</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-light">Fare:</span>
                                <span className="font-semibold text-primary">GHS 3.50</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-primary/20 rounded-lg p-4 mb-6">
                        <p className="text-small text-text">
                            <strong>Next Steps:</strong> The driver will review your booking request.
                            You'll receive a notification once it's accepted. Please arrive at your pickup location on time.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={() => navigate('/passenger/dashboard')}>
                            Back to Dashboard
                        </Button>
                        <Button variant="secondary" onClick={() => navigate('/passenger/dashboard')}>
                            Book Another Ride
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
