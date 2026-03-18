import { Router, type Request, type Response } from 'express'
import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import os from 'os'

const DEFAULT_BEADS_ROOT = path.join(os.homedir(), '.beads')

export function eventsRouter(beadsRoot: string = DEFAULT_BEADS_ROOT): Router {
  const router = Router()
  const eventsDir = path.join(beadsRoot, 'events')

  // GET /api/events?date=YYYY-MM-DD&limit=100&type=bead:created&app=cv-builder
  // Returns events newest-first from today + yesterday by default
  router.get('/', async (req: Request, res: Response) => {
    const { date, limit = '200', type, app } = req.query
    const maxLimit = Math.min(parseInt(String(limit), 10) || 200, 500)

    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
    const dates = date ? [String(date)] : [today, yesterday]

    const events: unknown[] = []
    for (const d of dates) {
      const logFile = path.join(eventsDir, `${d}.jsonl`)
      if (!fsSync.existsSync(logFile)) continue
      try {
        const raw = await fs.readFile(logFile, 'utf-8')
        for (const line of raw.trim().split('\n').filter(Boolean)) {
          try {
            const event = JSON.parse(line) as Record<string, unknown>
            if (type && event['type'] !== type) continue
            if (app && event['app'] !== app) continue
            events.push(event)
          } catch { /* skip corrupt lines */ }
        }
      } catch { /* file vanished */ }
    }

    events.reverse() // newest first
    res.json(events.slice(0, maxLimit))
  })

  // GET /api/events/dates — list available log dates (newest first)
  router.get('/dates', async (_req: Request, res: Response) => {
    try {
      const files = await fs.readdir(eventsDir)
      const dates = files
        .filter(f => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(f))
        .map(f => f.replace('.jsonl', ''))
        .sort()
        .reverse()
      res.json(dates)
    } catch {
      res.json([])
    }
  })

  return router
}
