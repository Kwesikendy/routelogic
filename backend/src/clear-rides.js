import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const { Pool } = pg

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
    console.error('DATABASE_URL is required')
    process.exit(1)
}

const pool = new Pool({ connectionString: DATABASE_URL })

const run = async () => {
    try {
        console.log('🧹 Clearing bookings...')
        await pool.query('DELETE FROM bookings')

        console.log('🧹 Clearing active trips...')
        await pool.query('DELETE FROM trips')

        console.log('🔄 Resetting trotro status...')
        await pool.query("UPDATE trotros SET status = 'idle', available_seats = capacity, location = NULL")

        console.log('✨ All active rides cleared successfully!')
    } catch (err) {
        console.error('❌ Failed to clear rides:', err)
    } finally {
        await pool.end()
    }
}

run()
