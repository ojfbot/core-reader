import { Router, Request, Response } from 'express'
import {
  parseSkills,
  parseSkillsFromGitHub,
  getSkillContent,
  getSkillFromGitHub,
} from '../parsers/parseSkills'
import { SkillManifest } from '../types'

export function skillsRouter(coreRepoPath: string): Router {
  const router = Router()
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  const GITHUB_REPO = process.env.GITHUB_CORE_REPO ?? 'ojfbot/core'

  // In-memory cache — persists for the lifetime of the serverless function instance.
  // Deduplicates concurrent requests during the initial cold-start fetch.
  let cache: SkillManifest[] | null = null
  let cachePromise: Promise<SkillManifest[]> | null = null

  function getAll(): Promise<SkillManifest[]> {
    if (cache) return Promise.resolve(cache)
    if (cachePromise) return cachePromise
    cachePromise = (GITHUB_TOKEN
      ? parseSkillsFromGitHub(GITHUB_REPO, GITHUB_TOKEN)
      : Promise.resolve(parseSkills(coreRepoPath))
    ).then(result => {
      cache = result
      cachePromise = null
      return result
    }).catch(err => {
      cachePromise = null // allow retry on next request
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

  router.get('/:name', async (req: Request, res: Response) => {
    try {
      const name = String(req.params.name)
      const skill = GITHUB_TOKEN
        ? await getSkillFromGitHub(GITHUB_REPO, GITHUB_TOKEN, name)
        : getSkillContent(coreRepoPath, name)
      if (!skill) {
        res.status(404).json({ error: 'Skill not found' })
        return
      }
      res.json(skill)
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  return router
}
