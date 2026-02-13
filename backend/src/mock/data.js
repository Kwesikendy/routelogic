import bcrypt from 'bcryptjs'

const passwordHash = bcrypt.hashSync('password123', 10)

export const mockData = {
    users: [
        {
            id: 'user-passenger-1',
            name: 'Test Passenger',
            email: 'passenger@test.com',
            phone: '0241234567',
            role: 'passenger',
            password_hash: passwordHash
        },
        {
            id: 'user-driver-1',
            name: 'Test Driver',
            email: 'driver@test.com',
            phone: '0247654321',
            role: 'driver',
            password_hash: passwordHash
        },
        {
            id: 'user-admin-1',
            name: 'Admin User',
            email: 'admin@test.com',
            phone: '0243456789',
            role: 'admin',
            password_hash: passwordHash
        }
    ],
    routes: [
        {
            id: 'route-1',
            route_name: 'Circle → Madina',
            pickup: 'Circle',
            destination: 'Madina',
            distance: 12.4,
            base_fare: 3.5,
            coordinates: [
                { lat: 5.5600, lng: -0.1969, stopName: 'Circle' },
                { lat: 5.6108, lng: -0.1850, stopName: '37 Military Hospital' },
                { lat: 5.6506, lng: -0.1867, stopName: 'Legon' },
                { lat: 5.6718, lng: -0.1745, stopName: 'Atomic Junction' },
                { lat: 5.6806, lng: -0.1686, stopName: 'Madina' }
            ],
            stops: ['Circle', '37 Military Hospital', 'Legon', 'Atomic Junction', 'Madina']
        },
        {
            id: 'route-2',
            route_name: 'Kaneshie → Korle Bu → Osu',
            pickup: 'Kaneshie',
            destination: 'Osu',
            distance: 10.2,
            base_fare: 4.0,
            coordinates: [
                { lat: 5.5558, lng: -0.2367, stopName: 'Kaneshie Market' },
                { lat: 5.5399, lng: -0.2199, stopName: 'Korle Bu Hospital' },
                { lat: 5.5519, lng: -0.2060, stopName: 'Ministries' },
                { lat: 5.5706, lng: -0.1836, stopName: 'Danquah Circle' },
                { lat: 5.5558, lng: -0.1733, stopName: 'Osu' }
            ],
            stops: ['Kaneshie Market', 'Korle Bu Hospital', 'Ministries', 'Danquah Circle', 'Osu']
        },
        {
            id: 'route-3',
            route_name: 'Tema Station → Spintex → Baatsona',
            pickup: 'Tema Station',
            destination: 'Baatsona',
            distance: 9.4,
            base_fare: 3.0,
            coordinates: [
                { lat: 5.6397, lng: -0.0075, stopName: 'Tema Station' },
                { lat: 5.6246, lng: -0.0518, stopName: 'Spintex Road' },
                { lat: 5.6189, lng: -0.0357, stopName: 'Michel Camp' },
                { lat: 5.6419, lng: -0.0213, stopName: 'Baatsona' }
            ],
            stops: ['Tema Station', 'Spintex Road', 'Michel Camp', 'Baatsona']
        },
        {
            id: 'route-4',
            route_name: 'Achimota → Lapaz → Kaneshie',
            pickup: 'Achimota',
            destination: 'Kaneshie',
            distance: 7.8,
            base_fare: 2.5,
            coordinates: [
                { lat: 5.6108, lng: -0.2280, stopName: 'Achimota' },
                { lat: 5.6037, lng: -0.2370, stopName: 'Lapaz' },
                { lat: 5.5890, lng: -0.2420, stopName: 'Abeka Lapaz' },
                { lat: 5.5558, lng: -0.2367, stopName: 'Kaneshie' }
            ],
            stops: ['Achimota', 'Lapaz', 'Abeka Lapaz', 'Kaneshie']
        },
        {
            id: 'route-5',
            route_name: 'Ashaiman → Tema → Community 1',
            pickup: 'Ashaiman',
            destination: 'Community 1',
            distance: 6.6,
            base_fare: 2.0,
            coordinates: [
                { lat: 5.6950, lng: -0.0311, stopName: 'Ashaiman' },
                { lat: 5.6397, lng: -0.0075, stopName: 'Tema Station' },
                { lat: 5.6667, lng: 0.0167, stopName: 'Community 1' }
            ],
            stops: ['Ashaiman', 'Tema Station', 'Community 1']
        }
    ],
    trotros: [
        {
            id: 'trotro-db-1',
            trotro_id: 'trotro-1',
            driver_id: 'user-driver-1',
            route_id: 'route-1',
            status: 'active',
            capacity: 14,
            available_seats: 10,
            fare: 3.5,
            license_plate: 'GT-8821-24',
            battery_level: 78,
            location: { lat: 5.5600, lng: -0.1969, lastUpdated: new Date().toISOString() }
        }
    ],
    trips: [
        {
            id: 'trip-db-1',
            trip_id: 'TR-000001',
            driver_id: 'user-driver-1',
            trotro_id: 'trotro-1',
            route_id: 'route-1',
            route_name: 'Circle → Madina',
            available_seats: 10,
            capacity: 14,
            fare: 3.5,
            status: 'active'
        }
    ],
    bookings: [
        {
            id: 'booking-db-1',
            booking_id: 'BK-000001',
            trotro_id: 'trotro-1',
            route_id: 'route-1',
            driver_id: 'user-driver-1',
            passenger_id: 'user-passenger-1',
            passenger_name: 'Test Passenger',
            pickup_stop: 'Circle',
            dropoff_stop: 'Madina',
            fare: 3.5,
            status: 'pending',
            created_at: new Date().toISOString()
        }
    ]
}
