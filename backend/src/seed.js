import dotenv from 'dotenv'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
    console.error('DATABASE_URL is required')
    process.exit(1)
}

const { Pool } = pg
const pool = new Pool({ connectionString: DATABASE_URL })

const createTables = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            role TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS routes (
            id UUID PRIMARY KEY,
            route_name TEXT NOT NULL,
            pickup TEXT NOT NULL,
            destination TEXT NOT NULL,
            distance NUMERIC NOT NULL,
            base_fare NUMERIC NOT NULL,
            coordinates JSONB,
            stops JSONB
        );

        CREATE TABLE IF NOT EXISTS trotros (
            id UUID PRIMARY KEY,
            trotro_id TEXT UNIQUE NOT NULL,
            driver_id UUID NOT NULL,
            route_id UUID NOT NULL,
            status TEXT NOT NULL,
            capacity INTEGER NOT NULL,
            available_seats INTEGER NOT NULL,
            fare NUMERIC NOT NULL,
            battery_level INTEGER,
            location JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS trips (
            id UUID PRIMARY KEY,
            trip_id TEXT UNIQUE NOT NULL,
            driver_id UUID NOT NULL,
            trotro_id TEXT NOT NULL,
            route_id UUID NOT NULL,
            route_name TEXT NOT NULL,
            available_seats INTEGER NOT NULL,
            capacity INTEGER NOT NULL,
            fare NUMERIC NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS bookings (
            id UUID PRIMARY KEY,
            booking_id TEXT UNIQUE NOT NULL,
            trotro_id TEXT NOT NULL,
            route_id UUID NOT NULL,
            driver_id UUID NOT NULL,
            passenger_id UUID NOT NULL,
            passenger_name TEXT,
            pickup_stop TEXT NOT NULL,
            dropoff_stop TEXT NOT NULL,
            fare NUMERIC NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `)
}

const resetData = async () => {
    await pool.query('DELETE FROM bookings')
    await pool.query('DELETE FROM trips')
    await pool.query('DELETE FROM trotros')
    await pool.query('DELETE FROM routes')
    await pool.query('DELETE FROM users')
}

const seedRoutes = async () => {
    const seed = [
        {
            id: uuidv4(),
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
            id: uuidv4(),
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
            id: uuidv4(),
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
            id: uuidv4(),
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
            id: uuidv4(),
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
    ]

    for (const route of seed) {
        await pool.query(
            `INSERT INTO routes (id, route_name, pickup, destination, distance, base_fare, coordinates, stops)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [route.id, route.route_name, route.pickup, route.destination, route.distance, route.base_fare, JSON.stringify(route.coordinates), JSON.stringify(route.stops)]
        )
    }
}

const seedUsers = async () => {
    const passwordHash = await bcrypt.hash('password123', 10)

    const users = [
        { id: uuidv4(), name: 'Test Passenger', email: 'passenger@test.com', phone: '0241234567', role: 'passenger' },
        { id: uuidv4(), name: 'Test Driver', email: 'driver@test.com', phone: '0247654321', role: 'driver' },
        { id: uuidv4(), name: 'Admin User', email: 'admin@test.com', phone: '0243456789', role: 'admin' }
    ]

    for (const user of users) {
        await pool.query(
            `INSERT INTO users (id, name, email, phone, role, password_hash)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [user.id, user.name, user.email, user.phone, user.role, passwordHash]
        )
    }

    return users
}

const seedDemoTrip = async (users) => {
    const driver = users.find(u => u.role === 'driver')
    const passenger = users.find(u => u.role === 'passenger')
    if (!driver || !passenger) return

    const { rows: routeRows } = await pool.query('SELECT * FROM routes ORDER BY route_name LIMIT 1')
    const route = routeRows[0]
    if (!route) return

    const { rows: existingTrips } = await pool.query('SELECT COUNT(*)::int AS count FROM trips')
    if (existingTrips[0].count > 0) return

    const trotroId = uuidv4()
    const trotroDbId = uuidv4()

    await pool.query(
        `INSERT INTO trotros (id, trotro_id, driver_id, route_id, status, capacity, available_seats, fare, battery_level, location)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
            trotroDbId,
            trotroId,
            driver.id,
            route.id,
            'active',
            14,
            10,
            route.base_fare,
            78,
            JSON.stringify(route.coordinates?.[0] || { lat: 5.6037, lng: -0.1870 })
        ]
    )

    const tripId = `TR-${Date.now().toString().slice(-6)}`
    const tripDbId = uuidv4()

    await pool.query(
        `INSERT INTO trips (id, trip_id, driver_id, trotro_id, route_id, route_name, available_seats, capacity, fare, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
            tripDbId,
            tripId,
            driver.id,
            trotroId,
            route.id,
            route.route_name,
            10,
            14,
            route.base_fare,
            'active'
        ]
    )

    const bookingId = `BK-${Date.now().toString().slice(-6)}`
    const bookingDbId = uuidv4()

    await pool.query(
        `INSERT INTO bookings (id, booking_id, trotro_id, route_id, driver_id, passenger_id, passenger_name, pickup_stop, dropoff_stop, fare, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
            bookingDbId,
            bookingId,
            trotroId,
            route.id,
            driver.id,
            passenger.id,
            passenger.name,
            route.pickup,
            route.destination,
            route.base_fare,
            'pending'
        ]
    )
}

const run = async () => {
    await createTables()
    await resetData()
    await seedRoutes()
    const users = await seedUsers()
    if (users) await seedDemoTrip(users)

    console.log('Seed completed.')
    await pool.end()
}

run().catch(err => {
    console.error('Seed failed:', err)
    process.exit(1)
})
