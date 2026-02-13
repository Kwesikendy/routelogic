import pg from 'pg'

const { Pool } = pg

const DATABASE_URL = process.env.DATABASE_URL
const USE_MOCK = process.env.MOCK_DATA === 'true'

console.log('DB Config:', { DATABASE_URL: DATABASE_URL?.substring(0, 20) || 'NOT SET', USE_MOCK })

if (!DATABASE_URL?.trim() && !USE_MOCK) {
    console.error('DATABASE_URL is required or set MOCK_DATA=true')
    process.exit(1)
}

const pool = DATABASE_URL?.trim() ? new Pool({ connectionString: DATABASE_URL }) : null

const initDb = async () => {
    if (!pool) return
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

export { pool, initDb }
