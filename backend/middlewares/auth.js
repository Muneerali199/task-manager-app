const jwt = require('jsonwebtoken')
const prisma = require('../config/db')

module.exports = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ msg: 'no token' })

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true }
    })
    if (!user) return res.status(401).json({ msg: 'user not found' })

    req.user = user
    next()
  } catch (err) {
    console.log('auth error', err.message)
    res.status(401).json({ msg: 'invalid token' })
  }
}