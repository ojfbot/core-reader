import express from 'express'
import cors from 'cors'
import { commandsRouter } from './routes/commands'
import { adrsRouter } from './routes/adrs'
import { roadmapRouter } from './routes/roadmap'
import { toolsRouter } from './routes/tools'
import { beadsRouter } from './routes/beads'

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

  app.use('/api/commands', commandsRouter(coreRepoPath))
  app.use('/api/adrs', adrsRouter(coreRepoPath))
  app.use('/api/roadmap', roadmapRouter(coreRepoPath))
  app.use('/api/tools', toolsRouter())
  app.use('/api/beads', beadsRouter(coreRepoPath))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', coreRepoPath, port: process.env.PORT ?? 3016 })
  })

  return app
}
