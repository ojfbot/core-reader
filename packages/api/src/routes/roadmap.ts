import { Router, Request, Response } from 'express'
import { parseRoadmap } from '../parsers/parseRoadmap'
import { RoadmapPhase } from '../types'

export function roadmapRouter(coreRepoPath: string): Router {
  const router = Router()
  let cache: RoadmapPhase[] | null = null

  router.get('/', (_req: Request, res: Response) => {
    if (!cache) cache = parseRoadmap(coreRepoPath)
    res.json(cache)
  })

  return router
}
