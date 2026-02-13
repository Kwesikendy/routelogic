import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import authMiddleware from '../middleware/auth.js'

const router = Router()

const mapRoute = (route) => ({
    _id: route.id,
    routeId: route.id,
    routeName: route.route_name,
    name: route.route_name,
    pickup: route.pickup,
    destination: route.destination,
    distance: Number(route.distance),
    baseFare: Number(route.base_fare),
    coordinates: route.coordinates || [],
    stops: route.stops || []
})

const routeStopsMatch = (route, pickup, destination) => {
    if (Array.isArray(route.stops) && route.stops.length > 0) {
        const pickupIndex = route.stops.findIndex(s => (s?.name || s).toLowerCase() === pickup.toLowerCase())
        const destinationIndex = route.stops.findIndex(s => (s?.name || s).toLowerCase() === destination.toLowerCase())
        return pickupIndex >= 0 && destinationIndex > pickupIndex
    }
    return route.pickup?.toLowerCase() === pickup.toLowerCase() && route.destination?.toLowerCase() === destination.toLowerCase()
}

router.get('/routes', authMiddleware, async (req, res) => {
    const pool = req.app.get('db')
    const useMock = req.app.get('mock')
    const mock = req.app.get('mockData')

    if (useMock && mock) {
        return res.json({ routes: mock.routes.map(mapRoute) })
    }

    const { rows } = await pool.query('SELECT * FROM routes ORDER BY route_name')
    res.json({ routes: rows.map(mapRoute) })
})

router.post('/search-route', authMiddleware, async (req, res) => {
    const { pickup, destination } = req.body

    if (!pickup || !destination) {
        return res.status(400).json({ message: 'Pickup and destination required' })
    }

    const pool = req.app.get('db')
    const useMock = req.app.get('mock')
    const mock = req.app.get('mockData')

    const routeRows = useMock && mock ? mock.routes : (await pool.query('SELECT * FROM routes')).rows

    const matchingRoutes = routeRows.filter(route => routeStopsMatch(route, pickup, destination))
    const routeIds = matchingRoutes.map(r => r.id)

    const trotroRows = useMock && mock
        ? mock.trotros.filter(t => t.status === 'active' && routeIds.includes(t.route_id))
        : (routeIds.length > 0
            ? (await pool.query(
                'SELECT * FROM trotros WHERE status = $1 AND route_id = ANY($2)',
                ['active', routeIds]
            )).rows
            : [])

    const trotrosByRoute = await Promise.all(trotroRows.map(async (t) => {
        let driverName = 'Unknown Driver'
        if (useMock && mock) {
            const driver = mock.users.find(u => u.id === t.driver_id)
            driverName = driver?.name || 'Unknown Driver'
        } else {
            const { rows } = await pool.query('SELECT name FROM users WHERE id = $1', [t.driver_id])
            if (rows.length > 0) driverName = rows[0].name
        }

        return {
            ...t,
            driverName
        }
    })).then(mappedTrotros => mappedTrotros.reduce((acc, t) => {
        acc[t.route_id] = acc[t.route_id] || []
        acc[t.route_id].push({
            trotroId: t.trotro_id,
            routeId: t.route_id,
            status: t.status,
            capacity: t.capacity,
            availableSeats: t.available_seats,
            fare: Number(t.fare),
            licensePlate: t.license_plate || `GT-${Math.floor(Math.random() * 9000) + 1000}-24`,
            driverName: t.driverName,
            batteryLevel: t.battery_level,
            location: t.location,
            currentLocation: t.location
        })
        return acc
    }, {}))

    const responseRoutes = matchingRoutes.map(route => ({
        ...mapRoute(route),
        trotros: trotrosByRoute[route.id] || []
    }))

    res.json({ routes: responseRoutes })
})

router.get('/trotro-location/:trotroId', authMiddleware, async (req, res) => {
    const { trotroId } = req.params
    const pool = req.app.get('db')
    const useMock = req.app.get('mock')
    const mock = req.app.get('mockData')

    const trotro = useMock && mock
        ? mock.trotros.find(t => t.trotro_id === trotroId)
        : (await pool.query('SELECT * FROM trotros WHERE trotro_id = $1', [trotroId])).rows[0]

    if (!trotro) return res.status(404).json({ message: 'Trotro not found' })

    const route = useMock && mock
        ? mock.routes.find(r => r.id === trotro.route_id)
        : (await pool.query('SELECT * FROM routes WHERE id = $1', [trotro.route_id])).rows[0]

    res.json({
        trotro: {
            trotroId: trotro.trotro_id,
            routeId: trotro.route_id,
            status: trotro.status,
            capacity: trotro.capacity,
            availableSeats: trotro.available_seats,
            fare: Number(trotro.fare),
            batteryLevel: trotro.battery_level
        },
        route: route ? mapRoute(route) : null,
        location: trotro.location ? { ...trotro.location, lastUpdated: new Date().toISOString() } : null
    })
})

