import { Router, Request, Response } from 'express'
import { parseRoadmap, parseRoadmapFromGitHub } from '../parsers/parseRoadmap'
import { RoadmapPhase } from '../types'

export function roadmapRouter(coreRepoPath: string): Router {
  const router = Router()
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  const GITHUB_REPO = process.env.GITHUB_CORE_REPO ?? 'ojfbot/core'

  let cache: RoadmapPhase[] | null = null
  let cachePromise: Promise<RoadmapPhase[]> | null = null

  function getAll(): Promise<RoadmapPhase[]> {
    if (cache) return Promise.resolve(cache)
    if (cachePromise) return cachePromise
    cachePromise = (GITHUB_TOKEN
      ? parseRoadmapFromGitHub(GITHUB_REPO, GITHUB_TOKEN)
      : Promise.resolve(parseRoadmap(coreRepoPath))
    ).then(result => {
      cache = result
      cachePromise = null
      return result
    }).catch(err => {
      cachePromise = null
      throw err
    })
    return cachePromise
  }

  router.get('/', async (_req: Request, res: Response) => {
    try {
      res.json(await getAll())
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  return router
}
