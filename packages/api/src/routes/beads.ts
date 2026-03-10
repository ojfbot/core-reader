import { Router, Request, Response } from 'express'
import { parseADRsAsBeads, FrameBeadLike } from '../parsers/parseADRs'

export function beadsRouter(coreRepoPath: string): Router {
  const router = Router()
  let cache: FrameBeadLike[] | null = null

  router.get('/', (req: Request, res: Response) => {
    if (!cache) cache = parseADRsAsBeads(coreRepoPath)

    const { type, status, prefix } = req.query
    let result = cache

    if (type) result = result.filter(b => b.type === String(type))
    if (status) result = result.filter(b => b.status === String(status))
    if (prefix) result = result.filter(b => b.id.startsWith(String(prefix) + '-'))

    res.json(result)
  })

  return router
}
