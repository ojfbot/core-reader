import express from 'express'
import cors from 'cors'
import os from 'os'
import path from 'path'
import { skillsRouter } from './routes/skills'
import { adrsRouter } from './routes/adrs'
import { roadmapRouter } from './routes/roadmap'
import { toolsRouter } from './routes/tools'
import { beadsRouter } from './routes/beads'
import { okrsRouter } from './routes/okrs'
import { docsRouter } from './routes/docs'
import { gitRouter } from './routes/git'
import { eventsRouter } from './routes/events'

export function createApp(coreRepoPath: string) {
  const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:4000'
  const app = express()

  app.use(cors({
    origin: [
      CORS_ORIGIN,
      'http://localhost:3015',
      'http://localhost:4000',
      'https://reader.jim.software',
      'https://frame.jim.software',
    ],
  }))
  app.use(express.json())

  app.use('/api/skills', skillsRouter(coreRepoPath))
  app.use('/api/adrs', adrsRouter(coreRepoPath))
  app.use('/api/roadmap', roadmapRouter(coreRepoPath))
  app.use('/api/tools', toolsRouter())
  app.use('/api/beads', beadsRouter(coreRepoPath))
  app.use('/api/okrs', okrsRouter(coreRepoPath))
  app.use('/api/docs', docsRouter(coreRepoPath))
  app.use('/api/git', gitRouter(coreRepoPath))

  const beadsRoot = process.env.BEADS_ROOT ?? path.join(os.homedir(), '.beads')
  app.use('/api/events', eventsRouter(beadsRoot))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', coreRepoPath, port: process.env.PORT ?? 3016 })
  })

  return app
}
