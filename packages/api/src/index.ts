import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { commandsRouter } from './routes/commands'
import { adrsRouter } from './routes/adrs'
import { roadmapRouter } from './routes/roadmap'
import { toolsRouter } from './routes/tools'

const PORT = process.env.PORT ?? 3016
const CORE_REPO_PATH = process.env.CORE_REPO_PATH ?? ''
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:4000'

if (!CORE_REPO_PATH) {
  console.error('Error: CORE_REPO_PATH environment variable is required')
  console.error('Set it to the absolute path of the ojfbot/core repo')
  process.exit(1)
}

const resolvedPath = path.resolve(CORE_REPO_PATH)
if (!fs.existsSync(resolvedPath)) {
  console.error(`Error: CORE_REPO_PATH does not exist: ${resolvedPath}`)
  process.exit(1)
}

const app = express()

app.use(cors({
  origin: [CORS_ORIGIN, 'http://localhost:3015', 'http://localhost:4000'],
}))
app.use(express.json())

app.use('/api/commands', commandsRouter(resolvedPath))
app.use('/api/adrs', adrsRouter(resolvedPath))
app.use('/api/roadmap', roadmapRouter(resolvedPath))
app.use('/api/tools', toolsRouter())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', coreRepoPath: resolvedPath, port: PORT })
})

app.listen(Number(PORT), () => {
  console.log(`CoreReader API listening on :${PORT}`)
  console.log(`Reading core repo: ${resolvedPath}`)
})
