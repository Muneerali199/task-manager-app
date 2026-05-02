const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const projectRoutes = require('./routes/projects')
const taskRoutes = require('./routes/tasks')
const projectController = require('./controllers/projectController')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.get('/api/dashboard', require('./middlewares/auth'), projectController.dashboard)

app.get('/api/health', async (req, res) => {
  try {
    const prisma = require('./config/db')
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'connected' })
  } catch (e) {
    res.json({ status: 'ok', db: 'error', msg: e.message })
  }
})

const frontendPath = process.env.VERCEL 
  ? path.join(__dirname, '../frontend/dist') 
  : path.join(__dirname, 'dist')

app.use(express.static(frontendPath))
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app