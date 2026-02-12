import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import PassengerDashboard from './pages/PassengerDashboard'
import LiveTracking from './pages/LiveTracking'
import BookingConfirmation from './pages/BookingConfirmation'
import DriverDashboard from './pages/DriverDashboard'
import ActiveTrip from './pages/ActiveTrip'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/shared/Navbar'

function App() {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    return (
        <Router>
            <Navbar user={user} />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />

                {/* Passenger Routes */}
                <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
                <Route path="/passenger/track/:trotroId" element={<LiveTracking />} />
                <Route path="/passenger/booking-confirmation" element={<BookingConfirmation />} />

                {/* Driver Routes */}
                <Route path="/driver/dashboard" element={<DriverDashboard />} />
                <Route path="/driver/active-trip" element={<ActiveTrip />} />
            </Routes>
        </Router>
    )
}

export default App
