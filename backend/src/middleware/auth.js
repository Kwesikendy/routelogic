import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) return res.status(401).json({ message: 'Access token required' })

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' })
    }
}

export default authMiddleware
