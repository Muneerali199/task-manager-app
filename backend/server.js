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

app.get('/api/setup', async (req, res) => {
  try {
    const prisma = require('./config/db')
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Task" CASCADE`
    await prisma.$executeRaw`DROP TABLE IF EXISTS "ProjectMember" CASCADE`
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Project" CASCADE`
    await prisma.$executeRaw`DROP TABLE IF EXISTS "User" CASCADE`
    await prisma.$executeRaw`
      CREATE TABLE "User" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`
    await prisma.$executeRaw`
      CREATE TABLE "Project" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        "createdBy" INTEGER NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`
    await prisma.$executeRaw`
      CREATE TABLE "ProjectMember" (
        id SERIAL PRIMARY KEY,
        "projectId" INTEGER NOT NULL,
        "userId" INTEGER NOT NULL,
        role TEXT NOT NULL,
        UNIQUE("projectId", "userId")
      )`
    await prisma.$executeRaw`
      CREATE TABLE "Task" (
        id SERIAL PRIMARY KEY,
        "projectId" INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        "assignedTo" INTEGER,
        status TEXT DEFAULT 'todo',
        "dueDate" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`
    res.json({ msg: 'Tables recreated!' })
  } catch (e) {
    res.status(500).json({ error: e.message })
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