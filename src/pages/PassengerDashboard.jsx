import { useState, useEffect } from 'react'
import Navbar from '../components/shared/Navbar'
import SearchRoute from '../components/passenger/SearchRoute'

export default function PassengerDashboard() {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    return (
        <div className="min-h-screen bg-background">
            <Navbar user={user} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="page-title">Welcome, {user?.name}!</h1>
                    <p className="text-text-light mt-2">Find and track your trotro in real-time</p>
                </div>

                <SearchRoute />
            </div>
        </div>
    )
}
