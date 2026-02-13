import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { pool, initDb } from './config/db.js'
import { mockData } from './mock/data.js'
import authRoutes from './routes/auth.js'
import passengerRoutes from './routes/passenger.js'
import driverRoutes from './routes/driver.js'
import adminRoutes from './routes/admin.js'

const app = express()
const httpServer = createServer(app)

const PORT = process.env.PORT || 5000
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'
const USE_MOCK = process.env.MOCK_DATA === 'true'

const io = new Server(httpServer, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ['GET', 'POST', 'PUT']
    }
})

app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json())

app.set('db', pool)
app.set('io', io)
app.set('mock', USE_MOCK)
app.set('mockData', USE_MOCK ? JSON.parse(JSON.stringify(mockData)) : null)

// Socket.io channels
io.on('connection', (socket) => {
    socket.on('subscribe-trotro', ({ trotroId }) => {
        if (trotroId) socket.join(`trotro-${trotroId}`)
    })

    socket.on('unsubscribe-trotro', ({ trotroId }) => {
        if (trotroId) socket.leave(`trotro-${trotroId}`)
    })
})

// Health
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api', passengerRoutes)
app.use('/api/driver', driverRoutes)
app.use('/api/admin', adminRoutes)

const start = async () => {
    if (!USE_MOCK) {
        await initDb()
    }

    httpServer.listen(PORT, () => {
        console.log(`RouteLogic backend running on port ${PORT}`)
        if (USE_MOCK) {
            console.log('Mock data mode enabled')
        }
    })
}

start().catch((err) => {
    console.error('Failed to initialize server', err)
    process.exit(1)
})
