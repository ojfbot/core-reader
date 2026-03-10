import { Router, Request, Response } from 'express'
import { parseADRs, getADR } from '../parsers/parseADRs'
import { ADRManifest } from '../types'

export function adrsRouter(coreRepoPath: string): Router {
  const router = Router()
  let cache: ADRManifest[] | null = null

  router.get('/', (req: Request, res: Response) => {
    if (!cache) cache = parseADRs(coreRepoPath)
    const { status } = req.query
    const result = status
      ? cache.filter(a => a.status.toLowerCase() === String(status).toLowerCase())
      : cache
    res.json(result)
  })

  router.get('/:number', (req: Request, res: Response) => {
    const adr = getADR(coreRepoPath, String(req.params.number))
    if (!adr) return res.status(404).json({ error: 'ADR not found' })
    res.json(adr)
  })

  return router
}
