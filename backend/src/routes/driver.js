import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import authMiddleware from '../middleware/auth.js'

const router = Router()

const findRoute = async (pool, routeId) => {
    const { rows } = await pool.query('SELECT * FROM routes WHERE id = $1', [routeId])
    return rows[0]
}

router.post('/start-trip', authMiddleware, async (req, res) => {
    const { driverId, routeId, availableSeats } = req.body

    if (!driverId || !routeId || !availableSeats) {
        return res.status(400).json({ message: 'Missing required fields' })
    }

    const pool = req.app.get('db')
    const useMock = req.app.get('mock')
    const mock = req.app.get('mockData')

    const route = useMock && mock
        ? mock.routes.find(r => r.id === routeId)
        : await findRoute(pool, routeId)
    if (!route) return res.status(404).json({ message: 'Route not found' })

    if (useMock && mock) {
        mock.trips.forEach(t => {
            if (t.driver_id === driverId && t.status === 'active') t.status = 'completed'
        })
    } else {
        await pool.query(
            'UPDATE trips SET status = $1 WHERE driver_id = $2 AND status = $3',
            ['completed', driverId, 'active']
        )
    }

    const trotroId = uuidv4()
    const trotroDbId = uuidv4()
    const batteryLevel = Math.floor(60 + Math.random() * 35)
    const location = (route.coordinates && route.coordinates[0]) || { lat: 5.6037, lng: -0.1870 }

    if (useMock && mock) {
        mock.trotros.unshift({
            id: trotroDbId,
            trotro_id: trotroId,
            driver_id: driverId,
            route_id: routeId,
            status: 'active',
            capacity: 14,
            available_seats: availableSeats,
            fare: route.base_fare,
            battery_level: batteryLevel,
            location: { ...location, lastUpdated: new Date().toISOString() }
        })
    } else {
        await pool.query(
            `INSERT INTO trotros (id, trotro_id, driver_id, route_id, status, capacity, available_seats, fare, battery_level, location)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
                trotroDbId,
                trotroId,
                driverId,
                routeId,
                'active',
                14,
                availableSeats,
                route.base_fare,
                batteryLevel,
                JSON.stringify({ ...location, lastUpdated: new Date().toISOString() })
            ]
        )
    }

    const tripId = `TR-${Date.now().toString().slice(-6)}`
    const tripDbId = uuidv4()

    if (useMock && mock) {
        mock.trips.unshift({
            id: tripDbId,
            trip_id: tripId,
            driver_id: driverId,
            trotro_id: trotroId,
            route_id: routeId,
            route_name: route.route_name,
            available_seats: availableSeats,
            capacity: 14,
            fare: route.base_fare,
            status: 'active'
        })
    } else {
        await pool.query(
            `INSERT INTO trips (id, trip_id, driver_id, trotro_id, route_id, route_name, available_seats, capacity, fare, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
                tripDbId,
                tripId,
                driverId,
                trotroId,
                routeId,
                route.route_name,
                availableSeats,
                14,
                route.base_fare,
                'active'
            ]
        )
    }

    res.status(201).json({
        trotroId,
        tripId,
        message: 'Trip started successfully',
        route: route.route_name,
        trip: {
            _id: tripDbId,
            tripId,
            driverId,
            trotroId,
            routeId,
            routeName: route.route_name,
            availableSeats,
            capacity: 14,
            fare: Number(route.base_fare),
            status: 'active'
        }
    })
})

router.get('/active-trip', authMiddleware, async (req, res) => {
    const driverId = req.user?.id || req.query.driverId
    if (!driverId) return res.status(400).json({ message: 'driverId required' })

    const pool = req.app.get('db')
    const useMock = req.app.get('mock')
    const mock = req.app.get('mockData')

    const trip = useMock && mock
        ? mock.trips.find(t => t.driver_id === driverId && t.status === 'active')
        : (await pool.query(
            'SELECT * FROM trips WHERE driver_id = $1 AND status = $2',
            [driverId, 'active']
        )).rows[0]
    if (!trip) return res.status(404).json({ message: 'No active trip' })

    const trotro = useMock && mock
        ? mock.trotros.find(t => t.trotro_id === trip.trotro_id)
        : (await pool.query('SELECT * FROM trotros WHERE trotro_id = $1', [trip.trotro_id])).rows[0]

    // Fetch route to get coordinates
    const route = useMock && mock
        ? mock.routes.find(r => r.id === trip.route_id)
        : await findRoute(pool, trip.route_id)

    res.json({
        trip: {
            _id: trip.id,
            tripId: trip.trip_id,
            driverId: trip.driver_id,
            trotroId: trip.trotro_id,
            routeId: trip.route_id,
            routeName: trip.route_name,
            availableSeats: trotro?.available_seats ?? trip.available_seats,
            capacity: trotro?.capacity ?? trip.capacity,
            fare: Number(trotro?.fare ?? trip.fare),
            status: trip.status,
            coordinates: route?.coordinates || []
        }
    })
})

