import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/shared/Navbar'
import Card from '../components/shared/Card'
import Button from '../components/shared/Button'

export default function BookingConfirmation() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center">
                    <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
                    <p className="text-emerald-100 font-medium">Your seat has been reserved successfully</p>
                </div>

                <div className="p-8">
                    <div className="space-y-6">
                        <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Booking Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Booking ID</span>
                                    <span className="font-mono text-white bg-gray-600 px-2 py-1 rounded text-sm">BK{Date.now().toString().slice(-6)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Status</span>
                                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                                        Pending Acceptance
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                                    <span className="text-gray-300">Total Fare</span>
                                    <span className="text-2xl font-bold text-cyan-400">GHS 3.50</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                            <svg className="w-6 h-6 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm">
                                <p className="font-bold text-blue-400 mb-1">What happens next?</p>
                                <p className="text-blue-100/80">Track your driver in real-time. You'll receive a notification when they arrive.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => navigate('/passenger/ride')}
                                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                🗺️ Track Driver & ETA
                            </button>
                            <button
                                onClick={() => navigate('/passenger/dashboard')}
                                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors border border-gray-600 flex items-center justify-center gap-2"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