router.post('/book-seat', authMiddleware, async (req, res) => {
    const { passengerId, trotroId, pickupStop, dropoffStop } = req.body

    if (!passengerId || !trotroId || !pickupStop || !dropoffStop) {
        return res.status(400).json({ message: 'Missing required fields' })
    }

    const pool = req.app.get('db')
    const useMock = req.app.get('mock')
    const mock = req.app.get('mockData')

    const trotro = useMock && mock
        ? mock.trotros.find(t => t.trotro_id === trotroId)
        : (await pool.query('SELECT * FROM trotros WHERE trotro_id = $1', [trotroId])).rows[0]

    if (!trotro) return res.status(404).json({ message: 'Trotro not found' })
    if (trotro.available_seats <= 0) return res.status(400).json({ message: 'No seats available' })

    const seatNumber = Math.min(trotro.capacity, (trotro.capacity - trotro.available_seats) + 1)

    if (useMock && mock) {
        trotro.available_seats -= 1
    } else {
        await pool.query('UPDATE trotros SET available_seats = available_seats - 1 WHERE trotro_id = $1', [trotroId])
    }

    const route = useMock && mock
        ? mock.routes.find(r => r.id === trotro.route_id)
        : (await pool.query('SELECT * FROM routes WHERE id = $1', [trotro.route_id])).rows[0]

    const passenger = useMock && mock
        ? mock.users.find(u => u.id === passengerId)
        : (await pool.query('SELECT * FROM users WHERE id = $1', [passengerId])).rows[0]

    const bookingId = `BK-${Date.now().toString().slice(-6)}`
    const id = uuidv4()

    if (useMock && mock) {
        mock.bookings.unshift({
            id,
            booking_id: bookingId,
            trotro_id: trotroId,
            route_id: trotro.route_id,
            driver_id: trotro.driver_id,
            passenger_id: passengerId,
            passenger_name: passenger?.name || 'Passenger',
            pickup_stop: pickupStop,
            dropoff_stop: dropoffStop,
            fare: route?.base_fare || 3.5,
            status: 'pending',
            created_at: new Date().toISOString()
        })
    } else {
        await pool.query(
            `INSERT INTO bookings (id, booking_id, trotro_id, route_id, driver_id, passenger_id, passenger_name, pickup_stop, dropoff_stop, fare, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [
                id,
                bookingId,
                trotroId,
                trotro.route_id,
                trotro.driver_id,
                passengerId,
                passenger?.name || 'Passenger',
                pickupStop,
                dropoffStop,
                route?.base_fare || 3.5,
                'pending'
            ]
        )
    }

    const io = req.app.get('io')
    const roomName = `trotro-${trotroId}`
    console.log(`📡 Emitting new-booking to room: ${roomName}`)
    io.to(roomName).emit('new-booking', {
        id,
        passengerName: passenger?.name || 'Passenger',
        pickupStop,
        dropoffStop
    })

    res.status(201).json({
        bookingId,
        message: 'Seat booked successfully!',
        fare: Number(route?.base_fare || 3.5),
        seatNumber,
        booking: {
            _id: id,
            bookingId,
            trotroId,
            routeId: trotro.route_id,
            driverId: trotro.driver_id,
            passengerId,
            passengerName: passenger?.name || 'Passenger',
            pickupStop,
            dropoffStop,
            fare: Number(route?.base_fare || 3.5),
            status: 'pending'
        }
    })
})

router.get('/active-booking', authMiddleware, async (req, res) => {
    const passengerId = req.user?.id || req.query.passengerId
    if (!passengerId) return res.status(400).json({ message: 'passengerId required' })

    const pool = req.app.get('db')
    const useMock = req.app.get('mock')
    const mock = req.app.get('mockData')

    const activeStatuses = ['pending', 'accepted', 'in_progress', 'arrived']

    const booking = useMock && mock
        ? mock.bookings.find(b => b.passenger_id === passengerId && activeStatuses.includes(b.status))
        : (await pool.query(
            'SELECT * FROM bookings WHERE passenger_id = $1 AND status = ANY($2) ORDER BY created_at DESC LIMIT 1',
            [passengerId, activeStatuses]
        )).rows[0]

    if (!booking) return res.status(404).json({ message: 'No active booking' })

    // Fetch trotro and route details
    const trotro = useMock && mock
        ? mock.trotros.find(t => t.trotro_id === booking.trotro_id)
        : (await pool.query('SELECT * FROM trotros WHERE trotro_id = $1', [booking.trotro_id])).rows[0]

    const route = useMock && mock
        ? mock.routes.find(r => r.id === booking.route_id)
        : (await pool.query('SELECT * FROM routes WHERE id = $1', [booking.route_id])).rows[0]

    // Fetch driver details
    let driverName = 'Unknown Driver'
    let driverPhone = 'N/A'
    if (useMock && mock) {
        const driver = mock.users.find(u => u.id === booking.driver_id)
        driverName = driver?.name || 'Unknown Driver'
        driverPhone = driver?.phone || 'N/A'
    } else {
        const { rows } = await pool.query('SELECT name, phone FROM users WHERE id = $1', [booking.driver_id])
        if (rows.length > 0) {
            driverName = rows[0].name
            driverPhone = rows[0].phone
        }
    }

    // Find pickup and dropoff coordinates
    let pickupLocation = null
    let dropoffLocation = null

    if (route && route.coordinates) {
        pickupLocation = route.coordinates.find(c => c.stopName === booking.pickup_stop)
        dropoffLocation = route.coordinates.find(c => c.stopName === booking.dropoff_stop)

        // Fallback if strict match fails (try partial or just use first/last if simple)
        if (!pickupLocation && route.coordinates.length > 0) pickupLocation = route.coordinates[0]
        if (!dropoffLocation && route.coordinates.length > 0) dropoffLocation = route.coordinates[route.coordinates.length - 1]
    }

    res.json({
        booking: {
            id: booking.id,
            bookingId: booking.booking_id,
            status: booking.status,
            pickupStop: booking.pickup_stop,
            dropoffStop: booking.dropoff_stop,
            fare: Number(booking.fare),
            otp: booking.otp || '1234',
            pickupLocation,
            dropoffLocation
        },
        trotro: {
            trotroId: trotro?.trotro_id,
            licensePlate: trotro?.license_plate || `GT-${Math.floor(Math.random() * 9000) + 1000}-24`,
            location: trotro?.location || route?.coordinates?.[0]
        },
        driver: {
            name: driverName,
            phone: driverPhone
        },
        route: route ? mapRoute(route) : null
    })
})

export default router