router.put('/update-location', authMiddleware, async (req, res) => {
    const { trotroId, lat, lng } = req.body

    if (!trotroId || typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({ message: 'Invalid location payload' })
    }

    const pool = req.app.get('db')
    const useMock = req.app.get('mock')
    const mock = req.app.get('mockData')

    if (useMock && mock) {
        const trotro = mock.trotros.find(t => t.trotro_id === trotroId)
        if (!trotro) return res.status(404).json({ message: 'Trotro not found' })
        trotro.location = { lat, lng, lastUpdated: new Date().toISOString() }
    } else {
        const { rows } = await pool.query('SELECT id FROM trotros WHERE trotro_id = $1', [trotroId])
        if (rows.length === 0) return res.status(404).json({ message: 'Trotro not found' })

        const payload = { lat, lng, lastUpdated: new Date().toISOString() }
        await pool.query('UPDATE trotros SET location = $1 WHERE trotro_id = $2', [JSON.stringify(payload), trotroId])
    }

    const io = req.app.get('io')
    io.to(`trotro-${trotroId}`).emit(`trotro-${trotroId}-location`, { lat, lng })
    io.to(`trotro-${trotroId}`).emit('location-update', { lat, lng })

    res.json({ success: true, message: 'Location updated' })
})

router.get('/bookings', authMiddleware, async (req, res) => {
    const { driverId } = req.query
    if (!driverId) return res.status(400).json({ message: 'driverId required' })

    const pool = req.app.get('db')
    const useMock = req.app.get('mock')
    const mock = req.app.get('mockData')

    const rows = useMock && mock
        ? mock.bookings.filter(b => b.driver_id === driverId).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
        : (await pool.query('SELECT * FROM bookings WHERE driver_id = $1 ORDER BY created_at DESC', [driverId])).rows

    res.json({
        bookings: rows.map(b => ({
            _id: b.id,
            bookingId: b.booking_id,
            trotroId: b.trotro_id,
            routeId: b.route_id,
            driverId: b.driver_id,
            passengerId: b.passenger_id,
            passengerName: b.passenger_name,
            pickupStop: b.pickup_stop,
            dropoffStop: b.dropoff_stop,
            fare: Number(b.fare),
            status: b.status,
            createdAt: b.created_at
        }))
    })
})

router.put('/accept-booking/:bookingId', authMiddleware, async (req, res) => {
    const { bookingId } = req.params
    const pool = req.app.get('db')
    const useMock = req.app.get('mock')
    const mock = req.app.get('mockData')

    const booking = useMock && mock
        ? mock.bookings.find(b => b.id === bookingId || b.booking_id === bookingId)
        : (await pool.query('SELECT * FROM bookings WHERE booking_id = $1 OR id::text = $1', [bookingId])).rows[0]
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    if (useMock && mock) {
        booking.status = 'accepted'
    } else {
        await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', ['accepted', booking.id])
    }

    res.json({
        success: true,
        message: 'Booking accepted',
        booking: {
            _id: booking.id,
            bookingId: booking.booking_id,
            status: 'accepted'
        }
    })
})

router.post('/stop-trip', authMiddleware, async (req, res) => {
    const { trotroId } = req.body
    if (!trotroId) return res.status(400).json({ message: 'trotroId required' })

    const pool = req.app.get('db')
    const useMock = req.app.get('mock')
    const mock = req.app.get('mockData')

    const trip = useMock && mock
        ? mock.trips.find(t => t.trotro_id === trotroId && t.status === 'active')
        : (await pool.query(
            'SELECT * FROM trips WHERE trotro_id = $1 AND status = $2',
            [trotroId, 'active']
        )).rows[0]
    if (!trip) return res.status(404).json({ message: 'Active trip not found' })

    if (useMock && mock) {
        trip.status = 'completed'
        const trotro = mock.trotros.find(t => t.trotro_id === trotroId)
        if (trotro) trotro.status = 'inactive'
        mock.bookings.forEach(b => {
            if (b.trotro_id === trotroId && b.status === 'pending') b.status = 'cancelled'
        })
    } else {
        await pool.query('UPDATE trips SET status = $1 WHERE id = $2', ['completed', trip.id])
        await pool.query('UPDATE trotros SET status = $1 WHERE trotro_id = $2', ['inactive', trotroId])
        await pool.query('UPDATE bookings SET status = $1 WHERE trotro_id = $2 AND status = $3', ['cancelled', trotroId, 'pending'])
    }

    res.json({ success: true, message: 'Trip completed' })
})

export default router
