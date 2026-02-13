import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

const generateToken = (user) => jwt.sign({ id: user._id || user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })

router.post('/register', async (req, res) => {
    const { name, email, phone, password, role } = req.body

    if (!name || !email || !phone || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' })
    }

    const pool = req.app.get('db')
    const useMock = req.app.get('mock')
    const mock = req.app.get('mockData')
    const normalizedEmail = email.toLowerCase()

    if (useMock && mock) {
        const existing = mock.users.find(u => u.email.toLowerCase() === normalizedEmail)
        if (existing) return res.status(409).json({ message: 'Email already registered' })

        const hashed = await bcrypt.hash(password, 10)
        const id = uuidv4()
        mock.users.push({ id, name, email: normalizedEmail, phone, role, password_hash: hashed })

        const token = generateToken({ _id: id, role })
        return res.status(201).json({
            token,
            user: { _id: id, id, name, email: normalizedEmail, phone, role }
        })
    }

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
    if (existing.length > 0) return res.status(409).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const id = uuidv4()

    await pool.query(
        `INSERT INTO users (id, name, email, phone, role, password_hash)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [id, name, normalizedEmail, phone, role, hashed]
    )

    const token = generateToken({ _id: id, role })

    res.status(201).json({
        token,
        user: { _id: id, id, name, email: normalizedEmail, phone, role }
    })
})

router.post('/login', async (req, res) => {
    const { email, password, role } = req.body

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' })
    }

    const pool = req.app.get('db')
    const useMock = req.app.get('mock')
    const mock = req.app.get('mockData')

    if (useMock && mock) {
        const user = mock.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role)
        if (!user) return res.status(401).json({ message: 'Invalid credentials' })

        const valid = user.password_hash
            ? await bcrypt.compare(password, user.password_hash)
            : password === 'password123'
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

        const token = generateToken({ _id: user.id, role: user.role })
        return res.json({
            token,
            user: {
                _id: user.id,
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        })
    }

    const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND role = $2',
        [email.toLowerCase(), role]
    )

    const user = rows[0]
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = generateToken({ _id: user.id, role: user.role })

    res.json({
        token,
        user: {
            _id: user.id,
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
    })
})

export default router
